import { RepairStatusMap } from "../../../constants/repairStatus";

function RepairProgress({ statusCode, isCancelled = false }) {
  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = RepairStatusMap[statusCode];

  return (
    <div className="bg-white shadow rounded-md py-12 px-6 w-full max-w-5xl mx-auto">
      <div className="relative w-full h-24">

        {/* 막대기: 동그라미 중심을 관통 */}
        <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-gray-300 z-0" />

        {/* 동그라미만 표시 */}
        {steps.map((step, index) => {
          let fillColor = "bg-white";
          if (step < currentStep) {
            fillColor = "bg-green-500";
          } else if (step === currentStep) {
            fillColor = isCancelled ? "bg-red-500" : "bg-yellow-400";
          }

          const leftPercent = 5 + (index * (90 / (steps.length - 1)));

          return (
            <div
              key={index}
              className="absolute z-10"
              style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={`w-6 h-6 rounded-full border-4 border-gray-300 ${fillColor} transition duration-300`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RepairProgress;