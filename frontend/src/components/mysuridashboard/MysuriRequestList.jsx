
import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";

const dummyData = [
  {
    id: 1,
    name: "surisuri",
    phone: "010-1234-1234",
    title: "김시계",
    date: "2025.06.01",
  },
  // 데이터 반복
  {
    id: 2,
    name: "surisuri",
    phone: "010-1234-1234",
    title: "다시계",
    date: "2025.07.01",
  },
  {
    id: 3,
    name: "surisuri",
    phone: "010-1234-1234",
    title: "나시계",
    date: "2025.03.01",
  },
  {
    id: 4,
    name: "surisuri",
    phone: "010-1234-1234",
    title: "시계",
    date: "2025.06.01",
  },
  {
    id: 5,
    name: "surisuri",
    phone: "010-1234-1234",
    title: "시계",
    date: "2025.06.01",
  },
  {
    id: 6,
    name: "user6",
    phone: "010-1111-1111",
    title: "키보드",
    date: "2025.03.06",
  },
  {
    id: 7,
    name: "user7",
    phone: "010-2222-2222",
    title: "마우스",
    date: "2025.06.07",
  },
];

const ITEMS_PER_PAGE = 5;

const RequestList = () => {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("제목");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  //정렬(제목.날짜 기준)
  const filteredList = dummyData
  .filter((item) =>
    item.title.includes(search) || item.name.includes(search)
  )
  .sort((a, b) => {
    if (sortOption === "제목") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "날짜") {
      // 날짜 문자열 "YYYY.MM.DD"를 Date 객체로 변환 후 비교
      const dateA = new Date(a.date.replace(/\./g, "-"));
      const dateB = new Date(b.date.replace(/\./g, "-"));
      return dateB - dateA; // 최신순 정렬
    }
    return 0;
  });

  // 페이지네이션 적용
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full px-10 mt-10">
    <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6">수리 요청 관리</h2>

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
      <div className="grid grid-cols-5 text-gray-500 font-semibold text-sm py-2 border-b">
        <div>고객명</div>
        <div>제목</div>
        <div>요청 날짜</div>
        <div className="col-span-2 text-right">상세보기</div>
      </div>

      {/* List Items */}
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
                <div className="text-sm text-gray-500">{item.phone}</div>
              </div>
            </div>
            <div className="w-1/5 font-semibold">{item.title}</div>
            <div className="w-1/5">{item.date}</div>
            <div className="w-1/5 text-right">
              <button className="text-gray-700 font-medium border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-100">
                상세보기
              </button>
            </div>
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

export default RequestList;
