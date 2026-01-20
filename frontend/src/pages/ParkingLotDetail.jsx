import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";
import { HorizontalParkingSpot } from "../components/HorizontalParkingSpot";
import { useWebSocket } from "../hooks/useWebSocket";

function ParkingLotDetail({ selectedLot, onBack, isDarkMode }) {
  // Generate 280 parking spots (10 columns with 28 spots each: 401-680)
  // All set to 'unknown' (gray) until CV model sends real data
  const generateAngledParkingSpots = () => {
    const spots = [];
    
    for (let i = 1; i <= 280; i++) {
      spots.push({
        id: `${400 + i}`,
        number: `${400 + i}`,
        status: 'unknown', // All gray until real data comes in
      });
    }
    
    return spots;
  };

  const [angledParkingSpots, setAngledParkingSpots] = useState(generateAngledParkingSpots());

  // WebSocket integration - receives parking data with spots array
  const { parkingData } = useWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  // Lot info state
  const [lot, setLot] = useState({
    id: 1,
    name: "Lot A",
    location: "Faculty/Staff",
    totalSpots: angledParkingSpots.length,
    availableSpots: angledParkingSpots.filter((s) => s.status === 'available').length,
  });

  // Helper to convert backend status to component status
  const mapStatus = (backendStatus) => {
    if (backendStatus === 'free') return 'available';
    if (backendStatus === 'occupied') return 'occupied';
    return 'unknown';
  };

  // Update spots when WebSocket receives data from backend
  useEffect(() => {
    if (Array.isArray(parkingData?.spots)) {
      console.log('Received parking data with spots:', parkingData);
      
      // Derive counts from the spots array so header matches the map
      const totalFromSpots = parkingData.spots.length;
      const freeFromSpots = parkingData.spots.filter(
        (spot) => spot.status === "free"
      ).length;

      // Update lot info
      setLot((prevLot) => ({
        id: 1,
        name: parkingData.parkingLotName || prevLot.name,
        location: prevLot.location,
        // Prefer derived total from spots, fall back to backend total if needed
        totalSpots: totalFromSpots || parkingData.totalSpots || prevLot.totalSpots,
        // Always use the derived free count so it matches green spots on the map
        availableSpots: freeFromSpots,
      }));

      // Create a map of spotId -> status for quick lookup
      const spotsMap = new Map();
      parkingData.spots.forEach((spot) => {
        spotsMap.set(spot.spotId.toString(), mapStatus(spot.status));
      });

      // Update angled parking spots
      setAngledParkingSpots((prevSpots) => {
        return prevSpots.map((spot) => {
          const spotNumber = spot.number;
          const status = spotsMap.get(spotNumber);
          
          // If this spot exists in backend data, update its status
          if (status) {
            return {
              ...spot,
              status: status,
            };
          }
          
          // If spot is not in backend data (spots beyond what backend sends), set to unknown (gray)
          // Backend sends data for spots 401-497, anything beyond stays unknown
          const spotNum = Number.parseInt(spotNumber, 10);
          if (spotNum > 497) {
            return {
              ...spot,
              status: 'unknown', // Explicitly gray for spots beyond backend data range
            };
          }
          
          // For spots 401-497 that don't have data, keep as unknown
          return {
            ...spot,
            status: 'unknown',
          };
        });
      });
    }
  }, [parkingData]);

  // Helper to get spots for each band/column
  const getBandSpots = (startNum, endNum) => {
    return angledParkingSpots.filter((spot) => {
      const num = Number.parseInt(spot.number, 10);
      return num >= startNum && num <= endNum;
    });
  };

  // Fetch spots when lot is selected (fallback for initial load)
  useEffect(() => {
    if (selectedLot) {
      getParkingSpotsByLot(selectedLot)
        .then((data) => {
          // If data has the angled spots format, update those too
          if (data && data.length > 0 && data[0].number && Number.parseInt(data[0].number, 10) >= 401) {
            setAngledParkingSpots(data);
          }
        })
        .catch((err) => console.error("Error fetching spots:", err));
    }
  }, [selectedLot]);

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
            className="text-sm text-gray-500"
          >
            {lot.availableSpots} / {lot.totalSpots} spaces free 
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

