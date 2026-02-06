import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import ParkingLots from "./ParkingLots";
import ParkingLotDetail from "./ParkingLotDetail";

function Home() {
  const [selectedLot, setSelectedLot] = useState(null);
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors relative overflow-hidden ${
        isDarkMode 
          ? "bg-[#0a0a0f]" 
          : "bg-[#fafbfc]"
      }`}
    >
      {/* Advanced background with mesh gradients and patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mesh gradient overlay */}
        {!isDarkMode ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
          </>
        )}
        
        {/* Grid pattern overlay */}
        <div 
          className={`absolute inset-0 opacity-[0.03] ${
            isDarkMode ? 'opacity-[0.05]' : ''
          }`}
          style={{
            backgroundImage: `
              linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Animated gradient orbs */}
        {!isDarkMode && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
          </>
        )}

        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-blue-200/20 rounded-3xl rotate-12 animate-float"></div>
        <div className="absolute bottom-32 left-32 w-48 h-48 border border-orange-200/20 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-2xl rotate-45 animate-float animation-delay-6000"></div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {selectedLot === null ? (
            <ParkingLots
              key="lots"
              onSelectLot={setSelectedLot}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          ) : (
            <div className="container mx-auto px-4 py-12">
              <ParkingLotDetail
                key="detail"
                selectedLot={selectedLot}
                onBack={() => setSelectedLot(null)}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(50px, -80px) scale(1.1);
          }
          66% {
            transform: translate(-40px, 40px) scale(0.9);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}

export default Home;

