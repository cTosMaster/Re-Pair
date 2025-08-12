import api from './api';

/** 고객사 가입 요청 대기목록 조회 */
export const getPendingCustomers = (params = { page: 0, size: 10 }) =>
  api.get('/admin/customers/pending', { params });

/** 최근 승인된 고객사 목록 조회 */
export const getRecentApprovals = (size = 5) =>
  getCustomers({ status: 'APPROVED', page: 0, size, sort: 'approvedAt,desc' });

/** 고객사 가입 승인 */
export const approveCustomer = (customerId) =>
  api.post(`/admin/customers/${encodeURIComponent(customerId)}/approve`);

/** 고객사 가입 반려 (사유가 있으면 body에 포함) */
export const rejectCustomer = (customerId, body) =>
  api.post(`/admin/customers/${encodeURIComponent(customerId)}/reject`, body);

/** 고객사 전체 목록 조회 */
export const getCustomers = (params = { page: 0, size: 10 }) =>
  api.get('/admin/customers', { params });

/** 고객사 등록폼(상세) 조회 */
export const getCustomerDetail = (customerId) =>
  api.get(`/admin/customers/${encodeURIComponent(customerId)}`);

/** 고객사 등록 정보 수정 (사양상 POST로 정의됨) */
export const updateCustomer = (customerId, data) =>
  api.post(`/admin/customers/${encodeURIComponent(customerId)}`, data);

/** 고객사 삭제/등록 취소 */
export const deleteCustomer = (customerId) =>
  api.delete(`/admin/customers/${encodeURIComponent(customerId)}`);

/** 사용자 목록 조회 */
export const getUsers = (params = { page: 0, size: 10 }) =>
  api.get('/admin/users', { params });

/** 사용자 정보 수정 */
export const updateUser = (userId, data) =>
  api.put(`/admin/users/${encodeURIComponent(userId)}`, data);

// 하드 삭제: DELETE /api/admin/users/{id}
export const deleteUser = (userId) =>
  api.delete(`/admin/users/${encodeURIComponent(userId)}`);

// 소프트 비활성화: PATCH /api/admin/users/{id}/disable  (바디 없음)
export const disableUser = (userId) =>
  api.patch(`/admin/users/${encodeURIComponent(userId)}/disable`);

/** ▷ 페이지네이션 리스트: Spring Page<PlatformCategoryDto>
 *  @param {object} params
 *  @param {number} params.page      기본 0
 *  @param {number} params.size      기본 10
 *  @param {string} params.sortBy    기본 'categoryId'
 *  @param {string} params.sortDir   'asc' | 'desc' (기본 'asc')
 */
export const listPlatformCategories = ({
  page = 0,
  size = 10,
  sortBy = "categoryId",
  sortDir = "asc",
} = {}) =>
  api.get("/admin/platform-categories", {
    params: { page, size, sortBy, sortDir },
  });

/** ▷ (호환) 전체 카테고리 한번에 가져오기: UI용
 *  - 기존 컴포넌트들이 사용하던 getCategories 유지
 *  - 기본 size 크게 잡아 한번에 조회(필요시 오버라이드)
 */
export const getCategories = (params = {}) =>
  listPlatformCategories({ page: 0, size: 1000, sortBy: "categoryId", sortDir: "asc", ...params });

/** ▷ 생성: PlatformCategoryCreateRequest { name } */
export const createCategory = (data /* { name } */) =>
  api.post("/admin/platform-categories", data);

/** ▷ 수정: PlatformCategoryUpdateRequest { name, ... } 가정
 *  - 컨트롤러가 /{id} PathVariable을 요구하므로 id는 URL로 전달
 */
export const updateCategory = (id, data /* { name } */) =>
  api.put(`/admin/platform-categories/${encodeURIComponent(id)}`, data);

/** ▷ 삭제 */
export const deleteCategory = (id) =>
  api.delete(`/admin/platform-categories/${encodeURIComponent(id)}`);

/** ▷ (선택) 구버전 업서트 호환 래퍼: 남겨두면 기존 코드도 동작
 *  payload에 categoryId 있으면 update, 없으면 create
 */
export const upsertCategory = (payload = {}) => {
  const { categoryId, ...rest } = payload;
  if (categoryId == null) return createCategory(rest);
  return updateCategory(categoryId, rest);
};