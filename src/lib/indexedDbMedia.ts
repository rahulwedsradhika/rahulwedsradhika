/**
 * IndexedDB Local Media Storage
 * Safely persists uploaded photos, audio, and documents locally without
 * exceeding browser localStorage limits or storing huge base64 strings.
 */

const DB_NAME = 'rahul_radhika_wedding_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

export interface StoredMediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  blob: Blob;
  category: string;
  createdAt: string;
}

class IndexedDbMediaManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private urlCache: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save an uploaded file as a Blob in IndexedDB.
   * Returns a local object URL suitable for <img> src or <audio> src.
   */
  async saveMedia(
    id: string,
    file: File | Blob,
    category = 'general',
    filename?: string
  ): Promise<{ id: string; url: string; size: number; mimeType: string }> {
    const db = await this.getDB();
    const item: StoredMediaItem = {
      id,
      filename: filename || (file instanceof File ? file.name : `${id}.bin`),
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      blob: file,
      category,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => {
        // Revoke previous URL if cached
        const prevUrl = this.urlCache.get(id);
        if (prevUrl) {
          try {
            URL.revokeObjectURL(prevUrl);
          } catch {
            // Ignore
          }
        }
        const url = URL.createObjectURL(file);
        this.urlCache.set(id, url);

        resolve({
          id,
          url,
          size: item.size,
          mimeType: item.mimeType,
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get an object URL for a stored media item.
   */
  async getMediaUrl(id: string): Promise<string | null> {
    if (this.urlCache.has(id)) {
      return this.urlCache.get(id)!;
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          const item = request.result as StoredMediaItem | undefined;
          if (item && item.blob) {
            const url = URL.createObjectURL(item.blob);
            this.urlCache.set(id, url);
            resolve(url);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete a media item.
   */
  async deleteMedia(id: string): Promise<boolean> {
    const prevUrl = this.urlCache.get(id);
    if (prevUrl) {
      try {
        URL.revokeObjectURL(prevUrl);
      } catch {
        // Ignore
      }
      this.urlCache.delete(id);
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * List all stored media metadata.
   */
  listMedia(): Promise<Omit<StoredMediaItem, 'blob'>[]> {
    return this.listAllMedia();
  }

  async listAllMedia(): Promise<Omit<StoredMediaItem, 'blob'>[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const items = (request.result as StoredMediaItem[]).map((i) => ({
            id: i.id,
            filename: i.filename,
            mimeType: i.mimeType,
            size: i.size,
            category: i.category,
            createdAt: i.createdAt,
          }));
          resolve(items);
        };

        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Clear all stored media in IndexedDB.
   */
  async clearAllMedia(): Promise<void> {
    this.urlCache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore
      }
    });
    this.urlCache.clear();

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch {
      // Ignore
    }
  }
}

export const localMediaStorage = new IndexedDbMediaManager();
export const indexedDbMedia = localMediaStorage;
