import React from "react";

function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-slate-200 bg-slate-50 py-6 px-4 text-center dark:border-slate-700 dark:bg-slate-950 sm:py-8 sm:px-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          MavPark
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          UT Arlington CSE Senior Design 2026
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Smart parking availability prototype.
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Prototype for academic use. Not an official UTA parking service.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
