import React from 'react';
import { Calendar, Heart, Sparkles, User } from 'lucide-react';
import { WeddingConfig } from '../../types/wedding';

interface AdminCoupleTabProps {
  config: WeddingConfig;
  updateConfig: (updater: (prev: WeddingConfig) => WeddingConfig) => Promise<boolean>;
}

export const AdminCoupleTab: React.FC<AdminCoupleTabProps> = ({ config, updateConfig }) => {
  const handleChange = (path: string, value: string) => {
    updateConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as WeddingConfig;
      const keys = path.split('.');
      let current: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Groom Identity */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBD9DE] dark:border-stone-800">
          <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
            <User className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-[#702C43] dark:text-stone-100">
              Groom Identity
            </h3>
            <p className="text-xs text-[#765F68] dark:text-stone-400">
              Controls groom name across website hero, letters, invitation cards, and metadata
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Groom Full Name (English)
            </label>
            <input
              type="text"
              value={config.groom.en}
              onChange={(e) => handleChange('groom.en', e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Groom Full Name (Hindi Translation)
            </label>
            <input
              type="text"
              value={config.groom.hi}
              onChange={(e) => handleChange('groom.hi', e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Family Surname
            </label>
            <input
              type="text"
              value={config.groom.surname || ''}
              onChange={(e) => handleChange('groom.surname', e.target.value)}
              placeholder="e.g. Dahiya"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Short Name / Nickname
            </label>
            <input
              type="text"
              value={config.groom.shortName || ''}
              onChange={(e) => handleChange('groom.shortName', e.target.value)}
              placeholder="e.g. Rahul"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
            Groom Introduction (English)
          </label>
          <textarea
            rows={2}
            value={config.groom.introduction?.en || ''}
            onChange={(e) => handleChange('groom.introduction.en', e.target.value)}
            className="w-full rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 py-2 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
            Groom Introduction (Hindi Translation)
          </label>
          <textarea
            rows={2}
            value={config.groom.introduction?.hi || ''}
            onChange={(e) => handleChange('groom.introduction.hi', e.target.value)}
            className="w-full rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 py-2 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Bride Identity */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBD9DE] dark:border-stone-800">
          <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
            <Heart className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-[#702C43] dark:text-stone-100">
              Bride Identity
            </h3>
            <p className="text-xs text-[#765F68] dark:text-stone-400">
              Controls bride name across website hero, letters, invitation cards, and metadata
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Bride Full Name (English)
            </label>
            <input
              type="text"
              value={config.bride.en}
              onChange={(e) => handleChange('bride.en', e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Bride Full Name (Hindi Translation)
            </label>
            <input
              type="text"
              value={config.bride.hi}
              onChange={(e) => handleChange('bride.hi', e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Family Surname
            </label>
            <input
              type="text"
              value={config.bride.surname || ''}
              onChange={(e) => handleChange('bride.surname', e.target.value)}
              placeholder="e.g. Hooda"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Short Name / Nickname
            </label>
            <input
              type="text"
              value={config.bride.shortName || ''}
              onChange={(e) => handleChange('bride.shortName', e.target.value)}
              placeholder="e.g. Radhika"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
            Bride Introduction (English)
          </label>
          <textarea
            rows={2}
            value={config.bride.introduction?.en || ''}
            onChange={(e) => handleChange('bride.introduction.en', e.target.value)}
            className="w-full rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 py-2 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
            Bride Introduction (Hindi Translation)
          </label>
          <textarea
            rows={2}
            value={config.bride.introduction?.hi || ''}
            onChange={(e) => handleChange('bride.introduction.hi', e.target.value)}
            className="w-full rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 py-2 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Monograms & Couple Branding */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBD9DE] dark:border-stone-800">
          <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
            <Sparkles className="w-4 h-4 text-[#D6AD62]" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-[#702C43] dark:text-stone-100">
              Monogram & Couple Branding
            </h3>
            <p className="text-xs text-[#765F68] dark:text-stone-400">
              Appears on the gold wax seal, letterhead, card headers, and footer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Monogram (English)
            </label>
            <input
              type="text"
              value={config.monogram.en}
              onChange={(e) => handleChange('monogram.en', e.target.value)}
              placeholder="R & R"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Monogram (Hindi Translation)
            </label>
            <input
              type="text"
              value={config.monogram.hi}
              onChange={(e) => handleChange('monogram.hi', e.target.value)}
              placeholder="e.g. R&R in Hindi"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Site Builder Credit
            </label>
            <input
              type="text"
              value={config.siteBuilder}
              onChange={(e) => handleChange('siteBuilder', e.target.value)}
              placeholder="Rohit"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Wedding Date, Ceremony Time & Timezone */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBD9DE] dark:border-stone-800">
          <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
            <Calendar className="w-4 h-4 text-[#D6AD62]" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-[#702C43] dark:text-stone-100">
              Wedding Date & Ceremony Timing
            </h3>
            <p className="text-xs text-[#765F68] dark:text-stone-400">
              Central wedding date driving the countdown, calendar generation, and invitation cards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Wedding Date Display (English)
            </label>
            <input
              type="text"
              value={config.weddingDateDisplay.en}
              onChange={(e) => handleChange('weddingDateDisplay.en', e.target.value)}
              placeholder="28 November 2026"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Wedding Date Display (Hindi Translation)
            </label>
            <input
              type="text"
              value={config.weddingDateDisplay.hi}
              onChange={(e) => handleChange('weddingDateDisplay.hi', e.target.value)}
              placeholder="e.g. 28 November (Hindi)"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Wedding ISO Timestamp (Timezone Aware)
            </label>
            <input
              type="text"
              value={config.weddingDateISO}
              onChange={(e) => handleChange('weddingDateISO', e.target.value)}
              placeholder="2026-11-28T19:30:00+05:30"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm font-mono text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Timezone
            </label>
            <select
              value={config.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
              <option value="UTC">UTC (+00:00)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Main Ceremony Start Time
            </label>
            <input
              type="text"
              value={config.ceremonyStartTime}
              onChange={(e) => handleChange('ceremonyStartTime', e.target.value)}
              placeholder="06:00 PM"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#702C43] dark:text-pink-300 mb-1">
              Main Ceremony End Time
            </label>
            <input
              type="text"
              value={config.ceremonyEndTime}
              onChange={(e) => handleChange('ceremonyEndTime', e.target.value)}
              placeholder="11:45 PM"
              className="w-full min-h-[44px] rounded-xl bg-[#FFF4F6] dark:bg-stone-800 px-3.5 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-700 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
