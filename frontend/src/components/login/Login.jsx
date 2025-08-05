import React from "react";
import { Link } from "react-router-dom";

export const Login = () => {
    return (
      

    <div className="flex items-center justify-center w-full min-h-screen bg-white">
            <div className="relative w-full max-w-[900px] bg-white px-6 mx-auto">
        {/* 로고 - 폼 안에 위치 */}
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
          로그인 정보를 입력하세요
        </h1>

        {/* 아이디 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="userid"
        >
          아이디
        </label>

        {/* 아이디 입력 */}
        <input
          id="userid"
          type="text"
          placeholder="아이디를 입력하세요"
                  className="w-full h-12 mb-8 rounded-lg border border-gray-300 px-4"
                  style={{ width: '492px' }}
        />

        {/* 비밀번호 라벨 */}
        <label
          className="block text-black font-normal text-lg mb-2"
          style={{ fontFamily: "Inter, Helvetica" }}
          htmlFor="password"
        >
          비밀번호
        </label>

        {/* 비밀번호 입력 */}
        <input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
                  className="w-full h-12 mb-4 rounded-lg border border-gray-300 px-4"
                  style={{ width: '492px' }}
        />

        {/* 아이디 찾기, 비밀번호 재설정 */}
        <p className="text-gray-500 text-base mb-8 text-right" style={{ width: '492px' }}>
                <Link to="/find-id" className="hover:underline mr-2">아이디 찾기</Link>
                |
                <Link to="/reset-password" className="hover:underline ml-2">비밀번호 재설정</Link>
        </p>

        {/* 등록하기 버튼 */}
              <button className="w-full bg-[#9fc87b] rounded-lg h-12 mb-10 font-bold text-white text-lg"
              style={{ width: "492px" }}>
            
          등록하기
        </button>

        {/* 회원가입 안내 텍스트 */}
              <div className="flex justify-center gap-2 text-lg "
              style={{ width: "492px" }}>
          <span className="text-[#686868]" style={{ fontFamily: "Inter, Helvetica" }}>
            아직 사용자가 아니신가요?
          </span>
          <button className="text-[#6a8a4d] font-normal" style={{ fontFamily: "Inter, Helvetica" }}>
            <Link to="/signup" className="hover">회원가입</Link>
          </button>
        </div>

        
      </div>
    </div>
    
  );
};
export default Login;