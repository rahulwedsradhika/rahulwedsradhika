/**
 * Storage & Migration Bridge for Wedding Configuration
 * Re-exports and delegates to the canonical weddingConfigService.
 */

export {
  validateWeddingConfig,
  migrateConfig,
  exportConfigAsJson,
  parseImportedConfigFile,
  loadCanonicalConfig,
  saveCanonicalConfig,
  resetCanonicalConfig,
  loadFromLocalStorage,
  saveToLocalStorage,
  CONFIG_STORAGE_KEY,
  BACKUP_STORAGE_KEY,
} from './weddingConfigService';

import { WeddingConfig } from '../types/wedding';
import {
  loadCanonicalConfig,
  saveCanonicalConfig,
  resetCanonicalConfig,
  CONFIG_STORAGE_KEY,
  BACKUP_STORAGE_KEY,
} from './weddingConfigService';

export interface StorageAdapter {
  loadConfig(): Promise<WeddingConfig>;
  saveConfig(config: WeddingConfig): Promise<boolean>;
  resetConfig(): Promise<WeddingConfig>;
}

export class CanonicalWeddingStorageAdapter implements StorageAdapter {
  async loadConfig(): Promise<WeddingConfig> {
    const result = await loadCanonicalConfig();
    return result.config;
  }

  async saveConfig(config: WeddingConfig): Promise<boolean> {
    const result = await saveCanonicalConfig(config);
    return result.success;
  }

  async resetConfig(): Promise<WeddingConfig> {
    return resetCanonicalConfig();
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

export const localWeddingStorage = new CanonicalWeddingStorageAdapter();
