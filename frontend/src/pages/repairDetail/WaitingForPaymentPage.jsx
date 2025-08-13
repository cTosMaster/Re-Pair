import { useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FinalEstimateEditor from "../../components/repairdetail/waitingforpayment/FinalEstimateEditor";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import PaymentButton from "../../components/repairdetail/waitingforpayment/PaymentButton";
import { requestPayment } from "../../services/paymentAPI";
import TossPaymentSection from "./TossPaymentSection";
import { useAuth } from "../../hooks/useAuth";

// (임시) 견적 프리뷰는 로컬 더미 데이터를 사용합니다. 실제 API 연동 시 교체.

const successUrl = import.meta.env.VITE_PAY_SUCCESS_URL || `${window.location.origin}/payments/success`;
const failUrl = import.meta.env.VITE_PAY_FAIL_URL || `${window.location.origin}/payments/fail`;

/**
 * 1단계: 결제 방식 선택
 * - [USER]
 *   1) "결제하기" 버튼 클릭 → 토스페이먼츠 섹션으로 스크롤(카드/간편결제)
 *   2) (선택) 가상계좌 발급 버튼 → /payments/request 호출 → 계좌 표시
 * - 이후 단계에서 상태 폴링(/api/payments/status/{orderId}) 추가 예정
 */
export default function WaitingForPaymentPage() {
  const { user } = useAuth?.() || { user: null };

  // URL에서 repairId를 받아오는 경우 사용 (없으면 더미)
  const { repairId: repairIdParam } = useParams();
  const repairId = useMemo(() => Number(repairIdParam) || 123, [repairIdParam]);

  // ----- 역할/상태 -----
  // role은 useAuth() 값을 사용하고, 없으면 USER로 폴백
  const resolvedRole = user?.role ?? user?.authority ?? (Array.isArray(user?.authorities) ? user.authorities[0] : undefined);
  const role = (typeof resolvedRole === "string" ? resolvedRole : "").toUpperCase() || "USER";

  // 진행상태는 기본값으로 시작 (실제 API 연동 시 교체)
  const [statusCode, setStatusCode] = useState("WAITING_FOR_PAYMENT");
  const [isCancelled, setIsCancelled] = useState(false);
  // TODO: 필요 시 repairId로 상태 조회 API 연동하여 setStatusCode/setIsCancelled 업데이트

  // ----- 결제 섹션 토글/스크롤 -----
  const [showCardPay, setShowCardPay] = useState(false);
  const cardPayRef = useRef(null);
  const handleShowCardPay = () => {
    setShowCardPay(true);
    // 섹션이 마운트된 뒤 스무스 스크롤
    setTimeout(() => cardPayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  // ----- 가상계좌 발급 상태 -----
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // VA 옵션(은행/만료일)
  const [bankCode, setBankCode] = useState("088"); // 신한 기본
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // ----- 견적(더미) -----
  const lastSaved = {
    items: [
      { id: 1, name: "메인보드 수리", price: 55000 },
      { id: 2, name: "청소 서비스", price: 20000 },
    ],
    extraNote: "추가로 내부 먼지 제거 진행. 고객 요청으로 케이스 청소 포함.",
    totalPrice: 75000,
    beforeImages: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
    afterImages: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
  };
  const presetList = [
    { id: 1, name: "기본 점검", price: 10000 },
    { id: 2, name: "프리미엄 클리닝", price: 25000 },
  ];

  // ----- 가상계좌 발급 -----
  const handleRequestPayment = async () => {
    setIssuing(true);
    setIssueError(null);
    try {
      // 서버가 요구한 요청 폼에 맞춰 구성
      const orderName = lastSaved.items?.length
        ? `${lastSaved.items[0].name}${lastSaved.items.length > 1 ? ` 외 ${lastSaved.items.length - 1}건` : ""}`
        : `수리비용 #${repairId}`;

      const payload = {
        orderName,
        amount: Number(lastSaved.totalPrice) || 0,
        customerName: user?.name || user?.username || "고객",
        bankCode,
        customerEmail: user?.email || "",
        successUrl,
        failUrl,
        dueDate, // YYYY-MM-DD
        repairId,
        customerId: user?.id || user?.userId || 0,
      };

      const { data } = await requestPayment(payload);
      setPaymentInfo(data);
    } catch (e) {
      console.error('requestPayment error', {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
      });
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || '알 수 없는 오류';
      setIssueError(`결제 요청 실패: ${msg}`);
    } finally {
      setIssuing(false);
    }
  };

  // ----- 뷰 가드 -----
  const currentStep = RepairStatusMap["WAITING_FOR_PAYMENT"];
  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  // ----- 공통 상단 정보(예시) -----
  const Header = () => (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">결제 대기</h2>
          <p className="text-sm text-gray-600">최종 견적 확정 후 결제를 진행해 주세요.</p>
        </div>
        <div className="text-sm text-gray-500">
          현재 단계: <span className="font-medium">{currentStep?.label ?? "WAITING_FOR_PAYMENT"}</span>
        </div>
      </div>
    </div>
  );

  // ----- 가상계좌 카드 -----
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
          <dd className="col-span-2">{(info?.amount ?? lastSaved.totalPrice).toLocaleString()}원</dd>

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

  return (
    <div className="p-6 space-y-6">
      <Header />

      {/* 취소/예외 처리 */}
      {isCancelled && <RejectReasonBox reason={{ message: "요청이 취소되었습니다." }} />}

      {/* 권한/단계별 뷰 */}
      {!isCancelled && (
        <>
          {/* USER(일반 사용자): 최종견적 확인 + 결제 방식 선택 */}
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimatePreview estimate={lastSaved} />

              {/* 1) 기본 결제 버튼 → 토스 섹션으로 스크롤 */}
              <div className="space-y-2">
                <PaymentButton onClick={handleShowCardPay} disabled={false} />
                <p className="text-xs text-gray-500">카드/간편결제로 진행합니다.</p>
              </div>

              {/* 2) (선택) 가상계좌로 발급 진행 - 은행/만료일 옵션 */}
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
                    가상계좌 발급으로 진행
                  </button>
                  {issuing && <p className="text-sm text-gray-500">가상계좌 발급 중...</p>}
                  {issueError && <p className="text-sm text-red-600">{issueError}</p>}
                </div>
              )}

              {/* 가상계좌 정보 표시 */}
              {paymentInfo && <VirtualAccountCard info={paymentInfo} />}

              {/* 토스페이먼츠 결제 섹션 */}
              {showCardPay && (
                <div ref={cardPayRef} className="space-y-4">
                  <TossPaymentSection repairId={repairId} />
                </div>
              )}
            </div>
          )}

          {/* 고객사 관리자: 최종견적 편집/확정 (필요 시 역할 정책에 맞게 수정) */}
          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}

          {/* 수리기사/관리자: 내부용 견적 편집 */}
          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <FinalEstimateEditor initialEstimate={lastSaved} presetList={presetList} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
