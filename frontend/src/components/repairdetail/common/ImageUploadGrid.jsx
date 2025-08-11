import { useRef } from "react";

/** UI 전용 · 백엔드 없음
 *  props:
 *   - label: 섹션 제목
 *   - value: [{ id, url, file }] 형태 배열 (부모 상태)
 *   - onChange: (next) => void
 *   - max: 최대 이미지 개수 (기본 9)
 */
function ImageUploadGrid({ label, value = [], onChange = () => {}, max = 9 }) {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readers = files.map(
      (f) =>
        new Promise((resolve) => {
          if (!f.type.startsWith("image/")) return resolve(null);
          const fr = new FileReader();
          fr.onloadend = () => resolve({ id: crypto.randomUUID(), url: fr.result, file: f });
          fr.readAsDataURL(f);
        })
    );

    Promise.all(readers).then((items) => {
      const merged = [...value, ...items.filter(Boolean)].slice(0, max);
      onChange(merged);
      e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
    });
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