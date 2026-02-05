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
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
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
  );
}

export default Home;

