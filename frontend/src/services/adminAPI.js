import api from './api';

// 📌 고객사 가입 요청 목록 조회 (대기중인 것들)
export const getPendingCustomers = () => api.get('/admin/customers/pending');

// 📌 고객사 가입 승인
export const approveCustomer = (customerId) =>
  api.post(`/admin/customers/${customerId}/approve`);

// 📌 고객사 가입 반려
export const rejectCustomer = (customerId) =>
  api.post(`/admin/customers/${customerId}/reject`);

// 📌 전체 고객사 목록 조회 (페이징 포함)
export const getCustomerList = (page = 0, size = 10) =>
  api.get(`/admin/customers?page=${page}&size=${size}`);

// 📌 특정 고객사 등록 내용 상세 조회
export const getCustomerDetail = (customerId) =>
  api.get(`/admin/customers/${customerId}`);

// 📌 고객사 정보 수정
export const updateCustomer = (customerId, updateData) =>
  api.post(`/admin/customers/${customerId}`, updateData);

// 📌 고객사 삭제/등록 취소
export const deleteCustomer = (customerId) =>
  api.delete(`/admin/customers/${customerId}`);

// 📌 사용자 목록 조회 (페이징 포함)
export const getUserList = (page = 0, size = 10) =>
  api.get(`/admin/users?page=${page}&size=${size}`);

// 📌 사용자 정보 수정
export const updateUser = (userId, updateData) =>
  api.put(`/admin/users/${userId}`, updateData);

// 📌 사용자 삭제 또는 비활성화
export const deactivateUser = (userId) =>
  api.patch(`/admin/users/${userId}`);

// 📌 플랫폼 제품 카테고리 전체 조회
export const getPlatformCategories = () => api.get('/admin/categories');

// 📌 플랫폼 제품 카테고리 추가
export const addPlatformCategory = (categoryData) =>
  api.put('/admin/categories', categoryData);

// 📌 플랫폼 제품 카테고리 삭제
export const deletePlatformCategory = (categoryId) =>
  api.delete(`/admin/categories/${categoryId}`);