import React from 'react';

export type MotifName = 'sun' | 'safa' | 'dhol' | 'matka' | 'phulkari';

interface IconProps {
  className?: string;
}

export const SunOverFieldsMotif: React.FC<IconProps> = ({ className = 'w-12 h-8' }) => (
  <svg
    viewBox="0 0 64 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M32 6V10" />
    <path d="M18 11L21 14" />
    <path d="M46 11L43 14" />
    <path d="M11 22H15" />
    <path d="M49 22H53" />
    <path d="M21 25a11 11 0 0 1 22 0" />
    <path d="M6 27c10-3 22-3 32 0s14 3 20 0" />
    <path d="M12 33c12-2.5 28-2.5 40 0" />
  </svg>
);

export const SafaMotif: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 10V4" />
    <path d="M12 6l4 4 4-4" />
    <path d="M5 19c0-5.5 4.8-9 11-9s11 3.5 11 9c0 2.5-1.8 4.5-4.5 5-2.5-2.2-4.3-3.5-6.5-3.5S12 21.8 9.5 24C6.8 23.5 5 21.5 5 19Z" />
    <path d="M7.5 16.5c3.5-2 7.5-2 11 1.5" />
    <path d="M24.5 16.5c-2.5-1.5-5.5-1.5-8.5 1" />
    <path d="M21 24l2 4.5" />
  </svg>
);

export const DholMotif: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="7.5" cy="16" rx="2.5" ry="7.5" />
    <ellipse cx="24.5" cy="16" rx="2.5" ry="7.5" />
    <path d="M7.5 8.5c5.5-1.8 11.5-1.8 17 0" />
    <path d="M7.5 23.5c5.5 1.8 11.5 1.8 17 0" />
    <path d="M10 10l4.5 12L19 10l3.5 12" />
    <path d="M10 22l4.5-12L19 22l3.5-12" />
  </svg>
);

export const MatkaMotif: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M11 8h10" />
    <path d="M12.5 8c0-2 1.5-3.5 3.5-3.5S19.5 6 19.5 8" />
    <path d="M12 8l-1.5 3c-3 2-4.5 4.8-4.5 8 0 4.5 4.2 8 10 8s10-3.5 10-8c0-3.2-1.5-6-4.5-8L20 8" />
    <path d="M7.5 18.5h17" />
    <path d="M14 16l2 2.5-2 2.5-2-2.5 2-2.5Z" />
    <path d="M18 16l2 2.5-2 2.5" />
  </svg>
);

export const PhulkariStarMotif: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 4l3.5 8.5L28 16l-8.5 3.5L16 28l-3.5-8.5L4 16l8.5-3.5L16 4Z" />
    <circle cx="16" cy="16" r="2.2" />
  </svg>
);
