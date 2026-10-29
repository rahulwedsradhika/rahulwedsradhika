import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { VenueConfigItem, LocalizedString } from '../../types/wedding';
import { MapPin, Plus, Trash2, Edit2, ExternalLink, Navigation, Car, Eye, EyeOff, X } from 'lucide-react';

export const AdminVenuesTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [venueDraft, setVenueDraft] = useState<Partial<VenueConfigItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleStartAdd = () => {
    setVenueDraft({
      id: `venue_${Date.now()}`,
      name: { en: '', hi: '' },
      address: { en: '', hi: '' },
      landmark: { en: '', hi: '' },
      parking: { en: 'Valet & ample self-parking available', hi: 'वैले एवं विशाल पार्किंग सुविधा' },
      lat: 28.8955,
      lng: 76.6066,
      plusCode: 'VF84+3R Dobh, Haryana',
      mapsUrl: 'https://maps.google.com/?q=28.8955,76.6066',
      embedUrl: '',
      visible: true,
      sortOrder: (config.venues?.length || 0) + 1,
    });
    setIsAddingNew(true);
    setEditingVenueId(null);
  };

  const handleSaveVenue = () => {
    if (!venueDraft.name?.en?.trim()) return;

    const savedItem: VenueConfigItem = {
      id: venueDraft.id || `venue_${Date.now()}`,
      name: venueDraft.name as LocalizedString,
      address: venueDraft.address || { en: '', hi: '' },
      landmark: venueDraft.landmark || { en: '', hi: '' },
      parking: venueDraft.parking || { en: 'Parking Available', hi: 'पार्किंग उपलब्ध' },
      lat: Number(venueDraft.lat) || 28.8955,
      lng: Number(venueDraft.lng) || 76.6066,
      plusCode: venueDraft.plusCode || '',
      mapsUrl: venueDraft.mapsUrl || `https://maps.google.com/?q=${venueDraft.lat || 28.8955},${venueDraft.lng || 76.6066}`,
      embedUrl: venueDraft.embedUrl || '',
      visible: venueDraft.visible ?? true,
      sortOrder: venueDraft.sortOrder || 1,
    };

    void updateConfig((prev) => {
      const existing = prev.venues || [];
      const updated = isAddingNew
        ? [...existing, savedItem]
        : existing.map((v) => (v.id === savedItem.id ? savedItem : v));
      return {
        ...prev,
        venues: updated,
      };
    });

    setIsAddingNew(false);
    setEditingVenueId(null);
    setVenueDraft({});
  };

  const handleDeleteVenue = (id: string) => {
    if (!confirm('Are you sure you want to remove this venue? Any linked events will need an existing venue.')) return;
    void updateConfig((prev) => ({
      ...prev,
      venues: (prev.venues || []).filter((v) => v.id !== id),
    }));
  };

  const handleToggleVisibility = (id: string) => {
    void updateConfig((prev) => ({
      ...prev,
      venues: (prev.venues || []).map((v) =>
        v.id === id ? { ...v, visible: !v.visible } : v
      ),
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-burgundy" />
            Venues & Location Directions
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Manage ceremonial locations, addresses, Google Maps navigation links, and parking information.
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Venue
        </button>
      </div>

      {/* Inline Form / Modal */}
      {(isAddingNew || editingVenueId) && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border-2 border-burgundy/20 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-burgundy" />
              {isAddingNew ? 'Register New Venue' : `Edit: ${venueDraft.name?.en || 'Venue'}`}
            </h3>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingVenueId(null);
              }}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Name EN & HI */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Venue Name (English & Hindi) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="e.g. Dobh Ancestral Haveli"
                value={venueDraft.name?.en || ''}
                onChange={(e) =>
                  setVenueDraft((prev) => ({
                    ...prev,
                    name: { en: e.target.value, hi: prev.name?.hi || '' },
                  }))
                }
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
              <input
                type="text"
                placeholder="e.g. Dobh Ancestral Haveli (Hindi)"
                value={venueDraft.name?.hi || ''}
                onChange={(e) =>
                  setVenueDraft((prev) => ({
                    ...prev,
                    name: { en: prev.name?.en || '', hi: e.target.value },
                  }))
                }
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Address EN & HI */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Address (EN & HI)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Village Dobh, Post Office Dobh, Rohtak, Haryana 124001"
                value={venueDraft.address?.en || ''}
                onChange={(e) =>
                  setVenueDraft((prev) => ({
                    ...prev,
                    address: { en: e.target.value, hi: prev.address?.hi || '' },
                  }))
                }
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
              <input
                type="text"
                placeholder="e.g. Village Dobh, Rohtak, Haryana 124001 (Hindi)"
                value={venueDraft.address?.hi || ''}
                onChange={(e) =>
                  setVenueDraft((prev) => ({
                    ...prev,
                    address: { en: prev.address?.en || '', hi: e.target.value },
                  }))
                }
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Landmark & Parking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Landmark (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Near Ancient Banyan Tree"
                  value={venueDraft.landmark?.en || ''}
                  onChange={(e) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      landmark: { en: e.target.value, hi: prev.landmark?.hi || '' },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="e.g. Near Banyan Tree (Hindi)"
                  value={venueDraft.landmark?.hi || ''}
                  onChange={(e) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      landmark: { en: prev.landmark?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Parking Instructions (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Dedicated valet parking"
                  value={venueDraft.parking?.en || ''}
                  onChange={(e) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      parking: { en: e.target.value, hi: prev.parking?.hi || '' },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="e.g. Valet Parking (Hindi)"
                  value={venueDraft.parking?.hi || ''}
                  onChange={(e) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      parking: { en: prev.parking?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Coordinates & Google Maps Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Latitude & Longitude
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="28.8955"
                  value={venueDraft.lat || ''}
                  onChange={(e) => setVenueDraft((prev) => ({ ...prev, lat: parseFloat(e.target.value) }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="76.6066"
                  value={venueDraft.lng || ''}
                  onChange={(e) => setVenueDraft((prev) => ({ ...prev, lng: parseFloat(e.target.value) }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Plus Code
              </label>
              <input
                type="text"
                placeholder="VF84+3R Dobh, Haryana"
                value={venueDraft.plusCode || ''}
                onChange={(e) => setVenueDraft((prev) => ({ ...prev, plusCode: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Google Maps Direct URL
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={venueDraft.mapsUrl || ''}
                onChange={(e) => setVenueDraft((prev) => ({ ...prev, mapsUrl: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingVenueId(null);
              }}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVenue}
              className="px-5 py-2 text-xs bg-burgundy hover:bg-burgundy/90 text-white font-medium rounded-xl shadow-sm"
            >
              Save Venue
            </button>
          </div>
        </div>
      )}

      {/* Venues List */}
      <div className="space-y-4">
        {(config.venues || []).map((venue, index) => (
          <div
            key={venue.id}
            className={`bg-white dark:bg-stone-900 rounded-2xl p-5 border transition ${
              venue.visible
                ? 'border-pink-100 dark:border-stone-800 shadow-sm'
                : 'border-dashed border-stone-300 dark:border-stone-700 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-400">#{index + 1}</span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {venue.name.en}{' '}
                    <span className="text-xs font-normal text-stone-500 font-sans">({venue.name.hi})</span>
                  </h3>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {venue.address.en}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-1">
                  {venue.landmark?.en && (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-burgundy" />
                      {venue.landmark.en}
                    </span>
                  )}
                  {venue.parking?.en && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      {venue.parking.en}
                    </span>
                  )}
                  {venue.mapsUrl && (
                    <a
                      href={venue.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-burgundy hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  title={venue.visible ? 'Visible' : 'Hidden'}
                  onClick={() => handleToggleVisibility(venue.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  {venue.visible ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-stone-400" />
                  )}
                </button>
                <button
                  title="Edit Venue"
                  onClick={() => {
                    setVenueDraft(venue);
                    setEditingVenueId(venue.id);
                    setIsAddingNew(false);
                  }}
                  className="p-2 rounded-xl text-stone-400 hover:text-burgundy hover:bg-pink-50 dark:hover:bg-stone-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  title="Delete Venue"
                  onClick={() => handleDeleteVenue(venue.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
