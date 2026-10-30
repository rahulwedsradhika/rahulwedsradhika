import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { Button } from '../ui/Button';
import { FlowerCorner, FlowerSprig, ToranGarland } from '../ui/FlowerCorner';
import { PetalFall } from '../ui/PetalFall';
import { PhulkariDivider } from '../ui/PhulkariDivider';

interface HeroSectionProps {
  burstTrigger?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ burstTrigger = 0 }) => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const prefersReducedMotion = useReducedMotion();

  const groomName = config.groom?.[lang] || (lang === 'hi' ? 'राहुल' : 'Rahul');
  const brideName = config.bride?.[lang] || (lang === 'hi' ? 'राधिका' : 'Radhika');
  const weddingDateStr = config.weddingDateDisplay?.[lang] || (lang === 'hi' ? '२८ नवंबर २०२६' : '28 November 2026');
  const villageStr = config.groomFamily?.village?.[lang] || (lang === 'hi' ? 'गाँव डोभ, रोहतक' : 'Village Dobh, Rohtak');
  const ampersand = config.contentOverrides?.hero_ampersand?.[lang] || t('hero_ampersand');

  return (
    <section
      id="hero"
      aria-label="Wedding Hero"
      className="relative min-h-[90vh] sm:min-h-[94vh] flex flex-col justify-between items-center text-center px-4 pt-4 sm:pt-8 pb-8 bg-gradient-to-b from-[#FFF4F6] via-[#FFF4F6] to-[#F8E3E9] overflow-hidden"
    >
      {/* Subtle Falling Petals Layer (Canvas with shared atmospheric breeze) */}
      <PetalFall burstTrigger={burstTrigger} />

      {/* Traditional Marigold Toran Garland hanging gracefully along the top edge */}
      <div className="absolute top-0 inset-x-0 w-full z-[4]">
        <ToranGarland className="opacity-90 max-w-5xl mx-auto" />
      </div>

      {/* Decorative Corner Flower Clusters (Framing left & right, gentle sway, clean mirrored wrapper) */}
      <FlowerCorner
        position="top-left"
        className="absolute top-0 left-0 w-[110px] sm:w-[200px] md:w-[250px] lg:w-[280px]"
      />
      <FlowerCorner
        position="top-right"
        className="absolute top-0 right-0 w-[110px] sm:w-[200px] md:w-[250px] lg:w-[280px]"
      />

      {/* Subtle Bottom Corner Accents */}
      <FlowerCorner
        position="bottom-left"
        className="absolute bottom-0 left-0 w-[70px] sm:w-[120px] opacity-40"
      />
      <FlowerCorner
        position="bottom-right"
        className="absolute bottom-0 right-0 w-[70px] sm:w-[120px] opacity-40"
      />

      {/* Thin Phulkari Border framing hero top */}
      <div className="w-full max-w-4xl mx-auto relative z-10 mt-6 sm:mt-8">
        <PhulkariDivider className="my-2 opacity-70" />
      </div>

      {/* Main Content Cluster */}
      <div className="relative z-10 max-w-4xl mx-auto my-auto py-6 sm:py-10">
        {/* Top Eyebrow in dusty rose */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C76B84] mb-3 sm:mb-4"
        >
          {t('hero_eyebrow')}
        </motion.p>

        {/* Minimal Sun over Wheat Fields Line-art SVG behind names */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-15 select-none -z-10"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 120 70"
            className="w-[280px] sm:w-[460px] text-[#D6AD62]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M60 12V20" />
            <path d="M38 18L43 25" />
            <path d="M82 18L77 25" />
            <path d="M24 35H32" />
            <path d="M88 35H96" />
            <path d="M42 42a18 18 0 0 1 36 0" />
            <path d="M10 46c20-6 40-6 60 0s30 5 40 0" />
            <path d="M18 56c25-5 55-5 84 0" />
            <path d="M26 64c20-4 46-4 68 0" />
          </svg>
        </div>

        {/* Display Couple Names with Gold-Foil Ampersand */}
        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-names font-bold text-[#702C43] tracking-tight mb-4 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4"
        >
          <span>{groomName}</span>
          <span
            className="font-normal italic font-heading bg-gradient-to-r from-[#D6AD62] via-[#F4E5BD] to-[#B58A38] bg-clip-text text-transparent px-1 drop-shadow-xs"
            aria-label="weds"
          >
            {ampersand}
          </span>
          <span>{brideName}</span>
        </motion.h1>

        {/* Date and Venue under names */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:text-base font-semibold text-[#33252B] mb-5 tabular-nums"
        >
          <span className="inline-flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-[#EBD9DE] shadow-xs">
            <Calendar className="w-4 h-4 text-[#D6AD62] shrink-0" aria-hidden="true" />
            <span>{weddingDateStr}</span>
          </span>
          <span className="hidden sm:inline text-[#EBD9DE]" aria-hidden="true">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-[#EBD9DE] shadow-xs">
            <MapPin className="w-4 h-4 text-[#C76B84] shrink-0" aria-hidden="true" />
            <span>{villageStr}</span>
          </span>
        </motion.div>

        {/* Blessing Line */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-md mx-auto mb-8 space-y-0.5"
        >
          <p className="font-heading text-lg sm:text-xl font-medium text-[#33252B] italic">
            "{t('hero_blessing_line')}"
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C76B84]">
            {t('hero_blessing_hindi_sub')}
          </p>
        </motion.div>

        {/* Dual Primary CTA Buttons */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md mx-auto"
        >
          <Button
            to="/events"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[170px] shadow-[0_8px_20px_-4px_rgba(112,44,67,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(112,44,67,0.32)]"
          >
            {lang === 'hi' ? 'समारोह' : 'Events'}
          </Button>

          <Button
            to="/venues"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[170px]"
          >
            {lang === 'hi' ? 'स्थान' : 'Venues'}
          </Button>
        </motion.div>
      </div>

      {/* Decorative Floral Sprig centered above scroll indicator */}
      <div className="relative z-10 flex flex-col items-center gap-2 mb-1">
        <FlowerSprig className="w-16 h-4 opacity-75" />
        <a
          href="#countdown"
          aria-label={t('hero_scroll_hint')}
          className="text-[#C76B84] hover:text-[#702C43] transition-colors p-2 rounded-full focus-visible:outline-2 focus-visible:outline-[#702C43]"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
