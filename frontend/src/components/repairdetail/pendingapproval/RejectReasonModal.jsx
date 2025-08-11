function RejectReasonModal({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.1)] bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* 입력창 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">취소 사유</label>
          <textarea
            rows="5"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none placeholder:text-gray-400"
            placeholder="수리 내용을 상세히 작성해주세요."
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4">
          <button className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71]">
            확인
          </button>
          <button
            className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectReasonModal;