import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Menu, X } from "lucide-react";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-950"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 rounded"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">MavPark</span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                role="menu"
              >
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 focus:bg-slate-50 focus:outline-none dark:focus:bg-slate-800"
                  role="menuitem"
                >
                  About MavPark
                </Link>
                <Link
                  to="/features"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 focus:bg-slate-50 focus:outline-none dark:focus:bg-slate-800"
                  role="menuitem"
                >
                  Features
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 focus:bg-slate-50 focus:outline-none dark:focus:bg-slate-800"
                  role="menuitem"
                >
                  Contact Us
                </Link>
                <Link
                  to="/parking-info"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 focus:bg-slate-50 focus:outline-none dark:focus:bg-slate-800"
                  role="menuitem"
                >
                  Parking Info
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
