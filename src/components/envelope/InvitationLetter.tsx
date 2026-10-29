import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { WEDDING_CONFIG } from '../../config/wedding';

interface InvitationLetterProps {
  isRevealed?: boolean;
  onClick?: () => void;
  className?: string;
}

const GoldLotus: React.FC = () => (
  <svg
    viewBox="0 0 60 36"
    className="w-[9cqw] h-[5.5cqw] mx-auto block overflow-visible"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lotus-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D6AD62" />
        <stop offset="35%" stopColor="#F9EDB8" />
        <stop offset="70%" stopColor="#B58A38" />
        <stop offset="100%" stopColor="#8A631E" />
      </linearGradient>
    </defs>
    <path
      d="M 30 2 C 27 10, 27 22, 30 30 C 33 22, 33 10, 30 2 Z"
      fill="url(#lotus-gold)"
    />
    <path
      d="M 30 30 C 24 24, 18 16, 21 8 C 26 14, 28 22, 30 30 Z"
      fill="url(#lotus-gold)"
      opacity="0.9"
    />
    <path
      d="M 30 30 C 36 24, 42 16, 39 8 C 34 14, 32 22, 30 30 Z"
      fill="url(#lotus-gold)"
      opacity="0.9"
    />
    <path
      d="M 30 30 C 20 28, 9 20, 12 14 C 18 18, 24 24, 30 30 Z"
      fill="url(#lotus-gold)"
      opacity="0.8"
    />
    <path
      d="M 30 30 C 40 28, 51 20, 48 14 C 42 18, 36 24, 30 30 Z"
      fill="url(#lotus-gold)"
      opacity="0.8"
    />
    <ellipse cx="30" cy="31" rx="8" ry="2.2" fill="url(#lotus-gold)" />
    <circle cx="30" cy="2" r="1.2" fill="#FFF2BF" />
  </svg>
);

const CornerFlourish: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const transform = {
    tl: '',
    tr: 'scale(-1, 1)',
    bl: 'scale(1, -1)',
    br: 'scale(-1, -1)',
  }[position];

  return (
    <div
      style={{ transform, transformOrigin: 'center' }}
      className={`absolute w-[8cqw] h-[8cqw] pointer-events-none ${
        position.startsWith('t') ? 'top-[2cqw]' : 'bottom-[2cqw]'
      } ${position.endsWith('l') ? 'left-[2cqw]' : 'right-[2cqw]'}`}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full block" fill="none">
        <path
          d="M 4 36 L 4 12 C 4 7.5, 7.5 4, 12 4 L 36 4"
          stroke="url(#lotus-gold)"
          strokeWidth="1.2"
        />
        <circle cx="4" cy="4" r="2.2" fill="url(#lotus-gold)" />
        <path
          d="M 10 26 C 10 17, 17 10, 26 10"
          stroke="url(#lotus-gold)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.75"
        />
        <circle cx="16" cy="16" r="1.4" fill="url(#lotus-gold)" />
      </svg>
    </div>
  );
};

