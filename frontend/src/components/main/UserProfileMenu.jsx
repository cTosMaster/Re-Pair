import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const avatarSrc = user?.imageUrl || user?.image_url || "/src/assets/human.png";
  const name = user?.name || user?.username || "사용자";
  const email = user?.email || "";

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* 토글 버튼(이름 + 이메일 + 작은 삼각형) */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="프로필" className="w-8 h-8 rounded-full object-cover border" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <UserRound size={16} />
          </div>
        )}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[13px] font-medium text-gray-800">{name} 님</span>
          <span className="text-[11px] text-gray-500">{email}</span>
        </div>
        {/* 작은 삼각형 아이콘 (CSS로 표현) */}
        <span
          className="ml-1 inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-gray-400"
          aria-hidden
        />
      </button>

      {/* 드롭다운: 위 흰색(마이페이지) + 아래 녹색(로그아웃) */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-xl border bg-white shadow-lg overflow-hidden z-50"
        >
          <Link
          to="/user/mypage"   // 변경된 경로
          role="menuitem"
          onClick={() => setOpen(false)}
          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 text-center"
        >
          마이페이지
        </Link>
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 text-center"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}