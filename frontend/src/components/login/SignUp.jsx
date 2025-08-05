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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
        >이메일 <span className="text-red-500">*</span></label>
        {/* 이메일 입력 */}
          <div className="flex gap-2">
          <input
          id="emailinput"
          type="text"
          placeholder="이메일을 입력하세요"
                  className="w-full h-12 mb-8 rounded-[10px] border border-gray-300 px-4"
                  style={{ width: '395px' }}
        />
        {/* 이메일 인증 버튼 */}
          <button className="px-4 py-2 bg-gray-300 text-white rounded-[10px]"
            style={{ width: "89px", height:"48px" }} >
            인증
          </button>
        </div>
              

        {/* 인증코드 */}
        <input
          name="emailCode"
          type="text"
          placeholder="이메일 인증코드를 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

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
        <label className="block text-black mb-2">새 비밀번호<span className="text-red-500"> *</span></label>
        <input
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-6 border border-gray-300 rounded-lg px-4"
        />

        {/* 비밀번호 확인 */}
        <label className="block text-black mb-2">비밀번호 확인<span className="text-red-500"> *</span></label>
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
        <label className="block text-black mb-2">선택필수 <span className="text-red-500">*</span></label>
        <select
          name="selection"
          onChange={handleChange}
          className="w-full max-w-[492px] h-12 mb-10 border border-gray-300 rounded-lg px-4"
          defaultValue=""
        >
          <option value="" disabled>선택해주세요</option>
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
