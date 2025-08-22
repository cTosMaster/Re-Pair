// Toss JS SDK v2 동적 로더 (팝업/리다이렉트 전용)
let scriptPromise = null;

/**
 * TossPayments 인스턴스 로더
 * @param {string} clientKey - VITE_TOSS_CLIENT_KEY
 * @param {{ timeoutMs?: number }} options
 */
export async function loadTossSdk(clientKey, { timeoutMs = 15000 } = {}) {
  if (typeof window === "undefined") throw new Error("브라우저 환경에서만 사용할 수 있습니다.");
  if (!clientKey) throw new Error("VITE_TOSS_CLIENT_KEY가 없습니다.");

  // 이미 로드됨
  if (window.TossPayments) return window.TossPayments(clientKey);

  // 최초 1회만 <script> 추가
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.tosspayments.com/v2";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve(window.TossPayments);
      s.onerror = () => {
        scriptPromise = null; // 실패 시 다음 호출에서 재시도
        reject(new Error("TossPayments SDK 로드 실패"));
      };
      document.head.appendChild(s);
    });
  }

  // 타임아웃 레이스 + cleanup
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      scriptPromise = null;
      reject(new Error("TossPayments SDK 로드 타임아웃"));
    }, timeoutMs);
  });

  const TossCtor = await Promise.race([scriptPromise, timeoutPromise]);
  clearTimeout(timeoutId);
  return TossCtor(clientKey);
}

/**
 * (옵션) 가상계좌 팝업 바로 열기 헬퍼
 * - 반드시 "사용자 클릭 핸들러" 내부에서 호출
 */
export async function requestVirtualAccountPayment({
  clientKey,
  amount,
  orderId,
  orderName,
  successUrl,
  failUrl,
  customerName,
  customerEmail,
  customerMobilePhone,
  ...vaOptions // { validHours, cashReceipt, ... }
}) {
  const toss = await loadTossSdk(clientKey);
  return toss.requestPayment({
    method: "VIRTUAL_ACCOUNT",
    amount: { currency: "KRW", value: Number(amount) || 0 },
    orderId,
    orderName,
    successUrl,
    failUrl,
    customerName,
    customerEmail,
    customerMobilePhone,
    ...vaOptions,
  });
}