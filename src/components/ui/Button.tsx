import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  to,
  target,
  rel,
  children,
  ...props
}) => {
  const baseClasses =
    'rounded-full font-medium inline-flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2';

  const sizeClasses =
    size === 'lg'
      ? 'min-h-[50px] px-7 py-3 text-base'
      : size === 'sm'
      ? 'min-h-[36px] px-3.5 py-1.5 text-xs'
      : 'min-h-[44px] px-5 py-2.5 text-sm';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#702C43] hover:bg-[#5C2336] text-white font-semibold shadow-[0_4px_14px_rgba(112,44,67,0.25)] focus-visible:outline-[#702C43]';
      break;
    case 'secondary':
      variantClasses =
        'bg-[#F8E3E9] hover:bg-[#F3D5DE] text-[#702C43] font-semibold border border-[#EBD9DE] focus-visible:outline-[#C76B84]';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent text-[#702C43] hover:bg-[#F8E3E9]/80 border border-[#EBD9DE] focus-visible:outline-[#C76B84]';
      break;
  }

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`;

  const destination = to || href;

  if (destination) {
    const isInternal = destination.startsWith('/') && !destination.startsWith('//');
    if (isInternal && !target) {
      return (
        <Link to={destination} className={combinedClasses}>
          {children}
        </Link>
      );
    }

    return (
      <a href={destination} target={target} rel={rel} className={combinedClasses}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

