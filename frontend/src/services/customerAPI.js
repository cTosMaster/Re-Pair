import api from './api';

/*****************************************/
/**************** 수리요청 관리 *************/
/*****************************************/
/** 회사 기준 수리 전체 목록조회 */
export const getRepairRequests = (params = { statusGroup: 'IN_PROGRESS', page: 0, size: 20 }) =>
  api.get('/repair-requests', { params });

/** 수리요청 기준 수리 상세조회 */
export const getRepairRequest = (requestId, options = {}) =>
  api.get(`/repair-requests/${encodeURIComponent(requestId)}/detail`, { signal: options.signal });

/** 상태별 수리 항목 조회 */
export const getCompanyRepairRequests = (params = { status: '', page: 0, size: 20 }) =>
  api.get('/repair-requests/customer-my', { params });

/** 고객사 수리요청 내용 상세조회 */
export const getCustomerRepairRequestDetail = (requestId) =>
  api.get(`/repair-requests/${encodeURIComponent(requestId)}/detail`
  );

/** 소프트 딜리트(다중) */
export const softDeleteRepairRequests = (ids) =>
  api.patch('/repair-requests/delete', { ids: Array.isArray(ids) ? ids : [ids] });

/** 수리 접수 처리 (관리자도 사용) */
export const acceptRepairRequest = (requestId, { engineerId, memo } = {}) => {
  const params = {};
  if (engineerId != null) params.engineerId = engineerId; // 선택된 기사 id (고객일 때만 보낼 수도)
  if (memo != null && memo !== "") params.memo = memo;     // 메모(선택)

  return api.patch(
    `/repair-requests/${encodeURIComponent(requestId)}/accept`,
    null,                         // ← body 없음
    { params }                    // ← 쿼리스트링으로 전송
  );
};

