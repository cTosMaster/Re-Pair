import { createContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  loading: false,
  role: "GUEST",
  // user: 화면에서 주로 쓰는 사용자 객체 (me와 동일하게 세팅)
  user: null,
  // me: /users/me 원본 객체(필요 시 세부 필드 접근)
  me: null,

  // actions
  login: async () => "GUEST", // role 문자열 반환
  logout: () => {},
  refreshMe: async () => {},
});