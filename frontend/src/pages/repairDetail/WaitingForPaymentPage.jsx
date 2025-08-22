import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FinalEstimateEditor from "../../components/repairdetail/waitingforpayment/FinalEstimateEditor";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import PaymentButton from "../../components/repairdetail/waitingforpayment/PaymentButton";
import { requestPayment } from "../../services/paymentAPI";
import { useAuth } from "../../hooks/useAuth";

const successUrl = import.meta.env.VITE_PAY_SUCCESS_URL || `${window.location.origin}/payments/success`;
const failUrl = import.meta.env.VITE_PAY_FAIL_URL || `${window.location.origin}/payments/fail`;

export default function WaitingForPaymentPage() {
  const { user } = useAuth?.() || { user: null };

  // URL에서 repairId
  const { repairId: repairIdParam } = useParams();
  const repairId = useMemo(() => Number(repairIdParam) || 123, [repairIdParam]);

  // ----- 역할/상태 -----
  const resolvedRole = user?.role ?? user?.authority ?? (Array.isArray(user?.authorities) ? user.authorities[0] : undefined);
  const role = (typeof resolvedRole === "string" ? resolvedRole : "").toUpperCase() || "USER";

  const [statusCode] = useState("WAITING_FOR_PAYMENT");
  const [isCancelled] = useState(false);

  // ----- 견적(더미) -----
  const estimate = {
    items: [
      { id: 1, name: "메인보드 수리", price: 55000 },
      { id: 2, name: "청소 서비스", price: 20000 },
    ],
    extraNote: "추가로 내부 먼지 제거 진행. 고객 요청으로 케이스 청소 포함.",
    totalPrice: 75000,
    beforeImages: ["https://via.placeholder.com/150","https://via.placeholder.com/150","https://via.placeholder.com/150","https://via.placeholder.com/150"],
    afterImages: ["https://via.placeholder.com/150","https://via.placeholder.com/150","https://via.placeholder.com/150","https://via.placeholder.com/150"],
  };
  const presetList = [
    { id: 1, name: "기본 점검", price: 10000 },
    { id: 2, name: "프리미엄 클리닝", price: 25000 },
  ];

  // ----- (팝업용) 주문 식별자/표시명 -----
  const orderName = useMemo(() => {
    const n = estimate.items?.length || 0;
    return n
      ? `${estimate.items[0].name}${n > 1 ? ` 외 ${n - 1}건` : ""}`
      : `수리비용 #${repairId}`;
  }, [estimate.items, repairId]);

  // ⚠️ 운영에서는 서버에서 orderId/amount를 미리 저장/발급 받아야 합니다.
  // 여기서는 데모용으로 클라이언트에서 임시 생성합니다.
  const clientOrderId = useMemo(() => `REPAIR-${repairId}-${Date.now()}`, [repairId]);

  // ----- (보조 옵션) 가상계좌 "즉시 발급" 흐름 -----
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [bankCode, setBankCode] = useState("088"); // 신한
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });

  const handleRequestPayment = async () => {
    setIssuing(true);
    setIssueError(null);
    try {
      const payload = {
        repairId,
        orderName,
        amount: Number(estimate.totalPrice) || 0,
        customerName: user?.name || user?.username || "고객",
        customerEmail: user?.email || "",
        method: "VIRTUAL_ACCOUNT",   // 서버가 분기한다면 명시
        bankCode,
        dueDate,                     // YYYY-MM-DD
        successUrl,
        failUrl,
        customerId: user?.id || user?.userId || 0,
      };
      const { data } = await requestPayment(payload);
      setPaymentInfo(data); // { orderId, amount, virtualAccount{...}, ... }
    } catch (e) {
      console.error("requestPayment error", {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
      });
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "알 수 없는 오류";
      setIssueError(`결제 요청 실패: ${msg}`);
    } finally {
      setIssuing(false);
    }
  };

  const Header = () => (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">결제 대기</h2>
          <p className="text-sm text-gray-600">최종 견적 확정 후 결제를 진행해 주세요.</p>
        </div>
        <div className="text-sm text-gray-500">
          현재 단계: <span className="font-medium">{RepairStatusMap?.["WAITING_FOR_PAYMENT"]?.label ?? "WAITING_FOR_PAYMENT"}</span>
        </div>
      </div>
    </div>
  );

  const VirtualAccountCard = ({ info }) => {
    const account = info?.virtualAccountNumber || info?.virtualAccount?.accountNumber || "";
    const bank = info?.virtualAccount?.bank || info?.bank || "-";
    const holder = info?.virtualAccount?.holder || info?.holder || "-";
    const expires = info?.virtualAccountExpiredAt || info?.virtualAccount?.expiresAt || null;

    return (
      <div className="rounded-2xl border bg-white p-5 space-y-3">
        <h3 className="text-lg font-semibold">입금 계좌 정보</h3>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <dt className="text-gray-500">주문번호</dt>
          <dd className="col-span-2 break-all">{info?.orderId ?? "-"}</dd>

          <dt className="text-gray-500">결제금액</dt>
          <dd className="col-span-2">{(info?.amount ?? estimate.totalPrice).toLocaleString()}원</dd>

          <dt className="text-gray-500">은행</dt>
          <dd className="col-span-2">{bank}</dd>

          <dt className="text-gray-500">예금주</dt>
          <dd className="col-span-2">{holder}</dd>

          <dt className="text-gray-500">계좌번호</dt>
          <dd className="col-span-2 flex items-center gap-2">
            <span className="font-mono">{account || "-"}</span>
            {!!account && (
              <button className="text-xs px-2 py-1 rounded-lg border" onClick={() => navigator.clipboard.writeText(account)}>
                복사
              </button>
            )}
          </dd>

          <dt className="text-gray-500">입금기한</dt>
          <dd className="col-span-2">{expires ? new Date(expires).toLocaleString() : "-"}</dd>
        </dl>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>입금 완료 시 자동으로 상태가 갱신됩니다.</li>
          <li>입금자명/금액이 다르면 확인이 지연될 수 있습니다.</li>
        </ul>
      </div>
    );
  };

  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      <Header />

      {isCancelled && <RejectReasonBox reason={{ message: "요청이 취소되었습니다." }} />}

      {!isCancelled && (
        <>
          {/* USER: 최종견적 확인 + 결제 */}
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimatePreview estimate={estimate} />

              {/* 1) (권장) 토스 팝업 결제창: 가상계좌 */}
              <div className="space-y-2">
                <PaymentButton
                  orderId={clientOrderId}                // ⚠️ 운영에서는 서버 선저장 값 사용 권장
                  amount={estimate.totalPrice}
                  orderName={orderName}
                  customerName={user?.name || user?.username}
                  customerEmail={user?.email}
                />
                <p className="text-xs text-gray-500">
                  팝업 결제창으로 가상계좌를 발급합니다. 결제 성공 시 {new URL(successUrl).pathname} 로 리다이렉트됩니다.
                </p>
              </div>

              {/* 2) (선택) 서버 즉시 가상계좌 발급 → 계좌 정보 즉시 표시 */}
              {!paymentInfo && (
                <div className="space-y-3 rounded-2xl border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-gray-600">입금은행</span>
                      <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="rounded-lg border p-2">
                        <option value="088">신한(088)</option>
                        <option value="004">KB국민(004)</option>
                        <option value="020">우리(020)</option>
                        <option value="081">하나(081)</option>
                        <option value="090">카카오뱅크(090)</option>
                        <option value="089">케이뱅크(089)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-gray-600">입금기한</span>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border p-2" />
                    </label>
                  </div>

                  <button
                    onClick={handleRequestPayment}
                    disabled={issuing}
                    className="w-full rounded-2xl border py-3 font-medium disabled:opacity-50"
                  >
                    {issuing ? "가상계좌 발급 중..." : "서버에서 즉시 가상계좌 발급"}
                  </button>
                  {issueError && <p className="text-sm text-red-600">{issueError}</p>}
                </div>
              )}

              {paymentInfo && <VirtualAccountCard info={paymentInfo} />}
            </div>
          )}

          {/* 고객사/엔지니어/관리자: 내부용 견적 편집 */}
          {(isCustomer || isEngineer || isAdmin) && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={estimate} presetList={presetList} />
            </div>
          )}
        </>
      )}
    </div>
  );
}