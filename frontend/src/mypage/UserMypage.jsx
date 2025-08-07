import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WithdrawUserModal from "../components/modal/WithdrawUserModal";
import PasswordResultModal from "../components/modal/PasswordResultModal";

const UserMypage = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false); // 회원탈퇴 모달 상태

  // 비밀번호 변경 성공 여부를 location.state에서 받아서 초기값으로 설정
  const passwordChangedFromState = location.state?.passwordChanged || false;
  const [isPasswordResultModalOpen, setIsPasswordResultModalOpen] = useState(passwordChangedFromState);

  // 사용자 정보 상태 (초기값은 빈 문자열, 나중에 API로 받아서 세팅)
  const [userInfo, setUserInfo] = useState({
    id: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    // 실제로는 fetch/axios 등으로 API 호출
    const fetchUserInfo = () => {
      const dataFromBackend = {
        id: "surisuri",
        phone: "010-1111-1111",
        email: "surisuri@example.com"
      };
      setUserInfo(dataFromBackend);
    };
    fetchUserInfo();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result); // base64 미리보기
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleWithdrawConfirm = () => {
    console.log("회원 탈퇴 처리"); // 실제 탈퇴 로직 연동
    setIsWithdrawModalOpen(false);
    navigate("/"); // 탈퇴 후 홈으로 리디렉션 (원하는 경로로 변경 가능)
  };

  // 비밀번호 변경 완료 모달 닫기 핸들러
  const handlePasswordResultModalClose = () => {
    setIsPasswordResultModalOpen(false);
    // 모달 닫을 때 location.state 초기화(선택사항)
    navigate("/user-mypage", { replace: true, state: {} });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full h-[610px] bg-white border border-gray-200 shadow-sm rounded-md" >
        <div className="max-w-4xl mx-auto p-8 mt-20">
          <h2 className="text-lg font-medium mb-6">내 정보</h2>

          <div className="flex items-center gap-8 mb-10">
            {/* 프로필 사진 */}
            <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <g transform="translate(0, -2)">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </g>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 20.458a10 10 0 0119.084 0"
                  />
                </svg>
              )}
            </div>

            {/* 안내 텍스트 */}
            <p className="text-gray-700 text-sm">
              <strong>{userInfo.id || "사용자"}</strong>님, 현재 일반 사용자 입니다.
            </p>

            {/* 프로필 사진 변경 버튼 */}
            <button
              onClick={handleUploadClick}
              className="ml-auto bg-[#9fc87b] hover:bg-[#73a647] text-white text-sm font-semibold py-2 px-4 rounded rounded-[10px]"
              style={{width:"174px", height:"46px"}}
            >
              프로필 사진 변경
            </button>

            {/* 숨겨진 파일 업로드 input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 입력 폼 */}
          <form className="grid grid-cols-2 gap-x-16 gap-y-6">
            {/* 아이디 */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">아이디</label>
              <input
                type="text"
                value={userInfo.id}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="text"
                value={userInfo.phone}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={userInfo.email}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex items-center gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate("/reset-password", { state: { from: "/userMypage" } })}
                className="bg-[#9fc87b] hover:bg-[#73a647] text-white font-semibold py-2 px-6 rounded rounded-[10px]"
                style={{width:"174px", height:"46px"}}
              >
                비밀번호 변경
              </button>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded rounded-[10px]"
                style={{width:"174px", height:"46px"}}
              >
                회원 탈퇴
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 회원 탈퇴 모달 */}
      {isWithdrawModalOpen && (
        <WithdrawUserModal
          onClose={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdrawConfirm}
        />
      )}

      {/* 비밀번호 변경 완료 모달 */}
      <PasswordResultModal
        isOpen={isPasswordResultModalOpen}
        onClose={handlePasswordResultModalClose}
        redirectPath="/userMypage" // 필요하면 넘겨서 사용 가능
      />
    </div>
  );
};

export default UserMypage;
