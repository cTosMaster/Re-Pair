import api from './api';

/**
 * 수리 상태 이력 조회
 * 실제 백엔드 경로에 맞춰 변경: 예) /repair-requests/{id}/history
 */
export const getRequestHistory = async (requestId, options = {}) => {
  const id = String(requestId ?? "").trim();
  if (!id) throw new Error("requestId는 필수입니다.");

  const { data } = await api.get(`/repairs/status-history/${encodeURIComponent(id)}`, {
    signal: options.signal,
    params: options.params,
  });

  // 다양한 DTO 대응: items | history | 배열
  const raw = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : data?.history ?? [];

  // 그대로 반환 (페이지에서 toUiStatus 적용/도출)
  return raw.map((r) => ({
    previousStatus: r.previousStatus ?? null,
    newStatus: r.newStatus ?? null,        // NOTE: 여기선 백엔드 표기 그대로(CANCELED 등)
    changedAt: r.changedAt ?? r.changed_at ?? null,
    memo: r.memo ?? r.reason ?? null,
  }));
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

/** 고객사 상세 조회 */
export const getCenterDetail = (customerId) =>
  api.get(`/customers/${encodeURIComponent(customerId)}`);