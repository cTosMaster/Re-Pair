import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendCode, registerUser } from "../../services/authAPI";
import { useResultModal } from "../../hooks/useResultModal";

/* ===== 스크립트 로더 유틸 ===== */
const loadScriptOnce = (src, id) =>
  new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve(true);
    const s = document.createElement("script");
    if (id) s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const ensureDaumPostcode = () =>
  window.daum?.Postcode
    ? Promise.resolve(true)
    : loadScriptOnce(
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
      "daum-postcode-sdk"
    );

const loadKakaoMaps = () =>
  new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services) return resolve(true);

    const existed = document.getElementById("kakao-maps-sdk");
    const onReady = () => window.kakao.maps.load(() => resolve(true));

    if (existed) {
      existed.addEventListener("load", onReady, { once: true });
      return;
    }

    const s = document.createElement("script");
    s.id = "kakao-maps-sdk";
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    s.async = true;
    s.onload = onReady;
    s.onerror = reject;
    document.head.appendChild(s);
  });

/* ===== 전화번호 마스킹 유틸 (000-0000-0000) ===== */
const maskPhone = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 11); // 최대 11자리
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

/* ===== 페이지 컴포넌트 ===== */
export default function SignUpPage() {
  const navigate = useNavigate();
  const { Modal, openSuccess, openError } = useResultModal();

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

  const [confirmTouched, setConfirmTouched] = useState(false);
  const pwMismatch =
    form.password.length > 0 &&
    form.passwordConfirm.length > 0 &&
    form.password !== form.passwordConfirm;
  
  const [emailTimer, setEmailTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | ok | fail

  // SDK 미리 로드(사용자 체감 줄이기)
  useEffect(() => {
    ensureDaumPostcode().catch(() => { });
    loadKakaoMaps().catch(() => { });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    // ✅ 전화번호만 마스킹 적용(숫자만 허용 + 자동 하이픈)
    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: maskPhone(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      openError("올바른 이메일을 입력하세요.");
      return;
    }
    try {
      await sendCode(form.email);
      setEmailTimer(600);
    } catch {
      openError("인증코드 발송에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (emailTimer <= 0) return;
    const t = setInterval(() => setEmailTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [emailTimer]);

  const openPostcode = async () => {
    if (!window.daum || !window.daum.Postcode) {
      openError("주소검색 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const loadKakaoIfNeeded = () =>
      new Promise((resolve, reject) => {
        if (window.kakao?.maps?.services) return resolve(true);
        if (window.kakao?.maps?.load) {
          return window.kakao.maps.load(() => resolve(true));
        }
        const id = "kakao-maps-sdk";
        let s = document.getElementById(id);
        const onReady = () => {
          if (window.kakao?.maps?.load) {
            window.kakao.maps.load(() => resolve(true));
          } else {
            reject(new Error("kakao.maps.load not available"));
          }
        };
        if (!s) {
          s = document.createElement("script");
          s.id = id;
          s.async = true;
          s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
          s.onerror = reject;
          document.head.appendChild(s);
        }
        s.addEventListener("load", onReady, { once: true });
      });

    new window.daum.Postcode({
      oncomplete: async (data) => {
        const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          roadAddress: address,
        }));
        setForm((prev) => ({ ...prev, lat: null, lng: null }));
        setGeoStatus?.("idle");

        try {
          await loadKakaoIfNeeded();
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(address, (results, status) => {
            if (status === window.kakao.maps.services.Status.OK && results?.[0]) {
              const { x, y } = results[0]; // x=lng, y=lat
              setForm((prev) => ({ ...prev, lat: +y, lng: +x }));
              setGeoStatus?.("ok");
            } else {
              const fallback = `${data.sido || ""} ${data.sigungu || ""}`.trim();
              if (!fallback) return setGeoStatus?.("fail");

              geocoder.addressSearch(fallback, (res2, st2) => {
                if (st2 === window.kakao.maps.services.Status.OK && res2?.[0]) {
                  const { x, y } = res2[0];
                  setForm((prev) => ({ ...prev, lat: +y, lng: +x }));
                  setGeoStatus?.("ok");
                } else {
                  setGeoStatus?.("fail");
                }
              });
            }
          });
        } catch (e) {
          console.warn("Kakao maps load/geocode error:", e);
          setGeoStatus?.("fail");
        }
      },
    }).open();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 비번 불일치 시 인라인 에러만 표시하고 중단
    if (pwMismatch) {
      setConfirmTouched(true);
      return;
    }

    // 전화번호 11자리 검사 (기존 유지)
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      openError("전화번호는 11자리(예: 010-1234-5678)로 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form);
      openSuccess("회원가입을 축하합니다! 🎉\n로그인 페이지로 이동합니다.", {
        onConfirm: () =>
          navigate("/login", { replace: true, state: { email: form.email } }),
      });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
      openError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 공통 모달 */}
      {Modal}

      {/* 헤더 로고 라인 */}
      <header className="h-16 flex items-center px-6">
        <Link to="/" className="text-[20px] font-bold tracking-tight text-green-600">
          Re:pair
        </Link>
      </header>

      {/* 메인 섹션 */}
      <main className="mx-auto max-w-lg px-6 pt-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">회원 정보를 입력하세요</h1>

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
              className={`w-full rounded-lg px-3 py-2 outline-none border ${pwMismatch
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                }`}
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={(e) => {
                setConfirmTouched(true);
                onChange(e);
              }}
              onBlur={() => setConfirmTouched(true)}
              placeholder="비밀번호를 다시 입력하세요"
              className={`w-full rounded-lg px-3 py-2 outline-none border ${pwMismatch && confirmTouched
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                }`}
              required
            />
            {/* 🔴 불일치 안내 문구 */}
            {pwMismatch && confirmTouched && (
              <p className="mt-1 text-xs text-red-600">비밀번호를 확인해주세요.</p>
            )}
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
              inputMode="numeric"
              maxLength={13} // 000-0000-0000
              placeholder="010-1234-5678"
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

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                name="roadAddress"
                value={form.roadAddress}
                onChange={onChange}
                placeholder="도로명 주소"
                readOnly
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {geoStatus === "ok" && (
                <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  좌표 OK
                </span>
              )}
              {geoStatus === "fail" && (
                <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                  좌표 실패
                </span>
              )}
            </div>

            <input
              type="text"
              name="detailAddress"
              value={form.detailAddress}
              onChange={onChange}
              placeholder="상세주소 (동/호수 등)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="mt-2 text-xs text-gray-500">
              lat: {form.lat ?? "-"} / lng: {form.lng ?? "-"}
            </div>
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
            <Link to="/login" className="text-emerald-600 hover:underline">
              로그인
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}