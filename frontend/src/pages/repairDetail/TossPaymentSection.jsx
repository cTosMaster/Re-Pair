import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { requestPayment } from '../../services/paymentAPI';

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const successUrl = import.meta.env.VITE_PAY_SUCCESS_URL || `${window.location.origin}/payments/success`;
const failUrl = import.meta.env.VITE_PAY_FAIL_URL || `${window.location.origin}/payments/fail`;

export default function TossPaymentSection({ repairId }) {
  const [loading, setLoading] = useState(true);
  const [prepared, setPrepared] = useState(null);
  const [error, setError] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) 서버에 주문 등록 (결제요청) - 카드 결제용
        const { data } = await requestPayment({ repairId, method: 'CARD' });
        if (cancelled) return;

        // 2) 위젯 로드/생성
        const widget = await loadPaymentWidget(clientKey, data.customerKey || 'anon');
        if (cancelled) return;
        widgetRef.current = widget;

        // 3) 결제수단/약관 렌더 (금액은 서버 응답 사용)
        await widget.renderPaymentMethods('#toss-payment-methods', { value: data.amount });
        await widget.renderAgreement('#toss-agreement');

        setPrepared(data);
      } catch (e) {
        console.error(e);
        setError('결제 위젯 초기화에 실패했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [repairId]);

  const onPay = async () => {
    if (!widgetRef.current || !prepared) return;

    await widgetRef.current.requestPayment({
      orderId: prepared.orderId,
      orderName: prepared.orderName,
      amount: prepared.amount,
      successUrl,
      failUrl,
    });
  };

  if (loading) return <p className="text-sm text-gray-500">결제 위젯 준비 중…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div id="toss-payment-methods" className="rounded-2xl border p-4 bg-white" />
      <div id="toss-agreement" className="rounded-2xl border p-4 bg-white" />
      <button
        onClick={onPay}
        className="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold"
      >
        결제하기
      </button>
    </div>
  );
}