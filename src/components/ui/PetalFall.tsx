import React, { useEffect, useRef } from 'react';

// Exact tunable constants specified in prompt
export const PETAL_COUNT_DESKTOP = 8;
export const PETAL_COUNT_MOBILE = 5;

type PetalType = 'marigold' | 'rose' | 'blush' | 'terracotta' | 'leaf';

interface Petal {
  baseX: number;
  y: number;
  length: number;
  width: number;
  type: PetalType;
  color: string;
  innerColor: string;
  veinColor: string;
  baseAlpha: number;
  fallSpeed: number; // px per millisecond
  driftAmp: number;
  driftFreq: number;
  driftPhase: number;
  rotation: number;
  rotSpeed: number;
  tumblePhase: number;
  tumbleSpeed: number;
  isFar: boolean;
  isBurst?: boolean;
}

const PETAL_PALETTES: Record<PetalType, { color: string; innerColor: string; veinColor: string }> = {
  marigold: {
    color: '#E8B84A',
    innerColor: '#FDF0B5',
    veinColor: '#D4A640',
  },
  rose: {
    color: '#E7A9A0',
    innerColor: '#FDEAE6',
    veinColor: '#CB7A6F',
  },
  blush: {
    color: '#F3C5BE',
    innerColor: '#FFF4F1',
    veinColor: '#DB948B',
  },
  terracotta: {
    color: '#C9772B',
    innerColor: '#F7C68B',
    veinColor: '#A8521A',
  },
  leaf: {
    color: '#6B7F3A',
    innerColor: '#96AF57',
    veinColor: '#485B22',
  },
};

interface PetalFallProps {
  burstTrigger?: number;
  className?: string;
}

