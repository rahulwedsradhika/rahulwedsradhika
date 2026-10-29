import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { EventConfigItem, LocalizedString } from '../../types/wedding';
import { Calendar, Plus, Trash2, Edit2, Clock, MapPin, Eye, EyeOff, Sparkles, X } from 'lucide-react';

export const AdminEventsTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<Partial<EventConfigItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  const venues = config.venues || [];

  const handleStartAdd = () => {
    setEventDraft({
      id: `evt_${Date.now()}`,
      name: { en: '', hi: '' },
      emoji: '✨',
      dateISO: '2026-11-28',
      startISO: '2026-11-28T10:00:00+05:30',
      endISO: '2026-11-28T14:00:00+05:30',
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      venueId: venues[0]?.id || 'haveli_dobh',
      dressCode: { en: 'Festive Indian / Traditional', hi: 'पारंपरिक / उत्सव पोशाक' },
      colorAccent: '#D4A640',
      swatches: ['#D4A640', '#E5A93C', '#FFF8E7'],
      description: { en: '', hi: '' },
      visible: true,
      sortOrder: (config.events?.length || 0) + 1,
    });
    setIsAddingNew(true);
    setEditingEventId(null);
  };

  const handleSaveEvent = () => {
    if (!eventDraft.name?.en?.trim()) return;

    const savedItem: EventConfigItem = {
      id: eventDraft.id || `evt_${Date.now()}`,
      name: eventDraft.name as LocalizedString,
      emoji: eventDraft.emoji || '✨',
      dateISO: eventDraft.dateISO || '2026-11-28',
      startISO: eventDraft.startISO || '2026-11-28T10:00:00+05:30',
      endISO: eventDraft.endISO || '2026-11-28T14:00:00+05:30',
      startTime: eventDraft.startTime || '10:00 AM',
      endTime: eventDraft.endTime || '02:00 PM',
      venueId: eventDraft.venueId || venues[0]?.id || 'haveli_dobh',
      dressCode: eventDraft.dressCode || { en: 'Traditional', hi: 'पारंपरिक' },
      colorAccent: eventDraft.colorAccent || '#B85042',
      swatches: eventDraft.swatches || ['#B85042'],
      description: eventDraft.description || { en: '', hi: '' },
      visible: eventDraft.visible ?? true,
      sortOrder: eventDraft.sortOrder || 1,
    };

    void updateConfig((prev) => {
      const existing = prev.events || [];
      const updated = isAddingNew
        ? [...existing, savedItem]
        : existing.map((evt) => (evt.id === savedItem.id ? savedItem : evt));
      return {
        ...prev,
        events: updated,
      };
    });

    setIsAddingNew(false);
    setEditingEventId(null);
    setEventDraft({});
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Are you sure you want to delete this event ceremony?')) return;
    void updateConfig((prev) => ({
      ...prev,
      events: (prev.events || []).filter((e) => e.id !== id),
    }));
  };

  const handleToggleVisibility = (id: string) => {
    void updateConfig((prev) => ({
      ...prev,
      events: (prev.events || []).map((e) =>
        e.id === id ? { ...e, visible: !e.visible } : e
      ),
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-burgundy" />
            Ceremonies & Event Timeline
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Configure timings, venues, dress codes, color themes, and descriptions for all wedding rituals.
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Ceremony
        </button>
      </div>

      {/* Inline Form / Modal for Create or Edit */}
      {(isAddingNew || editingEventId) && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border-2 border-burgundy/20 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{eventDraft.emoji || '✨'}</span>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {isAddingNew ? 'Create New Ceremony' : `Edit: ${eventDraft.name?.en || 'Ceremony'}`}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingEventId(null);
              }}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Emoji Icon
              </label>
              <input
                type="text"
                value={eventDraft.emoji || ''}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, emoji: e.target.value }))}
                placeholder="🌾"
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-center"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Ceremony Name (English & Hindi) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sangeet & Traditional Raas"
                  value={eventDraft.name?.en || ''}
                  onChange={(e) =>
                    setEventDraft((prev) => ({
                      ...prev,
                      name: { en: e.target.value, hi: prev.name?.hi || '' },
                    }))
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="e.g. Sangeet & Folk Dance (Hindi)"
                  value={eventDraft.name?.hi || ''}
                  onChange={(e) =>
                    setEventDraft((prev) => ({
                      ...prev,
                      name: { en: prev.name?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Date, Timings & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={eventDraft.dateISO || '2026-11-28'}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, dateISO: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Display Time Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="07:00 PM"
                  value={eventDraft.startTime || ''}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Midnight"
                  value={eventDraft.endTime || ''}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Assigned Venue
              </label>
              <select
                value={eventDraft.venueId || ''}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, venueId: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name.en} ({v.name.hi})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dress Code & Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Dress Code (EN & HI)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Shades of Ochre & Marigold"
                  value={eventDraft.dressCode?.en || ''}
                  onChange={(e) =>
                    setEventDraft((prev) => ({
                      ...prev,
                      dressCode: { en: e.target.value, hi: prev.dressCode?.hi || '' },
                    }))
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="e.g. Yellow & Marigold colors (Hindi)"
                  value={eventDraft.dressCode?.hi || ''}
                  onChange={(e) =>
                    setEventDraft((prev) => ({
                      ...prev,
                      dressCode: { en: prev.dressCode?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Theme Color Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={eventDraft.colorAccent || '#B85042'}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, colorAccent: e.target.value }))}
                  className="w-10 h-10 p-0.5 rounded-lg border border-stone-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={eventDraft.colorAccent || ''}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, colorAccent: e.target.value }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description / Notes (English & Hindi)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <textarea
                rows={2}
                placeholder="Description in English..."
                value={eventDraft.description?.en || ''}
                onChange={(e) =>
                  setEventDraft((prev) => ({
                    ...prev,
                    description: { en: e.target.value, hi: prev.description?.hi || '' },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
              <textarea
                rows={2}
                placeholder="Description in Hindi..."
                value={eventDraft.description?.hi || ''}
                onChange={(e) =>
                  setEventDraft((prev) => ({
                    ...prev,
                    description: { en: prev.description?.en || '', hi: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingEventId(null);
              }}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvent}
              className="px-5 py-2 text-xs bg-burgundy hover:bg-burgundy/90 text-white font-medium rounded-xl shadow-sm"
            >
              Save Ceremony
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {(config.events || []).map((event, index) => {
          const venue = venues.find((v) => v.id === event.venueId);
          return (
            <div
              key={event.id}
              className={`bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border transition ${
                event.visible
                  ? 'border-pink-100 dark:border-stone-800 shadow-sm'
                  : 'border-dashed border-stone-300 dark:border-stone-700 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                    style={{ backgroundColor: `${event.colorAccent}25`, color: event.colorAccent }}
                  >
                    {event.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400">#{index + 1}</span>
                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {event.name.en}{' '}
                        <span className="text-xs font-normal text-stone-500 font-sans">({event.name.hi})</span>
                      </h3>
                      <span
                        className="w-3 h-3 rounded-full border border-white dark:border-stone-800"
                        style={{ backgroundColor: event.colorAccent }}
                        title={`Accent: ${event.colorAccent}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-burgundy" />
                        {event.dateISO} • {event.startTime} - {event.endTime}
                      </span>
                      {venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {venue.name.en}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    title={event.visible ? 'Visible' : 'Hidden'}
                    onClick={() => handleToggleVisibility(event.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    {event.visible ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                  <button
                    title="Edit Ceremony"
                    onClick={() => {
                      setEventDraft(event);
                      setEditingEventId(event.id);
                      setIsAddingNew(false);
                    }}
                    className="p-2 rounded-xl text-stone-400 hover:text-burgundy hover:bg-pink-50 dark:hover:bg-stone-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete Ceremony"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {event.description?.en && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 italic">
                  "{event.description.en}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
