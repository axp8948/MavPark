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

  // Mini-map parking spots data (for visualization)
  const [parkingSpots] = useState([
    // Row A1: A01–A11
    { id: 'A01', number: 'A01', status: 'occupied' },
    { id: 'A02', number: 'A02', status: 'available' },
    { id: 'A03', number: 'A03', status: 'occupied' },
    { id: 'A04', number: 'A04', status: 'available' },
    { id: 'A05', number: 'A05', status: 'available' },
    { id: 'A06', number: 'A06', status: 'occupied' },
    { id: 'A07', number: 'A07', status: 'available' },
    { id: 'A08', number: 'A08', status: 'unknown' },
    { id: 'A09', number: 'A09', status: 'available' },
    { id: 'A10', number: 'A10', status: 'occupied' },
    { id: 'A11', number: 'A11', status: 'available' },
    // Row A2: A12–A22
    { id: 'A12', number: 'A12', status: 'available' },
    { id: 'A13', number: 'A13', status: 'occupied' },
    { id: 'A14', number: 'A14', status: 'available' },
    { id: 'A15', number: 'A15', status: 'available' },
    { id: 'A16', number: 'A16', status: 'occupied' },
    { id: 'A17', number: 'A17', status: 'available' },
    { id: 'A18', number: 'A18', status: 'occupied' },
    { id: 'A19', number: 'A19', status: 'available' },
    { id: 'A20', number: 'A20', status: 'unknown' },
    { id: 'A21', number: 'A21', status: 'available' },
    { id: 'A22', number: 'A22', status: 'occupied' },
    // Row B: B01–B11
    { id: 'B01', number: 'B01', status: 'available' },
    { id: 'B02', number: 'B02', status: 'occupied' },
    { id: 'B03', number: 'B03', status: 'available' },
    { id: 'B04', number: 'B04', status: 'available' },
    { id: 'B05', number: 'B05', status: 'occupied' },
    { id: 'B06', number: 'B06', status: 'available' },
    { id: 'B07', number: 'B07', status: 'occupied' },
    { id: 'B08', number: 'B08', status: 'available' },
    { id: 'B09', number: 'B09', status: 'unknown' },
    { id: 'B10', number: 'B10', status: 'available' },
    { id: 'B11', number: 'B11', status: 'occupied' },
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

          {/* Pilot Lot Overview Card */}
          <div className="max-w-xl mx-auto">
            {lots.map((lot) => {
              const statusInfo = getStatusInfo(lot.availableSpots, lot.totalSpots);
              
              return (
                <motion.div
                  key={lot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`p-8 shadow-xl border-2 rounded-xl ${
                      isDarkMode ? 'border-blue-400 bg-gray-800' : 'border-blue-200 bg-white'
                    }`}
                  >
                    <h2
                      className={`${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      } mb-6 text-2xl font-semibold`}
                    >
                      Pilot Lot Overview
                    </h2>

                    <div className="space-y-6">
                      {/* Lot Title */}
                      <div>
                        <h3
                          className={`${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          } mb-1 text-xl font-semibold`}
                        >
                          {lot.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {lot.location}
                        </p>
                      </div>

                      {/* Availability Count */}
                      <div
                        className={`text-4xl font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        {lot.availableSpots} / {lot.totalSpots} spaces free
                      </div>

                      {/* Status Pill */}
                      <div>
                        <span
                          className={`${statusInfo.color} text-white px-4 py-1 rounded-full text-sm font-medium`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <p
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}
                      >
                        Updated 12s ago · Computer vision · No video stored
                      </p>

                      {/* Mini-map */}
                      <div
                        className={`rounded-lg p-4 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          {/* Row A1 Mini */}
                          <div className="flex gap-1">
                            {rowA1.slice(0, 8).map((spot) => (
                              <div
                                key={spot.id}
                                className={`w-3 h-4 rounded-sm ${
                                  spot.status === 'available'
                                    ? 'bg-green-500'
                                    : spot.status === 'occupied'
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          {/* Row A2 Mini */}
                          <div className="flex gap-1">
                            {rowA2.slice(0, 8).map((spot) => (
                              <div
                                key={spot.id}
                                className={`w-3 h-4 rounded-sm ${
                                  spot.status === 'available'
                                    ? 'bg-green-500'
                                    : spot.status === 'occupied'
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          {/* Drive lane */}
                          <div
                            className={`h-2 ${
                              isDarkMode ? 'bg-gray-800' : 'bg-gray-300'
                            } rounded-sm`}
                          />
                          {/* Row B Mini */}
                          <div className="flex gap-1">
                            {rowB.slice(0, 8).map((spot) => (
                              <div
                                key={spot.id}
                                className={`w-3 h-4 rounded-sm ${
                                  spot.status === 'available'
                                    ? 'bg-green-500'
                                    : spot.status === 'occupied'
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* View Spot Map Button */}
                      <motion.button
                        onClick={() => onSelectLot(lot.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View spot map
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

