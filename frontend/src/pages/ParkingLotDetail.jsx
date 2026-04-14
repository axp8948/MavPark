import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Navigation } from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";
import { useWebSocket } from "../hooks/useWebSocket";
import GoogleMapsParkingLot from '../components/GoogleMapsParkingLot';
import lotConfigs from '../data/lotConfigs';

function ParkingLotDetail({ selectedLot, onBack, isDarkMode }) {
  const lotConfig = lotConfigs[selectedLot] || lotConfigs[1];

  const generateParkingSpots = () => {
    if (lotConfig.totalSpots === 0) return [];
    const spots = [];
    const startId = lotConfig.spotIdOffset + 1;
    const endId = lotConfig.spotIdOffset + lotConfig.totalSpots;
    for (let i = startId; i <= endId; i++) {
      spots.push({ id: `${i}`, number: `${i}`, status: 'unknown' });
    }
    return spots;
  };

  const [parkingSpots, setParkingSpots] = useState(generateParkingSpots());

  // WebSocket integration - receives parking data with spots array
  const { parkingData } = useWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  const [lot, setLot] = useState({
    id: selectedLot,
    name: lotConfig.name,
    location: lotConfig.location,
    totalSpots: lotConfig.totalSpots,
    availableSpots: 0,
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

      setLot((prevLot) => ({
        id: selectedLot,
        name: parkingData.parkingLotName || prevLot.name,
        location: prevLot.location,
        totalSpots: totalFromSpots || prevLot.totalSpots,
        availableSpots: freeFromSpots,
      }));

      const spotsMap = new Map();
      parkingData.spots.forEach((spot) => {
        const raw = spot.spotId.toString();
        const base = parseInt(raw.replace(/^spot_0*/, ''), 10);
        const numeric = String(base + lotConfig.spotIdOffset);
        spotsMap.set(numeric, mapStatus(spot.status));
      });

      setParkingSpots((prevSpots) => {
        return prevSpots.map((spot) => {
          const status = spotsMap.get(spot.number);
          if (status) {
            return { ...spot, status };
          }
          return { ...spot, status: 'unknown' };
        });
      });
    }
  }, [parkingData]);

  // Fetch spots when lot is selected (fallback for initial load)
  // Only update statuses - don't replace the spots array (preserves coordinate mapping)
  useEffect(() => {
    if (selectedLot) {
      getParkingSpotsByLot(selectedLot)
        .then((data) => {
          if (data && data.length > 0) {
            const spotsMap = new Map();
            data.forEach((spot) => {
              const raw = (spot.spotId || spot.id || '').toString();
              const base = parseInt(raw.replace(/^spot_0*/, ''), 10);
              if (!isNaN(base)) {
                const numeric = String(base + lotConfig.spotIdOffset);
                spotsMap.set(numeric, mapStatus(spot.status));
              }
            });

            setParkingSpots((prevSpots) => {
              return prevSpots.map((spot) => {
                const status = spotsMap.get(spot.number) || spotsMap.get(spot.id);
                if (status) {
                  return { ...spot, status };
                }
                return spot;
              });
            });
          }
        })
        .catch((err) => console.error("Error fetching spots:", err));
    }
  }, [selectedLot]);

  // Handle spot click (optional - for showing spot details)
  const handleSpotClick = (spot) => {
    console.log('Clicked spot:', spot);
    // You can add a modal or tooltip here to show spot details
  };

  // Handle "Get Directions" button click
  // Opens Google Maps with directions from user's current location to the parking lot
  const handleGetDirections = () => {
    // Google Maps directions URL format
    // This will open Google Maps app on mobile or web version on desktop
    // The 'dir/?api=1&destination=' format automatically uses user's current location as origin
    const destinationLat = lotConfig.center.lat;
    const destinationLng = lotConfig.center.lng;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`;
    
    // Open in new tab/window
    window.open(directionsUrl, '_blank');
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
        className={`backdrop-blur-sm ${
          isDarkMode 
            ? "bg-gray-800/90 border-blue-400" 
            : "bg-white/80 border-blue-100"
        } rounded-2xl p-8 shadow-lg border-2`}
      >
        <div className="mb-8">
          {/* Header section with lot name and get directions button */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2
                className={`${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                } text-2xl font-semibold`}
              >
                {lot.name}
              </h2>
              <p
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mt-1`}
              >
                Live parking availability for {lot.location} Lot
              </p>
              <p
                className="text-sm text-gray-500 mt-1"
              >
                {lot.availableSpots} / {lot.totalSpots} spaces free 
              </p>
            </div>
            
            {/* Get Directions Button */}
            <motion.button
              onClick={handleGetDirections}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get directions to parking lot"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </motion.button>
          </div>
        </div>

        {/* Google Maps Parking Lot Visualization */}
        <GoogleMapsParkingLot
          spots={parkingSpots}
          spotCoordinates={lotConfig.spotCoordinates}
          lotName={lot.name}
          onSpotClick={handleSpotClick}
          center={lotConfig.center}
          overlayBounds={lotConfig.overlayBounds}
          overlayImage={lotConfig.overlayImage}
          zoom={lotConfig.zoom}
        />
      </div>
    </motion.div>
  );
}

export default ParkingLotDetail;