import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { getMyInfo, refreshToken } from '../services/authAPI';

// 토큰에서 최소 유저 뽑기 (+ userId/customerId 지원)
const getMinimalUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    const {
      sub,
      email,
      role,
      roles,
      authorities,
      exp,
      userId,
      uid,
      customerId,
      cid,
    } = decoded;

    const rawRole = role || roles?.[0] || authorities?.[0] || '';

    return {
      email: email || sub || '',
      role: String(rawRole).replace(/^ROLE_/, ''),
      userId: userId ?? uid,            // 토큰에 있으면 즉시 주입
      customerId: customerId ?? cid,    // 토큰에 있으면 즉시 주입
      exp: exp ? exp * 1000 : undefined,
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

  const isAuthenticated = !!accessToken;

  // user 병합 저장 (기존 필드 보존)
  const persistUser = useCallback((u) => {
    setUserState((prev) => {
      const next = u ? { ...prev, ...u } : null;
      if (next) localStorage.setItem('user', JSON.stringify(next));
      else localStorage.removeItem('user');
      return next;
    });
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUserState(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  // 프로필 조회: customerId 매핑 포함
  const refetch = useCallback(async () => {
    try {
      const res = await getMyInfo();
      const profile = res?.data ?? {};

      const normalized = {
        ...profile,
        userId: profile.userId ?? profile.id,
        customerId: profile.customerId ?? profile.customer_id ?? profile.customer?.id,
        role: profile.role || profile.authority || (Array.isArray(profile.authorities) ? profile.authorities[0] : undefined),
        email: profile.email || profile.username || profile.sub,
      };
      if (typeof normalized.role === 'string') normalized.role = normalized.role.replace(/^ROLE_/, '');

      persistUser(normalized);
      return normalized;
    } catch (err) {
      const s = err?.response?.status;
      if (s !== 401 && s !== 403) console.warn('getMyInfo 실패:', s, err?.message);
      return null;
    }
  }, [persistUser]);

  // 로그인/토큰 적용: minimal user 세팅 + (부족하면 프로필 보강)
  const applyLogin = useCallback(async ({ accessToken: token, withProfile = true }) => {
    if (!token) throw new Error('accessToken 누락');

    localStorage.setItem('accessToken', token);
    setAccessToken(token);

    const minimal = getMinimalUserFromToken(token);
    if (minimal) {
      const base = { email: minimal.email, role: minimal.role };
      // 토큰에 userId/customerId가 있으면 즉시 주입
      persistUser({ ...base, userId: minimal.userId, customerId: minimal.customerId });
    }

    if (withProfile) {
      // customerId가 비어있으면 한 번만 프로필 보강
      const needsProfile = !minimal?.customerId || !minimal?.userId;
      if (needsProfile) await refetch();
    }

    return minimal?.role || null;
  }, [persistUser, refetch]);

  // 토큰 리프레시 (성공 시 minimal user 갱신 + 프로필 보강)
  const handleTokenRefresh = useCallback(async () => {
    try {
      const res = await refreshToken();
      const newToken = res?.data?.accessToken;
      if (!newToken) throw new Error('new accessToken 없음');

      localStorage.setItem('accessToken', newToken);
      setAccessToken(newToken);

      const minimal = getMinimalUserFromToken(newToken);
      if (minimal) persistUser({ email: minimal.email, role: minimal.role, userId: minimal.userId, customerId: minimal.customerId });

      // 새 토큰에도 식별자가 없으면 프로필로 보강
      if (!minimal?.customerId || !minimal?.userId) await refetch();

      return true;
    } catch (err) {
      console.warn('⛔ accessToken 갱신 실패:', err?.message || err);
      clearAuth();
      return false;
    }
  }, [clearAuth, persistUser, refetch]);

  // 부팅 시 세션 복구
  useEffect(() => {
    const restore = async () => {
      try {
        if (!accessToken) return;

        const minimal = getMinimalUserFromToken(accessToken);
        if (!minimal) { clearAuth(); return; }

        // minimal 먼저 세팅
        persistUser({ email: minimal.email, role: minimal.role, userId: minimal.userId, customerId: minimal.customerId });

        // 만료면 리프레시
        if (minimal.exp && minimal.exp <= Date.now()) {
          await handleTokenRefresh();
        } else {
          // 토큰에 식별자 없으면 한 번만 프로필 보강
          if (!minimal.customerId || !minimal.userId) await refetch();
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [accessToken, handleTokenRefresh, persistUser, clearAuth, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,                  // { email, role, userId, customerId, ... }
        accessToken,
        isAuthenticated,
        setUser: persistUser,
        login: applyLogin,
        logout: clearAuth,
        refetch,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
