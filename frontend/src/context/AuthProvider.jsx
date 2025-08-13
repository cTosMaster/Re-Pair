import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { getMyInfo, refreshToken } from '../services/authAPI';

// CUSTOMER/ADMIN만 customerId 필요
const roleNeedsCustomer = (r) => ['CUSTOMER', 'ADMIN'].includes(String(r || '').toUpperCase());

// ---- helpers
const getMinimalUserFromToken = (token) => {
  try {
    const d = jwtDecode(token);
    const {
      sub, email, role, roles, authorities, exp,
      customerId, customer_id, cid,
    } = d;

    const a0 = Array.isArray(authorities) ? authorities[0] : undefined;
    const aStr = typeof a0 === 'string' ? a0 : a0?.authority;
    const rawRole = role || roles?.[0] || aStr || '';

    return {
      email: email || sub || '',
      role: String(rawRole).replace(/^ROLE_/, ''),
      customerId: customerId ?? customer_id ?? cid,
      exp: exp ? exp * 1000 : undefined,
    };
  } catch {
    return null;
  }
};

const shallowEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a || {});
  const kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
};
// ----

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!accessToken;

  // 자동 보강 딱 1회만 실행하기 위한 가드
  const autoRefetchDoneRef = useRef(false);

  // user 병합 저장 (값이 바뀔 때만 저장/리렌더)
  const persistUser = useCallback((u) => {
    setUserState((prev) => {
      const next = u ? { ...prev, ...u } : null;
      if (shallowEqual(prev ?? {}, next ?? {})) return prev; // 변화 없으면 no-op
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
    autoRefetchDoneRef.current = false; // 세션 종료 시 초기화
    navigate('/login', { replace: true });
  }, [navigate]);
  // /me 보강: 필요한 최소 필드만
  const refetch = useCallback(async () => {
    try {
      const res = await getMyInfo();
      const p = res?.data ?? {};
      const normalized = {
        email: p.email || p.username || p.sub || null,
        role:
          (typeof p.role === 'string' ? p.role :
            p.authority ||
            (Array.isArray(p.authorities)
              ? (typeof p.authorities[0] === 'string'
                  ? p.authorities[0]
                  : p.authorities[0]?.authority)
              : undefined)) || null,
        customerId: p.customerId ?? p.customer_id ?? p.customer?.id ?? null,
      };
      if (typeof normalized.role === 'string') {
        normalized.role = normalized.role.replace(/^ROLE_/, '');
      }
      persistUser(normalized);
      return normalized;
    } catch (err) {
      const s = err?.response?.status;
      if (s !== 401 && s !== 403) console.warn('getMyInfo 실패:', s, err?.message);
      return null;
    }
  }, [persistUser]);

  // 로그인/토큰 적용 — 로그인 응답의 항목(email, role, customerId)만 초기 제공
  const applyLogin = useCallback(async ({
    accessToken: token,
    refreshToken: rt,
    withProfile = true,
    email,
    role,
    customerId,
  } = {}) => {
    if (!token) throw new Error('accessToken 누락');

    localStorage.setItem('accessToken', token);
    if (rt) localStorage.setItem('refreshToken', rt);
    setAccessToken(token);

    // 로그인 응답을 신뢰: 초기 user는 응답 항목만 제공
    const normalizedRole = typeof role === 'string' ? role.replace(/^ROLE_/, '') : role;
    let nextUser = {
      email: email || null,
      role: normalizedRole || null,
      customerId: customerId ?? null,
    };

    // 응답에 role/customerId가 비었을 때만 토큰에서 최소 보강
    if (!nextUser.role || nextUser.customerId == null) {
      const minimal = getMinimalUserFromToken(token) || {};
      nextUser = {
        email: nextUser.email ?? minimal.email ?? null,
        role: nextUser.role ?? minimal.role ?? null,
        customerId: nextUser.customerId ?? minimal.customerId ?? null,
      };
    }

    persistUser(nextUser);

    // CUSTOMER/ADMIN 이면서 customerId가 아직 없으면 1회만 /me 보강
    if (withProfile && roleNeedsCustomer(nextUser.role) && !autoRefetchDoneRef.current && !nextUser.customerId) {
      autoRefetchDoneRef.current = true;
      await refetch();
    }

    return nextUser?.role || null;
  }, [persistUser, refetch]);

  // 토큰 리프레시
  const handleTokenRefresh = useCallback(async () => {
    try {
      const res = await refreshToken();
      const newToken = res?.data?.accessToken;
      if (!newToken) throw new Error('new accessToken 없음');

      localStorage.setItem('accessToken', newToken);
      setAccessToken(newToken);

      const minimal = getMinimalUserFromToken(newToken) || {};
      persistUser({
        email:      minimal.email ?? user?.email,
        role:       minimal.role  ?? user?.role,
        customerId: minimal.customerId ?? user?.customerId,
      });

      // 여기도 "한 번만"
      if (
        roleNeedsCustomer(minimal.role) &&
        !autoRefetchDoneRef.current &&
        !minimal?.customerId
      ) {
        autoRefetchDoneRef.current = true;
        await refetch();
      }
      return true;
    } catch (err) {
      console.warn('⛔ accessToken 갱신 실패:', err?.message || err);
      clearAuth();
      return false;
    }
  }, [clearAuth, persistUser, refetch, user]);

  // 부팅 시 세션 복구
  useEffect(() => {
    const restore = async () => {
      try {
        if (!accessToken) return;

        const minimal = getMinimalUserFromToken(accessToken);
        if (!minimal) { clearAuth(); return; }

        // 최소 정보 주입
        persistUser({
          email: minimal.email,
          role: minimal.role,
          customerId: minimal.customerId,
        });

        if (minimal.exp && minimal.exp <= Date.now()) {
          await handleTokenRefresh();
        } else if (
          roleNeedsCustomer(minimal.role) &&
          !autoRefetchDoneRef.current &&
          !minimal.customerId
        ) {
          autoRefetchDoneRef.current = true;
          await refetch();
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
        user,
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
