import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ 추가
import { sendCode, registerUser } from "../../services/authAPI";

export default function SignUpPage() {
  const navigate = useNavigate(); // ✅ 추가

  const [form, setForm] = useState({
    email: "",
    code: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    postalCode: "",
    roadAddress: "",
    detailAddress: "",
    imageUrl: null,
    lat: null,
    lng: null,
    role: "CUSTOMER",
  });

  const [emailTimer, setEmailTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  // Daum Postcode loader
  useEffect(() => {
    if (!window.daum || !window.daum.Postcode) {
      const s = document.createElement("script");
      s.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      alert("올바른 이메일을 입력하세요.");
      return;
    }
    try {
      await sendCode(form.email);
      setEmailTimer(600);
    } catch {
      alert("인증코드 발송 실패 : 재발송 시도해주세요.");
    }
  };

  useEffect(() => {
    if (emailTimer <= 0) return;
    const t = setInterval(() => setEmailTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [emailTimer]);

  const openPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소검색 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          roadAddress: data.roadAddress || data.address,
        }));
      },
    }).open();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      setLoading(true);
      await registerUser({
        ...form,
        lat: form.lat ?? 37.5665,
        lng: form.lng ?? 126.9780,
      });
      alert("회원가입이 완료되었습니다. 로그인 해주세요.");

      // ✅ 로그인 페이지로 이동 (이메일을 state로 넘겨서 미리 채우기 가능)
      navigate("/login", { replace: true, state: { email: form.email } });
    } catch {
      alert("회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 로고 라인 */}
      <header className="h-16 flex items-center px-6">
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
      </header>

      {/* 메인 섹션 */}
      <main className="mx-auto max-w-lg px-6 pt-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          회원 정보를 입력하세요
        </h1>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* 이메일 + 코드발송 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="아이디(이메일)를 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={emailTimer > 0}
                className="shrink-0 rounded-lg border border-emerald-600 px-3 py-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                {emailTimer > 0 ? `${emailTimer}s` : "인증코드 발송"}
              </button>
            </div>
          </div>

          {/* 인증코드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인증코드</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="메일로 받은 코드를 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="비밀번호를 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={onChange}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <Link
              to="/reset-password"
              className="ml-4 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
            >
              비밀번호 재설정
            </Link>
          </div>

          {/* 이름 / 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="이름을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="(예시: 010-1234-5678)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 역할 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회원 유형</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CUSTOMER">CUSTOMER (고객사 관리자)</option>
              <option value="USER">USER (일반 유저)</option>
            </select>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
                placeholder="우편번호"
                readOnly
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={openPostcode}
                className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                주소검색
              </button>
            </div>
            <input
              type="text"
              name="roadAddress"
              value={form.roadAddress}
              onChange={onChange}
              placeholder="도로명 주소"
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />
            <input
              type="text"
              name="detailAddress"
              value={form.detailAddress}
              onChange={onChange}
              placeholder="상세주소 (동/호수 등)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 제출 */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#9fc87b] py-3 text-white font-bold hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "가입 중..." : "등록하기"}
          </button>

          {/* 하단 링크 */}
          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-emerald-600 hover:underline">로그인</Link>
          </p>
        </form>
      </main>
    </div>
  );
}