export const InvitationLetter: React.FC<InvitationLetterProps> = ({
  isRevealed = false,
  onClick,
  className = '',
}) => {
  const { lang, t } = useLanguage();

  return (
    <article
      onClick={onClick}
      style={{
        containerType: 'inline-size',
        aspectRatio: '1 / 1.28',
      }}
      className={`relative w-full max-w-[560px] rounded-[18px] sm:rounded-[24px] bg-[#FFFFFF] border border-[#EBD9DE] shadow-[0_20px_60px_-15px_rgba(112,44,67,0.3),0_0_1px_rgba(112,44,67,0.15)] p-[5.5cqw] flex flex-col justify-between items-center text-center select-none overflow-hidden transition-shadow duration-500 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle Texture */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-[#FFF8FA] to-[#F8E3E9]/50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Gold Double-Line Frame */}
      <div
        style={{ inset: '2cqw' }}
        className="absolute rounded-[14px] sm:rounded-[18px] border border-[#D6AD62]/60 pointer-events-none"
        aria-hidden="true"
      />
      <div
        style={{ inset: '3.4cqw' }}
        className="absolute rounded-[10px] sm:rounded-[14px] border border-[#D6AD62]/35 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ornate Corner Flourishes */}
      <CornerFlourish position="tl" />
      <CornerFlourish position="tr" />
      <CornerFlourish position="bl" />
      <CornerFlourish position="br" />

      {/* Horizontal Crease Lines */}
      <div
        style={{ top: '33.3%' }}
        className={`absolute inset-x-0 h-[2px] pointer-events-none transition-opacity duration-700 ${
          isRevealed ? 'opacity-30' : 'opacity-70'
        }`}
        aria-hidden="true"
      >
        <div className="w-full h-[1px] bg-white/80" />
        <div className="w-full h-[1px] bg-[#702C43]/10" />
      </div>

      <div
        style={{ top: '66.6%' }}
        className={`absolute inset-x-0 h-[2px] pointer-events-none transition-opacity duration-700 ${
          isRevealed ? 'opacity-30' : 'opacity-70'
        }`}
        aria-hidden="true"
      >
        <div className="w-full h-[1px] bg-white/80" />
        <div className="w-full h-[1px] bg-[#702C43]/10" />
      </div>

      {/* Letter Content Layer */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center text-[#33252B]">
        {/* Top: Lotus + Invocation */}
        <div className="w-full pt-[1cqw]">
          <GoldLotus />
          <p
            style={{ fontSize: '3.1cqw' }}
            className="font-heading font-bold tracking-[0.18em] text-[#C76B84] uppercase mt-[1.2cqw] drop-shadow-2xs"
          >
            {lang === 'hi' ? '॥ श्री गणेशाय नमः ॥' : '॥ Shree Ganeshay Namah ॥'}
          </p>

          <p
            style={{ fontSize: '2.8cqw' }}
            className="text-[#33252B] font-semibold mt-[1.6cqw]"
          >
            {t('entry_together')}
          </p>
          <p
            style={{ fontSize: '2.5cqw' }}
            className={`text-[#765F68] italic mt-[0.6cqw] ${
              lang === 'hi' ? 'leading-[1.7]' : 'leading-[1.4]'
            }`}
          >
            {t('entry_request')}
          </p>
        </div>

        {/* Center: Couple Names */}
        <div className="w-full my-[2.5cqw]">
          <h2
            className={`font-heading font-bold text-[#702C43] tracking-tight flex flex-col items-center justify-center ${
              lang === 'hi' ? 'leading-[1.3]' : 'leading-[1.15]'
            }`}
          >
            <span style={{ fontSize: '7.8cqw' }} className="block drop-shadow-xs">
              {t('hero_groom')}
            </span>
            <span
              style={{ fontSize: '6.4cqw' }}
              className="block my-[0.4cqw] font-normal italic font-heading bg-gradient-to-r from-[#D6AD62] via-[#F9EDB8] to-[#B58A38] bg-clip-text text-transparent px-[2cqw] drop-shadow-2xs"
            >
              &
            </span>
            <span style={{ fontSize: '7.8cqw' }} className="block drop-shadow-xs">
              {t('hero_bride')}
            </span>
          </h2>

          {/* Gold Divider */}
          <div className="flex items-center justify-center gap-[2cqw] my-[2.2cqw]">
            <span className="w-[12cqw] h-[1px] bg-gradient-to-r from-transparent to-[#D6AD62]" />
            <span
              style={{ width: '1.8cqw', height: '1.8cqw' }}
              className="rotate-45 bg-[#D6AD62] inline-block shadow-2xs"
            />
            <span className="w-[12cqw] h-[1px] bg-gradient-to-l from-transparent to-[#D6AD62]" />
          </div>

          {/* Date & Village */}
          <div
            style={{ fontSize: '3cqw' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-x-[4cqw] gap-y-[1cqw] font-semibold text-[#33252B] tabular-nums"
          >
            <span className="inline-flex items-center gap-[1.2cqw]">
              <Calendar className="w-[3.4cqw] h-[3.4cqw] text-[#D6AD62] shrink-0" aria-hidden="true" />
              <span>{WEDDING_CONFIG.weddingDate}</span>
            </span>
            <span className="hidden sm:inline text-[#EBD9DE]" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-[1.2cqw]">
              <MapPin className="w-[3.4cqw] h-[3.4cqw] text-[#C76B84] shrink-0" aria-hidden="true" />
              <span>{WEDDING_CONFIG.village[lang]}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ fontSize: '2.8cqw', paddingBottom: '1cqw' }}
          className="w-full pt-[2cqw] border-t border-[#D6AD62]/25 flex items-center justify-center gap-[2cqw] font-bold text-[#702C43]"
        >
          <span>{t('entry_ram_ram')}</span>
          <span>·</span>
          <span>{lang === 'hi' ? 'आइयो ज़रूर!' : 'Aaiyo Zaroor!'}</span>
        </div>
      </div>
    </article>
  );
};
