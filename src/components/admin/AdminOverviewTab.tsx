import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Heart,
  ImageIcon,
  Camera,
  MapPin,
  Music,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { WeddingConfig } from '../../types/wedding';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';

interface AdminOverviewTabProps {
  config: WeddingConfig;
  onNavigateTab: (tabId: string) => void;
  onExportBackup: () => void;
  onResetDefaults: () => void;
  onPreviewSite: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  config,
  onNavigateTab,
  onExportBackup,
  onResetDefaults,
  onPreviewSite,
  searchQuery,
  setSearchQuery,
}) => {
  const { lang } = useLanguage();

  const totalEvents = config.events.length;
  const totalVenues = config.venues.length;
  const totalContacts = config.contacts.length;
  const totalFamilyMembers = config.familyMembers.length;

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#765F68] dark:text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all settings (e.g. bride name, pheras, morbagh, phone, theme, colors)..."
          className="w-full min-h-[44px] rounded-2xl bg-white dark:bg-stone-900 pl-10 pr-4 text-sm text-[#33252B] dark:text-stone-100 border border-[#EBD9DE] dark:border-stone-800 focus:border-[#702C43] dark:focus:border-pink-400 focus:outline-none shadow-xs"
        />
      </div>

      {/* Local Mode Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 text-amber-800 dark:text-amber-200 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Local Mode Active</span>
              <span className="text-[11px] font-semibold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full">
                Supabase Not Connected
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
              All edits, photos, and RSVP records are stored safely in this browser (LocalStorage & IndexedDB).
              Changes update the public website immediately on this device.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={onExportBackup}
            className="w-full sm:w-auto text-xs bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100"
          >
            <Download className="w-3.5 h-3.5" />
            Backup JSON
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onPreviewSite}
            className="w-full sm:w-auto text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            View Site
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Couple & Date */}
        <div
          onClick={() => onNavigateTab('couple')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Heart className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Couple</span>
          </div>
          <h4 className="font-heading font-bold text-base text-[#702C43] dark:text-stone-100 group-hover:text-[#5C2336] truncate">
            {config.groom.en} & {config.bride.en}
          </h4>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            {config.monogram.en} · {config.weddingDateDisplay.en}
          </p>
        </div>

        {/* Schedule */}
        <div
          onClick={() => onNavigateTab('events')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Events</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold text-[#702C43] dark:text-stone-100 tabular-nums">
              {totalEvents}
            </span>
            <span className="text-xs font-semibold text-[#765F68]">ceremonies</span>
          </div>
          <p className="text-xs text-[#765F68] mt-0.5 truncate">
            Mehendi, Haldi, Sangeet & Pheras
          </p>
        </div>

        {/* Venues */}
        <div
          onClick={() => onNavigateTab('venues')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Locations</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold text-[#702C43] dark:text-stone-100 tabular-nums">
              {totalVenues}
            </span>
            <span className="text-xs font-semibold text-[#765F68] dark:text-stone-400">venues</span>
          </div>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            Morbagh Pavilion & Dobh
          </p>
        </div>

        {/* Contacts */}
        <div
          onClick={() => onNavigateTab('contacts')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Phone className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Help</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold text-[#702C43] dark:text-stone-100 tabular-nums">
              {totalContacts}
            </span>
            <span className="text-xs font-semibold text-[#765F68] dark:text-stone-400">coordinators</span>
          </div>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            Travel, Stay & Food numbers
          </p>
        </div>



        {/* Families */}
        <div
          onClick={() => onNavigateTab('families')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Sparkles className="w-4 h-4 text-[#D6AD62]" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Parivar</span>
          </div>
          <h4 className="font-heading font-bold text-base text-[#702C43] dark:text-stone-100 truncate">
            Dahiya & Hooda
          </h4>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            {totalFamilyMembers} relatives listed
          </p>
        </div>

        {/* Theme */}
        <div
          onClick={() => onNavigateTab('theme')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Palette className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Theme</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{ backgroundColor: config.theme.colors.burgundy }}
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
            />
            <span
              style={{ backgroundColor: config.theme.colors.accentPink }}
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
            />
            <span
              style={{ backgroundColor: config.theme.colors.gold }}
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
            />
          </div>
          <p className="text-xs font-semibold text-[#702C43] dark:text-stone-200 mt-1.5 truncate">
            {config.theme.activePresetId}
          </p>
        </div>

        {/* Music */}
        <div
          onClick={() => onNavigateTab('audio')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Music className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Music</span>
          </div>
          <h4 className="font-heading font-bold text-sm text-[#702C43] dark:text-stone-100 truncate">
            {config.audio.enabled ? 'Enabled' : 'Disabled'}
          </h4>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            {config.audio.trackName}
          </p>
        </div>

        {/* Memories Gallery */}
        <div
          onClick={() => onNavigateTab('memories')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 hover:border-[#702C43] dark:hover:border-pink-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-full bg-[#F8E3E9] dark:bg-stone-800 flex items-center justify-center text-[#702C43] dark:text-pink-300">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#C76B84] dark:text-pink-300 uppercase tracking-wider">Memories</span>
          </div>
          <h4 className="font-heading font-bold text-sm text-[#702C43] dark:text-stone-100 truncate">
            Photo Gallery
          </h4>
          <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5 truncate">
            Review guest uploads
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EBD9DE] dark:border-stone-800 space-y-3">
        <h4 className="font-heading text-sm font-bold text-[#702C43] dark:text-stone-100">
          Quick Administrative Actions
        </h4>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('couple')} className="text-xs">
            Edit Couple & Date
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('events')} className="text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add New Event
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('venues')} className="text-xs">
            Edit Venues & Maps
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('contacts')} className="text-xs">
            Update Phone Numbers
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('media')} className="text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Upload Photos
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTab('theme')} className="text-xs">
            Change Theme Colors
          </Button>

          <Button variant="secondary" size="md" onClick={onExportBackup} className="text-xs">
            Export JSON Backup
          </Button>
        </div>
      </div>
    </div>
  );
};
