import { useState } from "react";
import { useParams } from "react-router-dom";
import { rejectRepairRequest } from "../../../services/customerAPI";

function RejectReasonModal({ visible, onClose }) {
  const { requestId } = useParams();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await rejectRepairRequest(requestId, { reason });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("반려 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.1)] bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* 입력창 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">취소 사유</label>
          <textarea
            rows="5"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none placeholder:text-gray-400"
            placeholder="취소 사유를 입력해주세요."
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71] disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
          >
            {submitting ? "처리 중..." : "확인"}
          </button>
          <button
            className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectReasonModal;