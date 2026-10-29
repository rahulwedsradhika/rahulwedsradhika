import React, { useState } from 'react';
import { SunOverFieldsMotif } from './motifs/HaryanviMotifs';

interface ResilientImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
  className?: string;
  fallbackLabel?: string;
}

/**
 * Zero-broken-image wrapper with explicit dimensions, lazy-loading by default,
 * and a clean Modern Haryanvi line-art fallback surface for weak village networks.
 */
export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  width,
  height,
  eager = false,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-cream-dark text-wheat p-8 text-center ${className}`}
      >
        <SunOverFieldsMotif className="w-16 h-11 text-mustard mb-3" />
        {fallbackLabel && (
          <span className="font-heading text-base font-medium text-charcoal/80">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
