import { useState } from "react";
import MysuriPagination from "./MysuriPagination";
import RequestManageDeleteModal from "../modal/RequestManagedeleteModal";

const dummyData = [
  { id: 1, name: "surisuri", phone: "010-1234-1234", title: "시계", date: "2025.06.01", status: "수리중" },
  { id: 2, name: "surisuri", phone: "010-1234-1234", title: "김시계", date: "2025.06.01", status: "수리중" },
  { id: 3, name: "surisuri", phone: "010-1234-1234", title: "시계", date: "2025.06.01", status: "수리중" },
  { id: 4, name: "surisuri", phone: "010-1234-1234", title: "다시계", date: "2025.06.01", status: "수리중" },
  { id: 5, name: "surisuri", phone: "010-1234-1234", title: "시계", date: "2025.06.01", status: "수리대기" },
  { id: 6, name: "user6", phone: "010-1111-1111", title: "키보드", date: "2025.06.06", status: "수리대기" },
  { id: 7, name: "user7", phone: "010-2222-2222", title: "마우스", date: "2025.06.07", status: "수리중" },
];

const ITEMS_PER_PAGE = 5;

const MysuriRequestManage = () => {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("제목");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState(dummyData);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  //필터 정렬
  const filteredList = data
  .filter(
    (item) => item.title.includes(search) || item.name.includes(search)
  )
  .sort((a, b) => {
    if (sortOption === "제목") {
      return a.title.localeCompare(b.title, "ko"); // 한글 정렬
    }
    if (sortOption === "날짜") {
      // 날짜 최신순
      return new Date(b.date) - new Date(a.date);
    }
    return 0;
  });

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = (reason) => {
    setData((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "삭제됨", deleteReason: reason }
          : item
      )
    );
    setSelectedIds([]);
    setIsModalOpen(false);
  };

  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
        <h2 className="text-xl font-bold mb-6">수리 현황 관리</h2>

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
              <option value="제목">제목</option>
              <option value="날짜">날짜</option>
            </select>
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-7 text-gray-500 font-semibold text-sm py-2 border-b">
          <div className="pl-2">
            <input
              type="checkbox"
              checked={
                currentItems.length > 0 &&
                currentItems.every((item) => selectedIds.includes(item.id))
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds((prev) => [
                    ...new Set([...prev, ...currentItems.map((i) => i.id)]),
                  ]);
                } else {
                  setSelectedIds((prev) =>
                    prev.filter((id) => !currentItems.map((i) => i.id).includes(id))
                  );
                }
              }}
            />
          </div>
          <div>고객명</div>
          <div>제목</div>
          <div>수리 상태</div>
          <div>요청날짜</div>
          <div>상세보기</div>
        </div>

        {/* 리스트 */}
        <div className="space-y-3 mt-2 min-h-[500px]">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 items-center border rounded-lg p-4"
            >
              <div>
                {item.status !== "삭제됨" && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                )}
              </div>
              <div className="font-semibold">{item.name}</div>
              <div className="font-semibold">{item.title}</div>
              <div>
                {item.status === "수리중" && (
                  <span className="px-3 py-1 bg-[#6A8B4E] text-white rounded">수리중</span>
                )}
                {item.status === "수리대기" && (
                  <span className="px-3 py-1 border border-[#6A8B4E] text-[#6A8B4E] rounded">
                    수리대기
                  </span>
                )}
                {item.status === "삭제됨" && (
                  <span className="px-3 py-1 bg-red-500 text-white rounded">삭제됨</span>
                )}
              </div>
              <div>{item.date}</div>
              <div className="text-right">
                {item.status !== "삭제됨" ? (
                  <button className="border px-4 py-1 rounded hover:bg-gray-100">
                    상세보기
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">
                    삭제 사유: {item.deleteReason}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 삭제 버튼 */}
        <div className="flex justify-end mt-4">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedIds.length > 0
                ? "bg-[#6A8B4E] text-white hover:bg-[#5A7A40]"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            요청 삭제
          </button>
        </div>

        {/* 페이지네이션 */}
        <MysuriPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {isModalOpen && (
        <RequestManageDeleteModal
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default MysuriRequestManage;
