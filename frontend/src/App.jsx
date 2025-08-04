import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAsset_Button from "/src/components/MyAsset_Button";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyAsset_Button />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
