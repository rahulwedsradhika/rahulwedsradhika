import React from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { THEME_PRESETS } from '../../config/wedding';
import { Palette, Check, Sparkles, RefreshCw, Wand2, Sun, Moon } from 'lucide-react';

interface AdminThemeTabProps {
  adminTheme?: 'light' | 'dark';
  onAdminThemeChange?: (theme: 'light' | 'dark') => void;
}

export const AdminThemeTab: React.FC<AdminThemeTabProps> = ({
  adminTheme = 'light',
  onAdminThemeChange,
}) => {
  const { config, updateConfig } = useWeddingConfig();
  const currentTheme = config.theme;
  const colors = currentTheme.colors;

  const handleApplyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    void updateConfig((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        activePresetId: presetId,
        colors: { ...preset.colors },
      },
    }));
  };

  const handleColorChange = (key: string, val: string) => {
    void updateConfig((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          [key]: val,
        },
      },
    }));
  };

  const colorFields = [
    { key: 'mainBg', label: 'Primary Page Canvas Background', val: colors.mainBg },
    { key: 'secondaryBg', label: 'Secondary / Section Background', val: colors.secondaryBg },
    { key: 'cardBg', label: 'Card & Surface Color', val: colors.cardBg },
    { key: 'accentPink', label: 'Accent Pink / Rose Gold', val: colors.accentPink },
    { key: 'burgundy', label: 'Primary Royal Burgundy / Accent', val: colors.burgundy },
    { key: 'gold', label: 'Ceremonial Gold / Haldi Ochre', val: colors.gold },
    { key: 'textPrimary', label: 'Headings & Body Text Color', val: colors.textPrimary },
    { key: 'borderPink', label: 'Decorative Border Tint', val: colors.borderPink },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-burgundy" />
          Theme & Visual Styling
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Select from handcrafted luxury wedding presets or tailor individual color tokens with dynamic instant live preview.
        </p>
      </div>

      {/* Admin Dashboard Theme Mode Selector */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#EBD9DE] dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-[#33252B] dark:text-stone-100 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Admin Dashboard Appearance
            </h3>
            <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5">
              Switch the administration panel between Light Mode (blush & ivory) and Dark Mode (stone slate).
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF4F6] dark:bg-stone-800 text-[#702C43] dark:text-pink-300 border border-[#EBD9DE] dark:border-stone-700 w-fit">
            {adminTheme === 'light' ? '☀️ Light Mode Active' : '🌙 Dark Mode Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode Option */}
          <div
            onClick={() => onAdminThemeChange?.('light')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex items-center gap-3.5 ${
              adminTheme === 'light'
                ? 'border-[#702C43] bg-[#FFF4F6] ring-2 ring-[#702C43]/10 shadow-sm'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 hover:border-[#EBD9DE]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EBD9DE] flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#702C43]">Light Mode</h4>
                {adminTheme === 'light' && (
                  <span className="w-5 h-5 rounded-full bg-[#702C43] text-white flex items-center justify-center text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#765F68] mt-0.5">
                Ivory & blush pink cards with royal burgundy typography.
              </p>
            </div>
          </div>

          {/* Dark Mode Option */}
          <div
            onClick={() => onAdminThemeChange?.('dark')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex items-center gap-3.5 ${
              adminTheme === 'dark'
                ? 'border-[#702C43] dark:border-pink-400 bg-stone-100 dark:bg-stone-800 shadow-sm ring-2 ring-[#702C43]/10'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 hover:border-stone-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-indigo-400 shadow-2xs shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Dark Mode</h4>
                {adminTheme === 'dark' && (
                  <span className="w-5 h-5 rounded-full bg-[#702C43] text-white flex items-center justify-center text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#765F68] dark:text-stone-400 mt-0.5">
                Deep slate & charcoal aesthetic for low-light management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Preset Cards */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-burgundy" />
          Pre-designed Luxury Palettes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isActive = currentTheme.activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                  isActive
                    ? 'border-burgundy bg-pink-50/20 dark:bg-stone-800/60 shadow-md ring-2 ring-burgundy/10'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {preset.name}
                    </h4>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy bg-pink-100 dark:bg-burgundy/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mb-3 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                {/* Swatch row */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
                    style={{ backgroundColor: preset.colors.mainBg }}
                    title="Main Canvas"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
                    style={{ backgroundColor: preset.colors.cardBg }}
                    title="Card Surface"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
                    style={{ backgroundColor: preset.colors.accentPink }}
                    title="Accent"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
                    style={{ backgroundColor: preset.colors.burgundy }}
                    title="Burgundy"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
                    style={{ backgroundColor: preset.colors.gold }}
                    title="Gold"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Pickers & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Color Pickers (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
            Custom Color Palette Tokens
          </h3>
          <p className="text-xs text-stone-500">
            Changes apply to CSS variables in real time across the entire site without page reload.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {colorFields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.val}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-stone-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={field.val}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Mini Preview Component */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
            Live Preview Card
          </h3>

          <div
            className="rounded-2xl p-5 border shadow-sm transition space-y-3"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.borderPink,
              color: colors.textPrimary,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${colors.accentPink}30`,
                  color: colors.burgundy,
                }}
              >
                Invitation Card
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors.gold }}
              />
            </div>

            <h4
              className="font-serif text-lg font-bold"
              style={{ color: colors.burgundy }}
            >
              Rahul & Radhika
            </h4>

            <p
              className="text-xs line-clamp-2 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              Village Dobh, Rohtak, Haryana • 28 November 2026
            </p>

            <button
              className="w-full py-2 rounded-xl text-xs font-medium transition shadow-sm"
              style={{
                backgroundColor: colors.burgundy,
                color: '#FFFFFF',
              }}
            >
              Sample Button Action
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Show Traditional Motifs
              </span>
              <input
                type="checkbox"
                checked={currentTheme.showDecorativeMotifs}
                onChange={(e) =>
                  void updateConfig((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      showDecorativeMotifs: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 text-burgundy rounded"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Floral Intensity
              </label>
              <select
                value={currentTheme.floralIntensity || 'moderate'}
                onChange={(e) =>
                  void updateConfig((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      floralIntensity: e.target.value as any,
                    },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
              >
                <option value="minimal">Minimal / Clean</option>
                <option value="moderate">Moderate / Refined</option>
                <option value="luxurious">Luxurious / Garland</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
