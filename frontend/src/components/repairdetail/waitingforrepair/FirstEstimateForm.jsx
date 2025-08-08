import { useState } from "react";

// presetList는 '이미 카테고리로 필터된' 배열이 들어온다고 가정
function FirstEstimateForm({ presetList = [] }) {
  const [selected, setSelected] = useState([]); // 선택된 프리셋 목록
  const [extraCost, setExtraCost] = useState(""); // 추가 금액

  // 프리셋 선택/제거 토글
  const toggle = (item) =>
    setSelected((prev) =>
      prev.find((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item]
    );

  // 선택된 프리셋 목록에서 제거
  const removeSel = (id) =>
    setSelected((prev) => prev.filter((p) => p.id !== id));

  // 금액 계산
  const presetTotal = selected.reduce((sum, p) => sum + (p.price || 0), 0);
  const extra = parseInt((extraCost || "0").replace(/,/g, ""), 10) || 0;
  const total = presetTotal + extra;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {/* 제목 */}
      <h2 className="text-xl font-semibold mb-6 text-center">1차 견적서</h2>

      {/* 선택된 프리셋 표시 영역 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">선택한 프리셋</label>
        <div className="min-h-[40px] border border-gray-200 rounded-md px-2 py-2 flex flex-wrap gap-2">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-400">
              아직 선택된 프리셋이 없습니다.
            </span>
          ) : (
            selected.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 text-sm bg-gray-100 rounded-full px-3 py-1"
              >
                {p.name}
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removeSel(p.id)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 프리셋 리스트 (고정 높이 + 내부 스크롤) */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">프리셋</label>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {presetList.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              표시할 프리셋이 없습니다.
            </div>
          ) : (
            <div className="h-[240px] overflow-y-auto">
              {presetList.map((p, i) => {
                const isSelected = selected.some((s) => s.id === p.id);

                return (
                  <div key={p.id}>
                    {/* 프리셋 아이템 */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 ${
                        isSelected ? "bg-gray-100" : ""
                      }`}
                    >
                      {/* 프리셋 정보 */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(p.price ?? 0).toLocaleString()}원
                        </p>
                      </div>

                      {/* 추가/제거 버튼 */}
                      <button
                        type="button"
                        className={`ml-2 px-4 py-1 text-sm rounded font-medium border transition
                          ${
                            isSelected
                              ? "bg-red-400 text-white border-red-400 hover:bg-red-500"
                              : "bg-[#A5CD82] text-white border-[#A5CD82] hover:bg-[#94bb71] hover:border-[#94bb71]"
                          }`}
                        onClick={() => toggle(p)}
                      >
                        {isSelected ? "제거" : "추가"}
                      </button>
                    </div>

                    {/* 구분선 (마지막 항목 제외) */}
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

      {/* 추가 수리 내용 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          수리 내용 (추가된 부분만)
        </label>
        <textarea
          placeholder="자세한 내용을 입력해주세요."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
          rows="4"
        />
      </div>

      {/* 추가 금액 입력 */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium">추가 금액</label>
        <input
          type="text"
          value={extraCost}
          onChange={(e) => setExtraCost(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
          placeholder="0"
        />
      </div>

      {/* 합계 표시 */}
      <div className="mb-6 text-right text-lg font-semibold">
        총 금액:{" "}
        <span className="text-green-600">
          {total.toLocaleString()}원
        </span>
      </div>

      {/* 제출 버튼 (hover만) */}
      <button
        type="button"
        className="w-full py-2 rounded-md bg-[#A5CD82] text-white font-medium hover:bg-[#94bb71] transition"
      >
        제출
      </button>
    </div>
  );
}

export default FirstEstimateForm;