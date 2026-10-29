import React from 'react';

export const PhulkariDivider: React.FC<{ className?: string }> = ({ className = 'my-8' }) => {
  return (
    <div
      className={`w-full flex items-center justify-center gap-3 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <span className="h-px flex-1 max-w-[120px] bg-[#EBD9DE]" />
      <svg
        viewBox="0 0 160 12"
        className="w-40 h-3 text-[#D6AD62] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 6l4-4 4 4-4 4-4-4Z" stroke="#D6AD62" />
        <path d="M30 6l5-5 5 5-5 5-5-5Z" stroke="#D6AD62" />
        <circle cx="35" cy="6" r="1.2" fill="#702C43" />
        <path d="M54 6l6-5 6 5-6 5-6-5Z" stroke="#C76B84" />
        <circle cx="60" cy="6" r="1.5" fill="#D6AD62" />
        <path d="M80 6l7-6 7 6-7 6-7-6Z" stroke="#702C43" strokeWidth="1.6" />
        <circle cx="87" cy="6" r="2" fill="#D6AD62" />
        <path d="M106 6l6-5 6 5-6 5-6-5Z" stroke="#C76B84" />
        <circle cx="112" cy="6" r="1.5" fill="#D6AD62" />
        <path d="M126 6l5-5 5 5-5 5-5-5Z" stroke="#D6AD62" />
        <circle cx="131" cy="6" r="1.2" fill="#702C43" />
        <path d="M146 6l4-4 4 4-4 4-4-4Z" stroke="#D6AD62" />
      </svg>
      <span className="h-px flex-1 max-w-[120px] bg-[#EBD9DE]" />
    </div>
  );
};