/** 수리 반려 처리 */
export const rejectRepairRequest = (requestId, body) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/reject`, body);

/*****************************************/
/**************** 수리처리 *************/
/*****************************************/
/** 수리 도중 취소처리 */
export const cancelRepairRequest = (requestId, body = {}, options = {}) =>
  api.patch(`/repair-requests/${encodeURIComponent(requestId)}/status`, body, {
    signal: options.signal,
  });

/*****************************************/
/**************** 수리기사 관리 *************/
/*****************************************/
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
  api.get("/engineers/my", { params });

/** 기사 재배정: 특정 수리(repairId)에 engineer 재할당 */
export const reassignEngineer = (repairId, engineerId, body = {}) =>
  api.patch(`/repairs/${encodeURIComponent(repairId)}/reassign`, {
    engineerId,
    ...body, // 메모/사유 등 추가 필드가 있으면 body로 함께 보냄
  });

/*****************************************/
/**************** 수리물품 관리 *************/
/*****************************************/
/** 수리물품 전체 조회 (필터/페이징 옵션) */
export const listRepairItems = (customerId) =>
  api.get(`/repair-items/customer/${encodeURIComponent(customerId)}`);

/** 수리물품 등록 */
export const createRepairItem = (data) =>
  api.post('/repair-items', data); // { customer_id, categoryId, name, price }

/** 수리물품 수정 */
export const updateRepairItem = (id, data) =>
  api.put(`/repair-items/${encodeURIComponent(id)}`, data);

/** 수리물품 삭제 */
export const deleteRepairItem = (id) =>
  api.delete(`/repair-items/${encodeURIComponent(id)}`);

/*****************************************/
/**************** 견적서 관리 *************/
/*****************************************/
/** ✅ 1차 견적 등록 */
export const createFirstEstimate = (payload, options = {}) =>
  api.post("/repair-estimates/first", payload, {
    signal: options.signal,
    headers: { "Content-Type": "application/json" },
  });

/** ✅ 1차 견적 조회 */
export const getFirstEstimate = (requestId, options = {}) =>
  api.get(`/repair-estimates/first/${requestId}`, {
    signal: options.signal,
  });

/**
 * 최종견적서 제출/수정 페이로드 빌더 (영구 URL 사용)
 * - selectedPresets: [{ id, ... }]         // 폼에서 선택된 프리셋들(중복→수량)
 * - note: string                            // 비고
 * - extraCost: string|number                // ± 금액
 * - beforeImgs/afterImgs: [{ remoteUrl?, url?, id? }] // ImageUploadGrid 결과
 */
// 간단 URL 체크
const isHttp = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

/**
 * 최종견적 제출용 페이로드 빌더 (백엔드 요구 스키마 맞춤)
 * - selectedPresets: [{ id }]
 * - note: string
 * - extraCost: string|number (± 금액)
 * - beforeImgs/afterImgs: [{ remoteUrl? , url? }]  // ImageUploadGrid 결과
 * - basePrice: number (프리셋 합계)
 */
export const buildFinalEstimatePayloadV2 = ({
  selectedPresets = [],
  note = "",
  extraCost = 0,
  beforeImgs = [],
  afterImgs = [],
  basePrice = 0,
} = {}) => {
  const extra =
    typeof extraCost === "string"
      ? parseInt(extraCost.replace(/,/g, ""), 10) || 0
      : Number(extraCost) || 0;

  const presetIds = Array.from(
    new Set((selectedPresets || []).map((p) => (isNaN(Number(p.id)) ? p.id : Number(p.id))))
  );

  const toUrls = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => x?.remoteUrl || x?.url) // complete에서 받은 영구 URL 우선
      .filter(isHttp);

  const images = [
    ...toUrls(beforeImgs).map((url) => ({ url, imageType: "BEFORE" })),
    ...toUrls(afterImgs).map((url) => ({ url, imageType: "AFTER" })),
  ];

  return {
    description: note,
    finalPrice: Number(basePrice) + extra,
    presetIds,
    images,
  };
};

/** 최종견적 생성(제출) */
export const createFinalEstimate = (requestId, body, options = {}) =>
  api.post(
    `/repair/${encodeURIComponent(requestId)}/final-estimate`,
    body,
    options
  );

// 필요 시 수정 API
export const updateFinalEstimate = (requestId, body, options = {}) =>
  api.put(
    `/repair/${encodeURIComponent(requestId)}/final-estimate`,
    body,
    options
  );

/*****************************************/
/**************** 프리셋 관리 *************/
/*****************************************/
/** 프리셋 목록 조회 (필터/페이징) */
export const listPresets = (params = {}, options = {}) =>
  api.get("/presets", {
    params,
    signal: options.signal, // ✅ signal은 config로
  });

/** 카테고리·아이템별 프리셋 필터 조회 */
export const filterPresets = (categoryId, itemId, extra = {}) =>
  api.get('/presets', { params: { categoryId, itemId, ...extra } });

/** 프리셋 금액 자동 계산 (배열 형태로 전송) */
export const calculatePresetAmount = (presetIds) =>
  api.post('/presets/calculate', Array.isArray(presetIds) ? presetIds : [presetIds]);

/** 단일 프리셋 견적 미리 보기 (POST /presets/{presetId}) */
export const previewPreset = (presetId, data = {}) =>
  api.post(`/presets/${encodeURIComponent(presetId)}`, data);

/** 프리셋 등록 — DTO: { customerId, categoryId, itemId, name, description, price } */
export const createPreset = (data) =>
  api.post('/presets', data);

/** 프리셋 수정 */
export const updatePreset = (presetId, data) =>
  api.put(`/presets/${encodeURIComponent(presetId)}`, data);

/** 프리셋 삭제 */
export const deletePreset = (presetId) =>
  api.delete(`/presets/${encodeURIComponent(presetId)}`);

/*****************************************/
/**************** 후기 관리 *************/
/*****************************************/
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

/*****************************************/
/**************** 요금정책 관리 *************/
/*****************************************/
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

/*****************************************/
/**************** 업체 카드 조회 *************/
/*****************************************/
/** 지역/카테고리/키워드 필터 + 페이징 조회 */
export const listCustomerCards = (params = { page: 0, size: 8 }) =>
  api.get("/customers/cards", { params });

export const changeRepairStatus = (data) =>
  api.post("/repair-requests/change", data);