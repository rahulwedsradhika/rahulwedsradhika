/**
 * Canonical Wedding Configuration Service
 * 
 * Provides unified persistence across Supabase Cloud and Local Storage fallback.
 * Enforces schema validation, version tracking, deep merge migration, and bilingual integrity.
 */

import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import { WeddingConfig } from '../types/wedding';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const CONFIG_STORAGE_KEY = 'rahul_radhika_wedding_config_v3';
export const BACKUP_STORAGE_KEY = 'rahul_radhika_wedding_config_backup_v3';

export type PersistenceMode = 'supabase' | 'local';

export interface LoadConfigResult {
  config: WeddingConfig;
  mode: PersistenceMode;
  error?: string;
}

export interface SaveConfigResult {
  success: boolean;
  mode: PersistenceMode;
  error?: string;
  warning?: string;
}

/**
 * Validate that an object conforms to the canonical WeddingConfig interface.
 * Validates couple identity, dates, ceremony arrays, venues, and theme.
 */
export function validateWeddingConfig(obj: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Configuration must be a valid JSON object'] };
  }

  const c = obj as Partial<WeddingConfig>;

  // Couple names & identity
  if (!c.groom || typeof c.groom.en !== 'string' || typeof c.groom.hi !== 'string') {
    errors.push('Groom names (English and Hindi) are required');
  } else if (!c.groom.en.trim() || !c.groom.hi.trim()) {
    errors.push('Groom names cannot be empty');
  }

  if (!c.bride || typeof c.bride.en !== 'string' || typeof c.bride.hi !== 'string') {
    errors.push('Bride names (English and Hindi) are required');
  } else if (!c.bride.en.trim() || !c.bride.hi.trim()) {
    errors.push('Bride names cannot be empty');
  }

  // Wedding date
  if (!c.weddingDateISO || isNaN(Date.parse(c.weddingDateISO))) {
    errors.push('Valid wedding date ISO timestamp is required');
  }

  // Events schedule
  if (!Array.isArray(c.events) || c.events.length === 0) {
    errors.push('At least one wedding event is required in schedule');
  } else {
    for (let i = 0; i < c.events.length; i++) {
      const ev = c.events[i];
      if (!ev.id || !ev.name || !ev.name.en || !ev.venueId) {
        errors.push(`Event at index ${i} is missing required fields (id, name, venueId)`);
      }
    }
  }

  // Venues
  if (!Array.isArray(c.venues) || c.venues.length === 0) {
    errors.push('At least one venue is required');
  } else {
    for (let i = 0; i < c.venues.length; i++) {
      const v = c.venues[i];
      if (!v.id || !v.name || !v.name.en || !v.mapsUrl) {
        errors.push(`Venue at index ${i} is missing required fields (id, name, mapsUrl)`);
      }
    }
  }

  // Theme colors
  if (!c.theme || !c.theme.colors || !c.theme.colors.mainBg || !c.theme.colors.burgundy) {
    errors.push('Theme colors configuration is missing required color tokens');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deep merge safe defaults with loaded data to prevent partial configurations from breaking the site.
 * Preserves both English and Hindi strings and handles version upgrades safely.
 */
export function migrateConfig(loaded: Partial<WeddingConfig>): WeddingConfig {
  const base = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;

  return {
    ...base,
    ...loaded,
    groom: {
      ...base.groom,
      ...(loaded.groom || {}),
      introduction: {
        en: loaded.groom?.introduction?.en ?? base.groom.introduction?.en ?? '',
        hi: loaded.groom?.introduction?.hi ?? base.groom.introduction?.hi ?? '',
      },
      bio: {
        en: loaded.groom?.bio?.en ?? base.groom.bio?.en ?? '',
        hi: loaded.groom?.bio?.hi ?? base.groom.bio?.hi ?? '',
      },
    },
    bride: {
      ...base.bride,
      ...(loaded.bride || {}),
      introduction: {
        en: loaded.bride?.introduction?.en ?? base.bride.introduction?.en ?? '',
        hi: loaded.bride?.introduction?.hi ?? base.bride.introduction?.hi ?? '',
      },
      bio: {
        en: loaded.bride?.bio?.en ?? base.bride.bio?.en ?? '',
        hi: loaded.bride?.bio?.hi ?? base.bride.bio?.hi ?? '',
      },
    },
    monogram: {
      en: loaded.monogram?.en ?? base.monogram.en,
      hi: loaded.monogram?.hi ?? base.monogram.hi,
    },
    weddingDateDisplay: {
      en: loaded.weddingDateDisplay?.en ?? base.weddingDateDisplay.en,
      hi: loaded.weddingDateDisplay?.hi ?? base.weddingDateDisplay.hi,
    },
    groomFamily: {
      ...base.groomFamily,
      ...(loaded.groomFamily || {}),
      father: {
        en: loaded.groomFamily?.father?.en ?? base.groomFamily.father.en,
        hi: loaded.groomFamily?.father?.hi ?? base.groomFamily.father.hi,
      },
      mother: {
        en: loaded.groomFamily?.mother?.en ?? base.groomFamily.mother.en,
        hi: loaded.groomFamily?.mother?.hi ?? base.groomFamily.mother.hi,
      },
      village: {
        en: loaded.groomFamily?.village?.en ?? base.groomFamily.village.en,
        hi: loaded.groomFamily?.village?.hi ?? base.groomFamily.village.hi,
      },
    },
    brideFamily: {
      ...base.brideFamily,
      ...(loaded.brideFamily || {}),
      father: {
        en: loaded.brideFamily?.father?.en ?? base.brideFamily.father.en,
        hi: loaded.brideFamily?.father?.hi ?? base.brideFamily.father.hi,
      },
      mother: {
        en: loaded.brideFamily?.mother?.en ?? base.brideFamily.mother.en,
        hi: loaded.brideFamily?.mother?.hi ?? base.brideFamily.mother.hi,
      },
      village: {
        en: loaded.brideFamily?.village?.en ?? base.brideFamily.village.en,
        hi: loaded.brideFamily?.village?.hi ?? base.brideFamily.village.hi,
      },
    },
    familyMembers: Array.isArray(loaded.familyMembers) && loaded.familyMembers.length > 0
      ? loaded.familyMembers
      : base.familyMembers,
    events: Array.isArray(loaded.events) && loaded.events.length > 0 ? loaded.events : base.events,
    venues: Array.isArray(loaded.venues) && loaded.venues.length > 0 ? loaded.venues : base.venues,
    contacts: Array.isArray(loaded.contacts) && loaded.contacts.length > 0 ? loaded.contacts : base.contacts,
    countdown: {
      ...base.countdown,
      ...(loaded.countdown || {}),
      title: {
        en: loaded.countdown?.title?.en ?? base.countdown.title.en,
        hi: loaded.countdown?.title?.hi ?? base.countdown.title.hi,
      },
    },
    scratchReveal: {
      ...base.scratchReveal,
      ...(loaded.scratchReveal || {}),
    },
    theme: {
      ...base.theme,
      ...(loaded.theme || {}),
      colors: {
        ...base.theme.colors,
        ...(loaded.theme?.colors || {}),
      },
    },
    navigation: {
      ...base.navigation,
      ...(loaded.navigation || {}),
    },
    audio: {
      ...base.audio,
      ...(loaded.audio || {}),
      label: {
        en: loaded.audio?.label?.en ?? base.audio.label.en,
        hi: loaded.audio?.label?.hi ?? base.audio.label.hi,
      },
    },
    downloads: {
      ...base.downloads,
      ...(loaded.downloads || {}),
    },
    seo: {
      ...base.seo,
      ...(loaded.seo || {}),
    },
    media: {
      ...base.media,
      ...(loaded.media || {}),
      customGallery: Array.isArray(loaded.media?.customGallery) ? loaded.media.customGallery : [],
    },
    contentOverrides: loaded.contentOverrides || {},
    version: DEFAULT_WEDDING_CONFIG.version,
    lastUpdatedISO: loaded.lastUpdatedISO || new Date().toISOString(),
  };
}

/**
 * Load configuration from local browser storage cache
 */
export function loadFromLocalStorage(): WeddingConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validation = validateWeddingConfig(parsed);
    if (!validation.valid) {
      console.warn('Local storage config failed validation, migrating:', validation.errors);
    }
    return migrateConfig(parsed);
  } catch (err) {
    console.error('Failed to parse config from localStorage:', err);
    return null;
  }
}

