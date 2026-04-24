import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars -- `motion` is used as <motion.x> JSX member tags
import { motion } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";
import { getParkingLots, getParkingStatus } from "../services/parkingService";
import { useWebSocket } from "../hooks/useWebSocket";

const FILTERS = [
  { id: "all", label: "All Lots" },
  { id: "available", label: "Available" },
  { id: "almost_full", label: "Almost Full" },
];

function getLotStatus(lot) {
  if (lot.status === "upcoming") return "upcoming";
  const pct =
    lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;
  if (pct >= 50) return "available";
  return "almost_full";
}

function StatusBadge({ status }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <span className="relative h-2.5 w-2.5 rounded-full ring-2 ring-emerald-400 bg-emerald-400/30" />
        </span>
        Available
      </span>
    );
  }
  if (status === "almost_full") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--uta-orange-soft)]">
        <span className="h-2.5 w-2.5 rounded-full ring-2 ring-[color:var(--uta-orange)] bg-[color:var(--uta-orange)]/30" />
        Almost Full
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/30 bg-white/10" />
      Coming Soon
    </span>
  );
}

function LotCard({ lot, index, onOpen }) {
  const status = getLotStatus(lot);
  const isUpcoming = status === "upcoming";
  const isAlmostFull = status === "almost_full";
  const pct =
    lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;

  const numberColor = isAlmostFull
    ? "text-[color:var(--uta-orange-soft)]"
    : "text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
      whileHover={!isUpcoming ? { y: -4 } : {}}
      className="group"
    >
      <div
        className={`relative flex h-full flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
          isUpcoming
            ? "border-white/10 bg-[#0B1A2E]/70 opacity-80"
            : "border-white/10 bg-[#0B1A2E]/80 hover:border-white/20 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.45)]"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Zone {lot.location || "—"}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white">{lot.name}</h3>
          </div>
          <StatusBadge status={status} />
        </div>

        {isUpcoming ? (
          <div className="mb-6 flex-1">
            <p className="text-sm text-slate-400">
              New Maverick lot. Stay tuned for live availability.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-baseline gap-2">
              <span className={`text-5xl font-bold leading-none ${numberColor}`}>
                {lot.availableSpots}
              </span>
              <span className="text-lg text-slate-400">/ {lot.totalSpots}</span>
            </div>
            <p className="mb-5 text-sm text-slate-400">
              spaces currently free
            </p>

            <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.4 + index * 0.08 }}
                className={`h-full rounded-full ${
                  isAlmostFull
                    ? "bg-[color:var(--uta-orange)]"
                    : "bg-emerald-400"
                }`}
              />
            </div>
          </>
        )}

        {isUpcoming ? (
          <button
            type="button"
            disabled
            className="mt-auto w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold uppercase tracking-wider text-slate-500"
          >
            Notify Me
          </button>
        ) : isAlmostFull ? (
          <motion.button
            onClick={() => onOpen(lot)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="mt-auto w-full rounded-xl bg-[color:var(--uta-orange)] py-3 text-sm font-semibold uppercase tracking-wider text-[#1A0A00] shadow-[0_10px_30px_-10px_rgba(245,128,37,0.7)] transition-all hover:brightness-110"
          >
            View Spot Map
          </motion.button>
        ) : (
          <motion.button
            onClick={() => onOpen(lot)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="mt-auto w-full rounded-xl border border-white/20 bg-white/[0.04] py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
          >
            View Spot Map
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function ParkingLots() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([
    {
      id: 1,
      slug: "lot-f12",
      name: "Lot A",
      location: "F-12",
      totalSpots: 84,
      availableSpots: 0,
      status: "active",
    },
    {
      id: 2,
      slug: "lot-f10",
      name: "Lot B",
      location: "F-10",
      totalSpots: 0,
      availableSpots: 0,
      status: "active",
    },
    {
      id: 3,
      slug: null,
      name: "Lot C",
      location: "Coming Soon",
      totalSpots: 0,
      availableSpots: 0,
      status: "upcoming",
    },
    {
      id: 4,
      slug: null,
      name: "Lot D",
      location: "Coming Soon",
      totalSpots: 0,
      availableSpots: 0,
      status: "upcoming",
    },
  ]);

  const handleOpen = (lot) => {
    if (lot?.slug) navigate(`/lots/${lot.slug}`);
  };

  const [filter, setFilter] = useState("all");

  const { isConnected, parkingData, error: wsError } = useWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  useEffect(() => {
    if (!parkingData?.parkingLotName) return;
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.status === "upcoming") return lot;
        if (lot.name !== parkingData.parkingLotName) return lot;
        return {
          ...lot,
          totalSpots: parkingData.totalSpots ?? lot.totalSpots,
          availableSpots: parkingData.freeSpots ?? lot.availableSpots,
        };
      }),
    );
  }, [parkingData]);

  useEffect(() => {
    getParkingStatus()
      .then((data) => {
        if (!data?.parkingLotName) return;
        setLots((prevLots) =>
          prevLots.map((lot) => {
            if (lot.status === "upcoming") return lot;
            if (lot.name !== data.parkingLotName) return lot;
            return {
              ...lot,
              totalSpots: data.totalSpots ?? lot.totalSpots,
              availableSpots: data.freeSpots ?? lot.availableSpots,
            };
          }),
        );
      })
      .catch((err) => console.warn("Could not fetch initial status:", err));

    getParkingLots()
      .then((data) => {
        if (!data || data.length === 0) return;
        setLots((prevLots) =>
          prevLots.map((prevLot) => {
            if (prevLot.status === "upcoming") return prevLot;
            const match = data.find((d) => d.name === prevLot.name);
            if (!match) return prevLot;
            return {
              ...prevLot,
              totalSpots: match.totalSpots ?? prevLot.totalSpots,
              availableSpots: match.availableSpots ?? prevLot.availableSpots,
            };
          }),
        );
      })
      .catch((err) => console.warn("Could not fetch parking lots:", err));
  }, []);

  const filteredLots = useMemo(() => {
    if (filter === "all") return lots;
    return lots.filter((lot) => getLotStatus(lot) === filter);
  }, [lots, filter]);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-[color:var(--uta-orange)]/50 animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-[color:var(--uta-orange)] animate-pulse-dot" />
            </span>
            Live Availability
          </span>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Find Your Spot
              </h1>
              <p className="mt-3 text-base text-slate-400 sm:text-lg">
                Real-time parking analytics for the Maverick community.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter lots"
              className="flex flex-wrap items-center gap-2"
            >
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      active
                        ? "border-[color:var(--uta-orange)] bg-[color:var(--uta-orange)]/10 text-[color:var(--uta-orange-soft)]"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.header>

        {filteredLots.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B1A2E]/60 p-10 text-center text-slate-400">
            No lots match this filter right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLots.map((lot, index) => (
              <LotCard
                key={lot.id}
                lot={lot}
                index={index}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fixed right-6 top-24 z-40">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md ${
            isConnected
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/30 bg-rose-400/10 text-rose-300"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span>Live Updates</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>{wsError ? "Connection Error" : "Connecting..."}</span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ParkingLots;
