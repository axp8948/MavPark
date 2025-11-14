import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Moon, Sun, HelpCircle, Wifi, WifiOff } from "lucide-react";
import { getParkingLots, getParkingStatus } from "../services/parkingService";
import { useWebSocket } from "../hooks/useWebSocket";
import mavparkLogo from "../assets/images/Mavpark.png";

function ParkingLots({ onSelectLot, isDarkMode, setIsDarkMode }) {
  const [lots, setLots] = useState([
    {
      id: 1,
      name: "Lot 1",
      location: "Maybank",
      totalSpots: 12,
      availableSpots: 5,
    },
  ]);

  // WebSocket integration - connects to Spring Boot backend
  const { isConnected, parkingData, error: wsError } = useWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  // Update parking lots when WebSocket receives data from Spring backend
  useEffect(() => {
    if (parkingData) {
      console.log('Received parking update from Spring:', parkingData);
      
      // Update the lot based on data from Spring backend (ParkingUpdateRequest)
      // parkingData structure: {parkingLotName, totalSpots, freeSpots, occupiedSpots}
      setLots((prevLots) =>
        prevLots.map((lot) => {
          // Match by lot name or update the first lot
          if (lot.name === parkingData.parkingLotName || lot.id === 1) {
            return {
              ...lot,
              name: parkingData.parkingLotName || lot.name,
              totalSpots: parkingData.totalSpots || lot.totalSpots,
              availableSpots: parkingData.freeSpots || lot.availableSpots,
            };
          }
          return lot;
        })
      );
    }
  }, [parkingData]);

  // Fetch initial parking status from Spring backend
  useEffect(() => {
    // Try to get initial data from Spring backend
    getParkingStatus()
      .then((data) => {
        console.log('Initial parking status from Spring:', data);
        if (data.parkingLotName) {
          setLots([{
            id: 1,
            name: data.parkingLotName,
            location: "Maybank",
            totalSpots: data.totalSpots,
            availableSpots: data.freeSpots,
          }]);
        }
      })
      .catch((err) => console.warn('Could not fetch initial status:', err));

    // Also try the old endpoint as fallback
    getParkingLots()
      .then((data) => {
        if (data && data.length > 0) {
          setLots(data);
        }
      })
      .catch((err) => console.warn('Could not fetch parking lots:', err));
  }, []);

  useEffect(() => {
    // Load dark mode preference
    const saved = localStorage.getItem("mavpark-darkMode");
    if (saved !== null) {
      setIsDarkMode(saved === "true");
    }
  }, [setIsDarkMode]);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem("mavpark-darkMode", String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#F8F9FA]"
      }`}
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          {/* Logo and Brand */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={mavparkLogo}
              alt="MavPark Logo"
              className="w-[400px] h-[400px] mb-3 object-contain"
            />
            <h1
              className={`${
                isDarkMode ? "text-blue-400" : "text-[#2563EB]"
              } mb-2 text-3xl font-bold`}
            >
              Welcome to MavPark!
            </h1>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-[#4B5563]"
              } text-base`}
            >
              Find your parking spot at UTA
            </p>
          </div>

          {/* Header Section - Left Aligned */}
          <div className="mb-6">
            <h2
              className={`${
                isDarkMode ? "text-blue-400" : "text-[#2563EB]"
              } text-2xl font-semibold`}
            >
              Available Parking Lots:
            </h2>
          </div>

          {/* Parking Lots Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lots.map((lot) => (
              <motion.div
                key={lot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`p-8 cursor-pointer hover:shadow-xl transition-all border-2 rounded-xl w-[350px] h-[350px] flex flex-col items-center justify-center ${
                    isDarkMode
                      ? "border-blue-400 bg-gray-800"
                      : "border-[#2563EB] bg-white"
                  }`}
                  onClick={() => onSelectLot(lot.id)}
                >
                  <h3
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-[#4B5563]"
                    } mb-6 text-2xl font-semibold`}
                  >
                    {lot.name}
                  </h3>
                  <div className="bg-[#F97316] text-white hover:bg-[#EA580C] px-6 py-3 rounded-full text-base font-medium">
                    {lot.availableSpots}/{lot.totalSpots} Available
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* WebSocket Connection Status */}
          <div className="fixed top-8 right-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
                isConnected
                  ? isDarkMode
                    ? "bg-green-900 text-green-300"
                    : "bg-green-100 text-green-800"
                  : isDarkMode
                  ? "bg-red-900 text-red-300"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Updates</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {wsError ? "Connection Error" : "Connecting..."}
                  </span>
                </>
              )}
            </motion.div>
          </div>

          {/* Dark Mode Toggle and Help Button */}
          <div className="fixed bottom-8 right-8 flex flex-col gap-4 items-end">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-4 rounded-full shadow-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-yellow-400"
                  : "bg-[#2563EB] text-white"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </motion.button>

            {/* Help Button */}
            <motion.button
              className="p-3 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ParkingLots;

