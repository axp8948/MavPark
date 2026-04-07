import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import AboutUs from "../pages/AboutUs";
import SpotCalibrationTool from "../pages/SpotCalibrationTool";
import Contact from "../pages/Contact";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/calibrate" element={<SpotCalibrationTool />} />
      <Route path="/contact" element={<Contact />} />

    </Routes>
  );
}

export default AppRoutes;
