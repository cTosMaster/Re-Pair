import { useState } from "react";
import { changeRepairStatus } from "../../../services/customerAPI";
import { Navigate } from "react-router-dom";
import { segmentForStatus } from "../../../routes/statusRoute";

function PaymentButton({ requestId, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // ✅ API 호출
    await changeRepairStatus({
      requestId: Number(requestId),
      statusCode: "WAITING_FOR_DELIVERY"
    });

      alert("결제가 완료되었습니다.");
      const seg = segmentForStatus("WAITING_FOR_DELIVERY"); 
      Navigate(`/repair-requests/${requestId}/${seg}`);

    } catch (err) {
      console.error("결제 처리 실패:", err);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={`w-full max-w-[200px] py-3 rounded-md font-medium transition
          ${
            disabled || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#A5CD82] text-white hover:bg-[#94bb71]"
          }`}
      >
        {loading ? "처리 중..." : "결제하기"}
      </button>
    </div>
  );
}

export default PaymentButton;