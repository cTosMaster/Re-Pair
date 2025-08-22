import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../services/paymentAPI';

export default function PaymentSuccess() {
  const nav = useNavigate();
  const [msg, setMsg] = useState('결제 승인 중...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const paymentKey = url.searchParams.get('paymentKey');
    const orderId = url.searchParams.get('orderId');
    const amount = Number(url.searchParams.get('amount'));

    (async () => {
      try {
        await confirmPayment({ paymentKey, orderId, amount });
        setMsg('결제가 승인되었습니다.');
        setTimeout(() => nav('/some/next', { replace: true }), 800);
      } catch {
        setMsg('승인 처리에 실패했습니다. 고객센터로 문의해 주세요.');
      }
    })();
  }, [nav]);

  return <div className="p-6 text-lg font-semibold">{msg}</div>;
}