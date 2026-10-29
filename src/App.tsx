import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Phone, X } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { WeddingConfigProvider, useWeddingConfig } from './context/WeddingConfigContext';
import { useAudio } from './hooks/useAudio';
import { Language } from './i18n/translations';
import { MultiTabNavigation, MainTabId } from './components/layout/MultiTabNavigation';
import { EntryScreen } from './components/layout/EntryScreen';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { AdminModal } from './components/sections/AdminModal';
import { CountdownSection } from './components/sections/CountdownSection';
import { EventsSection } from './components/sections/EventsSection';
import { HelpSection } from './components/sections/HelpSection';
import { HeroSection } from './components/sections/HeroSection';
import { InvitationSection } from './components/sections/InvitationSection';
import { MemoriesSection } from './components/sections/MemoriesSection';
import { VenuesSection } from './components/sections/VenuesSection';

const MainWeddingApp: React.FC = () => {
  const { setLang, t } = useLanguage();
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
  const [currentTab, setCurrentTab] = useState<MainTabId>('home');

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
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-pink-main,#FFF4F6)] text-[var(--color-text-primary,#33252B)] flex flex-col relative selection:bg-[var(--color-pink-sub,#F8E3E9)] selection:text-[var(--color-burgundy,#702C43)] overflow-x-hidden">
      {/* Full-Screen Opening Envelope Overlay */}
      <AnimatePresence>
        {showEntry && <EntryScreen onEnter={handleEnterFromScreen} />}
      </AnimatePresence>

      {/* Sticky Header with integrated Audio and Language Controls */}
      <Header isMuted={isMuted} onToggleMute={toggleMute} />

      {/* Main Content Render based on Selected Tab (Separate Page View with dedicated Footer) */}
      <main className="flex-1 w-full overflow-x-hidden pb-24 md:pb-16">
        {currentTab === 'home' && (
          <div className="space-y-0 animate-in fade-in duration-200">
            {nav.hero !== false && <HeroSection burstTrigger={burstTrigger} />}
            {nav.countdown !== false && <CountdownSection />}
            {nav.help !== false && <HelpSection isEntryActive={showEntry} />}
          </div>
        )}

        {currentTab === 'events' && (
          <div className="space-y-0 animate-in fade-in duration-200 pt-4">
            <EventsSection />
          </div>
        )}

        {currentTab === 'venues' && (
          <div className="space-y-0 animate-in fade-in duration-200 pt-4">
            <VenuesSection />
          </div>
        )}

        {currentTab === 'memories' && (
          <div className="space-y-0 animate-in fade-in duration-200 pt-4">
            <MemoriesSection />
          </div>
        )}

        {currentTab === 'card' && (
          <div className="space-y-0 animate-in fade-in duration-200 pt-4">
            <InvitationSection />
          </div>
        )}
      </main>

      {/* Footer attached at the bottom of each tab page */}
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

      {/* Desktop Floating Phone/Help Button */}
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

      {/* Multi-Tab Navigation Bar (Home, Events, Venue, Memories, Card) */}
      <MultiTabNavigation
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        isEntryActive={showEntry}
      />

      {/* Admin Dashboard Modal */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF4F6] text-[#33252B] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-pink-100 space-y-4">
            <h2 className="font-serif font-bold text-xl text-[#702C43]">Rahul weds Radhika</h2>
            <p className="text-xs text-[#765F68]">
              A minor display issue occurred. Please refresh the page to reload the wedding celebration.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#702C43] text-white text-xs font-semibold shadow-md hover:bg-[#5C2336] transition cursor-pointer"
            >
              Reload Celebration
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <WeddingConfigProvider>
        <LanguageProvider>
          <MainWeddingApp />
        </LanguageProvider>
      </WeddingConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
