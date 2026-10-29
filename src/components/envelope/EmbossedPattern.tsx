import React from 'react';

/**
 * EmbossedPattern:
 * Traditional Haryanvi stationery motifs (wheat stalks, marigold florets, phulkari diamonds)
 * rendered with soft debossed dual-stroke highlights for luxury cotton paper texture.
 */
export const EmbossedPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Soft paper emboss filter */}
        <filter id="paper-emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0.5" dy="0.8" stdDeviation="0.4" floodColor="#ffffff" floodOpacity="0.85" />
          <feDropShadow dx="-0.5" dy="-0.6" stdDeviation="0.4" floodColor="#8B6F3E" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter="url(#paper-emboss)" stroke="#9A7840" strokeWidth="1" strokeLinecap="round" opacity="0.32">
        {/* Corner Phulkari Diamonds */}
        {/* Top-Left */}
        <path d="M 24 16 L 36 28 L 24 40 L 12 28 Z" fill="none" />
        <circle cx="24" cy="28" r="2.5" fill="#9A7840" opacity="0.5" />
        <line x1="24" y1="8" x2="24" y2="16" />
        <line x1="8" y1="28" x2="12" y2="28" />

        {/* Top-Right */}
        <path d="M 376 16 L 388 28 L 376 40 L 364 28 Z" fill="none" />
        <circle cx="376" cy="28" r="2.5" fill="#9A7840" opacity="0.5" />
        <line x1="376" y1="8" x2="376" y2="16" />
        <line x1="388" y1="28" x2="392" y2="28" />

        {/* Bottom-Left */}
        <path d="M 24 240 L 36 252 L 24 264 L 12 252 Z" fill="none" />
        <circle cx="24" cy="252" r="2.5" fill="#9A7840" opacity="0.5" />

        {/* Bottom-Right */}
        <path d="M 376 240 L 388 252 L 376 264 L 364 252 Z" fill="none" />
        <circle cx="376" cy="252" r="2.5" fill="#9A7840" opacity="0.5" />

        {/* Left Wheat Stalk Motif */}
        <g transform="translate(28, 90)">
          <path d="M 0 0 C 4 30 1 65 0 95" strokeWidth="1.2" />
          {/* Wheat grains left and right */}
          <ellipse cx="-6" cy="20" rx="3.5" ry="7" transform="rotate(-30 -6 20)" />
          <ellipse cx="6" cy="26" rx="3.5" ry="7" transform="rotate(30 6 26)" />
          <ellipse cx="-7" cy="42" rx="3.5" ry="7" transform="rotate(-30 -7 42)" />
          <ellipse cx="7" cy="48" rx="3.5" ry="7" transform="rotate(30 7 48)" />
          <ellipse cx="-6" cy="65" rx="3.5" ry="7" transform="rotate(-30 -6 65)" />
          <ellipse cx="6" cy="72" rx="3.5" ry="7" transform="rotate(30 6 72)" />
        </g>

        {/* Right Wheat Stalk Motif (Mirrored) */}
        <g transform="translate(372, 90) scale(-1, 1)">
          <path d="M 0 0 C 4 30 1 65 0 95" strokeWidth="1.2" />
          <ellipse cx="-6" cy="20" rx="3.5" ry="7" transform="rotate(-30 -6 20)" />
          <ellipse cx="6" cy="26" rx="3.5" ry="7" transform="rotate(30 6 26)" />
          <ellipse cx="-7" cy="42" rx="3.5" ry="7" transform="rotate(-30 -7 42)" />
          <ellipse cx="7" cy="48" rx="3.5" ry="7" transform="rotate(30 7 48)" />
          <ellipse cx="-6" cy="65" rx="3.5" ry="7" transform="rotate(-30 -6 65)" />
          <ellipse cx="6" cy="72" rx="3.5" ry="7" transform="rotate(30 6 72)" />
        </g>

        {/* Center Top Auspicious Florets */}
        <g transform="translate(200, 30)">
          <circle cx="0" cy="0" r="4" fill="none" />
          <circle cx="0" cy="-9" r="2.5" />
          <circle cx="9" cy="0" r="2.5" />
          <circle cx="0" cy="9" r="2.5" />
          <circle cx="-9" cy="0" r="2.5" />
        </g>

        {/* Delicate Border Inset line */}
        <rect
          x="14"
          y="14"
          width="372"
          height="252"
          rx="18"
          fill="none"
          strokeWidth="0.8"
          strokeDasharray="4 3"
        />
      </g>
    </svg>
  );
};
