import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "@/route/PublicRoute";
import ProtectedRoute from "@/route/ProtectedRoute";


export default function App() {
  return (
    <Routes>
      {/* 퍼블릭 라우트 */}
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 유저 보호 라우트 */}
      <Route element={<ProtectedRoute role="USER" />}>
        <Route path="/user/main" element={<UserMainpage />} />
        <Route path="/user/mypage" element={<UserMyPage />} />
      </Route>

      {/* 고객사 관리자 보호 라우트 */}
      <Route element={<ProtectedRoute role="CREATOR" />}>
        <Route path="/creator/main" element={<CreatorMainpage />} />
        <Route path="/creator/mypage" element={<UserMyPage />} />
        {/* 고객사 관리자 레이아웃 (중첩) */}
        <Route path="/creator" element={<CreatorDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
        </Route>
      </Route>

      {/* 고객사 수리기사 보호 라우트 */}
      <Route element={<ProtectedRoute role="CREATOR" />}>
        <Route path="/creator/main" element={<CreatorMainpage />} />
        <Route path="/creator/mypage" element={<UserMyPage />} />
        <Route path="/creator/recipes/upload" element={<RecipeUploadForm />} />
        {/* 고객사 수리기사 대시보드 레이아웃 (중첩) */}
        <Route path="/creator" element={<CreatorDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
        </Route>
      </Route>


      {/* 관리자 보호 라우트 + 레이아웃 */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* 관리자 메뉴별로 추가 */}
        </Route>
      </Route>


    </Routes>
  );
}
