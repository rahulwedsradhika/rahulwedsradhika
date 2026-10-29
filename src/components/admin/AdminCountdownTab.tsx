import React from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { ScratchCard } from '../ui/ScratchCard';
import { Clock, Sparkles, Sliders, RotateCcw, Eye } from 'lucide-react';

export const AdminCountdownTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();

  const countdown = config.countdown;
  const scratch = config.scratchReveal;

  const handleCountdownChange = (field: string, val: any) => {
    void updateConfig((prev) => ({
      ...prev,
      countdown: {
        ...prev.countdown,
        [field]: val,
      },
    }));
  };

  const handleScratchChange = (field: string, val: any) => {
    void updateConfig((prev) => ({
      ...prev,
      scratchReveal: {
        ...prev.scratchReveal,
        [field]: val,
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-burgundy" />
          Countdown & Scratch-to-Reveal Controls
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Customize the ceremonial countdown clock and configure the interactive scratch-card revelation effect for wedding dates.
        </p>
      </div>

      {/* Countdown Settings */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
          <span className="text-xs font-bold text-burgundy uppercase tracking-wider">
            Ceremonial Countdown Settings
          </span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={countdown.visible}
              onChange={(e) => handleCountdownChange('visible', e.target.checked)}
              className="w-4 h-4 text-burgundy rounded"
            />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Visible on Public Website
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Target Ceremony Date & Time (ISO format)
            </label>
            <input
              type="datetime-local"
              value={countdown.targetISO ? countdown.targetISO.slice(0, 16) : '2026-11-28T10:00'}
              onChange={(e) => handleCountdownChange('targetISO', `${e.target.value}:00+05:30`)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Timezone
            </label>
            <input
              type="text"
              value={countdown.timezone || 'Asia/Kolkata'}
              onChange={(e) => handleCountdownChange('timezone', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Celebrated Post-Wedding Message (English & Hindi)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Just Married! Thank you for blessing us."
              value={countdown.celebratedMessage?.en || ''}
              onChange={(e) =>
                handleCountdownChange('celebratedMessage', {
                  ...countdown.celebratedMessage,
                  en: e.target.value,
                })
              }
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
            />
            <input
              type="text"
              placeholder="e.g. Wedding concluded blessings message (Hindi)"
              value={countdown.celebratedMessage?.hi || ''}
              onChange={(e) =>
                handleCountdownChange('celebratedMessage', {
                  ...countdown.celebratedMessage,
                  hi: e.target.value,
                })
              }
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
            />
          </div>
        </div>
      </div>

      {/* Scratch-to-Reveal Card Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Column */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-burgundy" />
              Scratch Card Interactive Feature
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scratch.enabled}
                onChange={(e) => handleScratchChange('enabled', e.target.checked)}
                className="w-4 h-4 text-burgundy rounded"
              />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Enable Feature
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Heading (EN & HI)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={scratch.heading?.en || ''}
                onChange={(e) =>
                  handleScratchChange('heading', { ...scratch.heading, en: e.target.value })
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
              <input
                type="text"
                value={scratch.heading?.hi || ''}
                onChange={(e) =>
                  handleScratchChange('heading', { ...scratch.heading, hi: e.target.value })
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Instructions (EN & HI)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={scratch.instruction?.en || ''}
                onChange={(e) =>
                  handleScratchChange('instruction', { ...scratch.instruction, en: e.target.value })
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
              <input
                type="text"
                value={scratch.instruction?.hi || ''}
                onChange={(e) =>
                  handleScratchChange('instruction', { ...scratch.instruction, hi: e.target.value })
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>

          {/* Reveal Threshold Slider & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <span>Reveal Threshold</span>
                <span className="text-burgundy font-mono">{scratch.revealThresholdPercentage}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={scratch.revealThresholdPercentage}
                onChange={(e) =>
                  handleScratchChange('revealThresholdPercentage', parseInt(e.target.value))
                }
                className="w-full accent-burgundy cursor-pointer"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Auto-reveals after scratching {scratch.revealThresholdPercentage}% of the card.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Scratch Overlay Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={scratch.scratchColor || '#D4A640'}
                  onChange={(e) => handleScratchChange('scratchColor', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer"
                />
                <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                  {scratch.scratchColor || '#D4A640'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={scratch.allowReplay}
                onChange={(e) => handleScratchChange('allowReplay', e.target.checked)}
                className="w-4 h-4 text-burgundy rounded"
              />
              Allow Guests to Scratch Again (Replay)
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={scratch.persistRevealedState}
                onChange={(e) => handleScratchChange('persistRevealedState', e.target.checked)}
                className="w-4 h-4 text-burgundy rounded"
              />
              Remember Revealed in Browser
            </label>
          </div>
        </div>

        {/* Live Interactive Preview Column */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-between w-full border-b border-stone-100 dark:border-stone-800 pb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Card Preview
            </span>
            <span className="text-[11px] text-stone-400">Try scratching here</span>
          </div>

          <div className="w-full flex justify-center py-2">
            <ScratchCard />
          </div>
        </div>
      </div>
    </div>
  );
};
