/**
 * Canonical Data Architecture & Security Test Suite
 * Executed via: npm test (vitest run)
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_WEDDING_CONFIG } from '../config/wedding';
import {
  validateWeddingConfig,
  migrateConfig,
  saveCanonicalConfig,
  loadCanonicalConfig,
} from '../lib/weddingConfigService';
import { validateMediaFile, MAX_PHOTO_BYTES } from '../lib/mediaStorage';
import { loginAdminDev } from '../lib/authService';
import { WeddingConfig } from '../types/wedding';

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

    it('loginAdminDev rejects when VITE_ADMIN_PASSKEY environment secret is missing', () => {
      // In test environment without VITE_ADMIN_PASSKEY set, loginAdminDev should fail with explicit message
      const result = loginAdminDev('any-passkey');
      expect(result.success).toBe(false);
      expect(result.error).toContain('VITE_ADMIN_PASSKEY environment variable is not configured');
    });
  });
});
