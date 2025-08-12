import React, { useState } from "react";
import MysuriPagination from "./MysuriPagination";
import PresetModal from "../modal/PresetModal";

const PresetList = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const [items, setItems] = useState([
  { id: 1, category:"UMPC", name: "UMPC", desc: "CPU [모델 - X650 스냅드래곤]", price: "25,000", date: "2025.01.12" },
  { id: 2, category:"휴대폰", name: "갤럭시", desc: "프리셋 내용", price: "25,000", date: "2025.01.12" },
  { id: 3, category:"전자시계", name: "갤럭시워치", desc: "CPU [모델 - X650 스냅드래곤]", price: "25,000", date: "2025.01.12" },
  { id: 4, category:"노트북", name: "맥북", desc: "CPU [모델 - X650 스냅드래곤]", price: "25,000", date: "2025.01.12" },
  { id: 5, category:"콘솔게임기", name: "콘솔게", desc: "CPU [모델 - X650 스냅드래곤]", price: "25,000", date: "2025.01.12" }
]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("제품명");
  const [isModalOpen, setIsModalOpen] = useState(false);//생성 모달 추가
  const [editingPreset, setEditingPreset] = useState(null); // 수정할 데이터

  const ITEMS_PER_PAGE = 5;
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // 검색 필터링
  const filteredList = items.filter(
    (item) => item.name.includes(search) || item.desc.includes(search)
  );

  // 페이지네이션
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // 목록 클릭 시
  const handleItemClick = (item) => {
    setEditingPreset(item); // 수정할 아이템 저장
    setIsModalOpen(true);
  };

  // 저장 시 - 새로 추가인지 수정인지 구분
  const handleSavePreset = (preset) => {
    if (editingPreset) {
      // 수정 모드
      setItems(items.map(it => it.id === editingPreset.id ? { ...it, ...preset } : it));
    } else {
      // 생성 모드
      const newItem = {
        id: items.length + 1,
        category: preset.category,
        name: preset.name,
        desc: preset.content,
        price: preset.price,
        date: new Date().toISOString().split("T")[0].replace(/-/g, ".")
      };
      setItems([...items, newItem]);
    }
    setEditingPreset(null); // 모드 초기화
  };

   // 삭제 함수
  const handleDeleteSelected = () => {
    setItems(items.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]); // 삭제 후 선택 초기화
  };
  // 체크박스 토글 함수
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };



  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
        {/* 제목 */}
        <h1 className="text-xl font-bold mb-6">프리셋 목록</h1>

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
            </select>
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-8 text-gray-500 text-sm border-b pb-2 mb-2">
          <div className="flex justify-center items-center font-semibold pl-5 col-span-1">체크박스</div>
          <div className="font-semibold pl-5 col-span-1">프리셋명</div>
          <div className="col-span-3 font-semibold pl-2">내용</div>
          <div className="font-semibold col-span-1">기본단가</div>
          <div className="font-semibold col-span-1">등록일시</div>
        </div>


        {/* 리스트 */}
      {currentItems.map((item) => (
        <div key={item.id} className="flex items-center mb-3 gap-4">
          {/* 체크박스 컬럼 - 독립된 div */}
          <div className="w-12 flex justify-center items-center">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={(e) => {
                e.stopPropagation(); // 체크박스 클릭 시 행 클릭 이벤트 방지
                toggleSelect(item.id);
              }}
            />
          </div>

          {/* 리스트 행 - 클릭 시 모달 열림 */}
          <div
            style={{ height: "99px" }}
            className={`grid grid-cols-5 items-center gap-4 p-4 rounded-xl border cursor-pointer flex-1 ${
              selectedIds.includes(item.id)
                ? "border-green-500 bg-green-50"
                : "border-gray-300"
            }`}
            onClick={() => handleItemClick(item)}
          >
            <div className="col-span-1 font-bold">{item.name}</div>
            <div className="col-span-2 text-gray-600">
              {item.desc.length > 20 ? item.desc.slice(0, 10) + "..." : item.desc}
            </div>
            <div className="col-span-1 font-semibold">{item.price}</div>
            <div className="col-span-1 text-gray-500">{item.date}</div>
          </div>
        </div>
      ))}

        {/* 빈 행 추가 */}
        {Array.from({ length: ITEMS_PER_PAGE - currentItems.length }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="grid grid-cols-5 items-center gap-4 mb-3 p-4 rounded-xl border border-transparent"
            style={{ visibility: "hidden" }}
          >
            <div className="col-span-2">&nbsp;</div>
            <div className="col-span-2">&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
        ))}

        {/* 삭제/생성 버튼 */}
        <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          onClick={() => {
            setEditingPreset(null);
            setIsModalOpen(true);
          }}
        >
          생성
        </button>
        <button
          type="button"
          className={`px-6 py-2 text-white rounded-md transition ${
            selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          삭제
        </button>
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
        <PresetModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPreset(null); }}
          onSubmit={handleSavePreset} //프리셋 추가
          initialData={editingPreset} //수정모달확인
        />
      )}
    </div>
  );
};

export default PresetList;
