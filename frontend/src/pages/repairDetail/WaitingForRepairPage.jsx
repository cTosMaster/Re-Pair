import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FirstEstimateForm from "../../components/repairdetail/waitingforrepair/FirstEstimateForm";
import SelectedEngineerCard from "../../components/repairdetail/waitingforrepair/SelectedEngineerCard";
import FirstEstimatePreview from "../../components/repairdetail/waitingforrepair/FirstEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import { dummyUser } from "./dummyUser";

function WaitingForRepairPage() {
  const userData = {
    role: dummyUser.role, // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: dummyUser.repair.statusCode, // 수리 상태코드
      isCancelled: dummyUser.repair.isCancelled,             // 취소 여부
    },
  };

  const presetList = [
    { id: 1, name: "메인보드 교체", price: 50000 },
    { id: 2, name: "액정 교체", price: 80000 },
    { id: 3, name: "배터리 교체", price: 30000 },
    { id: 4, name: "하우징 교체", price: 40000 },
  ];

  const selectedEngineer = {
    name: "김두수리",
    email: "kimdoc@example.com",
    phone: "010-1234-1234",
    dateText: "2025.06.01",
    profileImage: "", // 없으면 기본 이모지
  };

  const dummyEstimate = {
    createdAt: "2025-08-08 14:30",
    presets: [
      { id: 1, name: "액정 교체", price: 120000 },
      { id: 2, name: "배터리 교체", price: 60000 },
      { id: 3, name: "힌지 수리", price: 30000 },
    ],
    extraNote: "힌지 마찰 소음이 심해 윤활 처리를 진행 예정입니다. 추가금액 3000원",
    totalPrice: 210000, // 프리셋 가격 합계로 계산된 값
  };

  const reason = {
    message: "요청 내용이 불분명하여 수리를 진행할 수 없습니다.",
  };

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["WAITING_FOR_REPAIR"];
  const userStep = RepairStatusMap[statusCode];
  const isPastStep = userStep > currentStep;

  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="text-center text-gray-600 mt-8">
          {/* 과거 진행 요약 정보 컴포넌트 삽입 위치 */}
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
          <FirstEstimatePreview estimate={dummyEstimate} />
          <SelectedEngineerCard engineer={selectedEngineer} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-4">
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <FirstEstimatePreview estimate={dummyEstimate} />
          <SelectedEngineerCard engineer={selectedEngineer} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-4">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                현재 고객님의 물품에 대한 1차 견적을 작성중입니다.<br />
                추가로 수리기사와 유선 상담이 있을 예정입니다.
              </div>
              <SelectedEngineerCard engineer={selectedEngineer} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-4">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm presetList={presetList} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm presetList={presetList} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm presetList={presetList} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForRepairPage;