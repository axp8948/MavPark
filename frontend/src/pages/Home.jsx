import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars -- `motion` is used as <motion.x> JSX member tags
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ParkingSquare,
  Users,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Compass,
  Navigation,
  IdCard,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Background FX — orbs, grid, faint campus stripes                   */
/* ------------------------------------------------------------------ */
function BackgroundFX() {
  // Fixed to the viewport so that ONLY the foreground content scrolls.
  // `isolation: isolate` on the Home root keeps this fixed layer contained
  // within Home's stacking context, so the site Footer (which lives outside
  // Home) still paints above it.
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base viewport gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07101F_0%,#0B1A2E_55%,#07101F_100%)]" />

      {/* Drifting color orbs (UTA blue + orange) */}
      <div className="absolute -top-32 -right-32 h-[640px] w-[640px] rounded-full bg-[color:var(--uta-blue-glow)]/25 blur-[120px] animate-orb" />
      <div className="absolute -bottom-48 -left-40 h-[640px] w-[640px] rounded-full bg-[color:var(--uta-orange)]/18 blur-[120px] animate-orb delay-2" />
      <div className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[color:var(--uta-blue)]/15 blur-[140px] animate-orb delay-3" />

      {/* Subtle square grid with a soft radial vignette */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 90%)",
        }}
      />

      {/* Diagonal "parking-lot" stripes along the bottom of the viewport */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.75) 0 2px, transparent 2px 70px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 35%, transparent 100%)",
        }}
      />

      {/* Floating pin markers, anchored to viewport */}
      <PinMarker className="right-[6%] top-[14%]" />
      <PinMarker className="right-[18%] bottom-[28%] delay-1" variant="dim" />
      <PinMarker className="left-[10%] top-[40%] delay-2" variant="dim" />
    </div>
  );
}

function PinMarker({ className = "", variant = "bright" }) {
  const bright = variant === "bright";
  return (
    <div className={`absolute ${className}`}>
      <div className="relative animate-floaty">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
            bright
              ? "border-[color:var(--uta-orange)]/60 bg-[color:var(--uta-orange)]/15"
              : "border-white/20 bg-white/5"
          }`}
        >
          <MapPin
            className={`h-4 w-4 ${
              bright ? "text-[color:var(--uta-orange-soft)]" : "text-white/60"
            }`}
          />
        </div>
        <span
          className={`absolute left-1/2 top-full mt-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
            bright
              ? "bg-[color:var(--uta-orange)] shadow-[0_0_12px_rgba(245,128,37,0.9)]"
              : "bg-white/30"
          }`}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroWordmark — the flagship animated "MavPark" with car + trail    */
/* ------------------------------------------------------------------ */
function HeroWordmark() {
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const duration = 6; // seconds per pass

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setCycle((c) => c + 1), duration * 1000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl font-light text-white/85"
      >
        Welcome to
      </motion.p>

      {/* Wordmark stack */}
      <div
        className="relative mt-2 select-none leading-[0.9]"
        style={{ fontSize: "clamp(4rem, 14vw, 13rem)" }}
        aria-label="MavPark"
      >
        {/* Back layer — white */}
        <h1 className="relative font-black tracking-tight text-white">
          MavPark
        </h1>

        {/* Front layer — UTA blue gradient, revealed left→right by clip-path */}
        <motion.h1
          key={`reveal-${cycle}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 font-black tracking-tight text-gradient-maverick"
          initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
          animate={
            reduceMotion
              ? { clipPath: "inset(0 0% 0 0)" }
              : { clipPath: "inset(0 0% 0 0)" }
          }
          transition={{ duration, ease: [0.65, 0, 0.35, 1] }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, #FFFFFF 0%, #9EC8FF 25%, #3B82F6 55%, #0064B1 80%, #002855 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          MavPark
        </motion.h1>

        {/* Car + orange light trail travelling along the wordmark */}
        {!reduceMotion && <CarAcrossWordmark key={`car-${cycle}`} duration={duration} />}

        {/* Thin perspective road under the wordmark */}
        <Road />
      </div>
    </div>
  );
}

function CarAcrossWordmark({ duration = 6 }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        times: [0, 0.08, 0.92, 1],
        ease: "linear",
      }}
    >
      {/* Orange light trail, sits behind the car */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="trailGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#F58025" stopOpacity="0" />
            <stop offset="40%"  stopColor="#F58025" stopOpacity="0.35" />
            <stop offset="85%"  stopColor="#FFB26B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
          <filter id="trailBlur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <motion.path
          d="M -40 140 Q 250 110 500 130 T 1040 120"
          stroke="url(#trailGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#trailBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
          transition={{
            duration,
            times: [0, 0.85, 1],
            ease: [0.65, 0, 0.35, 1],
          }}
        />
        {/* Secondary thinner bright trail for extra glow */}
        <motion.path
          d="M -40 140 Q 250 110 500 130 T 1040 120"
          stroke="#FFD8B0"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
          transition={{
            duration,
            times: [0, 0.85, 1],
            ease: [0.65, 0, 0.35, 1],
          }}
          style={{ filter: "drop-shadow(0 0 6px #F58025)" }}
        />
      </svg>

      {/* Car glyph translating across */}
      <motion.div
        className="absolute top-[52%] -translate-y-1/2"
        initial={{ left: "-8%" }}
        animate={{ left: ["-8%", "104%"] }}
        transition={{ duration, ease: [0.65, 0, 0.35, 1] }}
        style={{ width: "clamp(90px, 12vw, 170px)" }}
      >
        <div
          className="relative"
          style={{ animation: "carBob 0.9s ease-in-out infinite" }}
        >
          <CarSVG />
        </div>
      </motion.div>
    </motion.div>
  );
}

