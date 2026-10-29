import React, { useState, useRef } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { Volume2, Upload, Trash2, Play, Square, Check, AlertCircle, Music } from 'lucide-react';
import { uploadAudioToSupabase, saveSiteSettings, getCurrentSiteSettings } from '../../lib/siteAudio';

export const AdminAudioTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const audioConfig = config.audio || {
    enabled: true,
    defaultMuted: false,
    trackName: 'Traditional Shehnai & Dhol Festive Tune',
    volume: 0.7,
    loop: true,
    startAtSeconds: 0,
    label: { en: 'Traditional Wedding Music', hi: 'पारंपरिक शहनाई एवं ढोल धुन' },
  };

  const currentSiteSettings = getCurrentSiteSettings();

  const handleFieldChange = async (field: string, value: any) => {
    const updated = {
      ...audioConfig,
      [field]: value,
    };

    await updateConfig((prev) => ({
      ...prev,
      audio: updated,
    }));

    // Also sync to siteAudio settings
    await saveSiteSettings({
      audio_volume: field === 'volume' ? value : (audioConfig.volume ?? 0.7),
      audio_loop: field === 'loop' ? value : (audioConfig.loop ?? true),
      audio_enabled: field === 'enabled' ? value : (audioConfig.enabled ?? true),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    try {
      const res = await uploadAudioToSupabase(file, audioConfig.audioPath);
      if (!res.success) {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to upload audio file.' });
        setUploading(false);
        return;
      }

      const newAudioUrl = res.url || '';
      const newAudioPath = res.path || '';
      const newTrackName = res.name || file.name;

      const updated = {
        ...audioConfig,
        audioUrl: newAudioUrl,
        audioPath: newAudioPath,
        trackName: newTrackName,
        enabled: true,
      };

      await updateConfig((prev) => ({
        ...prev,
        audio: updated,
      }));

      await saveSiteSettings({
        audio_url: newAudioUrl,
        audio_path: newAudioPath,
        audio_name: newTrackName,
        audio_enabled: true,
        audio_volume: audioConfig.volume,
        audio_loop: audioConfig.loop,
      });

      setStatusMsg({ type: 'success', text: 'Song uploaded and configured successfully! Default sounds are disabled when custom song is active.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error uploading file.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = async () => {
    if (!confirm('Remove custom audio song? The site will use silent playback.')) return;

    const updated = {
      ...audioConfig,
      audioUrl: undefined,
      audioPath: undefined,
      trackName: 'Silent Mode',
      enabled: false,
    };

    await updateConfig((prev) => ({
      ...prev,
      audio: updated,
    }));

    await saveSiteSettings({
      audio_url: null,
      audio_path: null,
      audio_name: null,
      audio_enabled: false,
    });

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsPlayingPreview(false);
    setStatusMsg({ type: 'success', text: 'Custom audio removed successfully.' });
  };

  const togglePreviewPlay = () => {
    const url = audioConfig.audioUrl || currentSiteSettings.audio_url;
    if (!url) {
      alert('No custom song uploaded or URL provided to preview.');
      return;
    }

    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(url);
      } else if (previewAudioRef.current.src !== url) {
        previewAudioRef.current.src = url;
      }
      previewAudioRef.current.volume = audioConfig.volume ?? 0.7;
      previewAudioRef.current.loop = audioConfig.loop ?? true;
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((err) => {
        console.error('Preview play error:', err);
        alert('Could not play audio preview. Check audio format.');
      });

      previewAudioRef.current.onended = () => {
        setIsPlayingPreview(false);
      };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-burgundy" />
            Background Music & Audio Settings
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Configure the custom wedding song played when visitors tap the wax seal. Default synthesized sounds are automatically bypassed when your song is active so they never mix up.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 dark:text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Song File & Upload Section */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Music className="w-4 h-4 text-burgundy" />
          Wedding Song File (MP3 / WAV / M4A)
        </h3>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Upload Audio File (Max 15MB)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading audio...' : 'Upload MP3 / Audio File'}
            </button>

            {(audioConfig.audioUrl || currentSiteSettings.audio_url) && (
              <>
                <button
                  onClick={togglePreviewPlay}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-50 hover:bg-pink-100 dark:bg-stone-800 text-burgundy dark:text-pink-300 border border-pink-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  {isPlayingPreview ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlayingPreview ? 'Stop Preview' : 'Preview Song'}
                </button>

                <button
                  onClick={handleRemoveAudio}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" /> Remove Song
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-stone-500">
            Current Active Track: <span className="font-semibold text-stone-800 dark:text-stone-200">{audioConfig.trackName || 'None (Silent / Default)'}</span>
          </p>
        </div>

        {/* Direct URL Input */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Or Direct Audio Stream URL (HTTPS MP3)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={audioConfig.audioUrl || ''}
              onChange={(e) => handleFieldChange('audioUrl', e.target.value)}
              placeholder="https://example.com/wedding-song.mp3"
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy"
            />
            <button
              onClick={() => handleFieldChange('enabled', true)}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold"
            >
              Apply URL
            </button>
          </div>
        </div>
      </div>

      {/* Volume & Playback Configuration */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
          Volume & Playback Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Audio Volume
              </label>
              <span className="text-xs font-bold text-burgundy">
                {Math.round((audioConfig.volume ?? 0.7) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioConfig.volume ?? 0.7}
              onChange={(e) => handleFieldChange('volume', parseFloat(e.target.value))}
              className="w-full accent-[#702C43] cursor-pointer"
            />
            <p className="text-[11px] text-stone-500">
              Recommended: 60% to 80% for background melody during reading.
            </p>
          </div>

          {/* Loop & Enable Toggles */}
          <div className="space-y-4 pt-1">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Loop Audio Infinitely
              </span>
              <input
                type="checkbox"
                checked={audioConfig.loop !== false}
                onChange={(e) => handleFieldChange('loop', e.target.checked)}
                className="w-4 h-4 accent-[#702C43] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Enable Audio on Tap
              </span>
              <input
                type="checkbox"
                checked={audioConfig.enabled !== false}
                onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                className="w-4 h-4 accent-[#702C43] rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
