import React from "react";

const TermsModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-lg font-bold mb-4">약관 내용</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
        <div className="text-right mt-6">
          <button
            className="px-4 py-2 text-white bg-[#9FC97B] rounded hover:bg-[#73A647] transition"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;