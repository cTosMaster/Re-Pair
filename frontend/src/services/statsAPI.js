import api from './api';

/** 월별 요청 건수 */
export const getMonthlyStats = (params = { year: undefined, month: undefined }) =>
  api.get('/stats/monthly', { params });

/** 월별 완료 건수 */
export const getMonthlyCompletedStats = (params = { year: undefined, month: undefined }) =>
  api.get('/stats/monthly/completed', { params });

/** 월별 종합 지표(차트용) */
export const getMonthlyChart = (params = { year: undefined }) =>
  api.get('/stats/monthly/chart', { params });

/** 고객사별 요청 건수 */
export const getCustomerRequestCount = (customerId, params = {}) => {
  if (customerId == null) throw new Error('customerId는 필수');
  return api.get('/stats/customer', { params: { customerId, ...params } });
};

/** 고객사별 완료율 */
export const getCustomerCompletionRate = (customerId, params = {}) => {
  if (customerId == null) throw new Error('customerId는 필수');
  return api.get('/stats/customer/completion', { params: { customerId, ...params } });
};

/** 고객사 평균 평점 */
export const getCustomerAverageRating = (customerId, params = {}) => {
  if (customerId == null) throw new Error('customerId는 필수');
  return api.get('/stats/customer', {
    params: { type: 'averageRating', customerId, ...params },
  });
};

/** (옵션) 고객사 KPI 한 번에 가져오기 */
export const getCustomerKpis = async (customerId) => {
  const [cnt, rate, avg] = await Promise.all([
    getCustomerRequestCount(customerId),
    getCustomerCompletionRate(customerId),
    getCustomerAverageRating(customerId),
  ]);
  return {
    requestCount: cnt.data,
    completionRate: rate.data,
    averageRating: avg.data,
  };
};