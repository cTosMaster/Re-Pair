import React, { useState,useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEngineer } from "../../services/customerAPI";



const MySurigisaaddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

    // initialData 변경 시 form에 반영
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",           // 비밀번호는 보안상 빈 값 유지
        passwordConfirm: "",
        phone: initialData.phone || "",
        registeredAt: initialData.registeredAt || new Date().toISOString().split("T")[0], // ISO → YYYY-MM-DD
      });
    } else {
      // 등록 모드일 때 초기화
      setForm({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        phone: "",
        registeredAt: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // 필수 입력 체크
    if (!form.name || !form.email || !form.phone || !form.password || !form.passwordConfirm) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 테스트용 임의 customerId 지정
      await createEngineer({
        customerId : user.customerId,
        name: form.name,
        email: form.email,
        password: form.password,
        passwordcheck: form.passwordConfirm,
        phone: form.phone,
      });

      alert("수리기사가 성공적으로 등록되었습니다.");
      if (onSubmit) onSubmit(); // 목록 갱신
      onClose();
    } catch (error) {
      console.error("수리기사 등록 실패:", error);
      alert("등록에 실패했습니다.");
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[540px]">
        <h1 className="text-2xl font-semibold mb-6">수리기사 등록</h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block mb-1">이름 *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">이메일 *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">비밀번호 *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">비밀번호 확인 *</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">연락처 *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 rounded-lg font-semibold"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#a3cd7f] text-white rounded-lg font-bold"
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
