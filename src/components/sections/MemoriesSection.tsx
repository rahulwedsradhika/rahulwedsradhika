import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Play,
  Film,
  Lock,
  Tag,
  Share2,
  Heart,
  QrCode,
  Tv,
  Bookmark,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CEREMONY_ALBUMS,
  fetchApprovedMemories,
  uploadGuestMemory,
  getSavedMemoryIds,
  toggleSaveMemory,
} from '../../lib/memories';
import {
  CeremonyAlbumId,
  MemoryMediaItem,
} from '../../types/memories';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';
import { LiveMemoryWall } from '../memories/LiveMemoryWall';
import { CeremonyQrModal } from '../memories/CeremonyQrModal';
import { TimeCapsuleModal } from '../memories/TimeCapsuleModal';
import couplePortraitImg from '../../assets/images/couple_sunlit_portrait_1793105307085.jpg';
import venueCourtyardImg from '../../assets/images/modern_courtyard_venue_1793105307206.jpg';

export const MemoriesSection: React.FC = () => {
  const { lang, t } = useLanguage();

  // State
  const [selectedAlbum, setSelectedAlbum] = useState<CeremonyAlbumId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<MemoryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 6 Experience States
  const [isLiveWallOpen, setIsLiveWallOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedMemoryIds());
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  // Lightbox Viewer
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadCeremony, setUploadCeremony] = useState<CeremonyAlbumId>('sangeet');
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderSide, setUploaderSide] = useState<'groom' | 'bride' | 'friend'>('groom');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPasscode, setUploadPasscode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check URL query parameters for ceremony QR deep links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash.includes('action=upload') || hash.includes('upload=true')) {
      setIsUploadOpen(true);
    }
    const match = hash.match(/album=([a-zA-Z_]+)/);
    if (match && match[1]) {
      const matchedAlbum = match[1] as CeremonyAlbumId;
      if (CEREMONY_ALBUMS.some((a) => a.id === matchedAlbum)) {
        setSelectedAlbum(matchedAlbum);
        setUploadCeremony(matchedAlbum);
      }
    }
  }, []);

  // Load memories
  const loadMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApprovedMemories(selectedAlbum, searchQuery);
      setMemories(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMemories();
  }, [selectedAlbum, searchQuery]);

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleSaveMemory(id);
    setSavedIds(getSavedMemoryIds());
  };

  const displayedMemories = useMemo(() => {
    if (showOnlySaved) {
      return memories.filter((m) => savedIds.includes(m.id));
    }
    return memories;
  }, [memories, showOnlySaved, savedIds]);

  // Clean up object URL when modal closes or file changes
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl && uploadPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeMediaIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMediaIndex(null);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMediaIndex, memories.length]);

  const activeMedia = activeMediaIndex !== null ? memories[activeMediaIndex] : null;

  const handleNext = () => {
    if (activeMediaIndex === null) return;
    setActiveMediaIndex((activeMediaIndex + 1) % memories.length);
  };

  const handlePrev = () => {
    if (activeMediaIndex === null) return;
    setActiveMediaIndex((activeMediaIndex - 1 + memories.length) % memories.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError(t('memories_upload_error_file'));
      return;
    }

    setUploadFile(file);
    setUploadError(null);
    const objUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(objUrl);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a photo or short video to upload.');
      return;
    }
    if (!uploaderName.trim()) {
      setUploadError('Please enter your name so the family knows who sent this memory.');
      return;
    }
    if (!uploadPasscode.trim()) {
      setUploadError('Please enter the wedding guest passcode ("rohtak2026").');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const res = await uploadGuestMemory({
        file: uploadFile,
        ceremonyId: uploadCeremony,
        caption: uploadCaption,
        uploaderName,
        uploaderSide,
        guestPasscode: uploadPasscode,
      });

      if (!res.success) {
        setUploadError(res.error || 'Failed to upload. Please check passcode and retry.');
        return;
      }

      setUploadSuccess(true);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadModal = () => {
    setUploadFile(null);
    setUploadPreviewUrl(null);
    setUploadCaption('');
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploadOpen(false);
  };

  const handleDownload = (media: MemoryMediaItem) => {
    const a = document.createElement('a');
    a.href = media.url;
    a.download = `rahul-radhika-${media.ceremonyId}-${media.id}.${media.mediaType === 'video' ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section
      id="memories"
      aria-label={t('memories_title')}
      className="py-14 sm:py-20 px-4 bg-[#FFF4F6] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <Reveal>
          <div className="text-center space-y-3">
            <SectionTitle
              eyebrow={t('memories_eyebrow')}
              title={t('memories_title')}
              subtitle={t('memories_subtitle')}
            />

            {/* Action Bar: Clean, organized primary CTA and secondary experience pills */}
            <div className="flex flex-col items-center gap-3 pt-2">
              {/* Primary Upload CTA */}
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#702C43] hover:bg-[#5C2336] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#D6AD62]" />
                <span>{t('memories_upload_btn')}</span>
              </button>

              {/* Secondary Experiences Pills Row */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none justify-start sm:justify-center px-1">
                {/* My Saved Bookmarks */}
                <button
                  type="button"
                  onClick={() => setShowOnlySaved(!showOnlySaved)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    showOnlySaved
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white hover:bg-[#F8E3E9] text-[#702C43] border-[#EBD9DE]'
                  }`}
                  title="View my bookmarked photos"
                >
                  <Heart className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-white text-white' : 'text-rose-500'}`} />
                  <span>Saved ({savedIds.length})</span>
                </button>

                {/* Live Memory Wall Projector */}
                <button
                  type="button"
                  onClick={() => setIsLiveWallOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8E3E9] text-[#702C43] border border-[#EBD9DE] text-xs font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer"
                  title="Launch Live Projector Slideshow"
                >
                  <Tv className="w-3.5 h-3.5 text-[#D6AD62]" />
                  <span>Live Wall</span>
                </button>

                {/* Ceremony QR Code Signage */}
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8E3E9] text-[#702C43] border border-[#EBD9DE] text-xs font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer"
                  title="Ceremony QR Signs for Tables"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#702C43]" />
                  <span>QR Signs</span>
                </button>

                {/* 1st Anniversary Time Capsule */}
                <button
                  type="button"
                  onClick={() => setIsTimeCapsuleOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8E3E9] hover:bg-[#EBD9DE] text-[#702C43] border border-[#EBD9DE] text-xs font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer"
                  title="Lock message for 28 Nov 2027 anniversary"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D6AD62]" />
                  <span>Time Capsule</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Ceremony Album Filters & Search Bar */}
        <div className="space-y-4">
          {/* Ceremony Pills Carousel */}
          <div
            role="tablist"
            aria-label="Ceremony albums"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center px-1"
          >
            {CEREMONY_ALBUMS.map((album) => {
              const isSelected = selectedAlbum === album.id;
              return (
                <button
                  key={album.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#702C43] text-white border-[#702C43] shadow-sm scale-102'
                      : 'bg-white text-[#765F68] border-[#EBD9DE] hover:bg-[#F8E3E9] hover:text-[#702C43]'
                  }`}
                >
                  <span>{album.name[lang]}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-[#765F68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('memories_search_placeholder')}
              className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-full bg-white border border-[#EBD9DE] text-xs sm:text-sm text-[#33252B] placeholder:text-[#765F68]/70 focus:outline-none focus:border-[#702C43] focus:ring-2 focus:ring-[#702C43]/10 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#765F68] hover:text-[#702C43]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Gallery Content State */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#D6AD62] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#765F68] font-medium">{t('common_loading')}</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 max-w-md mx-auto">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <p className="text-xs text-red-800">{error}</p>
            <button
              onClick={() => void loadMemories()}
              className="text-xs font-semibold text-[#702C43] underline cursor-pointer"
            >
              {t('common_retry')}
            </button>
          </div>
        ) : displayedMemories.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto bg-white/70 rounded-3xl p-8 border border-[#EBD9DE]">
            <div className="w-14 h-14 rounded-full bg-[#F8E3E9] text-[#702C43] flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#702C43]">
                {showOnlySaved
                  ? 'No Saved Memories Yet'
                  : searchQuery
                  ? t('memories_empty_search')
                  : t('memories_empty_title')}
              </h3>
              <p className="text-xs text-[#765F68] mt-1">
                {showOnlySaved
                  ? 'Tap the heart icon (❤️) on any photo to build your personal wedding keepsake collection!'
                  : t('memories_empty_desc')}
              </p>
            </div>
            {showOnlySaved ? (
              <button
                type="button"
                onClick={() => setShowOnlySaved(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#702C43] text-white rounded-full text-xs font-semibold hover:bg-[#5C2336] transition cursor-pointer"
              >
                <span>View All Celebration Photos</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#702C43] text-white rounded-full text-xs font-semibold hover:bg-[#5C2336] transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('memories_upload_btn')}</span>
              </button>
            )}
          </div>
        ) : (
          /* Media Responsive Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {displayedMemories.map((media, idx) => (
              <div
                key={media.id}
                onClick={() => setActiveMediaIndex(idx)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#EBD9DE] shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image/Video Aspect Container */}
                <div className="relative aspect-square bg-[#F8E3E9]/50 overflow-hidden">
                  {media.mediaType === 'video' ? (
                    <div className="w-full h-full relative">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/40 transition">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#702C43] flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#702C43] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.thumbnailUrl || media.url}
                      alt={media.caption || 'Wedding celebration memory'}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = 'true';
                          target.src = couplePortraitImg;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Ceremony Pill Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#702C43]/85 text-white backdrop-blur-xs tracking-wider uppercase">
                      {CEREMONY_ALBUMS.find((a) => a.id === media.ceremonyId)?.name[lang] || media.ceremonyId}
                    </span>
                  </div>

                  {/* Bookmark Heart Action */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSave(e, media.id)}
                    className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition cursor-pointer shadow-md z-10 ${
                      savedIds.includes(media.id)
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600'
                    }`}
                    title={savedIds.includes(media.id) ? 'Remove from Saved' : 'Save to My Collection'}
                  >
                    <Heart
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        savedIds.includes(media.id) ? 'fill-white text-white' : ''
                      }`}
                    />
                  </button>

                  {/* Video Indicator */}
                  {media.mediaType === 'video' && (
                    <div className="absolute top-2 right-9 bg-black/70 text-white p-1 rounded-md">
                      <Film className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Caption Snippet & Uploader */}
                <div className="p-2.5 sm:p-3.5 space-y-1 bg-white flex-1 flex flex-col justify-between">
                  <p className="text-[11px] sm:text-xs font-medium text-[#33252B] line-clamp-2 leading-snug">
                    {media.caption || 'Celebration moment from wedding'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#765F68] pt-1.5 border-t border-[#F8E3E9]">
                    <span className="font-semibold truncate max-w-[85px] sm:max-w-[130px]">
                      {media.uploaderName}
                    </span>
                    <span className="text-[#C76B84] text-[9px] sm:text-[10px] shrink-0">
                      {new Date(media.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Media Viewer Modal */}
      {activeMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveMediaIndex(null)}
            aria-label="Close viewer"
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {memories.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer transition border border-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer transition border border-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Modal Card */}
          <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
            {/* Media Screen */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[480px] bg-black flex items-center justify-center overflow-hidden">
              {activeMedia.mediaType === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] w-auto max-w-full rounded-lg"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.caption || 'Wedding memory'}
                  className="max-h-[72vh] w-auto max-w-full object-contain"
                />
              )}
            </div>

            {/* Bottom Bar: Caption, Details, Download */}
            <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6AD62] text-stone-950 uppercase">
                    {CEREMONY_ALBUMS.find((a) => a.id === activeMedia.ceremonyId)?.name[lang] || activeMedia.ceremonyId}
                  </span>
                  <span className="text-xs text-stone-400">
                    Shared by <strong className="text-stone-200">{activeMedia.uploaderName}</strong>
                  </span>
                </div>
                {activeMedia.caption && (
                  <p className="text-sm font-medium text-stone-200">
                    {activeMedia.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleToggleSave(e, activeMedia.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition border ${
                    savedIds.includes(activeMedia.id)
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                  }`}
                  title={savedIds.includes(activeMedia.id) ? 'Remove from Saved' : 'Save Photo'}
                >
                  <Heart className={`w-3.5 h-3.5 ${savedIds.includes(activeMedia.id) ? 'fill-white text-white' : 'text-rose-400'}`} />
                  <span>{savedIds.includes(activeMedia.id) ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(activeMedia)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer transition border border-stone-700"
                >
                  <Download className="w-3.5 h-3.5 text-[#D6AD62]" />
                  <span>{t('memories_download')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Upload Modal */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 space-y-5 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={resetUploadModal}
              className="absolute right-5 top-5 p-2 text-stone-400 hover:text-stone-700 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-xl text-[#702C43]">
                    {t('memories_upload_success_title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#765F68] max-w-md mx-auto leading-relaxed">
                    {t('memories_upload_success_desc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetUploadModal}
                  className="px-6 py-2.5 rounded-full bg-[#702C43] text-white text-xs font-semibold shadow-md hover:bg-[#5C2336] transition"
                >
                  {t('common_close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] text-[#702C43] mb-1">
                    <Camera className="w-6 h-6 text-[#D6AD62]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#702C43]">
                    {t('memories_upload_modal_title')}
                  </h3>
                  <p className="text-xs text-[#765F68] max-w-md mx-auto">
                    {t('memories_upload_modal_desc')}
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-[#702C43] mb-1.5">
                    {t('memories_field_files')} *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadPreviewUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#D6AD62] aspect-16/9 bg-stone-50 flex items-center justify-center">
                      {uploadFile?.type.startsWith('video/') ? (
                        <video
                          src={uploadPreviewUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={uploadPreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#EBD9DE] hover:border-[#D6AD62] rounded-2xl p-6 text-center cursor-pointer bg-[#FFF4F6]/50 hover:bg-[#FFF4F6] transition"
                    >
                      <Upload className="w-8 h-8 text-[#C76B84] mx-auto mb-2" />
                      <p className="text-xs font-semibold text-[#702C43]">
                        Tap to select photo or video
                      </p>
                      <p className="text-[11px] text-[#765F68] mt-1">
                        JPEG, PNG, HEIC, MP4 up to 15MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Ceremony Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#702C43] mb-1.5">
                    {t('memories_field_ceremony')} *
                  </label>
                  <select
                    value={uploadCeremony}
                    onChange={(e) => setUploadCeremony(e.target.value as CeremonyAlbumId)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#EBD9DE] bg-white text-xs sm:text-sm text-[#33252B] focus:border-[#702C43] focus:outline-none"
                  >
                    {CEREMONY_ALBUMS.filter((a) => a.id !== 'all').map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name[lang]} ({album.dateStr[lang]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Uploader Name & Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#702C43] mb-1.5">
                      {t('memories_field_uploader')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      placeholder="e.g. Vikas Malik / Anita Dahiya"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#EBD9DE] bg-white text-xs sm:text-sm text-[#33252B] focus:border-[#702C43] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#702C43] mb-1.5">
                      {t('memories_field_side')}
                    </label>
                    <select
                      value={uploaderSide}
                      onChange={(e) => setUploaderSide(e.target.value as any)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#EBD9DE] bg-white text-xs sm:text-sm text-[#33252B] focus:border-[#702C43] focus:outline-none"
                    >
                      <option value="groom">{t('memories_field_side_groom')}</option>
                      <option value="bride">{t('memories_field_side_bride')}</option>
                      <option value="friend">{t('memories_field_side_friend')}</option>
                    </select>
                  </div>
                </div>

                {/* Caption / Blessing */}
                <div>
                  <label className="block text-xs font-bold text-[#702C43] mb-1.5">
                    {t('memories_field_caption')}
                  </label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="e.g. Jaimala celebration moment with family"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#EBD9DE] bg-white text-xs sm:text-sm text-[#33252B] focus:border-[#702C43] focus:outline-none"
                  />
                </div>

                {/* Guest Verification Passcode */}
                <div className="p-3.5 bg-[#F8E3E9]/80 rounded-2xl border border-[#EBD9DE] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#702C43]">
                    <Lock className="w-3.5 h-3.5 text-[#D6AD62]" />
                    <span>{t('memories_field_passcode')} *</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={uploadPasscode}
                    onChange={(e) => setUploadPasscode(e.target.value)}
                    placeholder="Enter wedding passcode..."
                    className="w-full min-h-[40px] px-3 rounded-xl border border-[#EBD9DE] bg-white text-xs sm:text-sm text-[#33252B] focus:border-[#702C43] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#765F68]">
                    {t('memories_field_passcode_hint')} (Code: <code className="font-mono text-[#702C43] font-bold">rohtak2026</code>)
                  </p>
                </div>

                {/* Privacy Moderation Notice */}
                <div className="text-[11px] text-[#765F68] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  🛡️ <strong>Family Privacy Note:</strong> New uploads are queued for family review before appearing in the public gallery.
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 rounded-xl bg-[#702C43] hover:bg-[#5C2336] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('memories_uploading_text')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#D6AD62]" />
                      <span>Submit Memory for Moderation</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Phase 6: Live Memory Wall Projector Slideshow */}
      <LiveMemoryWall
        isOpen={isLiveWallOpen}
        onClose={() => setIsLiveWallOpen(false)}
        initialCeremony={selectedAlbum}
      />

      {/* Phase 6: Ceremony QR Signs Modal */}
      <CeremonyQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        defaultCeremony={selectedAlbum}
      />

      {/* Phase 6: 1st Anniversary Time Capsule Modal */}
      <TimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />
    </section>
  );
};
