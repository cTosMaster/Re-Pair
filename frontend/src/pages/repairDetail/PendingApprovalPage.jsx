import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import RepairRequestPreview from "../../components/repairdetail/pendingapproval/RepairRequestPreview";
import EngineerSelectList from "../../components/repairdetail/pendingapproval/EngineerSelectList";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import { CommonUse } from "./commonUse";

function PendingApprovalPage() {
  // 🔄 공통 데이터 훅에서 불러오기
  const {
    role,
    repair,
    categoryData,
    engineerList,
    reason,
  } = CommonUse();

  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["PENDING_APPROVAL"];
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
          <RepairRequestPreview categoryData={categoryData} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <RepairRequestPreview categoryData={categoryData} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                접수 대기 상태입니다.
              </div>
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData} />
              <EngineerSelectList engineerList={engineerList} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData} />
              <EngineerSelectList engineerList={engineerList} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PendingApprovalPage;