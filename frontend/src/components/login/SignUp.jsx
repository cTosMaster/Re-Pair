import React, { useState } from "react";
import SignUpModal from "../modal/SignUpModal";

const SignUpPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    emailCode: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    selection: ""
  });

  const [showModal, setShowModal] = useState(false); // 회원가입 성공 모달
  const [emailCodeStatus, setEmailCodeStatus] = useState(null); //이메일 인증 코드

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (e.target.name === "emailCode") {
      setEmailCodeStatus(null); // 인증코드 입력 시 상태 초기화
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 유효성 검사 및 회원가입 처리
    console.log(form);
    setShowModal(true); // 모달 열기
  };

  const handleCloseModal = () => {
    setShowModal(false); // 모달 닫기
  };

  const isEmailEntered = form.email.trim() !== ""; //이메일 인증 입력칸 비어있으면
  const isEmailCodeEntered = form.emailCode.trim() !== ""; //이메일 인증코드 부분 비어있으면

  const handleVerifyCode = () => {
    const correctCode = "123456"; // 예시로 고정된 코드 (실제 구현 시 백엔드 요청 필요)
    if (form.emailCode === correctCode) {
      setEmailCodeStatus("success");
    } else {
      setEmailCodeStatus("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-[900px] px-6">
        {/* 로고 */}
        <h2
          className="fixed top-4 left-16 text-[#9fc87b] font-bold text-2xl"
          style={{
            fontFamily: "Inter, Helvetica",
            WebkitTextStrokeWidth: "1px",
            WebkitTextStrokeColor: "#9fc87b",
            backgroundColor: "transparent",
            zIndex: 9999
          }}
        >
          Re:pair
        </h2>

        {/* 제목 */}
        <h1 className="text-3xl font-normal text-black mt-20 mb-10">회원가입</h1>

        {/* 이름 */}
        <label className="block text-black mb-2">이름</label>
        <input
          name="name"
          type="text"
          placeholder="이름을 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 이메일 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="emailinput"
        >
          이메일 <span className="text-red-500">*</span>
        </label>

        {/* 이메일 입력 & 버튼 */}
        <div className="flex gap-2">
          <input
            id="emailinput"
            name="email"
            type="text"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            className="w-full h-12 mb-8 rounded-[10px] border border-gray-300 px-4"
            style={{ width: "381px" }}
          />
          <button
            className={`rounded-[10px] px-4 py-2 text-white text-sm font-medium transition
              ${isEmailEntered ? "bg-[#9FC97B] hover:bg-[#73A647]" : "bg-gray-300 cursor-not-allowed"}`}
            style={{ width: "110px", height: "48px", fontSize: "14px" }}
            disabled={!isEmailEntered}
            onClick={() => console.log("인증코드 전송")}
          >
            인증코드 전송
          </button>
        </div>

        {/* 인증코드 */}
        <label className="block text-black font-normal text-lg mb-2">
          인증코드 <span className="text-red-500">*</span>
        </label>
        {/* 인증코드 입력칸  */}
          <div className="flex gap-2">
            <input
              name="emailCode"
              type="text"
              placeholder="이메일 인증코드를 입력하세요"
              onChange={handleChange}
              value={form.emailCode}
              className={`w-full max-w-[492px] h-12 mb-2 border rounded-lg px-4 ${
                emailCodeStatus === "success"
                  ? "border-green-500"
                  : emailCodeStatus === "error"
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              style={{ width: "381px" }}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={!isEmailCodeEntered}
              className={`px-4 py-2 rounded-[10px] text-white text-sm font-medium transition ${
                isEmailCodeEntered ? "bg-[#9FC97B] hover:bg-[#73A647]" : "bg-gray-300 cursor-not-allowed"
              }`}
              style={{ width: "110px", height: "48px", fontSize: "14px" }}
            >
              인증코드 확인
            </button>
          </div>
        {emailCodeStatus === "success" && (
          <p className="text-green-600 mb-4">인증되었습니다</p>
        )}
        {emailCodeStatus === "error" && (
          <p className="text-red-500 mb-4">잘못된 인증번호입니다</p>
        )}


        {/* 연락처 */}
        <label className="block text-black mb-2">연락처</label>
        <input
          name="phone"
          type="text"
          placeholder="연락처를 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 새 비밀번호 */}
        <label className="block text-black mb-2">
          새 비밀번호<span className="text-red-500"> *</span>
        </label>
        <input
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 비밀번호 확인 */}
        <label className="block text-black mb-2">
          비밀번호 확인<span className="text-red-500"> *</span>
        </label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 주소 */}
        <label className="block text-black mb-2">주소</label>
        <input
          name="address"
          type="text"
          placeholder="주소를 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 선택 필수 드롭다운 */}
        <label className="block text-black mb-2">
          선택필수 <span className="text-red-500">*</span>
        </label>
        <select
          name="selection"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-10 border border-gray-300 rounded-lg px-4"
          defaultValue=""
        >
          <option value="" disabled>
            선택해주세요
          </option>
          <option value="customer">일반 사용자</option>
          <option value="technician">고객사 관리자</option>
        </select>

        {/* 회원가입 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full max-w-[492px] h-12 bg-[#9fc87b] text-white font-bold rounded-lg"
        >
          회원가입
        </button>
      </div>

      {/* 회원가입 완료 모달 */}
      <SignUpModal isOpen={showModal} onClose={handleCloseModal} />
    </div>
  );
};

export default SignUpPage;
