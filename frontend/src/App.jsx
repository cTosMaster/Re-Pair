import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAsset_Button from "/src/components/MyAsset_Button";
import PendingApprovalPage from "./pages/repairDetail/pendingApprovalPage.jsx";
import WaitingForRepairPage from "./pages/repairDetail/WaitingForRepairPage.jsx";
import InProgressPage from "./pages/repairDetail/InProgressPage.jsx";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyAsset_Button />} />
        <Route path="/1" element={<PendingApprovalPage />} />
        <Route path="/2" element={<WaitingForRepairPage />} />
        <Route path="/3" element={<InProgressPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
