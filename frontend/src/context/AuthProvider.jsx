import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { getMyProfile, refreshToken } from '@/services/authAPI';

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!accessToken && !!user;

  // ✅ 로그아웃 처리
  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  // ✅ 사용자 프로필 조회
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await getMyProfile();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('❌ 사용자 정보 조회 실패:', err);
      clearAuth();
    }
  }, [clearAuth]);

  // ✅ 로그인 처리
  const login = useCallback(
    async ({ accessToken }) => {
      localStorage.setItem('accessToken', accessToken);
      setAccessToken(accessToken);
      await fetchUserProfile();

      const savedUser = JSON.parse(localStorage.getItem('user'));
      return savedUser?.role;
    },
    [fetchUserProfile]
  );

  // ✅ 토큰 자동 갱신
  const handleTokenRefresh = useCallback(async () => {
    try {
      const res = await refreshToken();
      const newToken = res.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      setAccessToken(newToken);
      console.log('🔄 accessToken 갱신 성공');
      return true;
    } catch (err) {
      console.warn('⛔ accessToken 갱신 실패:', err);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  // ✅ 진입 시 세션 복구
  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(accessToken);
        const exp = decoded.exp * 1000;
        const now = Date.now();

        if (exp < now) {
          const refreshed = await handleTokenRefresh();
          if (refreshed) {
            await fetchUserProfile();
          }
        } else {
          await fetchUserProfile();
        }
      } catch (err) {
        console.error('❌ JWT decode 실패:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [accessToken, fetchUserProfile, clearAuth, handleTokenRefresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        login,
        logout: clearAuth,
        refetch: fetchUserProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};