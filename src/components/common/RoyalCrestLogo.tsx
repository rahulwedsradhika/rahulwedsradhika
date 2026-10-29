import React from 'react';

interface RoyalCrestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  variant?: 'crest' | 'badge' | 'seal';
  theme?: 'light' | 'dark' | 'auto';
  monogramText?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const RoyalCrestLogo: React.FC<RoyalCrestLogoProps> = ({
  size = 'md',
  showText = false,
  textPosition = 'right',
  variant = 'crest',
  theme = 'auto',
  monogramText = 'R&R',
  subtitle = 'Village Dobh • 2026',
  className = '',
  onClick,
}) => {
  // Determine pixel size
  let pxSize = 40;
  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'xs':
        pxSize = 28;
        break;
      case 'sm':
        pxSize = 36;
        break;
      case 'md':
        pxSize = 46;
        break;
      case 'lg':
        pxSize = 64;
        break;
      case 'xl':
        pxSize = 88;
        break;
    }
  }

  // Generate unique IDs for SVG gradients so multiple instances don't collide
  const idPrefix = React.useId().replace(/:/g, '');

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* SVG Crest Medallion */}
      <svg
        width={pxSize}
        height={pxSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-[1.03] drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          {/* Luxury Metallic Gold Gradient */}
          <linearGradient id={`${idPrefix}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFB15B" />
            <stop offset="30%" stopColor="#F9E7B9" />
            <stop offset="55%" stopColor="#D4A244" />
            <stop offset="85%" stopColor="#AA7828" />
            <stop offset="100%" stopColor="#F5DC9A" />
          </linearGradient>

          {/* Deep Royal Wine / Burgundy Gradient */}
          <linearGradient id={`${idPrefix}-burgundy`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#872E49" />
            <stop offset="60%" stopColor="#661E34" />
            <stop offset="100%" stopColor="#4A1223" />
          </linearGradient>

          {/* Soft Pearlescent Blush Background */}
          <radialGradient id={`${idPrefix}-bg-light`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#FFF9FB" />
            <stop offset="70%" stopColor="#FCECEF" />
            <stop offset="100%" stopColor="#F4D3DC" />
          </radialGradient>

          {/* Luxury Dark Mode Velvet Background */}
          <radialGradient id={`${idPrefix}-bg-dark`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#3A1724" />
            <stop offset="70%" stopColor="#220B14" />
            <stop offset="100%" stopColor="#14060C" />
          </radialGradient>

          {/* Subtle Inner Glow Shadow */}
          <filter id={`${idPrefix}-shadow`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Outer Hexagonal / Scalloped Ring */}
        <circle
          cx="60"
          cy="60"
          r="56"
          className="fill-[url(#${idPrefix}-bg-light)] dark:fill-[url(#${idPrefix}-bg-dark)]"
          stroke={`url(#${idPrefix}-gold)`}
          strokeWidth="1.75"
        />

        {/* Outer Delicate Beaded Ring (Ornamental Dots) */}
        <circle
          cx="60"
          cy="60"
          r="52"
          stroke={`url(#${idPrefix}-gold)`}
          strokeWidth="0.8"
          strokeDasharray="1.5 3"
          opacity="0.85"
        />

        {/* Concentric Thin Inner Border */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke={`url(#${idPrefix}-gold)`}
          strokeWidth="0.75"
          opacity="0.7"
        />

        {/* Laurel Wreath Left Side */}
        <g stroke={`url(#${idPrefix}-gold)`} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M22 66 C 21 48, 30 32, 45 23" />
          {/* Leaves along left arc */}
          <path d="M 23 60 C 20 57, 18 52, 23 50 C 25 53, 25 57, 23 60 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 26 49 C 23 45, 23 40, 28 39 C 30 42, 29 47, 26 49 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 33 39 C 30 35, 31 29, 36 30 C 37 34, 35 38, 33 39 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 43 30 C 40 26, 42 21, 47 23 C 47 27, 45 30, 43 30 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
        </g>

        {/* Laurel Wreath Right Side (Mirrored) */}
        <g stroke={`url(#${idPrefix}-gold)`} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M98 66 C 99 48, 90 32, 75 23" />
          {/* Leaves along right arc */}
          <path d="M 97 60 C 100 57, 102 52, 97 50 C 95 53, 95 57, 97 60 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 94 49 C 97 45, 97 40, 92 39 C 90 42, 91 47, 94 49 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 87 39 C 90 35, 89 29, 84 30 C 83 34, 85 38, 87 39 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
          <path d="M 77 30 C 80 26, 78 21, 73 23 C 73 27, 75 30, 77 30 Z" fill={`url(#${idPrefix}-gold)`} opacity="0.85" />
        </g>

        {/* Top Royal Apex Finial / Kalash Motif */}
        <g transform="translate(60, 16)" textAnchor="middle">
          {/* Central diamond crown finial */}
          <path
            d="M 0 -6 L 4 -1 L 0 4 L -4 -1 Z"
            fill={`url(#${idPrefix}-gold)`}
            stroke={`url(#${idPrefix}-gold)`}
            strokeWidth="0.5"
          />
          <circle cx="0" cy="-8" r="1.5" fill={`url(#${idPrefix}-gold)`} />
          {/* Tiny side pearls */}
          <circle cx="-7" cy="0" r="1" fill={`url(#${idPrefix}-gold)`} opacity="0.9" />
          <circle cx="7" cy="0" r="1" fill={`url(#${idPrefix}-gold)`} opacity="0.9" />
        </g>

        {/* Center Intertwined Royal Monogram R & R */}
        <g filter={`url(#${idPrefix}-shadow)`}>
          {/* First "R" Letter with Calligraphic Serif */}
          <text
            x="44"
            y="69"
            fontFamily="'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif"
            fontSize="32"
            fontWeight="700"
            fontStyle="normal"
            textAnchor="middle"
            fill={`url(#${idPrefix}-gold)`}
            stroke={`url(#${idPrefix}-burgundy)`}
            strokeWidth="0.4"
            letterSpacing="-0.5"
          >
            R
          </text>

          {/* Central Delicate Flourish / Ampersand / Diamond Star */}
          <g transform="translate(60, 60)">
            <path
              d="M 0 -5 L 2.5 0 L 0 5 L -2.5 0 Z"
              fill={`url(#${idPrefix}-gold)`}
            />
            <circle cx="0" cy="0" r="1" fill="#FFF9FB" />
          </g>

          {/* Second "R" Letter */}
          <text
            x="76"
            y="69"
            fontFamily="'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif"
            fontSize="32"
            fontWeight="700"
            fontStyle="normal"
            textAnchor="middle"
            fill={`url(#${idPrefix}-gold)`}
            stroke={`url(#${idPrefix}-burgundy)`}
            strokeWidth="0.4"
            letterSpacing="-0.5"
          >
            R
          </text>
        </g>

        {/* Bottom Ribbon / Arch Banner with "EST. 2026" */}
        <g transform="translate(60, 94)">
          {/* Mini arch ribbon line */}
          <path
            d="M -30 -4 Q 0 4 30 -4"
            stroke={`url(#${idPrefix}-gold)`}
            strokeWidth="0.75"
            fill="none"
          />
          <text
            x="0"
            y="3"
            fontFamily="'Montserrat', 'Cinzel', 'Cinzel Decorative', sans-serif"
            fontSize="6.5"
            fontWeight="700"
            letterSpacing="2"
            textAnchor="middle"
            fill={`url(#${idPrefix}-gold)`}
          >
            2026
          </text>
          {/* Bottom center star */}
          <circle cx="0" cy="8" r="1.2" fill={`url(#${idPrefix}-gold)`} />
        </g>
      </svg>

      {/* Optional Side / Bottom Wordmark Typography */}
      {showText && (
        <div className={`flex flex-col ${textPosition === 'bottom' ? 'items-center text-center' : 'items-start text-left'}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-sm sm:text-base tracking-wide text-[#702C43] dark:text-stone-100 uppercase">
              Rahul & Radhika
            </span>
            <span className="text-[10px] text-[#AA7828] font-serif">✦</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#765F68] dark:text-stone-400 font-medium">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
