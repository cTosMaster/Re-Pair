import React from "react";
import { useNavigate } from "react-router-dom";

const SignUpModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleConfirm = () => {
    onClose();          // 모달 닫기
    navigate("/login");  // /home 경로로 이동
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[607px] h-[343px] shadow-xl flex flex-col">
        <div className="flex flex-col flex-grow justify-center">
          <h2 className="text-xl font-semibold text-center">회원가입 완료</h2>
          <p className="text-xl text-center mt-4">회원가입이 완료되었습니다.</p>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-[#9fc87b] text-white font-bold py-2 px-4 rounded hover:bg-[#8dbb6b]"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SignUpModal;
