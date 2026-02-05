import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import About from "../pages/About";
import Features from "../pages/Features";
import Contact from "../pages/Contact";
import ParkingInfo from "../pages/ParkingInfo";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/parking-info" element={<ParkingInfo />} />
    </Routes>
  );
}

export default AppRoutes;
