import { Language } from '../i18n/translations';

/**
 * Formats an ISO timestamp strictly in Asia/Kolkata (IST) for consistent
 * display regardless of where a relative opens the invite around the world.
 */
export function formatEventDateTime(iso: string, lang: Language): { dateStr: string; timeStr: string } {
  const date = new Date(iso);
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);

  const timeStr = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);

  return { dateStr, timeStr };
}

function toIcsUtcStamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Generates and downloads a lightweight .ics calendar invite file on mobile & desktop.
 */
export function downloadCalendarInvite(params: {
  title: string;
  description: string;
  location: string;
  startISO: string;
  endISO: string;
  filename: string;
}): void {
  const dtStamp = toIcsUtcStamp(new Date().toISOString());
  const dtStart = toIcsUtcStamp(params.startISO);
  const dtEnd = toIcsUtcStamp(params.endISO);

  const escapeText = (val: string) =>
    val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RahulWedsRadhika//WeddingInvite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${dtStart}-${params.filename}@rahulradhika`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(params.title)}`,
    `DESCRIPTION:${escapeText(params.description)}`,
    `LOCATION:${escapeText(params.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${params.filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Plays a soft, auspicious 5-note folk pentatonic chime (Raag Bhupali: Sa-Re-Ga-Pa-Dha)
 * using Web Audio API — zero audio file download overhead on village networks.
 */
export function playGentleFolkChime(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const notes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33]; // D4 major pentatonic (Bhupali warmth)
    const start = ctx.currentTime + 0.03;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start + idx * 0.11);

      gain.gain.setValueAtTime(0.0001, start + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.06, start + idx * 0.11 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + idx * 0.11 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start + idx * 0.11);
      osc.stop(start + idx * 0.11 + 0.7);
    });

    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1800);
  } catch {
    // Ignore autoplay restriction errors silently
  }
}
