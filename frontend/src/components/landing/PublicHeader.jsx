import { Link, useLocation } from "react-router-dom";

const PublicHeader = () => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-green-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="text-xl font-bold text-green-600">
          Re:pair
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center space-x-6 text-sm">
          <Link
            to="/"
            className={`hover:underline ${location.pathname === "/" ? "font-semibold" : ""}`}
          >
            홈
          </Link>
          <Link
            to="/partners"
            className={`hover:underline ${location.pathname === "/partners" ? "font-semibold" : ""}`}
          >
            파트너스
          </Link>
        </nav>

        {/* 로그인 버튼 */}
        <Link
          to="/login"
          className="bg-green-300 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-full"
        >
          로그인
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;