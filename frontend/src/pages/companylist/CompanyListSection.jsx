import { useState, useEffect, useCallback } from "react";
import CompanyCard from "./CompanyCard";
import RegionSelectModal from "./RegionSelectModal";
import { listCustomerCards } from "../../services/customerAPI";

const CompanyListSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [companies, setCompanies] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    size: 8,
  });

  /** API 호출 */
  const fetchCompanies = useCallback(
    async (region, category, pageNo = 0, keywordValue = "") => {
      let regionSi = null;
      let regionGu = null;

      if (region) {
        const parts = region.split(" ");
        regionSi = parts[0];
        regionGu = parts[1] || "";
      }

      const params = {
        page: pageNo,
        size: pageInfo.size,
        ...(regionSi && { regionSi }),
        ...(regionGu && { regionGu }),
        ...(category?.id && { platformCategoryId: category.id }),
        ...(keywordValue && { keyword: keywordValue }),
      };

      try {
        const res = await listCustomerCards(params);
        const data = res.data;

        setCompanies(data.content || []);
        setPageInfo((prev) => ({
          ...prev,
          page: data.number,
          totalPages: data.totalPages,
          size: data.size,
        }));
      } catch (err) {
        console.error("업체 불러오기 실패:", err);
      }
    },
    [pageInfo.size]
  );

  useEffect(() => {
    fetchCompanies(selectedRegion, selectedCategory, pageInfo.page, keyword);
  }, [fetchCompanies, selectedRegion, selectedCategory, pageInfo.page, keyword]);

  const handleSearch = () => {
    setPageInfo((prev) => ({ ...prev, page: 0 }));
    setKeyword(searchInput.trim());
  };

  const goToPage = (pageNo) => {
    if (pageNo >= 0 && (pageInfo.totalPages === 0 || pageNo < pageInfo.totalPages)) {
      setPageInfo((prev) => ({ ...prev, page: pageNo }));
    }
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 w-56 border border-gray-300 rounded-lg px-3"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="h-10 px-4 rounded-lg bg-[#9fc87b] text-white font-semibold hover:brightness-90 transition"
          >
            검색
          </button>
        </div>

        {/* 중앙 타이틀 */}
        <div className="mt-5 flex flex-col items-center text-center">
          <span className="font-semibold leading-tight text-[#9fc87b] text-[22px]">
            {selectedRegion || ""}
          </span>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-bold leading-tight text-gray-800 text-[20px]">
              업체 목록
            </span>

            <span className="inline-flex items-center gap-1 font-bold leading-tight text-[20px] text-gray-500">
              ({selectedCategory?.name || "선택"})
              <span
                onClick={() => setIsModalOpen(true)}
                className="leading-none text-[18px] cursor-pointer hover:text-gray-900"
              >
                ▾
              </span>
            </span>
          </div>

          <div className="mt-2 h-[2px] w-48 bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* 업체 카드 리스트 */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-10 p-6">
        {companies.map((company, i) => (
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
        {companies.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-10">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center space-x-2 text-gray-700 rounded-lg p-6">
        <button
          className="px-3 h-9 rounded border hover:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          disabled={pageInfo.page === 0}
          onClick={() => goToPage(0)}
          title="첫 페이지"
        >
          «
        </button>
        <button
          className="px-3 h-9 rounded border hover:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          disabled={pageInfo.page === 0}
          onClick={() => goToPage(pageInfo.page - 1)}
          title="이전"
        >
          ‹
        </button>

        {pageInfo.totalPages > 0 ? (
          [...Array(pageInfo.totalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`px-3 h-9 rounded border ${
                pageInfo.page === idx
                  ? "bg-[#9fc87b] text-white border-[#9fc87b]"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => goToPage(idx)}
            >
              {idx + 1}
            </button>
          ))
        ) : (
          <button
            className="px-3 h-9 rounded border bg-[#9fc87b] text-white border-[#9fc87b]"
            disabled
          >
            1
          </button>
        )}

        <button
          className="px-3 h-9 rounded border hover:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          disabled={
            pageInfo.totalPages === 0 || pageInfo.page === pageInfo.totalPages - 1
          }
          onClick={() => goToPage(pageInfo.page + 1)}
          title="다음"
        >
          ›
        </button>
        <button
          className="px-3 h-9 rounded border hover:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          disabled={
            pageInfo.totalPages === 0 || pageInfo.page === pageInfo.totalPages - 1
          }
          onClick={() => goToPage(pageInfo.totalPages - 1)}
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
            setPageInfo((prev) => ({ ...prev, page: 0 }));
          }}
        />
      )}
    </section>
  );
};

export default CompanyListSection;