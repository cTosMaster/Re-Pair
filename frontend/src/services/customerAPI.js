import api from './api';

/** 회사 범위 전체/필터 목록 */
export const getRepairRequests = (params = { statusGroup: 'IN_PROGRESS', page: 0, size: 20 }) =>
  api.get('/repair-requests', { params });

/** 회사 전용 전체 목록 */
export const getCompanyRepairRequests = (params = { statusGroup: 'ALL', page: 0, size: 20 }) =>
  api.get('/repair-requests/company', { params });

/** 상세 조회 */
export const getRepairRequest = (requestId, options = {}) =>
  api.get(`/repair-requests/${encodeURIComponent(requestId)}`, { signal: options.signal });

/** 소프트 딜리트(다중) */
export const softDeleteRepairRequests = (ids) =>
  api.patch('/repair-requests/delete', { ids: Array.isArray(ids) ? ids : [ids] });

/** 접수/반려 처리 (관리자도 사용) */
export const acceptRepairRequest = (requestId, body) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/accept`, body);

export const rejectRepairRequest = (requestId, body) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/reject`, body);

/** 수리기사 등록 */
export const createEngineer = (data) =>
  api.post('/engineers', data);

/** 수리기사 삭제 */
export const deleteEngineer = (engineerId) =>
  api.delete(`/engineers/${encodeURIComponent(engineerId)}`);

/** 수리기사 상세 조회 */
export const getEngineer = (engineerId, options = {}) =>
  api.get(`/engineers/${encodeURIComponent(engineerId)}`, { signal: options.signal });

/** 수리기사 정보 수정 */
export const updateEngineer = (engineerId, data) =>
  api.put(`/engineers/${encodeURIComponent(engineerId)}`, data);

/** 수리기사 전체 목록 조회 (필요시 페이징 파라미터 추가) */
export const listEngineers = (params = { page: 0, size: 20 }) =>
  api.get('/engineers', { params });

/** 기사 재배정: 특정 수리(repairId)에 engineer 재할당 */
export const reassignEngineer = (repairId, engineerId, body = {}) =>
  api.patch(`/repairs/${encodeURIComponent(repairId)}/reassign`, {
    engineerId,
    ...body, // 메모/사유 등 추가 필드가 있으면 body로 함께 보냄
  });

/** 수리물품 전체 조회 (필터/페이징 옵션) */
export const listRepairItems = (params = { page: 0, size: 20, categoryId: undefined, keyword: '' }) =>
  api.get('/repair-items', { params });

/** 수리물품 등록 */
export const createRepairItem = (data) =>
  api.post('/repair-items', data); // { categoryId, name, price, ... }

/** 수리물품 수정 */
export const updateRepairItem = (id, data) =>
  api.put(`/repair-items/${encodeURIComponent(id)}`, data);

/** 수리물품 삭제 */
export const deleteRepairItem = (id) =>
  api.delete(`/repair-items/${encodeURIComponent(id)}`);

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

/** 고객사 기준 후기 조회 */
export const getReviewsByCustomer = (
  customerId,
  params = { page: 0, size: 20, keyword: '' },
  options = {}
) =>
  api.get(`/reviews/customers/${encodeURIComponent(customerId)}`, {
    params,
    signal: options.signal,
  });

/** 수리건별 후기 조회 */
export const getReviewsByRepair = (
  repairId,
  params = { page: 0, size: 20 },
  options = {}
) =>
  api.get(`/reviews/${encodeURIComponent(repairId)}`, {
    params,
    signal: options.signal,
  });

/** 요금 정책 등록 */
export const createCustomPricing = (data) =>
  api.post('/custom-pricing', data);

/** 요금 정책 수정 */
export const updateCustomPricing = (clientId, data) =>
  api.put(`/custom-pricing/${encodeURIComponent(clientId)}`, data);

/** 요금 정책 삭제 */
export const deleteCustomPricing = (clientId) =>
  api.delete(`/custom-pricing/${encodeURIComponent(clientId)}`);

/** 요금 정책 조회 */
export const getCustomPricing = (clientId, options = {}) =>
  api.get(`/custom-pricing/${encodeURIComponent(clientId)}`, {
    signal: options.signal,
  });

/**
 * 고객사 등록 폼 제출
 * POST /api/customers/registration
 * @param {Object|FormData} data
 *  - 파일 업로드가 있으면 FormData 사용 (businessDoc 등)
 *  - 아니면 일반 객체(JSON)로 전송
 * @param {{ signal?: AbortSignal }} [options]
 */
export const submitCustomerRegistration = (data, options = {}) => {
  const isFormData = (typeof FormData !== 'undefined') && data instanceof FormData;
  return api.post('/customer/registration', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    signal: options.signal,
  });
};