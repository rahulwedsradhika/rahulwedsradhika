import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import {
  LayoutDashboard,
  Heart,
  Users,
  Calendar,
  MapPin,
  Phone,
  Image as ImageIcon,
  CheckSquare,
  Sparkles,
  Palette,
  FileText,
  LayoutTemplate,
  Database,
  Shield,
  Eye,
  Save,
  Check,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Volume2,
} from 'lucide-react';

// Tab components
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminCoupleTab } from './AdminCoupleTab';
import { AdminFamiliesTab } from './AdminFamiliesTab';
import { AdminEventsTab } from './AdminEventsTab';
import { AdminVenuesTab } from './AdminVenuesTab';
import { AdminContactsTab } from './AdminContactsTab';
import { AdminMediaTab } from './AdminMediaTab';
import { AdminAudioTab } from './AdminAudioTab';
import { AdminCountdownTab } from './AdminCountdownTab';
import { AdminThemeTab } from './AdminThemeTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminNavigationTab } from './AdminNavigationTab';
import { AdminBackupTab } from './AdminBackupTab';
import { AdminSecurityTab } from './AdminSecurityTab';
import { AdminMemoriesTab } from './AdminMemoriesTab';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';
import { Camera, LogOut } from 'lucide-react';

export type AdminTabId =
  | 'overview'
  | 'couple'
  | 'families'
  | 'events'
  | 'venues'
  | 'contacts'
  | 'media'
  | 'memories'
  | 'audio'
  | 'countdown'
  | 'theme'
  | 'content'
  | 'navigation'
  | 'backup'
  | 'security';

interface AdminNavGroup {
  label: string;
  items: Array<{
    id: AdminTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Dashboard & Core',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'couple', label: 'Couple & Date', icon: Heart },
      { id: 'families', label: 'Families & Elders', icon: Users },
    ],
  },
  {
    label: 'Planning & Logistics',
    items: [
      { id: 'events', label: 'Ceremonies', icon: Calendar },
      { id: 'venues', label: 'Venues & Maps', icon: MapPin },
      { id: 'contacts', label: 'Helpline Contacts', icon: Phone },
      { id: 'media', label: 'Photos & Media', icon: ImageIcon },
      { id: 'memories', label: 'Memories Moderation', icon: Camera, badge: 'Guest Photos' },
      { id: 'audio', label: 'Music & Audio', icon: Volume2 },
    ],
  },
  {
    label: 'Guests & Interactive',
    items: [
      { id: 'countdown', label: 'Countdown & Scratch', icon: Sparkles },
    ],
  },
  {
    label: 'Design & Settings',
    items: [
      { id: 'theme', label: 'Theme & Styling', icon: Palette },
      { id: 'content', label: 'Content & Texts', icon: FileText },
      { id: 'navigation', label: 'Section Layout', icon: LayoutTemplate },
      { id: 'backup', label: 'Backup & Restore', icon: Database },
      { id: 'security', label: 'Security & Supabase', icon: Shield },
    ],
  },
];

interface AdminDashboardProps {
  onClose: () => void;
  onSignOut?: () => void;
  adminUserEmail?: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSignOut,
  adminUserEmail,
}) => {
  const {
    config,
    updateConfig,
    exportConfig,
    resetToDefaults,
    isSaving,
    hasUnsavedChanges,
    saveChanges,
    persistenceMode,
    saveError,
    saveWarning,
    lastSavedAt,
  } = useWeddingConfig();
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  // Admin Theme state: default to 'light' as requested, with localStorage persistence
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('wedding_admin_theme_mode');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  const toggleAdminTheme = () => {
    const next = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(next);
    try {
      localStorage.setItem('wedding_admin_theme_mode', next);
    } catch {
      // ignore
    }
  };

  const handleManualSave = async () => {
    const ok = await saveChanges();
    if (ok) {
      const msg = persistenceMode === 'supabase' ? 'Saved to Cloud Database!' : 'Saved to Local Storage!';
      setSaveToast({ show: true, msg });
      setTimeout(() => setSaveToast({ show: false, msg: '' }), 3000);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminOverviewTab
            config={config}
            onNavigateTab={(tabId: string) => setActiveTab(tabId as AdminTabId)}
            onExportBackup={exportConfig}
            onResetDefaults={resetToDefaults}
            onPreviewSite={onClose}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'couple':
        return <AdminCoupleTab config={config} updateConfig={updateConfig} />;
      case 'families':
        return <AdminFamiliesTab />;
      case 'events':
        return <AdminEventsTab />;
      case 'venues':
        return <AdminVenuesTab />;
      case 'contacts':
        return <AdminContactsTab />;
      case 'media':
        return <AdminMediaTab />;
      case 'memories':
        return <AdminMemoriesTab />;
      case 'audio':
        return <AdminAudioTab />;
      case 'countdown':
        return <AdminCountdownTab />;
      case 'theme':
        return (
          <AdminThemeTab
            adminTheme={adminTheme}
            onAdminThemeChange={(theme) => {
              setAdminTheme(theme);
              try {
                localStorage.setItem('wedding_admin_theme_mode', theme);
              } catch {
                // ignore
              }
            }}
          />
        );
      case 'content':
        return <AdminContentTab />;
      case 'navigation':
        return <AdminNavigationTab />;
      case 'backup':
        return <AdminBackupTab />;
      case 'security':
        return <AdminSecurityTab />;
      default:
        return (
          <AdminOverviewTab
            config={config}
            onNavigateTab={(tabId: string) => setActiveTab(tabId as AdminTabId)}
            onExportBackup={exportConfig}
            onResetDefaults={resetToDefaults}
            onPreviewSite={onClose}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col font-sans backdrop-blur-md overflow-hidden transition-colors duration-150 ${
        adminTheme === 'dark'
          ? 'dark bg-stone-950 text-stone-100'
          : 'bg-[#FFF8FA] text-[#33252B]'
      }`}
    >
      {/* Top Bar Header */}
      <header className="h-16 bg-white dark:bg-stone-900 border-b border-[#EBD9DE] dark:border-stone-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-[#FFF4F6] dark:hover:bg-stone-800 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <RoyalCrestLogo size="sm" variant="crest" />
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base text-[#33252B] dark:text-stone-100 leading-none">
                Rahul & Radhika Admin
              </h1>
              <p className="text-[10px] text-[#765F68] dark:text-stone-400 font-medium mt-0.5">
                Village Dobh Wedding Management
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isSaving
                  ? 'bg-amber-500 animate-ping'
                  : hasUnsavedChanges
                  ? 'bg-amber-500'
                  : persistenceMode === 'supabase'
                  ? 'bg-emerald-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-medium">
              {isSaving
                ? 'Saving...'
                : hasUnsavedChanges
                ? 'Unsaved edits'
                : persistenceMode === 'supabase'
                ? `Cloud Synced (${lastSavedAt || 'Now'})`
                : 'Local Mode (Browser Only)'}
            </span>
          </div>

          {/* Theme Toggle Button (Light Mode / Dark Mode) */}
          <button
            type="button"
            onClick={toggleAdminTheme}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border shadow-2xs ${
              adminTheme === 'dark'
                ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                : 'bg-[#FFF4F6] hover:bg-[#F8E3E9] text-[#702C43] border-[#EBD9DE]'
            }`}
            title={adminTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={adminTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {adminTheme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#702C43]" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF4F6] hover:bg-[#F8E3E9] dark:bg-stone-800 dark:hover:bg-stone-700 text-[#702C43] dark:text-pink-300 border border-[#EBD9DE] dark:border-stone-700 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            {saveToast.show ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
            {saveToast.show ? saveToast.msg : 'Save'}
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#702C43] hover:bg-[#5C2336] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span> Website
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-[#765F68] hover:text-[#33252B] dark:text-stone-400 dark:hover:text-stone-200 hover:bg-[#FFF4F6] dark:hover:bg-stone-800 rounded-xl cursor-pointer"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Sidebar + Active View) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop & Mobile Drawer Sidebar */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-30 w-72 bg-white dark:bg-stone-900 border-r border-[#EBD9DE] dark:border-stone-800 flex flex-col justify-between transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#765F68] dark:text-stone-400 px-3 py-1">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#702C43] text-white shadow-xs font-semibold'
                          : 'text-[#33252B] dark:text-stone-300 hover:bg-[#FFF4F6] dark:hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#765F68] dark:text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white/80 translate-x-0.5' : 'text-stone-400/60'}`} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-[#EBD9DE] dark:border-stone-800 bg-[#FFF8FA]/60 dark:bg-stone-900/50">
            <div className="flex items-center justify-between text-[11px] text-[#765F68] dark:text-stone-400">
              <span>Schema v{config.version || 3}</span>
              <span className={`font-semibold ${persistenceMode === 'supabase' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {persistenceMode === 'supabase' ? 'Cloud Synced' : 'Local Storage Mode'}
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop for drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/30 z-20 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Tab View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FFF8FA] dark:bg-stone-950 space-y-4">
          {saveError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs flex items-center justify-between">
              <span><strong>Save Error:</strong> {saveError}</span>
            </div>
          )}

          {saveWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <strong>Notice:</strong> {saveWarning}
            </div>
          )}

          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
};
