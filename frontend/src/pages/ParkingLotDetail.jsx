import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars -- `motion` is used as <motion.x> JSX member tags
import { motion } from "motion/react";
import {
  ArrowLeft,
  Navigation,
  ParkingSquare,
  Car,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { getParkingSpotsByLot } from "../services/parkingService";
import { useWebSocket } from "../hooks/useWebSocket";
import GoogleMapsParkingLot from "../components/GoogleMapsParkingLot";
import OccupancyBar from "../components/OccupancyBar";
import lotConfigs from "../data/lotConfigs";

function ParkingLotDetail({ selectedLot, onBack }) {
  const lotConfig = lotConfigs[selectedLot] || lotConfigs[1];

  const generateParkingSpots = () => {
    if (lotConfig.totalSpots === 0) return [];
    const spots = [];
    const startId = lotConfig.spotIdOffset + 1;
    const endId = lotConfig.spotIdOffset + lotConfig.totalSpots;
    for (let i = startId; i <= endId; i++) {
      spots.push({ id: `${i}`, number: `${i}`, status: "unknown" });
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
    if (backendStatus === "free") return "available";
    if (backendStatus === "occupied") return "occupied";
    return "unknown";
  };

  // Update spots when WebSocket receives data from backend
  useEffect(() => {
    if (Array.isArray(parkingData?.spots)) {
      // Derive counts from the spots array so header matches the map
      const totalFromSpots = parkingData.spots.length;
      const freeFromSpots = parkingData.spots.filter(
        (spot) => spot.status === "free",
      ).length;

      setLot((prevLot) => ({
        id: selectedLot,
        name: parkingData.parkingLotName || prevLot.name,
        location: prevLot.location,
        totalSpots: totalFromSpots || prevLot.totalSpots,
        availableSpots: freeFromSpots,
      }));

      // Backend sends "spot_001", "spot_002", ... (1-based index)
      // Local spots use spotIdOffset + index (e.g. 401, 402, ...)
      const spotsMap = new Map();
      parkingData.spots.forEach((spot) => {
        const spotIndex = parseInt(spot.spotId.replace("spot_", ""), 10);
        const localId = (lotConfig.spotIdOffset + spotIndex).toString();
        spotsMap.set(localId, mapStatus(spot.status));
      });

      setParkingSpots((prevSpots) =>
        prevSpots.map((spot) => {
          const status = spotsMap.get(spot.number);
          if (status) return { ...spot, status };
          return { ...spot, status: "unknown" };
        }),
      );
    }
  }, [parkingData, selectedLot, lotConfig.spotIdOffset]);

  // Fetch spots when lot is selected (fallback for initial load)
  // Only update statuses - don't replace the spots array (preserves coordinate mapping)
  useEffect(() => {
    if (selectedLot) {
      getParkingSpotsByLot(selectedLot)
        .then((data) => {
          if (data && data.length > 0) {
            const spotsMap = new Map();
            data.forEach((spot) => {
              const spotId = spot.spotId || spot.id;
              if (spotId) {
                spotsMap.set(spotId.toString(), mapStatus(spot.status));
              }
            });

            setParkingSpots((prevSpots) =>
              prevSpots.map((spot) => {
                const status = spotsMap.get(spot.number) || spotsMap.get(spot.id);
                if (status) return { ...spot, status };
                return spot;
              }),
            );
          }
        })
        .catch((err) => console.error("Error fetching spots:", err));
    }
  }, [selectedLot]);

  const handleSpotClick = (spot) => {
    console.log("Clicked spot:", spot);
  };

  const handleGetDirections = () => {
    const destinationLat = lotConfig.center.lat;
    const destinationLng = lotConfig.center.lng;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`;
    window.open(directionsUrl, "_blank");
  };

  const occupied = Math.max(0, lot.totalSpots - lot.availableSpots);
  const occupancyRate =
    lot.totalSpots > 0 ? Math.round((occupied / lot.totalSpots) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl text-white"
    >
      {/* Back pill */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-orange)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Overview
      </button>

      {/* Detail card */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-6 backdrop-blur sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--uta-blue-glow)] sm:text-3xl">
              {lot.name}
            </h2>
            <p className="mt-1 text-white/70">
              Live parking availability for {lot.location} Lot
            </p>
            <p className="mt-1 text-sm text-white/50">
              {lot.availableSpots} / {lot.totalSpots} spaces free
            </p>
          </div>

          <motion.button
            type="button"
            onClick={handleGetDirections}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Get directions to parking lot"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--uta-orange)] px-5 py-2.5 text-sm font-semibold text-[#1a0a00] transition hover:bg-[color:var(--uta-orange-glow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-orange)] focus:ring-offset-2 focus:ring-offset-[#0B1A2E] glow-orange"
          >
            <Navigation className="h-4 w-4" aria-hidden />
            Get Directions
          </motion.button>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            icon={<ParkingSquare className="h-5 w-5" />}
            tint="bg-[color:var(--uta-blue-glow)]/15 text-[color:var(--uta-blue-glow)] ring-[color:var(--uta-blue-glow)]/30"
            label="Total Spots"
            value={lot.totalSpots}
          />
          <StatTile
            icon={<CheckCircle2 className="h-5 w-5" />}
            tint="bg-emerald-400/15 text-emerald-300 ring-emerald-400/30"
            label="Available"
            value={lot.availableSpots}
          />
          <StatTile
            icon={<Car className="h-5 w-5" />}
            tint="bg-[color:var(--uta-orange)]/15 text-[color:var(--uta-orange-soft)] ring-[color:var(--uta-orange)]/30"
            label="Occupied"
            value={occupied}
          />
          <StatTile
            icon={<Gauge className="h-5 w-5" />}
            tint="bg-purple-400/15 text-purple-300 ring-purple-400/30"
            label="Occupancy Rate"
            value={`${occupancyRate}%`}
          />
        </div>

        {/* Occupancy hero bar */}
        <div className="mt-6">
          <OccupancyBar
            total={lot.totalSpots}
            available={lot.availableSpots}
            lotName={lot.name}
          />
        </div>

        {/* Map */}
        <div className="mt-6">
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
      </div>
    </motion.div>
  );
}

function StatTile({ icon, tint, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tint}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold text-white sm:text-xl">{value}</div>
        <div className="truncate text-xs text-white/60">{label}</div>
      </div>
    </div>
  );
}

export default ParkingLotDetail;
