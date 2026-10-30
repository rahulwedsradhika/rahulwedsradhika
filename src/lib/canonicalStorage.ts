/**
 * Canonical Storage Architecture & Provider Contract
 * 
 * Provides a strongly typed, maintainable storage abstraction separating application/domain
 * services from underlying persistence mechanisms (LocalStorage, IndexedDB, Supabase).
 * Supports local-first development while preparing for future Supabase migration.
 */

export type PersistenceMode = 'supabase' | 'local';

export type StorageErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'INVALID_DATA'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'STORAGE_UNAVAILABLE'
  | 'UNKNOWN';

export interface StorageError {
  code: StorageErrorCode;
  message: string;
  details?: unknown;
}

export interface StorageAvailability {
  isAvailable: boolean;
  mode: PersistenceMode;
  reason?: string;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
  mode: PersistenceMode;
  savedAt: string;
}

/**
 * Canonical Storage Provider Interface
 * Supports asynchronous read, create, update, delete, list, and availability check operations.
 */
export interface StorageProvider {
  getRecord<T>(table: string, id: string): Promise<StorageResult<T | null>>;
  listRecords<T>(table: string, filter?: Record<string, unknown>): Promise<StorageResult<T[]>>;
  createRecord<T>(table: string, record: T): Promise<StorageResult<T>>;
  updateRecord<T>(table: string, id: string, updates: Partial<T>): Promise<StorageResult<T>>;
  deleteRecord(table: string, id: string): Promise<StorageResult<boolean>>;
  checkAvailability(): Promise<StorageAvailability>;
}

import { isSupabaseConfigured, supabase } from './supabaseClient';

// In-memory fallback map for non-browser testing environments (e.g., Vitest SSR)
const memoryFallbackMap = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallbackMap.get(key) || null;
    }
  }
  return memoryFallbackMap.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Fallback
    }
  }
  memoryFallbackMap.set(key, value);
}

/**
 * Local-First Storage Provider Implementation
 * Safely bridges LocalStorage and IndexedDB while maintaining compatibility
 * with future Supabase migration. Gracefully falls back to local storage if remote
 * Supabase calls fail, return query errors, or tables are uninitialized.
 */
class LocalFirstStorageProvider implements StorageProvider {
  async checkAvailability(): Promise<StorageAvailability> {
    const isSupabaseActive = Boolean(isSupabaseConfigured && supabase);
    return {
      isAvailable: true,
      mode: isSupabaseActive ? 'supabase' : 'local',
      reason: isSupabaseActive ? 'Supabase cloud client is active' : 'Running in local-first browser mode',
    };
  }

