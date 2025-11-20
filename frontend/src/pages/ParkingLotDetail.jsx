import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";
import { HorizontalParkingSpot } from "../components/HorizontalParkingSpot";

function ParkingLotDetail({ selectedLot, onBack, isDarkMode }) {
  // Generate 280 parking spots (10 columns with 28 spots each: 401-680)
  const generateAngledParkingSpots = () => {
    const spots = [];
    const statuses = ['available', 'occupied', 'unknown'];
    
    for (let i = 1; i <= 280; i++) {
      // Distribute statuses: ~60% available, ~30% occupied, ~10% unknown
      let status;
      const rand = Math.random();
      if (rand < 0.6) {
        status = 'available';
      } else if (rand < 0.9) {
        status = 'occupied';
      } else {
        status = 'unknown';
      }
      
      spots.push({
        id: `${400 + i}`,
        number: `${400 + i}`,
        status: status,
      });
    }
    
    return spots;
  };

  const [angledParkingSpots, setAngledParkingSpots] = useState(generateAngledParkingSpots());
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

  // Helper to get spots for each band/column
  const getBandSpots = (startNum, endNum) => {
    return angledParkingSpots.filter((spot) => {
      const num = parseInt(spot.number, 10);
      return num >= startNum && num <= endNum;
    });
  };

  // Fetch spots when lot is selected
  useEffect(() => {
    if (selectedLot) {
      getParkingSpotsByLot(selectedLot)
        .then((data) => {
          setParkingSpots(data);
          // If data has the angled spots format, update those too
          if (data && data.length > 0 && data[0].number && parseInt(data[0].number) >= 401) {
            setAngledParkingSpots(data);
          }
        })
        .catch((err) => console.error("Error fetching spots:", err));
    }
  }, [selectedLot]);

  const lot = {
    id: 1,
    name: "Lot A – Pilot Lot",
    location: "Faculty/Staff",
    totalSpots: angledParkingSpots.length,
    availableSpots: angledParkingSpots.filter((s) => s.status === 'available').length,
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
        Back to Overview
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
            } mb-1`}
          >
            Live parking availability for {lot.location} Lot
          </p>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {lot.availableSpots} / {lot.totalSpots} spaces free · Updated 12s ago · Computer-vision only, no video shown
          </p>
        </div>

        {/* Parking Lot Map - 10 Columns with 5 Roads (2 edge + 3 middle) */}
        <div className="flex justify-center overflow-x-auto">
          <div className="bg-gray-600 rounded-xl p-8 shadow-lg">
            <div className="flex gap-6 items-start">
              {/* Left Edge Road */}
              <div className="w-10 h-[900px] bg-gray-400 rounded-full flex items-center justify-center">
                <div className="relative h-20 w-0.5 bg-white/70 rotate-0">
                  <div className="absolute -bottom-1 -left-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rotate-45" />
                </div>
              </div>

              {/* Left Outer Column - 28 spots */}
              <div className="flex flex-col gap-2">
                {getBandSpots(401, 428).map((spot) => (
                  <HorizontalParkingSpot
                    key={spot.id}
                    spotNumber={spot.number}
                    status={spot.status}
                    showLabel={false}
                  />
                ))}
              </div>

              {/* Row 1 - Two columns close together */}
              <div className="flex gap-1">
                {/* Column 2 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(429, 456).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>

                {/* Column 3 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(457, 484).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Vertical Road 1 */}
              <div className="w-10 h-[900px] bg-gray-400 rounded-full flex items-center justify-center">
                <div className="relative h-20 w-0.5 bg-white/70 rotate-0">
                  <div className="absolute -bottom-1 -left-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rotate-45" />
                </div>
              </div>

              {/* Row 2 - Two columns close together */}
              <div className="flex gap-1">
                {/* Column 4 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(485, 512).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>

                {/* Column 5 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(513, 540).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Vertical Road 2 */}
              <div className="w-10 h-[900px] bg-gray-400 rounded-full flex items-center justify-center">
                <div className="relative h-20 w-0.5 bg-white/70 rotate-0">
                  <div className="absolute -bottom-1 -left-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rotate-45" />
                </div>
              </div>

              {/* Row 3 - Two columns close together */}
              <div className="flex gap-1">
                {/* Column 6 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(541, 568).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>

                {/* Column 7 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(569, 596).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Vertical Road 3 */}
              <div className="w-10 h-[900px] bg-gray-400 rounded-full flex items-center justify-center">
                <div className="relative h-20 w-0.5 bg-white/70 rotate-0">
                  <div className="absolute -bottom-1 -left-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rotate-45" />
                </div>
              </div>

              {/* Row 4 - Two columns close together */}
              <div className="flex gap-1">
                {/* Column 8 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(597, 624).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>

                {/* Column 9 - 28 spots */}
                <div className="flex flex-col gap-2">
                  {getBandSpots(625, 652).map((spot) => (
                    <HorizontalParkingSpot
                      key={spot.id}
                      spotNumber={spot.number}
                      status={spot.status}
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Right Outer Column - 28 spots */}
              <div className="flex flex-col gap-2">
                {getBandSpots(653, 680).map((spot) => (
                  <HorizontalParkingSpot
                    key={spot.id}
                    spotNumber={spot.number}
                    status={spot.status}
                    showLabel={false}
                  />
                ))}
              </div>

              {/* Right Edge Road */}
              <div className="w-10 h-[900px] bg-gray-400 rounded-full flex items-center justify-center">
                <div className="relative h-20 w-0.5 bg-white/70 rotate-0">
                  <div className="absolute -bottom-1 -left-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rotate-45" />
                </div>
              </div>
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
                      Free
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

