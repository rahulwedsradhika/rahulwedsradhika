import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { getVisibleNavItems } from '../../config/navigation';

interface MultiTabNavigationProps {
  isEntryActive?: boolean;
}

export const MultiTabNavigation: React.FC<MultiTabNavigationProps> = ({
  isEntryActive = false,
}) => {
  const location = useLocation();
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isEnabled = config.navigation?.mobileBottomNav !== false;
  const navItems = getVisibleNavItems(config.navigation, 'bottomNav');

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

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-200 ${
        isKeyboardVisible ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-[#EBD9DE] shadow-[0_-4px_24px_rgba(112,44,67,0.12)] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            const label = lang === 'hi' ? item.titleHi : item.titleEn;

            return (
              <Link
                key={item.id}
                to={item.path}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#702C43] font-bold bg-[#F8E3E9]/80 shadow-xs'
                    : 'text-[#765F68] hover:text-[#702C43] font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 transition-transform" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D6AD62] rounded-full" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[65px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
