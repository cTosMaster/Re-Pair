import React from 'react';

const PasswordModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
    const handleConfirm = () => {
    onClose();       // 현재 모달 닫기
    onConfirm();     // 다음 모달 열기
  };
    
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[607px] h-[343px] shadow-xl text-center flex flex-col">
        <h2 className="text-xl font-semibold flex-grow flex items-center justify-center">정말로 변경하시겠습니까?</h2>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onClose}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      style={{width: "260px"}}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
                      className="px-4 py-2 bg-[#9fc87b] text-white rounded-lg hover:bg-[#85b168]"
                      style={{width: "260px"}}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
