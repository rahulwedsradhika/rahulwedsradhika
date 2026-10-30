import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WeddingConfig } from '../types/wedding';
import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import {
  exportConfigAsJson,
  parseImportedConfigFile,
  loadCanonicalConfig,
  saveCanonicalConfig,
  resetCanonicalConfig,
  PersistenceMode,
  SaveConfigResult,
  SaveConfigErrorCode,
} from '../lib/weddingConfigService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface WeddingConfigContextValue {
  config: WeddingConfig;
  updateConfig: (updater: (prev: WeddingConfig) => WeddingConfig) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<{ success: boolean; error?: string }>;
  isLocalMode: boolean;
  persistenceMode: PersistenceMode;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveWarning: string | null;
  saveErrorCode: SaveConfigErrorCode | null;
  lastSaveResult: SaveConfigResult | null;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<boolean>;
  refreshConfig: () => Promise<void>;
}

const WeddingConfigContext = createContext<WeddingConfigContextValue | null>(null);

export const WeddingConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_WEDDING_CONFIG);
  const [persistedSnapshot, setPersistedSnapshot] = useState<string>(
    JSON.stringify(DEFAULT_WEDDING_CONFIG)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('local');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveErrorCode, setSaveErrorCode] = useState<SaveConfigErrorCode | null>(null);
  const [lastSaveResult, setLastSaveResult] = useState<SaveConfigResult | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Apply theme variables to document root
  const applyThemeCssVariables = useCallback((cfg: WeddingConfig) => {
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

    // CSS Aliases for component compatibility
    root.style.setProperty('--main-bg', colors.mainBg);
    root.style.setProperty('--secondary-bg', colors.secondaryBg);
    root.style.setProperty('--card-bg', colors.cardBg);
    root.style.setProperty('--accent-pink', colors.accentPink);
    root.style.setProperty('--burgundy', colors.burgundy);
    root.style.setProperty('--gold', colors.gold);
    root.style.setProperty('--cream', colors.mainBg);
    root.style.setProperty('--cream-dark', colors.secondaryBg);
    root.style.setProperty('--charcoal', colors.textPrimary);
  }, []);

  const refreshConfig = useCallback(async () => {
    setIsLoading(true);
    setSaveError(null);
    try {
      const res = await loadCanonicalConfig();
      setConfig(res.config);
      setPersistedSnapshot(JSON.stringify(res.config));
      setPersistenceMode(res.mode);
      applyThemeCssVariables(res.config);
      setLastSavedAt(new Date(res.config.lastUpdatedISO || Date.now()).toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load wedding configuration:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeCssVariables]);

  // Initial load on mount
  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  const hasUnsavedChanges = JSON.stringify(config) !== persistedSnapshot;

  const updateConfig = async (updater: (prev: WeddingConfig) => WeddingConfig): Promise<boolean> => {
    const next = updater(config);
    setConfig(next);
    applyThemeCssVariables(next);

    setIsSaving(true);
    setSaveError(null);
    setSaveWarning(null);
    setSaveErrorCode(null);

    const result = await saveCanonicalConfig(next);
    setIsSaving(false);
    setLastSaveResult(result);

    if (result.success) {
      setPersistedSnapshot(JSON.stringify(next));
      setPersistenceMode(result.mode);
      setLastSavedAt(new Date().toLocaleTimeString());
      if (result.warning) {
        setSaveWarning(result.warning);
      }
      return true;
    } else {
      setSaveError(result.error || 'Failed to save configuration');
      setSaveErrorCode(result.errorCode || 'UNKNOWN');
      return false;
    }
  };

  const saveChanges = async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    setSaveWarning(null);
    setSaveErrorCode(null);

    const result = await saveCanonicalConfig(config);
    setIsSaving(false);
    setLastSaveResult(result);

    if (result.success) {
      setPersistedSnapshot(JSON.stringify(config));
      setPersistenceMode(result.mode);
      setLastSavedAt(new Date().toLocaleTimeString());
      if (result.warning) {
        setSaveWarning(result.warning);
      }
      return true;
    } else {
      setSaveError(result.error || 'Failed to save configuration');
      setSaveErrorCode(result.errorCode || 'UNKNOWN');
      return false;
    }
  };

  const resetToDefaults = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveWarning(null);
    setSaveErrorCode(null);
    try {
      const defaults = await resetCanonicalConfig();
      setConfig(defaults);
      setPersistedSnapshot(JSON.stringify(defaults));
      setPersistenceMode(isSupabaseConfigured ? 'supabase' : 'local');
      applyThemeCssVariables(defaults);
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsSaving(false);
    }
  };

  const exportConfig = () => {
    exportConfigAsJson(config);
  };

  const importConfig = async (file: File): Promise<{ success: boolean; error?: string }> => {
    setSaveError(null);
    setSaveWarning(null);
    setSaveErrorCode(null);
    const result = await parseImportedConfigFile(file);
    if (!result.success || !result.config) {
      setSaveError(result.error || 'Invalid configuration file');
      return { success: false, error: result.error };
    }

    const newConfig = result.config;
    setConfig(newConfig);
    applyThemeCssVariables(newConfig);

    setIsSaving(true);
    const saveRes = await saveCanonicalConfig(newConfig);
    setIsSaving(false);
    setLastSaveResult(saveRes);

    if (saveRes.success) {
      setPersistedSnapshot(JSON.stringify(newConfig));
      setPersistenceMode(saveRes.mode);
      setLastSavedAt(new Date().toLocaleTimeString());
      if (saveRes.warning) {
        setSaveWarning(saveRes.warning);
      }
      return { success: true };
    } else {
      setSaveError(saveRes.error || 'Failed to persist imported configuration');
      setSaveErrorCode(saveRes.errorCode || 'UNKNOWN');
      return { success: false, error: saveRes.error };
    }
  };

  return (
    <WeddingConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefaults,
        exportConfig,
        importConfig,
        isLocalMode: !isSupabaseConfigured || persistenceMode === 'local',
        persistenceMode,
        isLoading,
        isSaving,
        saveError,
        saveWarning,
        saveErrorCode,
        lastSaveResult,
        lastSavedAt,
        hasUnsavedChanges,
        saveChanges,
        refreshConfig,
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
