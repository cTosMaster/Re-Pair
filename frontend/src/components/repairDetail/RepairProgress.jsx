import { RepairStepLabels, RepairStatusMap } from "../../constants/repairStatus.js";

function RepairProgress({ statusCode }) {
  const step = RepairStatusMap[statusCode];

  const isCancelled = statusCode === "CANCELLED";

    console.log("RepairProgress 렌더링됨");
    console.log("statusCode:", statusCode);
    console.log("step:", step);

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-md shadow">
      {RepairStepLabels.map((label, index) => {
        const stepIndex = index + 1;

        let bgColor = "bg-gray-300";
        if (isCancelled) {
          bgColor = "bg-red-500";
        } else if (stepIndex < step) {
          bgColor = "bg-green-500";
        } else if (stepIndex === step) {
          bgColor = "bg-yellow-400";
        }

        return (
          <div key={label} className="flex flex-col items-center flex-1">
            <div className={`w-4 h-4 rounded-full ${bgColor}`} />
            <span className="text-sm mt-1">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default RepairProgress;
