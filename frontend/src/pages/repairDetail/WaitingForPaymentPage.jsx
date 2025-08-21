import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import PaymentButton from "../../components/repairdetail/waitingforpayment/PaymentButton";
import { CommonUse } from "./commonUse";
import RejectReasonModal from "../../components/repairdetail/pendingapproval/RejectReasonModal";
import { useState } from "react";

function WaitingForPaymentPage() {
  const { requestId, role, repair, finalEstimateData, reason } = CommonUse();

  const handlePayment = () => {
    alert("결제 버튼 클릭됨");
  };

  const { statusCode, isCancelled } = repair;
  const [showRejectModal, setShowRejectModal] = useState(false);

  const currentStep = RepairStatusMap["WAITING_FOR_PAYMENT"];
  const userStep = RepairStatusMap[statusCode];
  const isPastStep = userStep > currentStep;

  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
          <FinalEstimatePreview estimate={finalEstimateData} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <FinalEstimatePreview estimate={finalEstimateData} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
              />
              <FinalEstimatePreview estimate={finalEstimateData} />
              <PaymentButton
                onClick={handlePayment}
                disabled={false}
                requestId={requestId}
              />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
              />
              <div className="flex items-center justify-center text-gray-600 text-sm text-center py-6">
                현재 결제 대기중입니다.
                <br />
              </div>
              <button
                className="block mx-auto px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
                onClick={() => setShowRejectModal(true)}
              >
                반려
              </button>
              <RejectReasonModal
                visible={showRejectModal}
                onClose={() => setShowRejectModal(false)}
              />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
              />
              <div className="flex items-center justify-center text-gray-600 text-sm text-center py-6">
                현재 결제 대기중입니다.
                <br />
              </div>
              <button
                className="block mx-auto px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
                onClick={() => setShowRejectModal(true)}
              >
                반려
              </button>
              <RejectReasonModal
                visible={showRejectModal}
                onClose={() => setShowRejectModal(false)}
              />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
              />
              <div className="flex items-center justify-center text-gray-600 text-sm text-center py-6 ">
                현재 결제 대기중입니다.
                <br />
              </div>
              <button
                className="block mx-auto px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2]"
                onClick={() => setShowRejectModal(true)}
              >
                반려
              </button>
              <RejectReasonModal
                visible={showRejectModal}
                onClose={() => setShowRejectModal(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForPaymentPage;
