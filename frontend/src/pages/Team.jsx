import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import MeetTheTeam from "../components/MeetTheTeam";

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07101F_0%,#0B1A2E_55%,#07101F_100%)]" />
      <div className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[color:var(--uta-blue-glow)]/20 blur-[120px] animate-orb" />
      <div className="absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full bg-[color:var(--uta-orange)]/15 blur-[120px] animate-orb delay-2" />
      <div
        className="absolute inset-0 opacity-[0.06]"
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
    </div>
  );
}

function Team() {
  return (
    <div className="relative isolate min-h-screen bg-[#07101F] text-white">
      <BackgroundFX />

      <div className="relative z-10">
        <section className="relative px-4 pt-20 pb-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--uta-orange-soft)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              UTA CSE Senior Design 2026
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              The Mavericks behind MavPark
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
              A crew of engineers, designers, and a mentor turning parking-lot
              chaos into real-time clarity for every Mav on campus.
            </p>
          </motion.div>
        </section>

        <MeetTheTeam variant="page" />
      </div>
    </div>
  );
}

export default Team;
