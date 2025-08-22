import React, { useState } from "react";

const RequestManageDeleteModal = ({ onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    // onConfirm 호출 시 사유도 함께 전달
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] h-[400px] flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4">
            정말 수리를 취소하시겠습니까?
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            수리 취소 시 관련 정보가 모두 삭제됩니다.
          </p>

          <label className="block text-sm font-semibold mb-2">
            취소사유:
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="취소 사유를 입력하세요"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9FC97B]"
            rows={4}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-700"
            style={{ width: "120px", height: "36px" }}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded bg-[#9FC97B] text-white"
            style={{ width: "120px", height: "36px" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestManageDeleteModal;
