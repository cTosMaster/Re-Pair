import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import WithdrawUserModal from "../components/modal/WithdrawUserModal";
import PasswordResultModal from "../components/modal/PasswordResultModal";
import { getMyInfo, deactivateAccount } from "../../src/services/authAPI"; // api 모듈 사용

const UserMypage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const passwordChangedFromState = location.state?.passwordChanged || false;
  const [isPasswordResultModalOpen, setIsPasswordResultModalOpen] = useState(passwordChangedFromState);

  const [userInfo, setUserInfo] = useState({
    id: "",
    phone: "",
    email: "",
    imageUrl: ""
  });

  // ✅ 로그인 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await getMyInfo();
        const data = res.data;
        setUserInfo({
          id: user?.name || data.name || data.username || data.id || "",
          phone: data.phone || "",
          email: data.email || "",
          imageUrl: data.imageUrl || ""
        });
        if (data.imageUrl) setImageUrl(data.imageUrl);
      } catch (err) {
        console.error("유저 정보 가져오기 실패:", err);
      }
    };
    fetchUserInfo();
  }, [user]); 

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleWithdrawConfirm = async () => {
  try {
    await deactivateAccount(); // api 연결
    setIsWithdrawModalOpen(false);
    localStorage.removeItem("accessToken"); // 로그인 상태 초기화
    navigate("/"); // 탈퇴 후 홈으로
  } catch (err) {
    console.error("회원 탈퇴 실패:", err);
  }
};

  const handlePasswordResultModalClose = () => {
    setIsPasswordResultModalOpen(false);
    navigate("/user-mypage", { replace: true, state: {} });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full h-[610px] bg-white border border-gray-200 shadow-sm rounded-md">
        <div className="max-w-4xl mx-auto p-8 mt-20">

          {/* 뒤로가기 버튼 */}
          <button
            type="button"
            onClick={() => navigate("/")} // 원하면 -1로 이전 페이지로도 가능: navigate(-1)
            className="mb-4 text-sm text-gray-500 hover:underline"
          >
            &larr; 뒤로가기
          </button>
          <h2 className="text-lg font-medium mb-6">내 정보</h2>

          <div className="flex items-center gap-8 mb-10">
            <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center" />
              )}
            </div>

            <p className="text-gray-700 text-sm">
              <strong>{userInfo.id || "사용자"}</strong>님, 현재 일반 사용자 입니다.
            </p>

            <button
              onClick={handleUploadClick}
              className="ml-auto bg-[#9fc87b] hover:bg-[#73a647] text-white text-sm font-semibold py-2 px-4 rounded rounded-[10px]"
              style={{ width: "174px", height: "46px" }}
            >
              프로필 사진 변경
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <form className="grid grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">아이디</label>
              <input
                type="text"
                value={userInfo.id}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="text"
                value={userInfo.phone}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={userInfo.email}
                readOnly
                className="w-full h-10 px-3 border border-gray-300 rounded text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate("/reset-password", { state: { from: "/user-mypage" } })}
                className="bg-[#9fc87b] hover:bg-[#73a647] text-white font-semibold py-2 px-6 rounded rounded-[10px]"
                style={{ width: "174px", height: "46px" }}
              >
                비밀번호 변경
              </button>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded rounded-[10px]"
                style={{ width: "174px", height: "46px" }}
              >
                회원 탈퇴
              </button>
            </div>
          </form>
        </div>
      </div>

      {isWithdrawModalOpen && (
        <WithdrawUserModal
          onClose={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdrawConfirm} // 여기서 API 호출
        /> 
      )}

      <PasswordResultModal
        isOpen={isPasswordResultModalOpen}
        onClose={handlePasswordResultModalClose}
        redirectPath="/user-mypage"
      />
    </div>
  );
};

export default UserMypage;
