import { useState, useEffect, useMemo } from "react";
import MySurigisaaddModal from "../modal/MySurigisaaddModal";
import MySurigisaEditModal from "../modal/MySurigisaEditModal";
import { listEngineers } from "../../services/customerAPI";

const PAGE_SIZE = 5;

const Surigisamanage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  const [engineers, setEngineers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 목록 조회
  const fetchEngineers = async () => {
    try {
      const res = await listEngineers({ page, size: PAGE_SIZE });
      const content = res.data?.content ?? [];
      const pages = res.data?.totalPages ?? 1;
      setEngineers(content);
      setTotalPages(pages);
    } catch (err) {
      console.error("수리기사 목록 불러오기 실패:", err);
      setEngineers([]);
    }
  };

  useEffect(() => {
    fetchEngineers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 모달 닫기 시 갱신
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedEngineer(null);
    fetchEngineers();
  };

  // 수정 버튼 클릭
  const handleEditOpen = (engineer) => {
    setSelectedEngineer(engineer);
    setIsEditModalOpen(true);
  };

  // 검색 필터
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return engineers;
    return engineers.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.phone ?? "").toLowerCase().includes(q)
    );
  }, [engineers, keyword]);

  // 페이지 번호
  const totalPagesCalc = Math.max(1, totalPages);
  const pageNumbers = (() => {
    const windowSize = 5;
    const start = Math.max(0, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPagesCalc - 1, start + windowSize - 1);
    const realStart = Math.max(0, end - windowSize + 1);
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i);
  })();

  const goPage = (p) => {
    if (p >= 0 && p < totalPagesCalc) setPage(p);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">수리 기사 관리</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름/이메일/전화 검색"
              className="h-10 w-56 border border-gray-300 rounded-lg px-3"
            />
            <button
              className="h-10 px-4 rounded-lg bg-[#9fc87b] text-white font-semibold hover:brightness-90 transition"
              onClick={() => setPage(0)}
            >
              검색
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-xl border border-gray-200 max-h-96 overflow-y-auto overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-2/5" /> {/* 이름/이메일/전화 */}
              <col className="w-1/5" /> {/* 상태 */}
              <col className="w-1/5" /> {/* 등록일자 */}
              <col className="w-1/5" /> {/* 관리 */}
            </colgroup>
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr className="border-b border-gray-200/70">
                <th className="text-left px-6 py-3 font-medium">이름 / 이메일 / 전화</th>
                <th className="text-center px-6 py-3 font-medium">상태</th>
                <th className="text-center px-6 py-3 font-medium">등록일자</th>
                <th className="text-center px-6 py-3 font-medium">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr
                  key={item.engineerId}
                  className="odd:bg-white even:bg-gray-50 hover:bg-[#f4f8ef] transition-colors"
                >
                  {/* 이름/이메일/전화 */}
                  <td className="px-6 py-4">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.email}</div>
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4 text-center">
                    {item.statusLabel === "수리중" ? (
                      <span className="px-3 py-1 bg-[#6A8B4E] text-white rounded-[10px] text-sm">
                        {item.statusLabel}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white text-[#6A8B4E] border border-[#6A8B4E] rounded-[10px] text-sm">
                        {item.statusLabel}
                      </span>
                    )}
                  </td>

                  {/* 등록일자 */}
                  <td className="px-6 py-4 text-center text-gray-500 font-mono tabular-nums">
                    {item.registeredAt?.slice?.(0, 10) || "-"}
                  </td>

                  {/* 관리 */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleEditOpen(item)}
                      className="h-7 px-3 text-xs rounded border border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                    표시할 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 + 등록 버튼 */}
        <div className="mt-6 flex items-center">
          <div className="flex-1" /> {/* 왼쪽 spacer */}

          {/* 페이지네이션 */}
          <div className="flex items-center gap-2 justify-center">
            <button onClick={() => goPage(0)} disabled={page === 0}
              className={`px-3 h-9 rounded border ${page === 0 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`} title="첫 페이지">
              «
            </button>
            <button onClick={() => goPage(page - 1)} disabled={page === 0}
              className={`px-3 h-9 rounded border ${page === 0 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`} title="이전">
              ‹
            </button>

            {pageNumbers.map((p) => (
              <button key={p} onClick={() => goPage(p)}
                className={`px-3 h-9 rounded border ${p === page ? "bg-[#9fc87b] text-white border-[#9fc87b]" : "hover:bg-gray-100"}`}>
                {p + 1}
              </button>
            ))}

            <button onClick={() => goPage(page + 1)} disabled={page >= totalPagesCalc - 1}
              className={`px-3 h-9 rounded border ${page >= totalPagesCalc - 1 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`} title="다음">
              ›
            </button>
            <button onClick={() => goPage(totalPagesCalc - 1)} disabled={page >= totalPagesCalc - 1}
              className={`px-3 h-9 rounded border ${page >= totalPagesCalc - 1 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`} title="마지막 페이지">
              »
            </button>
          </div>

          {/* 등록 버튼 */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 h-10 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90 transition"
            >
              + 수리기사 등록
            </button>
          </div>
        </div>
      </div>

      {/* 등록 모달 */}
      {isModalOpen && (
        <MySurigisaaddModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && selectedEngineer && (
        <MySurigisaEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          engineer={selectedEngineer}
        />
      )}
    </div>
  );
};

export default Surigisamanage;