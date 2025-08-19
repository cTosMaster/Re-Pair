import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../services/authAPI";
import { useAuth } from "../../hooks/useAuth";
import { useResultModal } from "../../hooks/useResultModal";

export const Login = () => {
  const navigate = useNavigate();
  const { login: applyLogin } = useAuth();
  const { Modal, openError } = useResultModal(); // ✅ 에러 모달 훅

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const roleRedirectMap = {
    USER: "/user/main",
    ENGINEER: "/engineer/main",
    CUSTOMER: "/customer/main",
    ADMIN: "/admin/dash",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1) 로그인 요청
      const { data } = await apiLogin({ email: email.trim(), password });

      // 2) 토큰 꺼내기
      const accessToken = data?.accessToken || data?.token || data?.access_token;
      if (!accessToken) throw new Error("로그인 응답에 토큰이 없습니다.");

      // 3) 컨텍스트에 토큰/핵심값 적용
      const roleFromResp = data?.role ? String(data.role).replace(/^ROLE_/, "") : null;
      const roleFromToken = await applyLogin({
        accessToken,
        refreshToken: data?.refreshToken,
        email: data?.email,
        role: roleFromResp || undefined,
        userId: data?.userId ?? data?.id,
        customerId: data?.customerId ?? data?.customer_id,
      });

      const finalRole = roleFromResp || roleFromToken;

      // 4) 리다이렉트
      navigate(roleRedirectMap[finalRole] || "/", { replace: true });
    } catch {
      const msg =
        "로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.";
      openError(msg); // ✅ 실패 시 에러 모달
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white">
      {/* 공통 모달 렌더 */}
      {Modal}

      <div className="relative w-full max-w-[900px] bg-white px-6 mx-auto">
        <Link to="/">
          <h2
            className="fixed top-4 left-16 text-[#9fc87b] font-bold text-xl md:text-2xl"
            style={{
              fontFamily: "Inter, Helvetica",
              WebkitTextStrokeWidth: "1px",
              WebkitTextStrokeColor: "#9fc87b",
              margin: 0,
              backgroundColor: "transparent",
              zIndex: 9999,
            }}
          >
            Re:pair
          </h2>
        </Link>

        <form onSubmit={handleSubmit} className="mx-auto flex flex-col items-center" style={{ width: "492px" }}>
          <h1 className="text-black font-normal text-3xl mb-16 mt-16 self-start" style={{ fontFamily: "Inter, Helvetica" }}>
            로그인 정보를 입력하세요
          </h1>

          {/* 이메일 */}
          <label className="block w-full text-black font-normal text-lg mb-2" htmlFor="userid">
            아이디
          </label>
          <input
            id="userid"
            type="email"
            placeholder="이메일을 입력하세요"
            className="w-full h-12 mb-8 rounded-lg border border-gray-300 px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          {/* 비밀번호 */}
          <label className="block w-full text-black font-normal text-lg mb-2" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full h-12 mb-4 rounded-lg border border-gray-300 px-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <p className="text-gray-500 text-base mb-8 self-end" style={{ width: "100%" }}>
            <Link to="/reset-password" state={{ from: "/login" }} className="hover:underline ml-2">
              비밀번호 재설정
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9fc87b] rounded-lg h-12 mb-10 font-bold text-white text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="flex justify-center gap-2 text-lg" style={{ width: "100%" }}>
            <span className="text-[#686868]">아직 사용자가 아니신가요?</span>
            <Link to="/signup" className="text-[#6a8a4d] font-normal hover:underline">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;