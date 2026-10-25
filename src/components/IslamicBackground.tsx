import React from 'react';

export const IslamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Radial soft emerald & gold glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl" />

      {/* Repeating 8-fold Islamic Star Geometric Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] text-[#c8a951]"
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        fill="none"
      >
        <pattern id="islamic-star-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            {/* Center 8-point star */}
            <path d="M40 10 L50 25 L65 25 L55 37 L60 52 L45 45 L35 52 L40 37 L30 25 L45 25 Z" />
            <circle cx="40" cy="40" r="18" />
            <circle cx="40" cy="40" r="30" strokeDasharray="2 4" />
            {/* Corner intersections */}
            <path d="M0 0 L15 15 M80 0 L65 15 M0 80 L15 65 M80 80 L65 65" />
            <rect x="25" y="25" width="30" height="30" />
            <rect x="25" y="25" width="30" height="30" transform="rotate(45 40 40)" />
          </g>
        </pattern>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
};