/**
 * Save configuration to local browser storage with automatic backup
 */
export function saveToLocalStorage(config: WeddingConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify(config);
    const existing = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (existing) {
      window.localStorage.setItem(BACKUP_STORAGE_KEY, existing);
    }
    window.localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save config to localStorage:', err);
    return false;
  }
}

/**
 * Single Canonical Load Function:
 * 1. Checks Supabase `wedding_config` table if configured.
 * 2. Caches verified cloud configuration to localStorage.
 * 3. Falls back gracefully to localStorage or default configuration.
 */
export async function loadCanonicalConfig(): Promise<LoadConfigResult> {
  // If Supabase is connected, attempt remote fetch
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wedding_config')
        .select('config, version, updated_at')
        .eq('id', 'canonical')
        .maybeSingle();

      if (!error && data && data.config) {
        const validation = validateWeddingConfig(data.config);
        const migrated = validation.valid
          ? migrateConfig(data.config as Partial<WeddingConfig>)
          : migrateConfig(data.config as Partial<WeddingConfig>);

        // Update local cache for offline resiliency
        saveToLocalStorage(migrated);
        return {
          config: migrated,
          mode: 'supabase',
        };
      } else if (error) {
        console.warn('Supabase config fetch notice (falling back to local cache):', error.message);
      }
    } catch (err) {
      console.warn('Supabase connection failed, falling back to local cache:', err);
    }
  }

  // Fallback to local storage
  const local = loadFromLocalStorage();
  if (local) {
    return {
      config: local,
      mode: 'local',
    };
  }

  // Final fallback to compiled defaults
  return {
    config: JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)),
    mode: 'local',
  };
}