function CarSVG() {
  return (
    <svg
      viewBox="0 0 220 90"
      className="w-full h-auto glow-orange-soft"
      aria-hidden
    >
      <defs>
        <linearGradient id="carBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#F5F7FA" />
          <stop offset="55%" stopColor="#C7D0DB" />
          <stop offset="100%" stopColor="#7E8A99" />
        </linearGradient>
        <linearGradient id="carWindow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#0b3a6b" />
          <stop offset="100%" stopColor="#06172b" />
        </linearGradient>
        <radialGradient id="headlight" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"  stopColor="#FFF5C2" stopOpacity="1" />
          <stop offset="60%" stopColor="#FFB26B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F58025" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Under-body glow */}
      <ellipse cx="110" cy="82" rx="95" ry="6" fill="#F58025" opacity="0.35" />

      {/* Body */}
      <path
        d="M8 62 Q22 42 55 36 L82 22 Q100 16 130 18 L170 30 Q198 36 208 54 L210 66 Q210 74 200 74 L22 74 Q8 74 8 66 Z"
        fill="url(#carBody)"
      />
      {/* Windows */}
      <path
        d="M62 38 Q82 26 110 24 L150 30 Q170 34 180 44 L182 52 L60 52 Z"
        fill="url(#carWindow)"
        opacity="0.85"
      />
      {/* Window divider */}
      <line x1="118" y1="24" x2="122" y2="52" stroke="#0b1a2e" strokeWidth="1.5" opacity="0.6" />

      {/* Side accent line */}
      <path d="M18 62 L204 62" stroke="#0b1a2e" strokeWidth="1" opacity="0.5" />

      {/* Headlight beam */}
      <circle cx="206" cy="58" r="18" fill="url(#headlight)" />
      <circle cx="204" cy="58" r="3.2" fill="#FFF5C2" />

      {/* Tail light */}
      <rect x="10" y="54" width="5" height="6" rx="1.5" fill="#F58025" />

      {/* Wheels */}
      <circle cx="60"  cy="74" r="11" fill="#0b1a2e" />
      <circle cx="60"  cy="74" r="5"  fill="#C7D0DB" />
      <circle cx="170" cy="74" r="11" fill="#0b1a2e" />
      <circle cx="170" cy="74" r="5"  fill="#C7D0DB" />
    </svg>
  );
}

function Road() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-[-4%] mx-auto h-[22%] w-full opacity-70"
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="roadFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#0b1a2e" stopOpacity="0" />
          <stop offset="40%"  stopColor="#0b1a2e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="roadEdge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="15%"  stopColor="#3B82F6" stopOpacity="0.35" />
          <stop offset="85%"  stopColor="#F58025" stopOpacity="0.45" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* Road surface (perspective trapezoid) */}
      <polygon points="0,120 1000,120 780,0 220,0" fill="url(#roadFill)" />
      {/* Lane dashes */}
      <line
        x1="60" y1="110" x2="940" y2="110"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="20 18"
        className="animate-road-dash"
      />
      {/* Road edge glow */}
      <line x1="0" y1="118" x2="1000" y2="118" stroke="url(#roadEdge)" strokeWidth="1.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Rotating Maverick-centric taglines                                 */
/* ------------------------------------------------------------------ */
const TAGLINES = [
  "Find your spot, Maverick.",
  "From dorm to class, parked in minutes.",
  "Smart parking, built by Mavs for Mavs.",
];

