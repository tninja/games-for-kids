export type Team = "blue" | "red";

export type RodRole = "gk" | "def" | "mid" | "fwd";

export type GameMode = "1p" | "2p_coop" | "2p_pvp" | "practice";

export type AiLevel = "rookie" | "amateur" | "pro" | "legend";

export type CameraMode = "angled" | "top" | "closeup";

export type ControlMode = "sync" | "advanced";

export type TeamColorTheme = "classic" | "gold" | "emerald";

export type MatchPhase = "menu" | "serving" | "playing" | "goal" | "gameover";

export type KickPhase = "idle" | "charging" | "swinging" | "recovering";

export type PlayerSlot = "p1" | "p2";

export type SoundEvent =
  | "wood"
  | "kick"
  | "powerKick"
  | "post"
  | "goal"
  | "serve"
  | "whistle"
  | "bumper"
  | "target";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface RodConfig {
  index: number;
  team: Team;
  role: RodRole;
  x: number;
  figureOffsets: readonly number[];
  maxSlide: number;
}

export interface RodState {
  index: number;
  team: Team;
  role: RodRole;
  x: number;
  z: number;
  vz: number;
  angle: number;
  omega: number;
  figureOffsets: readonly number[];
  maxSlide: number;
  kickPhase: KickPhase;
  chargeTime: number;
  swingTimer: number;
  swingDuration: number;
  swingStartAngle: number;
  swingTargetAngle: number;
  swingPower: number;
  cooldown: number;
  prevKickHeld: boolean;
  hitBallThisSwing: boolean;
}

export interface BallState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  spinX: number;
  spinZ: number;
  powerGlow: number;
}

export interface RodCommand {
  slide: number;
  kickHeld: boolean;
  liftHeld: boolean;
  targetZ?: number | null;
  maxSpeedScale?: number;
}

export interface PlayerInput {
  slide: number;
  kickHeld: boolean;
  liftHeld: boolean;
}

export interface PracticeTarget {
  z: number;
  halfWidth: number;
  pulse: number;
}

export interface AiPreset {
  level: AiLevel;
  label: string;
  reactionDelay: number;
  positionError: number;
  maxSpeedScale: number;
  bounceDepth: number;
  kickWindow: number;
  pullShotChance: number;
  chargeChance: number;
  antiOwnGoalChance: number;
  liftClearChance: number;
}

export interface GameOptions {
  seed?: number;
  mode?: GameMode;
  aiLevel?: AiLevel;
  targetScore?: 5 | 7 | 10;
  controlMode?: ControlMode;
  strictSpinNotice?: boolean;
  p1OnDefense?: boolean;
  theme?: TeamColorTheme;
  blueAiOverride?: AiLevel | null;
  onSound?: (event: SoundEvent, intensity?: number) => void;
}

export interface TeamPalette {
  id: TeamColorTheme;
  label: string;
  blueName: string;
  redName: string;
  bluePrimary: number;
  blueTrim: number;
  redPrimary: number;
  redTrim: number;
}
