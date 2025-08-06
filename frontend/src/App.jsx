import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainPage from './pages/public/MainPage';
import LandingPage from "./pages/public/LandingPage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ default 경로 */}
        <Route path="/" element={<LandingPage />} />

        {/* ✅ 역할별 페이지 - 아직 role 보호 없이 그냥 연결 */}
        <Route path="/customer/home" element={<MainPage />} />
        <Route path="/engineer/home" element={<MainPage />} />

        {/* ✅ Not Found (선택) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
