/**
 * Lightweight .ics Calendar File Generator.
 * Standard iCalendar RFC 5545 with title, description, venue location,
 * explicit start and end times, and two reminder alarms (1 day before, 2 hours before).
 */

export interface IcsEventOptions {
  title: string;
  description: string;
  location: string;
  startISO: string;
  endISO: string;
  filename: string;
}

function toUtcStamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function generateIcsContent(events: IcsEventOptions[]): string {
  const nowUtc = toUtcStamp(new Date().toISOString());

  const eventBlocks = events.map((ev, index) => {
    const dtStart = toUtcStamp(ev.startISO);
    const dtEnd = toUtcStamp(ev.endISO);
    const uid = `${dtStart}-${index}-${Math.random().toString(36).slice(2, 8)}@rahulweddsradhika.in`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(ev.title)}`,
      `DESCRIPTION:${escapeIcsText(ev.description)}`,
      `LOCATION:${escapeIcsText(ev.location)}`,
      'STATUS:CONFIRMED',
      // Alarm 1: 1 day before
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${escapeIcsText(ev.title)} is tomorrow!`,
      'END:VALARM',
      // Alarm 2: 2 hours before
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${escapeIcsText(ev.title)} starts in 2 hours!`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RahulWedsRadhika//WeddingWebsite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:Asia/Kolkata',
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(events: IcsEventOptions[], filename = 'wedding-event'): void {
  const icsData = generateIcsContent(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
