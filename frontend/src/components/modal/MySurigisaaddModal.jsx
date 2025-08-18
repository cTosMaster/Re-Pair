import { useState } from "react";

const MySurigisaaddModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

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
    form.phone.trim().length === 11 && // 연락처는 11자리
    form.password.trim() &&
    form.passwordConfirm.trim() &&
    form.password === form.passwordConfirm;

  const handleSave = () => {
    if (!isFormValid) return;
    console.log("수리기사 등록 값:", form);
    alert("수리기사가 등록되었습니다. (API 연결 전)");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        {/* 닫기 버튼 (우측 상단) */}
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
            <label className="block mb-1">이름 *</label>
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
            <label className="block mb-1">이메일 *</label>
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
            <label className="block mb-1">연락처 *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={11}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="숫자 11자리를 입력하세요 (예: 01012345678)"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-1">비밀번호 *</label>
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
            <label className="block mb-1">비밀번호 확인 *</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {/* 등록하기 버튼 (전체 너비, 큰 버튼) */}
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