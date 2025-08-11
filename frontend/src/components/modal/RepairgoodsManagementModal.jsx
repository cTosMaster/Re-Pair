import React, { useState } from "react";

const RepairgoodsManagementModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    category: "",
    name: "",
    price: "",
    date: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 유효성 검사 및 저장 처리
    console.log(form);
    if (onSubmit) onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        <h1 className="text-2xl font-bold text-[#9fc87b]">Re:Pair</h1>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 제목 */}
        <h1 className="text-2xl font-normal text-black mb-8">
          수리 상품 등록
        </h1>

        {/* 카테고리 */}
        <label className="block text-black mb-2">카테고리</label>
        <select
        name="category"
        onChange={handleChange}
        className="w-full h-12 mb-6 border rounded-lg px-4 bg-white"
        >
        <option value="">카테고리를 선택하세요</option>
        <option value="휴대폰">휴대폰</option>
        <option value="노트북">노트북</option>
        <option value="가전제품">UMPC</option>
        <option value="가전제품">콘솔게임기</option>
        <option value="가전제품">전자시계</option>
        </select>

        {/* 제품명 */}
        <label className="block text-black mb-2">제품명</label>
        <input
          name="name"
          type="text"
          placeholder="제품명을 입력하세요"
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

        {/* 기본 단가 */}
        <label className="block text-black mb-2">기본 단가</label>
        <input
          name="price"
          type="number"
          placeholder="기본 단가를 입력하세요"
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

    

        {/* 저장 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#9fc87b] text-white font-bold rounded-lg"
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default RepairgoodsManagementModal;
