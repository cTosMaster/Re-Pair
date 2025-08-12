import React, { useState, useEffect } from "react";

const MySurigisaaddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(
  initialData || {
    name: "",
    userId: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    status: "수리대기",
  }
  );
  const [isEditMode, setIsEditMode] = useState(!initialData); // 초기 등록이면 편집 모드, 아니면 읽기 모드

  // initialData가 바뀔 때마다 form 상태 초기화
 useEffect(() => {
  if (initialData) {
    setForm(initialData);
    setIsEditMode(false);  // 수정 모드 아님 (읽기 전용)
  } else {
    setForm({
      name: "",
      userId: "",
      email: "",
      password: "",
      passwordConfirm: "",
      phone: "",
      status: "수리대기",
    });
    setIsEditMode(true);  // 신규 등록 시에는 수정 모드로 시작
  }
}, [initialData]);

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
          {initialData && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="text-green-600 font-semibold hover:underline"
            >
              수정
            </button>
          )}
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
              readOnly={!isEditMode}
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
              name="userId"
              value={form.userId}
              onChange={handleChange}
              readOnly={!!initialData} //수정불가
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
              readOnly={!isEditMode}
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
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              readOnly={!!initialData} //수정불가
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
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              readOnly={!!initialData} //수정불가
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
              readOnly={!isEditMode}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
          </div>

          {/* 수리 상태 */}
          <div>
            <label className="block mb-1">
              수리 상태 <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            >
              <option value="수리대기">수리대기</option>
              <option value="수리중">수리중</option>
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) {
                  // 수정 중일 때 취소 누르면 읽기 모드로 돌아가고 원래 값 복원
                  setForm(initialData);
                  setIsEditMode(false);
                } else {
                  onClose();
                }
              }}
              className="bg-gray-300 text-gray-700 rounded-lg font-semibold"
              style={{ width: "240px", height: "48px" }}
            >
              {isEditMode ? "취소" : "닫기"}
            </button>
            <button
              type="button"
              onClick={() => {
                  onSubmit(form);
                  setIsEditMode(false);
                }}
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
