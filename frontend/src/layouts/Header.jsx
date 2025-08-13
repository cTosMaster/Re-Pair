import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout as apiLogout } from "../services/authAPI";
import NotificationButton from "../components/button/NotificationButton";
import UserProfileMenu from "../components/main/UserProfileMenu";

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, user, logout: signOut, setUser } = useAuth();

  const role = useMemo(
    () => (user?.role ? String(user.role).replace(/^ROLE_/, "") : ""),
    [user]
  );

  const navByRole = {
    USER: [
      { label: "업체 등록", path: "/register-partner" },
      { label: "업체 목록", path: "/partners" },
      { label: "My 수리견적", path: "/user/dash" },
    ],
    ENGINEER: [
      { label: "업체 등록", path: "/register-partner" },
      { label: "업체 목록", path: "/partners" },
      { label: "My 업무관리", path: "/my-center" },
    ],
    CUSTOMER: [
      { label: "업체 등록", path: "/register-partner" },
      { label: "업체 목록", path: "/partners" },
      { label: "My 수리센터", path: "/MysuriMainPage" },
    ],
    ADMIN: [
      { label: "업체 목록", path: "/partners" },
      { label: "My 플랫폼 관리", path: "/admin/dash" },
    ],
  };

  const navItems = role ? navByRole[role] || [] : [];

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* 서버 세션 없는 경우 무시 */ }
    signOut();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser?.(null);
  };

  const unread = 0; // TODO: 알림 API 연동

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center">
        {/* 좌: 로고 */}
        <Link to="/" className="text-[20px] font-bold tracking-tight text-green-600">
          Re:pair
        </Link>

        {/* 우: 네비게이션 + 알림 + 프로필 (우측 정렬) */}
        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <nav className="hidden md:flex items-center gap-8 text-[13px]">
            {isAuthenticated &&
              navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative group px-1 py-1 transition-colors",
                      "font-bold",
                      isActive ? "text-gray-900 font-extrabold" : "text-gray-800",
                      "hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-sm",
                    ].join(" ")}
                  >
                    <span className="relative inline-block">
                      {item.label}
                      {/* 실제 요소로 만든 언더라인 */}
                      <span
                        aria-hidden="true"
                        className={[
                          "pointer-events-none absolute left-1/2 -bottom-1 h-[2px] w-0 -translate-x-1/2",
                          "bg-green-500 rounded-full",
                          "transition-all duration-300",
                          "group-hover:left-0 group-hover:w-full group-hover:translate-x-0",
                        ].join(" ")}
                      />
                    </span>
                  </Link>
                );
              })}
          </nav>

          {isAuthenticated ? (
            <>
              <NotificationButton count={unread} onClick={() => { /* navigate('/notifications') */ }} />
              <UserProfileMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <div className="flex items-center gap-4 text-[13px]">
              <Link className="px-1 py-1 font-medium text-gray-800 hover:text-green-700 hover:opacity-90">로그인</Link>
              <Link className="px-1 py-1 font-medium text-gray-800 hover:text-green-700 hover:opacity-90">회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}