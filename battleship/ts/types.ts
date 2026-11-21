export type BoardSize = 7 | 10;
export type Direction = "vertical" | "horizontal";
export type FleetName = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
export type Coord = [number, number];
export type HitRecord = [number, number, boolean];
export type Difficulty = "easy" | "normal" | "hard";
export type PlayMode = "1p" | "2p";
export type RuleMode = "classic" | "streak" | "salvo";
export type WeaponKind = "shot" | "sonar" | "bomb";
export type GamePhase = "battle" | "place" | "handoff" | "gameover";
export type CaptainMood = "neutral" | "happy" | "shocked" | "taunt" | "proud" | "defeated";
export type TextAlign = "left" | "center" | "right";

export type SoundKind =
  | "launch"
  | "miss"
  | "hit"
  | "sunk"
  | "win"
  | "lose"
  | "click"
  | "sonar"
  | "bomb"
  | "combo"
  | "place"
  | "rotate";

export type ButtonAction =
  | "toggle_sound"
  | "reroll"
  | "toggle_size"
  | "new_game"
  | "toggle_mode"
  | "cycle_ai"
  | "cycle_rules"
  | "toggle_helper"
  | "toggle_place"
  | "select_shot"
  | "select_sonar"
  | "select_bomb"
  | "rotate_ship"
  | "finish_place"
  | "confirm_handoff";

export type BadgeId =
  | "first_win"
  | "sharpshooter"
  | "comeback_kid"
  | "sonar_detective"
  | "bomb_blast"
  | "hot_streak"
  | "admiral_slayer";

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

export interface ShotCellOutcome {
  coord: string;
  row: number;
  col: number;
  hit: FleetName | null;
  sunk: FleetName | null;
}

export interface FireResult {
  accepted: boolean;
  reason?: "game_over" | "out_of_bounds" | "already_fired" | "not_ready" | "no_charges";
  coord?: string;
  hit?: FleetName | null;
  sunk?: FleetName | null;
  cells?: ShotCellOutcome[];
  computerShot?: ComputerShotInfo | null;
  computerShots?: ComputerShotInfo[];
  bonusTurn?: boolean;
  streakCount?: number;
  salvoRemaining?: number;
  handoffRequired?: boolean;
  gameOver?: boolean;
  winner?: string | null;
}

export interface SonarScan {
  row: number;
  col: number;
  count: number;
  turnUsed: number;
}

export interface SonarResult {
  accepted: boolean;
  reason?: "game_over" | "out_of_bounds" | "no_charges" | "not_ready" | "already_scanned_turn";
  row?: number;
  col?: number;
  coord?: string;
  count?: number;
}

export interface HelperHint {
  axis: "row" | "col";
  index: number;
  label: string;
}

export interface CaptainInfo {
  difficulty: Difficulty;
  name: string;
  title: string;
  line: string;
  mood: CaptainMood;
}

export interface GameSummary {
  winner: string;
  playerWon: boolean;
  shots: number;
  hits: number;
  accuracy: number;
  stars: number;
  bestStreak: number;
  shipsRemaining: number;
  newBadges: BadgeId[];
  rankName: string;
  totalStars: number;
}

export interface ProfileData {
  wins: number;
  games: number;
  stars: number;
  badges: BadgeId[];
}

export interface ButtonSpec {
  rect: Rect;
  label: string;
  action: ButtonAction;
  disabled: boolean;
  active?: boolean;
  accent?: string;
}

export interface MobileButtonSpec {
  label: string;
  action: ButtonAction;
  disabled: boolean;
  active?: boolean;
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
  winner: string | null;
  phase: GamePhase;
  playMode: PlayMode;
  activePlayerName: string;
  handoffTitle: string;
  difficulty: Difficulty;
  ruleMode: RuleMode;
  helperMode: boolean;
  weapon: WeaponKind;
  sonarLeft: number;
  bombLeft: number;
  captain: CaptainInfo | null;
  rankName: string;
  totalStars: number;
  badgeCount: number;
  summary: GameSummary | null;
  buttons: MobileButtonSpec[];
  modeButtons: MobileButtonSpec[];
  skillButtons: MobileButtonSpec[];
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
  radius?: number;
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
  kind?: "spark" | "debris" | "smoke" | "foam";
  angle?: number;
  vAngle?: number;
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

export interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface HitBurst {
  x: number;
  y: number;
  cellSize: number;
  life: number;
  maxLife: number;
  isSunk: boolean;
}

export interface SinkAnim {
  life: number;
  maxLife: number;
}

export interface BattleCam {
  fleetName: FleetName;
  title: string;
  subtitle: string;
  isEnemy: boolean;
  life: number;
  maxLife: number;
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
  closePath?: () => void;
  setLineDash?: (segments: number[]) => void;
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
  INK: "rgb(240, 249, 255)",
  MUTED: "rgb(172, 206, 224)",
  NAVY: "rgb(12, 42, 68)",
  PANEL: "rgb(20, 60, 92)",
  CARD: "rgb(30, 78, 114)",
  BORDER: "rgb(74, 134, 172)",
  OCEAN: "rgb(18, 92, 144)",
  OCEAN_ALT: "rgb(22, 102, 156)",
  OCEAN_HOVER: "rgb(42, 134, 192)",
  OCEAN_MISS: "rgb(17, 68, 108)",
  WAVE: "rgb(108, 196, 240)",
  SHIP_FILL: "rgb(148, 174, 190)",
  SHIP_DARK: "rgb(92, 116, 134)",
  SHIP_ACCENT: "rgb(224, 238, 246)",
  SHIP_SUNK: "rgb(98, 54, 68)",
  GREEN: "rgb(138, 242, 168)",
  SONAR: "rgb(82, 236, 178)",
  GOLD: "rgb(255, 214, 92)",
  CORAL: "rgb(255, 118, 102)",
  ORANGE: "rgb(255, 162, 76)",
  BLUE: "rgb(104, 206, 255)",
  PURPLE: "rgb(190, 152, 255)"
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

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard"
};

export const RULE_LABELS: Record<RuleMode, string> = {
  classic: "Classic",
  streak: "Streak",
  salvo: "Salvo"
};

export const BADGE_LABELS: Record<BadgeId, string> = {
  first_win: "First Win",
  sharpshooter: "Sharpshooter",
  comeback_kid: "Comeback Kid",
  sonar_detective: "Sonar Detective",
  bomb_blast: "Bomb Blast",
  hot_streak: "Hot Streak",
  admiral_slayer: "Admiral Slayer"
};

export const PLAYER_PANEL: Rect = { x: 34, y: 118, width: 590, height: 526 };
export const ENEMY_PANEL: Rect = { x: 656, y: 118, width: 590, height: 526 };
export const MOBILE_ENEMY_PANEL: Rect = { x: 10, y: 10, width: 540, height: 544 };
export const MOBILE_PLAYER_PANEL: Rect = { x: 10, y: 566, width: 540, height: 544 };
export const ROSTER_PANEL: Rect = { x: 34, y: 660, width: 590, height: 196 };
export const LOG_PANEL: Rect = { x: 656, y: 660, width: 590, height: 196 };
