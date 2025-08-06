import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { label: "업체목록", path: "/partners" },
    { label: "업체등록", path: "/register-partner" },
    { label: "My 수리견적", path: "/my-estimates" },
    { label: "My 수리센터", path: "/my-center" },
    { label: "My 업무관리", path: "/my-tasks" },
  ];

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        {/* 상단 로고 및 로그인/회원가입 */}
        <div className="flex justify-between items-center mb-2 md:mb-0">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Re:Pair
          </Link>
          <div className="md:hidden ml-auto space-x-2">
            <Link to="/login" className="text-sm text-gray-700 hover:underline">로그인</Link>
            <Link to="/signup" className="text-sm text-gray-700 hover:underline">회원가입</Link>
          </div>
        </div>

        {/* 네비게이션 바 */}
        <nav className="flex flex-wrap gap-4 text-sm text-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:underline ${location.pathname === item.path ? "text-blue-600 font-semibold" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="hidden md:flex ml-auto space-x-4">
            <Link
              to="/login"
              className={`text-sm font-medium hover:underline ${location.pathname === "/login" ? "text-blue-600" : "text-gray-700"}`}
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className={`text-sm font-medium hover:underline ${location.pathname === "/signup" ? "text-blue-600" : "text-gray-700"}`}
            >
              회원가입
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
