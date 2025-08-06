import { useState } from "react";
import RepairProgress from "../../components/RepairProgress";
import FirstEstimateForm from "../../components/FirstEstimateForm";
import { RepairStatusMap } from "../../constants/repairStatus";

function WaitingForRepairPage() {
  // 🧪 테스트용 데이터
  const role = "CUSTOMER"; // "CUSTOMER" | "ENGINEER" | "USER"
  const statusCode = "WAITING_FOR_REPAIR"; // 상태 코드

  const step = RepairStatusMap[statusCode];
  const isUser = role === "USER";
  const isBeyondWaiting = step > RepairStatusMap.WAITING_FOR_REPAIR;
  const readOnly = isBeyondWaiting; // ✅ 상태 기준으로 readOnly 여부 결정

  const presetOptions = [
    { id: 1, name: "갤럭시 CPU", price: 80000 },
    { id: 2, name: "갤럭시 RAM F512", price: 50000 },
    { id: 3, name: "배터리 교체", price: 30000 },
  ];

  const [estimateData, setEstimateData] = useState(null);

  const handleEstimateSubmit = (data) => {
    setEstimateData(data);
    console.log("제출된 견적서:", data);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">수리 대기</h2>

      {/* ✅ Stepper는 항상 표시 */}
      <RepairProgress statusCode={statusCode} />

      {/* ✅ USER: 메시지만 표시 */}
      {isUser && !isBeyondWaiting ? (
        <div className="text-center text-gray-600 mt-8">
          현재 고객님의 물품의 1차 견적을 작성중입니다.
          <br />
          추가로 수리기사와 유선 상담이 있을 예정입니다.
        </div>
      ) : (
        <>
          {/* ✅ 모든 역할에서 견적서 폼 표시, 단 수정 가능 여부는 상태에 따라 결정 */}
          <FirstEstimateForm
            presetOptions={presetOptions}
            onSubmit={handleEstimateSubmit}
            readOnly={readOnly}
          />

          {/* ✅ 상태가 수리 대기 이하일 때만 버튼 표시 */}
          {!isBeyondWaiting && (
            <div>
              <button
                onClick={() => handleEstimateSubmit(estimateData)}
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

export default WaitingForRepairPage;