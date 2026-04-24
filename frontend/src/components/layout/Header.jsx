import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, UserRound } from "lucide-react";
import MavparkLogo from "../../assets/images/Mavpark.png";

const NAV_LINKS = [
  { label: "Home", to: "/", kind: "route" },
  { label: "Team", to: "/#team", hash: "#team", kind: "hash" },
  { label: "Contact", to: "/#contact", hash: "#contact", kind: "hash" },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (link) => {
    if (link.kind === "hash") {
      return location.pathname === "/" && location.hash === link.hash;
    }
    if (link.to === "/") {
      return location.pathname === "/" && !location.hash;
    }
    return location.pathname.startsWith(link.to);
  };

  const handleHashClick = (hash) => (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `/${hash}`);
      }
    }
  };

  const headerBg = isScrolled
    ? "bg-[#07101F]/85 backdrop-blur-xl border-b border-white/10"
    : "bg-[#07101F]/60 backdrop-blur-md border-b border-white/5";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-white rounded focus:outline-none"
          aria-label="MavPark home"
        >
          <img
            src={MavparkLogo}
            alt=""
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="text-xl font-bold tracking-tight">MavPark</span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            const common =
              "relative text-sm font-medium transition-colors focus:outline-none rounded";
            const color = active
              ? "text-white"
              : "text-white/70 hover:text-white";

            const inner = (
              <>
                <span>{link.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 -bottom-3 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[color:var(--uta-orange)] shadow-[0_0_10px_rgba(245,128,37,0.9)]"
                  />
                )}
              </>
            );

            if (link.kind === "hash") {
              return (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={handleHashClick(link.hash)}
                  className={`${common} ${color}`}
                >
                  {inner}
                </a>
              );
            }
            return (
              <NavLink key={link.label} to={link.to} className={`${common} ${color}`}>
                {inner}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center">
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-[color:var(--uta-orange)] hover:bg-[color:var(--uta-orange)]/10 hover:text-[color:var(--uta-orange-soft)] focus:outline-none"
            onClick={() => {}}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            Sign In
          </button>
        </div>

        <button
          type="button"
          className="md:hidden rounded p-2 text-white hover:bg-white/10 focus:outline-none"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#07101F]/95 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              const classes = `px-2 py-3 text-base font-medium rounded-md transition-colors ${
                active ? "text-white bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"
              }`;
              return link.kind === "hash" ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={handleHashClick(link.hash)}
                  className={classes}
                >
                  {link.label}
                </a>
              ) : (
                <NavLink key={link.label} to={link.to} className={classes}>
                  {link.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:border-[color:var(--uta-orange)] hover:text-[color:var(--uta-orange-soft)]"
            >
              <UserRound className="h-4 w-4" aria-hidden />
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
