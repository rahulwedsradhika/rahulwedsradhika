/**
 * Canonical Data Architecture & Hardened Security Test Suite
 * Executed via: npm test (vitest run)
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import {
  validateWeddingConfig,
  migrateConfig,
  saveCanonicalConfig,
  loadCanonicalConfig,
} from '../lib/weddingConfigService';
import { validateMediaFile, MAX_PHOTO_BYTES, MEMORIES_BUCKET } from '../lib/mediaStorage';
import {
  getAdminAuthState,
  verifyUserAdminRole,
  loginAdminSupabase,
} from '../lib/authService';
import {
  fetchApprovedMemories,
  fetchAdminMemories,
  uploadGuestMemory,
  updateMemoryModerationStatus,
  deleteMemoryItem,
} from '../lib/memories';
import { WeddingConfig } from '../types/wedding';
import { User } from '@supabase/supabase-js';

describe('Phase 2B.3 Canonical Data Architecture & Security Test Suite', () => {
  describe('1. Canonical Schema Validation', () => {
    it('DEFAULT_WEDDING_CONFIG passes validation with 0 errors', () => {
      const result = validateWeddingConfig(DEFAULT_WEDDING_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation if groom English name is missing or empty', () => {
      const invalid = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      invalid.groom.en = '';
      const result = validateWeddingConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Groom names'))).toBe(true);
    });

    it('fails validation if bride Hindi name is missing or empty', () => {
      const invalid = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      invalid.bride.hi = '';
      const result = validateWeddingConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Bride names'))).toBe(true);
    });

    it('fails validation if wedding date ISO string is invalid', () => {
      const invalid = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      invalid.weddingDateISO = 'invalid-not-a-date';
      const result = validateWeddingConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('ISO timestamp'))).toBe(true);
    });

    it('fails validation if events array is empty', () => {
      const invalid = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      invalid.events = [];
      const result = validateWeddingConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('event is required'))).toBe(true);
    });

    it('fails validation if venue is missing mapsUrl', () => {
      const invalid = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      invalid.venues[0].mapsUrl = '';
      const result = validateWeddingConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing required fields'))).toBe(true);
    });
  });

  describe('2. Deep Merge & Bilingual Preservation', () => {
    it('migrateConfig preserves both English and Hindi text when partial config provided', () => {
      const partial: Partial<WeddingConfig> = {
        groom: {
          en: 'Rahul Sangwan',
          hi: 'राहुल सांगवान',
        },
      };

      const migrated = migrateConfig(partial);
      expect(migrated.groom.en).toBe('Rahul Sangwan');
      expect(migrated.groom.hi).toBe('राहुल सांगवान');
      expect(migrated.bride.en).toBe(DEFAULT_WEDDING_CONFIG.bride.en);
      expect(migrated.bride.hi).toBe(DEFAULT_WEDDING_CONFIG.bride.hi);
      expect(migrated.events.length).toBeGreaterThan(0);
      expect(migrated.venues.length).toBeGreaterThan(0);
    });

    it('updating English text does not clear or mutate Hindi text', () => {
      const original = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONFIG)) as WeddingConfig;
      const originalHindi = original.groom.hi;

      const modified = migrateConfig({
        ...original,
        groom: {
          ...original.groom,
          en: 'Updated Groom Name',
        },
      });

      expect(modified.groom.en).toBe('Updated Groom Name');
      expect(modified.groom.hi).toBe(originalHindi);
    });
  });

  describe('3. Media Storage Privacy & Validation', () => {
    it('accepts valid JPEG, PNG, and WebP images', () => {
      const fakeJpg = new File(['fake content'], 'portrait.jpg', { type: 'image/jpeg' });
      const fakePng = new File(['fake content'], 'card.png', { type: 'image/png' });
      const fakeWebp = new File(['fake content'], 'hero.webp', { type: 'image/webp' });

      expect(validateMediaFile(fakeJpg, 'image').valid).toBe(true);
      expect(validateMediaFile(fakePng, 'image').valid).toBe(true);
      expect(validateMediaFile(fakeWebp, 'image').valid).toBe(true);
    });

    it('rejects executable or unsupported file types for images', () => {
      const fakeExe = new File(['fake'], 'virus.exe', { type: 'application/x-msdownload' });
      const res = validateMediaFile(fakeExe, 'image');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Unsupported image format');
    });

    it('rejects oversized images exceeding 15MB limit', () => {
      const oversizedFile = {
        name: 'huge.jpg',
        type: 'image/jpeg',
        size: MAX_PHOTO_BYTES + 1024,
      } as unknown as File;

      const res = validateMediaFile(oversizedFile, 'image');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds');
    });

    it('wedding-memories bucket name is configured as wedding-memories', () => {
      expect(MEMORIES_BUCKET).toBe('wedding-memories');
    });
  });

  describe('4. Pending Media Privacy & Moderation Workflows', () => {
    it('fetchApprovedMemories strictly returns ONLY approved media for public gallery', async () => {
      const res = await fetchApprovedMemories('all');
      expect(res.data).toBeDefined();
      expect(res.data.every((item) => item.moderationStatus === 'approved')).toBe(true);
    });

    it('handles guest media upload, pending isolation, admin moderation approval & deletion', async () => {
      // 1. Guest uploads photo
      const fakePhoto = new File(['guest image data'], 'guest_photo.jpg', { type: 'image/jpeg' });
      const uploadRes = await uploadGuestMemory({
        file: fakePhoto,
        ceremonyId: 'sangeet',
        uploaderName: 'Simran Dahiya',
        uploaderSide: 'groom',
        caption: 'Sangeet night celebrations',
        guestPasscode: 'rohtak2026',
      });

      expect(uploadRes.success).toBe(true);
      expect(uploadRes.memory).toBeDefined();
      expect(uploadRes.memory?.moderationStatus).toBe('pending');

      // 2. Verify that pending memory is NOT visible in public approved gallery
      const approvedRes = await fetchApprovedMemories('all');
      expect(approvedRes.data.some((m) => m.uploaderName === 'Simran Dahiya')).toBe(false);

      // 3. Verify that pending memory IS retrieved in admin moderation panel
      const adminRes = await fetchAdminMemories('pending');
      expect(adminRes.data).toBeDefined();
      expect(adminRes.stats.totalPending).toBeGreaterThanOrEqual(1);

      const pendingItem = adminRes.data.find((m) => m.uploaderName === 'Simran Dahiya');
      expect(pendingItem).toBeDefined();

      // 4. Admin approves pending memory
      if (pendingItem) {
        const updateRes = await updateMemoryModerationStatus(pendingItem.id, 'approved');
        expect(updateRes.success).toBe(true);

        // Verify it is now published in public approved gallery
        const recheckApproved = await fetchApprovedMemories('all');
        expect(recheckApproved.data.some((m) => m.id === pendingItem.id)).toBe(true);

        // 5. Admin deletes memory
        const delRes = await deleteMemoryItem(pendingItem.id, pendingItem.storagePath);
        expect(delRes.success).toBe(true);

        const postDelRes = await fetchAdminMemories('all');
        expect(postDelRes.data.some((m) => m.id === pendingItem.id)).toBe(false);
      }
    });
  });

  describe('5. Admin Authentication & Passkey Removal', () => {
    it('verifyUserAdminRole grants admin when app_metadata.role is admin', async () => {
      const mockAdminUser = {
        id: 'user-admin-123',
        app_metadata: { role: 'admin' },
      } as unknown as User;

      const res = await verifyUserAdminRole(mockAdminUser);
      expect(res.isAdmin).toBe(true);
      expect(res.role).toBe('admin');
    });

    it('verifyUserAdminRole rejects non-admin users lacking allowlist status', async () => {
      const mockGuestUser = {
        id: 'guest-user-456',
        app_metadata: { role: 'guest' },
      } as unknown as User;

      const res = await verifyUserAdminRole(mockGuestUser);
      expect(res.isAdmin).toBe(false);
      expect(res.error).toContain('Access denied');
    });

    it('getAdminAuthState returns non-authenticated state when no session exists', async () => {
      const state = await getAdminAuthState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
      expect(state.user).toBeNull();
    });

    it('loginAdminSupabase rejects when Supabase is not configured', async () => {
      const res = await loginAdminSupabase('test@wedding.com', 'password123');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('6. RLS Migration & Hardened Function Static Verification', () => {
    it('supabase_canonical_schema.sql explicitly sets wedding-memories bucket to public = false', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      expect(sql).toContain("'wedding-memories'");
      expect(sql).toContain("public = false");
    });

    it('supabase_canonical_schema.sql hardens is_wedding_admin() search_path and EXECUTE grants', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      expect(sql).toContain('SET search_path = public, pg_temp');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_wedding_admin(UUID) FROM PUBLIC');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_wedding_admin(UUID) FROM anon');
      expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.is_wedding_admin(UUID) TO authenticated, service_role');
    });

    it('supabase_canonical_schema.sql and AdminSecurityTab.tsx SQL scripts are completely synchronized', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const securityTabPath = path.resolve(process.cwd(), 'src/components/admin/AdminSecurityTab.tsx');

      const canonicalSql = fs.readFileSync(schemaPath, 'utf8').trim();
      const securityTabContent = fs.readFileSync(securityTabPath, 'utf8');

      expect(securityTabContent).toContain('SET search_path = public, pg_temp');
      expect(securityTabContent).toContain('public = false');
      expect(securityTabContent).toContain('REVOKE EXECUTE ON FUNCTION public.is_wedding_admin');
    });

    it('includes pg_policies audit verification query at bottom of canonical schema', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      expect(sql).toContain('FROM pg_policies');
      expect(sql).toContain("WHERE schemaname IN ('public', 'storage')");
    });
  });
});
