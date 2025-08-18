import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptRepairRequest, rejectRepairRequest } from "../../../services/customerAPI";
import { segmentForStatus } from "../../../routes/statusRoute";
import RejectReasonModal from "./RejectReasonModal";

/**
 * @param {number|string|null} engineerId        선택한 기사 ID
 * @param {boolean}            requireEngineerId  고객처럼 기사 선택이 필수면 true
 */
function ApprovalActions({ engineerId, requireEngineerId = false }) {
  const navigate = useNavigate();
  const params = useParams();
  const requestId = params.id ?? params.requestId;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEngineerId = engineerId != null && engineerId !== "" && Number.isFinite(Number(engineerId));

  const handleAccept = useCallback(async () => {
    if (!requestId) return alert("요청 ID를 찾을 수 없습니다.");
    if (requireEngineerId && !isValidEngineerId) return alert("배정할 수리기사를 선택해주세요.");
    if (!window.confirm("이 요청을 승인할까요?")) return;

    setSubmitting(true);
    try {
      await acceptRepairRequest(requestId, {
        engineerId: isValidEngineerId ? Number(engineerId) : undefined,
      });
      const nextSeg = segmentForStatus("WAITING_FOR_REPAIR");
      navigate(`/repair-requests/${encodeURIComponent(requestId)}/${nextSeg}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("승인 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }, [requestId, engineerId, isValidEngineerId, requireEngineerId, navigate]);

  const handleRejectOpen = useCallback(() => {
    if (!requestId) return alert("요청 ID를 찾을 수 없습니다.");
    setShowRejectModal(true);
  }, [requestId]);

  const handleRejectSubmit = useCallback(
    async (reason) => {
      if (!requestId) return;
      const v = String(reason ?? "").trim();
      if (!v) return alert("반려 사유를 입력해주세요.");

      setSubmitting(true);
      try {
        await rejectRepairRequest(requestId, { reason: v });
        setShowRejectModal(false);
        navigate(-1);
      } catch (err) {
        console.error(err);
        alert("반려 처리 중 오류가 발생했습니다.");
      } finally {
        setSubmitting(false);
      }
    },
    [requestId, navigate]
  );

  return (
    <div className="relative mt-8">
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71] disabled:opacity-50"
          onClick={handleAccept}
          disabled={!requestId || submitting || (requireEngineerId && !isValidEngineerId)}
          title={requireEngineerId && !isValidEngineerId ? "배정할 수리기사를 선택해주세요." : undefined}
        >
          {submitting ? "처리 중..." : "승인"}
        </button>

        <button
          className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2] disabled:opacity-50"
          onClick={handleRejectOpen}
          disabled={!requestId || submitting}
        >
          반려
        </button>
      </div>

      <RejectReasonModal
        visible={showRejectModal}
        submitting={submitting}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}

export default ApprovalActions;