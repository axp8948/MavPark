import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Navigation } from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";
import { useWebSocket } from "../hooks/useWebSocket";
import GoogleMapsParkingLot from "../components/GoogleMapsParkingLot";
import {
  spotCoordinates,
  lotCenter,
  totalSpots,
  SPOT_ID_OFFSET,
} from "../data/spotCoordinates";

/* ============================================================
   ID NORMALIZATION
   Backend:  "spot_045"
   Frontend: "401" – "673"
const normalizeSpotId = (spotId) => {
  if (typeof spotId === "number") return String(spotId);

  if (typeof spotId === "string") {
    const match = spotId.match(/\d+/);
    if (!match) return null;

    const numeric = parseInt(match[0], 10);
    return String(numeric + SPOT_ID_OFFSET);
  }

  return null;
};

function ParkingLotDetail({ selectedLot, onBack, isDarkMode }) {
  /* ============================================================
     INITIAL SPOT GENERATION (401–673)
  ============================================================ */
  const generateParkingSpots = () => {
    if (lotConfig.totalSpots === 0) return [];
    const spots = [];
    const startId = SPOT_ID_OFFSET + 1;
    const endId = SPOT_ID_OFFSET + totalSpots;

    for (let i = startId; i <= endId; i++) {
      spots.push({
        id: String(i),
        number: String(i),
        status: "unknown",
      });
    }

    return spots;
  };

  const [parkingSpots, setParkingSpots] = useState(generateParkingSpots());

  /* ============================================================
     WEBSOCKET
  ============================================================ */
  const { parkingData } = useWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  /* ============================================================
     LOT META
  ============================================================ */
  const [lot, setLot] = useState({
    id: 1,
    name: "Lot A",
    location: "Faculty/Staff",
    totalSpots,
    availableSpots: 0,
  });

  const mapStatus = (backendStatus) => {
    if (backendStatus === "free") return "available";
    if (backendStatus === "occupied") return "occupied";
    return "unknown";
  };

  /* ============================================================
     LIVE WEBSOCKET UPDATE
  ============================================================ */
  useEffect(() => {
    if (!Array.isArray(parkingData?.spots)) return;

    console.log("📡 Live parking update:", parkingData);

    const freeCount = parkingData.spots.filter(
      (s) => s.status === "free"
    ).length;

    setLot((prev) => ({
      ...prev,
      name: parkingData.parkingLotName || prev.name,
      totalSpots: parkingData.spots.length || prev.totalSpots,
      availableSpots: freeCount,
    }));

    const spotsMap = new Map();

    parkingData.spots.forEach((spot) => {
      const normalizedId = normalizeSpotId(spot.spotId);
      if (normalizedId) {
        spotsMap.set(normalizedId, mapStatus(spot.status));
      }
    });

    setParkingSpots((prevSpots) =>
      prevSpots.map((spot) => ({
        ...spot,
        status: spotsMap.get(spot.number) || "unknown",
      }))
    );
  }, [parkingData]);

  /* ============================================================
     INITIAL REST FALLBACK
  ============================================================ */
  useEffect(() => {
    if (!selectedLot) return;

    getParkingSpotsByLot(selectedLot)
      .then((data) => {
        if (!Array.isArray(data)) return;

        const spotsMap = new Map();

        data.forEach((spot) => {
          const normalizedId = normalizeSpotId(
            spot.spotId || spot.id
          );
          if (normalizedId) {
            spotsMap.set(normalizedId, mapStatus(spot.status));
          }
        });

        setParkingSpots((prevSpots) =>
          prevSpots.map((spot) => ({
            ...spot,
            status: spotsMap.get(spot.number) || spot.status,
          }))
        );
      })
      .catch((err) => console.error("Error fetching spots:", err));
  }, [selectedLot]);

  /* ============================================================
     HANDLERS
  ============================================================ */
  const handleSpotClick = (spot) => {
    console.log("Clicked spot:", spot);
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lotCenter.lat},${lotCenter.lng}`;
    window.open(url, "_blank");
  };

  /* ============================================================
     RENDER
  ============================================================ */
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
        className={`mb-6 px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${
          isDarkMode
            ? "border-blue-400 text-blue-400 hover:bg-gray-800"
            : "border-blue-200 text-blue-600 hover:bg-blue-50"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Overview
      </button>

      <div
        className={`rounded-2xl p-8 shadow-lg border-2 ${
          isDarkMode
            ? "bg-gray-800/90 border-blue-400"
            : "bg-white/80 border-blue-100"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {lot.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {lot.availableSpots} / {lot.totalSpots} spaces free
            </p>
          </div>

          <motion.button
            onClick={handleGetDirections}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </motion.button>
        </div>

        {/* GOOGLE MAP */}
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
