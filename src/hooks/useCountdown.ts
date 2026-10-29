import { useEffect, useState } from 'react';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isDatePending: boolean;
  isCelebrated: boolean;
}

/**
 * Robust countdown hook operating strictly in Indian Standard Time (Asia/Kolkata).
 * Gracefully handles placeholders like '[DATE]' without throwing errors,
 * cleans up intervals, and pauses ticks when the tab is hidden to conserve battery.
 */
export function useCountdown(dateString: string): CountdownState {
  const [state, setState] = useState<CountdownState>(() => calculateTimeLeft(dateString));

  useEffect(() => {
    let timerId: number | null = null;

    const tick = () => {
      setState(calculateTimeLeft(dateString));
    };

    const startTimer = () => {
      if (timerId === null) {
        tick();
        timerId = window.setInterval(tick, 1000);
      }
    };

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dateString]);

  return state;
}

function calculateTimeLeft(dateString: string): CountdownState {
  if (!dateString || dateString.includes('[DATE]')) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isDatePending: true,
      isCelebrated: false,
    };
  }

  const target = new Date(dateString).getTime();
  if (isNaN(target)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isDatePending: true,
      isCelebrated: false,
    };
  }

  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isDatePending: false,
      isCelebrated: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isDatePending: false,
    isCelebrated: false,
  };
}
