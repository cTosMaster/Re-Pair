import { useState, useEffect, useCallback } from "react";
import MysuriPagination from "./MysuriPagination";
import MySurigisaaddModal from "../modal/MySurigisaaddModal";
import { listEngineers } from "../../services/customerAPI";
import { useAuth } from "../../hooks/useAuth";

const ITEMS_PER_PAGE = 5;

const Surigisamanage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("이름");
  const [currentPage, setCurrentPage] = useState(1); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurigisa, setEditingSurigisa] = useState(null);

  const fetchEngineers = useCallback(async () => {
    if (!user?.customerId) return; // customerId 없으면 요청하지 않음
    try {
      const res = await listEngineers({ customerId: user.customerId });
      setData(res.data);
    } catch (error) {
      console.error("수리기사 목록 불러오기 실패:", error);
      alert("수리기사 목록을 불러오지 못했습니다.");
    }
  }, [user?.customerId]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // 모달에서 등록 후 목록 갱신
  const handleRefresh = () => {
    fetchEngineers();
  };

  const filteredList = data
    .filter((item) => item.name.includes(search) || item.email.includes(search))
    .sort((a, b) => {
      if (sortOption === "이름") return a.name.localeCompare(b.name);
      if (sortOption === "날짜") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
        <h2 className="text-xl font-bold mb-6">수리 기사 관리</h2>

        {/* 검색 */}
        <div className="flex justify-end w-full mb-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search"
              className="px-4 py-2 border border-gray-300 rounded-lg w-64"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>이름</option>
              <option>날짜</option>
            </select>
          </div>
        </div>

        {/* 리스트 */}
        <div className="space-y-3 mt-2 min-h-[500px]">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border rounded-lg p-4 cursor-pointer"
              onClick={() => {
                setEditingSurigisa(item);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-4 w-1/3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
                  👤
                </div>
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.email}</div>
                  <div className="text-sm text-gray-500">{item.phone}</div>
                </div>
              </div>

              <div className="w-1/3 flex justify-center">
                {item.status === "수리중" ? (
                  <button className="w-[96px] h-[37px] bg-[#6A8B4E] text-white rounded-[10px] text-sm">
                    수리중
                  </button>
                ) : (
                  <button className="w-[96px] h-[37px] bg-white text-[#6A8B4E] border border-[#6A8B4E] rounded-[10px] text-sm">
                    수리대기
                  </button>
                )}
              </div>

              <div className="w-1/3 text-center text-[#B3B3B3] ">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* 등록 버튼 */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-[#6A8B4E] hover:bg-[#5A7A40] text-white px-6 py-2 rounded-lg font-semibold"
            onClick={() => {
              setEditingSurigisa(null);
              setIsModalOpen(true);
            }}
          >
            ⊕ 수리기사 등록
          </button>
        </div>

        {/* 페이지네이션 */}
        <MysuriPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* 모달 */}
        {isModalOpen && (
          <MySurigisaaddModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleRefresh}
            initialData={editingSurigisa}
            customerId={user?.customerId} // 항상 전달
          />
        )}
      </div>
    </div>
  );
};

export default Surigisamanage;
