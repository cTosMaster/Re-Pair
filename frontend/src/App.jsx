import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAsset_Button from "/src/components/MyAsset_Button";
import PendingApprovalPage from "./pages/repairdetail/PendingApprovalPage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyAsset_Button />} />
        <Route path="/1" element={<PendingApprovalPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
