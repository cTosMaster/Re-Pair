import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordModal from "../modal/PasswordModal";
import PasswordResultModal from "../modal/PasswordResultModal";
import { sendPassCode, resetPassword, verifyResetCode } from "../../services/authAPI";

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // redirectPath 설정
  const redirectPath = location.state?.from || "/login";
  

  const [form, setForm] = useState({
    email: "",
    emailCode: "",
    newPassword: "",
    newPasswordCheck: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // 1차 모달
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 2차 모달
  const [emailCodeStatus, setEmailCodeStatus] = useState(""); // 'success' or 'error'
  const [emailTimer, setEmailTimer] = useState(0); // 인증코드 타이머

  const isEmailEntered = form.email.trim() !== "";
  const isEmailCodeEntered = form.emailCode.trim() !== "";
  const isPasswordEnabled = emailCodeStatus === "success"; // 인증 완료되면 비밀번호 활성화

  // 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 인증코드 전송
  const handleSendCode = async () => {
  try {
    await sendPassCode(form.email);  // API 호출
    alert("인증코드를 이메일로 전송했습니다.");
    setEmailCodeStatus("");           // 이전 상태 초기화
    setEmailTimer(180);               // 3분 타이머
  } catch (err) {
    console.error(err);
    alert("인증코드 전송 실패");
  }
};

  // 인증코드 확인
  const handleVerifyCode = async () => {
  try {
    const res = await verifyResetCode({
      email: form.email,
      code: form.emailCode,
    });
    console.log("서버 응답:", res.data);

    if (res.data.valid) { // ✅ 여기 valid 확인
      setEmailCodeStatus("success");
      alert("인증되었습니다.");
    } else {
      setEmailCodeStatus("error");
      alert("잘못된 인증번호입니다.");
    }
  } catch (err) {
    console.error(err);
    setEmailCodeStatus("error");
    alert("인증코드 확인 실패");
  }
};

  // 비밀번호 변경
  const handlePasswordChange = async () => {
  if (emailCodeStatus !== "success") {
    alert("이메일 인증이 완료되어야 비밀번호를 변경할 수 있습니다.");
    return;
  }
  if (form.newPassword !== form.newPasswordCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }
  try {
    await resetPassword({
      email: form.email,
      code: form.emailCode,
      newPassword: form.newPassword,
      newPasswordConfirm: form.newPasswordCheck,
    });
    setIsModalOpen(true);
  } catch (err) {
    console.error(err);
    alert("비밀번호 변경 실패");
  }
};

  // 2차 모달 닫기
  const handleResultModalClose = () => {
    setIsResultModalOpen(false);
    navigate(redirectPath);
  };

  // 타이머 관리
  useEffect(() => {
    if (emailTimer <= 0) return;
    const timerId = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [emailTimer]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white">
      <div className="relative w-full max-w-[900px] bg-white px-6 mx-auto">
        {/* 로고 */}
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

        {/* 제목 */}
        <h1 className="text-black font-normal text-3xl mb-16 mt-16" style={{ fontFamily: "Inter, Helvetica" }}>
          비밀번호 재설정
        </h1>

        {/* 이메일 입력 */}
        <label className="block text-black font-normal text-lg mb-2" htmlFor="emailinput">
          이메일 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-4">
          <input
            id="emailinput"
            name="email"
            type="text"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            className="w-full h-12 rounded-[10px] border border-gray-300 px-4"
            style={{ width: "381px" }}
          />
          <button
            className={`rounded-[10px] px-4 py-2 text-white text-sm font-medium transition ${
              isEmailEntered && emailTimer <= 0 ? "bg-[#9FC97B] hover:bg-[#73A647]" : "bg-gray-300 cursor-not-allowed"
            }`}
            style={{ width: "110px", height: "48px", fontSize: "14px" }}
            disabled={!isEmailEntered || emailTimer > 0}
            onClick={handleSendCode}
          >
            {emailTimer > 0 ? `${emailTimer}s` : "인증코드 전송"}
          </button>
        </div>

        {/* 인증코드 입력 */}
        <label className="block text-black font-normal text-lg mb-2">
          인증코드 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-4">
          <input
            name="emailCode"
            type="text"
            placeholder="이메일 인증코드를 입력하세요"
            onChange={handleChange}
            value={form.emailCode}
            className={`w-full max-w-[492px] h-12 border rounded-lg px-4 ${
              emailCodeStatus === "success"
                ? "border-green-500"
                : emailCodeStatus === "error"
                ? "border-red-500"
                : "border-gray-300"
            }`}
            style={{ width: "381px" }}
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={!isEmailCodeEntered}
            className={`px-4 py-2 rounded-[10px] text-white text-sm font-medium transition ${
              isEmailCodeEntered ? "bg-[#9FC97B] hover:bg-[#73A647]" : "bg-gray-300 cursor-not-allowed"
            }`}
            style={{ width: "110px", height: "48px", fontSize: "14px" }}
          >
            인증코드 확인
          </button>
        </div>

        {emailCodeStatus === "success" && <p className="text-green-600 mb-4">인증되었습니다</p>}
        {emailCodeStatus === "error" && <p className="text-red-500 mb-4">잘못된 인증번호입니다</p>}

        {/* 새 비밀번호 */}
        <form
  onSubmit={(e) => {
    e.preventDefault();
    handlePasswordChange();
  }}
>
  <label className="block text-black font-normal text-lg mb-2">새 비밀번호</label>
  <input
    id="newPassword"
    name="newPassword"
    type="password"
    placeholder="새 비밀번호를 입력하세요"
    value={form.newPassword}
    onChange={handleChange}
    disabled={!isPasswordEnabled}
    className="h-12 mb-8 rounded-lg border border-gray-300 px-4 disabled:bg-gray-100"
    style={{ width: "492px" }}
  />

  <label className="block text-black font-normal text-lg mb-2">새 비밀번호 확인</label>
  <input
    id="newPasswordCheck"
    name="newPasswordCheck"
    type="password"
    placeholder="새 비밀번호를 입력하세요"
    value={form.newPasswordCheck}
    onChange={handleChange}
    disabled={!isPasswordEnabled}
    className="h-12 mb-8 rounded-lg border border-gray-300 px-4 disabled:bg-gray-100"
    style={{ width: "492px" }}
  />

  <button
    type="submit"
    disabled={!isPasswordEnabled}
    className={`w-full rounded-lg h-12 mb-10 font-bold text-lg mt-6 text-white ${
      isPasswordEnabled ? "bg-[#9fc87b]" : "bg-gray-300 cursor-not-allowed"
    }`}
    style={{ width: "492px" }}
  >
    비밀번호 변경하기
  </button>
</form>

        {/* 모달 */}
        <PasswordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            setIsResultModalOpen(true);
            setIsModalOpen(false);
          }}
        />
        <PasswordResultModal
          isOpen={isResultModalOpen}
          onClose={handleResultModalClose}
          redirectPath={redirectPath}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;