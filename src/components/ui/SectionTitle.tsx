import React from 'react';

export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  eyebrow,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-10 ${className}`}>
      {eyebrow && (
        <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C76B84] mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="section-heading font-bold text-[#702C43] mb-3">
        {title}
      </h2>
      {/* Centered Small Gold Accent Rule */}
      <div className="flex items-center justify-center my-3" aria-hidden="true">
        <span className="w-12 h-1 bg-[#D6AD62] rounded-full" />
      </div>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#765F68] leading-relaxed mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
