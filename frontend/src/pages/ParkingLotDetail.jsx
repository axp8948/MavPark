import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Car } from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";

function ParkingLotDetail({ selectedLot, onBack, isDarkMode }) {
  const [parkingSpots, setParkingSpots] = useState([
    { id: 1, number: "A1", status: "available" },
    { id: 2, number: "A2", status: "occupied" },
    { id: 3, number: "A3", status: "unknown" },
    { id: 4, number: "A4", status: "available" },
    { id: 5, number: "A5", status: "occupied" },
    { id: 6, number: "A6", status: "available" },
    { id: 7, number: "B1", status: "available" },
    { id: 8, number: "B2", status: "unknown" },
    { id: 9, number: "B3", status: "occupied" },
    { id: 10, number: "B4", status: "available" },
    { id: 11, number: "B5", status: "unknown" },
    { id: 12, number: "B6", status: "occupied" },
  ]);

  // Fetch spots when lot is selected
  useEffect(() => {
    if (selectedLot) {
      getParkingSpotsByLot(selectedLot)
        .then((data) => setParkingSpots(data))
        .catch((err) => console.error("Error fetching spots:", err));
    }
  }, [selectedLot]);

  const lot = {
    id: 1,
    name: "Lot 1",
    location: "Maybank",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <button
        onClick={onBack}
        className={`mb-6 px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-colors ${
          isDarkMode
            ? "border-blue-400 text-blue-400 hover:bg-gray-800"
            : "border-blue-200 text-blue-600 hover:bg-blue-50"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lots
      </button>

      <div
        className={`${
          isDarkMode ? "bg-gray-800 border-blue-400" : "bg-white border-blue-100"
        } rounded-2xl p-8 shadow-lg border-2`}
      >
        <div className="mb-8">
          <h2
            className={`${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            } mb-2 text-2xl font-semibold`}
          >
            {lot.name}
          </h2>
          <p
            className={`${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } text-lg`}
          >
            View parking availability
          </p>
        </div>

        {/* Parking Spots Grid - Arranged like actual parking lot */}
        <div className="relative max-w-2xl mx-auto min-h-[500px]">
          {/* Center divider line */}
          <div
            className={`absolute left-1/2 top-0 bottom-0 w-0.5 ${
              isDarkMode ? "bg-gray-600" : "bg-gray-300"
            } -translate-x-1/2 z-0`}
          />

          <div className="grid grid-cols-2 gap-12 relative z-10">
            {/* Left side parking spots */}
            <div className="space-y-4">
              {parkingSpots.slice(0, 6).map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative h-20 rounded-lg
                    border-l-4 transition-all shadow-sm
                    ${
                      spot.status === "available"
                        ? isDarkMode
                          ? "bg-green-900/30 border-green-500"
                          : "bg-green-50 border-green-500"
                        : spot.status === "occupied"
                        ? isDarkMode
                          ? "bg-red-900/30 border-red-600"
                          : "bg-red-50 border-red-600"
                        : isDarkMode
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-gray-100 border-gray-600"
                    }
                  `}
                >
                  <div className="h-full flex items-center justify-between px-4 gap-3">
                    <span
                      className={`${
                        spot.status === "available"
                          ? isDarkMode
                            ? "text-green-200"
                            : "text-green-800"
                          : spot.status === "occupied"
                          ? isDarkMode
                            ? "text-red-200"
                            : "text-red-800"
                          : isDarkMode
                          ? "text-gray-500"
                          : "text-gray-800"
                      } font-semibold text-base`}
                    >
                      {spot.number}
                    </span>
                    <Car
                      className={`w-5 h-5 flex-shrink-0 ${
                        spot.status === "available"
                          ? "text-green-600"
                          : spot.status === "occupied"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right side parking spots */}
            <div className="space-y-4">
              {parkingSpots.slice(6, 12).map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative h-20 rounded-lg
                    border-r-4 transition-all shadow-sm
                    ${
                      spot.status === "available"
                        ? isDarkMode
                          ? "bg-green-900/30 border-green-500"
                          : "bg-green-50 border-green-500"
                        : spot.status === "occupied"
                        ? isDarkMode
                          ? "bg-red-900/30 border-red-600"
                          : "bg-red-50 border-red-600"
                        : isDarkMode
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-gray-100 border-gray-600"
                    }
                  `}
                >
                  <div className="h-full flex items-center justify-between px-4 gap-3">
                    <Car
                      className={`w-5 h-5 flex-shrink-0 ${
                        spot.status === "available"
                          ? "text-green-600"
                          : spot.status === "occupied"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                      strokeWidth={2}
                    />
                    <span
                      className={`${
                        spot.status === "available"
                          ? isDarkMode
                            ? "text-green-200"
                            : "text-green-800"
                          : spot.status === "occupied"
                          ? isDarkMode
                            ? "text-red-200"
                            : "text-red-800"
                          : isDarkMode
                          ? "text-gray-500"
                          : "text-gray-800"
                      } font-semibold text-base`}
                    >
                      {spot.number}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          className={`mt-8 pt-6 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } border-t flex gap-6 justify-center`}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded" />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded" />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Occupied
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Unknown
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ParkingLotDetail;

