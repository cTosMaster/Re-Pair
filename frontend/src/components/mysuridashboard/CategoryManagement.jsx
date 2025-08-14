import { useEffect, useState, useMemo } from "react";
import CategoryManagementModal from "../modal/CategoryManagementModal";
import { getCustomerCategories, deleteCustomerCategory } from "../../services/centerAPI";

const PAGE_SIZE = 5;

const CategoryManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  const fetchCustomerCategories = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const customerId = userData?.customerId;
      if (!customerId) {
        console.error("customerId 없음");
        return;
      }

      const res = await getCustomerCategories(customerId);
      const data = res.data;
      setCategories(data || []);
    } catch (err) {
      console.error("고객사 카테고리 조회 실패", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCustomerCategories();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchCustomerCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      setDeletingId(id);
      await deleteCustomerCategory(id);
      await fetchCustomerCategories();
    } catch (err) {
      console.error("카테고리 삭제 실패", err);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  // 검색 필터
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((cat) =>
      (cat.name ?? "").toLowerCase().includes(q)
    );
  }, [categories, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // 페이지 번호 생성
  const pageNumbers = (() => {
    const windowSize = 5;
    const start = Math.max(0, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages - 1, start + windowSize - 1);
    const realStart = Math.max(0, end - windowSize + 1);
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i);
  })();

  const goPage = (p) => {
    if (p >= 0 && p < totalPages) setPage(p);
  };

  const handleSearch = () => setPage(0);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        {/* 상단 헤더 + 검색창 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">카테고리 관리</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="카테고리명 검색"
              className="h-10 w-56 border border-gray-300 rounded-lg px-3"
            />
            <button
              onClick={handleSearch}
              className="h-10 px-4 rounded-lg bg-[#9fc87b] text-white font-semibold hover:brightness-90 transition"
            >
              검색
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-3 font-medium">카테고리 이름</th>
                <th className="text-left px-6 py-3 font-medium">생성일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length > 0 ? (
                items.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-3">{cat.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 font-mono tabular-nums">
                          {cat.createdAt?.slice?.(0, 10) || "-"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          className="h-7 px-3 text-xs rounded border border-red-200 hover:bg-red-50 text-red-600 shrink-0"
                          title="삭제"
                        >
                          {deletingId === cat.id ? "삭제중…" : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center text-gray-400">
                    표시할 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 + 등록 버튼 */}
        <div className="mt-6 flex items-center">
          <div className="flex-1" />
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => goPage(0)}
              disabled={page === 0}
              className={`px-3 h-9 rounded border ${page === 0 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`}
              title="첫 페이지"
            >
              «
            </button>
            <button
              onClick={() => goPage(page - 1)}
              disabled={page === 0}
              className={`px-3 h-9 rounded border ${page === 0 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`}
              title="이전"
            >
              ‹
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`px-3 h-9 rounded border ${
                  p === page ? "bg-[#9fc87b] text-white border-[#9fc87b]" : "hover:bg-gray-100"
                }`}
              >
                {p + 1}
              </button>
            ))}

            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages - 1}
              className={`px-3 h-9 rounded border ${
                page >= totalPages - 1 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"
              }`}
              title="다음"
            >
              ›
            </button>
            <button
              onClick={() => goPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className={`px-3 h-9 rounded border ${
                page >= totalPages - 1 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"
              }`}
              title="마지막 페이지"
            >
              »
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 h-10 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90"
            >
              + 카테고리 등록
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <CategoryManagementModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default CategoryManagement;