import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import { getMyInfo } from "../services/authAPI";

/**
 * localStorage key들(필요 시 프로젝트 규칙에 맞게 변경)
 */
const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";

function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default function AuthProvider({ children }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    loading: false,
    role: "GUEST",
    user: null, // 화면에서 쓰는 대표 사용자 (= me)
    me: null,   // /users/me 원본
  });

  /**
   * 로그인
   * - 토큰 저장 → Authorization 헤더 설정
   * - /users/me 한 번만 호출해서 컨텍스트에 저장
   * - 최종 role 문자열을 return (Login.jsx에서 쓰는 패턴 호환)
   */
  const login = useCallback(async ({
    accessToken,
    refreshToken,
    email,
    role,          // 서버 응답에 role이 들어오면 우선 사용
    userId,
    customerId,
  }) => {
    // 토큰 저장
    if (accessToken) localStorage.setItem(LS_ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(LS_REFRESH, refreshToken);
    setAuthHeader(accessToken);

    // 우선 로딩 true
    setState((s) => ({ ...s, loading: true }));

    // /users/me — 로그인 시 1회 호출
    let me = null;
    try {
      const { data } = await getMyInfo();
      me = data ?? null;
    } catch {
      me = null;
    }

    // role 결정: (우선순위) 파라미터 role → me.role → me.roles[0] → me.authorities[0] → GUEST
    const roleFromMeArray =
      (Array.isArray(me?.roles) && me.roles[0]) ||
      (Array.isArray(me?.authorities) && me.authorities[0]?.authority?.replace(/^ROLE_/, ""));
    const finalRole = String(
      role ||
      me?.role ||
      roleFromMeArray ||
      "GUEST"
    ).replace(/^ROLE_/, "").toUpperCase();

    // user(대표)에는 me를 그대로 넣고, me가 없으면 최소 정보라도 보관
    const fallbackUser = me ?? {
      id: userId ?? null,
      email: email ?? null,
      role: finalRole,
      customerId: customerId ?? null,
    };

    setState({
      isAuthenticated: true,
      loading: false,
      role: finalRole,
      user: fallbackUser,
      me: me, // 원본 유지(필요 시 상세 접근)
    });

    // Login.jsx에서 쓰는 반환값
    return finalRole;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    setAuthHeader(null);
    setState({
      isAuthenticated: false,
      loading: false,
      role: "GUEST",
      user: null,
      me: null,
    });
  }, []);

  /**
   * 명시적으로 /me 다시 가져오고 싶을 때(옵션)
   * - 로그인 후 특정 화면에서 신선한 me가 필요하면 사용
   * - 요구사항엔 "로그인시에만"이지만, 재조회 필요 시 쓸 수 있도록 제공
   */
  const refreshMe = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { data } = await getMyInfo();
      const me = data ?? null;
      const roleFromMeArray =
        (Array.isArray(me?.roles) && me.roles[0]) ||
        (Array.isArray(me?.authorities) && me.authorities[0]?.authority?.replace(/^ROLE_/, ""));
      const newRole = String(me?.role || roleFromMeArray || state.role || "GUEST")
        .replace(/^ROLE_/, "").toUpperCase();

      setState((s) => ({
        ...s,
        loading: false,
        role: newRole,
        user: me ?? s.user,
        me,
      }));
      return me;
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      throw e;
    }
  }, [state.role]);

  const value = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      role: state.role,
      user: state.user,
      me: state.me,
      login,
      logout,
      refreshMe,
    }),
    [state, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}