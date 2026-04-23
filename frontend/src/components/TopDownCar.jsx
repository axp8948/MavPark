import React from "react";
import { CAR_COLORS } from "./carColors";

/**
 * Inline top-down car SVG.
 *  - `color`: body hex (default slate)
 *  - `size`: px (square bounding box; car is roughly 1:2 aspect within it)
 *  - `rotation`: degrees (0 = nose up / north)
 */
function TopDownCar({
  color = CAR_COLORS.slate,
  size = 24,
  rotation = 0,
  ariaLabel = "Parked car",
  className = "",
  style,
}) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 60 110"
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        display: "block",
        ...style,
      }}
    >
      <defs>
        <linearGradient id="tdc-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id="tdc-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0b1a2e" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Soft contact shadow */}
      <ellipse cx="30" cy="104" rx="22" ry="3.5" fill="#000" opacity="0.35" />

      {/* Car body */}
      <rect
        x="6"
        y="6"
        width="48"
        height="98"
        rx="14"
        ry="16"
        fill="url(#tdc-body)"
        stroke="#0b1a2e"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />

      {/* Roof highlight */}
      <rect
        x="12"
        y="14"
        width="36"
        height="8"
        rx="3"
        fill="#ffffff"
        opacity="0.08"
      />

      {/* Windshield (front, top) */}
      <path
        d="M13 26 Q30 22 47 26 L44 44 Q30 41 16 44 Z"
        fill="url(#tdc-glass)"
      />
      {/* Rear window (bottom) */}
      <path
        d="M16 72 Q30 69 44 72 L47 88 Q30 84 13 88 Z"
        fill="url(#tdc-glass)"
      />

      {/* Mid-roof divider / sunroof hint */}
      <rect x="20" y="48" width="20" height="18" rx="3" fill="#000" opacity="0.18" />

      {/* Side mirrors */}
      <rect x="2" y="30" width="5" height="5" rx="1.5" fill={color} />
      <rect x="53" y="30" width="5" height="5" rx="1.5" fill={color} />

      {/* Headlights */}
      <rect x="13" y="7" width="8" height="3" rx="1" fill="#FFF5C2" opacity="0.9" />
      <rect x="39" y="7" width="8" height="3" rx="1" fill="#FFF5C2" opacity="0.9" />

      {/* Taillights */}
      <rect x="13" y="100" width="8" height="3" rx="1" fill="#F58025" opacity="0.9" />
      <rect x="39" y="100" width="8" height="3" rx="1" fill="#F58025" opacity="0.9" />
    </svg>
  );
}

export default TopDownCar;