  async getRecord<T>(table: string, id: string): Promise<StorageResult<T | null>> {
    const savedAt = new Date().toISOString();
    const mode: PersistenceMode = isSupabaseConfigured && supabase ? 'supabase' : 'local';

    if (mode === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return { success: true, data: data as T, mode, savedAt };
        }
      } catch (err) {
        console.warn(`Supabase getRecord exception for ${table}/${id}, falling back to local:`, err);
      }
    }

    // LocalStorage fallback for structured tables
    try {
      const storageKey = `rahul_radhika_${table}_v3`;
      const raw = getStorageItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const found = parsed.find((item: any) => item.id === id);
          return { success: true, data: found || null, mode: 'local', savedAt };
        } else if (parsed && typeof parsed === 'object') {
          return { success: true, data: parsed as T, mode: 'local', savedAt };
        }
      }
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Local storage read failed',
          details: err,
        },
        mode: 'local',
        savedAt,
      };
    }

    return { success: true, data: null, mode: 'local', savedAt };
  }

  async listRecords<T>(table: string, _filter?: Record<string, unknown>): Promise<StorageResult<T[]>> {
    const savedAt = new Date().toISOString();
    const mode: PersistenceMode = isSupabaseConfigured && supabase ? 'supabase' : 'local';

    if (mode === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          return { success: true, data: data as T[], mode, savedAt };
        }
      } catch (err) {
        console.warn(`Supabase listRecords exception for ${table}, falling back to local:`, err);
      }
    }

    try {
      const storageKey = `rahul_radhika_${table}_v3`;
      const raw = getStorageItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          success: true,
          data: Array.isArray(parsed) ? (parsed as T[]) : [parsed as T],
          mode: 'local',
          savedAt,
        };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Local storage list failed',
          details: err,
        },
        mode: 'local',
        savedAt,
      };
    }

    return { success: true, data: [], mode: 'local', savedAt };
  }

  async createRecord<T>(table: string, record: T): Promise<StorageResult<T>> {
    const savedAt = new Date().toISOString();
    const mode: PersistenceMode = isSupabaseConfigured && supabase ? 'supabase' : 'local';

    if (mode === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase.from(table).insert([record as any]).select().single();
        if (!error && data) {
          return { success: true, data: data as T, mode, savedAt };
        }
      } catch (err) {
        console.warn(`Supabase createRecord exception for ${table}, falling back to local:`, err);
      }
    }

    try {
      const storageKey = `rahul_radhika_${table}_v3`;
      const raw = getStorageItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      const updatedList = Array.isArray(list) ? [record, ...list] : [record];
      setStorageItem(storageKey, JSON.stringify(updatedList));

      return { success: true, data: record, mode: 'local', savedAt };
    } catch (err: unknown) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.code === 22);

      return {
        success: false,
        error: {
          code: isQuota ? 'STORAGE_QUOTA_EXCEEDED' : 'STORAGE_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Local record creation failed',
          details: err,
        },
        mode: 'local',
        savedAt,
      };
    }
  }

  async updateRecord<T>(table: string, id: string, updates: Partial<T>): Promise<StorageResult<T>> {
    const savedAt = new Date().toISOString();
    const mode: PersistenceMode = isSupabaseConfigured && supabase ? 'supabase' : 'local';

    if (mode === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase
          .from(table)
          .update(updates as any)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as T, mode, savedAt };
        }
      } catch (err) {
        console.warn(`Supabase updateRecord exception for ${table}/${id}, falling back to local:`, err);
      }
    }

    try {
      const storageKey = `rahul_radhika_${table}_v3`;
      const raw = getStorageItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        let updatedItem: T | undefined;
        const newList = list.map((item: any) => {
          if (item.id === id) {
            updatedItem = { ...item, ...updates };
            return updatedItem;
          }
          return item;
        });
        setStorageItem(storageKey, JSON.stringify(newList));
        if (updatedItem) {
          return { success: true, data: updatedItem, mode: 'local', savedAt };
        }
      }
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Local record update failed',
          details: err,
        },
        mode: 'local',
        savedAt,
      };
    }

    return {
      success: false,
      error: { code: 'INVALID_DATA', message: `Record with id ${id} not found in ${table}` },
      mode: 'local',
      savedAt,
    };
  }

  async deleteRecord(table: string, id: string): Promise<StorageResult<boolean>> {
    const savedAt = new Date().toISOString();
    const mode: PersistenceMode = isSupabaseConfigured && supabase ? 'supabase' : 'local';

    if (mode === 'supabase' && supabase) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
          return { success: true, data: true, mode, savedAt };
        }
      } catch (err) {
        console.warn(`Supabase deleteRecord exception for ${table}/${id}, falling back to local:`, err);
      }
    }

    try {
      const storageKey = `rahul_radhika_${table}_v3`;
      const raw = getStorageItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        const filtered = list.filter((item: any) => item.id !== id);
        setStorageItem(storageKey, JSON.stringify(filtered));
        return { success: true, data: true, mode: 'local', savedAt };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Local record deletion failed',
          details: err,
        },
        mode: 'local',
        savedAt,
      };
    }

    return { success: true, data: true, mode: 'local', savedAt };
  }
}

// Centralized Singleton Provider Instance
let globalStorageProvider: StorageProvider = new LocalFirstStorageProvider();

/**
 * Get the centralized canonical storage provider.
 */
export function getStorageProvider(): StorageProvider {
  return globalStorageProvider;
}

/**
 * Set custom storage provider (useful for testing or future provider injection).
 */
export function setStorageProvider(provider: StorageProvider): void {
  globalStorageProvider = provider;
}
