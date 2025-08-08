import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { getMyInfo, refreshToken } from '../services/authAPI';

// 토큰에서 최소 유저 뽑기
const getMinimalUserFromToken = (token) => {
  try {
    const { sub, email, role, roles, authorities, exp } = jwtDecode(token);
    const rawRole = role || roles?.[0] || authorities?.[0] || '';
    return {
      email: email || sub || '',
      role: String(rawRole).replace(/^ROLE_/, ''),
      exp: exp ? exp * 1000 : undefined, // 만료시각(ms) - 참고용
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 토큰만 있으면 인증된 것으로 간주 (서버 권한은 서버가 판단)
  const isAuthenticated = !!accessToken;

  const persistUser = useCallback((u) => {
    setUserState(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    persistUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  }, [navigate, persistUser]);

  // 필요할 때만 호출하는 프로필 조회 (자동 호출 X)
  const refetch = useCallback(async () => {
    try {
      const res = await getMyInfo();
      persistUser(res.data);
      return res.data;
    } catch (err) {
      // 권한 문제는 조용히 무시
      const s = err?.response?.status;
      if (s !== 401 && s !== 403) console.warn('getMyInfo 실패:', s, err?.message);
      return null;
    }
  }, [persistUser]);

  // 로그인/토큰 적용: minimal user 세팅만 하고 끝 (/me 자동 호출 안함)
  const applyLogin = useCallback(async ({ accessToken: token }) => {
    if (!token) throw new Error('accessToken 누락');

    localStorage.setItem('accessToken', token);
    setAccessToken(token);

    const minimal = getMinimalUserFromToken(token);
    if (minimal) persistUser({ email: minimal.email, role: minimal.role });

    return minimal?.role || null;
  }, [persistUser]);

  // 토큰 리프레시 (성공 시 minimal user 갱신)
  const handleTokenRefresh = useCallback(async () => {
    try {
      const res = await refreshToken();
      const newToken = res?.data?.accessToken;
      if (!newToken) throw new Error('new accessToken 없음');

      localStorage.setItem('accessToken', newToken);
      setAccessToken(newToken);

      const minimal = getMinimalUserFromToken(newToken);
      if (minimal) persistUser({ email: minimal.email, role: minimal.role });

      return true;
    } catch (err) {
      console.warn('⛔ accessToken 갱신 실패:', err?.message || err);
      clearAuth();
      return false;
    }
  }, [clearAuth, persistUser]);

  // 새로고침/부팅 시: 토큰만으로 세션 복구 (/me 자동 호출 안함)
  useEffect(() => {
    const restore = async () => {
      try {
        if (!accessToken) return;

        const minimal = getMinimalUserFromToken(accessToken);
        if (!minimal) { clearAuth(); return; }

        // minimal user 먼저 세팅
        persistUser({ email: minimal.email, role: minimal.role });

        // 만료면 리프레시만 시도
        if (minimal.exp && minimal.exp <= Date.now()) {
          await handleTokenRefresh();
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [accessToken, handleTokenRefresh, persistUser, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        setUser: persistUser,  // 외부에서 필요시 직접 세팅 가능
        login: applyLogin,     // 로그인 시 토큰 적용용
        logout: clearAuth,
        refetch,               // 프로필이 꼭 필요할 때만 수동 호출
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};