import api from './api';

/** 고객사 가입 요청 대기목록 조회 */
export const getPendingCustomers = (params = { page: 0, size: 10 }) =>
  api.get('/admin/customers/pending', { params });

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

/** 사용자 삭제/비활성화 (patch body 예: { is_active: false }) */
export const patchUser = (userId, data) =>
  api.patch(`/admin/users/${encodeURIComponent(userId)}`, data);

/** 플랫폼 카테고리 전체 조회 */
export const getCategories = () => api.get('/admin/categories');

/** 플랫폼 카테고리 추가/수정(Upsert) */
export const upsertCategory = (data) => api.put('/admin/categories', data);

/** 플랫폼 카테고리에서 삭제 */
export const deleteCategory = (categoryId) =>
  api.delete(`/admin/categories/${encodeURIComponent(categoryId)}`);