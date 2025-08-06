import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAsset_Button from "/src/components/MyAsset_Button";
import Login from "./components/login/Login";
import ResetPasswordPage from "./components/login/ResetPasswordPage";
import SignUp from "./components/login/SignUp";
import AgreementPage from "./components/companyregistration/AgreementPage";
import CompanyFormContainer from "./components/companyregistration/CompanyFormContainer";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyAsset_Button />} />
        <Route path="/login" element={<Login />} /> {/* 로그인 라우트 추가 */}
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* 비밀번호찾기 추가 */}
        <Route path="/signup" element={<SignUp />} /> {/* 회원가입 추가 */}
        <Route path="/agreementPage" element={<AgreementPage />} /> {/* 약관동의 추가 */}
        <Route path="/companyFormContainer" element={<CompanyFormContainer />} /> {/* 업체등록 폼 추가 */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
