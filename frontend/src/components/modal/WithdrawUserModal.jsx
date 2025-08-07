import React from "react";

const WithdrawUserModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[360px]">
        <h2 className="text-lg font-bold mb-4">정말 탈퇴하시겠습니까?</h2>
        <p className="mb-6 text-sm text-gray-600">
          탈퇴하시면 계정 정보가 모두 삭제됩니다.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-700"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawUserModal;
