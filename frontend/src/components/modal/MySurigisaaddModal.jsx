import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEngineer } from "../../services/customerAPI";

const MySurigisaaddModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const initialForm = {
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  };

  const [form, setForm] = useState(initialForm);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // 연락처: 숫자만 허용 + 최대 11자리
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim().length === 11 &&
    form.password.trim() &&
    form.passwordConfirm.trim() &&
    form.password === form.passwordConfirm;

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      const payload = {
        customerId: user.customerId,   // ✅ DTO 요구
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        passwordcheck: form.passwordConfirm, // ✅ 백엔드 DTO 필드명에 맞춤
      };

      await createEngineer(payload);
      alert("수리기사가 성공적으로 등록되었습니다.");

      // ✅ 성공 시 폼 초기화
      setForm(initialForm);

      // 모달 닫기
      onClose();
    } catch (error) {
      console.error("수리기사 등록 실패:", error);
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 제목 */}
        <h1 className="text-2xl font-semibold text-black mb-8">수리기사 등록</h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* 이름 */}
          <div>
            <label className="block mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block mb-1">연락처</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={11}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="연락처를 입력하세요"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {/* 등록하기 버튼 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid}
            className={`w-full h-12 text-white font-bold rounded-lg transition ${
              isFormValid
                ? "bg-[#9fc87b] hover:brightness-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default MySurigisaaddModal;