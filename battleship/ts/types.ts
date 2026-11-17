export type BoardSize = 7 | 10;
export type Direction = "vertical" | "horizontal";
export type FleetName = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
export type Coord = [number, number];
export type HitRecord = [number, number, boolean];
export type SoundKind = "launch" | "miss" | "hit" | "sunk" | "win" | "lose" | "click";
export type ButtonAction = "toggle_sound" | "reroll" | "toggle_size" | "new_game";
export type TextAlign = "left" | "center" | "right";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridMetrics {
  originX: number;
  originY: number;
  cellSize: number;
  gridPx: number;
}

export interface Rng {
  next(): number;
  randInt(min: number, maxInclusive: number): number;
  choice<T>(items: readonly T[]): T;
}

export interface ComputerShotInfo {
  coord: string;
  row: number;
  col: number;
  hit: FleetName | null;
  sunk: FleetName | null;
}

export interface FireResult {
  accepted: boolean;
  reason?: "game_over" | "out_of_bounds" | "already_fired";
  coord?: string;
  hit?: FleetName | null;
  sunk?: FleetName | null;
  computerShot?: ComputerShotInfo | null;
  gameOver?: boolean;
  winner?: "You" | "Computer" | null;
}

export interface ButtonSpec {
  rect: Rect;
  label: string;
  action: ButtonAction;
  disabled: boolean;
}

export interface MobileButtonSpec {
  label: string;
  action: ButtonAction;
  disabled: boolean;
}

export interface MobileFleetInfo {
  name: FleetName;
  label: string;
  size: number;
  revealedHits: number;
  sunk: boolean;
}

export interface MobileState {
  statusMessage: string;
  statusColor: string;
  boardSize: BoardSize;
  shotsFired: number;
  gameOver: boolean;
  winner: "You" | "Computer" | null;
  buttons: MobileButtonSpec[];
  playerFleets: MobileFleetInfo[];
  enemyFleets: MobileFleetInfo[];
  logs: string[];
}

export interface Projectile {
  from: Coord;
  to: Coord;
  elapsed: number;
  duration: number;
  color: string;
  resolved: boolean;
  onImpact: (fastForward: boolean) => void;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Ripple {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  maxRadius: number;
  color: string;
  lineWidth: number;
}

export interface PendingEvent {
  delay: number;
  fn: (fastForward: boolean) => void;
}

export interface CanvasContextLike {
  font: string;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  textBaseline: string;
  textAlign: string;
  globalAlpha: number;
  measureText(text: string): { width: number };
  fillText(text: string, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  roundRect?: (x: number, y: number, w: number, h: number, radii?: number) => void;
  rect(x: number, y: number, w: number, h: number): void;
  fill(): void;
  stroke(): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  save?: () => void;
  restore?: () => void;
  translate?: (x: number, y: number) => void;
  setTransform?: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
}

export interface CanvasLike {
  getContext(contextId: "2d"): CanvasContextLike | null;
}

export const WIDTH = 1280;
export const HEIGHT = 880;
export const MOBILE_WIDTH = 560;
export const MOBILE_HEIGHT = 1120;

export const COLORS = {
  INK: "rgb(231, 241, 244)",
  MUTED: "rgb(157, 181, 190)",
  NAVY: "rgb(14, 29, 40)",
  PANEL: "rgb(24, 44, 57)",
  CARD: "rgb(34, 59, 73)",
  BORDER: "rgb(67, 95, 107)",
  OCEAN: "rgb(18, 46, 66)",
  OCEAN_HOVER: "rgb(33, 74, 102)",
  SHIP_FILL: "rgb(112, 138, 152)",
  SHIP_SUNK: "rgb(92, 54, 62)",
  GREEN: "rgb(159, 235, 164)",
  GOLD: "rgb(255, 207, 107)",
  CORAL: "rgb(249, 143, 121)",
  BLUE: "rgb(96, 190, 247)"
} as const;

export const FLEET_NAMES: readonly FleetName[] = [
  "carrier",
  "battleship",
  "cruiser",
  "submarine",
  "destroyer"
];

export const FLEET_SIZES: Record<FleetName, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 3
};

export const FLEET_LABELS: Record<FleetName, string> = {
  carrier: "Carrier",
  battleship: "Battleship",
  cruiser: "Cruiser",
  submarine: "Submarine",
  destroyer: "Destroyer"
};

export const PLAYER_PANEL: Rect = { x: 34, y: 118, width: 590, height: 526 };
export const ENEMY_PANEL: Rect = { x: 656, y: 118, width: 590, height: 526 };
export const MOBILE_ENEMY_PANEL: Rect = { x: 10, y: 10, width: 540, height: 544 };
export const MOBILE_PLAYER_PANEL: Rect = { x: 10, y: 566, width: 540, height: 544 };
export const ROSTER_PANEL: Rect = { x: 34, y: 660, width: 590, height: 196 };
export const LOG_PANEL: Rect = { x: 656, y: 660, width: 590, height: 196 };
