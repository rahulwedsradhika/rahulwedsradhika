import { supabase } from './supabaseClient';

export interface SiteSettings {
  id: string;
  audio_url: string | null;
  audio_path: string | null;
  audio_name: string | null;
  audio_volume: number; // 0 to 1, default 0.7
  audio_loop: boolean; // default true
  audio_start_at: number; // in seconds, default 0
  audio_enabled: boolean; // default true
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'main',
  audio_url: null,
  audio_path: null,
  audio_name: null,
  audio_volume: 0.7,
  audio_loop: true,
  audio_start_at: 0,
  audio_enabled: true,
};

const STORAGE_SETTINGS_KEY = 'wedding_site_settings_v1';

// In-memory cached settings
let currentSettings: SiteSettings = (() => {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Ignore
  }
  return DEFAULT_SITE_SETTINGS;
})();

// Dedicated singleton HTMLAudioElement for zero-latency iOS tap unlock & playback
let audioElement: HTMLAudioElement | null = null;
let fadeInterval: number | null = null;
let isAudioMuted = false;

function getOrCreateAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'auto';
  }
  return audioElement;
}

/**
 * Preload the audio element source as soon as settings are loaded
 */
export function preloadSiteAudio(settings: SiteSettings) {
  if (typeof window === 'undefined') return;
  const audio = getOrCreateAudio();
  if (!audio) return;

  if (settings.audio_enabled && settings.audio_url) {
    if (audio.src !== settings.audio_url) {
      audio.src = settings.audio_url;
      audio.loop = settings.audio_loop;
      audio.load();
    }
  } else {
    audio.src = '';
  }
}

/**
 * Fetch settings from Supabase (or return cached localStorage)
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  // First load from localStorage if available
  try {
    const cached = window.localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (cached) {
      currentSettings = { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cached) };
    }
  } catch {
    // Ignore
  }

  if (!supabase) {
    preloadSiteAudio(currentSettings);
    return currentSettings;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data) {
      currentSettings = {
        id: 'main',
        audio_url: data.audio_url || null,
        audio_path: data.audio_path || null,
        audio_name: data.audio_name || null,
        audio_volume: typeof data.audio_volume === 'number' ? data.audio_volume : 0.7,
        audio_loop: data.audio_loop !== false,
        audio_start_at: typeof data.audio_start_at === 'number' ? data.audio_start_at : 0,
        audio_enabled: data.audio_enabled !== false,
        updated_at: data.updated_at,
      };

      try {
        window.localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(currentSettings));
      } catch {
        // Ignore
      }
    }
  } catch {
    // Offline fallback: keep existing currentSettings
  }

  preloadSiteAudio(currentSettings);
  return currentSettings;
}

/**
 * Save site settings (upserts to Supabase & localStorage)
 */
export async function saveSiteSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  const merged: SiteSettings = {
    ...currentSettings,
    ...updates,
    id: 'main',
    updated_at: new Date().toISOString(),
  };

  currentSettings = merged;

  try {
    window.localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(merged));
  } catch {
    // Ignore
  }

  preloadSiteAudio(merged);

  if (!supabase) {
    return { success: true, data: merged };
  }

  try {
    const { error } = await supabase.from('site_settings').upsert([merged]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: merged };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save settings',
    };
  }
}

/**
 * Upload audio file to Supabase Storage bucket 'invite-audio'
 */
export async function uploadAudioToSupabase(
  file: File,
  oldPath?: string | null
): Promise<{ success: boolean; url?: string; path?: string; name?: string; error?: string }> {
  // 1. Validate file size (max 15MB)
  const MAX_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'Audio file must be under 15 MB' };
  }

  // 2. Validate audio mime type
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm'];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|m4a|aac|ogg|wav|webm)$/i)) {
    return { success: false, error: 'File must be an MP3, M4A, AAC, OGG, or WAV audio file' };
  }

  if (!supabase) {
    // Local mock for preview if Supabase is unconfigured
    const blobUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: blobUrl,
      path: `local-${file.name}`,
      name: file.name,
    };
  }

  try {
    // Remove old file if specified
    if (oldPath && !oldPath.startsWith('local-')) {
      await supabase.storage.from('invite-audio').remove([oldPath]);
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('invite-audio')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'audio/mpeg',
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('invite-audio')
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: storagePath,
      name: file.name,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Remove audio file from Supabase Storage and reset settings
 */
export async function removeAudioFromSupabase(
  path?: string | null
): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  if (path && supabase && !path.startsWith('local-')) {
    try {
      await supabase.storage.from('invite-audio').remove([path]);
    } catch {
      // Ignore
    }
  }

  const updated: Partial<SiteSettings> = {
    audio_url: null,
    audio_path: null,
    audio_name: null,
    audio_enabled: false,
  };

  const res = await saveSiteSettings(updated);
  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
  }
  return res;
}

/**
 * Synchronous playback trigger (MUST be called synchronously in the user's tap event)
 * Automatically ducks under the wax-crack sound for 1.0s, then fades in to target volume over ~1.5s
 */
export function playCustomAudioSynchronous(muted = false): boolean {
  if (typeof window === 'undefined') return false;
  isAudioMuted = muted;

  if (!currentSettings.audio_enabled || !currentSettings.audio_url) {
    return false; // Fall back to synthesized audioSynth
  }

  const audio = getOrCreateAudio();
  if (!audio) return false;

  try {
    if (audio.src !== currentSettings.audio_url) {
      audio.src = currentSettings.audio_url;
    }
    audio.loop = currentSettings.audio_loop;

    // Set initial start time
    if (currentSettings.audio_start_at > 0 && Math.abs(audio.currentTime - currentSettings.audio_start_at) > 1) {
      audio.currentTime = currentSettings.audio_start_at;
    }

    const targetVol = currentSettings.audio_volume;

    if (muted) {
      audio.volume = 0;
    } else {
      // Ducking: start very quiet (0.12) so wax crack is punchy, then fade in over 1.5s
      audio.volume = Math.min(0.12, targetVol * 0.25);
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Retry on next gesture if browser blocked
      });
    }

    // Fade in volume smoothly after 0.8s
    if (!muted) {
      if (fadeInterval) clearInterval(fadeInterval);
      setTimeout(() => {
        const startTime = performance.now();
        const duration = 1500;
        const startVol = audio.volume;

        fadeInterval = window.setInterval(() => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          audio.volume = startVol + (targetVol - startVol) * progress;

          if (progress >= 1) {
            clearInterval(fadeInterval!);
            fadeInterval = null;
          }
        }, 50);
      }, 800);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Pause custom audio
 */
export function stopCustomAudio() {
  if (audioElement) {
    if (fadeInterval) clearInterval(fadeInterval);
    audioElement.pause();
  }
}

/**
 * Set custom audio mute state
 */
export function setCustomAudioMuted(muted: boolean) {
  isAudioMuted = muted;
  if (!audioElement) return;

  if (muted) {
    audioElement.volume = 0;
  } else {
    audioElement.volume = currentSettings.audio_volume;
    if (audioElement.paused && currentSettings.audio_enabled && currentSettings.audio_url) {
      audioElement.play().catch(() => {});
    }
  }
}

/**
 * Returns whether custom audio is currently active & playing
 */
export function isCustomAudioActive(): boolean {
  return Boolean(
    currentSettings.audio_enabled &&
    currentSettings.audio_url &&
    audioElement &&
    !audioElement.paused
  );
}

export function getCurrentSiteSettings(): SiteSettings {
  return currentSettings;
}
