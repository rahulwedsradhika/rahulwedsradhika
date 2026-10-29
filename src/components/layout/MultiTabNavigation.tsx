import React, { useEffect, useState } from 'react';
import {
  Home,
  Calendar,
  Camera,
  MapPin,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';

export type MainTabId = 'home' | 'events' | 'venues' | 'memories' | 'card';

interface MultiTabNavigationProps {
  activeTab: MainTabId;
  onTabChange: (tab: MainTabId) => void;
  isEntryActive?: boolean;
}

export const MultiTabNavigation: React.FC<MultiTabNavigationProps> = ({
  activeTab,
  onTabChange,
  isEntryActive = false,
}) => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isEnabled = config.navigation?.mobileBottomNav !== false;

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardVisible(false);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isShrunk = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardVisible(isShrunk);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  if (!isEnabled || isEntryActive) {
    return null;
  }

  const handleSelectTab = (tab: MainTabId) => {
    onTabChange(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Main Navigation Bar"
      className={`fixed bottom-0 inset-x-0 z-45 transition-transform duration-200 ${
        isKeyboardVisible ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-[#EBD9DE] shadow-[0_-4px_24px_rgba(112,44,67,0.12)] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => handleSelectTab('home')}
            className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43] font-medium'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 transition-transform" />
              {activeTab === 'home' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{t('nav_bottom_home')}</span>
          </button>

          {/* 2. Events */}
          <button
            type="button"
            onClick={() => handleSelectTab('events')}
            className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43] font-medium'
            }`}
          >
            <div className="relative">
              <Calendar className="w-5 h-5 transition-transform" />
              {activeTab === 'events' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{t('nav_bottom_events')}</span>
          </button>

          {/* 3. Venue & Maps */}
          <button
            type="button"
            onClick={() => handleSelectTab('venues')}
            className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'venues'
                ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43] font-medium'
            }`}
          >
            <div className="relative">
              <MapPin className="w-5 h-5 transition-transform" />
              {activeTab === 'venues' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{lang === 'hi' ? 'स्थान' : 'Venue'}</span>
          </button>

          {/* 4. Memories Gallery */}
          <button
            type="button"
            onClick={() => handleSelectTab('memories')}
            className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'memories'
                ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43] font-medium'
            }`}
          >
            <div className="relative">
              <Camera className="w-5 h-5 transition-transform" />
              {activeTab === 'memories' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{t('nav_bottom_memories')}</span>
          </button>

          {/* 5. Official Card & Downloads */}
          <button
            type="button"
            onClick={() => handleSelectTab('card')}
            className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43] font-medium'
            }`}
          >
            <div className="relative">
              <FileText className="w-5 h-5 transition-transform" />
              {activeTab === 'card' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{t('nav_card')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
