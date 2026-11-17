import { SoundKind } from "./types";

interface AudioWindowLike {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export class SoundEffects {
  public muted = false;
  public played: SoundKind[] = [];
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }
    const win = window as unknown as AudioWindowLike;
    const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended" && this.ctx.resume) {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggle(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private tone(
    ctx: AudioContext,
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay: number
  ): void {
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, start);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + duration);
    }
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  private noise(
    ctx: AudioContext,
    duration: number,
    cutoffHz: number,
    volume: number,
    delay: number
  ): void {
    const start = ctx.currentTime + delay;
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoffHz, start);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(start);
  }

  public play(kind: SoundKind): boolean {
    if (this.muted) {
      return false;
    }
    this.played.push(kind);
    if (this.played.length > 64) {
      this.played.shift();
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return true;
    }
    if (kind === "launch") {
      this.tone(ctx, 520, 170, 0.14, "triangle", 0.12, 0);
    } else if (kind === "miss") {
      this.tone(ctx, 300, 110, 0.16, "sine", 0.12, 0);
      this.noise(ctx, 0.18, 1200, 0.1, 0.02);
    } else if (kind === "hit") {
      this.tone(ctx, 180, 46, 0.24, "sawtooth", 0.16, 0);
      this.noise(ctx, 0.22, 850, 0.18, 0);
    } else if (kind === "sunk") {
      this.tone(ctx, 140, 34, 0.42, "sawtooth", 0.2, 0);
      this.tone(ctx, 220, 55, 0.28, "square", 0.1, 0.08);
      this.noise(ctx, 0.38, 650, 0.22, 0);
    } else if (kind === "win") {
      this.tone(ctx, 523.25, 523.25, 0.14, "triangle", 0.14, 0);
      this.tone(ctx, 659.25, 659.25, 0.14, "triangle", 0.14, 0.11);
      this.tone(ctx, 783.99, 783.99, 0.14, "triangle", 0.14, 0.22);
      this.tone(ctx, 1046.5, 1046.5, 0.28, "triangle", 0.16, 0.33);
    } else if (kind === "lose") {
      this.tone(ctx, 392.0, 392.0, 0.18, "sawtooth", 0.1, 0);
      this.tone(ctx, 311.13, 311.13, 0.18, "sawtooth", 0.1, 0.16);
      this.tone(ctx, 261.63, 220.0, 0.34, "sawtooth", 0.12, 0.32);
    } else if (kind === "click") {
      this.tone(ctx, 640, 480, 0.05, "sine", 0.08, 0);
    }
    return true;
  }
}
