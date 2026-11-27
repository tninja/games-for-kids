import type { GameEvent } from "./game";

export class Sounds {
  enabled = true;
  private context: AudioContext | null = null;
  private lastAttack = 0;
  unlock(): void {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => undefined);
    } catch { /* Audio is optional; the game remains playable without it. */ }
  }
  play(event: GameEvent): void {
    const context = this.context;
    if (!this.enabled || !context || context.state !== "running") return;
    if (event === "attack" && context.currentTime - this.lastAttack < 0.18) return;
    if (event === "attack") this.lastAttack = context.currentTime;
    const tones: Record<GameEvent, number[]> = {
      attack: [330], hurt: [140, 100], pickup: [620, 830], special: [440, 660, 880],
      boss: [160, 200, 240], won: [523, 659, 784, 1046], lost: [330, 260, 220], rescue: [392, 523, 784]
    };
    tones[event].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = event === "attack" ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(event === "attack" ? 0.015 : 0.055, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 0.14);
    });
  }
}
