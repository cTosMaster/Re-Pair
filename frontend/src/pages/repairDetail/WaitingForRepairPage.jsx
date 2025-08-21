import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FirstEstimateForm from "../../components/repairdetail/waitingforrepair/FirstEstimateForm";
import SelectedEngineerCard from "../../components/repairdetail/common/SelectedEngineerCard";
import FirstEstimatePreview from "../../components/repairdetail/waitingforrepair/FirstEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import { CommonUse } from "./commonUse";

function WaitingForRepairPage() {

  const {
    requestId,
    role,
    repair,
    estimate,
    engineer,
    reason,
    presetList
  } = CommonUse();

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
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
          <FirstEstimatePreview estimate={estimate} />
          <SelectedEngineerCard engineer={engineer} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <FirstEstimatePreview estimate={estimate} />
          <SelectedEngineerCard engineer={engineer} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                현재 고객님의 물품에 대한 1차 견적을 작성중입니다.<br />
                추가로 수리기사와 유선 상담이 있을 예정입니다.
              </div>
              <SelectedEngineerCard engineer={engineer} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm requestId={requestId} presetList={presetList} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm requestId={requestId} presetList={presetList} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FirstEstimateForm requestId={requestId} presetList={presetList} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForRepairPage;