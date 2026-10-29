import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';

interface HeaderProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMuted = false, onToggleMute }) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-[#EBD9DE] bg-[#FFF4F6]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 font-heading text-base sm:text-lg font-bold tracking-tight text-[#702C43] whitespace-nowrap shrink-0 hover:text-[#C76B84] transition-colors focus-visible:outline-2 focus-visible:outline-[#C76B84] rounded-sm"
        >
          <RoyalCrestLogo size="xs" variant="crest" />
          <span>{t('nav_brand')}</span>
        </a>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label={t('nav_brand')}
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#765F68]"
        >
          <a href="#countdown" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_countdown')}
          </a>
          <a href="#events" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_events')}
          </a>
          <a href="#memories" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_bottom_memories')}
          </a>
          <a href="#venue" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_venue')}
          </a>
          <a href="#invitation" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_card')}
          </a>
          <a href="#help" className="hover:text-[#702C43] hover:underline underline-offset-4 transition-colors">
            {t('nav_help')}
          </a>
        </nav>

        {/* Zone 3: Audio Toggle & Compact EN | हिं Language Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? t('sound_label_muted') : t('sound_label_on')}
              aria-label={t('sound_toggle_aria')}
              className="min-h-[38px] min-w-[38px] p-2 rounded-full bg-[#F8E3E9] hover:bg-[#EBD9DE] text-[#702C43] border border-[#EBD9DE] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#765F68]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#702C43] animate-pulse" />
              )}
            </button>
          )}

          <div
            role="group"
            aria-label="Language selector"
            className="inline-flex min-h-[40px] items-center rounded-full bg-[#F8E3E9] p-0.5 border border-[#EBD9DE]"
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`min-h-[32px] min-w-[38px] px-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'en'
                  ? 'bg-[#702C43] text-white shadow-xs'
                  : 'text-[#765F68] hover:text-[#702C43]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              aria-pressed={lang === 'hi'}
              className={`min-h-[32px] min-w-[38px] px-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'hi'
                  ? 'bg-[#702C43] text-white shadow-xs'
                  : 'text-[#765F68] hover:text-[#702C43]'
              }`}
            >
              हिं
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

