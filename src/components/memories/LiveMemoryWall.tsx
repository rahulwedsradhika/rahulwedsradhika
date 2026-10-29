import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Film,
  Camera,
  Heart,
} from 'lucide-react';
import { CeremonyAlbumId, MemoryMediaItem } from '../../types/memories';
import { CEREMONY_ALBUMS, fetchApprovedMemories } from '../../lib/memories';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';
import { useLanguage } from '../../context/LanguageContext';

interface LiveMemoryWallProps {
  isOpen: boolean;
  onClose: () => void;
  initialCeremony?: CeremonyAlbumId;
}

export const LiveMemoryWall: React.FC<LiveMemoryWallProps> = ({
  isOpen,
  onClose,
  initialCeremony = 'all',
}) => {
  const { lang } = useLanguage();
  const [selectedAlbum, setSelectedAlbum] = useState<CeremonyAlbumId>(initialCeremony);
  const [memories, setMemories] = useState<MemoryMediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideInterval, setSlideInterval] = useState(7); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load approved memories
  const loadApprovedData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setIsRefreshing(true);

      const res = await fetchApprovedMemories(selectedAlbum);
      if (res.data && res.data.length > 0) {
        setMemories(res.data);
      }
    } catch {
      // Ignore background refresh errors
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void loadApprovedData();
    setCurrentIndex(0);
  }, [isOpen, selectedAlbum]);

  // Safe background polling every 30 seconds to fetch newly approved photos
  useEffect(() => {
    if (!isOpen) return;
    const pollInterval = setInterval(() => {
      void loadApprovedData(true);
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [isOpen, selectedAlbum]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!isOpen || !isPlaying || memories.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, slideInterval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, memories.length, slideInterval]);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % memories.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, memories.length, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      void document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  if (!isOpen) return null;

  const currentMedia = memories[currentIndex];
  const albumInfo = currentMedia
    ? CEREMONY_ALBUMS.find((a) => a.id === currentMedia.ceremonyId)
    : null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Floating Overlay */}
      <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <RoyalCrestLogo size="sm" variant="crest" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm sm:text-base text-amber-200 tracking-wide">
                Live Celebration Memory Wall
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/80 text-white">
                Live Screen
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              Rahul & Radhika · 28 November 2026 · Village Dobh & Morbagh
            </p>
          </div>
        </div>

        {/* Ceremony Filter Switcher & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value as CeremonyAlbumId)}
            className="hidden sm:block px-3 py-1.5 rounded-full bg-stone-900/80 text-xs text-amber-200 border border-amber-300/30 focus:outline-none"
          >
            {CEREMONY_ALBUMS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name[lang]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Projector'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-rose-900/50 hover:bg-rose-900 text-white transition cursor-pointer"
            title="Exit Slideshow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slideshow Stage */}
      <main className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-300 tracking-wider uppercase font-semibold">
              Preparing live wedding stream...
            </p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center space-y-3 max-w-md p-8 bg-stone-900/60 rounded-3xl border border-stone-800">
            <Camera className="w-12 h-12 text-amber-300 mx-auto" />
            <h3 className="text-lg font-bold text-amber-200">
              Awaiting celebration photos
            </h3>
            <p className="text-xs text-stone-400">
              Photos uploaded by family and guests will appear here live once approved!
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Visual Media with Ken Burns transition */}
            {currentMedia.mediaType === 'video' ? (
              <video
                key={currentMedia.id}
                src={currentMedia.url}
                autoPlay
                muted
                loop
                playsInline
                className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-stone-800 animate-in fade-in zoom-in-95 duration-500"
              />
            ) : (
              <img
                key={currentMedia.id}
                src={currentMedia.url}
                alt={currentMedia.caption || 'Celebration Memory'}
                className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-stone-800/80 animate-in fade-in zoom-in-95 duration-700"
              />
            )}

            {/* Stepper Navigation Arrows */}
            {memories.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % memories.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition border border-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Information & Control Bar */}
      <footer className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Caption & Metadata */}
        {currentMedia && (
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#D6AD62] text-stone-950 uppercase tracking-wider">
                {albumInfo?.name[lang] || currentMedia.ceremonyId}
              </span>
              <span className="text-xs text-stone-300">
                Uploaded by <strong className="text-white">{currentMedia.uploaderName}</strong>
              </span>
            </div>
            {currentMedia.caption && (
              <p className="text-sm sm:text-base font-serif italic text-amber-100 line-clamp-2">
                “{currentMedia.caption}”
              </p>
            )}
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center gap-3 shrink-0 self-center sm:self-auto">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition cursor-pointer shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-stone-950" /> : <Play className="w-4 h-4 fill-stone-950 ml-0.5" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          {/* Speed / Interval */}
          <select
            value={slideInterval}
            onChange={(e) => setSlideInterval(Number(e.target.value))}
            className="px-3 py-2 rounded-full bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none"
            title="Slide transition duration"
          >
            <option value={5}>5 seconds</option>
            <option value={7}>7 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
          </select>

          {/* Progress Indicator */}
          <span className="text-xs text-stone-400 font-mono">
            {memories.length > 0 ? `${currentIndex + 1} / ${memories.length}` : '0 / 0'}
          </span>
        </div>
      </footer>
    </div>
  );
};
