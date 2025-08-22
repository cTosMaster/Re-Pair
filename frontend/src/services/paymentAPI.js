import api from './api';

// 1) 결제 요청(가상계좌 발급)
export const requestPayment = (payload) =>
  api.post('/payments/request', payload);

// 2) (미리) 상태조회/목록용 — 다음 단계에서 쓸 예정
export const getPayments = () => api.get('/payments');
export const getPendingPayments = () => api.get('/payments/pending');
export const getStatusByOrderId = (orderId) => api.get(`/payments/status/${encodeURIComponent(orderId)}`);
export const getStatusByPaymentId = (paymentId) => api.get(`/payments/status/id/${encodeURIComponent(paymentId)}`);
export const getPaymentDetail = (requestId) => api.get(`/payments/detail/${encodeURIComponent(requestId)}`);