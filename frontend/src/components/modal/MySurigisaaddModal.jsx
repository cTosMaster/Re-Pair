import React, { useState } from "react";

const MySurigisaaddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(
    initialData || { name: "", phone: "", email: "", date: "", status: "수리대기" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 bg-black/50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[540px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {initialData ? "수리기사 수정" : "수리기사 등록"}
          </h1>
        </div>

        <form className="space-y-5">
          {/* 이름 */}
          <div>
            <label className="block mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>
          
            {/* 아이디 */}
          <div>
            <label className="block mb-1">
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

        {/*  비밀번호 */}
          <div>
            <label className="block mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

        {/* 비밀번호 확인 */}
          <div>
            <label className="block mb-1">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

                  
          {/* 연락처 */}
          <div>
            <label className="block mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 rounded-lg font-semibold"
              style={{ width: "240px", height: "48px" }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => onSubmit(form)}
              className="bg-[#a3cd7f] text-white rounded-lg font-bold"
              style={{ width: "240px", height: "48px" }}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MySurigisaaddModal;
