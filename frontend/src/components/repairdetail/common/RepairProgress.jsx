import { useNavigate, useParams } from "react-router-dom";
import { RepairStepLabels, RepairStatusMap } from "../../../constants/repairStatus";
import Header from "../../../layouts/Header";

function RepairProgress({ statusCode, isCancelled = false }) {
  const currentStep = RepairStatusMap[statusCode];
  const totalSteps = RepairStepLabels.length;
  const navigate = useNavigate();

  const { requestId: _rid } = useParams();
  const requestId = _rid ?? "";

  // 각 스텝별 이동 경로 정의
  const stepRoutes = [
    `/repair-requests/${requestId}/pending-approval`,
    `/repair-requests/${requestId}/waiting-for-repair`,
    `/repair-requests/${requestId}/in-progress`,
    `/repair-requests/${requestId}/waiting-for-payment`,
    `/repair-requests/${requestId}/waiting-for-delivery`,
    `/repair-requests/${requestId}/completed`,
  ];

  return (
    <div>
      {/* Header: 위쪽 여백 줄이기 */}
      <div className="mt-[-24px]">
        <Header />
      </div>

      {/* ProgressBar: Header랑 더 떨어지게 margin-top 추가 */}
      <div className="bg-white shadow-md rounded-xl py-2 px-8 w-full max-w-4xl mx-auto overflow-hidden mt-6">
        <div className="relative h-20 w-full flex items-center">
          {/* 막대기 */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 z-0 -translate-y-1/2" />

          {/* 동그라미와 상태 텍스트 */}
          {RepairStepLabels.map((label, index) => {
            const step = index + 1;
            let fillColor = "bg-white";
            let clickable = false;

            if (step < currentStep) {
              fillColor = "bg-green-500";
              clickable = true;
            } else if (step === currentStep) {
              if (step === totalSteps) {
                fillColor = "bg-green-500";
              } else {
                fillColor = isCancelled ? "bg-red-500" : "bg-yellow-400";
              }
              clickable = true;
            }

            const handleClick = () => {
              if (clickable) navigate(stepRoutes[index]);
            };

            return (
              <div
                key={label}
                onClick={handleClick}
                className={`absolute z-10 w-6 h-6 rounded-full border-4 border-gray-300 ${fillColor} ${
                  clickable ? "transition-transform duration-200 hover:scale-110 cursor-pointer" : ""
                }`}
                style={{
                  left: `${(index / (totalSteps - 1)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap select-none">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RepairProgress;