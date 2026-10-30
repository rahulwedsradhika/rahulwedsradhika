/**
 * Media & Storage Foundation for Wedding Media Assets
 * 
 * Supports Supabase Storage with local IndexedDB/Blob URL fallback.
 * Enforces file size limits, MIME type verification, and clean path generation.
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

export interface UploadMediaResult {
  success: boolean;
  url: string;
  storagePath?: string;
  isLocalOnly: boolean;
  mimeType: string;
  fileSize: number;
  error?: string;
}

export function validateMediaFile(
  file: File,
  type: 'image' | 'audio'
): { valid: boolean; error?: string } {
  if (type === 'image') {
    if (!ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported image format (${file.type}). Allowed: JPG, PNG, WEBP, HEIC, GIF`,
      };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return {
        valid: false,
        error: `Image size exceeds ${(MAX_PHOTO_BYTES / (1024 * 1024)).toFixed(0)}MB limit.`,
      };
    }
  } else if (type === 'audio') {
    if (!ALLOWED_AUDIO_MIMES.includes(file.type.toLowerCase()) && !file.name.match(/\.(mp3|m4a|wav|ogg)$/i)) {
      return {
        valid: false,
        error: `Unsupported audio format. Allowed: MP3, M4A, WAV, OGG.`,
      };
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return {
        valid: false,
        error: `Audio file size exceeds ${(MAX_AUDIO_BYTES / (1024 * 1024)).toFixed(0)}MB limit.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Upload an image or audio file
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
    };
  }

  const timestamp = Date.now();
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
  const storagePath = `${category}/${timestamp}_${sanitizedName}`;

  // 1. Supabase Storage upload
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
          isLocalOnly: false,
          mimeType: file.type,
          fileSize: file.size,
        };
      }

      console.warn('Supabase storage upload notice, falling back to local storage:', error?.message);
    } catch (err) {
      console.warn('Supabase storage network error, falling back to local storage:', err);
    }
  }

  // 2. Local fallback via IndexedDB and Object URL
  try {
    const localId = `local_${category}_${timestamp}`;
    await indexedDbMedia.saveMedia(localId, file, category, file.name);
    const objectUrl = URL.createObjectURL(file);

    return {
      success: true,
      url: objectUrl,
      storagePath: localId,
      isLocalOnly: true,
      mimeType: file.type,
      fileSize: file.size,
      error: isSupabaseConfigured
        ? 'Uploaded locally (Cloud storage bucket was unavailable or requires admin login).'
        : undefined,
    };
  } catch (err) {
    return {
      success: false,
      url: '',
      isLocalOnly: true,
      mimeType: file.type,
      fileSize: file.size,
      error: `Failed to store media locally: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
