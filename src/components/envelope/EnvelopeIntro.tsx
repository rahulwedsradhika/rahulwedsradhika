import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';
import { useAudio } from '../../hooks/useAudio';
import {
  EnvelopeDefs,
  EnvelopeBack,
  EnvelopeFrontPocket,
  EnvelopeTopFlap,
} from './EnvelopeArt';
import { WaxSeal } from './WaxSeal';
import { PetalFall } from '../ui/PetalFall';

interface EnvelopeIntroProps {
  onEnter: (chosenLang: Language) => void;
}

type Stage = 'idle' | 'pressed' | 'cracking' | 'opening' | 'entering';

export const EnvelopeIntro: React.FC<EnvelopeIntroProps> = ({ onEnter }) => {
  const { lang, setLang, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const { playWaxCrack, unlockAndStart } = useAudio();

  const [stage, setStage] = useState<Stage>('idle');
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [petalBurst, setPetalBurst] = useState(0);
  const timersRef = useRef<number[]>([]);

  // Track window resize and mouse tilt
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (stage !== 'idle') return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 6;
      const ny = (e.clientY / window.innerHeight - 0.5) * 6;
      setTilt({ x: nx, y: ny });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      timersRef.current.forEach((id) => clearTimeout(id));
    };
  }, [stage]);

  // Responsive physical envelope dimensions
  const { envelopeWidth, envelopeHeight, sealSize } = useMemo(() => {
    const { width: vw, height: vh } = viewport;
    // Luxurious wedding invitation envelope proportion (~1.48 aspect ratio)
    const maxWidth = Math.min(vw * 0.92, 590, (vh - 170) * 1.48);
    const envW = Math.max(300, Math.round(maxWidth));
    const envH = Math.round(envW / 1.48);
    // Seal scales appropriately with envelope size
    const seal = Math.max(96, Math.min(136, Math.round(envW * 0.22)));

    return {
      envelopeWidth: envW,
      envelopeHeight: envH,
      sealSize: seal,
    };
  }, [viewport]);

  // Clean-up and enter transition
  const handleImmediateEnter = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    unlockAndStart();
    onEnter(lang);
  };

  const handleOpenEnvelope = () => {
    if (stage !== 'idle') return;

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([22, 45]);
      }
    } catch {
      // Ignore vibration error
    }

    if (prefersReducedMotion) {
      handleImmediateEnter();
      return;
    }

    // Step 1: Subtle press down reaction
    setStage('pressed');

    // Step 2: Seal cracking sound + visual fracture & micro light bloom (at 150ms)
    const t1 = window.setTimeout(() => {
      setStage('cracking');
      playWaxCrack(0.75);
      unlockAndStart();
    }, 150);

    // Step 3: Top flap swings open upward in 3D (at 550ms)
    const t2 = window.setTimeout(() => {
      setStage('opening');
    }, 550);

    // Step 4: Direct smooth reveal transition into homepage (at 1350ms)
    const t3 = window.setTimeout(() => {
      setStage('entering');
      setPetalBurst((prev) => prev + 1);
    }, 1350);

    // Step 5: Complete transition into homepage (at 1950ms)
    const t4 = window.setTimeout(() => {
      handleImmediateEnter();
    }, 1950);

    timersRef.current = [t1, t2, t3, t4];
  };

  const isFlapOpen = stage === 'opening' || stage === 'entering';
  const flapRotation = isFlapOpen ? 180 : 0;
  const isEntering = stage === 'entering';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.65, ease: 'easeInOut' } }}
      className="fixed inset-0 w-screen h-screen w-[100dvw] h-[100dvh] z-50 flex flex-col justify-between items-center bg-[#FFF4F6] overflow-hidden select-none"
    >
      <EnvelopeDefs />

      {/* Atmospheric Ambient Warm Pink & Dusty Rose Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(254, 237, 241, 0.95) 0%, rgba(248, 227, 233, 0.8) 50%, rgba(235, 217, 222, 0.6) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Soft Vignette Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(112, 44, 67, 0.15) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Celebratory Petal Shower during opening entrance */}
      {stage === 'entering' && (
        <div className="fixed inset-0 z-45 pointer-events-none">
          <PetalFall burstTrigger={petalBurst} />
        </div>
      )}

      {/* Central Radiant Golden Flare on Seal Crack */}
      {stage === 'cracking' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.85, 0], scale: 1.6 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-[#FFFEE5] via-[#FCE496] to-transparent blur-2xl pointer-events-none z-45"
        />
      )}

      {/* TOP BAR: Auspicious Greeting + Bilingual EN / हिन्दी Toggle */}
      <motion.header
        animate={{
          opacity: stage === 'idle' ? 1 : 0,
          y: stage === 'idle' ? 0 : -20,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        }}
        className={`w-full max-w-4xl px-4 sm:px-8 flex items-center justify-between z-40 ${
          stage !== 'idle' ? 'pointer-events-none' : ''
        }`}
      >
        <span className="font-heading text-sm sm:text-base font-bold tracking-wider text-[#702C43] uppercase drop-shadow-2xs">
          {t('entry_ram_ram')}
        </span>

        {/* Bilingual Language Selector */}
        <div className="inline-flex rounded-full bg-[#F8E3E9]/90 backdrop-blur-md p-1 border border-[#EBD9DE] shadow-xs">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`min-h-[36px] px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#702C43] text-white shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`min-h-[36px] px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              lang === 'hi'
                ? 'bg-[#702C43] text-white shadow-xs'
                : 'text-[#765F68] hover:text-[#702C43]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </motion.header>

      {/* MAIN VIEWPORT: Tactile Floating Envelope Object */}
      <main className="relative w-full flex-1 flex flex-col items-center justify-center [perspective:1400px] px-4 overflow-visible">
        {/* The Dimensional Physical Envelope Container */}
        <motion.div
          animate={{
            x: stage === 'cracking' ? [0, -1.5, 1.5, 0] : tilt.x,
            y: stage === 'cracking' ? [0, 1.5, -1.5, 0] : isEntering ? -30 : tilt.y,
            scale: stage === 'pressed' ? 0.98 : isEntering ? 1.08 : 1,
            opacity: isEntering ? 0 : 1,
          }}
          transition={{
            scale: { duration: isEntering ? 0.65 : 0.2, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.6, ease: 'easeInOut' },
            y: { duration: 0.3 },
            x: { duration: 0.2 },
          }}
          style={{
            width: envelopeWidth,
            height: envelopeHeight,
            transformStyle: 'preserve-3d',
          }}
          className={`relative select-none ${stage === 'idle' ? 'cursor-pointer' : ''}`}
          onClick={stage === 'idle' ? handleOpenEnvelope : undefined}
        >
          {/* Dual-Layer Realistic Ambient Shadows under Envelope Object */}
          <div
            style={{
              width: envelopeWidth * 0.96,
              height: envelopeHeight * 0.94,
              left: '2%',
              top: '6%',
            }}
            className="absolute rounded-[18px] bg-[#4A1626]/20 blur-2xl pointer-events-none transform translate-y-6"
          />
          <div
            style={{
              width: envelopeWidth * 0.98,
              height: envelopeHeight * 0.96,
              left: '1%',
              top: '3%',
            }}
            className="absolute rounded-[16px] bg-[#4A1626]/12 blur-lg pointer-events-none transform translate-y-3"
          />

          {/* Layer A (z-10): Envelope Back Wall & Royal Burgundy Interior Lining */}
          <div className="absolute inset-0 z-10 shadow-[0_4px_20px_rgba(112,44,67,0.12)]">
            <EnvelopeBack width={envelopeWidth} height={envelopeHeight} />
          </div>

          {/* Layer B (z-25): Envelope Front Pocket (Left, Right, Bottom Overlapping Flaps) */}
          <div className="absolute inset-0 z-25 pointer-events-none">
            <EnvelopeFrontPocket width={envelopeWidth} height={envelopeHeight} />
          </div>

          {/* Layer C (z-30): 3D Hinged Top Flap (Rotates Upward on Opening) */}
          <div className="absolute inset-x-0 top-0 z-30">
            <motion.div
              animate={{ rotateX: flapRotation }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.78,
                ease: [0.34, 1.25, 0.36, 1],
              }}
              style={{ transformOrigin: 'top center' }}
            >
              <EnvelopeTopFlap
                width={envelopeWidth}
                height={envelopeHeight}
                rotateX={flapRotation}
              />
            </motion.div>
          </div>

          {/* Layer D (z-35): Antique Gold Wax Seal anchored at Flap Apex */}
          <div
            style={{
              top: envelopeHeight * 0.56 - sealSize * 0.38,
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-35 pointer-events-auto"
          >
            <WaxSeal
              stage={stage}
              onClick={handleOpenEnvelope}
              size={sealSize}
            />
          </div>
        </motion.div>

        {/* Refined "Tap seal to open" Invitation Prompt Pill */}
        {stage === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            style={{ marginTop: '28px' }}
            className="z-35 pointer-events-none"
          >
            <div className="px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#D6AD62]/60 shadow-[0_6px_20px_rgba(112,44,67,0.14)] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6AD62] shadow-[0_0_8px_rgba(214,173,98,0.8)] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#702C43]">
                {t('entry_tap_seal')}
              </span>
            </div>
          </motion.div>
        )}
      </main>

      {/* FOOTER: Discreet "Skip directly to website →" with instant cancellation */}
      <motion.footer
        animate={{
          opacity: stage === 'idle' ? 1 : 0,
          y: stage === 'idle' ? 0 : 20,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        }}
        className={`w-full max-w-md flex flex-col items-center gap-2 z-40 ${
          stage !== 'idle' ? 'pointer-events-none' : ''
        }`}
      >
        <button
          type="button"
          onClick={handleImmediateEnter}
          className="min-h-[44px] px-6 py-2 text-xs sm:text-sm font-semibold text-[#702C43]/80 hover:text-[#702C43] underline underline-offset-4 decoration-[#C76B84]/40 hover:decoration-[#702C43] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#C76B84] rounded-full"
        >
          {t('entry_skip')} →
        </button>
      </motion.footer>
    </motion.div>
  );
};
