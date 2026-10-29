import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export interface WaxSealProps {
  stage: 'idle' | 'pressed' | 'cracking' | 'opening' | 'entering';
  onClick: () => void;
  size?: number;
  className?: string;
}

/**
 * Deterministic organic multi-lobed contour simulating thick hand-poured antique wax
 */
function generateWaxPuddlePath(cx: number, cy: number, baseRadius: number): string {
  const steps = 48;
  const points: Array<[number, number]> = [];

  for (let i = 0; i < steps; i++) {
    const theta = (i * 2 * Math.PI) / steps;
    // Multi-harmonic perturbation with subtle downward pool weight (molten wax settle)
    const downwardWeight = Math.sin(theta) > 0 ? Math.sin(theta) * 2.8 : 0;
    const r =
      baseRadius +
      downwardWeight +
      3.4 * Math.sin(3 * theta + 0.5) +
      2.6 * Math.cos(5 * theta - 0.3) +
      1.8 * Math.sin(7 * theta + 1.1) +
      1.2 * Math.cos(2 * theta);

    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push([x, y]);
  }

  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const midX = (curr[0] + next[0]) / 2;
    const midY = (curr[1] + next[1]) / 2;
    d += ` Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  stage,
  onClick,
  size = 132,
  className = '',
}) => {
  const { lang, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const isBroken = stage === 'cracking' || stage === 'opening' || stage === 'entering';
  const isPressed = stage === 'pressed';

  // Deterministic contour paths
  const outerWaxPath = useMemo(() => generateWaxPuddlePath(100, 100, 86), []);
  const rimBevelPath = useMemo(() => generateWaxPuddlePath(100, 100, 78), []);

  // 12 micro gold-wax fragments that scatter on cracking
  const fragments = useMemo(
    () => [
      { id: 1, angle: -65, dist: 68, size: 5, rot: -45, delay: 0 },
      { id: 2, angle: -25, dist: 82, size: 4, rot: 50, delay: 0.02 },
      { id: 3, angle: 18, dist: 76, size: 6, rot: 75, delay: 0.01 },
      { id: 4, angle: 60, dist: 64, size: 5, rot: -35, delay: 0.03 },
      { id: 5, angle: 105, dist: 72, size: 6, rot: 40, delay: 0.02 },
      { id: 6, angle: 145, dist: 78, size: 4, rot: -60, delay: 0.04 },
      { id: 7, angle: -115, dist: 66, size: 5, rot: 55, delay: 0.01 },
      { id: 8, angle: -155, dist: 74, size: 5, rot: -45, delay: 0.03 },
      { id: 9, angle: -85, dist: 84, size: 4, rot: 30, delay: 0.02 },
      { id: 10, angle: 85, dist: 79, size: 5, rot: -50, delay: 0.03 },
      { id: 11, angle: 35, dist: 88, size: 4, rot: 65, delay: 0.02 },
      { id: 12, angle: -45, dist: 90, size: 4, rot: -70, delay: 0.01 },
    ],
    []
  );

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* 1. Realistic Deep Contact Shadows Grounding the Seal onto Paper */}
      <div
        style={{
          width: size * 0.92,
          height: size * 0.92,
          transform: 'translateY(8px)',
        }}
        className="absolute rounded-full bg-[#2A1104]/38 blur-md pointer-events-none"
      />
      <div
        style={{
          width: size * 1.12,
          height: size * 1.12,
          transform: 'translateY(12px)',
        }}
        className="absolute rounded-full bg-[#4A1D08]/20 blur-xl pointer-events-none"
      />

      {/* 2. Soft Golden Breathing Halo (Idle only) */}
      {stage === 'idle' && !prefersReducedMotion && (
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ width: size * 1.15, height: size * 1.15 }}
          className="absolute rounded-full bg-gradient-to-r from-[#F7DF94]/30 via-[#E5B545]/20 to-[#9E6510]/10 blur-lg pointer-events-none"
        />
      )}

      {/* 3. Interactive Seal Core */}
      <button
        type="button"
        onClick={onClick}
        disabled={stage !== 'idle'}
        aria-label={t('entry_open_aria')}
        title={t('entry_tap_seal')}
        style={{ width: size, height: size }}
        className={`group relative rounded-full p-0 border-0 bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D6AD62]/80 transition-transform duration-200 ${
          isPressed ? 'scale-95' : 'hover:scale-[1.03]'
        } ${stage !== 'idle' ? 'pointer-events-none' : ''}`}
      >
        {/* Intact Seal Body */}
        {!isBroken && (
          <motion.div
            animate={
              prefersReducedMotion || stage !== 'idle'
                ? false
                : {
                    scale: [1, 1.02, 1],
                  }
            }
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full relative flex items-center justify-center rounded-full drop-shadow-[0_8px_24px_rgba(45,18,4,0.5)] overflow-hidden"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full overflow-visible block"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Antique Gold Surface Gradient */}
                <radialGradient id="antique-gold-body" cx="30%" cy="26%" r="76%">
                  <stop offset="0%" stopColor="#FFFEE8" />
                  <stop offset="12%" stopColor="#FDE492" />
                  <stop offset="35%" stopColor="#DC9E28" />
                  <stop offset="68%" stopColor="#A86E12" />
                  <stop offset="88%" stopColor="#6C4206" />
                  <stop offset="100%" stopColor="#3C2203" />
                </radialGradient>

                {/* Raised Outer Rim Gradient */}
                <linearGradient id="antique-gold-rim" x1="15%" y1="10%" x2="85%" y2="90%">
                  <stop offset="0%" stopColor="#FFF9E0" />
                  <stop offset="25%" stopColor="#F5D06A" />
                  <stop offset="60%" stopColor="#9C620E" />
                  <stop offset="100%" stopColor="#432603" />
                </linearGradient>

                {/* Recessed Basin Gradient (Stamped Center) */}
                <radialGradient id="antique-basin-grad" cx="40%" cy="36%" r="64%">
                  <stop offset="0%" stopColor="#D99E2A" />
                  <stop offset="40%" stopColor="#AC7113" />
                  <stop offset="80%" stopColor="#6A3F05" />
                  <stop offset="100%" stopColor="#442503" />
                </radialGradient>

                {/* Stamped Relief Monogram & Ornament Foil */}
                <linearGradient id="embossed-relief-foil" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="20%" stopColor="#FFF1B8" />
                  <stop offset="55%" stopColor="#F4C756" />
                  <stop offset="85%" stopColor="#C98412" />
                  <stop offset="100%" stopColor="#6E3D02" />
                </linearGradient>

                {/* Drop Shadow Filter for Monogram Relief */}
                <filter id="monogram-emboss-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.8" stdDeviation="1" floodColor="#241101" floodOpacity="0.85" />
                  <feDropShadow dx="0" dy="-0.8" stdDeviation="0.4" floodColor="#FFF9DC" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Poured Organic Outer Wax Body */}
              <path
                d={outerWaxPath}
                fill="url(#antique-gold-body)"
                stroke="url(#antique-gold-rim)"
                strokeWidth="3.2"
              />

              {/* Outer Rim Bevel Highlight Arc */}
              <path
                d={rimBevelPath}
                fill="none"
                stroke="#FFFBE5"
                strokeWidth="1.8"
                opacity="0.8"
              />

              {/* Recessed Stamped Center Disc Basin */}
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="url(#antique-basin-grad)"
                stroke="#3E2203"
                strokeWidth="2.8"
              />

              {/* Concentric Precision Stamp Beading & Lathe Grooves */}
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="#FDE28A"
                strokeWidth="0.8"
                opacity="0.45"
              />
              <circle
                cx="100"
                cy="100"
                r="56"
                fill="none"
                stroke="#331A02"
                strokeWidth="0.9"
                opacity="0.5"
              />
              <circle
                cx="100"
                cy="100"
                r="52"
                fill="none"
                stroke="#FDE28A"
                strokeWidth="0.75"
                strokeDasharray="2.5 3"
                opacity="0.55"
              />

              {/* Embossed Royal Laurel Wreath & Marigold Florets */}
              <g
                stroke="url(#embossed-relief-foil)"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
              >
                {/* Left Arc */}
                <path d="M 64 68 C 50 82 50 118 64 132" fill="none" />
                <line x1="60" y1="72" x2="48" y2="66" />
                <line x1="56" y1="88" x2="44" y2="84" />
                <line x1="56" y1="112" x2="44" y2="116" />
                <line x1="60" y1="128" x2="48" y2="134" />
                <circle cx="48" cy="100" r="3.5" fill="url(#embossed-relief-foil)" stroke="none" />

                {/* Right Arc */}
                <path d="M 136 68 C 150 82 150 118 136 132" fill="none" />
                <line x1="140" y1="72" x2="152" y2="66" />
                <line x1="144" y1="88" x2="156" y2="84" />
                <line x1="144" y1="112" x2="156" y2="116" />
                <line x1="140" y1="128" x2="152" y2="134" />
                <circle cx="152" cy="100" r="3.5" fill="url(#embossed-relief-foil)" stroke="none" />
              </g>

              {/* Top Regal Diamond Stamped Motif */}
              <g transform="translate(100, 56)">
                <path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" fill="url(#embossed-relief-foil)" />
                <circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Deeply Stamped Monogram: "R & R" / "रा • रा" in Classic Regal Serif */}
              <text
                x="100"
                y="103"
                textAnchor="middle"
                dominantBaseline="central"
                fill="url(#embossed-relief-foil)"
                filter="url(#monogram-emboss-shadow)"
                className="font-heading font-bold"
                style={{
                  fontSize: lang === 'hi' ? '32px' : '36px',
                  letterSpacing: lang === 'hi' ? '1px' : '2px',
                }}
              >
                {lang === 'hi' ? 'रा • रा' : 'R & R'}
              </text>

              {/* Bottom Regal Diamond Stamped Motif */}
              <g transform="translate(100, 144)">
                <path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" fill="url(#embossed-relief-foil)" />
                <circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Top-Left Specular Reflection Curvature */}
              <path
                d="M 50 66 C 62 44 96 34 132 38"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>

            {/* Subtle Periodic Light Glint Sweep */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <motion.div
                  initial={{ x: '-160%', opacity: 0 }}
                  animate={{
                    x: ['160%', '-160%'],
                    opacity: [0, 0.45, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-y-0 w-10 -skew-x-25 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Realistic Broken Seal Snap & Parting Halves */}
        {isBroken && (
          <div className="w-full h-full relative overflow-visible pointer-events-none">
            {/* Left Seal Half */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : {
                      x: -36,
                      y: 38,
                      rotate: -18,
                      opacity: [1, 0.95, 0],
                    }
              }
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                clipPath: 'polygon(0 0, 52% 0, 46% 28%, 54% 54%, 47% 80%, 51% 100%, 0 100%)',
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FDE18B] via-[#D99B26] to-[#4A2E04] shadow-md border border-[#FFECA0] flex items-center justify-center">
                <span className="font-heading font-bold text-[#FFFDF8] text-2xl -ml-5">
                  {lang === 'hi' ? 'रा' : 'R'}
                </span>
              </div>
            </motion.div>

            {/* Right Seal Half */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : {
                      x: 36,
                      y: 42,
                      rotate: 20,
                      opacity: [1, 0.95, 0],
                    }
              }
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 51% 100%, 47% 80%, 54% 54%, 46% 28%)',
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-bl from-[#FDE18B] via-[#D99B26] to-[#4A2E04] shadow-md border border-[#FFECA0] flex items-center justify-center">
                <span className="font-heading font-bold text-[#FFFDF8] text-2xl ml-5">
                  {lang === 'hi' ? 'रा' : 'R'}
                </span>
              </div>
            </motion.div>

            {/* Bursting Gold Wax Micro-Fragments */}
            {!prefersReducedMotion &&
              fragments.map((frag) => {
                const rad = (frag.angle * Math.PI) / 180;
                const targetX = Math.cos(rad) * frag.dist;
                const targetY = Math.sin(rad) * frag.dist + 28;

                return (
                  <motion.div
                    key={frag.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: [0, 1.2, 0],
                      opacity: [1, 0.9, 0],
                      rotate: frag.rot,
                    }}
                    transition={{
                      duration: 0.75,
                      delay: frag.delay,
                      ease: 'easeOut',
                    }}
                    style={{
                      width: frag.size,
                      height: frag.size,
                    }}
                    className="absolute left-1/2 top-1/2 -ml-1 -mt-1 rounded-sm bg-gradient-to-br from-[#FFFCE8] via-[#FDE18B] to-[#7E4F06] shadow-[0_0_8px_rgba(253,225,139,0.8)]"
                  />
                );
              })}
          </div>
        )}
      </button>
    </div>
  );
};
