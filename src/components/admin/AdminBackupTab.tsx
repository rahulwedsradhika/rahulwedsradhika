import React, { useRef, useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { localWeddingStorage } from '../../lib/weddingConfigStorage';
import { indexedDbMedia } from '../../lib/indexedDbMedia';
import { Database, Download, Upload, RotateCcw, Trash2, Check, AlertTriangle, FileCheck } from 'lucide-react';

export const AdminBackupTab: React.FC = () => {
  const { config, exportConfig, importConfig, resetToDefaults } = useWeddingConfig();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importConfig(file);
      if (result.success) {
        setImportStatus({
          success: true,
          message: 'Wedding configuration imported and applied successfully!',
        });
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Failed to parse configuration file.',
        });
      }
    } catch (err) {
      setImportStatus({
        success: false,
        message: 'An error occurred during import. Please check file format.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = async () => {
    if (!confirm('Are you sure you want to restore the default configuration for Rahul & Radhika? All custom edits will be replaced with defaults.')) {
      return;
    }
    setIsResetting(true);
    await resetToDefaults();
    setIsResetting(false);
    setImportStatus({
      success: true,
      message: 'Restored factory default configuration successfully!',
    });
  };

  const handleWipeAllLocalData = async () => {
    if (!confirm('DANGER: This will delete all local configuration, offline RSVP entries, guest wishes, and cached uploaded media from this browser. Proceed?')) {
      return;
    }
    setIsWiping(true);
    try {
      await localWeddingStorage.clearAllLocalData();
      await indexedDbMedia.clearAllMedia();
      window.localStorage.removeItem('wedding_admin_all_rsvps');
      window.localStorage.removeItem('wedding_admin_all_wishes_v3');
      window.localStorage.removeItem('wedding_admin_all_songs_v3');
      window.location.reload();
    } catch (e) {
      alert('Error during data wipe. Please refresh browser.');
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-burgundy" />
          Backup, Export & Restore (डेटा बैकअप एवं रीस्टोर)
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Export your entire wedding website setup as a portable JSON snapshot or restore previous backups with 100% data integrity.
        </p>
      </div>

      {importStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-200'
          }`}
        >
          {importStatus.success ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Backup and Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-stone-800 flex items-center justify-center text-burgundy">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Download JSON Backup
              </h3>
              <p className="text-xs text-stone-500">Save all settings, events, venues & contacts</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Generates a complete, timestamped configuration file: <br />
            <code className="text-[11px] font-mono text-burgundy bg-pink-50 dark:bg-stone-800 px-1.5 py-0.5 rounded">
              rahul_radhika_wedding_config_{new Date().toISOString().slice(0, 10)}.json
            </code>
          </p>

          <button
            onClick={exportConfig}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Export Complete Wedding Config
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-stone-800 flex items-center justify-center text-amber-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Restore from JSON File
              </h3>
              <p className="text-xs text-stone-500">Import and validate a previous backup file</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Validates schema version and automatically updates couple identity, schedules, and themes upon selection.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 dark:bg-stone-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <FileCheck className="w-4 h-4" />
            Select JSON File to Restore
          </button>
        </div>
      </div>

      {/* Danger Zone: Factory Reset & Storage Wipe */}
      <div className="bg-red-50/40 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-900/40 space-y-4">
        <h3 className="font-serif font-bold text-base text-red-900 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Maintenance & Reset Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-red-100 dark:border-red-900/30 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Reset Configuration to Defaults
            </h4>
            <p className="text-[11px] text-stone-500">
              Replaces the current settings with the default Dobh village wedding timetable and texts.
            </p>
            <button
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isResetting ? 'Resetting...' : 'Reset to Defaults'}
            </button>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-red-100 dark:border-red-900/30 space-y-2">
            <h4 className="text-xs font-bold text-red-800 dark:text-red-300">
              Wipe All Offline Browser Data
            </h4>
            <p className="text-[11px] text-stone-500">
              Clears localStorage and IndexedDB media blobs. Ideal when preparing the app for testing fresh.
            </p>
            <button
              onClick={handleWipeAllLocalData}
              disabled={isWiping}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isWiping ? 'Wiping...' : 'Wipe Browser Cache'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
