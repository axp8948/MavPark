import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { Car, MapPin, Target, Zap, Shield, Sparkles } from "lucide-react";
import mavparkLogo from "../assets/images/Mavpark.png";
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

function AboutUs() {
  const features = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Real-Time Updates",
      description:
        "Get live parking availability updates as spots become available or occupied.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Fast & Efficient",
      description:
        "Find parking spots quickly with our optimized search and navigation.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Reliable Data",
      description:
        "Powered by advanced computer vision technology for accurate spot detection.",
    },
    {
      icon: <Car className="h-5 w-5" />,
      title: "Easy Navigation",
      description:
        "Get directions directly to available parking spots with one click.",
    },
  ];

  return (
    <div className="relative isolate min-h-screen bg-[#07101F] text-white">
      <BackgroundFX />

      <div className="relative z-10">
        <section className="relative px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <img
                src={mavparkLogo}
                alt="MavPark Logo"
                className="h-24 w-24 object-contain drop-shadow-[0_8px_30px_rgba(59,130,246,0.35)]"
              />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--uta-orange-soft)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              UTA CSE Senior Design 2026
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              About <span className="text-gradient-maverick">MavPark</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
              Revolutionizing parking management at UT Arlington with real-time
              availability tracking — built by Mavs, for Mavs.
            </p>
          </motion.div>
        </section>

        <section className="relative px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-8 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur md:p-10">
              <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--uta-blue-glow)]/15 text-[color:var(--uta-blue-glow)] ring-1 ring-[color:var(--uta-blue-glow)]/30">
                  <Target className="h-5 w-5" aria-hidden />
                </span>
                What is MavPark?
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-white/75 sm:text-lg">
                <p>
                  <strong className="text-[color:var(--uta-orange-soft)]">
                    MavPark
                  </strong>{" "}
                  is an innovative parking management system designed
                  specifically for the University of Texas at Arlington. Our
                  platform provides real-time parking availability information,
                  helping students, faculty, and staff find parking spots
                  quickly and efficiently.
                </p>
                <p>
                  Using advanced computer vision technology, MavPark
                  continuously monitors parking lots and updates spot
                  availability in real time. Whether you're looking for a spot
                  near your building or planning your route to campus, MavPark
                  ensures you always know where parking is available.
                </p>
                <p>
                  Our mission is to reduce the time spent searching for
                  parking, decrease traffic congestion, and improve the overall
                  campus experience for the UTA community.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Key Features
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
                Everything you need to park on campus without the hassle.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-6 backdrop-blur transition hover:border-[color:var(--uta-orange)]/40 hover:bg-[#0B1A2E]"
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--uta-orange)]/15 text-[color:var(--uta-orange-soft)] ring-1 ring-[color:var(--uta-orange)]/30">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MeetTheTeam variant="about" />
      </div>
    </div>
  );
}

export default AboutUs;
