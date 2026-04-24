import React from "react";
import ContactSection from "../components/ContactSection";

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

function Contact() {
  return (
    <div className="relative isolate min-h-screen bg-[#07101F] text-white">
      <BackgroundFX />
      <div className="relative z-10 pt-10">
        <ContactSection />
      </div>
    </div>
  );
}

export default Contact;
