import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const url = new URL(config.url || '', config.baseURL);

  // 공개 엔드포인트(토큰 붙이지 않음)
  const PUBLIC = [
    '/auth/login',
    '/auth/refresh',
    '/users/send-signup-code',
    '/users/register',
  ];

  const isPublic = PUBLIC.some(p => url.pathname.endsWith(p));
  if (config.method?.toLowerCase() === 'options') return config; // preflight는 패스

  if (token && !isPublic) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    // console.log('[✅ Auth]', url.href);
  } else {
    // console.warn('[ℹ️ Public or no token]', url.href);
  }
  return config;
});

export default api;