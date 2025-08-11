import api from './api';

export const getMyAssignedRequests = (params = { status: 'ALL', page: 0, size: 20, keyword: '' }) =>
  api.get('/repair-requests/engineer-my', { params });

export const getMyAssignedRequestDetail = (requestId, options = {}) =>
  api.get(`/repair-requests/engineer-my/${encodeURIComponent(requestId)}`, { signal: options.signal });

/** 기사도 동일 엔드포인트로 접수/반려 가능하면 재노출 */
export const acceptAssignedRequest = (requestId, body) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/accept`, body);

export const rejectAssignedRequest = (requestId, body) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/reject`, body);

/** 수리 상태 수동 취소 */
export const cancelRepairRequest = (requestId, body = {}, options = {}) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/cancel`, body, {
    signal: options.signal,
  });

/** 1차 견적 등록/조회 (요청 단위) */
export const createPreEstimate = (requestId, data) =>
  api.post(`/repair-requests/${encodeURIComponent(requestId)}/pre-estimate`, data);

export const getPreEstimate = (requestId, options = {}) =>
  api.get(`/repair-requests/${encodeURIComponent(requestId)}/pre-estimate`, {
    signal: options.signal,
  });

/** 최종 견적서 등록/수정/조회 (수리건 단위) */
export const createFinalEstimate = (repairId, data) =>
  api.post(`/repairs/${encodeURIComponent(repairId)}/final-estimate`, data);

export const updateFinalEstimate = (repairId, data) =>
  api.patch(`/repairs/${encodeURIComponent(repairId)}/final-estimate`, data);

export const getFinalEstimate = (repairId, options = {}) =>
  api.get(`/repairs/${encodeURIComponent(repairId)}/final-estimate`, {
    signal: options.signal,
  });

/** 프리셋 목록 조회 (필터/페이징) */
export const listPresets = (params = { page: 0, size: 20, categoryId: undefined, productId: undefined, keyword: '' }) =>
  api.get('/presets', { params });

/** 카테고리·제품별 프리셋 필터 조회 (전용 호출이 필요하면 사용) */
export const filterPresets = (categoryId, productId, extra = {}) =>
  api.get('/presets', { params: { categoryId, productId, ...extra } });

/** 프리셋 금액 자동 계산 */
export const calculatePresetAmount = (data) =>
  api.post('/presets/calculate', data); // 예: { presetId, quantity, overrides: {...} }

/** 단일 프리셋 견적 미리 보기 */
export const previewPreset = (presetId, data = {}) =>
  api.post(`/presets/${encodeURIComponent(presetId)}`, data); // 필요시 수량/옵션 전달

/** 프리셋 등록 */
export const createPreset = (data) =>
  api.post('/presets', data);

/** 프리셋 수정 */
export const updatePreset = (presetId, data) =>
  api.put(`/presets/${encodeURIComponent(presetId)}`, data);

/** 프리셋 삭제 */
export const deletePreset = (presetId) =>
  api.delete(`/presets/${encodeURIComponent(presetId)}`);
