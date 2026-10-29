import React from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { NavigationSectionVisibility } from '../../types/wedding';
import { Eye, EyeOff, LayoutTemplate, Layers, Radio } from 'lucide-react';

interface SectionToggleItem {
  key: keyof NavigationSectionVisibility;
  title: string;
  subtitle: string;
  category: 'Main Page Flow' | 'Interactive Widgets' | 'Utility & Floating';
}

const SECTION_CONFIG_ITEMS: SectionToggleItem[] = [
  {
    key: 'hero',
    title: 'Hero Welcome Banner',
    subtitle: 'Top header with couple names, wedding date badge, and falling floral petals',
    category: 'Main Page Flow',
  },
  {
    key: 'countdown',
    title: 'Ceremonial Countdown Clock',
    subtitle: 'Live countdown timer to wedding date and auspicious muhurat',
    category: 'Main Page Flow',
  },
  {
    key: 'scratchCard',
    title: 'Scratch-to-Reveal Date Card',
    subtitle: 'Interactive card letting guests scratch the canvas to reveal wedding date',
    category: 'Main Page Flow',
  },

  {
    key: 'events',
    title: 'Ceremonies & Itinerary',
    subtitle: 'Haldi, Mehendi, Sangeet, Pheras, and Reception schedule cards',
    category: 'Main Page Flow',
  },
  {
    key: 'venues',
    title: 'Venues & Navigation',
    subtitle: 'Dobh Haveli and Rohtak Royal Palace with Google Maps links',
    category: 'Main Page Flow',
  },
  {
    key: 'invitation',
    title: 'Official Invitation & Downloads',
    subtitle: 'Invitation letter with PNG and PDF card download actions',
    category: 'Main Page Flow',
  },

  {
    key: 'memories',
    title: 'Shared Memories Gallery',
    subtitle: 'Guest photos, videos, ceremony albums, and moderated celebration highlights',
    category: 'Interactive Widgets',
  },
  {
    key: 'help',
    title: 'Guest Helpline & Coordinators',
    subtitle: 'Contact numbers and WhatsApp links for route and stay coordination',
    category: 'Main Page Flow',
  },
  {
    key: 'floatingAudio',
    title: 'Floating Music & Audio Toggle',
    subtitle: 'Ambient shehnai / dhol background audio controller button',
    category: 'Utility & Floating',
  },
  {
    key: 'floatingHelp',
    title: 'Floating Quick Help Button',
    subtitle: 'Persistent bottom-right quick dial coordinator button',
    category: 'Utility & Floating',
  },
  {
    key: 'mobileBottomNav',
    title: 'Mobile Bottom App Bar',
    subtitle: 'Fixed bottom navigation tabs for Android/iOS mobile screens',
    category: 'Utility & Floating',
  },
];

export const AdminNavigationTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const nav = config.navigation;

  const handleToggle = (key: keyof NavigationSectionVisibility) => {
    void updateConfig((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        [key]: !prev.navigation[key],
      },
    }));
  };

  const handleSetAll = (visible: boolean) => {
    const updated = { ...nav };
    (Object.keys(updated) as Array<keyof NavigationSectionVisibility>).forEach((k) => {
      updated[k] = visible;
    });
    void updateConfig((prev) => ({
      ...prev,
      navigation: updated,
    }));
  };

  const categories = ['Main Page Flow', 'Interactive Widgets', 'Utility & Floating'] as const;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-burgundy" />
            Website Layout & Section Visibility
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Turn sections on or off without altering or losing any stored data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetAll(true)}
            className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium"
          >
            Show All
          </button>
          <button
            onClick={() => handleSetAll(false)}
            className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Sections by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const items = SECTION_CONFIG_ITEMS.filter((item) => item.category === cat);
          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> {cat}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => {
                  const isVisible = nav[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggle(item.key)}
                      className={`cursor-pointer rounded-2xl p-4 border transition flex items-center justify-between gap-4 ${
                        isVisible
                          ? 'bg-white dark:bg-stone-900 border-pink-100 dark:border-stone-800 shadow-xs'
                          : 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 leading-snug">{item.subtitle}</p>
                      </div>

                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                          isVisible ? 'bg-burgundy' : 'bg-stone-300 dark:bg-stone-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                            isVisible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
