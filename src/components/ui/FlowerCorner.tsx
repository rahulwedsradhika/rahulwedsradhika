import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FlowerCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

/**
 * Rich Layered Marigold (Genda) SVG Component
 * 4 petal rings with ruffled scalloped contour, dual-tone gold/orange, and center florets.
 */
export const MarigoldFlower: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  color?: 'gold' | 'deepOrange';
  opacity?: number;
  rotation?: number;
}> = ({ cx, cy, size = 52, color = 'gold', opacity = 0.98, rotation = 0 }) => {
  const isGold = color === 'gold';
  const primary = isGold ? '#E8B84A' : '#C9772B';
  const shadow = isGold ? '#C99126' : '#A8521A';
  const highlight = isGold ? '#FBE588' : '#E8A355';
  const center = isGold ? '#8F4E18' : '#78320F';

  const r = size / 2;
  const outerPetals = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336];
  const midPetals = [12, 42, 72, 102, 132, 162, 192, 222, 252, 282, 312, 342];
  const innerPetals = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`} opacity={opacity}>
      {/* Outer petal ring with notched scalloped petal shape */}
      {outerPetals.map((deg, i) => (
        <path
          key={`out-${i}`}
          d={`M 0 0 C ${-r * 0.22} ${-r * 0.45}, ${-r * 0.28} ${-r * 0.85}, 0 ${-r * 0.95} C ${r * 0.28} ${-r * 0.85}, ${r * 0.22} ${-r * 0.45}, 0 0 Z`}
          fill={shadow}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* Mid petal ring */}
      {midPetals.map((deg, i) => (
        <path
          key={`mid-${i}`}
          d={`M 0 0 C ${-r * 0.2} ${-r * 0.35}, ${-r * 0.24} ${-r * 0.72}, 0 ${-r * 0.8} C ${r * 0.24} ${-r * 0.72}, ${r * 0.2} ${-r * 0.35}, 0 0 Z`}
          fill={primary}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* Inner highlight florets */}
      {innerPetals.map((deg, i) => (
        <ellipse
          key={`in-${i}`}
          cx="0"
          cy={-r * 0.45}
          rx={r * 0.18}
          ry={r * 0.28}
          fill={highlight}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* Fluffy central tuft */}
      <circle cx="0" cy="0" r={r * 0.28} fill={center} />
      <circle cx="0" cy="0" r={r * 0.18} fill="#5C2607" />
      <circle cx="-1" cy="-1" r={r * 0.08} fill="#FFEAA2" opacity={0.8} />
    </g>
  );
};

/**
 * Botanical Soft Pink Rose SVG Component
 * Realistic spiraling petals in soft pink #E7A9A0 and terracotta #B5603C with ivory highlights.
 */
export const RoseFlower: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  opacity?: number;
  rotation?: number;
}> = ({ cx, cy, size = 46, opacity = 0.96, rotation = 0 }) => {
  const r = size / 2;
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`} opacity={opacity}>
      <circle cx="0" cy="0" r={r * 0.94} fill="#B5603C" opacity={0.35} />

      {/* Outer petals */}
      <path
        d={`M ${-r * 0.85} ${-r * 0.2} C ${-r * 0.95} ${-r * 0.8}, ${r * 0.1} ${-r * 0.95}, ${r * 0.75} ${-r * 0.3} C ${r * 0.95} ${r * 0.4}, ${r * 0.3} ${r * 0.88}, ${-r * 0.45} ${r * 0.78} Z`}
        fill="#E7A9A0"
      />
      <path
        d={`M ${-r * 0.7} ${r * 0.4} C ${-r * 0.9} ${-r * 0.3}, ${-r * 0.1} ${-r * 0.88}, ${r * 0.7} ${-r * 0.55} C ${r * 0.9} ${r * 0.2}, ${r * 0.5} ${r * 0.82}, ${-r * 0.2} ${r * 0.88} Z`}
        fill="#F3C5BE"
        opacity={0.92}
      />

      {/* Mid spiral petals */}
      <path
        d={`M ${-r * 0.48} ${-r * 0.1} C ${-r * 0.55} ${-r * 0.55}, ${r * 0.2} ${-r * 0.68}, ${r * 0.48} ${-r * 0.15} C ${r * 0.65} ${r * 0.35}, ${r * 0.1} ${r * 0.62}, ${-r * 0.3} ${r * 0.48} Z`}
        fill="#B5603C"
        opacity={0.68}
      />
      <path
        d={`M ${-r * 0.35} ${-r * 0.3} C ${-r * 0.1} ${-r * 0.52}, ${r * 0.38} ${-r * 0.3}, ${r * 0.32} ${r * 0.1} C ${r * 0.2} ${r * 0.42}, ${-r * 0.25} ${r * 0.38}, ${-r * 0.35} ${-r * 0.1} Z`}
        fill="#FFF9EE"
        opacity={0.8}
      />

      {/* Core bud */}
      <ellipse cx="0" cy="0" rx={r * 0.22} ry={r * 0.16} fill="#9A482A" />
      <ellipse cx="-1" cy="-0.8" rx={r * 0.12} ry={r * 0.09} fill="#F3C5BE" />
    </g>
  );
};

/**
 * Mogra / Jasmine White Fragrant Star Florets
 */
export const MograFlower: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  rotation?: number;
  opacity?: number;
}> = ({ cx, cy, size = 20, rotation = 0, opacity = 0.95 }) => {
  const r = size / 2;
  const petals = [0, 72, 144, 216, 288];

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`} opacity={opacity}>
      <circle cx="0" cy="0" r={r * 0.35} fill="#5C7A3A" />
      {petals.map((deg, i) => (
        <ellipse
          key={`mogra-${i}`}
          cx="0"
          cy={-r * 0.65}
          rx={r * 0.32}
          ry={r * 0.55}
          fill="#FFFDF8"
          stroke="#F3EAD3"
          strokeWidth="0.5"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r={r * 0.2} fill="#E8B84A" />
    </g>
  );
};

/**
 * Pointed Botanical Leaf with Delicate Vein
 */
export const OliveLeaf: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  rotation?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, rx = 24, ry = 8.5, rotation = 0, color = '#6B7F3A', opacity = 0.92 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation})`} opacity={opacity}>
    <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={color} />
    <line
      x1={-rx * 0.85}
      y1="0"
      x2={rx * 0.85}
      y2="0"
      stroke="#485B22"
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity={0.65}
    />
  </g>
);

/**
 * Tiny Flower Bud Component
 */
export const FlowerBud: React.FC<{
  cx: number;
  cy: number;
  color?: string;
  rotation?: number;
}> = ({ cx, cy, color = '#E7A9A0', rotation = 0 }) => (
  <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
    <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#5F7232" />
    <circle cx="3" cy="-1" r="3.2" fill={color} />
    <circle cx="4" cy="1" r="2.2" fill="#E8B84A" />
  </g>
);

/**
 * Corner Flower Garland Cluster
 * Mirrors cleanly via an outer wrapper div (-scale-x-100) while inner motion.div sways gently.
 */
export const FlowerCorner: React.FC<FlowerCornerProps> = ({
  position = 'top-left',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  const isRight = position === 'top-right' || position === 'bottom-right';
  const isBottom = position === 'bottom-left' || position === 'bottom-right';

  // Optional custom asset check: if /assets/flowers/corner-left.webp or corner-right.webp exists and loads, use it.
  // Otherwise gracefully render crisp layered vector art.
  const customImagePath = isRight ? '/assets/flowers/corner-right.webp' : '/assets/flowers/corner-left.webp';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none z-[3] overflow-visible ${
        isRight ? '-scale-x-100' : ''
      } ${isBottom ? '-scale-y-100' : ''} ${className}`}
    >
      <motion.div
        style={{
          transformOrigin: isRight ? 'top right' : 'top left',
        }}
        animate={
          prefersReducedMotion
            ? false
            : {
                rotate: [0, 1.8, 0],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'reverse',
        }}
        className="w-full h-full"
      >
        {!imageError && false ? (
          // In case custom webp art is provided later
          <img
            src={customImagePath}
            alt=""
            onError={() => setImageError(true)}
            className="w-full h-auto drop-shadow-[0_4px_16px_rgba(201,119,43,0.14)]"
          />
        ) : (
          <svg
            viewBox="0 0 300 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-[0_6px_20px_rgba(180,100,30,0.15)]"
          >
            {/* Background trailing foliage */}
            <OliveLeaf x={24} y={35} rx={28} ry={9} rotation={-42} opacity={0.82} color="#5C7A3A" />
            <OliveLeaf x={58} y={18} rx={30} ry={10} rotation={-15} opacity={0.88} color="#6B7F3A" />
            <OliveLeaf x={130} y={18} rx={26} ry={9} rotation={12} color="#7A8F43" />
            <OliveLeaf x={192} y={30} rx={28} ry={9.5} rotation={24} color="#5F7232" />
            <OliveLeaf x={250} y={50} rx={24} ry={8.5} rotation={38} opacity={0.8} color="#6B7F3A" />

            <OliveLeaf x={30} y={112} rx={26} ry={9} rotation={82} color="#7A8F43" />
            <OliveLeaf x={40} y={180} rx={24} ry={8.5} rotation={105} color="#5F7232" />
            <OliveLeaf x={68} y={232} rx={20} ry={7.5} rotation={125} opacity={0.78} color="#6B7F3A" />

            {/* Trailing mogra florets and flower buds */}
            <MograFlower cx={268} cy={54} size={18} rotation={25} />
            <MograFlower cx={218} cy={22} size={16} rotation={10} />
            <MograFlower cx={76} cy={242} size={18} rotation={115} />
            <MograFlower cx={18} cy={82} size={17} rotation={75} />
            <FlowerBud cx={285} cy={66} color="#E7A9A0" rotation={40} />
            <FlowerBud cx={88} cy={252} color="#E8B84A" rotation={130} />

            {/* 1. Large Golden Marigold (Corner anchor) */}
            <MarigoldFlower cx={76} cy={72} size={66} color="gold" opacity={0.98} rotation={14} />

            {/* 2. Soft Pink Rose (Right beside the anchor) */}
            <RoseFlower cx={142} cy={56} size={54} opacity={0.96} rotation={-16} />

            {/* 3. Deep Orange Marigold (Hanging downward) */}
            <MarigoldFlower cx={58} cy={138} size={54} color="deepOrange" opacity={0.96} rotation={-22} />

            {/* 4. Second Marigold along horizontal garland arc */}
            <MarigoldFlower cx={202} cy={46} size={46} color="gold" opacity={0.94} rotation={28} />

            {/* 5. Second Soft Rose (Lower cluster) */}
            <RoseFlower cx={78} cy={190} size={40} opacity={0.94} rotation={42} />

            {/* 6. Accent Marigold floret */}
            <MarigoldFlower cx={128} cy={114} size={36} color="gold" opacity={0.92} rotation={8} />

            {/* 7. Accent Mogra cluster in heart of garland */}
            <MograFlower cx={105} cy={52} size={20} rotation={-10} />
            <MograFlower cx={96} cy={135} size={19} rotation={45} />

            {/* Foreground crisp olive sprigs */}
            <OliveLeaf x={108} y={90} rx={18} ry={6.5} rotation={55} color="#7A8F43" opacity={0.95} />
            <OliveLeaf x={164} y={78} rx={18} ry={6.5} rotation={-22} color="#5F7232" opacity={0.95} />
            <OliveLeaf x={46} y={108} rx={15} ry={6} rotation={-60} opacity={0.9} color="#6B7F3A" />
            <OliveLeaf x={62} y={160} rx={16} ry={6} rotation={75} opacity={0.9} color="#5F7232" />
          </svg>
        )}
      </motion.div>
    </div>
  );
};

/**
 * Traditional Marigold Toran Garland (Hanging across hero top)
 */
export const ToranGarland: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1000 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xs"
        preserveAspectRatio="none"
      >
        {/* Main curved swag garland strings */}
        <path
          d="M 0 6 Q 250 36 500 6 Q 750 36 1000 6"
          stroke="#C99126"
          strokeWidth="2.5"
          strokeDasharray="4 3"
          opacity="0.6"
        />

        {/* Ashoka/Mango leaves hanging along garland */}
        {[80, 160, 250, 340, 420, 580, 660, 750, 840, 920].map((x, i) => (
          <path
            key={`leaf-${i}`}
            d={`M ${x} 12 C ${x - 5} 25, ${x - 6} 45, ${x} 54 C ${x + 6} 45, ${x + 5} 25, ${x} 12 Z`}
            fill="#5C7A3A"
            opacity="0.85"
          />
        ))}

        {/* Alternating gold and deep-orange marigold drops along swags */}
        {[40, 120, 200, 280, 360, 460, 540, 620, 700, 780, 880, 960].map((x, i) => (
          <MarigoldFlower
            key={`toran-fl-${i}`}
            cx={x}
            cy={i % 2 === 0 ? 20 : 25}
            size={22}
            color={i % 2 === 0 ? 'gold' : 'deepOrange'}
            opacity={0.92}
          />
        ))}

        {/* Swag crest florets */}
        <MarigoldFlower cx={250} cy={34} size={28} color="gold" />
        <MarigoldFlower cx={500} cy={8} size={26} color="deepOrange" />
        <MarigoldFlower cx={750} cy={34} size={28} color="gold" />
      </svg>
    </div>
  );
};

/**
 * Small Faint Marigold-and-Leaf Sprig for bottom divider
 */
export const FlowerSprig: React.FC<{
  side?: 'left' | 'right';
  className?: string;
}> = ({ side = 'left', className = '' }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none select-none inline-flex items-center opacity-45 ${
      side === 'right' ? '-scale-x-100' : ''
    } ${className}`}
  >
    <svg viewBox="0 0 70 28" fill="none" className="w-14 h-5">
      <OliveLeaf x={18} y={14} rx={14} ry={5} rotation={-20} color="#6B7F3A" />
      <OliveLeaf x={32} y={18} rx={12} ry={4.5} rotation={25} color="#7A8F43" />
      <MarigoldFlower cx={48} cy={14} size={22} color="gold" opacity={0.9} />
      <MograFlower cx={10} cy={10} size={12} rotation={-35} />
    </svg>
  </div>
);
