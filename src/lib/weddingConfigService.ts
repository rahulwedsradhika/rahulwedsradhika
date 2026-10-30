/**
 * Canonical Wedding Configuration Service
 * 
 * Provides unified persistence across Supabase Cloud and Local Storage fallback.
 * Enforces schema validation, version tracking, deep merge migration, and bilingual integrity.
 * Strictly reports typed save outcomes, error codes, and audit details.
 */

import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import { WeddingConfig } from '../types/wedding';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { resolveMediaUrl } from './mediaStorage';


export const CONFIG_STORAGE_KEY = 'rahul_radhika_wedding_config_v3';
export const BACKUP_STORAGE_KEY = 'rahul_radhika_wedding_config_backup_v3';

export type PersistenceMode = 'supabase' | 'local';
export type SaveConfigTarget = 'supabase' | 'local_only' | 'none';

export type SaveConfigErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'INVALID_CONFIG'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'UNKNOWN';

export interface LoadConfigResult {
  config: WeddingConfig;
  mode: PersistenceMode;
  error?: string;
}

export interface SaveConfigResult {
  success: boolean;
  target: SaveConfigTarget;
  mode: PersistenceMode;
  error?: string;
  errorCode?: SaveConfigErrorCode;
  warning?: string;
  savedAt: string;
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

export interface LocalStorageWriteResult {
  success: boolean;
  error?: string;
  isQuotaExceeded?: boolean;
}

/**
 * Save configuration to local browser storage with automatic backup and quota detection.
 */
export function saveToLocalStorage(config: WeddingConfig): LocalStorageWriteResult {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window is not defined' };
  }

  try {
    const serialized = JSON.stringify(config);
    const existing = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (existing) {
      window.localStorage.setItem(BACKUP_STORAGE_KEY, existing);
    }
    window.localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22);
    console.error('Failed to save config to localStorage:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Local storage write failed',
      isQuotaExceeded: isQuota,
    };
  }
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
 * Rehydrates any local IndexedDB media references stored in configuration.
 */
export async function rehydrateLocalMedia(config: WeddingConfig): Promise<WeddingConfig> {
  const media = { ...config.media };
  let changed = false;

  if (media.couplePortrait?.startsWith('indexeddb://')) {
    const resolved = await resolveMediaUrl(media.couplePortrait);
    if (resolved) {
      media.couplePortrait = resolved;
      changed = true;
    }
  }

  if (media.venueCourtyard?.startsWith('indexeddb://')) {
    const resolved = await resolveMediaUrl(media.venueCourtyard);
    if (resolved) {
      media.venueCourtyard = resolved;
      changed = true;
    }
  }

  return changed ? { ...config, media } : config;
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
        const migrated = migrateConfig(data.config as Partial<WeddingConfig>);
        const rehydrated = await rehydrateLocalMedia(migrated);

        // Update local cache for offline resiliency
        saveToLocalStorage(rehydrated);
        return {
          config: rehydrated,
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
    const rehydrated = await rehydrateLocalMedia(local);
    return {
      config: rehydrated,
      mode: 'local',
    };
  }

  // Final fallback to compiled defaults
  const defaults = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
  return {
    config: defaults,
    mode: 'local',
  };
}

/**
 * Single Canonical Save Function:
 * 1. Validates configuration.
 * 2. Saves local backup to localStorage, checking quota limits.
 * 3. If Supabase configured & authenticated admin, upserts to `wedding_config` table.
 * 4. Returns typed, granular SaveConfigResult.
 */
export async function saveCanonicalConfig(
  config: WeddingConfig,
  authorEmail?: string | null
): Promise<SaveConfigResult> {
  const savedAt = new Date().toISOString();

  // 1. Validation check
  const validation = validateWeddingConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      target: 'none',
      mode: 'local',
      error: `Validation failed: ${validation.errors.join('; ')}`,
      errorCode: 'INVALID_CONFIG',
      savedAt,
    };
  }

  const updatedConfig: WeddingConfig = {
    ...config,
    lastUpdatedISO: savedAt,
  };

  // 2. Persist locally for offline access & safety
  const localResult = saveToLocalStorage(updatedConfig);

  // 3. Supabase Cloud Persistence
  if (isSupabaseConfigured && supabase) {
    try {
      // Check for active Supabase Auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Not authenticated
        if (Boolean(import.meta.env.DEV)) {
          return {
            success: localResult.success,
            target: localResult.success ? 'local_only' : 'none',
            mode: 'local',
            warning: 'Unauthenticated in Supabase. Saved to local storage only in development mode.',
            errorCode: 'UNAUTHENTICATED',
            error: localResult.success ? undefined : 'Unauthenticated and local storage failed.',
            savedAt,
          };
        } else {
          return {
            success: false,
            target: 'none',
            mode: 'local',
            error: 'Authentication required. Please sign in with an authorized wedding admin account.',
            errorCode: 'UNAUTHENTICATED',
            savedAt,
          };
        }
      }

      // Authenticated: Upsert to canonical config row
      const { error: upsertError } = await supabase
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

      if (upsertError) {
        console.error('Supabase save error:', upsertError);
        const isForbidden =
          upsertError.code === '42501' ||
          upsertError.message?.toLowerCase().includes('violates row-level security') ||
          upsertError.message?.toLowerCase().includes('denied');

        const errorCode: SaveConfigErrorCode = isForbidden ? 'FORBIDDEN' : 'NETWORK_ERROR';

        return {
          success: false,
          target: localResult.success ? 'local_only' : 'none',
          mode: 'supabase',
          error: `Database save failed (${upsertError.message}). ${
            localResult.success ? 'Local copy preserved.' : 'Local copy also failed.'
          }`,
          errorCode,
          savedAt,
        };
      }

      return {
        success: true,
        target: 'supabase',
        mode: 'supabase',
        savedAt,
      };
    } catch (err) {
      console.error('Supabase network error during save:', err);
      return {
        success: false,
        target: localResult.success ? 'local_only' : 'none',
        mode: 'supabase',
        error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}. ${
          localResult.success ? 'Saved locally.' : 'Local storage also failed.'
        }`,
        errorCode: 'NETWORK_ERROR',
        savedAt,
      };
    }
  }

  // 4. Standalone local mode (No Supabase configured)
  if (localResult.success) {
    return {
      success: true,
      target: 'local_only',
      mode: 'local',
      warning: Boolean(import.meta.env.DEV)
        ? 'Running in local dev mode. Saved to browser storage.'
        : undefined,
      savedAt,
    };
  }

  return {
    success: false,
    target: 'none',
    mode: 'local',
    error: localResult.isQuotaExceeded
      ? 'Browser storage quota exceeded. Unable to save configuration.'
      : (localResult.error || 'Failed to save configuration to local storage.'),
    errorCode: localResult.isQuotaExceeded ? 'STORAGE_QUOTA_EXCEEDED' : 'UNKNOWN',
    savedAt,
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
