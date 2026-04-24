import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import LotsPage from "../pages/LotsPage";
import Dashboard from "../pages/Dashboard";
import AboutUs from "../pages/AboutUs";
import Team from "../pages/Team";
import SpotCalibrationTool from "../pages/SpotCalibrationTool";
import Contact from "../pages/Contact";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lots" element={<LotsPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/team" element={<Team />} />
      <Route path="/calibrate" element={<SpotCalibrationTool />} />
      <Route path="/contact" element={<Contact />} />

    </Routes>
  );
}

export default AppRoutes;
