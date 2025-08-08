import api from './api';

// ✅ 로그인
export const login = (data) => api.post('/auth/login', data);

// ✅ 액세스 토큰 발급
export const getAccessToken = () => api.post('/auth/token');

// ✅ 리프레시 토큰 갱신
export const refreshToken = () => api.post('/auth/refresh');

// ✅ 로그아웃 (refreshToken 있으면 같이 전달)
export const logout = async () => {
  const rt = localStorage.getItem('refreshToken');
  try {
    await api.post('/auth/logout', rt ? { refreshToken: rt } : {});
  } catch (e) {
    // 서버에 로그아웃 API가 없거나 실패해도 UI는 계속 진행
    console.warn('서버 로그아웃 실패(무시 가능):', e?.response?.status, e?.message);
  }
};

// ✅ 비밀번호 재설정용 인증코드 발송
export const sendPassCode = (email) => api.post('/auth/send-reset-code', { email });

// ✅ 이메일 인증 코드 발송
export const sendCode = (email) => api.post('/users/send-signup-code', { email });

// ✅ 비밀번호 재설정
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ✅ 일반 회원가입
export const registerUser = (data) => api.post('/users/register', data);

// ✅ 고객사 회원가입 신청
export const requestCustomerSignup = (data) => api.post('/customers/signup-request', data);

// ✅ 내 정보 조회
export const getMyInfo = () => api.get('/users/me');

// ✅ 내 정보 수정 (옵션)
export const updateMyInfo = (data) => api.put('/users/me', data);

// ✅ 계정 비활성화
export const deactivateAccount = () => api.delete('/users/me/deactivate');