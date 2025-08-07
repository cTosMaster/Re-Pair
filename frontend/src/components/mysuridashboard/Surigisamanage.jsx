
import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";

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
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("제목");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  const filteredList = dummyData.filter((item) =>
 item.name.includes(search)|| item.email.includes(search)
  );

  // 페이지네이션 적용
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full px-10 mt-10">
    <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6">수리 기사 관리</h2>

      {/* Header: 검색 + 정렬 */}
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

      {/* Table Header */}
    <div className="grid grid-cols-3 text-gray-500 font-semibold text-sm py-2 border-b">
        <div className="col-span-1 pl-5">기사정보</div>
        <div className="col-span-1 text-center">상태</div> {/* 중앙 정렬로 변경 */}
        <div className="col-span-1 text-center">등록일자</div>
    </div>

    {/* List Items */}
    <div className="space-y-3 mt-2 min-h-[500px]">
    {currentItems.map((item) => (
        <div
        key={item.id}
        className="flex items-center justify-between border rounded-lg p-4"
        >
        {/* 기사 정보 */}
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

        {/* 상태 버튼 */}
        <div className="w-1/3 flex justify-center">
            {item.status === "수리중" ? (
            <button className="w-[96px] h-[37px] bg-[#6A8B4E] text-white px-3 py-1 rounded-[10px] text-sm font-[16px]">
                수리중
            </button>
            ) : (
            <button className="w-[96px] h-[37px] bg-white text-[#6A8B4E] border border-[#6A8B4E] px-3 py-1 rounded-[10px] text-sm font-[16px]">
                수리대기
            </button>
            )}
        </div>

        {/* 등록일자 */}
        <div className="w-1/3 text-center text-[#B3B3B3] ">{item.date}</div>
        </div>
    ))}
    </div>

      {/* Pagination */}
      <MysuriPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      </div>
    </div>
  );
};
export default Surigisamanage;