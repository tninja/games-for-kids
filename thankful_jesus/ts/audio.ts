import { SoundEvent } from "./types";

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

// Gentle C-major worship/thanksgiving chord progression (C -> G -> Am -> F)
// Every player pentatonic harp note (C5, D5, E5, G5) harmonizes cleanly over every chord.
interface PraiseChord {
  bass: number;
  mid: number;
  top: number;
}

const PRAISE_CHORDS: PraiseChord[] = [
  { bass: 130.81, mid: 261.63, top: 329.63 }, // C major
  { bass: 196.0, mid: 293.66, top: 392.0 }, // G major
  { bass: 220.0, mid: 261.63, top: 329.63 }, // A minor
  { bass: 174.61, mid: 261.63, top: 349.23 } // F major
];

export class JourneyAudio {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgTimer: ReturnType<typeof setInterval> | null = null;
  private bgActive = false;
  private bgFast = false;
  private bgBeat = 0;

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
    if (muted) {
      this.stopHarpAccompaniment();
    }
  }

  public isHarpAccompanimentPlaying(): boolean {
    return this.bgActive && !this.muted;
  }

  public setHarpAccompaniment(active: boolean, fastTempo: boolean): void {
    const shouldRun = active && !this.muted;
    if (!shouldRun) {
      this.stopHarpAccompaniment();
      return;
    }
    if (this.bgActive && this.bgFast === fastTempo) {
      return;
    }
    this.stopHarpAccompaniment();
    this.bgActive = true;
    this.bgFast = fastTempo;
    this.bgBeat = 0;

    if (typeof setInterval !== "function") {
      return;
    }
    // Explorer: warm 86 BPM (~350ms eighth-pulse -> 700ms beat); Adventurer: lively 116 BPM (~518ms beat)
    const beatMs = fastTempo ? 518 : 698;
    this.playAccompanimentBeat();
    this.bgTimer = setInterval(() => {
      if (!this.bgActive || this.muted) {
        this.stopHarpAccompaniment();
        return;
      }
      this.playAccompanimentBeat();
    }, beatMs);
  }

  public stopHarpAccompaniment(): void {
    this.bgActive = false;
    if (this.bgTimer !== null) {
      clearInterval(this.bgTimer);
      this.bgTimer = null;
    }
  }

  private playAccompanimentBeat(): void {
    if (this.muted || !this.ctx || this.ctx.state !== "running") {
      return;
    }
    const now = this.ctx.currentTime;
    const beatInBar = this.bgBeat % 4;
    const chord = PRAISE_CHORDS[Math.floor(this.bgBeat / 4) % PRAISE_CHORDS.length];
    this.bgBeat += 1;

    if (beatInBar === 0) {
      // Warm downbeat bass + gentle strummed triad pad
      this.tone(chord.bass, chord.bass, 0.36, "sine", 0.065, now);
      this.tone(chord.mid, chord.mid, 0.28, "triangle", 0.042, now + 0.02);
      this.tone(chord.top, chord.top, 0.26, "sine", 0.036, now + 0.045);
    } else if (beatInBar === 2) {
      // Gentle lifted off-bar chord pulse
      this.tone(chord.bass * 1.5, chord.bass * 1.5, 0.22, "sine", 0.04, now);
      this.tone(chord.top, chord.top, 0.22, "triangle", 0.036, now + 0.015);
    } else {
      // Soft wooden tambourine / gentle harp tick on beats 2 & 4
      this.tone(chord.mid, chord.mid, 0.14, "sine", 0.028, now);
      this.tone(880, 620, 0.045, "triangle", 0.024, now);
    }
  }

  public play(event: SoundEvent): void {
    if (this.muted || !this.ctx || this.ctx.state !== "running") {
      return;
    }
    const now = this.ctx.currentTime;
    switch (event) {
      case "pray_blessing":
        this.tone(392.0, 392.0, 0.16, "sine", 0.13, now);
        this.tone(493.88, 493.88, 0.16, "sine", 0.13, now + 0.09);
        this.tone(587.33, 587.33, 0.20, "sine", 0.14, now + 0.18);
        this.tone(783.99, 783.99, 0.28, "sine", 0.15, now + 0.28);
        break;
      case "good_catch":
        this.tone(523.25, 659.25, 0.11, "sine", 0.15, now);
        break;
      case "blessing_token":
        this.tone(587.33, 659.25, 0.10, "triangle", 0.15, now);
        this.tone(880.0, 880.0, 0.16, "sine", 0.15, now + 0.08);
        break;
      case "gentle_bump":
        this.tone(240, 175, 0.12, "triangle", 0.10, now);
        break;
      case "turn_step":
        this.tone(440, 587.33, 0.09, "triangle", 0.14, now);
        break;
      case "tile_place":
        this.tone(523.25, 659.25, 0.11, "sine", 0.14, now);
        this.tone(783.99, 783.99, 0.13, "sine", 0.13, now + 0.07);
        break;
      case "tile_hint":
        this.tone(320, 280, 0.10, "sine", 0.09, now);
        break;
      case "stage_win":
        this.tone(523.25, 523.25, 0.11, "triangle", 0.15, now);
        this.tone(659.25, 659.25, 0.11, "triangle", 0.15, now + 0.10);
        this.tone(783.99, 783.99, 0.20, "triangle", 0.17, now + 0.20);
        break;
      case "prayer_hang":
        this.tone(587.33, 659.25, 0.14, "sine", 0.13, now);
        this.tone(880.0, 880.0, 0.20, "sine", 0.13, now + 0.09);
        break;
      case "journey_fanfare":
        this.tone(523.25, 523.25, 0.12, "triangle", 0.14, now);
        this.tone(659.25, 659.25, 0.12, "triangle", 0.14, now + 0.11);
        this.tone(783.99, 783.99, 0.15, "triangle", 0.15, now + 0.22);
        this.tone(1046.5, 1046.5, 0.34, "sine", 0.17, now + 0.34);
        break;
      case "jesus_chime":
        this.tone(523.25, 523.25, 0.14, "sine", 0.12, now);
        this.tone(659.25, 659.25, 0.14, "sine", 0.12, now + 0.08);
        this.tone(783.99, 783.99, 0.18, "sine", 0.13, now + 0.16);
        this.tone(1046.5, 1046.5, 0.26, "sine", 0.12, now + 0.24);
        break;
      case "tree_rustle":
        this.tone(698.46, 880.0, 0.10, "sine", 0.10, now);
        this.tone(880.0, 1046.5, 0.12, "sine", 0.09, now + 0.07);
        break;
      case "harp_0":
        this.tone(523.25, 523.25, 0.24, "triangle", 0.16, now);
        this.tone(1046.5, 1046.5, 0.14, "sine", 0.06, now);
        break;
      case "harp_1":
        this.tone(587.33, 587.33, 0.24, "triangle", 0.16, now);
        this.tone(1174.66, 1174.66, 0.14, "sine", 0.06, now);
        break;
      case "harp_2":
        this.tone(659.25, 659.25, 0.24, "triangle", 0.16, now);
        this.tone(1318.51, 1318.51, 0.14, "sine", 0.06, now);
        break;
      case "harp_3":
        this.tone(783.99, 783.99, 0.26, "triangle", 0.16, now);
        this.tone(1567.98, 1567.98, 0.14, "sine", 0.06, now);
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
