import { useState, useEffect, useMemo } from "react";
import RepairgoodsManagementModal from "../modal/RepairgoodsManagementModal";
import { listRepairItems, deleteRepairItem } from "../../services/customerAPI";

const PAGE_SIZE = 5;

const RepairgoodsManagement = () => {
  const [rawItems, setRawItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  // 검색 입력값과 실행된 검색어 분리
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // 🔑 user에서 customerId 가져오기
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerId = user.customerId;

  /** 목록 불러오기 */
  const fetchItems = async () => {
    if (!customerId) {
      console.warn("customerId가 없습니다.");
      return;
    }
    try {
      const res = await listRepairItems(customerId);
      const data = res?.data ?? [];
      const list = Array.isArray(data) ? data : (data.content ?? []);
      setRawItems(list);
    } catch (e) {
      console.error("수리물품 목록 불러오기 실패:", e);
      setRawItems([]);
    }
  };

  /** 처음 렌더링 + customerId 변경 시 */
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  /** 모달 닫으면 다시 불러오기 */
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchItems();
  };

  /** 검색 (버튼 누를 때만 실행됨) */
  const handleSearch = () => {
    setPage(0);
    setSearchQuery(keyword);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /** 검색 적용 */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawItems;
    return rawItems.filter((it) => {
      const name = `${it.name ?? ""}`.toLowerCase();
      const cat = `${it.categoryName ?? ""}`.toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [rawItems, searchQuery]);

  /** 페이징 */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const goPage = (p) => {
    if (p >= 0 && p < totalPages) setPage(p);
  };

  const pageNumbers = (() => {
    const windowSize = 5;
    const start = Math.max(0, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages - 1, start + windowSize - 1);
    const realStart = Math.max(0, end - windowSize + 1);
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i);
  })();

  /** 삭제 */
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      setDeletingId(id);
      await deleteRepairItem(id);
      setRawItems((prev) => prev.filter((x) => (x.itemId ?? x.id) !== id));
      const afterFiltered = filtered.filter((x) => (x.itemId ?? x.id) !== id);
      const newTotalPages = Math.max(
        1,
        Math.ceil(afterFiltered.length / PAGE_SIZE)
      );
      setPage((prev) => Math.min(prev, newTotalPages - 1));
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">물품 관리</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제품명/카테고리 검색"
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
        <div className="rounded-xl border border-gray-200 max-h-96 overflow-y-auto overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr className="border-b border-gray-200/70">
                <th className="text-left px-6 py-3 font-medium">카테고리</th>
                <th className="text-left px-6 py-3 font-medium">제품명</th>
                <th className="text-left px-6 py-3 font-medium">기본 단가</th>
                <th className="text-left px-6 py-3 font-medium">등록일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const id = item.itemId ?? item.id;
                return (
                  <tr
                    key={id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-[#f4f8ef] transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                      {item.categoryName ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {item.name ?? "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold tabular-nums whitespace-nowrap">
                      {item.price?.toLocaleString?.() ?? item.price ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 font-mono tabular-nums">
                          {item.createdAt?.slice?.(0, 10) || "-"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="h-7 px-3 text-xs rounded border border-red-200 hover:bg-red-50 text-red-600 shrink-0"
                          title="삭제"
                        >
                          {deletingId === id ? "삭제중…" : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-gray-400"
                  >
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
              className={`px-3 h-9 rounded border ${
                page === 0
                  ? "text-gray-300 border-gray-200"
                  : "hover:bg-gray-100"
              }`}
              title="첫 페이지"
            >
              «
            </button>
            <button
              onClick={() => goPage(page - 1)}
              disabled={page === 0}
              className={`px-3 h-9 rounded border ${
                page === 0
                  ? "text-gray-300 border-gray-200"
                  : "hover:bg-gray-100"
              }`}
              title="이전"
            >
              ‹
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`px-3 h-9 rounded border ${
                  p === page
                    ? "bg-[#9fc87b] text-white border-[#9fc87b]"
                    : "hover:bg-gray-100"
                }`}
              >
                {p + 1}
              </button>
            ))}

            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages - 1}
              className={`px-3 h-9 rounded border ${
                page >= totalPages - 1
                  ? "text-gray-300 border-gray-200"
                  : "hover:bg-gray-100"
              }`}
              title="다음"
            >
              ›
            </button>
            <button
              onClick={() => goPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className={`px-3 h-9 rounded border ${
                page >= totalPages - 1
                  ? "text-gray-300 border-gray-200"
                  : "hover:bg-gray-100"
              }`}
              title="마지막 페이지"
            >
              »
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 h-10 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90 transition"
            >
              + 물품 등록
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RepairgoodsManagementModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default RepairgoodsManagement;