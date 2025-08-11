import api from './api';

/**
 * 처리 이력 추적
 * GET /api/stats/history/{requestId}
 * @param {string|number} requestId
 * @param {{ signal?: AbortSignal, params?: Record<string, any> }} [options]
 */
export const getRequestHistory = (requestId, options = {}) => {
  const id = String(requestId ?? '').trim();
  if (!id) throw new Error('requestId는 필수입니다.');
  return api.get(`/stats/history/${encodeURIComponent(id)}`, {
    signal: options.signal,
    params: options.params, // 추후 page/size/dateRange 같은 필터 확장용
  });
};

/**
 * 상태 변경 알림 전송 (관리자/기사/백오피스 공용)
 * POST /api/notify/status-update
 * @param {{
 *   requestId: string|number,
 *   status: string,                 // 예: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' ...
 *   recipients?: string[] ,         // 수신자 식별자(이메일/유저ID 등)
 *   channels?: ('EMAIL'|'SMS'|'PUSH')[],
 *   message?: string,
 *   meta?: Record<string, any>
 * }} payload
 * @param {{ signal?: AbortSignal }} [options]
 */
export const sendStatusUpdateNotification = (payload, options = {}) => {
  if (!payload || !payload.requestId || !payload.status) {
    throw new Error('requestId, status는 필수입니다.');
  }
  return api.post('/notify/status-update', payload, {
    signal: options.signal,
  });
};