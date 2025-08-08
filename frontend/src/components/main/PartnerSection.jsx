import { useMemo, useState } from "react";
import centerImg from "../../assets/center_img.png";
import FilterModal from "../modal/FilterModal";

const partnerData = [
  { name: "신속전자 A/S", desc: "믿을 수 있는 빠른 수리 서비스", location: "서울 강남구", categories: ["휴대폰", "소형가전"] },
  { name: "한빛전자 서비스센터", desc: "합리적인 가격의 수리 전문", location: "부산 해운대구", categories: ["TV", "가전"] },
  { name: "드림전자 A/S", desc: "전국망을 통한 편리한 A/S", location: "대구 중구", categories: ["컴퓨터", "프린터"] },
  { name: "에이스리페어", desc: "친절한 상담과 확실한 수리", location: "인천 남동구", categories: ["시계", "소형가전"] },
  { name: "수리왕전자", desc: "전문 엔지니어 상주 수리센터", location: "대전 서구", categories: ["에어컨", "가전"] },
];

export default function PartnerSection() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const gapSize = 1.5;

  const [openFilter, setOpenFilter] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filtered = useMemo(() => {
    return partnerData.filter((p) => {
      const regionOk = selectedRegions.length === 0 || selectedRegions.some(r => p.location.includes(r));
      const catOk = selectedCategories.length === 0 || selectedCategories.some(c => p.categories.includes(c));
      return regionOk && catOk;
    });
  }, [selectedRegions, selectedCategories]);

  const list = filtered.length ? filtered : partnerData;

  return (
    <section className="py-16 px-6 bg-green-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">제휴 A/S 센터</h2>

      {/* 필터 바 */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {selectedRegions.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-full text-sm bg-green-50 border border-green-200">{r}</span>
          ))}
          {selectedCategories.map((c) => (
            <span key={c} className="px-2.5 py-1 rounded-full text-sm bg-emerald-50 border border-emerald-200">{c}</span>
          ))}
          {(selectedRegions.length + selectedCategories.length === 0) && (
            <span className="text-sm text-gray-400">필터가 없습니다</span>
          )}
        </div>

        <div className="flex gap-2">
          {(selectedRegions.length + selectedCategories.length > 0) && (
            <button
              className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              onClick={() => { setSelectedRegions([]); setSelectedCategories([]); }}
            >초기화</button>
          )}
          <button
            className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setOpenFilter(true)}
          >필터</button>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
        <button
          onClick={() => setStartIndex((p) => (p - 1 + list.length) % list.length)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
        >◀</button>

        <div className="overflow-hidden w-full">
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${startIndex * (100 / visibleCount)}%)` }}
          >
            {list.map((partner, idx) => (
              <div key={`${partner.name}-${idx}`} className="flex-shrink-0"
                   style={{ width: `calc((100% - ${gapSize * (visibleCount - 1)}rem) / ${visibleCount})` }}>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <img src={centerImg} alt={partner.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
                    <p className="text-sm text-gray-700 mb-1">{partner.desc}</p>
                    <p className="text-xs text-gray-500">{partner.location}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {partner.categories.map((c) => (
                        <span key={c} className="px-2 py-0.5 text-[11px] rounded-full bg-gray-50 border">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStartIndex((p) => (p + 1) % list.length)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
        >▶</button>
      </div>

      {/* 모달 사용 */}
      <FilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={({ regions, categories }) => {
          setSelectedRegions(regions);
          setSelectedCategories(categories);
          setOpenFilter(false);
          setStartIndex(0);
        }}
        currentRegions={selectedRegions}
        currentCategories={selectedCategories}
        regionCandidates={[
          { si: "서울", gu: ["강남구", "서초구", "마포구", "송파구"] },
          { si: "부산", gu: ["해운대구", "수영구"] },
          { si: "인천", gu: ["남동구", "미추홀구"] },
          { si: "대구", gu: ["중구"] },
          { si: "대전", gu: ["서구"] },
        ]}
        categoryCandidates={["휴대폰", "소형가전", "시계", "컴퓨터", "프린터", "TV", "가전", "에어컨"]}
      />
    </section>
  );
}