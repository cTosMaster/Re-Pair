import { useState, useEffect, useCallback, useMemo } from "react";
import MySurigisaaddModal from "../modal/MySurigisaaddModal";
import MysuriPagination from "./MysuriPagination";
import { listEngineers, deleteEngineer } from "../../services/customerAPI";
import { useAuth } from "../../hooks/useAuth";

const ITEMS_PER_PAGE = 5;

const Surigisamanage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("이름");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurigisa, setEditingSurigisa] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchEngineers = useCallback(async () => {
    if (!user?.customerId) return;
    try {
      const res = await listEngineers({ customerId: user.customerId });
      setData(Array.isArray(res.data?.content) ? res.data.content : []);
    } catch (error) {
      console.error("수리기사 목록 불러오기 실패:", error);
      alert("수리기사 목록을 불러오지 못했습니다.");
    }
  }, [user?.customerId]);

  // useEffect 안에서 async 함수 호출
  useEffect(() => {
    const fetchData = async () => {
      await fetchEngineers();
    };
    fetchData();
  }, [fetchEngineers]);

  const handleRefresh = () => fetchEngineers();

  const handleSelect = (engineerId) => {
    setSelectedIds((prev) =>
      prev.includes(engineerId)
        ? prev.filter((id) => id !== engineerId)
        : [...prev, engineerId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return alert("삭제할 기사를 선택해주세요.");
    if (!window.confirm("선택한 수리기사를 삭제하시겠습니까?")) return;

    try {
      for (let id of selectedIds) await deleteEngineer(id);
      alert("선택한 수리기사가 삭제되었습니다.");
      setSelectedIds([]);
      fetchEngineers();
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const filteredList = useMemo(() => {
    let list = data.filter(
      (item) =>
        item.name.includes(search) ||
        item.email.includes(search) ||
        (item.registeredAt && item.registeredAt.includes(search))
    );

    if (sortOption === "이름") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOption === "등록일")
      list.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    return list;
  }, [data, search, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const goPage = (p) => {
    if (p >= 0 && p < totalPages) setCurrentPage(p);
  };

  return (
    <div className="w-full px-10 mt-10">
      <div className="mx-auto max-w-5xl bg-white shadow-md rounded-xl p-6">
        {/* 헤더 */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-[#9fc87b]">수리 기사 관리</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름/이메일 검색"
              className="h-10 w-64 border border-gray-300 rounded-lg px-3"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-10 px-3 border border-gray-300 rounded-lg"
            >
              <option>이름</option>
              <option>등록일</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full table-fixed text-sm">
            <colgroup>
              <col className="w-1/12" />
              <col className="w-4/12" />
              <col className="w-3/12" />
              <col className="w-4/12" />
            </colgroup>
            <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">선택</th>
                <th className="px-6 py-3 text-left">이름 / 이메일 / 전화</th>
                <th className="px-6 py-3 text-left">상태</th>
                <th className="px-6 py-3 text-left">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item) => (
                <tr
                  key={item.engineerId}
                  className="odd:bg-white even:bg-gray-50 hover:bg-[#f4f8ef] cursor-pointer transition"
                  onClick={() => {
                    setEditingSurigisa(item);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.engineerId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelect(item.engineerId);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.email}</div>
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "수리중" ? (
                      <span className="px-3 py-1 bg-[#6A8B4E] text-white rounded-[10px] text-sm">
                        수리중
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white text-[#6A8B4E] border border-[#6A8B4E] rounded-[10px] text-sm">
                        수리대기
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{new Date(item.registeredAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                    표시할 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => {
              setEditingSurigisa(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90 transition"
          >
            + 수리기사 등록
          </button>
          <button
            onClick={handleDeleteSelected}
            className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold hover:brightness-90 transition"
          >
            선택 삭제
          </button>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-4 flex justify-center">
          <MysuriPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={goPage}
          />
        </div>

        {/* 모달 */}
        {isModalOpen && (
          <MySurigisaaddModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleRefresh}
            initialData={editingSurigisa}
            customerId={user?.customerId}
          />
        )}
      </div>
    </div>
  );
};

export default Surigisamanage;
