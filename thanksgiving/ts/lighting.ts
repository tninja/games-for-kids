import { DISH_SEQUENCE } from "./constants";
import { GameState } from "./types";

// Share of the afternoon-to-sunset journey covered by the five cooking stages;
// the gratitude tree and feast finale finish the sunset.
const DISH_DUSK_SPAN = 0.7;
const GRATITUDE_DUSK = 0.85;
const LIGHTS_ON_START = 0.35;
const LIGHTS_ON_RANGE = 0.5;

export const AFTERNOON_SKY = ["#FFEAC9", "#FAD7A3", "#D8BA85"] as const;
export const SUNSET_SKY = ["#6E5A9E", "#F2996B", "#F7C77E"] as const;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// 0 = bright afternoon (title), 1 = full sunset (feast finale).
export function getDuskLevel(state: GameState): number {
  if (state.phase === "title") {
    return 0;
  }
  if (state.phase === "gratitude_tree") {
    return GRATITUDE_DUSK;
  }
  if (state.phase === "feast_finale") {
    return 1;
  }
  const finished = state.stageIndex + (state.phase === "dish_complete" ? 1 : 0);
  return (Math.min(finished, DISH_SEQUENCE.length) / DISH_SEQUENCE.length) * DISH_DUSK_SPAN;
}

// How brightly the festive string lights and lamps glow for a given dusk level.
export function getLightGlow(dusk: number): number {
  return clamp01((dusk - LIGHTS_ON_START) / LIGHTS_ON_RANGE);
}

function parseHex(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const k = clamp01(t);
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return "#" + mix.map((v) => v.toString(16).padStart(2, "0")).join("");
}
