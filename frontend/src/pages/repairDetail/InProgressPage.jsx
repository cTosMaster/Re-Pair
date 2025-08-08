import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import { dummyUser } from "./dummyUser";
import FinalEstimateForm from "../../components/repairdetail/inprogress/FinalEstimateForm";
import FinalEstimatePreview from "../../components/repairdetail/inprogress/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

function InProgressPage() {
  const userData = {
    role: dummyUser.role, // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: dummyUser.repair.statusCode, // 수리 상태코드
      isCancelled: dummyUser.repair.isCancelled,             // 취소 여부
    },
  };

 const finalEstimateDummy = {
    presets: [
      { id: 1, name: "메인보드 교체", price: 80000 },
      { id: 2, name: "팬 청소", price: 15000 },
    ],
    extraNote: "CPU 써멀 재도포 포함",
    extraCost: 20000,
    beforeImgs: [
      { id: "b1", url: "https://via.placeholder.com/150?text=Before1" },
      { id: "b2", url: "https://via.placeholder.com/150?text=Before2" },
    ],
    afterImgs: [
      { id: "a1", url: "https://via.placeholder.com/150?text=After1" },
    ],
  };

  const presetList = [
    { id: 3, name: "전원부 수리", price: 50000 },
    { id: 4, name: "케이블 정리", price: 10000 },
  ];

  const selectedEngineer = {
    name: "김두수리",
    email: "kimdoc@example.com",
    phone: "010-1234-1234",
    dateText: "2025.06.01",
    profileImage: "", // 없으면 기본 이모지
  };

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

  const reason = {
    message: "요청 내용이 불분명하여 수리를 진행할 수 없습니다.",
  };

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap[statusCode];
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
          <FinalEstimatePreview estimate={finalEstimateData} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-4">
          {/* 취소 상태용 컴포넌트 삽입 위치 */}
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <FinalEstimatePreview estimate={finalEstimateData} />
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
              <FinalEstimateForm
                initialEstimate={finalEstimateDummy}
                presetList={presetList}
              />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateForm
                initialEstimate={finalEstimateDummy}
                presetList={presetList}
              />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateForm
                initialEstimate={finalEstimateDummy}
                presetList={presetList}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InProgressPage;