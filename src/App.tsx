import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import AdminDashboard from "./Components/AdminDashboard";
import HotspotPrediction from "./Components/HotspotPrediction";
import Ambulances from "./Components/Ambulances";
import Dispatch from "./Components/Dispatch";





function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/adminDB" element={<AdminDashboard />} />
        <Route path="/adminDB/hps" element={<HotspotPrediction />} />
        <Route path="/adminDB/resources" element={<Ambulances />} />
        <Route path="/adminDB/disp" element={<Dispatch />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
