import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const normalize = (r) => String(r || "").replace(/^ROLE_/, "").toUpperCase();

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 로그인 안 됨 → 로그인으로 보내되, 돌아올 위치 기억
  const authed = typeof isAuthenticated === "boolean" ? isAuthenticated : !!user;
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // allowedRoles가 주어지지 않으면: 로그인만 체크하고 통과
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // 역할 제한이 있으면: ROLE_ 접두어/대소문자 방어해서 비교
  const role = normalize(user?.role);
  const whitelist = allowedRoles.map(normalize);

  if (!role || !whitelist.includes(role)) {
    // 권한 없음 → 홈(또는 /403 등)으로
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}