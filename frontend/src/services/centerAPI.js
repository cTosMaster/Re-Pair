import api from './api';

/** 전체 고객사 목록 조회 (페이징 옵션) */
export const getCustomers = (params = { page: 0, size: 10 }) =>
  api.get('/customers', { params });

/** 고객사 키워드 검색 (예: keyword='전자') */
export const searchCustomers = (keyword, params = { page: 0, size: 10 }) =>
  api.get('/customers/search', { params: { keyword, ...params } });

/** 한 고객사 상세 조회 */
export const getCustomerById = (customerId) =>
  api.get(`/customers/${encodeURIComponent(customerId)}`);

/**
 * 고객사 카테고리 생성
 * body 예시: { name: '냉장고', description: '...' }
 */
export const createCustomerCategory = (customerId, data) =>
  api.post(`/customer-categories/${encodeURIComponent(customerId)}`, data);

/** 고객사 카테고리 목록 조회 */
export const getCustomerCategories = (customerId) =>
  api.get(`/customer-categories/${encodeURIComponent(customerId)}`);

/** 카테고리 이름/정보 수정 (부분 수정) */
export const updateCustomerCategory = (categoryId, data) =>
  api.patch(`/customer-categories/${encodeURIComponent(categoryId)}`, data);

/** 고객사 카테고리 삭제 */
export const deleteCustomerCategory = (categoryId) =>
  api.delete(`/customer-categories/${encodeURIComponent(categoryId)}`);