export const PetalFall: React.FC<PetalFallProps> = ({ burstTrigger = 0, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstRef = useRef<number>(burstTrigger);

  useEffect(() => {
    burstRef.current = burstTrigger;
  }, [burstTrigger]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId: number | null = null;
    let lastTime = performance.now();
    let isVisible = true;
    let isTabActive = !document.hidden;
    let lastHandledBurst = burstRef.current;

    const getPetalCount = () => (window.innerWidth < 640 ? PETAL_COUNT_MOBILE : PETAL_COUNT_DESKTOP);

    /**
     * Staggered X position calculation:
     * Petals drift mostly on the left and right sides (80%), leaving center headline uncluttered.
     */
    const chooseBaseX = (w: number) => {
      const rand = Math.random();
      if (rand < 0.44) {
        // Left third
        return Math.random() * (w * 0.32);
      } else if (rand < 0.88) {
        // Right third
        return w * 0.68 + Math.random() * (w * 0.32);
      }
      // Sparse center third
      return w * 0.32 + Math.random() * (w * 0.36);
    };

    const createPetal = (w: number, h: number, initialY?: number, isBurst = false): Petal => {
      const typeWeights: PetalType[] = [
        'marigold',
        'marigold',
        'rose',
        'rose',
        'blush',
        'terracotta',
        'leaf',
      ];
      const type = typeWeights[Math.floor(Math.random() * typeWeights.length)];
      const palette = PETAL_PALETTES[type];
      const isFar = Math.random() < 0.4;

      // 11 to 18px long
      const length = isFar ? 10 + Math.random() * 4 : 13 + Math.random() * 5;
      const petalWidth = length * (0.52 + Math.random() * 0.16);

      // Graceful 14 to 22 second fall duration across viewport
      const durationSeconds = isBurst ? 9 + Math.random() * 5 : 14 + Math.random() * 8;
      const fallSpeed = (h + 120) / (durationSeconds * 1000);

      return {
        baseX: chooseBaseX(w),
        y: initialY !== undefined ? initialY : -24 - Math.random() * 90,
        length,
        width: petalWidth,
        type,
        color: palette.color,
        innerColor: palette.innerColor,
        veinColor: palette.veinColor,
        baseAlpha: (isFar ? 0.4 : 0.68) + Math.random() * 0.15,
        fallSpeed,
        driftAmp: 18 + Math.random() * 26,
        driftFreq: 0.0012 + Math.random() * 0.0012,
        driftPhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.0009,
        tumblePhase: Math.random() * Math.PI * 2,
        tumbleSpeed: 0.0015 + Math.random() * 0.0018,
        isFar,
        isBurst,
      };
    };

    let petals: Petal[] = [];

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const targetCount = getPetalCount();

      // Initialize or adapt petals with staggered vertical distribution
      if (petals.length === 0) {
        petals = Array.from({ length: targetCount }).map((_, i) =>
          createPetal(width, height, (i / targetCount) * (height + 40) - 20)
        );
      } else if (petals.length > targetCount) {
        petals = petals.slice(0, targetCount);
      } else {
        while (petals.length < targetCount) {
          petals.push(createPetal(width, height, -20 - Math.random() * 50));
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Draw single botanical petal (organic curved teardrop with delicate vein)
    const drawPetal = (p: Petal, currentX: number, alpha: number) => {
      ctx.save();
      ctx.translate(currentX, p.y);
      ctx.rotate(p.rotation);

      // 3D tumble flip
      const scaleX = Math.cos(p.tumblePhase);
      ctx.scale(scaleX, 1);

      ctx.globalAlpha = alpha;

      // Soft blur on far petals
      if (p.isFar) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 0.6;
      }

      const hl = p.length / 2;
      const hw = p.width / 2;

      // Petal body gradient
      const grad = ctx.createLinearGradient(0, -hl, 0, hl);
      grad.addColorStop(0, p.innerColor);
      grad.addColorStop(0.65, p.color);
      grad.addColorStop(1, p.veinColor);

      ctx.beginPath();
      ctx.moveTo(0, -hl); // tip
      ctx.bezierCurveTo(hw * 1.15, -hl * 0.35, hw * 1.1, hl * 0.45, 0, hl);
      ctx.bezierCurveTo(-hw * 1.1, hl * 0.45, -hw * 1.15, -hl * 0.35, 0, -hl);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      // Delicate center vein
      ctx.beginPath();
      ctx.moveTo(0, -hl * 0.68);
      ctx.quadraticCurveTo(hw * 0.08, 0, 0, hl * 0.72);
      ctx.strokeStyle = p.innerColor;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    };

    // Main animation loop
    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 64);
      lastTime = now;

      // Check for celebratory envelope petal burst
      if (burstRef.current !== lastHandledBurst && burstRef.current > 0) {
        lastHandledBurst = burstRef.current;
        const burstCount = 14;
        for (let b = 0; b < burstCount; b++) {
          petals.push(createPetal(width, height, -10 - Math.random() * 80, true));
        }
      }

      if (isVisible && isTabActive && width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        // Shared atmospheric breeze vector: slow gentle sway
        const globalBreeze = Math.sin(now * 0.0006) * 16;

        for (let i = petals.length - 1; i >= 0; i--) {
          const p = petals[i];

          // Update physics
          p.y += p.fallSpeed * dt;
          p.driftPhase += p.driftFreq * dt;
          p.rotation += p.rotSpeed * dt;
          p.tumblePhase += p.tumbleSpeed * dt;

          const currentX = p.baseX + Math.sin(p.driftPhase) * p.driftAmp + globalBreeze;

          // Fade-in near top (0 to 80px), fade-out near bottom (height - 90px to height)
          let fade = 1;
          if (p.y < 80) {
            fade = Math.max(0, p.y / 80);
          } else if (p.y > height - 90) {
            fade = Math.max(0, (height - p.y) / 90);
          }

          const alpha = p.baseAlpha * fade;
          if (alpha > 0.01) {
            drawPetal(p, currentX, alpha);
          }

          // Respawn or remove burst petals
          if (p.y > height + 25) {
            if (p.isBurst) {
              petals.splice(i, 1);
            } else {
              petals[i] = createPetal(width, height, -20);
            }
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none z-[2] ${className}`}
    />
  );
};