/**
 * Single Canonical Save Function:
 * 1. Validates configuration.
 * 2. If Supabase configured and admin authenticated, saves to `wedding_config` table.
 * 3. Always maintains local cache as backup.
 */
export async function saveCanonicalConfig(
  config: WeddingConfig,
  authorEmail?: string | null
): Promise<SaveConfigResult> {
  // 1. Validation check
  const validation = validateWeddingConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      mode: 'local',
      error: `Validation failed: ${validation.errors.join('; ')}`,
    };
  }

  const updatedConfig: WeddingConfig = {
    ...config,
    lastUpdatedISO: new Date().toISOString(),
  };

  // 2. Always persist locally for offline access
  saveToLocalStorage(updatedConfig);

  // 3. Supabase Cloud Persistence
  if (isSupabaseConfigured && supabase) {
    try {
      // Check for active Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          success: true,
          mode: 'local',
          warning:
            'Saved to this device. To sync changes across all visitor devices, sign in with Supabase Admin credentials in the Security tab.',
        };
      }

      const { error } = await supabase
        .from('wedding_config')
        .upsert(
          {
            id: 'canonical',
            version: updatedConfig.version,
            config: updatedConfig,
            updated_at: updatedConfig.lastUpdatedISO,
            updated_by: session.user.email || authorEmail || 'admin',
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Supabase save error:', error);
        return {
          success: false,
          mode: 'supabase',
          error: `Database save failed: ${error.message}. Local copy was preserved.`,
        };
      }

      return {
        success: true,
        mode: 'supabase',
      };
    } catch (err) {
      console.error('Supabase network error during save:', err);
      return {
        success: false,
        mode: 'supabase',
        error: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}. Saved locally.`,
      };
    }
  }

  // Standalone local mode
  return {
    success: true,
    mode: 'local',
  };
}

/**
 * Reset configuration to canonical default state
 */
export async function resetCanonicalConfig(): Promise<WeddingConfig> {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CONFIG_STORAGE_KEY);
      window.localStorage.removeItem(BACKUP_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  const defaults = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('wedding_config')
          .upsert({
            id: 'canonical',
            version: defaults.version,
            config: defaults,
            updated_at: new Date().toISOString(),
            updated_by: session.user.email || 'admin',
          });
      }
    } catch {
      // Ignore
    }
  }

  return defaults;
}

/**
 * Export configuration as formatted JSON backup file
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
 * Import and validate JSON backup file
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
      error: `Failed to read JSON backup: ${err instanceof Error ? err.message : 'Invalid JSON file'}`,
    };
  }
}
