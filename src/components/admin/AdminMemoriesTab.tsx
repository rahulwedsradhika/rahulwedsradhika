import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Filter,
  Play,
  Film,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Edit2,
  Save,
  Check,
  ShieldCheck,
  Download,
  Tv,
  QrCode,
  Lock,
} from 'lucide-react';
import {
  CEREMONY_ALBUMS,
  fetchAdminMemories,
  updateMemoryModerationStatus,
  deleteMemoryItem,
} from '../../lib/memories';
import {
  CeremonyAlbumId,
  MemoryMediaItem,
  MemoryStats,
  ModerationStatus,
} from '../../types/memories';
import { useLanguage } from '../../context/LanguageContext';
import { LiveMemoryWall } from '../memories/LiveMemoryWall';
import { CeremonyQrModal } from '../memories/CeremonyQrModal';
import { TimeCapsuleModal } from '../memories/TimeCapsuleModal';

export const AdminMemoriesTab: React.FC = () => {
  const { lang } = useLanguage();
  const [memories, setMemories] = useState<MemoryMediaItem[]>([]);
  const [stats, setStats] = useState<MemoryStats>({
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    isCloudConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'all'>('pending');
  const [ceremonyFilter, setCeremonyFilter] = useState<CeremonyAlbumId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Phase 6 Admin Tools
  const [isLiveWallOpen, setIsLiveWallOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editCeremony, setEditCeremony] = useState<CeremonyAlbumId>('sangeet');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminMemories(statusFilter === 'all' ? undefined : statusFilter);
      setMemories(res.data);
      setStats(res.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: ModerationStatus) => {
    try {
      setActionNotice(`Updating status to ${newStatus}...`);
      await updateMemoryModerationStatus(id, newStatus);
      setActionNotice(`Memory marked as ${newStatus}!`);
      setTimeout(() => setActionNotice(null), 3000);
      await loadData();
    } catch (err: unknown) {
      alert(`Error updating status: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  };

  const handleDelete = async (item: MemoryMediaItem) => {
    const promptMsg = `Are you sure you want to permanently delete this memory uploaded by ${item.uploaderName}?`;
    if (!window.confirm(promptMsg)) return;

    try {
      setActionNotice('Deleting memory...');
      await deleteMemoryItem(item.id, item.storagePath);
      setActionNotice('Memory permanently deleted.');
      setTimeout(() => setActionNotice(null), 3000);
      await loadData();
    } catch (err: unknown) {
      alert(`Delete failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const startEditing = (item: MemoryMediaItem) => {
    setEditingId(item.id);
    setEditCaption(item.caption || '');
    setEditCeremony(item.ceremonyId);
  };

  const filteredItems = memories.filter((item) => {
    if (ceremonyFilter !== 'all' && item.ceremonyId !== ceremonyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCap = item.caption?.toLowerCase().includes(q);
      const matchUp = item.uploaderName.toLowerCase().includes(q);
      return matchCap || matchUp;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#702C43]" />
            Memories Gallery & Moderation Portal
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Review guest uploaded photos and videos before they appear in the public wedding gallery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLiveWallOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#702C43] hover:bg-[#5C2336] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Launch live screen slideshow for wedding reception / venue"
          >
            <Tv className="w-3.5 h-3.5 text-[#D6AD62]" />
            <span>Launch Live Wall</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 transition cursor-pointer"
            title="Generate and download printable QR signs"
          >
            <QrCode className="w-3.5 h-3.5 text-[#702C43]" />
            <span>Ceremony QR Signs</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTimeCapsuleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 transition cursor-pointer"
            title="View 1st anniversary time capsule messages"
          >
            <Lock className="w-3.5 h-3.5 text-[#D6AD62]" />
            <span>Time Capsule</span>
          </button>

          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold hover:bg-stone-100 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Queue */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
            statusFilter === 'pending'
              ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700 ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalPending}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Requires family approval</p>
        </div>

        {/* Approved Media */}
        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
            statusFilter === 'approved'
              ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Media</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalApproved}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Live in public gallery</p>
        </div>

        {/* Rejected Media */}
        <div
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
            statusFilter === 'rejected'
              ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700 ring-2 ring-rose-400/20'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalRejected}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Hidden from gallery</p>
        </div>

        {/* Storage Mode */}
        <div className="p-4 rounded-2xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Mode</span>
            <ShieldCheck className="w-4 h-4 text-[#702C43]" />
          </div>
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
            {stats.isCloudConnected ? 'Supabase Storage' : 'IndexedDB Local'}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {stats.isCloudConnected ? 'Bucket: wedding-memories' : 'Zero-cost browser storage'}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Pending ({stats.totalPending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Approved ({stats.totalApproved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All
            </button>
          </div>

          {/* Ceremony dropdown */}
          <select
            value={ceremonyFilter}
            onChange={(e) => setCeremonyFilter(e.target.value as CeremonyAlbumId)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200"
          >
            {CEREMONY_ALBUMS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name.en}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search caption or uploader..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Media Items Table / Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500">
          <div className="w-8 h-8 border-2 border-[#702C43] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading memories...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2 p-6">
          <Camera className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No memories found matching current filter
          </p>
          <p className="text-xs text-stone-500">
            {statusFilter === 'pending'
              ? 'Great job! All guest uploads have been moderated.'
              : 'Try selecting a different ceremony or status tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Media Preview Container */}
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.caption || 'Uploaded memory'}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.moderationStatus === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : item.moderationStatus === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.moderationStatus}
                    </span>
                  </div>

                  {/* Ceremony Badge */}
                  <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-semibold">
                    {CEREMONY_ALBUMS.find((a) => a.id === item.ceremonyId)?.name.en || item.ceremonyId}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      From: {item.uploaderName} ({item.uploaderSide || 'friend'})
                    </span>
                    <span className="text-[10px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 italic line-clamp-2">
                    "{item.caption || 'No caption provided'}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {item.moderationStatus !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}

                  {item.moderationStatus !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open original"
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    title="Delete permanently"
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 6: Live Memory Wall Projector Slideshow */}
      <LiveMemoryWall
        isOpen={isLiveWallOpen}
        onClose={() => setIsLiveWallOpen(false)}
        initialCeremony={ceremonyFilter}
      />

      {/* Phase 6: Ceremony QR Signs Modal */}
      <CeremonyQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        defaultCeremony={ceremonyFilter}
      />

      {/* Phase 6: 1st Anniversary Time Capsule Modal */}
      <TimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />
    </div>
  );
};
