import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainPage from './pages/public/MainPage';
import LandingPage from "./pages/public/LandingPage";
import CustomerSalesPage from "./pages/public/CustomerSalesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./components/login/Login";
import ResetPasswordPage from "./components/login/ResetPasswordPage";
import SignUp from "./components/login/SignUp";
import AgreementPage from "./components/companyregistration/AgreementPage";
import CompanyFormContainer from "./components/companyregistration/CompanyFormContainer";
import UserMypage from "./mypage/UserMypage";
import PendingApprovalPage from "./pages/repairdetail/PendingApprovalPage";
import WaitingForRepairPage from "./pages/repairdetail/WaitingForRepairPage";
import InProgressPage from "./pages/repairdetail/InProgressPage";
import WaitingForPaymentPage from "./pages/repairdetail/WaitingForPaymentPage";
import WaitingForDeliveryPage from "./pages/repairdetail/WaitingForDeliveryPage";
import CompletedPage from "./pages/repairdetail/CompletedPage";
import MysuriMainPage from "./components/mysuridashboard/MysuriMainPage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ default 경로 */}
        <Route path="/" element={<LandingPage />} />

        {/* ✅ 정병수 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/customer/home" element={<CustomerSalesPage />} />
        {/* ✅ 관리자 전용 레이아웃 안에 중첩 페이지 */}
        <Route path="/admin/dash" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} /> {/* /admin/dashboard */}
        </Route>
        <Route path="/engineer/home" element={<MainPage />} />

        {/* ✅ 김송이 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 라우트 추가 */}
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* 비밀번호찾기 추가 */}
        <Route path="/signup" element={<SignUp />} /> {/* 회원가입 추가 */}
        <Route path="/agreementPage" element={<AgreementPage />} /> {/* 약관동의 추가 */}
        <Route path="/companyFormContainer" element={<CompanyFormContainer />} /> {/* 업체등록 폼 추가 */}
        <Route path="/MysuriMainPage" element={<MysuriMainPage />} /> {/* MY수리센터대쉬보드 추가 */}

        {/* ✅ 김상윤 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/1" element={<PendingApprovalPage />} />
        <Route path="/2" element={<WaitingForRepairPage />} />
        <Route path="/3" element={<InProgressPage />} />
        <Route path="/4" element={<WaitingForPaymentPage />} />
        <Route path="/5" element={<WaitingForDeliveryPage />} />
        <Route path="/6" element={<CompletedPage />} />

        {/* ✅ Not Found (선택) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;