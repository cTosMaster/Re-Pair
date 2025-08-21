import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import SelectedEngineerCard from "../../components/repairdetail/common/SelectedEngineerCard";
import FinalEstimateForm from "../../components/repairdetail/inprogress/FinalEstimateForm";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import { CommonUse } from "./commonUse";

function InProgressPage() {
  const {
    requestId,
    role,
    repair,
    engineer,
    selectedPresets,
    finalEstimateDummy,
    finalEstimateData,
    reason,
  } = CommonUse();

  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["IN_PROGRESS"];
  const userStep = RepairStatusMap[statusCode];
  const isPastStep = userStep > currentStep;

  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="text-gray-600">
          {/* 과거 진행 요약 정보 컴포넌트 삽입 위치 */}
          <RepairProgress
            statusCode={statusCode}
            isCancelled={isCancelled}
            requestId={requestId}
          />
          <FinalEstimatePreview estimate={finalEstimateData} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          {/* 취소 상태용 컴포넌트 삽입 위치 */}
          <RepairProgress
            statusCode={statusCode}
            isCancelled={true}
            requestId={requestId}
          />
          <FinalEstimatePreview estimate={finalEstimateData} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}
              />
              <div className="flex items-center justify-center text-gray-600 text-sm text-center py-6">
                현재 고객님의 물품에 대한 수리를 진행중입니다.<br />
              </div>
              <SelectedEngineerCard engineer={engineer} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}
              />
              {finalEstimateDummy && (
                <FinalEstimateForm
                  requestId={requestId}
                  initialEstimate={finalEstimateDummy}
                  presetList={selectedPresets}
                />
              )}
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}
              />
              {finalEstimateDummy && (
                <FinalEstimateForm
                  requestId={requestId}
                  initialEstimate={finalEstimateDummy}
                  presetList={selectedPresets}
                />
              )}
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}
              />
              {finalEstimateDummy && (
                <FinalEstimateForm
                  requestId={requestId}
                  initialEstimate={finalEstimateDummy}
                  presetList={selectedPresets}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InProgressPage;