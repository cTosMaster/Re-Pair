import api from './api';

/**
 * 고객 수리 요청 등록
 * POST /api/repair-requests
 * @param {Object|FormData} data - 파일 포함 시 FormData 사용
 * @param {{ signal?: AbortSignal }} [options]
 */
export const submitRepairRequest = (data, options = {}) => {
    const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData;

    return api.post('/repair-requests', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        signal: options.signal,
    });
};

/**
 * 내가 요청한 수리 목록 조회
 * GET /api/repair-requests/user-my
 * @param {{
 *   statusGroup?: string,   // 예: 'IN_PROGRESS' | 'COMPLETED' | ...
 *   page?: number,          // 기본 0
 *   size?: number,          // 기본 20
 *   keyword?: string
 * }} [query]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMyRepairRequests = (query = {}, options = {}) => {
    const {
        statusGroup,
        page = 0,
        size = 20,
        keyword,
    } = query;

    return api.get('/repair-requests/user-my', {
        params: {
            statusGroup,
            page,
            size,
            ...(keyword ? { keyword } : {}),
        },
        signal: options.signal,
    });
};

/**
 * 내가 요청한 수리 상세 조회
 * GET /api/repair-requests/user-my/{requestId}
 * @param {string|number} requestId
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMyRepairRequestDetail = (requestId, options = {}) =>
    api.get(`/repair-requests/user-my/${encodeURIComponent(requestId)}`, {
        signal: options.signal,
    });

/**
 * 후기 작성 (파일 포함 가능)
 * POST /api/reviews/{repairId}
 * @param {string|number} repairId
 * @param {Object|FormData} data  // ex) { rating: 5, content: '좋아요' } 또는 FormData(이미지 포함)
 * @param {{ signal?: AbortSignal }} [options]
 */
export const createReview = (repairId, data, options = {}) => {
  const isFD = typeof FormData !== 'undefined' && data instanceof FormData;
  return api.post(`/reviews/${encodeURIComponent(repairId)}`, data, {
    headers: isFD ? { 'Content-Type': 'multipart/form-data' } : undefined,
    signal: options.signal,
  });
};

/**
 * 내 후기 조회
 * GET /api/reviews/my
 * @param {{ page?: number, size?: number, keyword?: string }} [params]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMyReviews = (params = { page: 0, size: 20 }, options = {}) =>
  api.get('/reviews/my', { params, signal: options.signal });

/**
* 사용자 위치 + 고객사들 위치 조회
* GET /api/location/{userId}
* - 주의: VITE_API_BASE_URL에 이미 "/api"가 포함되어 있다면 경로는 "/location/..."으로 호출.
* @param {number|string} userId
* @param {{ signal?: AbortSignal }} [options]
*/
export const getUserAndCustomerLocations = (userId, options = {}) => {
    if (userId == null || userId === '') {
        throw new Error('userId는 필수입니다.');
    }
    return api.get(`/location/${encodeURIComponent(userId)}`, {
        signal: options.signal,
    });
};
