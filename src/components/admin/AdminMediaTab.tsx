import React, { useState, useEffect, useRef } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { indexedDbMedia, StoredMediaItem } from '../../lib/indexedDbMedia';
import { uploadWeddingMedia } from '../../lib/mediaStorage';
import { Image as ImageIcon, Upload, Trash2, RefreshCw, Check, AlertCircle, Eye } from 'lucide-react';

export const AdminMediaTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [storedItems, setStoredItems] = useState<Array<Omit<StoredMediaItem, 'blob'>>>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<'couplePortrait' | 'venueCourtyard' | 'heroBackdrop'>('couplePortrait');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const items = await indexedDbMedia.listMedia();
      setStoredItems(items);
    } catch (err) {
      console.error('Failed to list media from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Processing upload...');
      const category = activeSlot === 'venueCourtyard' ? 'venue' : 'couple';
      const result = await uploadWeddingMedia(file, category);

      if (!result.success) {
        alert(result.error || 'Failed to upload photo.');
        return;
      }

      // Update config media path
      await updateConfig((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          [activeSlot]: result.url,
        },
      }));

      setUploadStatus(
        result.isLocalOnly
          ? 'Photo saved locally in browser database.'
          : 'Photo uploaded to Supabase Cloud Storage!'
      );
      setTimeout(() => setUploadStatus(null), 3500);
      await loadMedia();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to store image. Please try another image.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetSlot = async (slot: 'couplePortrait' | 'venueCourtyard' | 'heroBackdrop') => {
    if (!confirm('Reset this slot to the original stock illustration?')) return;
    const defaults: Record<string, string> = {
      couplePortrait: '/assets/couple_placeholder.jpg',
      venueCourtyard: '/assets/dobh_haveli.jpg',
      heroBackdrop: '',
    };

    await updateConfig((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        [slot]: defaults[slot] || '',
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-burgundy" />
            Media & Photo Manager
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Store portraits and venue photos locally in IndexedDB without external cloud upload costs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium transition shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload New Photo for Selected Slot
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {uploadStatus}
        </div>
      )}

      {/* Featured Photo Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Couple Portrait Card */}
        <div
          onClick={() => setActiveSlot('couplePortrait')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition ${
            activeSlot === 'couplePortrait'
              ? 'border-burgundy bg-pink-50/20 dark:bg-stone-800/50 shadow-md'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider">
              Couple Portrait & Story Feature Photo
            </span>
            {activeSlot === 'couplePortrait' && (
              <span className="text-[10px] bg-burgundy text-white px-2 py-0.5 rounded-full font-medium">
                Active Slot
              </span>
            )}
          </div>

          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative group flex items-center justify-center">
            {config.media.couplePortrait ? (
              <img
                src={config.media.couplePortrait}
                alt="Couple"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-500">No portrait selected</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlot('couplePortrait');
                fileInputRef.current?.click();
              }}
              className="text-xs text-burgundy font-medium hover:underline flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" /> Replace Photo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetSlot('couplePortrait');
              }}
              className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>

        {/* Venue Courtyard Card */}
        <div
          onClick={() => setActiveSlot('venueCourtyard')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition ${
            activeSlot === 'venueCourtyard'
              ? 'border-burgundy bg-pink-50/20 dark:bg-stone-800/50 shadow-md'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider">
              Venue Courtyard & Dobh Haveli Photo
            </span>
            {activeSlot === 'venueCourtyard' && (
              <span className="text-[10px] bg-burgundy text-white px-2 py-0.5 rounded-full font-medium">
                Active Slot
              </span>
            )}
          </div>

          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative flex items-center justify-center">
            {config.media.venueCourtyard ? (
              <img
                src={config.media.venueCourtyard}
                alt="Venue"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1545232979-fbf676233d3c?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-500">No venue photo uploaded</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlot('venueCourtyard');
                fileInputRef.current?.click();
              }}
              className="text-xs text-burgundy font-medium hover:underline flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" /> Replace Photo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetSlot('venueCourtyard');
              }}
              className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>
      </div>

      {/* Local IndexedDB Library */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
          Stored Offline Media Assets ({storedItems.length})
        </h3>
        <p className="text-xs text-stone-500">
          These images are securely cached in your device's IndexedDB and won't consume localStorage quota.
        </p>

        {storedItems.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-4 text-center">
            No custom photos uploaded yet. Click any slot above and upload a picture.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {storedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 dark:border-stone-700 p-2 space-y-2 bg-stone-50 dark:bg-stone-800/50"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                  <span className="text-[10px] text-stone-500 truncate px-1">{item.filename}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete ${item.filename}?`)) return;
                      await indexedDbMedia.deleteMedia(item.id);
                      await loadMedia();
                    }}
                    className="text-stone-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
