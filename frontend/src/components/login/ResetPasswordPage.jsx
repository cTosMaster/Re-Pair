import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordModal from "../modal/PasswordModal";
import PasswordResultModal from "../modal/PasswordResultModal";

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state.from 값을 받아서 없으면 기본값 지정
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

  const isEmailEntered = form.email.trim() !== "";
  const isEmailCodeEntered = form.emailCode.trim() !== "";

  // 폼 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 이메일 인증코드 전송 (나중에 백엔드 연동 예정)
  const handleSendCode = () => {
    console.log("인증코드 전송");
    // TODO: API 호출 (form.email 사용)
  };

  // 인증코드 확인 (나중에 백엔드 연동 예정)
  const handleVerifyCode = () => {
    console.log("인증코드 확인:", form.emailCode);
    // TODO: API 호출 후 결과에 따라 상태 업데이트
    if (form.emailCode === "123456") {
      setEmailCodeStatus("success");
    } else {
      setEmailCodeStatus("error");
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = () => {
    // TODO: API 호출 (form.email, form.emailCode, form.newPassword 등 사용 가능)
    setIsModalOpen(true);
  };
    // 2차 모달 닫기 시 이 함수로 이동까지 처리
  const handleResultModalClose = () => {
    setIsResultModalOpen(false);
    navigate(redirectPath);  // 로그인에서 왔으면 로그인, 아니면 기본경로로 이동
  };

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
        <h1
          className="text-black font-normal text-3xl mb-16 mt-16"
          style={{ fontFamily: "Inter, Helvetica" }}
        >
          비밀번호 재설정
        </h1>

        {/* 이메일 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="emailinput"
        >
          이메일 <span className="text-red-500">*</span>
        </label>

        {/* 이메일 입력 & 버튼 */}
        <div className="flex gap-2">
          <input
            id="emailinput"
            name="email"
            type="text"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            className="w-full h-12 mb-8 rounded-[10px] border border-gray-300 px-4"
            style={{ width: "381px" }}
          />
          <button
            className={`rounded-[10px] px-4 py-2 text-white text-sm font-medium transition
              ${isEmailEntered ? "bg-[#9FC97B] hover:bg-[#73A647]" : "bg-gray-300 cursor-not-allowed"}`}
            style={{ width: "110px", height: "48px", fontSize: "14px" }}
            disabled={!isEmailEntered}
            onClick={handleSendCode}
          >
            인증코드 전송
          </button>
        </div>

        {/* 인증코드 */}
        <label className="block text-black font-normal text-lg mb-2">
          인증코드 <span className="text-red-500">*</span>
        </label>

        {/* 인증코드 입력칸 & 버튼 */}
        <div className="flex gap-2">
          <input
            name="emailCode"
            type="text"
            placeholder="이메일 인증코드를 입력하세요"
            onChange={handleChange}
            value={form.emailCode}
            className={`w-full max-w-[492px] h-12 mb-2 border rounded-lg px-4 ${
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

        {emailCodeStatus === "success" && (
          <p className="text-green-600 mb-4">인증되었습니다</p>
        )}
        {emailCodeStatus === "error" && (
          <p className="text-red-500 mb-4">잘못된 인증번호입니다</p>
        )}

        {/* 새 비밀번호 */}
        <label className="block text-black font-normal text-lg mb-2">
          새 비밀번호
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
          value={form.newPassword}
          onChange={handleChange}
          className="h-12 mb-8 rounded-lg border border-gray-300 px-4"
          style={{ width: "492px" }}
        />

        {/* 새 비밀번호 확인 */}
        <label className="block text-black font-normal text-lg mb-2">
          새 비밀번호 확인
        </label>
        <input
          id="newPasswordCheck"
          name="newPasswordCheck"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
          value={form.newPasswordCheck}
          onChange={handleChange}
          className="h-12 mb-8 rounded-lg border border-gray-300 px-4"
          style={{ width: "492px" }}
        />

        {/* 비밀번호 변경 버튼 */}
        <button
          onClick={handlePasswordChange}
          className="w-full bg-[#9fc87b] rounded-lg h-12 mb-10 font-bold text-white text-lg mt-6"
          style={{ width: "492px" }}
        >
          비밀번호 변경하기
        </button>

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
          onClose={handleResultModalClose}  // 여기서 경로 이동 처리
          redirectPath={redirectPath}       // 필요하면 props로 넘겨도 됨
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
