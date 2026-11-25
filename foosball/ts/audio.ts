import { SoundEvent } from "./types";

type AudioContextCtor = typeof AudioContext;

export class FoosballAudio {
  public muted = false;
  private ctx: AudioContext | null = null;
  private lastPlayed: Map<SoundEvent, number> = new Map();

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const ctor: AudioContextCtor | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!ctor) return null;
      try {
        this.ctx = new ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public play(event: SoundEvent, intensity = 0.8): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const prev = this.lastPlayed.get(event) ?? -1;
    const minGap = event === "wood" || event === "kick" || event === "bumper" ? 0.035 : 0.08;
    if (now - prev < minGap) return;
    this.lastPlayed.set(event, now);

    const vol = Math.max(0.05, Math.min(1, intensity));

    if (event === "wood") {
      this.playTone(ctx, now, "triangle", 260, 115, 0.065, 0.18 * vol);
      this.playNoise(ctx, now, 0.04, 1400, 0.1 * vol);
    } else if (event === "kick") {
      this.playTone(ctx, now, "square", 420, 140, 0.055, 0.15 * vol);
      this.playNoise(ctx, now, 0.035, 2200, 0.12 * vol);
    } else if (event === "powerKick") {
      this.playTone(ctx, now, "sawtooth", 340, 85, 0.11, 0.24 * vol);
      this.playTone(ctx, now, "sine", 160, 58, 0.12, 0.22 * vol);
      this.playNoise(ctx, now, 0.06, 1800, 0.16 * vol);
    } else if (event === "post") {
      this.playTone(ctx, now, "sine", 980, 740, 0.16, 0.2 * vol);
      this.playTone(ctx, now, "triangle", 1480, 1180, 0.14, 0.1 * vol);
    } else if (event === "bumper") {
      this.playTone(ctx, now, "sine", 125, 62, 0.06, 0.14 * vol);
    } else if (event === "serve") {
      this.playTone(ctx, now, "triangle", 320, 210, 0.05, 0.14 * vol);
      this.playTone(ctx, now + 0.09, "triangle", 270, 180, 0.05, 0.12 * vol);
    } else if (event === "goal") {
      // Classic metallic goal-box clank + celebratory major chord chime
      this.playTone(ctx, now, "sawtooth", 210, 95, 0.14, 0.22 * vol);
      this.playNoise(ctx, now, 0.12, 1600, 0.2 * vol);
      this.playTone(ctx, now + 0.06, "triangle", 523.25, 523.25, 0.28, 0.15 * vol);
      this.playTone(ctx, now + 0.14, "triangle", 659.25, 659.25, 0.28, 0.15 * vol);
      this.playTone(ctx, now + 0.22, "triangle", 783.99, 783.99, 0.36, 0.18 * vol);
    } else if (event === "target") {
      this.playTone(ctx, now, "sine", 660, 880, 0.14, 0.2 * vol);
      this.playTone(ctx, now + 0.09, "sine", 990, 1320, 0.22, 0.2 * vol);
    } else if (event === "whistle") {
      this.playTone(ctx, now, "sine", 2450, 2650, 0.18, 0.11 * vol);
      this.playTone(ctx, now + 0.05, "sine", 2520, 2400, 0.16, 0.08 * vol);
    }
  }

  private playTone(
    ctx: AudioContext,
    start: number,
    type: OscillatorType,
    freqStart: number,
    freqEnd: number,
    duration: number,
    gainVal: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + duration);
    gain.gain.setValueAtTime(gainVal, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.01);
  }

  private playNoise(
    ctx: AudioContext,
    start: number,
    duration: number,
    filterFreq: number,
    gainVal: number
  ): void {
    const sampleCount = Math.max(64, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, start);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(start);
  }
}
