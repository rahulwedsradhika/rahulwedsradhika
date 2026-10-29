import React, { useState } from 'react';
import { CalendarPlus, ChevronDown, ChevronUp, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { downloadIcsFile } from '../../lib/ics';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

type FilterType = 'all' | 'day1' | 'day2';

export const EventsSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const [filter, setFilter] = useState<FilterType>('all');
  const [fullSchedule, setFullSchedule] = useState<boolean>(true);

  const events = (config.events || []).filter((e) => e.visible !== false);
  const venues = config.venues || [];

  // Check if an event is happening today in Asia/Kolkata timezone
  const isHappeningToday = (isoString: string): boolean => {
    try {
      const kolkataToday = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
      }).format(new Date());
      return isoString.startsWith(kolkataToday);
    } catch {
      return false;
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'day1') return (ev.dateISO || '').includes('2026-11-27');
    if (filter === 'day2') return (ev.dateISO || '').includes('2026-11-28') || (ev.dateISO || '').includes('2026-11-29');
    return true;
  });

  const handleAddEventToCalendar = (ev: typeof events[0]) => {
    const venue = venues.find((v) => v.id === ev.venueId);
    const venueLocation = venue
      ? `${venue.name[lang]}, ${venue.address[lang]}`
      : 'Rohtak, Haryana';

    const eventName = ev.name?.[lang] || (ev.nameKey ? t(ev.nameKey as any) : 'Ceremony');
    const dressCode = ev.dressCode?.[lang] || 'Traditional';
    const description = ev.description?.[lang] || '';

    downloadIcsFile(
      [
        {
          title: `${t('nav_brand')} · ${eventName}`,
          description: `${description}\n\nDress Code: ${dressCode}`,
          location: venueLocation,
          startISO: ev.startISO,
          endISO: ev.endISO,
          filename: `rahul-radhika-${ev.id}`,
        },
      ],
      `wedding-${ev.id}`
    );
  };

  const handleJumpToVenue = (venueId: string) => {
    const el = document.getElementById(`venue-${venueId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const venueSection = document.getElementById('venue');
      if (venueSection) venueSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="events" aria-label={t('events_title')} className="py-14 sm:py-20 px-4 bg-[#FFF4F6]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow={t('events_eyebrow')}
            title={t('events_title')}
            subtitle={t('events_subtitle')}
          />
        </Reveal>

        {/* Filters and Full Schedule Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div
            role="group"
            aria-label="Filter events by day"
            className="inline-flex rounded-full bg-[#F8E3E9] p-1 border border-[#EBD9DE]"
          >
            {(
              [
                { id: 'all', label: t('events_filter_all') },
                { id: 'day1', label: t('events_filter_day1') },
                { id: 'day2', label: t('events_filter_day2') },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
                className={`min-h-[40px] px-4 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-[#702C43] text-white shadow-xs'
                    : 'text-[#765F68] hover:text-[#702C43]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFullSchedule(!fullSchedule)}
            className="min-h-[44px] px-3.5 py-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#702C43] hover:underline cursor-pointer"
          >
            <span>{fullSchedule ? t('events_toggle_compact') : t('events_toggle_full')}</span>
            {fullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((ev, idx) => {
            const venue = venues.find((v) => v.id === ev.venueId);
            const isToday = isHappeningToday(ev.dateISO);
            const eventName = ev.name?.[lang] || (ev.nameKey ? t(ev.nameKey as any) : 'Ceremony');

            return (
              <Reveal key={ev.id} delay={idx * 0.08}>
                <Card phulkariEdge className="h-full flex flex-col justify-between">
                  <div>
                    {/* Top Row: Emoji & Today Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-2xl select-none" role="img" aria-hidden="true">
                        {ev.emoji}
                      </span>
                      {isToday && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C76B84] text-white shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          {t('events_happening_today')}
                        </span>
                      )}
                    </div>

                    {/* Ceremony Name */}
                    <h3 className="card-heading font-bold text-[#702C43] mb-1.5">
                      {eventName}
                    </h3>

                    {/* Date and Time Line */}
                    <div className="text-xs sm:text-sm font-semibold text-[#C76B84] mb-3 tabular-nums">
                      <span>{ev.startTime} – {ev.endTime}</span>
                    </div>

                    {/* Jump to Venue link */}
                    {venue && (
                      <button
                        type="button"
                        onClick={() => handleJumpToVenue(venue.id)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#33252B] hover:text-[#702C43] font-medium mb-3 cursor-pointer text-left"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#C76B84] shrink-0" />
                        <span className="underline decoration-[#EBD9DE] underline-offset-2">
                          {venue.name[lang]}
                        </span>
                      </button>
                    )}

                    {/* Dress Code Swatch Row - Fully visible, responsive text wrap */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs text-[#765F68] font-medium shrink-0">Palette:</span>
                      <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                        {(ev.swatches || [ev.colorAccent || '#B85042']).map((color, sIdx) => (
                          <span
                            key={sIdx}
                            style={{ backgroundColor: color }}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#33252B] font-medium leading-snug">
                        {ev.dressCode?.[lang] || 'Festive Indian'}
                      </span>
                    </div>

                    {/* Full Description & Cultural Notes (Collapsible) */}
                    {fullSchedule && (
                      <div className="pt-3 border-t border-[#F8E3E9] text-xs sm:text-sm text-[#765F68] space-y-1.5">
                        <p>{ev.description?.[lang]}</p>
                      </div>
                    )}
                  </div>

                  {/* Add to Calendar Action */}
                  <div className="pt-4 mt-4 border-t border-[#F8E3E9]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddEventToCalendar(ev)}
                      className="w-full text-xs text-[#702C43] hover:bg-[#F8E3E9]"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                      {t('events_add_calendar')}
                    </Button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
