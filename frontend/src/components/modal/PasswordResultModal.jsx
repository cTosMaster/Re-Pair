import React from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordResultModal = ({ isOpen, onClose, redirectPath }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;
    
    const handleClose = () => {
    onClose();         // 모달 상태 false로
    navigate(redirectPath);     // 홈으로 이동
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[607px] h-[343px] shadow-xl text-center flex flex-col">
        <h2 className="text-xl font-semibold flex-grow flex items-center justify-center">
          비밀번호가 성공적으로 변경되었습니다!
        </h2>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#9fc87b] text-white rounded-lg hover:bg-[#85b168]"
            style={{ width: "260px" }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResultModal;
