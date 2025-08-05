import React, { useState } from "react";
import PasswordModal from "../modal/PasswordModal";
import PasswordResultModal from "../modal/PasswordResultModal";

export const ResetPasswordPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); //1차 모달
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); //2차 모달


  //비밀번호 뱐경 후 확인 모달창 
  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 처리 로직 (예: API 호출)
    // 성공하면 모달 띄우기
    setIsModalOpen(true);
  };


    return (
      

    <div className="flex items-center justify-center w-full min-h-screen bg-white">
            <div className="relative w-full max-w-[900px] bg-white px-6 mx-auto">
        {/* 로고 - 폼 안에 위치 */}
            <h2
            className="fixed top-4 left-16 text-[#9fc87b] font-bold text-xl md:text-2xl"
            style={{
                fontFamily: "Inter, Helvetica",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "#9fc87b",
                margin: 0,
                backgroundColor: "transparent",
                zIndex: 9999,
            }}
            >
            Re:pair
            </h2>


        {/* 제목 */}
        <h1
          className="text-black font-normal text-3xl mb-16 mt-16"
          style={{ fontFamily: "Inter, Helvetica" }}
        >
          비밀번호 재설정
        </h1>

        {/* 이메일 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="emailinput"
        >
          이메일 
        </label>

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



        {/* 인증코드 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="authemailcode"
        >
          인증코드
        </label>

        {/* 인증코드 입력 */}
        <input
          id="authemailcode"
          type="text"
          placeholder="인증코드를 입력하세요"
                  className="w-full h-12 mb-8 rounded-lg border border-gray-300 px-4"
                  style={{ width: '492px' }}
        />

        {/* 새 비밀번호 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="newpassword"
        >
          새 비밀번호
        </label>

        {/*  새 비밀번호 입력 */}
        <input
          id="newpassword"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
                  className="w-full h-12 mb-8 rounded-lg border border-gray-300 px-4"
                  style={{ width: '492px' }}
        />

        {/* 새 비밀번호 확인 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="newpasswordcheck"
        >
          새 비밀번호 확인
        </label>

        {/*  새 비밀번호 확인 입력 */}
        <input
          id="newpasswordcheck"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
                  className="w-full h-12 mb-8 rounded-lg border border-gray-300 px-4"
                  style={{ width: '492px' }}
        />
       

        {/* 등록하기 버튼 */}
          <button
            onClick={handlePasswordChange}
            className="w-full bg-[#9fc87b] rounded-lg h-12 mb-10 font-bold text-white text-lg mt-6"
          style={{ width: "492px" }}>
            비밀번호 변경하기
        </button>

       {/* 1차 모달창 */}
        <PasswordModal
          isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => setIsResultModalOpen(true)}
          />
        {/* 2차 모달창 */}  
          <PasswordResultModal
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
          />
      </div>
    </div>
    
  );
};
export default ResetPasswordPage;