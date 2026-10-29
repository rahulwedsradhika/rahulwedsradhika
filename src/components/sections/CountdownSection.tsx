import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { useCountdown } from '../../hooks/useCountdown';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';
import { ScratchCard } from '../ui/ScratchCard';

export const CountdownSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const targetDate = config.countdown?.targetISO || config.weddingDateISO || '2026-11-28T10:00:00+05:30';

  const { days, hours, minutes, seconds, isDatePending, isCelebrated } = useCountdown(targetDate);

  const showScratchCard = config.scratchReveal?.enabled && (config.navigation?.scratchCard ?? true);

  return (
    <section id="countdown" aria-label={t('countdown_title')} className="py-12 sm:py-16 px-4 bg-[#FFF4F6]">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Reveal>
            <SectionTitle
              eyebrow={lang === 'hi' ? 'शुभ मुहूर्त' : 'Auspicious Muhurat'}
              title={config.countdown?.title?.[lang] || t('countdown_title')}
              subtitle={
                isDatePending
                  ? config.countdown?.pendingMessage?.[lang] || t('countdown_pending')
                  : isCelebrated
                  ? config.countdown?.celebratedMessage?.[lang] || t('countdown_celebrated')
                  : undefined
              }
            />
          </Reveal>

          {!isDatePending && !isCelebrated && (
            <Reveal delay={0.15}>
              <div className="grid grid-cols-4 gap-2 sm:gap-5 max-w-2xl mx-auto mt-6">
                {/* Days Tile */}
                <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#EBD9DE] p-2.5 sm:p-5 text-center shadow-[0_10px_25px_-8px_rgba(112,44,67,0.08)]">
                  <span className="block font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-[#702C43] tabular-nums">
                    {String(days).padStart(2, '0')}
                  </span>
                  <span className="block text-[11px] sm:text-xs md:text-sm font-semibold text-[#C76B84] mt-1">
                    {t('countdown_days')}
                  </span>
                </div>

                {/* Hours Tile */}
                <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#EBD9DE] p-2.5 sm:p-5 text-center shadow-[0_10px_25px_-8px_rgba(112,44,67,0.08)]">
                  <span className="block font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-[#702C43] tabular-nums">
                    {String(hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[11px] sm:text-xs md:text-sm font-semibold text-[#C76B84] mt-1">
                    {t('countdown_hours')}
                  </span>
                </div>

                {/* Minutes Tile */}
                <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#EBD9DE] p-2.5 sm:p-5 text-center shadow-[0_10px_25px_-8px_rgba(112,44,67,0.08)]">
                  <span className="block font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-[#702C43] tabular-nums">
                    {String(minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[11px] sm:text-xs md:text-sm font-semibold text-[#C76B84] mt-1">
                    {t('countdown_mins')}
                  </span>
                </div>

                {/* Seconds Tile */}
                <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#D6AD62]/50 p-2.5 sm:p-5 text-center shadow-[0_10px_25px_-8px_rgba(112,44,67,0.08)]">
                  <span className="block font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-[#D6AD62] tabular-nums">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[11px] sm:text-xs md:text-sm font-semibold text-[#C76B84] mt-1">
                    {t('countdown_secs')}
                  </span>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* Interactive Scratch-to-Reveal Card Feature */}
        {showScratchCard && (
          <Reveal delay={0.25}>
            <div className="flex flex-col items-center justify-center pt-4">
              <ScratchCard />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};
