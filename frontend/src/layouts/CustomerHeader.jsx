import { Link } from "react-router-dom";

export default function CustomerHeader({
  companyName = "ramsung",
  rightSlot = null,          // 우측에 버튼/프로필 등 넣고 싶을 때
  className = "",
}) {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="mx-auto max-w-screen-xl">
        <div className="h-12 grid grid-cols-3 items-center">
          {/* Left: Brand */}
          <div className="pl-4">
            <Link
              to="/"
              className="inline-block text-green-600 font-semibold"
              aria-label="Go to Home"
            >
              Re:<span className="font-semibold">pair</span>
            </Link>
          </div>

          {/* Center: Company name */}
          <div className="text-center">
            <span className="text-black font-extrabold">{companyName}</span>
          </div>

          {/* Right: optional actions */}
          <div className="pr-4 justify-self-end">{rightSlot}</div>
        </div>
      </div>
    </header>
  );
}