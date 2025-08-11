import { useState } from "react";
import RejectReasonModal from "./RejectReasonModal"; // 나중에 이 컴포넌트를 내부에서 쓸 예정

function ApprovalActions() {
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <div className="relative mt-8">
      {/* 승인 / 반려 버튼 */}
      <div className="flex justify-center gap-4">
        <button className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71]">
          승인
        </button>
        <button
          className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
          onClick={() => setShowRejectModal(true)}
        >
          반려
        </button>
      </div>

      {/* 반려 모달 (내부에서 관리) */}
      <RejectReasonModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      />
    </div>
  );
}

export default ApprovalActions;