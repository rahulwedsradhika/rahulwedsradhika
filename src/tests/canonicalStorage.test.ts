/**
 * Canonical Storage Architecture & Provider Contract Test Suite
 * Executed via: npm test (vitest run)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStorageProvider,
  setStorageProvider,
  StorageProvider,
  StorageResult,
  StorageAvailability,
} from '../lib/canonicalStorage';

describe('Phase 3B.1 Canonical Storage Architecture Test Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('rahul_radhika_test_table_v3');
    }
  });

  describe('1. Storage Provider Availability', () => {
    it('returns valid storage availability state', async () => {
      const provider = getStorageProvider();
      const availability: StorageAvailability = await provider.checkAvailability();

      expect(availability).toBeDefined();
      expect(typeof availability.isAvailable).toBe('boolean');
      expect(availability.mode).toBeDefined();
      expect(['local', 'supabase']).toContain(availability.mode);
    });
  });

  describe('2. Local Provider CRUD Operations', () => {
    it('creates and retrieves a record successfully', async () => {
      const provider = getStorageProvider();
      const testRecord = { id: 'test_rec_1', name: 'Test Wedding Guest', attending: true };

      const createRes: StorageResult<typeof testRecord> = await provider.createRecord(
        'test_table',
        testRecord
      );

      expect(createRes.success).toBe(true);
      expect(createRes.data).toEqual(testRecord);
      expect(createRes.mode).toBe('local');

      const getRes = await provider.getRecord<typeof testRecord>('test_table', 'test_rec_1');
      expect(getRes.success).toBe(true);
      expect(getRes.data).toEqual(testRecord);
    });

    it('lists all records from table', async () => {
      const provider = getStorageProvider();
      await provider.createRecord('test_table', { id: 'rec_a', title: 'First' });
      await provider.createRecord('test_table', { id: 'rec_b', title: 'Second' });

      const listRes = await provider.listRecords<{ id: string; title: string }>('test_table');
      expect(listRes.success).toBe(true);
      expect(listRes.data).toBeDefined();
      expect(listRes.data?.length).toBeGreaterThanOrEqual(2);
    });

    it('updates an existing record', async () => {
      const provider = getStorageProvider();
      await provider.createRecord('test_table', { id: 'rec_up_1', status: 'pending' });

      const updateRes = await provider.updateRecord<{ id: string; status: string }>(
        'test_table',
        'rec_up_1',
        { status: 'approved' }
      );

      expect(updateRes.success).toBe(true);
      expect(updateRes.data?.status).toBe('approved');

      const getRes = await provider.getRecord<{ id: string; status: string }>(
        'test_table',
        'rec_up_1'
      );
      expect(getRes.data?.status).toBe('approved');
    });

    it('deletes an existing record', async () => {
      const provider = getStorageProvider();
      await provider.createRecord('test_table', { id: 'rec_del_1', title: 'Delete me' });

      const delRes = await provider.deleteRecord('test_table', 'rec_del_1');
      expect(delRes.success).toBe(true);
      expect(delRes.data).toBe(true);

      const getRes = await provider.getRecord('test_table', 'rec_del_1');
      expect(getRes.success).toBe(true);
      expect(getRes.data).toBeNull();
    });
  });

  describe('3. Custom Provider Injection', () => {
    it('supports custom provider implementation for testing', async () => {
      const customProvider: StorageProvider = {
        async checkAvailability(): Promise<StorageAvailability> {
          return { isAvailable: true, mode: 'local', reason: 'Custom mock' };
        },
        async getRecord<T>(): Promise<StorageResult<T | null>> {
          return { success: true, data: { mock: true } as unknown as T, mode: 'local', savedAt: new Date().toISOString() };
        },
        async listRecords<T>(): Promise<StorageResult<T[]>> {
          return { success: true, data: [{ mock: true }] as unknown as T[], mode: 'local', savedAt: new Date().toISOString() };
        },
        async createRecord<T>(_t: string, r: T): Promise<StorageResult<T>> {
          return { success: true, data: r, mode: 'local', savedAt: new Date().toISOString() };
        },
        async updateRecord<T>(_t: string, _id: string, u: Partial<T>): Promise<StorageResult<T>> {
          return { success: true, data: u as unknown as T, mode: 'local', savedAt: new Date().toISOString() };
        },
        async deleteRecord(): Promise<StorageResult<boolean>> {
          return { success: true, data: true, mode: 'local', savedAt: new Date().toISOString() };
        },
      };

      setStorageProvider(customProvider);
      const active = getStorageProvider();
      const res = await active.getRecord('any', '1');
      expect(res.data).toEqual({ mock: true });

      // Restore default provider
      setStorageProvider(new (getStorageProvider().constructor as any)());
    });
  });
});
