import React from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotificationBell from "./components/NotificationBell";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <ThemeProvider>
    <NotificationProvider>
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />

      {/* Notification bell — fixed position, top-left below navbar */}
      <div className="fixed top-20 left-6 z-50">
        <NotificationBell />
      </div>

      <Toaster
        containerStyle={{
          top: 76,
          left: 84,
        }}
        toastOptions={{
          style: {
            borderRadius: '20px',
            padding: '20px 20px',
          },
        }}
      />
    </div>
    </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;