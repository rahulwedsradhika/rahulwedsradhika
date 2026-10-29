import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from 'framer-motion';
import { Calendar, RotateCcw, Sparkles } from 'lucide-react';
import { ScratchRevealConfig, LocalizedString } from '../../types/wedding';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';

export interface ScratchCardProps {
  config?: ScratchRevealConfig;
  weddingDateDisplay?: LocalizedString;
  ceremonyTime?: string;
  venueName?: LocalizedString;
  className?: string;
}

const LOCAL_SCRATCH_KEY = 'wedding_scratch_revealed_v3';

export const ScratchCard: React.FC<ScratchCardProps> = ({
  config: propConfig,
  weddingDateDisplay: propDateDisplay,
  ceremonyTime: propTime,
  venueName: propVenueName,
  className = '',
}) => {
  const { lang } = useLanguage();
  const { config: globalConfig } = useWeddingConfig();
  const config = propConfig || globalConfig.scratchReveal;
  const weddingDateDisplay = propDateDisplay || globalConfig.weddingDateDisplay;
  const ceremonyTime = propTime || globalConfig.ceremonyStartTime;
  const venueName = propVenueName || globalConfig.venues[0]?.name || { en: 'Dobh Haveli', hi: 'डोभ हवेली' };

  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (config.persistRevealedState) {
      return window.localStorage.getItem(LOCAL_SCRATCH_KEY) === 'true';
    }
    return false;
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Initialize Canvas with Gold Scratch Foil
  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || isRevealed) return;

    const width = container.clientWidth || 340;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw Gold Foil Surface
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#D6AD62');
    grad.addColorStop(0.35, '#F9EDB8');
    grad.addColorStop(0.7, '#B58A38');
    grad.addColorStop(1, '#8A631E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let x = 20; x < width; x += 30) {
      ctx.beginPath();
      ctx.arc(x, 90, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Callout Text on Scratch Foil - Concise and beautifully centered for all screen widths
    ctx.textAlign = 'center';
    ctx.fillStyle = '#702C43';
    ctx.font = 'bold 15px "Fraunces", Georgia, serif';
    const mainTitle = lang === 'hi' ? 'शुभ विवाह तिथि' : 'Secret Wedding Date';
    ctx.fillText('✨ ' + mainTitle + ' ✨', width / 2, 72);

    ctx.fillStyle = '#5A1E32';
    ctx.font = '600 12px "Inter", sans-serif';
    const subTitle = lang === 'hi' ? 'यहाँ स्क्रैच करें' : 'Scratch gold card to reveal';
    ctx.fillText(subTitle, width / 2, 102);

    setScratchPercent(0);
  };

  useEffect(() => {
    if (!isRevealed) {
      initCanvas();
    }
  }, [isRevealed, lang]);

  // Scratch action
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Throttle calculation of scratched percentage
    if (Math.random() < 0.25) {
      checkScratchedPercentage(ctx, canvas.width, canvas.height);
    }
  };

  const checkScratchedPercentage = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;

      // Sample every 4th pixel for high performance on mobile
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = Math.round((transparentPixels / (totalPixels / 4)) * 100);
      setScratchPercent(percent);

      if (percent >= config.revealThresholdPercentage) {
        handleReveal();
      }
    } catch {
      // Fallback
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (config.persistRevealedState) {
      try {
        window.localStorage.setItem(LOCAL_SCRATCH_KEY, 'true');
      } catch {
        // Ignore
      }
    }

    if (!prefersReducedMotion && config.animationStyle === 'confetti') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#D6AD62', '#702C43', '#C76B84', '#FFF4F6'],
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleReplay = () => {
    try {
      window.localStorage.removeItem(LOCAL_SCRATCH_KEY);
    } catch {
      // Ignore
    }
    setIsRevealed(false);
  };

  // Mouse & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDrawing(true);
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || e.touches.length === 0) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => setIsDrawing(false);

  if (!config.enabled) return null;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Header text */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C76B84]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{config.heading[lang]}</span>
        </div>
      </div>

      {/* Interactive Card Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[180px] rounded-[24px] overflow-hidden border-2 border-[#D6AD62] shadow-[0_12px_32px_-8px_rgba(112,44,67,0.15)] bg-white select-none touch-none"
      >
        {/* Revealed Content Layer (Underneath) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br from-[#FFF4F6] via-white to-[#F8E3E9]">
          <span className="w-10 h-10 rounded-full bg-[#F8E3E9] text-[#702C43] flex items-center justify-center mb-2 shadow-xs">
            <Calendar className="w-5 h-5 text-[#D6AD62]" />
          </span>
          <h4 className="font-heading text-xl sm:text-2xl font-bold text-[#702C43] tracking-tight mb-1">
            {weddingDateDisplay[lang]}
          </h4>
          <p className="text-xs font-semibold text-[#C76B84] mb-1">
            {ceremonyTime} · {venueName[lang]}
          </p>
          <p className="text-[11px] font-medium text-[#765F68] italic">
            {config.revealedMessage[lang]}
          </p>
        </div>

        {/* Scratchable Canvas Layer */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 w-full h-full cursor-pointer z-10"
          />
        )}
      </div>

      {/* Progress or Replay button */}
      <div className="flex items-center justify-between mt-2.5 px-2 text-xs">
        {!isRevealed ? (
          <span className="text-[#765F68] text-[11px] font-medium">
            {scratchPercent > 0 ? `${scratchPercent}% scratched` : config.instruction[lang]}
          </span>
        ) : (
          <span className="text-[#702C43] font-semibold text-[11px] flex items-center gap-1">
            🎉 Date revealed!
          </span>
        )}

        {config.allowReplay && isRevealed && (
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex items-center gap-1 font-semibold text-[#702C43] hover:underline cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scratch Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
