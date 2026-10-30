/**
 * Media & Storage Foundation for Wedding Media Assets
 * 
 * Supports Supabase Storage with local IndexedDB fallback.
 * Enforces strict file size limits (15MB image, 25MB audio), MIME type verification,
 * durable IndexedDB references, and object URL cleanup.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { indexedDbMedia } from './indexedDbMedia';

export const MEDIA_BUCKET = 'wedding-media';
export const MEMORIES_BUCKET = 'wedding-memories';

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/gif',
];

export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
];

// Active object URL registry to prevent memory leaks
const activeObjectUrls = new Set<string>();

/**
 * Creates and tracks an object URL for cleanup
 */
export function createTrackedObjectURL(blobOrFile: Blob | File): string {
  if (typeof window === 'undefined') return '';
  const url = URL.createObjectURL(blobOrFile);
  activeObjectUrls.add(url);
  return url;
}

/**
 * Revokes a tracked object URL
 */
export function revokePreviewUrl(url?: string | null): void {
  if (!url) return;
  if (typeof window !== 'undefined' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
      activeObjectUrls.delete(url);
    } catch {
      // Ignore
    }
  }
}

/**
 * Revokes all active preview object URLs
 */
export function revokeAllPreviewUrls(): void {
  if (typeof window === 'undefined') return;
  activeObjectUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  });
  activeObjectUrls.clear();
}

export type MediaErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME_TYPE'
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR';

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: MediaErrorCode;
}

export interface UploadMediaResult {
  success: boolean;
  url: string;
  storagePath?: string;
  durableRef?: string;
  isLocalOnly: boolean;
  mimeType: string;
  fileSize: number;
  error?: string;
  errorCode?: MediaErrorCode;
}

/**
 * Validates file size and MIME type strictly
 */
export function validateMediaFile(
  file: File,
  type: 'image' | 'audio'
): MediaValidationResult {
  if (type === 'image') {
    const isImageMime = ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase());
    const isImageExt = Boolean(file.name.match(/\.(jpe?g|png|webp|heic|gif)$/i));
    if (!isImageMime && !isImageExt) {
      return {
        valid: false,
        error: `Unsupported image format (${file.type || 'unknown'}). Allowed: JPG, PNG, WEBP, HEIC, GIF`,
        errorCode: 'INVALID_MIME_TYPE',
      };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return {
        valid: false,
        error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 15MB limit.`,
        errorCode: 'FILE_TOO_LARGE',
      };
    }
  } else if (type === 'audio') {
    const isAudioMime = ALLOWED_AUDIO_MIMES.includes(file.type.toLowerCase());
    const isAudioExt = Boolean(file.name.match(/\.(mp3|m4a|wav|ogg|aac)$/i));
    if (!isAudioMime && !isAudioExt) {
      return {
        valid: false,
        error: `Unsupported audio format (${file.type || 'unknown'}). Allowed: MP3, M4A, WAV, OGG, AAC.`,
        errorCode: 'INVALID_MIME_TYPE',
      };
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return {
        valid: false,
        error: `Audio file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`,
        errorCode: 'FILE_TOO_LARGE',
      };
    }
  }

  return { valid: true };
}

/**
 * Resolves a persistent media reference (HTTP URL, relative path, or indexeddb:// URL)
 * into a renderable URL string.
 */
export async function resolveMediaUrl(urlOrRef?: string | null): Promise<string> {
  if (!urlOrRef) return '';

  // IndexedDB durable reference
  if (urlOrRef.startsWith('indexeddb://')) {
    const id = urlOrRef.replace('indexeddb://', '');
    const liveUrl = await indexedDbMedia.getMediaUrl(id);
    return liveUrl || '';
  }

  return urlOrRef;
}

/**
 * Upload an image or audio file with durable cloud or IndexedDB persistence.
 */
export async function uploadWeddingMedia(
  file: File,
  category: 'couple' | 'venue' | 'gallery' | 'audio' | 'family',
  bucket: string = MEDIA_BUCKET
): Promise<UploadMediaResult> {
  const isAudio = category === 'audio';
  const validation = validateMediaFile(file, isAudio ? 'audio' : 'image');
  if (!validation.valid) {
    return {
      success: false,
      url: '',
      isLocalOnly: true,
      mimeType: file.type,
      fileSize: file.size,
      error: validation.error,
      errorCode: validation.errorCode,
    };
  }

  const timestamp = Date.now();
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
  const storagePath = `${category}/${timestamp}_${sanitizedName}`;

  // 1. Supabase Storage upload (when configured and authorized)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '31536000',
          upsert: false,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath);

        return {
          success: true,
          url: publicData.publicUrl,
          storagePath,
          durableRef: publicData.publicUrl,
          isLocalOnly: false,
          mimeType: file.type,
          fileSize: file.size,
        };
      }

      console.warn('Supabase storage upload notice, falling back to IndexedDB:', error?.message);
    } catch (err) {
      console.warn('Supabase storage network error, falling back to IndexedDB:', err);
    }
  }

  // 2. Durable Local fallback via IndexedDB
  try {
    const localId = `local_${category}_${timestamp}`;
    await indexedDbMedia.saveMedia(localId, file, category, file.name);
    const durableRef = `indexeddb://${localId}`;
    const liveUrl = createTrackedObjectURL(file);

    return {
      success: true,
      url: liveUrl,
      storagePath: localId,
      durableRef,
      isLocalOnly: true,
      mimeType: file.type,
      fileSize: file.size,
      error: isSupabaseConfigured
        ? 'Saved locally to IndexedDB (cloud storage was unavailable or unauthenticated).'
        : undefined,
    };
  } catch (err) {
    return {
      success: false,
      url: '',
      isLocalOnly: true,
      mimeType: file.type,
      fileSize: file.size,
      error: `Failed to store media in IndexedDB: ${err instanceof Error ? err.message : 'Unknown error'}`,
      errorCode: 'STORAGE_ERROR',
    };
  }
}
