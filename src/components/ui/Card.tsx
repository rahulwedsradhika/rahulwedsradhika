import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  phulkariEdge?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  phulkariEdge = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-[26px] bg-white border border-[#EBD9DE] p-6 sm:p-8 relative overflow-hidden transition-all shadow-[0_10px_30px_-10px_rgba(112,44,67,0.08)] ${
        phulkariEdge ? 'border-t-2 border-t-[#D6AD62]' : ''
      } ${className}`}
      {...props}
    >
      {phulkariEdge && (
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D6AD62] via-[#C76B84] to-[#D6AD62] opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
};
