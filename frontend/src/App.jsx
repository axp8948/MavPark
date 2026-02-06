import React from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <ThemeProvider>
    <div className="flex min-h-screen flex-col bg-white">
      {!isDashboard && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
    </ThemeProvider>
  );
}

export default App;