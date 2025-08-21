import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RejectReasonModal from "./RejectReasonModal";
import { segmentForStatus } from "../../../routes/statusRoute";
import { acceptRepairRequest } from "../../../services/customerAPI";

function ApprovalActions({ engineerId }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();
  const { requestId } = useParams();

  const handleAccept = async () => {
    try {
      await acceptRepairRequest(requestId, { engineerId });
      const nextSeg = segmentForStatus("WAITING_FOR_REPAIR");
      navigate(`/repair-requests/${requestId}/${nextSeg}`);
    } catch (err) {
      console.error(err);
      alert("승인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative mt-8">
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71]"
          onClick={handleAccept}
          disabled={!engineerId}
        >
          승인
        </button>
        <button
          className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
          onClick={() => setShowRejectModal(true)}
        >
          반려
        </button>
      </div>

      <RejectReasonModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      />
    </div>
  );
}

export default ApprovalActions;