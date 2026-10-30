/**
 * Canonical Data Architecture & Security Test Suite
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
import { validateMediaFile, MAX_PHOTO_BYTES } from '../lib/mediaStorage';
import {
  getAdminAuthState,
  verifyUserAdminRole,
  loginAdminSupabase,
} from '../lib/authService';
import { WeddingConfig } from '../types/wedding';
import { User } from '@supabase/supabase-js';

describe('Phase 2 Canonical Data Architecture & Security', () => {
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
      // Bride names preserved from default base
      expect(migrated.bride.en).toBe(DEFAULT_WEDDING_CONFIG.bride.en);
      expect(migrated.bride.hi).toBe(DEFAULT_WEDDING_CONFIG.bride.hi);
      // Venues and events preserved
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

  describe('3. Media & Storage Validation', () => {
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

    it('accepts valid MP3 and M4A audio under 25MB', () => {
      const fakeMp3 = new File(['fake audio'], 'shehnai.mp3', { type: 'audio/mpeg' });
      expect(validateMediaFile(fakeMp3, 'audio').valid).toBe(true);
    });
  });

  describe('4. Persistence Service & Error Handling', () => {
    it('saveCanonicalConfig rejects invalid config with descriptive error', async () => {
      const invalidConfig = {} as unknown as WeddingConfig;
      const res = await saveCanonicalConfig(invalidConfig);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Validation failed');
    });

    it('loadCanonicalConfig returns safe fallback in headless environment', async () => {
      const res = await loadCanonicalConfig();
      expect(res.config).toBeDefined();
      expect(typeof res.config.groom.en).toBe('string');
      expect(typeof res.config.bride.hi).toBe('string');
      expect(['supabase', 'local']).toContain(res.mode);
    });
  });

  describe('5. Admin Authorization & Passkey Removal', () => {
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

  describe('6. RLS Migration Static Analysis Policy Verification', () => {
    it('supabase_canonical_schema.sql explicitly drops all legacy permissive policies', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      const requiredDrops = [
        'Admins can view wedding_admins',
        'Public can read wedding_config',
        'Only authenticated admins can modify wedding_config',
        'Public can view approved memories only',
        'Authenticated admins can view all memories',
        'Guests can upload pending memories',
        'Only authenticated admins can update memories',
        'Only authenticated admins can delete memories',
        'Admins full access to memories',
        'Allow public read approved memories',
        'Allow guest upload pending memory',
        'Allow admin full access memories',
        'Public can read approved wishes',
        'Public read approved wishes',
        'Admin can read all wishes',
        'Public can submit wish',
        'Admin can update or delete wishes',
        'Admins manage wishes',
        'Public view wedding-media',
        'Public can view wedding-media',
        'Admins manage wedding-media',
        'Only authenticated admins can manage wedding-media',
        'Public view wedding-memories',
        'Public can view wedding-memories',
        'Guests can upload to pending in wedding-memories',
        'Admins can manage wedding-memories',
      ];

      for (const policyName of requiredDrops) {
        expect(sql).toContain(`DROP POLICY IF EXISTS "${policyName}"`);
      }
    });

    it('supabase_canonical_schema.sql enforces public.is_wedding_admin(auth.uid()) helper', () => {
      const schemaPath = path.resolve(process.cwd(), 'supabase_canonical_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      expect(sql).toContain('CREATE OR REPLACE FUNCTION public.is_wedding_admin');
      expect(sql).toContain('SECURITY DEFINER');
      expect(sql).toContain('is_wedding_admin(auth.uid())');
    });
  });
});
