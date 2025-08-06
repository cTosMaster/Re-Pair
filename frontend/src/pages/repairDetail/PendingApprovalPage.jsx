import { useState } from "react";
import RepairProgress from "../../components/RepairProgress";
import RepairRequestForm from "../../components/RepairRequestForm";
import RepairEngineerSelector from "../../components/RepairEngineerSelector";
import { RepairStatusMap } from "../../constants/repairStatus";

function PendingApprovalPage() {
  // 🧪 테스트용 사용자 권한 및 상태 코드
  const role = "CUSTOMER"; // "USER" | "ENGINEER" | "CUSTOMER"
  const statusCode = "PENDING_APPROVAL"; // "PENDING_APPROVAL" | "WAITING_FOR_REPAIR" | ...

  // 현재 스텝 (숫자)
  const step = RepairStatusMap[statusCode];

  // 조건 계산
  const isUser = role === "USER";
  const isStepBeyondPending = step > RepairStatusMap.PENDING_APPROVAL;
  const showOnlyStepperAndText = isUser && !isStepBeyondPending;

  // 더미 수리 요청 데이터
  const dummyRequestData = {
    title: "시계 수리",
    productName: "시계",
    phone: "010-1234-1234",
    zipCode: "12345",
    address: "서울시 어딘가",
    content: "줄 좀 조여주세요",
  };

  // 더미 수리기사 목록
  const engineerList = [
    { id: 1, name: "김진수", email: "jinsoo@example.com", phone: "010-1234-5678", assigned: false },
    { id: 2, name: "박소연", email: "soyeon@example.com", phone: "010-9876-5432", assigned: true },
    { id: 3, name: "최영희", email: "younghee@example.com", phone: "010-2345-6789", assigned: false },
    { id: 4, name: "이민호", email: "minho@example.com", phone: "010-3456-7890", assigned: false },
    { id: 5, name: "장서윤", email: "seoyoon@example.com", phone: "010-4567-8901", assigned: true },
    { id: 6, name: "백현우", email: "hyunwoo@example.com", phone: "010-5678-9012", assigned: false },
    { id: 7, name: "정예린", email: "yerin@example.com", phone: "010-6789-0123", assigned: false },
    { id: 8, name: "윤재호", email: "jaeho@example.com", phone: "010-7890-1234", assigned: true },
    { id: 9, name: "서하준", email: "hajoon@example.com", phone: "010-8901-2345", assigned: false },
    { id: 10, name: "노지민", email: "jimin@example.com", phone: "010-9012-3456", assigned: false },
    { id: 11, name: "오태현", email: "taehyun@example.com", phone: "010-0123-4567", assigned: true },
  ];

  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="p-6 space-y-6">

      {/* ✅ Stepper는 항상 표시 */}
      <RepairProgress statusCode={statusCode} />

      {/* ✅ USER이면서 접수 상태일 때만 안내 문구 */}
      {showOnlyStepperAndText ? (
        <p className="text-center text-gray-600 mt-8">접수 대기중입니다.</p>
      ) : (
        <>
          {/* ✅ 모든 역할, 모든 상태에서 수리 요청서는 표시 */}
          <RepairRequestForm requestData={dummyRequestData} />

          {/* ✅ 접수 상태일 때만 수리기사 선택 & 버튼 노출 */}
          {!isStepBeyondPending && (
            <>
              <RepairEngineerSelector
                engineers={engineerList}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

              <div>
                <button
                  className="block w-fit mx-auto mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  다음으로
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PendingApprovalPage;