import CompanyCard from "./CompanyCard";
import { companyDummy } from "./dummy/companyDummy";

const CompanyListSection = () => {
  const handleOpenCategory = () => {};

  return (
    <section className="max-w-5xl mx-auto w-full flex flex-col gap-8 p-6 rounded-lg">
      {/* 상단 */}
      <div className="rounded-lg p-7">
        {/* 검색행 */}
        <div className="flex justify-end items-center gap-2">
          <input
            type="text"
            placeholder="업체명이나 키워드를 입력하세요"
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
          <span className="font-semibold leading-tight text-[#9fc87b] text-[22px]">
            서울 강남구
          </span>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-bold leading-tight text-gray-800 text-[20px]">
              업체 목록
            </span>

            {/* (시계) + 화살표 */}
            <button
              type="button"
              onClick={handleOpenCategory}
              aria-label="카테고리 선택"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900"
            >
              <span className="border border-gray-300 bg-gray-50 text-gray-600 rounded px-2 py-[1px] text-[14px]">
                (시계)
              </span>
              <span className="leading-none text-[14px]">▾</span>
            </button>
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

      {/* 중단 — 1열/2열 전체를 더 오른쪽으로 이동 */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-10 p-6">
        {companyDummy.content.map((company, i) => (
          <div
            key={company.customerId}
            className={
              i % 2 === 0
                ? "justify-self-end translate-x-8" // ⬅️ 기존 4 → 8
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
        <button className="px-3 h-9 rounded border hover:bg-gray-100" title="마지막 페이지">
          »
        </button>
      </div>
    </section>
  );
};

export default CompanyListSection;