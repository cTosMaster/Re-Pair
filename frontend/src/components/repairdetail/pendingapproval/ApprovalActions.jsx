import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptRepairRequest, rejectRepairRequest } from "../../../services/customerAPI";
import { segmentForStatus } from "../../../routes/statusRoute";
import RejectReasonModal from "./RejectReasonModal"; // visible, submitting, onClose, onSubmit(reason) 가정

/**
 * 상세보기 경로 예: /repair-requests/:id/pending-approval
 * - 일부 라우팅에서 파라미터명이 requestId일 수도 있어 둘 다 대응
 */
function ApprovalActions() {
  const navigate = useNavigate();
  const params = useParams();
  const requestId = params.id ?? params.requestId; // URL 파라미터에서 획득
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = useCallback(async () => {
    if (!requestId) {
      alert("요청 ID를 찾을 수 없습니다.");
      return;
    }
    if (!window.confirm("이 요청을 승인할까요?")) return;

    setSubmitting(true);
    try {
      // 필요 시 payload 추가 가능: { note, approvedBy, ... }
      await acceptRepairRequest(requestId, {});
      // 승인 후 다음 단계(수리대기) 화면으로 이동
      const nextSeg = segmentForStatus("WAITING_FOR_REPAIR");
      navigate(`/repair-requests/${encodeURIComponent(requestId)}/${nextSeg}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("승인 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }, [requestId, navigate]);

  const handleRejectOpen = useCallback(() => {
    if (!requestId) {
      alert("요청 ID를 찾을 수 없습니다.");
      return;
    }
    setShowRejectModal(true);
  }, [requestId]);

  const handleRejectSubmit = useCallback(
    async (reason) => {
      if (!requestId) return;

      setSubmitting(true);
      try {
        await rejectRepairRequest(requestId, { reason: reason.trim() });
        setShowRejectModal(false);
        // 반려 후 목록으로 복귀 (히스토리가 없으면 안전 경로로)
        try {
          navigate(-1);
        } catch {
          navigate("/repair-requests"); // 안전 경로
        }
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
      {/* 승인 / 반려 버튼 */}
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71] disabled:opacity-50"
          onClick={handleAccept}
          disabled={!requestId || submitting}
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

      {/* 반려 사유 모달 */}
      <RejectReasonModal
        visible={showRejectModal}
        submitting={submitting}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleRejectSubmit} // (reason) => void
      />
    </div>
  );
}

export default ApprovalActions;