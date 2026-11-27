import type { GameEvent } from "./game";

export class Sounds {
  enabled = true;
  private context: AudioContext | null = null;
  private recent = new Map<GameEvent, number>();
  unlock(): void {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => undefined);
    } catch { /* Audio is optional; the game remains playable without it. */ }
  }
  play(event: GameEvent): void {
    const context = this.context;
    if (!this.enabled || !context || context.state !== "running") return;
    if (context.currentTime - (this.recent.get(event) ?? -10) < (event === "block" ? 0.25 : 0.12)) return;
    this.recent.set(event, context.currentTime);
    const tones: Record<GameEvent, number[]> = {
      attack: [330], hurt: [140, 100], pickup: [620, 830], special: [440, 660, 880],
      metal: [230, 140], ghost: [360, 540], water: [920, 1100, 1320], fire: [155, 85],
      block: [750], charge: [180, 230], upgrade: [523, 659, 880], objective: [523, 784, 1046],
      boss: [160, 200, 240], won: [523, 659, 784, 1046], lost: [330, 260, 220], rescue: [392, 523, 784]
    };
    tones[event].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const attack = ["attack", "metal", "ghost", "water", "fire"].includes(event);
      const start = context.currentTime + index * (event === "water" ? 0.045 : 0.09);
      const duration = event === "ghost" ? 0.2 : event === "water" ? 0.065 : 0.14;
      oscillator.type = event === "ghost" || event === "attack" ? "sine" : event === "water" ? "square" : event === "fire" ? "sawtooth" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (event === "ghost" ? 1.4 : event === "metal" || event === "fire" ? 0.5 : 0.85), start + duration);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(attack ? 0.023 : 0.05, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + duration + 0.02);
    });
  }
}
