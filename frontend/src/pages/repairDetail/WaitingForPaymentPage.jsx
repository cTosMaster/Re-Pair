import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";

function WaitingForPaymentPage() {
  const userData = {
    role: "CUSTOMER", // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: "IN_PROGRESS", // 수리 상태코드
      isCancelled: false,             // 취소 여부
    },
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
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-4">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-4">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForPaymentPage;