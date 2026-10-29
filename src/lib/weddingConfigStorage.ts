/**
 * Persistent Storage & Migration Layer for Wedding Configuration
 * Supports browser-local persistence, schema validation, import/export,
 * and future Supabase adapter migration.
 */

import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import { WeddingConfig } from '../types/wedding';

const CONFIG_STORAGE_KEY = 'rahul_radhika_wedding_config_v3';
const BACKUP_STORAGE_KEY = 'rahul_radhika_wedding_config_backup_v3';

export interface StorageAdapter {
  loadConfig(): Promise<WeddingConfig>;
  saveConfig(config: WeddingConfig): Promise<boolean>;
  resetConfig(): Promise<WeddingConfig>;
}

/**
 * Validate that an object has the essential structure of a WeddingConfig
 */
export function validateWeddingConfig(obj: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Configuration must be a valid JSON object'] };
  }

  const c = obj as Partial<WeddingConfig>;

  if (!c.groom || typeof c.groom.en !== 'string' || typeof c.groom.hi !== 'string') {
    errors.push('Groom names (en/hi) are missing or invalid');
  }

  if (!c.bride || typeof c.bride.en !== 'string' || typeof c.bride.hi !== 'string') {
    errors.push('Bride names (en/hi) are missing or invalid');
  }

  if (!c.weddingDateISO || isNaN(Date.parse(c.weddingDateISO))) {
    errors.push('Wedding date ISO timestamp is missing or invalid');
  }

  if (!Array.isArray(c.events) || c.events.length === 0) {
    errors.push('At least one wedding event is required in schedule');
  }

  if (!Array.isArray(c.venues) || c.venues.length === 0) {
    errors.push('At least one venue is required');
  }

  if (!c.theme || !c.theme.colors || !c.theme.colors.mainBg) {
    errors.push('Theme colors configuration is missing or malformed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Migrate older configuration versions if necessary
 */
function migrateConfig(loaded: Partial<WeddingConfig>): WeddingConfig {
  const base = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;

  // Deep merge base defaults with loaded attributes
  const merged: WeddingConfig = {
    ...base,
    ...loaded,
    groom: { ...base.groom, ...(loaded.groom || {}) },
    bride: { ...base.bride, ...(loaded.bride || {}) },
    monogram: { ...base.monogram, ...(loaded.monogram || {}) },
    weddingDateDisplay: { ...base.weddingDateDisplay, ...(loaded.weddingDateDisplay || {}) },
    groomFamily: { ...base.groomFamily, ...(loaded.groomFamily || {}) },
    brideFamily: { ...base.brideFamily, ...(loaded.brideFamily || {}) },
    familyMembers: Array.isArray(loaded.familyMembers) && loaded.familyMembers.length > 0
      ? loaded.familyMembers
      : base.familyMembers,
    events: Array.isArray(loaded.events) && loaded.events.length > 0 ? loaded.events : base.events,
    venues: Array.isArray(loaded.venues) && loaded.venues.length > 0 ? loaded.venues : base.venues,
    contacts: Array.isArray(loaded.contacts) && loaded.contacts.length > 0 ? loaded.contacts : base.contacts,
    countdown: { ...base.countdown, ...(loaded.countdown || {}) },
    scratchReveal: { ...base.scratchReveal, ...(loaded.scratchReveal || {}) },
    theme: {
      ...base.theme,
      ...(loaded.theme || {}),
      colors: { ...base.theme.colors, ...(loaded.theme?.colors || {}) },
    },
    navigation: { ...base.navigation, ...(loaded.navigation || {}) },
    audio: { ...base.audio, ...(loaded.audio || {}) },
    downloads: { ...base.downloads, ...(loaded.downloads || {}) },
    seo: { ...base.seo, ...(loaded.seo || {}) },
    media: {
      ...base.media,
      ...(loaded.media || {}),
      customGallery: Array.isArray(loaded.media?.customGallery) ? loaded.media.customGallery : [],
    },
    contentOverrides: loaded.contentOverrides || {},
    version: DEFAULT_WEDDING_CONFIG.version,
    lastUpdatedISO: loaded.lastUpdatedISO || new Date().toISOString(),
  };

  return merged;
}

/**
 * Browser Local Storage Adapter
 */
export class LocalStorageWeddingAdapter implements StorageAdapter {
  async loadConfig(): Promise<WeddingConfig> {
    if (typeof window === 'undefined') return DEFAULT_WEDDING_CONFIG;

    try {
      const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_WEDDING_CONFIG;
      }

      const parsed = JSON.parse(raw) as Partial<WeddingConfig>;
      const validation = validateWeddingConfig(parsed);

      if (!validation.valid) {
        console.warn('Wedding config failed validation, falling back to defaults with migration:', validation.errors);
        return migrateConfig(parsed);
      }

      return migrateConfig(parsed);
    } catch (err) {
      console.error('Failed to read config from localStorage, using defaults:', err);
      return DEFAULT_WEDDING_CONFIG;
    }
  }

  async saveConfig(config: WeddingConfig): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const toSave = {
        ...config,
        lastUpdatedISO: new Date().toISOString(),
      };
      const serialized = JSON.stringify(toSave);

      // Create backup copy of previous config
      const prev = window.localStorage.getItem(CONFIG_STORAGE_KEY);
      if (prev) {
        window.localStorage.setItem(BACKUP_STORAGE_KEY, prev);
      }

      window.localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      console.error('Failed to save config to localStorage:', err);
      return false;
    }
  }

  async resetConfig(): Promise<WeddingConfig> {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(CONFIG_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG));
  }

  async clearAllLocalData(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(CONFIG_STORAGE_KEY);
        window.localStorage.removeItem(BACKUP_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }
}

export const localWeddingStorage = new LocalStorageWeddingAdapter();

/**
 * Export configuration as a downloadable JSON file
 */
export function exportConfigAsJson(config: WeddingConfig): void {
  const safeConfig = { ...config };
  const jsonStr = JSON.stringify(safeConfig, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `rahul-radhika-wedding-config-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an imported configuration file
 */
export async function parseImportedConfigFile(
  file: File
): Promise<{ success: boolean; config?: WeddingConfig; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const validation = validateWeddingConfig(parsed);

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid backup file: ${validation.errors.join('; ')}`,
      };
    }

    const migrated = migrateConfig(parsed);
    return { success: true, config: migrated };
  } catch (err) {
    return {
      success: false,
      error: `Failed to read JSON file: ${err instanceof Error ? err.message : 'Invalid format'}`,
    };
  }
}
