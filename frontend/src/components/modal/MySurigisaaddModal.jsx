import React, { useState, useEffect } from "react";
import { createEngineer } from "../../services/customerAPI"; // API 모듈
import { useAuth } from "../../hooks/useAuth";

const MySurigisaaddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    status: "수리대기",
  });

  const [isEditMode, setIsEditMode] = useState(true);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        passwordConfirm: "",
        phone: initialData.phone || "",
        status: initialData.status || "수리대기",
      });
      setIsEditMode(false);
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        phone: "",
        status: "수리대기",
      });
      setIsEditMode(true);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const handleSave = async () => {
  if (!form.name || !form.email || !form.phone || !form.password || !form.passwordConfirm) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  if (form.password !== form.passwordConfirm) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    await createEngineer({
      customerId: user.customerId, // 로그인한 사용자의 customerId 사용
      name: form.name,
      email: form.email,
      password: form.password,
      passwordcheck: form.passwordConfirm,
      phone: form.phone,
    });

    alert("수리기사가 성공적으로 등록되었습니다.");
    if (onSubmit) onSubmit(); // 부모 컴포넌트 목록 갱신
    onClose();
  } catch (error) {
    console.error("수리기사 등록 실패:", error);
    alert("등록에 실패했습니다.");
  }
};
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[540px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {initialData ? "수리기사 수정" : "수리기사 등록"}
          </h1>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* 이름 */}
          <div>
            <label className="block mb-1">이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              readOnly={!isEditMode}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block mb-1">이메일 <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly={!isEditMode}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-1">비밀번호 <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              readOnly={!!initialData}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block mb-1">비밀번호 확인 <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              readOnly={!!initialData}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block mb-1">연락처 <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              readOnly={!isEditMode}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 rounded-lg font-semibold"
            >
              닫기
            </button>
            {!initialData && (
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#a3cd7f] text-white rounded-lg font-bold"
              >
                저장
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MySurigisaaddModal;
