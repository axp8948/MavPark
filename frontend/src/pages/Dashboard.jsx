import React from "react";
import mavparkLogo from "../assets/images/Mavpark.png";

function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header: occupies exactly 25% of viewport height */}
      <header className="relative min-h-[25vh] h-auto py-10">
        {/* Blue curved rectangle spanning full width */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="elevate" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#1f4f8e" floodOpacity="0.25" />
            </filter>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" rx="56" ry="56" fill="#3170c1" filter="url(#elevate)" />
        </svg>

        {/* MavPark logo: top-left aligned, reduced size, soft natural drop shadow */}
        <div className="absolute top-4 left-6">
          <div className="relative inline-block">
            {/* Radial glow behind logo */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full"
              style={{
                width: '440px',
                height: '440px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.0) 70%)',
                filter: 'blur(2px)'
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full hidden sm:block"
              style={{
                width: '480px',
                height: '480px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.0) 70%)',
                filter: 'blur(2px)'
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full hidden md:block"
              style={{
                width: '540px',
                height: '540px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.0) 70%)',
                filter: 'blur(2px)'
              }}
            />
            <img
              src={mavparkLogo}
              alt="MavPark logo"
              className="w-[400px] sm:w-[440px] md:w-[500px] h-auto object-contain"
              style={{
                /* White edge that follows transparent PNG alpha using drop-shadow(0 0 X white) */
                filter:
                  "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 0.5px rgba(255,255,255,0.85)) drop-shadow(0 10px 24px rgba(0,0,0,0.18))",
                WebkitFilter:
                  "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 0.5px rgba(255,255,255,0.85)) drop-shadow(0 10px 24px rgba(0,0,0,0.18))",
              }}
            />
          </div>
        </div>

        {/* Centered MavPark title and subheading - compact, balanced */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center -translate-y-[5%] px-4">
          <h1
            className="text-white font-bold antialiased tracking-wide leading-none text-[5.4rem] sm:text-[8.1rem] md:text-[10.8rem] translate-x-[200%]"
            style={{ fontFamily: 'Momo Trust Display, sans-serif' }}
          >
            MavPark
          </h1>
          
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
