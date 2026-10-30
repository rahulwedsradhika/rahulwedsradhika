import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { getVisibleNavItems } from '../../config/navigation';
import { PhulkariDivider } from '../ui/PhulkariDivider';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';

interface FooterProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAdmin?: () => void;
  onReplayInvite?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isMuted,
  onToggleMute,
  onOpenAdmin,
  onReplayInvite,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const prefersReducedMotion = useReducedMotion();

  const navItems = getVisibleNavItems(config.navigation, 'all');

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-[#EBD9DE] bg-[#F8E3E9]/60 pt-12 pb-24 sm:pb-16 px-4 text-center">
      <div className="mx-auto max-w-4xl">
        {/* Phulkari divider at top */}
        <PhulkariDivider className="mb-8" />

        {/* Royal Crest Monogram & Blessing */}
        <div className="flex justify-center mb-3">
          <RoyalCrestLogo size="lg" variant="crest" />
        </div>

        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#702C43] mb-2">
          {t('footer_blessing_title')}
        </h3>

        <p className="font-heading text-base sm:text-lg italic text-[#765F68] mb-6">
          {t('footer_blessing_line')}
        </p>

        {/* Navigation Quick Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-6 text-xs sm:text-sm font-semibold text-[#702C43]">
          {navItems.map((item) => {
            const label = lang === 'hi' ? item.titleHi : item.titleEn;
            return (
              <Link
                key={item.id}
                to={item.path}
                className="hover:underline underline-offset-4 transition-colors py-1"
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Action controls row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-[#765F68] mb-8">
          <button
            type="button"
            onClick={handleBackToTop}
            className="min-h-[44px] px-3 py-2 hover:text-[#702C43] hover:underline cursor-pointer transition-colors"
          >
            ↑ {t('footer_back_to_top')}
          </button>

          {onReplayInvite && (
            <>
              <span aria-hidden="true" className="text-[#EBD9DE]">·</span>
              <button
                type="button"
                onClick={onReplayInvite}
                className="min-h-[44px] px-3 py-2 inline-flex items-center gap-1.5 hover:text-[#702C43] hover:underline cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D6AD62]" aria-hidden="true" />
                <span>{t('footer_replay_invite')}</span>
              </button>
            </>
          )}

          <span aria-hidden="true" className="text-[#EBD9DE]">·</span>

          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="min-h-[44px] px-3 py-2 hover:text-[#702C43] hover:underline cursor-pointer transition-colors"
          >
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>

          <span aria-hidden="true" className="text-[#EBD9DE]">·</span>

          <button
            type="button"
            onClick={onToggleMute}
            className="min-h-[44px] px-3 py-2 inline-flex items-center gap-1.5 hover:text-[#702C43] hover:underline cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#C76B84]" />}
            <span>{isMuted ? t('sound_label_muted') : t('sound_label_on')}</span>
          </button>

          <span aria-hidden="true" className="text-[#EBD9DE]">·</span>

          {onOpenAdmin ? (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[44px] px-3 py-2 inline-flex items-center gap-1 text-[#765F68]/70 hover:text-[#702C43] cursor-pointer transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          ) : (
            <Link
              to="/admin"
              className="min-h-[44px] px-3 py-2 inline-flex items-center gap-1 text-[#765F68]/70 hover:text-[#702C43] cursor-pointer transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Signature */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#765F68]">
          <span>{lang === 'hi' ? 'रोहित द्वारा' : 'Made with'}</span>
          <motion.span
            animate={
              prefersReducedMotion
                ? false
                : {
                    scale: [1, 1.2, 1],
                  }
            }
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block text-[#C76B84] text-sm select-none"
            aria-hidden="true"
          >
            ❤️
          </motion.span>
          <span>{lang === 'hi' ? 'से बनाया गया' : 'by Rohit'}</span>
        </div>
      </div>
    </footer>
  );
};
