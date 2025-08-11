import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import { dummyUser } from "./dummyUser";
import FinalEstimateEditor from "../../components/repairdetail/waitingforpayment/FinalEstimateEditor";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import PaymentButton from "../../components/repairdetail/waitingforpayment/PaymentButton";

function WaitingForPaymentPage() {
  const userData = {
    role: dummyUser.role, // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: dummyUser.repair.statusCode, // 수리 상태코드
      isCancelled: dummyUser.repair.isCancelled, // 취소 여부
    },
  };

  const lastSaved = {
    presets: [
      { id: 1, name: "액정 교체", price: 120000 },
      { id: 2, name: "배터리 교체", price: 60000 },
    ],
    extraNote: "힌지 소음 확인 및 윤활.",
    extraCost: "20,000", // 문자열/숫자 아무거나 OK
    beforeImgs: [
      { id: "b1", url: "https://via.placeholder.com/150?text=Before1" },
      { id: "b2", url: "https://via.placeholder.com/150?text=Before2" },
    ],
    afterImgs: [
      { id: "a1", url: "https://via.placeholder.com/150?text=After1" },
    ],
  };

  const presetList = [
    { id: 3, name: "힌지 수리", price: 30000 },
    { id: 4, name: "키보드 교체", price: 70000 },
  ];

  const finalEstimateData = {
    presets: [
      { id: 1, name: "부품 교체", price: 50000 },
      { id: 2, name: "청소 서비스", price: 20000 },
    ],
    extraNote: "추가로 내부 먼지 제거 작업 진행.\n고객 요청으로 케이스 청소 포함.",
    totalPrice: 75000,
    beforeImages: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
    afterImages: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
  };

  const handlePayment = () => {
    alert("결제 버튼 클릭됨");
  };

  const reason = {
    message: "요청 내용이 불분명하여 수리를 진행할 수 없습니다.",
  };

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

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
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimatePreview estimate={finalEstimateData} />
              <PaymentButton onClick={handlePayment} disabled={false} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForPaymentPage;