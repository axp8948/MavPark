import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-white">
      {!isDashboard && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;