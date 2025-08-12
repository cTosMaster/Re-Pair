import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LandingPage from "./pages/public/LandingPage";
import CustomerSalesPage from "./pages/public/CustomerSalesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./components/login/Login";
import ResetPasswordPage from "./components/login/ResetPasswordPage";
import SignUp from "./components/login/SignUp";
import AgreementPage from "./components/companyregistration/AgreementPage";
import CompanyFormContainer from "./components/companyregistration/CompanyFormContainer";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PubilcRoute.jsx";
import UserMainPage from "./pages/user/UserMainPage";
import EngineerMainPage from "./pages/engineer/EngineerMainPage";
import CustomerMainPage from "./pages/custormer/CustomerMainPage";
import PendingApprovalPage from "./pages/repairdetail/PendingApprovalPage";
import WaitingForRepairPage from "./pages/repairdetail/WaitingForRepairPage";
import InProgressPage from "./pages/repairdetail/InProgressPage";
import WaitingForPaymentPage from "./pages/repairdetail/WaitingForPaymentPage";
import WaitingForDeliveryPage from "./pages/repairdetail/WaitingForDeliveryPage";
import CompletedPage from "./pages/repairdetail/CompletedPage";
import MysuriMainPage from "./components/mysuridashboard/MysuriMainPage";
import AdminMainPage from "./pages/admin/AmdinMainPage.jsx";
import AdminAccountManager from "./components/dashboard/admin/AdminAccountManager.jsx";
import CenterManager from "./components/dashboard/admin/CenterManager.jsx";
import CategoryManager from "./components/dashboard/admin/CategoryManager.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import CompleteList from "./components/dashboard/user/CompleteList.jsx";
import RepairRequestForm from "./components/repairdetail/common/RepairRequestForm.jsx";

function App() {
  return (
    <Routes>
      {/* ✅ 비로그인/로그인 전체 기본 공개 페이지 */}
      <Route path="/customer/home" element={<CustomerSalesPage />} />

      {/* ✅ 관리자 전용 */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/main" element={<AdminMainPage />} />
        <Route path="/admin/dash" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="account" element={<AdminAccountManager />} />
          <Route path="centers" element={<CenterManager />} />  
          <Route path="categories" element={<CategoryManager />} />
        </Route>
      </Route>

      {/* ✅ USER 전용 */}
      <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
        <Route path="/user/main" element={<UserMainPage />} />
        <Route path="/user/dash" element={<DashboardLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="completed" element={<CompleteList />} />

        </Route>
      </Route>

      {/* ✅ ENGINEER 전용 */}
      <Route element={<ProtectedRoute allowedRoles={["ENGINEER"]} />}>
        <Route path="/engineer/main" element={<EngineerMainPage />} />
      </Route>

      {/* ✅ CUSTOMER 전용 */}
      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route path="/customer/main" element={<CustomerMainPage />} />
        
        <Route path="/agreementPage" element={<AgreementPage />} /> {/* 약관동의 추가 */}
        <Route path="/companyFormContainer" element={<CompanyFormContainer />} /> {/* 업체등록 폼 추가 */}
      </Route>

      {/* ✅ 로그인 상태면 접근 불가 페이지 */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* 비밀번호찾기 추가 */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/MysuriMainPage" element={<MysuriMainPage />} /> {/* MY수리센터대쉬보드 추가 */}
      </Route>

      {/* [로그인만 필요] 공통 영역 */}
      <Route element={<ProtectedRoute />}>
        {/* 모든 로그인 사용자가 공통으로 쓰는 라우트들 */}
        <Route path="/register-partner" element={<CompanyFormContainer />} />
        <Route path="/agreementPage" element={<AgreementPage />} />
        <Route path="/companyFormContainer" element={<CompanyFormContainer />} />
        <Route path="/1" element={<PendingApprovalPage />} />
        <Route path="/2" element={<WaitingForRepairPage />} />
        <Route path="/3" element={<InProgressPage />} />
        <Route path="/4" element={<WaitingForPaymentPage />} />
        <Route path="/5" element={<WaitingForDeliveryPage />} />
        <Route path="/6" element={<CompletedPage />} />
        <Route path="/7" element={<RepairRequestForm />} />
      </Route>

      {/* ✅ 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;