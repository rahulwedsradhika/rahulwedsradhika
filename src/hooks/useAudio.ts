import { useCallback, useEffect, useState } from 'react';
import { weddingAudio } from '../lib/audioSynth';
import {
  fetchSiteSettings,
  isCustomAudioActive,
  playCustomAudioSynchronous,
  setCustomAudioMuted,
  stopCustomAudio,
} from '../lib/siteAudio';

const STORAGE_KEY = 'wedding_muted';

export interface UseAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
  playDholHit: () => void;
  playDholRoll: () => void;
  playWaxCrack: (volume?: number) => void;
  playTap: () => void;
  unlockAndStart: () => void;
}

export function useAudio(): UseAudioReturn {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Preload site settings on app load
  useEffect(() => {
    fetchSiteSettings();
  }, []);

  // Sync mute state to localStorage & manage audio states
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isMuted));
    } catch {
      // Ignore
    }

    setCustomAudioMuted(isMuted);

    if (isMuted) {
      weddingAudio.stopAmbientLoop(0.8);
    } else if (hasStarted && !isCustomAudioActive()) {
      weddingAudio.startAmbientLoop(0.22);
    }
  }, [isMuted, hasStarted]);

  // Pause music when browser tab is hidden to save battery & data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCustomAudio();
        weddingAudio.stopAmbientLoop(0.4);
      } else if (!isMuted && hasStarted) {
        setCustomAudioMuted(false);
        if (!isCustomAudioActive()) {
          weddingAudio.startAmbientLoop(0.22);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted, hasStarted]);

  const unlockAndStart = useCallback(() => {
    weddingAudio.unlock();
    setHasStarted(true);

    // 1. Try to start the admin-uploaded custom song synchronously
    const customStarted = playCustomAudioSynchronous(isMuted);

    if (customStarted) {
      // Custom song is running, stop synthesized ambient loop
      weddingAudio.stopAmbientLoop(0.1);
    } else {
      // Fallback: start synthesized folk Shehnai & Dhol ambient loop
      if (!isMuted) {
        weddingAudio.playDholHit(0.85);
        window.setTimeout(() => {
          weddingAudio.startAmbientLoop(0.22);
        }, 350);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    weddingAudio.unlock();
    setIsMuted((prev) => {
      const next = !prev;
      setCustomAudioMuted(next);

      if (prev) {
        // Unmuting
        if (!isCustomAudioActive()) {
          weddingAudio.playDholHit(0.5);
          weddingAudio.startAmbientLoop(0.22);
        }
      } else {
        // Muting
        weddingAudio.stopAmbientLoop(0.5);
      }
      return next;
    });
  }, []);

  const playDholHit = useCallback(() => {
    if (isMuted) return;
    weddingAudio.unlock();
    weddingAudio.playDholHit(0.8);
  }, [isMuted]);

  const playDholRoll = useCallback(() => {
    if (isMuted) return;
    weddingAudio.unlock();
    weddingAudio.playDholRoll(0.85);
  }, [isMuted]);

  const playWaxCrack = useCallback(
    (volume = 0.5) => {
      weddingAudio.unlock();
      if (!isMuted) {
        weddingAudio.playWaxCrack(volume);
      }
    },
    [isMuted]
  );

  const playTap = useCallback(() => {
    if (isMuted) return;
    weddingAudio.playTapSound(0.25);
  }, [isMuted]);

  return {
    isMuted,
    toggleMute,
    playDholHit,
    playDholRoll,
    playWaxCrack,
    playTap,
    unlockAndStart,
  };
}
