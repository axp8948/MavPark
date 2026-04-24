import React, { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "motion/react";
import { Github, Linkedin, Sparkles } from "lucide-react";
import { TEAM } from "./team";
import MavparkLogo from "../assets/images/Mavpark.png";

function TeamCard({ member, index, isActive, onFocus, onBlur, cardRef }) {
  const { name, role, image, github, linkedin } = member;

  return (
    <motion.div
      ref={cardRef}
      tabIndex={0}
      onFocus={() => onFocus(index)}
      onBlur={onBlur}
      onMouseEnter={() => onFocus(index)}
      onMouseLeave={onBlur}
      aria-label={`${name}, ${role}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={[
        "group relative flex w-full flex-col rounded-2xl border backdrop-blur",
        "transition-all duration-500 ease-out will-change-transform",
        "focus:outline-none",
        isActive
          ? "z-10 scale-[1.06] border-[color:var(--uta-orange)]/60 bg-[#0B1A2E]/70 ring-2 ring-[color:var(--uta-orange)] shadow-[0_25px_60px_-20px_rgba(245,128,37,0.55)]"
          : "z-0 scale-100 border-white/10 bg-[#0B1A2E]/40 opacity-85 hover:opacity-100 hover:border-white/20",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-[#0B1A2E]">
        <div className="relative aspect-[3/4] w-full">
          <div
            className="absolute inset-0 animate-floaty"
            style={{ animationDelay: `${(index % 7) * 0.6}s` }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-700 ease-out",
                  isActive
                    ? "grayscale-0 scale-105"
                    : "grayscale group-hover:grayscale-0 group-focus:grayscale-0",
                ].join(" ")}
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#0B1A2E_0%,#07101F_60%,#0B1A2E_100%)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22),transparent_65%)]" />
                <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-[color:var(--uta-orange)]/10 blur-3xl" />
                <img
                  src={MavparkLogo}
                  alt=""
                  aria-hidden
                  className={[
                    "relative h-16 w-16 object-contain opacity-80 transition-all duration-700",
                    isActive
                      ? "scale-110 opacity-100"
                      : "group-hover:opacity-100",
                  ].join(" ")}
                />
              </div>
            )}
          </div>

          {isActive && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(245,128,37,0.22),transparent_90%)]"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-tight text-white">
            {name}
          </div>
          <div className="mt-1 line-clamp-2 text-[10.5px] font-medium leading-snug text-[color:var(--uta-orange-soft)]">
            {role}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={github || "#"}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`GitHub – ${name}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:border-[color:var(--uta-orange)]/40 hover:bg-[color:var(--uta-orange)]/10 hover:text-[color:var(--uta-orange-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-orange)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Github className="h-3 w-3" aria-hidden />
          </a>
          <a
            href={linkedin || "#"}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`LinkedIn – ${name}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:border-[color:var(--uta-blue-glow)]/50 hover:bg-[color:var(--uta-blue-glow)]/10 hover:text-[color:var(--uta-blue-glow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-blue-glow)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Linkedin className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function MeetTheTeam({ variant = "home" }) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % TEAM.length);
    }, 2800);
    return () => clearInterval(id);
  }, [reduceMotion, paused]);

  const handleFocus = (index) => {
    setActiveIndex(index);
    setPaused(true);
  };
  const handleBlur = () => setPaused(false);

  const headingId =
    variant === "about"
      ? "about-team-heading"
      : variant === "page"
      ? "team-page-heading"
      : "team-heading";

  const showHeading = variant !== "page";

  return (
    <section
      id="team"
      aria-labelledby={headingId}
      className="relative scroll-mt-24 px-4 pb-20 pt-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {showHeading && (
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--uta-orange-soft)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Built by Mavs, for Mavs
            </span>
            <h2
              id={headingId}
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Meet the team building MavPark.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/60 sm:text-base">
              A UTA CSE senior-design crew turning parking-lot chaos into
              real-time clarity — engineers, designers, and a mentor making
              sure every Mav finds a spot.
            </p>
          </div>
        )}

        <div
          role="list"
          className={[
            "grid gap-3 sm:gap-4 lg:gap-5",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7",
            "px-2 pt-10 pb-16 lg:pt-20 lg:pb-32",
            "lg:items-start",
          ].join(" ")}
        >
          {TEAM.map((member, i) => {
            const center = (TEAM.length - 1) / 2;
            const distance = Math.abs(i - center);
            const curveY = Math.round(distance * distance * 9);
            return (
              <div
                key={member.name}
                role="listitem"
                className="flex lg:[transform:translateY(var(--curve-y))]"
                style={{ "--curve-y": `${curveY}px` }}
              >
                <TeamCard
                  member={member}
                  index={i}
                  isActive={i === activeIndex}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  cardRef={(el) => (cardRefs.current[i] = el)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {TEAM.map((m, i) => (
            <button
              key={m.name}
              type="button"
              aria-label={`Spotlight ${m.name}`}
              onClick={() => {
                setActiveIndex(i);
                setPaused(true);
                setTimeout(() => setPaused(false), 4000);
              }}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-[color:var(--uta-orange)] shadow-[0_0_10px_rgba(245,128,37,0.9)]"
                  : "w-1.5 bg-white/25 hover:bg-white/50",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MeetTheTeam;
