import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logout as apiLogout } from "../services/authAPI"; // 이름 충돌 방지
import { useMemo } from "react";

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout: signOut, setUser } = useAuth();

  // role 정규화 (ROLE_ 접두어 대비)
  const role = useMemo(
    () => (user?.role ? String(user.role).replace(/^ROLE_/, "") : ""),
    [user]
  );

  const navByRole = {
    USER: [
      { label: "업체등록", path: "/register-partner" },
      { label: "업체목록", path: "/partners" },
      { label: "My 수리견적", path: "/my-estimates" },
    ],
    ENGINEER: [
      { label: "업체등록", path: "/register-partner" },
      { label: "업체목록", path: "/partners" },
      { label: "My 업무관리", path: "/my-tasks" },
    ],
    CUSTOMER: [
      { label: "업체등록", path: "/register-partner" },
      { label: "업체목록", path: "/partners" },
      { label: "My 수리센터", path: "/my-center" },
    ],
    ADMIN: [
      { label: "대시보드", path: "/admin/dash" },
      { label: "업체목록", path: "/partners" },
    ],
  };

  const navItems = role ? navByRole[role] || [] : [];

  const handleLogout = async () => {
    try {
      await apiLogout(); // 서버측 refresh 토큰 무효화 등
    } catch (err) {
      console.warn("서버 로그아웃 실패(무시 가능):", err?.response?.status, err?.message);
    } finally {
      // 컨텍스트 로그아웃: 토큰/유저 제거 + /login 이동 처리
      signOut();
      // 혹시 컨텍스트가 없거나 실패 대비한 이중 안전장치
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser?.(null);
      } catch {
        alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        {/* 로고 */}
        <div className="flex justify-between items-center mb-2 md:mb-0">
          <Link to="/" className="text-xl font-bold text-green-600">
            Re:Pair
          </Link>
          <div className="md:hidden ml-auto space-x-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:underline"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:underline">
                  로그인
                </Link>
                <Link to="/signup" className="text-sm text-gray-700 hover:underline">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-wrap gap-4 text-sm text-gray-700">
          {isAuthenticated &&
            navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:underline ${
                  location.pathname === item.path ? "text-blue-600 font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}

          <div className="hidden md:flex ml-auto space-x-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-700 hover:underline"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium hover:underline ${
                    location.pathname === "/login" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className={`text-sm font-medium hover:underline ${
                    location.pathname === "/signup" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;