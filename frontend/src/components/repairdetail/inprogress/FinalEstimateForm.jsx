import { useEffect, useState } from "react";
import ImageUploadGrid from "./ImageUploadGrid";

/** UI 전용: 백엔드 연동/실제 제출 없음
 * props:
 *  - initialEstimate: 1차 견적서에서 넘어온 프리필 { presets:[], extraNote:"" }
 *  - presetList: 추가 선택 가능한 프리셋 목록 []
 */
function FinalEstimateForm({
  initialEstimate = { presets: [], extraNote: "" },
  presetList = [],
}) {
  // === 1차 견적서 프리필 + 수정 가능 ===
  const [selectedPresets, setSelectedPresets] = useState(
    initialEstimate.presets || []
  );
  const [note, setNote] = useState(initialEstimate.extraNote || "");

  // === 금액 ===
  const presetTotal = selectedPresets.reduce((s, p) => s + (p.price || 0), 0);
  const [extraCost, setExtraCost] = useState(""); // ± 추가금/할인 입력 (원하면 제거 가능)
  const extra = parseInt((extraCost || "0").replace(/,/g, ""), 10) || 0;
  const total = presetTotal + extra;

  // === 프리셋 추가/제거 ===
  const togglePreset = (item) =>
    setSelectedPresets((prev) =>
      prev.some((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item]
    );
  const removePreset = (id) =>
    setSelectedPresets((prev) => prev.filter((p) => p.id !== id));

  // === 이미지 (수리 전/후) ===
  const [beforeImgs, setBeforeImgs] = useState([]); // [{id,url,file}]
  const [afterImgs, setAfterImgs] = useState([]);

  // 프리필 갱신(옵션)
  useEffect(() => {
    setSelectedPresets(initialEstimate.presets || []);
    setNote(initialEstimate.extraNote || "");
  }, [initialEstimate]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">최종 견적서</h2>
        <span className="text-xs text-gray-500">
          1차 견적서 내용을 자동으로 불러왔습니다. 필요한 항목은 수정하세요.
        </span>
      </div>

      {/* 선택된 프리셋 칩 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">적용 프리셋</label>
        <div className="min-h-[44px] border border-gray-200 rounded-md px-2 py-2 flex flex-wrap gap-2">
          {selectedPresets.length === 0 ? (
            <span className="text-sm text-gray-400">
              선택된 프리셋이 없습니다.
            </span>
          ) : (
            selectedPresets.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 text-sm bg-gray-100 rounded-full px-3 py-1"
              >
                {p.name}
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removePreset(p.id)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 프리셋 추가 리스트 (고정 높이 + 내부 스크롤) */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium">프리셋 추가</label>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {presetList.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              추가할 수 있는 프리셋이 없습니다.
            </div>
          ) : (
            <div className="h-[240px] overflow-y-auto">
              {presetList.map((p, i) => {
                const isSel = selectedPresets.some((s) => s.id === p.id);
                return (
                  <div key={p.id}>
                    <div
                      className={`flex items-center justify-between px-4 py-3 ${
                        isSel ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(p.price ?? 0).toLocaleString()}원
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`ml-2 px-4 py-1 text-sm rounded font-medium border transition
                          ${
                            isSel
                              ? "bg-red-400 text-white border-red-400 hover:bg-red-500"
                              : "bg-[#A5CD82] text-white border-[#A5CD82] hover:bg-[#94bb71] hover:border-[#94bb71]"
                          }`}
                        onClick={() => togglePreset(p)}
                      >
                        {isSel ? "제거" : "추가"}
                      </button>
                    </div>
                    {i < presetList.length - 1 && (
                      <div className="h-px bg-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 추가 수리 내용 + 금액 요약 (동일 크기 카드 2열) */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 추가 수리 내용 카드 (리사이즈 불가, 크기 고정 감) */}
        <div className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              추가 수리 내용
            </h3>
            <textarea
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none min-h-[180px]"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="1차 견적 이후 추가된 작업/특이사항 기록"
            />
          </div>
        </div>

        {/* 금액 요약 카드 */}
        <aside className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              금액 요약
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">프리셋 합계</span>
                <span className="font-medium">
                  {presetTotal.toLocaleString()}원
                </span>
              </div>

              <div>
                <label className="block mb-1 text-gray-600">
                  추가 금액(±)
                </label>
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
                <span>총 금액</span>
                <span className="text-green-600">
                  {total.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 이미지 업로드 (분리된 컴포넌트 재사용) */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploadGrid
          label="수리 전 사진"
          value={beforeImgs}
          onChange={setBeforeImgs}
          max={9}
        />
        <ImageUploadGrid
          label="수리 후 사진"
          value={afterImgs}
          onChange={setAfterImgs}
          max={9}
        />
      </div>

      {/* 제출(hover만) */}
      <button
        type="button"
        className="w-full py-2 rounded-md bg-[#A5CD82] text-white font-medium hover:bg-[#94bb71] transition"
      >
        제출
      </button>
    </div>
  );
}

export default FinalEstimateForm;