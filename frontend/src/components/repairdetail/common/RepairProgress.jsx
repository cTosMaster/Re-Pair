import { useNavigate } from "react-router-dom";
import { RepairStepLabels, RepairStatusMap } from "../../../constants/repairStatus";

function RepairProgress({ statusCode, isCancelled = false }) {
  const currentStep = RepairStatusMap[statusCode];
  const totalSteps = RepairStepLabels.length;
  const navigate = useNavigate();

  // 각 스텝별 이동 경로를 여기에 정의하세요
  const stepRoutes = [
    "/1", // <PendingApproval>
    "/2", // <WaitingForRepair>
    "/3", // <InProgress>
    "/4", // <WaitingForPayment>
    "/5", // <WaitingForDelivery>
    "/6"  // <Completed>
  ];

  return (
    <div className="bg-white shadow-md rounded-xl py-2 px-8 w-full max-w-4xl mx-auto overflow-hidden">
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
            if (clickable) {
              navigate(stepRoutes[index]);
            }
          };

          const interactiveClasses = clickable
            ? "transition-transform duration-200 hover:scale-110 cursor-pointer"
            : "";

          return (
            <div
              key={label}
              onClick={handleClick}
              className={`absolute z-10 w-6 h-6 rounded-full border-4 border-gray-300 ${fillColor} ${interactiveClasses}`}
              style={{
                left: `${(index / (totalSteps - 1)) * 100}%`,
                transform: "translateX(-50%)"
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
  );
}

export default RepairProgress;