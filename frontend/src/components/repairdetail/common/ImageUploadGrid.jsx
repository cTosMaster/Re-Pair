import { useRef } from "react";
import { uploadFile } from "../../../services/fileAPI";

/**
 * 업로드만 수행 + 화면엔 로컬 미리보기 유지
 * props:
 *  - label: 섹션 제목
 *  - value: [{ id, url, file?, uploading?, progress?, error?, remoteUrl? }]
 *  - onChange: (next) => void
 *  - max: 최대 이미지 개수 (기본 9)
 */
function ImageUploadGrid({ label, value = [], onChange = () => {}, max = 9 }) {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 1) 먼저 로컬 미리보기(데이터URL)로 화면에 반영
    const readers = files.map(
      (f) =>
        new Promise((resolve) => {
          if (!f.type?.startsWith?.("image/")) return resolve(null);
          const fr = new FileReader();
          fr.onloadend = () =>
            resolve({
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : Math.random().toString(36).slice(2),
              url: fr.result, // ❗ 미리보기용 데이터URL (끝까지 유지)
              file: f,
              uploading: true,
              progress: 0,
              error: undefined,
              remoteUrl: undefined, // 업로드 후 서버 URL은 따로 보관(미리보기엔 사용 안 함)
            });
          fr.readAsDataURL(f);
        })
    );

    let picked = (await Promise.all(readers)).filter(Boolean);
    let next = [...value, ...picked].slice(0, max);
    onChange(next);
    e.target.value = ""; // 같은 파일 다시 선택 가능

    // 2) 업로드(서버 id만 교체, url은 교체하지 않음!)
    for (const item of picked) {
      const idx = next.findIndex((x) => x.id === item.id);
      if (idx === -1) continue;

      try {
        const res = await uploadFile(item.file, {
          onProgress: (p) => {
            next = [...next];
            next[idx] = { ...next[idx], progress: p, uploading: p < 100 };
            onChange(next);
          },
        });

        next = [...next];
        next[idx] = {
          ...next[idx],
          id: res.id,                 // ✅ 서버 파일 id로 교체 (제출 시 사용)
          // url: 그대로 유지 (로컬 미리보기 유지, S3 비공개라도 끊기지 않음)
          remoteUrl: res.url || res.publicUrl || undefined, // 필요하면 나중에 사용
          file: undefined,            // 본문 정리
          uploading: false,
          progress: 100,
          error: undefined,
        };
        onChange(next);
      } catch {
        next = [...next];
        next[idx] = { ...next[idx], uploading: false, error: "업로드 실패" };
        onChange(next);
        // console.error("[upload error]", err);
      }
    }
  };

  const removeOne = (id) => onChange(value.filter((v) => v.id !== id));

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{label}</h3>

      <div
        className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition rounded-lg p-4 text-center cursor-pointer bg-white"
        onClick={openPicker}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleAdd}
        />
        <span className="text-sm text-gray-600">이미지 선택 또는 클릭</span>
        <p className="text-xs text-gray-400 mt-1">
          {value.length}/{max} (여러 장 가능)
        </p>
      </div>

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {value.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt="preview"
                className="w-full h-24 object-cover rounded-md border border-gray-200"
              />

              {/* 업로드 중 오버레이 */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-md">
                  <div className="w-10 h-10 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <div className="mt-2 text-xs text-white">
                    {img.progress ?? 0}%
                  </div>
                </div>
              )}

              {/* 에러 배지 */}
              {img.error && (
                <div className="absolute left-1 bottom-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                  업로드 실패
                </div>
              )}

              <button
                type="button"
                className="absolute top-1 right-1 hidden group-hover:block bg-black/60 text-white text-xs rounded px-1"
                onClick={() => removeOne(img.id)}
              >
                제거
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ImageUploadGrid;