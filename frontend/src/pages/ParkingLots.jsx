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
      name: "Lot A",
      location: "F-12",
      totalSpots: 84,
      availableSpots: 0,
      status: "active", // active or upcoming
    },
    {
      id: 2,
      name: "Lot B",
      location: "F-10",
      totalSpots: 0,
      availableSpots: 0,
      status: "active",
    },
    {
      id: 3,
      name: "Lot C",
      location: "Coming Soon",
      totalSpots: 0,
      availableSpots: 0,
      status: "upcoming",
    },
    {
      id: 4,
      name: "Lot D",
      location: "Coming Soon",
      totalSpots: 0,
      availableSpots: 0,
      status: "upcoming",
    },
  ]);

  // Mini-map parking spots data (for visualization)
  // All spots set to 'unknown' (gray) until CV model sends real data
  const [parkingSpots] = useState([
    // Row A1: A01–A11
    { id: 'A01', number: 'A01', status: 'unknown' },
    { id: 'A02', number: 'A02', status: 'unknown' },
    { id: 'A03', number: 'A03', status: 'unknown' },
    { id: 'A04', number: 'A04', status: 'unknown' },
    { id: 'A05', number: 'A05', status: 'unknown' },
    { id: 'A06', number: 'A06', status: 'unknown' },
    { id: 'A07', number: 'A07', status: 'unknown' },
    { id: 'A08', number: 'A08', status: 'unknown' },
    { id: 'A09', number: 'A09', status: 'unknown' },
    { id: 'A10', number: 'A10', status: 'unknown' },
    { id: 'A11', number: 'A11', status: 'unknown' },
    // Row A2: A12–A22
    { id: 'A12', number: 'A12', status: 'unknown' },
    { id: 'A13', number: 'A13', status: 'unknown' },
    { id: 'A14', number: 'A14', status: 'unknown' },
    { id: 'A15', number: 'A15', status: 'unknown' },
    { id: 'A16', number: 'A16', status: 'unknown' },
    { id: 'A17', number: 'A17', status: 'unknown' },
    { id: 'A18', number: 'A18', status: 'unknown' },
    { id: 'A19', number: 'A19', status: 'unknown' },
    { id: 'A20', number: 'A20', status: 'unknown' },
    { id: 'A21', number: 'A21', status: 'unknown' },
    { id: 'A22', number: 'A22', status: 'unknown' },
    // Row B: B01–B11
    { id: 'B01', number: 'B01', status: 'unknown' },
    { id: 'B02', number: 'B02', status: 'unknown' },
    { id: 'B03', number: 'B03', status: 'unknown' },
    { id: 'B04', number: 'B04', status: 'unknown' },
    { id: 'B05', number: 'B05', status: 'unknown' },
    { id: 'B06', number: 'B06', status: 'unknown' },
    { id: 'B07', number: 'B07', status: 'unknown' },
    { id: 'B08', number: 'B08', status: 'unknown' },
    { id: 'B09', number: 'B09', status: 'unknown' },
    { id: 'B10', number: 'B10', status: 'unknown' },
    { id: 'B11', number: 'B11', status: 'unknown' },
  ]);

  // Calculate status message based on availability
  const getStatusInfo = (available, total) => {
    const percentAvailable = (available / total) * 100;
    if (percentAvailable >= 50) {
      return { text: 'Plenty of space', color: 'bg-green-500' };
    } else if (percentAvailable >= 20) {
      return { text: 'Filling up', color: 'bg-yellow-500' };
    } else {
      return { text: 'Almost full', color: 'bg-red-500' };
    }
  };

  // Derive rows for the visual layout (for mini-map)
  const rowA1 = parkingSpots.filter((spot) => {
    if (!spot.number.startsWith('A')) return false;
    const n = parseInt(spot.number.substring(1), 10);
    return n >= 1 && n <= 11;
  });

  const rowA2 = parkingSpots.filter((spot) => {
    if (!spot.number.startsWith('A')) return false;
    const n = parseInt(spot.number.substring(1), 10);
    return n >= 12 && n <= 22;
  });

  const rowB = parkingSpots.filter((spot) => spot.number.startsWith('B'));

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
          // Match by lot name or update the first active lot (not upcoming)
          if ((lot.name === parkingData.parkingLotName || (lot.id === 1 && lot.status === "active")) && lot.status !== "upcoming") {
            return {
              ...lot,
              name: parkingData.parkingLotName || lot.name,
              totalSpots: parkingData.totalSpots || lot.totalSpots,
              availableSpots: parkingData.freeSpots || lot.availableSpots,
              status: "active", // Preserve active status
            };
          }
          return lot; // Keep upcoming lots unchanged
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
          setLots((prevLots) =>
            prevLots.map((lot) => {
              // Update only Lot A (id: 1) with active status
              if (lot.id === 1) {
                return {
                  ...lot,
                  name: data.parkingLotName || lot.name,
                  location: lot.location,
                  totalSpots: data.totalSpots || lot.totalSpots,
                  availableSpots: data.freeSpots || lot.availableSpots,
                  status: "active",
                };
              }
              return lot; // Keep other lots (upcoming) unchanged
            })
          );
        }
      })
      .catch((err) => console.warn('Could not fetch initial status:', err));

    // Also try the old endpoint as fallback
    getParkingLots()
      .then((data) => {
        if (data && data.length > 0) {
          // Merge with existing lots, preserving upcoming lots
          setLots((prevLots) => {
            const updatedLots = prevLots.map((prevLot) => {
              const matchingLot = data.find((d) => d.name === prevLot.name || d.id === prevLot.id);
              if (matchingLot && prevLot.status !== "upcoming") {
                return {
                  ...prevLot,
                  ...matchingLot,
                  status: "active",
                };
              }
              return prevLot;
            });
            return updatedLots;
          });
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
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Hero Header Section */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <img
                src={mavparkLogo}
                alt="MavPark Logo"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-orange-500'
              } bg-clip-text text-transparent`}
            >
              Welcome to MavPark
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`text-lg md:text-xl ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } max-w-2xl mx-auto`}
            >
              Find your perfect parking spot at UTA with real-time availability
            </motion.p>
          </div>

          {/* Parking Lots Grid */}
          <div className="mb-8">
            <h2
              className={`text-2xl md:text-3xl font-bold mb-6 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              Available Parking Lots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lots.map((lot, index) => {
                const isUpcoming = lot.status === "upcoming";
                const statusInfo = isUpcoming 
                  ? { text: 'Upcoming', color: 'bg-gray-500' }
                  : getStatusInfo(lot.availableSpots, lot.totalSpots);
                const availabilityPercent = lot.totalSpots > 0 
                  ? (lot.availableSpots / lot.totalSpots) * 100 
                  : 0;
                
                return (
                  <motion.div
                    key={lot.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={!isUpcoming ? { y: -8, transition: { duration: 0.2 } } : {}}
                    className="group"
                  >
                    <div
                      className={`relative h-full p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                        isUpcoming
                          ? isDarkMode
                            ? 'bg-gray-800/40 border-gray-700/30 opacity-75'
                            : 'bg-gray-100/50 border-gray-300/50 opacity-75'
                          : isDarkMode
                          ? 'bg-gray-800/60 border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20'
                          : 'bg-white/70 border-gray-200/50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10'
                      }`}
                    >
                      {/* Gradient accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                        isUpcoming
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                          : availabilityPercent >= 50 
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : availabilityPercent >= 20
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}></div>

                      {/* Lot Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className={`text-2xl font-bold mb-1 ${
                                isUpcoming
                                  ? isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  : isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {lot.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                isUpcoming
                                  ? isDarkMode ? 'text-gray-600' : 'text-gray-500'
                                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {lot.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Availability Stats or Upcoming Message */}
                      {isUpcoming ? (
                        <div className="mb-4">
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                              <div className={`text-4xl mb-2 ${
                                isDarkMode ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                🚧
                              </div>
                              <p
                                className={`text-sm font-medium ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}
                              >
                                Coming Soon
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Availability Stats */}
                          <div className="mb-4">
                            <div className="flex items-baseline gap-2 mb-2">
                              <span
                                className={`text-3xl font-bold ${
                                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}
                              >
                                {lot.availableSpots}
                              </span>
                              <span
                                className={`text-lg ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              >
                                / {lot.totalSpots}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              spaces available
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${availabilityPercent}%` }}
                                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                                className={`h-full ${
                                  availabilityPercent >= 50
                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                    : availabilityPercent >= 20
                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                    : 'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                              ></motion.div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Status Badge */}
                      <div className="mb-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            statusInfo.color
                          } text-white`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* View Map Button or Coming Soon */}
                      {isUpcoming ? (
                        <div
                          className={`w-full py-3 px-4 rounded-xl font-semibold text-center ${
                            isDarkMode
                              ? 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                              : 'bg-gray-200/50 text-gray-500 border border-gray-300/50'
                          }`}
                        >
                          Coming Soon
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => onSelectLot(lot.id)}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                            isDarkMode
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Spot Map
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </motion.div>
      </div>

      {/* WebSocket Connection Status - Fixed Position */}
      <div className="fixed top-24 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md border ${
            isConnected
              ? isDarkMode
                ? "bg-green-500/20 border-green-500/30 text-green-300"
                : "bg-green-500/10 border-green-500/20 text-green-700"
              : isDarkMode
              ? "bg-red-500/20 border-red-500/30 text-red-300"
              : "bg-red-500/10 border-red-500/20 text-red-700"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-semibold">Live Updates</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {wsError ? "Connection Error" : "Connecting..."}
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Dark Mode Toggle and Help Button - Fixed Position */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-end">
        {/* Dark Mode Toggle */}
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-4 rounded-full shadow-xl backdrop-blur-md border transition-all ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/50 text-yellow-400 hover:bg-gray-700/80"
              : "bg-blue-600/90 border-blue-500/50 text-white hover:bg-blue-500/90"
          }`}
          whileHover={{ scale: 1.1, rotate: 15 }}
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
          className={`p-3.5 rounded-full shadow-xl backdrop-blur-md border transition-all ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/50 text-gray-300 hover:bg-gray-700/80"
              : "bg-gray-900/80 border-gray-800/50 text-white hover:bg-gray-800/80"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default ParkingLots;

