import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainPage from './pages/public/MainPage';
import LandingPage from "./pages/public/LandingPage";
import Login from "./components/login/Login";
import ResetPasswordPage from "./components/login/ResetPasswordPage";
import SignUp from "./components/login/SignUp";
import AgreementPage from "./components/companyregistration/AgreementPage";
import CompanyFormContainer from "./components/companyregistration/CompanyFormContainer";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ default 경로 */}
        <Route path="/" element={<LandingPage />} />

        {/* ✅ 정병수 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/customer/home" element={<MainPage />} />
        <Route path="/engineer/home" element={<MainPage />} />
          
        {/* ✅ 김송이 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 라우트 추가 */}
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* 비밀번호찾기 추가 */}
        <Route path="/signup" element={<SignUp />} /> {/* 회원가입 추가 */}
        <Route path="/agreementPage" element={<AgreementPage />} /> {/* 약관동의 추가 */}
        <Route path="/companyFormContainer" element={<CompanyFormContainer />} /> {/* 업체등록 폼 추가 */}
          
        {/* ✅ 김상윤 페이지 - 아직 role 보호 없이 그냥 연결 */}        


        {/* ✅ Not Found (선택) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;