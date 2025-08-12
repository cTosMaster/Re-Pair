import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";
import RepairgoodsManagementModal from "../modal/RepairgoodsManagementModal";

const dummyDataInit = [
  { id: 1, category: "휴대폰", name: "삼성 갤럭시 S7", price: "15,000", date: "2024.07.05" },
  { id: 2, category: "UMPC", name: "스팀덱 OLED", price: "12,000", date: "2019.06.05" },
  { id: 3, category: "전자시계", name: "갤럭시 워치 7", price: "10,000", date: "2017.08.05" },
  { id: 4, category: "콘솔 게임기", name: "플레이스테이션4", price: "8,000", date: "2019.12.11" },
  { id: 5, category: "노트북", name: "LENOVO", price: "5,000", date: "2022.08.12" },
  { id: 6, category: "노트북", name: "LG 그램", price: "15,000", date: "2022.08.12" },
  { id: 7, category: "마우스", name: "로지텍 MX Master", price: "6,000", date: "2025.02.15" },
];

const ITEMS_PER_PAGE = 5;

const RepairgoodsManagement = () => {
  const [items, setItems] = useState(dummyDataInit);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("제품명");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 삭제 모드 활성화 여부
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  // 선택된 아이템 id 목록
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // 체크박스 토글
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 전체 선택 토글 (헤더용, 필요하면 추가 가능)
  // const toggleSelectAll = () => { ... }

  // 삭제 처리
  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    if (window.confirm("선택한 항목을 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setIsDeleteMode(false);
      setCurrentPage(1);
    }
  };

  //물품등록
  const handleAddItem = (newItem) => {
  // 새 아이템에 id와 date 추가 (date는 오늘 날짜 예시)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const itemWithId = {
    ...newItem,
    id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
    date: today,
  };

  setItems((prev) => [...prev, itemWithId]);
};


  // 검색 필터링
  const filteredList = items.filter(
    (item) =>
      item.name.includes(search) ||
      item.category.includes(search)
  );
  //정렬
  const sortedList = filteredList.slice().sort((a, b) => {
    if (sortOption === "제품명") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "등록일자") {
      // 등록일자 형식이 "YYYY.MM.DD"이므로, 비교를 위해 "-"로 바꾸거나 Date 객체로 변환
      const dateA = new Date(a.date.replace(/\./g, "-"));
      const dateB = new Date(b.date.replace(/\./g, "-"));
      return dateB - dateA; // 최신순 정렬
    } else if (sortOption === "카테고리") {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  //페이지네이션
  const totalItems = sortedList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10 ">
        <h2 className="text-xl font-bold mb-6">모든 수리물품</h2>

        {/* 검색 & 정렬 */}
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
              <option>제품명</option>
              <option>등록일자</option>
              <option>카테고리</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl shadow p-6 min-h-[500px]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                {/* 삭제 모드 시 체크박스 헤더 */}
                {isDeleteMode && <th className="w-10"></th>}
                <th className="text-left h-[60px]">카테고리</th>
                <th className="text-left h-[60px]">제품명</th>
                <th className="text-left h-[60px]">기본 단가</th>
                <th className="text-left h-[60px]">등록일자</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b last:border-none">
                  {/* 삭제 모드 시 체크박스 */}
                  {isDeleteMode && (
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="h-[60px]">{item.category}</td>
                  <td className="h-[60px]">{item.name}</td>
                  <td className="h-[60px] font-semibold">{item.price}</td>
                  <td className="h-[60px]">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end mt-6 gap-4">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 rounded-full font-medium text-sm hover:bg-green-200"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="text-xl">+</span> 물품 등록
          </button>

          {/* 삭제 토글 버튼 */}
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm ${
              isDeleteMode
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={() => {
              // 삭제 모드 중이면 선택 초기화 하고 끔
              if (isDeleteMode) {
                setSelectedIds(new Set());
                setIsDeleteMode(false);
              } else {
                setIsDeleteMode(true);
              }
            }}
          >
            <span className="text-xl">{isDeleteMode ? "×" : "+"}</span> 물품 삭제
          </button>

          {/* 선택된 항목 삭제 버튼 - 삭제 모드일 때만 보임 */}
          {isDeleteMode && (
            <button
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-full font-medium text-sm hover:bg-red-700"
              onClick={handleDelete}
            >
              선택 삭제
            </button>
          )}
        </div>

        {/* 페이지네이션 */}
        <MysuriPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <RepairgoodsManagementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
          handleAddItem(data);
          setIsModalOpen(false);
        }}
        />
      )}
    </div>
  );
};

export default RepairgoodsManagement;
