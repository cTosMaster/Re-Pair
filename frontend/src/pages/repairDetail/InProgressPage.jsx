import RepairProgress from "../../components/RepairProgress";
import FinalEstimateForm from "../../components/FinalEstimateForm";
import AssignedEngineerInfo from "../../components/AssignedEngineerInfo";
import { RepairStatusMap } from "../../constants/repairStatus";

function InProgressPage() {
  const role = "CUSTOMER"; // "USER" | "CUSTOMER" | "ENGINEER"
  const statusCode = "IN_PROGRESS";
  const step = RepairStatusMap[statusCode];

  const isUser = role === "USER";
  const isAfterInProgress = step > RepairStatusMap.IN_PROGRESS;

  // 🧪 더미 데이터 예시 (읽기 전용 모드에서 사용 가능)
  const finalEstimateDummyData = {
    product: "갤럭시 S7",
    engineer: "김독수리",
    phone: "010-1234-1234",
    content: "이어폰 커넥터 헐거움 / 스피커 먼지 청소",
    price: "120,000 원",
    date: "2025.08.06",
  };

  const handleSubmit = () => {
    console.log("최종 견적서 제출됨 (UI Only)");
  };

  return (
    <div className="p-6 space-y-6">
      <RepairProgress statusCode={statusCode} />

      {isUser && !isAfterInProgress ? (
        <div className="text-center text-gray-600 mt-8 space-y-4">
          <div>
            현재 고객님의 물품을 수리 중입니다.
            <br />
            잠시만 기다려 주세요.
          </div>
          <AssignedEngineerInfo name="김진수" phone="010-1234-5678" />
        </div>
      ) : (
        <>
          <FinalEstimateForm initialData={finalEstimateDummyData} />

          {!isAfterInProgress && (
            <div>
              <button
                onClick={handleSubmit}
                className="block w-fit mx-auto mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                제출
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InProgressPage;