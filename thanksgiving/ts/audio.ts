import { SoundEvent } from "./types";

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export class FeastAudio {
  private ctx: AudioContext | null = null;
  private muted = false;

  public unlock(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      if (Ctor) {
        this.ctx = new Ctor();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public play(event: SoundEvent): void {
    if (this.muted || !this.ctx || this.ctx.state !== "running") {
      return;
    }
    const now = this.ctx.currentTime;
    switch (event) {
      case "toast_pop":
        this.tone(330, 520, 0.09, "triangle", 0.14, now);
        break;
      case "good_catch":
        this.tone(523.25, 659.25, 0.12, "sine", 0.18, now);
        this.tone(783.99, 783.99, 0.12, "sine", 0.14, now + 0.08);
        break;
      case "bird_rescue":
        this.tone(780, 1040, 0.08, "sine", 0.14, now);
        this.tone(920, 1180, 0.09, "sine", 0.13, now + 0.08);
        break;
      case "silly_bonk":
        this.tone(240, 140, 0.14, "sawtooth", 0.10, now);
        break;
      case "chair_boing":
        this.tone(175, 420, 0.12, "triangle", 0.16, now);
        this.tone(420, 210, 0.14, "sine", 0.13, now + 0.09);
        break;
      case "cream_swirl":
        this.tone(440, 580, 0.07, "sine", 0.10, now);
        break;
      case "dish_win":
        this.tone(523.25, 523.25, 0.11, "triangle", 0.17, now);
        this.tone(659.25, 659.25, 0.11, "triangle", 0.17, now + 0.10);
        this.tone(783.99, 783.99, 0.18, "triangle", 0.19, now + 0.20);
        break;
      case "leaf_hang":
        this.tone(587.33, 659.25, 0.14, "sine", 0.14, now);
        this.tone(880, 880, 0.18, "sine", 0.12, now + 0.09);
        break;
      case "feast_fanfare":
        this.tone(523.25, 523.25, 0.12, "triangle", 0.16, now);
        this.tone(659.25, 659.25, 0.12, "triangle", 0.16, now + 0.11);
        this.tone(783.99, 783.99, 0.14, "triangle", 0.17, now + 0.22);
        this.tone(1046.5, 1046.5, 0.30, "triangle", 0.20, now + 0.34);
        break;
    }
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startTime: number
  ): void {
    if (!this.ctx) {
      return;
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), startTime + duration);
    }
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }
}
