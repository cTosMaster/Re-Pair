import { useState } from "react";
import Modal from "./common/Modal";

export default function FilterModal({
  open,
  onClose,
  onApply,
  currentRegions = [],
  currentCategories = [],
  regionCandidates = [],      // [{ si: '서울', gu: ['강남구', ...] }, ...]
  categoryCandidates = [],    // ['휴대폰','시계',...]
}) {
  const [tab, setTab] = useState("region");
  const [regions, setRegions] = useState(currentRegions);
  const [cats, setCats] = useState(currentCategories);

  const toggleRegion = (si, gu) => {
    const key = `${si} ${gu}`;
    setRegions((prev) => (prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]));
  };
  const toggleCat = (c) => {
    setCats((prev) => (prev.includes(c) ? prev.filter(v => v !== c) : [...prev, c]));
  };
  const clearAll = () => { setRegions([]); setCats([]); };

  return (
    <Modal open={open} onClose={onClose}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">필터</h3>
        <div className="flex gap-2">
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={clearAll}>전체 해제</button>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* 선택 미리보기 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {regions.map((r) => (
          <span key={r} className="px-2.5 py-1 text-sm rounded-full bg-green-50 border border-green-200">{r}</span>
        ))}
        {cats.map((c) => (
          <span key={c} className="px-2.5 py-1 text-sm rounded-full bg-emerald-50 border border-emerald-200">{c}</span>
        ))}
        {regions.length === 0 && cats.length === 0 && (
          <span className="text-sm text-gray-400">선택된 필터가 없습니다</span>
        )}
      </div>

      {/* 탭 */}
      <div className="mt-5 border-b flex gap-6">
        <button
          className={`pb-2 -mb-px ${tab === "region" ? "border-b-2 border-emerald-500 font-semibold" : "text-gray-500"}`}
          onClick={() => setTab("region")}
        >지역 선택</button>
        <button
          className={`pb-2 -mb-px ${tab === "category" ? "border-b-2 border-emerald-500 font-semibold" : "text-gray-500"}`}
          onClick={() => setTab("category")}
        >카테고리</button>
      </div>

      {/* 내용 */}
      <div className="mt-4 max-h-[50vh] overflow-auto pr-1">
        {tab === "region" && (
          <div className="grid grid-cols-2 gap-4">
            {regionCandidates.map(({ si, gu }) => (
              <div key={si} className="border rounded-xl p-3">
                <div className="text-sm font-semibold mb-2">{si}</div>
                <ul className="space-y-1">
                  {gu.map((g) => {
                    const key = `${si} ${g}`;
                    const checked = regions.includes(key);
                    return (
                      <li key={g}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-emerald-600"
                            checked={checked}
                            onChange={() => toggleRegion(si, g)}
                          />
                          <span className="text-sm">{g}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "category" && (
          <div className="grid grid-cols-3 gap-2">
            {categoryCandidates.map((c) => {
              const selected = cats.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    selected ? "bg-emerald-50 border-emerald-300" : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg border" onClick={onClose}>취소</button>
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => onApply?.({ regions, categories: cats })}
        >
          적용
        </button>
      </div>
    </Modal>
  );
}