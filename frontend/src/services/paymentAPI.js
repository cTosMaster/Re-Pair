import api from './api';

/**
 * 결제 내역 전체 조회
 * GET /api/payments
 * @param {Object} params - { page, size, status, from, to, keyword ... } (옵션)
 */
export const getPayments = (params = {}) =>
  api.get('/payments', { params });

/**
 * 결제 요청(가상계좌 발급 등)
 * POST /api/payments/request
 * @param {Object} data - { orderId, amount, method, depositorName, callbackUrl, ... }
 */
export const requestPayment = (data) =>
  api.post('/payments/request', data);

/**
 * 결제 대기 목록 조회
 * GET /api/payments/pending
 * @param {Object} params - { page, size, ... } (옵션)
 */
export const getPendingPayments = (params = {}) =>
  api.get('/payments/pending', { params });

/**
 * 입금 상태 조회 (orderId 기준)
 * GET /api/payments/status/{orderId}
 */
export const getPaymentStatusByOrder = (orderId) => {
  if (!orderId) throw new Error('orderId is required');
  return api.get(`/payments/status/${encodeURIComponent(orderId)}`);
};

/**
 * 결제 ID로 상태 조회
 * GET /api/payments/status/id/{paymentId}
 */
export const getPaymentStatusById = (paymentId) => {
  if (!paymentId) throw new Error('paymentId is required');
  return api.get(`/payments/status/id/${encodeURIComponent(paymentId)}`);
};

/**
 * 결제 ID(요청 ID)로 입금 내역 상세 조회
 * GET /api/payments/detail/{requestId}
 */
export const getPaymentDetailByRequestId = (requestId) => {
  if (!requestId) throw new Error('requestId is required');
  return api.get(`/payments/detail/${encodeURIComponent(requestId)}`);
};

/**
 * PG사 비동기 콜백 수신 (로컬/관리자 테스트 용도)
 * POST /api/payments/callback
 * - 실제 운영에선 PG -> 백엔드로 직접 쏘는 엔드포인트입니다.
 */
export const postPaymentCallback = (payload) =>
  api.post('/payments/callback', payload);
