
import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";
import MySurigisaaddModal from "../modal/MySurigisaaddModal";

const dummyData = [
  {
    id: 1,
    name: "surisuri",
    phone: "010-1234-1234",
    email: "kimduck@example.com",
    date: "2025.06.01",
    status: "수리중",
  },
  // 데이터 반복
  {
    id: 2,
    name: "surisuri",
    phone: "010-1234-1234",
    email: "kimduck@example.com",
    date: "2025.06.01",
    status: "수리중",
  },
  {
    id: 3,
    name: "surisuri",
    phone: "010-1234-1234",
    email: "kimduck@example.com",
    date: "2025.06.01",
    status: "수리중",
  },
  {
    id: 4,
    name: "surisuri",
    phone: "010-1234-1234",
    email: "kimduck@example.com",
    date: "2025.06.01",
    status: "수리중",
  },
  {
    id: 5,
    name: "surisuri",
    phone: "010-1234-1234",
    email: "kimduck@example.com",
    date: "2025.06.01",
    status: "수리대기",
  },
  {
    id: 6,
    name: "user6",
    phone: "010-1111-1111",
    email: "kimduck@example.com",
    date: "2025.06.06",
    status: "수리대기",
  },
  {
    id: 7,
    name: "user7",
    phone: "010-2222-2222",
    email: "kimduck@example.com",
    date: "2025.06.07",
    status: "수리중",
  },
];

const ITEMS_PER_PAGE = 5;

const Surigisamanage = () => {
  const [data, setData] = useState(dummyData); // 실제 리스트
  const [search, setSearch] = useState(""); // 검색
  const [sortOption, setSortOption] = useState("제목");
  const [currentPage, setCurrentPage] = useState(1); 
  const [isModalOpen, setIsModalOpen] = useState(false); //모달 오픈
  const [editingSurigisa, setEditingSurigisa] = useState(null); // 모달 수정

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // 신규 추가 또는 수정 저장
  const handleSaveSurigisa = (newItem) => {
    if (editingSurigisa) {
      // 수정
      setData((prev) =>
        prev.map((item) =>
          item.id === editingSurigisa.id ? { ...item, ...newItem } : item
        )
      );
    } else {
      // 신규 추가
      const newId = Math.max(...data.map((i) => i.id)) + 1;
      setData((prev) => [...prev, { id: newId, ...newItem }]);
    }
    setEditingSurigisa(null);
    setIsModalOpen(false);
  };

  const filteredList = data.filter(
    (item) => item.name.includes(search) || item.email.includes(search)
  );

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
              <option>제목</option>
              <option>날짜</option>
            </select>
          </div>
        </div>

        {/* 리스트 헤더 */}
        <div className="grid grid-cols-3 text-gray-500 font-semibold text-sm py-2 border-b">
          <div className="col-span-1 pl-5">기사정보</div>
          <div className="col-span-1 text-center">상태</div>
          <div className="col-span-1 text-center">등록일자</div>
        </div>

        {/* 리스트 */}
        <div className="space-y-3 mt-2 min-h-[500px]">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border rounded-lg p-4"
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
                  <button className="w-[96px] h-[37px] bg-[#6A8B4E] text-white rounded-[10px] text-sm font-[16px]">
                    수리중
                  </button>
                ) : (
                  <button className="w-[96px] h-[37px] bg-white text-[#6A8B4E] border border-[#6A8B4E] rounded-[10px] text-sm font-[16px]">
                    수리대기
                  </button>
                )}
              </div>

              <div className="w-1/3 text-center text-[#B3B3B3] ">
                {item.date}
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
            onClose={() => {
              setIsModalOpen(false);
              setEditingSurigisa(null);
            }}
            onSubmit={handleSaveSurigisa}
            initialData={editingSurigisa}
          />
        )}
      </div>
    </div>
  );
};

export default Surigisamanage;