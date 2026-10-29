/**
 * Web Audio Synthesizer for Modern Haryanvi Wedding Sound Effects.
 * Generates acoustic folk dhol hits, festive dhol rolls, and soft ambient drones
 * directly in code. This ensures 100% reliable audio playback without external network latency,
 * and seamlessly falls back if custom mp3 files are not yet uploaded.
 */

class WeddingAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private droneOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Must be called inside a direct user gesture (e.g. tap on Entry Screen or Mute button)
   * to unlock the Web Audio context across iOS Safari and Android Chrome.
   */
  public unlock(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  }

  /**
   * Resonant low-end Dhol Dagga (bass) + Thappi (treble slap) hit.
   */
  public playDholHit(volume = 0.8): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Bass drum body (Dagga)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(140, now);
      bassOsc.frequency.exponentialRampToValueAtTime(54, now + 0.18);

      bassGain.gain.setValueAtTime(volume * 0.9, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.38);

      // 2. High snap (Thappi / Treble rim stroke)
      const slapOsc = ctx.createOscillator();
      const slapGain = ctx.createGain();
      slapOsc.type = 'triangle';
      slapOsc.frequency.setValueAtTime(420, now);
      slapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      slapGain.gain.setValueAtTime(volume * 0.6, now);
      slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      slapOsc.connect(slapGain);
      slapGain.connect(ctx.destination);
      slapOsc.start(now);
      slapOsc.stop(now + 0.14);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Rapid festive Dhol roll sequence (dha-dha-ge-na-ti-na).
   */
  public playDholRoll(volume = 0.75): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const timings = [0, 0.09, 0.16, 0.23, 0.31, 0.40, 0.48, 0.60];
    timings.forEach((t, i) => {
      window.setTimeout(() => {
        const isAccent = i === 0 || i === timings.length - 1;
        this.playDholHit(isAccent ? volume : volume * 0.65);
      }, t * 1000);
    });
  }

  /**
   * Quick crisp wax seal crack sound effect.
   * Filtered noise burst with rapid decay simulating brittle wax snapping.
   */
  public playWaxCrack(volume = 0.45): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const duration = 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Noise with random impulses for crackle texture
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle button tap click.
   */
  public playTapSound(volume = 0.25): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  /**
   * Starts warm, soft ambient folk harmonium drone in key of D (Sa-Pa).
   * Volume target = 0.22, with smooth 1.5s fade-in.
   */
  public startAmbientLoop(targetVol = 0.22): void {
    if (this.isAmbientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(targetVol, now + 1.5);
      master.connect(ctx.destination);
      this.ambientGain = master;

      // Warm overtone chord (D3: 146.83Hz, A3: 220Hz, D4: 293.66Hz, F#4: 369.99Hz)
      const freqs = [146.83, 220.0, 293.66, 369.99];
      this.droneOscillators = freqs.map((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.18 / (idx + 1), now);
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public stopAmbientLoop(fadeTime = 1.0): void {
    if (!this.isAmbientPlaying) return;
    const ctx = this.getContext();
    if (ctx && this.ambientGain) {
      try {
        const now = ctx.currentTime;
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeTime);
      } catch {
        // Ignore
      }
    }
    window.setTimeout(() => {
      this.droneOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore
        }
      });
      this.droneOscillators = [];
      this.isAmbientPlaying = false;
    }, fadeTime * 1000 + 50);
  }

  public isPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const weddingAudio = new WeddingAudioEngine();
