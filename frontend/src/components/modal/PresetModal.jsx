import React, { useState, useEffect } from "react";

const PresetModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    category: "",
    name: "",
    content: "",
    price: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        category: initialData.category || "",
        name: initialData.name || "",
        content: initialData.content || "",
        price: initialData.price || ""
      });
    } else {
      setForm({
        category: "",
        name: "",
        content: "",
        price: ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        <h1 className="text-2xl font-bold text-[#9fc87b]">Re:Pair</h1>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h1 className="text-2xl font-normal text-black mb-8">수리 상품 등록</h1>

        <label className="block text-black mb-2">카테고리</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4 bg-white"
        >
          <option value="">카테고리를 선택하세요</option>
          <option value="휴대폰">휴대폰</option>
          <option value="노트북">노트북</option>
          <option value="UMPC">UMPC</option>
          <option value="콘솔게임기">콘솔게임기</option>
          <option value="전자시계">전자시계</option>
        </select>

        <label className="block text-black mb-2">프리셋명</label>
        <input
          name="name"
          type="text"
          placeholder="제품명을 입력하세요"
          value={form.name}
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

        <label className="block text-black mb-2">프리셋 내용</label>
        <input
          name="content"
          type="text"
          placeholder="프리셋 내용을 입력하세요"
          value={form.content}
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

        <label className="block text-black mb-2">기본 단가</label>
        <input
          name="price"
          type="text"
          placeholder="기본 단가를 입력하세요"
          value={form.price}
          onChange={handleChange}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

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

export default PresetModal;
