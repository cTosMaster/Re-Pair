import { useEffect, useMemo, useState } from "react";
import ImageUploadGrid from "../common/ImageUploadGrid";
import { createFinalEstimate } from "../../../services/customerAPI";

/**
 * props:
 *  - requestId: string|number   // ✅ 필수
 *  - initialEstimate: { presets:[{id,name,price}], extraNote:string }
 *  - presetList: [{id,name,price}]
 *  - onSubmitted?: () => void
 *
 * 백엔드 스키마:
 * {
 *   description: string,
 *   finalPrice: number,
 *   presetIds: number[],
 *   images: [{ url: string, imageType: "BEFORE"|"AFTER" }]
 * }
 */
function FinalEstimateForm({
  requestId,
  initialEstimate = { presets: [], extraNote: "" },
  presetList = [],
  onSubmitted,
}) {
  // --- 프리셋(프리필 + 중복 방지) ---
  const withKey = (arr = []) =>
    (arr || []).map((p) => ({
      key: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
      id: p.id,
      name: p.name,
      price: p.price ?? 0,
    }));

  const [selectedPresets, setSelectedPresets] = useState(withKey(initialEstimate.presets));
  const [note, setNote] = useState(initialEstimate.extraNote || "");

  const selectedIdsSet = useMemo(
    () => new Set(selectedPresets.map((p) => String(p.id))),
    [selectedPresets]
  );

  // 금액(합계 + 추가금만 사용 → finalPrice)
  const presetTotal = selectedPresets.reduce((s, p) => s + (p.price || 0), 0);
  const [extraCost, setExtraCost] = useState("");
  const extra = parseInt((extraCost || "0").replace(/,/g, ""), 10) || 0;
  const finalPrice = presetTotal + extra;

  // 이미지(업로드만 하고, 영구 URL(remoteUrl)만 사용)
  const [beforeImgs, setBeforeImgs] = useState([]); // [{ id, url(dataURL), remoteUrl(http...), uploading? }]
  const [afterImgs, setAfterImgs] = useState([]);
  const isUploading = [...beforeImgs, ...afterImgs].some((i) => i.uploading);

  // 드롭다운
  const [selectValue, setSelectValue] = useState("");
  const addPresetById = (presetId) => {
    const src = (presetList || []).find((p) => String(p.id) === String(presetId));
    if (!src) return;
    setSelectedPresets((prev) =>
      prev.some((p) => String(p.id) === String(src.id))
        ? prev
        : [
            ...prev,
            {
              key: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
              id: src.id,
              name: src.name,
              price: src.price ?? 0,
            },
          ]
    );
  };
  const removePresetByKey = (key) =>
    setSelectedPresets((prev) => prev.filter((p) => p.key !== key));

  // 프리필 갱신
  useEffect(() => {
    setSelectedPresets(withKey(initialEstimate.presets) || []);
    setNote(initialEstimate.extraNote || "");
  }, [initialEstimate]);

  // ---------- 제출 ----------
  const [submitting, setSubmitting] = useState(false);

  const toHttpUrls = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => x?.remoteUrl || x?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));

  const handleSubmit = async () => {
    if (!requestId) return alert("요청 ID가 없습니다.");
    if (isUploading) return alert("이미지 업로드가 끝날 때까지 기다려주세요.");

    // 영구 URL 확인(업로드 끝났는데도 http URL이 없으면 잠시 대기 요청)
    const hasPending =
      [...beforeImgs, ...afterImgs].some(
        (x) => !x.uploading && !(x.remoteUrl || "").startsWith("http")
      );
    if (hasPending) {
      return alert("일부 이미지가 아직 저장되지 않았습니다. 잠시 후 다시 시도해주세요.");
    }

    // ✅ 백엔드 스키마에 맞게 payload 구성
    const presetIds = Array.from(new Set(selectedPresets.map((p) => {
      const n = Number(p.id);
      return Number.isFinite(n) ? n : p.id;
    })));

    const payload = {
      description: note,
      finalPrice,        // 합계 + 추가금
      presetIds,         // 중복 제거된 프리셋 ID
      images: [
        ...toHttpUrls(beforeImgs).map((url) => ({ url, imageType: "BEFORE" })),
        ...toHttpUrls(afterImgs).map((url) => ({ url, imageType: "AFTER" })),
      ],
    };

    try {
      setSubmitting(true);
      await createFinalEstimate(Number(requestId) || requestId, payload);
      onSubmitted?.();
      alert("최종 견적서가 제출되었습니다.");
    } catch (e) {
      console.error("final-estimate submit error:", e);
      alert("제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const emptyPresetGuide = !presetList || presetList.length === 0;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">최종 견적서</h2>
        <span className="text-xs text-gray-500">
          1차 견적서 내용을 자동으로 불러왔습니다. 필요한 항목은 수정하세요.
        </span>
      </div>

      {/* 프리셋 드롭다운 + 선택된 프리셋 칩 */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium">프리셋 선택</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
            value={selectValue}
            onChange={(e) => {
              const v = e.target.value;
              setSelectValue(v);
              if (v) {
                addPresetById(v);
                setSelectValue("");
              }
            }}
            disabled={emptyPresetGuide}
          >
            <option value="">
              {emptyPresetGuide ? "해당 수리물품에 등록된 프리셋이 없습니다" : "프리셋을 선택하세요"}
            </option>
            {(presetList || []).map((p) => {
              const already = selectedIdsSet.has(String(p.id));
              return (
                <option key={p.id} value={p.id} disabled={already}>
                  {p.name} — {(p.price ?? 0).toLocaleString()}원
                  {already ? " (선택됨)" : ""}
                </option>
              );
            })}
          </select>
        </div>

        <label className="block mb-1 text-sm font-medium">적용 프리셋</label>
        <div className="min-h-[44px] border border-gray-200 rounded-md px-2 py-2 flex flex-wrap gap-2">
          {selectedPresets.length === 0 ? (
            <span className="text-sm text-gray-400">선택된 프리셋이 없습니다.</span>
          ) : (
            selectedPresets.map((p) => (
              <span
                key={p.key}
                className="inline-flex items-center gap-2 text-sm bg-gray-100 rounded-full px-3 py-1"
              >
                {p.name} ({(p.price ?? 0).toLocaleString()}원)
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removePresetByKey(p.key)}
                  title="프리셋 제거"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 추가 수리 내용 + 금액 요약 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">추가 수리 내용</h3>
            <textarea
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none min-h-[180px]"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="1차 견적 이후 추가된 작업/특이사항 기록"
            />
          </div>
        </div>

        <aside className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">금액 요약</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">프리셋 합계</span>
                <span className="font-medium">{presetTotal.toLocaleString()}원</span>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">추가 금액(±)</label>
                <input
                  type="text"
                  value={extraCost}
                  onChange={(e) => setExtraCost(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                  placeholder="0"
                />
              </div>
              <div className="h-px bg-gray-300 my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>최종 금액</span>
                <span className="text-green-600">{finalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 이미지 업로드(업로드만, 미리보기는 로컬 dataURL) */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploadGrid label="수리 전 사진" value={beforeImgs} onChange={setBeforeImgs} max={9} />
        <ImageUploadGrid label="수리 후 사진" value={afterImgs} onChange={setAfterImgs} max={9} />
      </div>

      {/* 제출 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || isUploading}
        className={`w-full py-2 rounded-md font-medium transition ${
          submitting || isUploading
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#A5CD82] text-white hover:bg-[#94bb71]"
        }`}
      >
        {isUploading ? "이미지 업로드 중..." : submitting ? "제출 중..." : "제출"}
      </button>
    </div>
  );
}

export default FinalEstimateForm;