function Taglines() {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setI((v) => (v + 1) % TAGLINES.length), 4000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="relative mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="h-8 sm:h-9">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="text-lg sm:text-xl font-medium text-white/90"
          >
            {TAGLINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/55">
        Real-time availability for every UTA lot — College Park, Maverick
        Stadium, Nedderman, and more.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA row                                                            */
/* ------------------------------------------------------------------ */
function HeroCTAs() {
  return (
    <div className="relative mx-auto mt-8 flex max-w-6xl flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8">
      <Link
        to="/lots"
        className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--uta-orange)] px-6 py-3 text-sm font-semibold text-[#1a0a00] transition hover:bg-[color:var(--uta-orange-glow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-orange)] focus:ring-offset-2 focus:ring-offset-[#07101F] glow-orange"
      >
        <ParkingSquare className="h-4 w-4" aria-hidden />
        View Lots
      </Link>

      <Link
        to="/lots#map"
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        <Compass className="h-4 w-4" aria-hidden />
        Explore Map
      </Link>

      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
        Get Started
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Count-up hook + stats strip                                        */
/* ------------------------------------------------------------------ */
function useCountUp(target, { duration = 1600, enabled = true } = {}) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const startedAt = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const step = (ts) => {
      if (!startedAt.current) startedAt.current = ts;
      const progress = Math.min((ts - startedAt.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return value;
}

function StatsStrip() {
  const reduceMotion = useReducedMotion();
  const lots = useCountUp(30, { enabled: !reduceMotion });
  const mavs = useCountUp(40, { enabled: !reduceMotion });

  return (
    <div className="relative mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)]">
        <ul className="grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4 rounded-2xl overflow-hidden">
          <StatItem
            icon={<ParkingSquare className="h-5 w-5" />}
            iconTint="bg-[color:var(--uta-blue-glow)]/20 text-[color:var(--uta-blue-glow)]"
            value={`${lots}+`}
            label="Parking Lots"
          />
          <StatItem
            icon={<Users className="h-5 w-5" />}
            iconTint="bg-[color:var(--uta-orange)]/20 text-[color:var(--uta-orange-soft)]"
            value={`${mavs}K+`}
            label="Mavericks Served"
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            iconTint="bg-emerald-400/15 text-emerald-300"
            value={
              <span className="inline-flex items-center gap-2">
                Live
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              </span>
            }
            label="Availability"
          />
          <StatItem
            icon={<ShieldCheck className="h-5 w-5" />}
            iconTint="bg-white/10 text-white"
            value="Secure"
            label="Safe & Trusted"
          />
        </ul>
      </div>
    </div>
  );
}

function StatItem({ icon, iconTint, value, label }) {
  return (
    <li className="flex items-center gap-4 bg-[#0B1A2E]/70 px-5 py-5 sm:px-6 sm:py-6">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTint}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
        <div className="text-xs sm:text-sm text-white/60">{label}</div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Features triad (below-the-fold)                                    */
/* ------------------------------------------------------------------ */
function FeatureTriad() {
  const items = [
    {
      icon: <Navigation className="h-5 w-5" />,
      title: "Live Spot Tracking",
      body:
        "See open spots in real time across every UTA lot — no more circling the garage between classes.",
    },
    {
      icon: <Compass className="h-5 w-5" />,
      title: "Smart Navigation",
      body:
        "One tap gets you turn-by-turn directions straight to the nearest open spot on campus.",
    },
    {
      icon: <IdCard className="h-5 w-5" />,
      title: "Maverick Sign-In",
      body:
        "Sign in with your Mav ID to save favorite lots, set reminders, and skip sign-ins across devices.",
    },
  ];

  return (
    <section
      id="features"
      className="relative scroll-mt-24 px-4 pb-20 pt-28 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--uta-orange-soft)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Built for Mavericks
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Everything you need to park on campus.
        </h2>
        <p className="mt-3 max-w-2xl text-white/60">
          MavPark plugs into UTA's lots so finding a spot feels as easy as
          checking the weather.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="group rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-6 backdrop-blur transition hover:border-[color:var(--uta-orange)]/40 hover:bg-[#0B1A2E]"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--uta-orange)]/15 text-[color:var(--uta-orange-soft)] ring-1 ring-[color:var(--uta-orange)]/30">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom CTA banner                                                   */
/* ------------------------------------------------------------------ */
function CTABanner() {
  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(120deg,#0B1A2E_0%,#0F2746_55%,#1b2a44_100%)] p-8 sm:p-12">
        <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[color:var(--uta-orange)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[color:var(--uta-blue-glow)]/25 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to park like a Mav?
            </h3>
            <p className="mt-2 max-w-xl text-white/70">
              Skip the lap around the lot. Check live availability and claim
              your spot in seconds.
            </p>
          </div>
          <Link
            to="/lots"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--uta-orange)] px-6 py-3 text-sm font-semibold text-[#1a0a00] transition hover:bg-[color:var(--uta-orange-glow)] glow-orange"
          >
            <ParkingSquare className="h-4 w-4" aria-hidden />
            View Lots
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function Home() {
  return (
    <div className="relative isolate min-h-screen bg-[#07101F] text-white">
      {/* Shared meshed / zigzag background — fixed to the viewport so only the
          foreground content scrolls. `isolate` on this root scopes the fixed
          layer to Home's stacking context, so the site Footer (outside Home)
          still renders above it. */}
      <BackgroundFX />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative min-h-screen">
          <div className="flex min-h-screen flex-col pt-10 pb-10 sm:pt-16">
            <div className="flex-1">
              <HeroWordmark />
              <Taglines />
              <HeroCTAs />
            </div>
            <StatsStrip />
          </div>
        </section>

        {/* BELOW THE FOLD */}
        <FeatureTriad />
        <CTABanner />
      </div>
    </div>
  );
}

export default Home;
