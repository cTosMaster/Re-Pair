import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAsset_Button from "/src/components/MyAsset_Button";
import PendingApprovalPage from "./pages/repairdetail/PendingApprovalPage";
import WaitingForRepairPage from "./pages/repairdetail/WaitingForRepairPage";
import InProgressPage from "./pages/repairdetail/InProgressPage";
import WaitingForPaymentPage from "./pages/repairdetail/WaitingForPaymentPage";
import WaitingForDeliveryPage from "./pages/repairdetail/WaitingForDeliveryPage";
import CompletedPage from "./pages/repairdetail/CompletedPage";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyAsset_Button />} />
        <Route path="/1" element={<PendingApprovalPage />} />
        <Route path="/2" element={<WaitingForRepairPage />} />
        <Route path="/3" element={<InProgressPage />} />
        <Route path="/4" element={<WaitingForPaymentPage />} />
        <Route path="/5" element={<WaitingForDeliveryPage />} />
        <Route path="/6" element={<CompletedPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
