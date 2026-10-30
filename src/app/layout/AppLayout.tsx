import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Phone, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { useAudio } from '../../hooks/useAudio';
import { Language } from '../../i18n/translations';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { MultiTabNavigation } from '../../components/layout/MultiTabNavigation';
import { EntryScreen } from '../../components/layout/EntryScreen';
import { AdminModal } from '../../components/sections/AdminModal';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const { isMuted, toggleMute, playDholHit, unlockAndStart } = useAudio();

  const nav = config.navigation || {
    hero: true,
    countdown: true,
    scratchCard: true,
    events: true,
    venues: true,
    invitation: true,
    memories: true,
    help: true,
    floatingAudio: true,
    floatingHelp: true,
    mobileBottomNav: true,
  };

  // Show EntryScreen once per session (persisted in sessionStorage)
  const [showEntry, setShowEntry] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.sessionStorage.getItem('wedding_entered') !== 'true';
    } catch {
      return true;
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  // Scroll to top automatically when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleEnterFromScreen = (chosenLang: Language) => {
    setLang(chosenLang);
    unlockAndStart();
    setShowEntry(false);
    setBurstTrigger((prev) => prev + 1);
    try {
      window.sessionStorage.setItem('wedding_entered', 'true');
    } catch {
      // Ignore
    }
  };

  const handleReplayInvite = () => {
    try {
      window.sessionStorage.removeItem('wedding_entered');
    } catch {
      // Ignore
    }
    setShowEntry(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-pink-main,#FFF4F6)] text-[var(--color-text-primary,#33252B)] flex flex-col relative selection:bg-[var(--color-pink-sub,#F8E3E9)] selection:text-[var(--color-burgundy,#702C43)] overflow-x-hidden">
      {/* Full-Screen Opening Envelope Overlay */}
      <AnimatePresence>
        {showEntry && <EntryScreen onEnter={handleEnterFromScreen} />}
      </AnimatePresence>

      {/* Sticky Header with integrated Audio, Language Controls, and Canonical Navigation */}
      <Header
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Page Content (Route-driven View with dedicated layout) */}
      <main className="flex-1 w-full overflow-x-hidden pb-24 md:pb-16">
        <Outlet context={{ burstTrigger }} />
      </main>

      {/* Shared Footer present across all pages */}
      <Footer
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onReplayInvite={handleReplayInvite}
      />

      {/* Desktop Floating Mute/Unmute Button */}
      {!showEntry && nav.floatingAudio !== false && (
        <aside aria-label="Audio Controls" className="hidden md:flex max-md:hidden fixed bottom-6 left-6 z-30">
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? t('sound_label_muted') : t('sound_label_on')}
            aria-label={t('sound_toggle_aria')}
            className="w-12 h-12 rounded-full bg-white hover:bg-[#F8E3E9] text-[var(--color-burgundy,#702C43)] border-2 border-[var(--color-gold,#D6AD62)] shadow-[0_8px_24px_rgba(112,44,67,0.18)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-[#702C43]"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-[#765F68]" />
            ) : (
              <Volume2 className="w-5 h-5 text-[var(--color-burgundy,#702C43)] animate-pulse" />
            )}
          </button>
        </aside>
      )}

      {/* Desktop Floating Helpline Button */}
      {nav.floatingHelp !== false && (
        <aside aria-label="Helpline Assistance" className="hidden md:inline-flex max-md:hidden fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            title="Wedding Helpline & Route Assistance (+91 94160 88210)"
            aria-label="Wedding Helpline & Route Assistance"
            className="group relative inline-flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-[#702C43] hover:bg-[#5C2336] text-white border-2 border-[#D6AD62] shadow-[0_10px_30px_rgba(112,44,67,0.45)] cursor-pointer active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#D6AD62]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6AD62] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D6AD62]"></span>
            </span>
            <Phone className="w-4 h-4 text-white animate-bounce shrink-0" />
            <span className="font-heading font-bold text-xs tracking-wider uppercase text-white whitespace-nowrap">
              Help
            </span>
          </button>
        </aside>
      )}

      {/* Quick Helpline Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute right-5 top-5 p-2 text-stone-400 hover:text-stone-700 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] text-[#702C43] mb-1">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#702C43]">
                Wedding Helpline & Route Assistance
              </h2>
              <p className="text-xs text-[#765F68]">
                Ram Ram! For any travel, pickup, stay, or venue guidance, please reach out directly to our family coordinators:
              </p>
            </div>

            <div className="space-y-3">
              {(config.contacts || []).map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#702C43]">
                      {c.name_en}
                    </h3>
                    <p className="text-xs font-semibold text-[#C76B84]">{c.role_label_en}</p>
                    <p className="text-[11px] text-[#765F68] mt-0.5">{c.languages}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className="px-3.5 py-2 bg-[#702C43] hover:bg-[#702C43]/90 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                    {c.whatsapp && (
                      <a
                        href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Helpline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile MultiTab Navigation Bar (Home, Events, Venues, Memories, Card) */}
      <MultiTabNavigation isEntryActive={showEntry} />

      {/* Admin Dashboard Modal */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};
