import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";
import PresetModal from "../modal/PresetModal";

const initialData = [
  { id: 1, name: "surisuri", phone: "010-1234-1234", title: "시계", status: "수리 중" },
  { id: 2, name: "surisuri", phone: "010-1234-1234", title: "시계", status: "대기 중" },
  { id: 3, name: "surisuri", phone: "010-1234-1234", title: "시계", status: "대기 중" },
  { id: 4, name: "surisuri", phone: "010-1234-1234", title: "시계", status: "대기 중" },
  { id: 5, name: "surisuri", phone: "010-1234-1234", title: "시계", status: "수리 중" },
];

const ITEMS_PER_PAGE = 5;

const PresetList = () => {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("제목");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // 수정할 아이템 저장

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const filteredList = data.filter(
    (item) =>
      item.name.includes(search) ||
      item.phone.includes(search) ||
      item.title.includes(search)
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const isAllSelected = currentItems.length > 0 && currentItems.every((item) => selectedIds.has(item.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        currentItems.forEach((item) => newSet.delete(item.id));
        return newSet;
      });
    } else {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        currentItems.forEach((item) => newSet.add(item.id));
        return newSet;
      });
    }
  };

  const statusClass = (status) => {
    if (status === "수리 중")
      return "bg-green-600 text-white font-semibold px-4 py-1 rounded-md";
    if (status === "대기 중")
      return "border border-green-600 text-green-600 font-semibold px-4 py-1 rounded-md";
    return "";
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    const newData = data.filter(item => !selectedIds.has(item.id));
    setData(newData);
    setSelectedIds(new Set());
    if ((currentPage - 1) * ITEMS_PER_PAGE >= newData.length && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 모달 제출 시 호출됨
  const handleModalSubmit = (formData) => {
    if (selectedItem) {
      // 수정: 해당 아이템 id 기준으로 업데이트
      setData(prevData =>
        prevData.map(item =>
          item.id === selectedItem.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      // 새 아이템 추가
      const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
      const newItem = {
        id: maxId + 1,
        ...formData,
        status: formData.status || "대기 중",
      };
      setData(prevData => [...prevData, newItem]);
    }

    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // 상세보기 클릭 시 해당 아이템 모달에 띄우기
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
        <h1 className="font-semibold text-lg">프리셋 목록</h1>

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

        <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px] text-gray-400 text-xs font-semibold mb-2 select-none">
          <div className="flex items-center justify-center">
            <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
          </div>
          <div>고객명</div>
          <div>제목</div>
          <div>상태</div>
          <div className="text-center">상세보기</div>
        </div>

        <div className="space-y-3 min-h-[500px]">
          {currentItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`grid grid-cols-[40px_1fr_1fr_1fr_80px] items-center rounded-lg border px-4 py-3 cursor-pointer ${
                  isSelected
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300 hover:border-green-400"
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col text-sm font-semibold">
                  <span>{item.name}</span>
                  <span className="text-gray-400 text-xs font-normal">{item.phone}</span>
                </div>

                <div className="font-bold text-base">{item.title}</div>

                <div className="flex justify-center">
                  <span className={statusClass(item.status)}>{item.status}</span>
                </div>

                <div
                  className="text-center text-gray-400 text-sm cursor-pointer select-none hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetailClick(item);
                  }}
                >
                  상세보기
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 gap-4">
          <div className="space-x-4">
            <button
              className="bg-green-400 text-white rounded-md px-6 py-2 hover:bg-green-500 transition"
              onClick={() => {
                setSelectedItem(null); // 새 생성 모드
                setIsModalOpen(true);
              }}
            >
              생성
            </button>
            <button
              className="bg-green-400 text-white rounded-md px-6 py-2 hover:bg-green-500 transition"
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        </div>

        <MysuriPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 수정 또는 생성용 모달 */}
      {isModalOpen && (
        <PresetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleModalSubmit}
          initialData={selectedItem}  // 수정 모드면 데이터 전달
        />
      )}
    </div>
  );
};

export default PresetList;
