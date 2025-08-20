import { useState } from "react";
import CompanyCard from "./CompanyCard";
import { companyDummy } from "./dummy/companyDummy";
import RegionSelectModal from "./RegionSelectModal";

const CompanyListSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 지역 + 카테고리 선택 상태
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <section className="max-w-5xl mx-auto w-full flex flex-col gap-8 p-6 rounded-lg">
      {/* 상단 */}
      <div className="rounded-lg p-7">
        {/* 검색 */}
        <div className="flex justify-end items-center gap-2">
          <input
            type="text"
            placeholder="업체명을 입력하세요"
            className="h-10 w-56 border border-gray-300 rounded-lg px-3"
          />
          <button
            type="button"
            className="h-10 px-4 rounded-lg bg-[#9fc87b] text-white font-semibold hover:brightness-90 transition"
          >
            검색
          </button>
        </div>

        {/* 중앙 타이틀 */}
        <div className="mt-5 flex flex-col items-center text-center">
          {/* 지역 */}
          <span className="font-semibold leading-tight text-[#9fc87b] text-[22px]">
            {selectedRegion || ""}
          </span>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-bold leading-tight text-gray-800 text-[20px]">
              업체 목록
            </span>

            {/* 카테고리 표시 */}
            <span className="inline-flex items-center gap-1 font-bold leading-tight text-[20px] text-gray-500">
              ({selectedCategory || "선택"})
              <span
                onClick={handleOpenModal}
                className="leading-none text-[18px] cursor-pointer hover:text-gray-900"
              >
                ▾
              </span>
            </span>
          </div>

          {/* 밑줄 */}
          <div className="mt-2 h-[2px] w-48 bg-gray-700 rounded-full" />
        </div>

        {/* 정렬 드롭다운 */}
        <div className="mt-3 flex justify-end">
          <select className="h-7 px-2 text-xs border border-gray-300 rounded">
            <option>추천 순</option>
            <option>별점 순</option>
          </select>
        </div>
      </div>

      {/* 업체 카드 리스트 */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-10 p-6">
        {companyDummy.content.map((company, i) => (
          <div
            key={company.customerId}
            className={
              i % 2 === 0
                ? "justify-self-end translate-x-8"
                : "justify-self-start translate-x-8"
            }
          >
            <CompanyCard {...company} />
          </div>
        ))}
      </div>

      {/* 하단 — 페이지네이션 */}
      <div className="flex justify-center space-x-2 text-gray-700 rounded-lg p-6">
        <button
          className="px-3 h-9 rounded border text-gray-300 border-gray-200"
          disabled
          title="첫 페이지"
        >
          «
        </button>
        <button
          className="px-3 h-9 rounded border text-gray-300 border-gray-200"
          disabled
          title="이전"
        >
          ‹
        </button>

        <button className="px-3 h-9 rounded border bg-[#9fc87b] text-white border-[#9fc87b]">
          1
        </button>
        <button className="px-3 h-9 rounded border hover:bg-gray-100">2</button>
        <button className="px-3 h-9 rounded border hover:bg-gray-100">3</button>

        <button className="px-3 h-9 rounded border hover:bg-gray-100" title="다음">
          ›
        </button>
        <button
          className="px-3 h-9 rounded border hover:bg-gray-100"
          title="마지막 페이지"
        >
          »
        </button>
      </div>

      {/* 지역/카테고리 선택 모달 */}
      {isModalOpen && (
        <RegionSelectModal
          defaultRegion={selectedRegion}
          defaultCategory={selectedCategory}
          onClose={() => setIsModalOpen(false)}
          onSelect={({ region, category }) => {
            setSelectedRegion(region);
            setSelectedCategory(category);
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
};

export default CompanyListSection;