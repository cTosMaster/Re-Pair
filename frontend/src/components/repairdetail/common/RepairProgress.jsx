import { useNavigate } from "react-router-dom";
import { RepairStepLabels, RepairStatusMap } from "../../../constants/repairStatus";

/**
 * 요청 상세 단계 진행바
 * @param {object} props
 * @param {string} props.statusCode - UI 상태코드 (PENDING_APPROVAL, ... , CANCELLED)
 * @param {boolean} [props.isCancelled=false]
 * @param {string|number} props.requestId - 라우팅에 사용할 요청 ID
 */
function RepairProgress({ statusCode, isCancelled = false, requestId }) {
  const navigate = useNavigate();

  const currentStep = RepairStatusMap[statusCode] ?? 0;
  const totalSteps = RepairStepLabels.length; // 6개 (취소는 별도 표시)

  // ✅ 스텝 인덱스(0~5) → 실제 라우트
  const routeFor = (idx) => {
    const base = `/repair-requests/${requestId}`;
    switch (idx) {
      case 0: return `${base}/pending-approval`;
      case 1: return `${base}/waiting-for-repair`;
      case 2: return `${base}/in-progress`;
      case 3: return `${base}/waiting-for-payment`;
      case 4: return `${base}/waiting-for-delivery`;
      case 5: return `${base}/completed`;
      default: return base;
    }
  };

  const handleClick = (idx, clickable) => {
    if (!clickable || !requestId) return;
    navigate(routeFor(idx));
  };

  return (
    <div className="bg-white shadow-md rounded-xl py-2 px-8 w-full max-w-4xl mx-auto overflow-hidden">
      <div className="relative h-20 w-full flex items-center">
        {/* 진행 바 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 z-0 -translate-y-1/2" />

        {/* 6개 스텝 */}
        {RepairStepLabels.map((label, index) => {
          const step = index + 1; // 1~6
          // 과거/현재 스텝 클릭 허용, 미래 스텝은 비활성
          const clickable = step <= currentStep && !isCancelled;

          // 색상 결정
          let fillColor = "bg-white"; // 기본
          if (step < currentStep) {
            fillColor = "bg-green-500"; // 완료
          } else if (step === currentStep) {
            fillColor = isCancelled
              ? "bg-red-500"     // (취소면 아래의 전용 점으로 표시하므로 사실상 안 씀)
              : (step === totalSteps ? "bg-green-500" : "bg-yellow-400"); // 현재
          }

          const interactiveClasses = clickable
            ? "transition-transform duration-200 hover:scale-110 cursor-pointer"
            : "cursor-default";

          return (
            <div
              key={label}
              onClick={() => handleClick(index, clickable)}
              className={`absolute z-10 w-6 h-6 rounded-full border-4 border-gray-300 ${fillColor} ${interactiveClasses}`}
              style={{
                left: `${(index / (totalSteps - 1)) * 100}%`,
                transform: "translateX(-50%)"
              }}
              title={label}
              aria-label={label}
              role={clickable ? "button" : "img"}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap select-none">
                {label}
              </div>
            </div>
          );
        })}

        {/* ✅ 취소 전용 마커 (7단계 대체) */}
        {isCancelled && (
          <div
            className="absolute z-20 w-6 h-6 rounded-full border-4 border-gray-300 bg-red-500"
            style={{ left: "100%", transform: "translateX(-50%)" }}
            title="취소됨"
            aria-label="취소됨"
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-600 whitespace-nowrap select-none">
              취소됨
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairProgress;