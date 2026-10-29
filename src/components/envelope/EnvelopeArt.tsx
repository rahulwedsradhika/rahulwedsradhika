import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface EnvelopeArtProps {
  width: number;
  height: number;
  className?: string;
}

/**
 * Reusable Tone-on-Tone Embossed Line Art Primitive
 * Renders each stroke with a light highlight offset up-left and a soft shadow offset down-right
 * creating a realistic letterpress / debossed feel on luxury cotton paper.
 */
const EmbossedPath: React.FC<{
  d: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
}> = ({ d, strokeWidth = 1.2, strokeDasharray, fill = 'none' }) => (
  <g>
    {/* Highlight (Lit from top-left) */}
    <path
      d={d}
      fill={fill === 'none' ? 'none' : '#FFFFFF'}
      fillOpacity={fill === 'none' ? undefined : 0.45}
      stroke="#FFFFFF"
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
      transform="translate(-0.7, -0.7)"
    />
    {/* Shadow (Depression cast to bottom-right) */}
    <path
      d={d}
      fill={fill === 'none' ? 'none' : '#702C43'}
      fillOpacity={fill === 'none' ? undefined : 0.14}
      stroke="#702C43"
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.25}
      transform="translate(0.7, 0.7)"
    />
  </g>
);

const MotifWheatStalk: React.FC<{ x: number; y: number; scale?: number; rotation?: number }> = ({
  x,
  y,
  scale = 1,
  rotation = 0,
}) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
    <EmbossedPath d="M 0 0 C 4 25 1 55 0 85" strokeWidth={1.3} />
    <EmbossedPath d="M 0 12 C -7 8 -8 2 0 6 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M 0 20 C 7 16 8 10 0 14 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M 0 30 C -8 26 -9 18 0 23 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M 0 38 C 8 34 9 26 0 31 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M 0 50 C -8 46 -9 38 0 43 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M 0 58 C 8 54 9 46 0 51 Z" fill="fill" strokeWidth={0.9} />
    <EmbossedPath d="M -7 8 L -15 -3" strokeWidth={0.7} />
    <EmbossedPath d="M 7 16 L 15 5" strokeWidth={0.7} />
    <EmbossedPath d="M -8 26 L -16 15" strokeWidth={0.7} />
    <EmbossedPath d="M 8 34 L 16 23" strokeWidth={0.7} />
  </g>
);

const MotifMarigold: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 18 }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <EmbossedPath
      d={`M 0 ${-r} 
          C ${r * 0.4} ${-r * 1.05} ${r * 0.8} ${-r * 0.8} ${r} ${-r * 0.3} 
          C ${r * 1.05} ${r * 0.3} ${r * 0.7} ${r * 0.8} ${r * 0.2} ${r} 
          C ${-r * 0.3} ${r * 1.05} ${-r * 0.8} ${r * 0.7} ${-r} ${r * 0.2} 
          C ${-r * 1.05} ${-r * 0.3} ${-r * 0.7} ${-r * 0.8} 0 ${-r} Z`}
      strokeWidth={1.1}
    />
    <EmbossedPath
      d={`M 0 ${-r * 0.65} 
          C ${r * 0.3} ${-r * 0.7} ${r * 0.6} ${-r * 0.4} ${r * 0.65} 0 
          C ${r * 0.6} ${r * 0.4} ${r * 0.3} ${r * 0.7} 0 ${r * 0.65} 
          C ${-r * 0.3} ${r * 0.7} ${-r * 0.6} ${r * 0.4} ${-r * 0.65} 0 
          C ${-r * 0.6} ${-r * 0.4} ${-r * 0.3} ${-r * 0.7} 0 ${-r * 0.65} Z`}
      strokeWidth={0.9}
    />
    <EmbossedPath
      d={`M 0 ${-r * 0.3} 
          C ${r * 0.2} ${-r * 0.3} ${r * 0.3} ${-r * 0.2} ${r * 0.3} 0 
          C ${r * 0.3} ${r * 0.2} ${r * 0.2} ${r * 0.3} 0 ${r * 0.3} 
          C ${-r * 0.2} ${r * 0.3} ${-r * 0.3} ${r * 0.2} ${-r * 0.3} 0 
          C ${-r * 0.3} ${-r * 0.2} ${-r * 0.2} ${-r * 0.3} 0 ${-r * 0.3} Z`}
      strokeWidth={0.8}
      fill="fill"
    />
  </g>
);

const MotifLotus: React.FC<{ cx: number; cy: number; scale?: number }> = ({ cx, cy, scale = 1 }) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    <EmbossedPath d="M 0 -18 C -5 -8 -4 8 0 15 C 4 8 5 -8 0 -18 Z" fill="fill" strokeWidth={1} />
    <EmbossedPath d="M 0 15 C -8 8 -18 2 -15 -6 C -11 -3 -5 5 0 15 Z" strokeWidth={0.9} />
    <EmbossedPath d="M 0 15 C 8 8 18 2 15 -6 C 11 -3 5 5 0 15 Z" strokeWidth={0.9} />
    <EmbossedPath d="M -15 16 C -20 13 -26 6 -23 0 C -18 3 -11 10 -8 16 Z" strokeWidth={0.8} />
    <EmbossedPath d="M 15 16 C 20 13 26 6 23 0 C 18 3 11 10 8 16 Z" strokeWidth={0.8} />
  </g>
);

const MotifJasmineSprig: React.FC<{ x: number; y: number; rotation?: number; scale?: number }> = ({
  x,
  y,
  rotation = 0,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
    <EmbossedPath d="M 0 20 Q 4 8 0 0" strokeWidth={0.9} />
    <EmbossedPath d="M 0 0 L 0 -8 M 0 0 L 8 0 M 0 0 L 0 8 M 0 0 L -8 0" strokeWidth={0.9} />
    <circle cx="0" cy="0" r="1.2" fill="#702C43" opacity={0.25} />
  </g>
);

/**
 * Global SVG Definitions & Gradients for Tactile Envelope Rendering
 */
export const EnvelopeDefs: React.FC = () => (
  <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
    <defs>
      {/* 1. Fine Tactile Cotton Paper Grain Filter */}
      <filter id="envelope-paper-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1   0 0 0 0 0.96   0 0 0 0 0.97   0 0 0 0.055 0"
          result="coloredNoise"
        />
        <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
      </filter>

      {/* 2. Warm Blush Paper Base Gradient */}
      <linearGradient id="blush-paper-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9FB" />
        <stop offset="35%" stopColor="#FDF2F5" />
        <stop offset="70%" stopColor="#F8E3E9" />
        <stop offset="100%" stopColor="#F2D5DD" />
      </linearGradient>

      {/* 3. Deep Royal Burgundy Envelope Lining Gradient */}
      <linearGradient id="burgundy-lining-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#481424" />
        <stop offset="35%" stopColor="#6E283F" />
        <stop offset="75%" stopColor="#873551" />
        <stop offset="100%" stopColor="#9C405E" />
      </linearGradient>

      {/* 4. Royal Gold Diamond Lattice Inlay Pattern */}
      <pattern id="gold-diamond-lattice" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 12 0 L 24 12 L 12 24 L 0 12 Z" fill="none" stroke="#D6AD62" strokeWidth="0.8" opacity="0.32" />
        <circle cx="12" cy="12" r="1.1" fill="#F4E5BD" opacity="0.5" />
        <circle cx="0" cy="0" r="1.1" fill="#F4E5BD" opacity="0.5" />
        <circle cx="24" cy="0" r="1.1" fill="#F4E5BD" opacity="0.5" />
        <circle cx="0" cy="24" r="1.1" fill="#F4E5BD" opacity="0.5" />
        <circle cx="24" cy="24" r="1.1" fill="#F4E5BD" opacity="0.5" />
      </pattern>

      {/* 5. Gold Foil Inlay Gradient */}
      <linearGradient id="gold-foil-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D6AD62" />
        <stop offset="35%" stopColor="#FCEEBE" />
        <stop offset="70%" stopColor="#BA8E3C" />
        <stop offset="100%" stopColor="#8C621E" />
      </linearGradient>

      {/* 6. Soft Flap Crease & Ambient Shadow Gradients */}
      <linearGradient id="crease-shadow-bottom" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#702C43" stopOpacity="0.16" />
        <stop offset="50%" stopColor="#702C43" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#702C43" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="crease-shadow-left" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#702C43" stopOpacity="0.12" />
        <stop offset="60%" stopColor="#702C43" stopOpacity="0.03" />
        <stop offset="100%" stopColor="#702C43" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="crease-shadow-right" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#702C43" stopOpacity="0.12" />
        <stop offset="60%" stopColor="#702C43" stopOpacity="0.03" />
        <stop offset="100%" stopColor="#702C43" stopOpacity="0" />
      </linearGradient>

      {/* 7. Inner Envelope Cavity Shadow */}
      <linearGradient id="envelope-cavity-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#220710" stopOpacity="0.85" />
        <stop offset="30%" stopColor="#481424" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#6E283F" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Envelope Back: Deep royal burgundy interior lining visible when flap opens
 */
export const EnvelopeBack: React.FC<EnvelopeArtProps> = ({ width, height, className = '' }) => (
  <div style={{ width, height }} className={`absolute inset-0 select-none overflow-hidden rounded-[14px] ${className}`}>
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="w-full h-full block">
      {/* Rich burgundy lining */}
      <rect x="0" y="0" width={width} height={height} fill="url(#burgundy-lining-grad)" rx="14" />
      {/* Gold diamond pattern */}
      <rect x="0" y="0" width={width} height={height} fill="url(#gold-diamond-lattice)" rx="14" />
      {/* Interior top cavity shadow */}
      <rect x="0" y="0" width={width} height={height * 0.45} fill="url(#envelope-cavity-shadow)" rx="14" />
      {/* Subtle gold dashed perimeter thread */}
      <rect
        x="10"
        y="10"
        width={width - 20}
        height={height - 20}
        fill="none"
        stroke="#D6AD62"
        strokeWidth="0.8"
        strokeDasharray="4 3"
        opacity="0.4"
        rx="10"
      />
    </svg>
  </div>
);

/**
 * Envelope Front Pocket:
 * Dimensional folded paper construction featuring:
 * - Left Flap
 * - Right Flap
 * - Bottom Flap overlapping with soft crease shadows and highlight bevels
 * - Debossed botanical motifs and gold foil couple branding
 */
export const EnvelopeFrontPocket: React.FC<EnvelopeArtProps> = ({ width, height, className = '' }) => {
  const { lang } = useLanguage();
  const midX = width / 2;
  const pocketApexY = height * 0.48;

  // Geometry for realistic overlapping envelope flaps
  const leftFlapPath = `M 0 0 L ${midX * 0.72} ${height * 0.52} L 0 ${height} Z`;
  const rightFlapPath = `M ${width} 0 L ${width - midX * 0.72} ${height * 0.52} L ${width} ${height} Z`;
  const bottomFlapPath = `M 0 ${height} L ${midX * 0.42} ${pocketApexY + 12} Q ${midX} ${pocketApexY - 14} ${width - midX * 0.42} ${pocketApexY + 12} L ${width} ${height} Z`;

  return (
    <div style={{ width, height }} className={`absolute inset-0 select-none pointer-events-none ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="w-full h-full block overflow-visible"
      >
        {/* Layer 1: Left Flap */}
        <path d={leftFlapPath} fill="url(#blush-paper-body)" />
        {/* Left flap shadow & highlight */}
        <line x1="0" y1="0" x2={midX * 0.72} y2={height * 0.52} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" />
        <line x1="0" y1={height} x2={midX * 0.72} y2={height * 0.52} stroke="#702C43" strokeWidth="0.8" opacity="0.22" />

        {/* Layer 2: Right Flap */}
        <path d={rightFlapPath} fill="url(#blush-paper-body)" />
        {/* Right flap shadow & highlight */}
        <line x1={width} y1="0" x2={width - midX * 0.72} y2={height * 0.52} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" />
        <line x1={width} y1={height} x2={width - midX * 0.72} y2={height * 0.52} stroke="#702C43" strokeWidth="0.8" opacity="0.22" />

        {/* Ambient fold shadows cast by left and right flaps */}
        <rect x="0" y="0" width={width * 0.28} height={height} fill="url(#crease-shadow-left)" />
        <rect x={width * 0.72} y="0" width={width * 0.28} height={height} fill="url(#crease-shadow-right)" />

        {/* Layer 3: Bottom Overlapping Flap (Cuts across center with graceful curve) */}
        {/* Contact shadow under bottom flap */}
        <path
          d={bottomFlapPath}
          fill="none"
          stroke="#4A1626"
          strokeWidth="3.5"
          opacity="0.14"
          transform="translate(0, 2)"
        />
        <path d={bottomFlapPath} fill="url(#blush-paper-body)" />

        {/* Highlight on top edge of bottom flap */}
        <path
          d={`M 0 ${height} L ${midX * 0.42} ${pocketApexY + 12} Q ${midX} ${pocketApexY - 14} ${width - midX * 0.42} ${pocketApexY + 12} L ${width} ${height}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Crease shadow gradient from bottom edge */}
        <rect x="0" y={height * 0.65} width={width} height={height * 0.35} fill="url(#crease-shadow-bottom)" opacity="0.5" />

        {/* Restrained Indian Botanical Motifs */}
        <g opacity={0.8}>
          {/* Left Floral Sprig */}
          <MotifWheatStalk x={Math.max(18, width * 0.08)} y={height * 0.45} scale={Math.min(0.9, width / 550)} rotation={-10} />
          <MotifMarigold cx={Math.max(28, width * 0.14)} cy={height * 0.72} r={Math.min(18, width * 0.038)} />
          <MotifJasmineSprig x={Math.max(42, width * 0.2)} y={height * 0.58} rotation={35} scale={0.85} />

          {/* Right Floral Sprig (Mirrored) */}
          <g transform={`translate(${width}, 0) scale(-1, 1)`}>
            <MotifWheatStalk x={Math.max(18, width * 0.08)} y={height * 0.45} scale={Math.min(0.9, width / 550)} rotation={-10} />
            <MotifMarigold cx={Math.max(28, width * 0.14)} cy={height * 0.72} r={Math.min(18, width * 0.038)} />
            <MotifJasmineSprig x={Math.max(42, width * 0.2)} y={height * 0.58} rotation={35} scale={0.85} />
          </g>
        </g>

        {/* Center Bottom: Auspicious Lotus Crest */}
        <MotifLotus cx={midX} cy={height - 52} scale={0.65} />

        {/* Stamped Gold-Foil Typography */}
        <text
          x={midX}
          y={height - 24}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#gold-foil-accent)"
          filter="drop-shadow(0px 1px 1px rgba(112, 44, 67, 0.45))"
          className="font-heading font-bold"
          style={{
            fontSize: Math.max(10, Math.min(13, width * 0.024)),
            letterSpacing: lang === 'hi' ? '2.5px' : '4px',
          }}
        >
          {lang === 'hi' ? 'राहुल • राधिका' : 'RAHUL & RADHIKA'}
        </text>

        {/* Outer Rounded Perimeter Border */}
        <rect
          x="1"
          y="1"
          width={width - 2}
          height={height - 2}
          rx="14"
          fill="none"
          stroke="#702C43"
          strokeWidth="1.2"
          opacity="0.1"
        />
      </svg>
    </div>
  );
};

/**
 * Envelope Top Flap:
 * 3D rotating triangular flap with rounded tip holding the wax seal.
 * Features:
 * - Smooth 3D rotation (`rotateX`)
 * - Front: tactile blush paper with double gold foil inlay line and embossed lotus
 * - Back: rich burgundy silk liner with gold lattice
 */
interface EnvelopeTopFlapProps {
  width: number;
  height: number;
  rotateX: number;
  className?: string;
}

export const EnvelopeTopFlap: React.FC<EnvelopeTopFlapProps> = ({
  width,
  height,
  rotateX,
  className = '',
}) => {
  const midX = width / 2;
  // Flap extends to slightly past half the envelope height
  const flapHeight = height * 0.56;
  const isBackVisible = rotateX > 90;

  // Triangular flap contour with rounded tip
  const tipRadius = 14;
  const flapPath = `M 0 0 L ${midX - tipRadius} ${flapHeight - tipRadius * 0.8} Q ${midX} ${flapHeight} ${midX + tipRadius} ${flapHeight - tipRadius * 0.8} L ${width} 0 Z`;

  // Gold foil inlay line following the V contour
  const inlayPath = `M 16 6 L ${midX - 10} ${flapHeight - 16} Q ${midX} ${flapHeight - 8} ${midX + 10} ${flapHeight - 16} L ${width - 16} 6`;

  return (
    <div
      style={{
        width,
        height: flapHeight,
        transformOrigin: 'top center',
        transform: `rotateX(${rotateX}deg)`,
        transformStyle: 'preserve-3d',
        WebkitBackfaceVisibility: 'hidden',
      }}
      className={`absolute inset-x-0 top-0 select-none overflow-visible will-change-transform z-30 ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${flapHeight}`}
        width={width}
        height={flapHeight}
        className="w-full h-full block overflow-visible"
      >
        {!isBackVisible ? (
          /* FRONT SIDE OF TOP FLAP (Closed state) */
          <g>
            {/* Soft Ambient Cast Shadow under the flap tip */}
            <path
              d={flapPath}
              fill="#4A1626"
              opacity={Math.max(0, 0.18 - rotateX / 300)}
              transform="translate(0, 3)"
            />

            {/* Blush Paper Body */}
            <path d={flapPath} fill="url(#blush-paper-body)" />

            {/* Top Hinge Highlight */}
            <line x1="0" y1="0.5" x2={width} y2="0.5" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />

            {/* Flap Edge Highlights and Bevels */}
            <path
              d={`M 0 0 L ${midX - tipRadius} ${flapHeight - tipRadius * 0.8} Q ${midX} ${flapHeight} ${midX + tipRadius} ${flapHeight - tipRadius * 0.8} L ${width} 0`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              opacity="0.8"
            />
            <path
              d={`M 0 0 L ${midX - tipRadius} ${flapHeight - tipRadius * 0.8} Q ${midX} ${flapHeight} ${midX + tipRadius} ${flapHeight - tipRadius * 0.8} L ${width} 0`}
              fill="none"
              stroke="#702C43"
              strokeWidth="0.8"
              opacity="0.16"
              transform="translate(0, 0.8)"
            />

            {/* Elegant Double Gold-Foil Inlay running along the V edge */}
            <path
              d={inlayPath}
              fill="none"
              stroke="url(#gold-foil-accent)"
              strokeWidth="1.1"
              strokeDasharray="4 3"
              opacity="0.75"
            />

            {/* Auspicious Embossed Lotus Motifs on Flap */}
            <g transform={`translate(${midX}, ${flapHeight * 0.38})`}>
              <MotifLotus cx={0} cy={0} scale={Math.min(0.9, width / 460)} />
              <MotifJasmineSprig x={-42} y={-4} rotation={-30} scale={0.75} />
              <MotifJasmineSprig x={42} y={-4} rotation={30} scale={0.75} />
            </g>

            {/* Falloff shadow as flap opens */}
            <path
              d={flapPath}
              fill="#702C43"
              opacity={Math.min(0.3, rotateX / 300)}
            />
          </g>
        ) : (
          /* BACK SIDE OF TOP FLAP (Revealed when open) */
          <g style={{ transform: 'scale(1, -1)', transformOrigin: 'center' }}>
            {/* Burgundy lining */}
            <path d={flapPath} fill="url(#burgundy-lining-grad)" />
            {/* Gold diamond pattern */}
            <path d={flapPath} fill="url(#gold-diamond-lattice)" />
            {/* Gold dashed border */}
            <path
              d={inlayPath}
              fill="none"
              stroke="url(#gold-foil-accent)"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
