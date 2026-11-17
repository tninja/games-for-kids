export type GamePhase = "start" | "playing" | "gameover";
export type PlayerMode = "1p" | "2p";
export type BirdColor = "red" | "blue" | "yellow";
export type BirdFlapFrame = "up" | "mid" | "down";
export type BackgroundKind = "day" | "night";
export type PipeColor = "green" | "red";
export type SoundKey = "die" | "hit" | "point" | "swoosh" | "wing";
export type Coord = [number, number];

export interface Rng {
  next(): number;
  randInt(min: number, maxInclusive: number): number;
  choice<T>(items: readonly T[]): T;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ThemeConfig {
  background: BackgroundKind;
  pipe: PipeColor;
  bird1Color: BirdColor;
  bird2Color: BirdColor;
}

export interface CanvasContextLike {
  font: string;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  textBaseline: string;
  textAlign: string;
  globalAlpha: number;
  imageSmoothingEnabled: boolean;
  measureText(text: string): { width: number };
  fillText(text: string, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  drawImage?: (...args: unknown[]) => void;
  save?: () => void;
  restore?: () => void;
  translate?: (x: number, y: number) => void;
  rotate?: (angle: number) => void;
  setTransform?: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
}

export interface CanvasLike {
  getContext(contextId: "2d"): CanvasContextLike | null;
}

export interface UiSnapshot {
  phase: GamePhase;
  mode: PlayerMode;
  score: number;
  bestScore: number;
  ai1: boolean;
  ai2: boolean;
  muted: boolean;
}

export const SCREEN_WIDTH = 288;
export const SCREEN_HEIGHT = 512;
export const BASE_Y_RATIO = 0.79;
export const BASE_Y = Math.round(SCREEN_HEIGHT * BASE_Y_RATIO);
export const PIPE_GAP_SIZE = 150;
export const DROPPING_SPEED = 12;
export const FLAPPING_SPEED = 3;
export const FLYING_SPEED = 4;

export const BIRD_WIDTH = 34;
export const BIRD_HEIGHT = 24;
export const PIPE_WIDTH = 52;
export const PIPE_HEIGHT = 320;
export const BASE_WIDTH = 336;
export const BASE_HEIGHT = 112;
export const MESSAGE_WIDTH = 184;
export const MESSAGE_HEIGHT = 267;
export const GAMEOVER_WIDTH = 192;
export const GAMEOVER_HEIGHT = 42;
export const DIGIT_HEIGHT = 36;

export const DIGIT_WIDTHS: Record<string, number> = {
  "0": 24,
  "1": 16,
  "2": 24,
  "3": 24,
  "4": 24,
  "5": 24,
  "6": 24,
  "7": 24,
  "8": 24,
  "9": 24
};

export const BIRD_COLORS: readonly BirdColor[] = ["red", "blue", "yellow"];
export const FLAP_SEQUENCE: readonly BirdFlapFrame[] = ["up", "mid", "down", "mid"];
export const STORAGE_KEY = "flappybird_best_v1";
