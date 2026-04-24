import React from "react";

function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-white/10 bg-transparent px-4 py-8 text-center text-white/75 sm:px-6 sm:py-10"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-lg font-bold text-white">MavPark</p>
        <p className="mt-1 text-sm text-white/70">
          UT Arlington CSE Senior Design 2026
        </p>
        <p className="mt-2 text-sm text-white/70">
          Smart parking availability prototype.
        </p>
        <p className="mt-3 text-xs text-white/50">
          Prototype for academic use. Not an official UTA parking service.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
