import React from "react";
// eslint-disable-next-line no-unused-vars -- `motion` is used as <motion.x> JSX member tags
import { motion, useReducedMotion } from "motion/react";
import { Square, Car } from "lucide-react";
import TopDownCar from "./TopDownCar";
import { CAR_COLORS } from "./carColors";

/**
 * Live Occupancy hero card — a big % + a horizontal pill bar where a
 * top-down car drives along to the current occupancy.
 *
 * Props:
 *  - total: number of stalls in the lot
 *  - available: number of free stalls
 *  - lotName: string for the subtitle
 */
function OccupancyBar({ total = 0, available = 0, lotName = "this lot" }) {
  const reduceMotion = useReducedMotion();
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeAvailable = Math.max(0, Math.min(safeTotal, Number(available) || 0));
  const occupied = safeTotal - safeAvailable;
  const occupiedPct = safeTotal > 0 ? Math.round((occupied / safeTotal) * 100) : 0;
  const availablePct = safeTotal > 0 ? Math.round((safeAvailable / safeTotal) * 100) : 0;

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.9, ease: [0.22, 1, 0.36, 1] };

  // Car sits centered on the fill head; nudge it slightly inside the bar edge.
  const carLeftClamped = `calc(${Math.min(Math.max(occupiedPct, 0), 100)}% - 24px)`;

  return (
    <section
      aria-label="Live parking occupancy"
      className="rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-6 backdrop-blur sm:p-8"
    >
      {/* Header row */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--uta-blue-glow)]/15 text-[color:var(--uta-blue-glow)] ring-1 ring-[color:var(--uta-blue-glow)]/30">
            <Square className="h-5 w-5" aria-hidden strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Total Parking Occupancy
            </h3>
            <p className="text-sm text-white/60">
              Real-time overview of {lotName}
            </p>
          </div>
        </div>

        {/* Available chip */}
        <div className="inline-flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
            <Car className="h-4 w-4" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-emerald-300">
              {safeAvailable} spots available
            </span>
            <span className="block text-xs text-emerald-200/70">
              {availablePct}% of total capacity
            </span>
          </span>
        </div>
      </div>

      {/* Big stat */}
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-5xl font-black tracking-tight text-[color:var(--uta-orange)] sm:text-6xl">
          {occupiedPct}%
        </span>
        <span className="text-2xl font-semibold text-[color:var(--uta-orange-soft)]">
          Occupied
        </span>
      </div>
      <p className="mt-1 text-sm text-white/60">
        {occupied} / {safeTotal} spots in use
      </p>

      {/* Pill bar with traveling car */}
      <div className="relative mt-6">
        <div
          className="relative h-12 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04]"
          role="progressbar"
          aria-valuenow={occupiedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Parking occupancy at ${occupiedPct} percent`}
        >
          {/* Parking-stall hash pattern behind the fill */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 36px)",
            }}
          />

          {/* Orange fill — animated width */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${occupiedPct}%` }}
            transition={transition}
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--uta-orange) 0%, var(--uta-orange-glow) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 24px -4px rgba(245,128,37,0.65)",
            }}
          />

          {/* Stall dividers inside the fill */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-0"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${occupiedPct}%` }}
            transition={transition}
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 36px)",
            }}
          />
        </div>

        {/* Traveling car — sits on the fill head */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2"
          initial={reduceMotion ? false : { left: "calc(0% - 24px)" }}
          animate={{ left: carLeftClamped }}
          transition={transition}
          style={{
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))",
          }}
        >
          <TopDownCar
            color={CAR_COLORS.graphite}
            size={48}
            rotation={90}
            ariaLabel="Occupancy indicator car"
          />
        </motion.div>

        {/* Scale labels */}
        <div className="mt-2 flex items-center justify-between text-xs text-white/50">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </section>
  );
}

export default OccupancyBar;
