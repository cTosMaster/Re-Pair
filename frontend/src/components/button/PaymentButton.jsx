import { useState, useMemo } from "react";
import { loadTossSdk } from "../../../lib/loadTossSdk";

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const successUrl = import.meta.env.VITE_PAY_SUCCESS_URL || `${window.location.origin}/payments/success`;
const failUrl    = import.meta.env.VITE_PAY_FAIL_URL    || `${window.location.origin}/payments/fail`;

function isAbsolute(url) {
  try { new URL(url); return true; } catch { return false; }
}

export default function PaymentButton({
  orderId,
  amount,
  orderName,
  customerName,
  customerEmail,
  customerMobilePhone,
  validHours,          // 옵션
  cashReceipt,         // 옵션: { type: "소득공제" | "지출증빙", ... }
  method = "VIRTUAL_ACCOUNT",
  onError,             // 옵션
}) {
  const [busy, setBusy] = useState(false);

  const disabled = useMemo(() => {
    const v = Number(amount);
    return (
      busy ||
      !orderId ||
      !Number.isFinite(v) ||
      v <= 0 ||
      !clientKey ||
      !isAbsolute(successUrl) ||
      !isAbsolute(failUrl)
    );
  }, [busy, orderId, amount]);

  const onClick = async () => {
    if (disabled) {
      if (!clientKey) alert("VITE_TOSS_CLIENT_KEY가 없습니다.");
      if (!isAbsolute(successUrl) || !isAbsolute(failUrl)) alert("successUrl/failUrl은 절대 URL이어야 합니다.");
      return;
    }
    try {
      setBusy(true);
      const toss = await loadTossSdk(clientKey);
      await toss.requestPayment({
        method, // 기본: VIRTUAL_ACCOUNT
        amount: { currency: "KRW", value: Number(amount) },
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerName,
        customerEmail,
        customerMobilePhone,
        ...(validHours ? { validHours } : {}),
        ...(cashReceipt ? { cashReceipt } : {}),
      });
      // 성공 시 리다이렉트
    } catch (e) {
      console.error("toss.requestPayment error:", e);
      onError?.(e);
      alert(e?.message || "결제가 취소되었거나 실패했습니다.");
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      className="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold disabled:opacity-50"
    >
      {busy ? "결제창 준비 중…" : "가상계좌로 결제하기"}
    </button>
  );
}