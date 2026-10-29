import React, { createContext, useContext, useEffect, useState } from 'react';
import { WeddingConfig } from '../types/wedding';
import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import {
  exportConfigAsJson,
  localWeddingStorage,
  parseImportedConfigFile,
} from '../lib/weddingConfigStorage';

interface WeddingConfigContextValue {
  config: WeddingConfig;
  updateConfig: (updater: (prev: WeddingConfig) => WeddingConfig) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<{ success: boolean; error?: string }>;
  isLocalMode: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<boolean>;
}

const WeddingConfigContext = createContext<WeddingConfigContextValue | null>(null);

export const WeddingConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_WEDDING_CONFIG);
  const [persistedSnapshot, setPersistedSnapshot] = useState<string>(
    JSON.stringify(DEFAULT_WEDDING_CONFIG)
  );
  const [isSaving, setIsSaving] = useState(false);
  const isLocalMode = true; // Supabase not connected yet

  // Load configuration on mount
  useEffect(() => {
    let mounted = true;
    void localWeddingStorage.loadConfig().then((loaded) => {
      if (mounted) {
        setConfig(loaded);
        setPersistedSnapshot(JSON.stringify(loaded));
        applyThemeCssVariables(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Dynamically update document CSS variables whenever theme colors change
  const applyThemeCssVariables = (cfg: WeddingConfig) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const colors = cfg.theme.colors;

    root.style.setProperty('--color-pink-main', colors.mainBg);
    root.style.setProperty('--color-pink-sub', colors.secondaryBg);
    root.style.setProperty('--color-card', colors.cardBg);
    root.style.setProperty('--color-rose', colors.accentPink);
    root.style.setProperty('--color-burgundy', colors.burgundy);
    root.style.setProperty('--color-gold', colors.gold);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border-pink', colors.borderPink);

    // Aliases
    root.style.setProperty('--main-bg', colors.mainBg);
    root.style.setProperty('--secondary-bg', colors.secondaryBg);
    root.style.setProperty('--card-bg', colors.cardBg);
    root.style.setProperty('--accent-pink', colors.accentPink);
    root.style.setProperty('--burgundy', colors.burgundy);
    root.style.setProperty('--gold', colors.gold);
    root.style.setProperty('--cream', colors.mainBg);
    root.style.setProperty('--cream-dark', colors.secondaryBg);
    root.style.setProperty('--charcoal', colors.textPrimary);
  };

  const hasUnsavedChanges = JSON.stringify(config) !== persistedSnapshot;

  const updateConfig = async (updater: (prev: WeddingConfig) => WeddingConfig): Promise<boolean> => {
    const next = updater(config);
    setConfig(next);
    applyThemeCssVariables(next);
    // Auto-save locally
    setIsSaving(true);
    const success = await localWeddingStorage.saveConfig(next);
    setIsSaving(false);
    if (success) {
      setPersistedSnapshot(JSON.stringify(next));
    }
    return success;
  };

  const saveChanges = async (): Promise<boolean> => {
    setIsSaving(true);
    const success = await localWeddingStorage.saveConfig(config);
    setIsSaving(false);
    if (success) {
      setPersistedSnapshot(JSON.stringify(config));
    }
    return success;
  };

  const resetToDefaults = async () => {
    const defaults = await localWeddingStorage.resetConfig();
    setConfig(defaults);
    setPersistedSnapshot(JSON.stringify(defaults));
    applyThemeCssVariables(defaults);
  };

  const exportConfig = () => {
    exportConfigAsJson(config);
  };

  const importConfig = async (file: File): Promise<{ success: boolean; error?: string }> => {
    const result = await parseImportedConfigFile(file);
    if (!result.success || !result.config) {
      return { success: false, error: result.error };
    }
    const newConfig = result.config;
    setConfig(newConfig);
    applyThemeCssVariables(newConfig);
    const saved = await localWeddingStorage.saveConfig(newConfig);
    if (saved) {
      setPersistedSnapshot(JSON.stringify(newConfig));
    }
    return { success: true };
  };

  return (
    <WeddingConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefaults,
        exportConfig,
        importConfig,
        isLocalMode,
        isSaving,
        hasUnsavedChanges,
        saveChanges,
      }}
    >
      {children}
    </WeddingConfigContext.Provider>
  );
};

export const useWeddingConfig = (): WeddingConfigContextValue => {
  const context = useContext(WeddingConfigContext);
  if (!context) {
    throw new Error('useWeddingConfig must be used within a WeddingConfigProvider');
  }
  return context;
};
