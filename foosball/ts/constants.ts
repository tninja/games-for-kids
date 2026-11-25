import { AiLevel, AiPreset, RodConfig, RodRole, TeamColorTheme, TeamPalette } from "./types";

// Playing field dimensions in meters (standard foosball table proportions)
export const FIELD_LENGTH = 1.20;
export const FIELD_WIDTH = 0.68;
export const HALF_LENGTH = FIELD_LENGTH / 2;
export const HALF_WIDTH = FIELD_WIDTH / 2;

export const GOAL_WIDTH = 0.21;
export const HALF_GOAL_WIDTH = GOAL_WIDTH / 2;
export const GOAL_DEPTH = 0.085;
export const GOAL_HEIGHT = 0.082;

export const BALL_RADIUS = 0.0175;
export const ROD_Y = 0.068;
export const ROD_RADIUS = 0.0068;

export const FIGURE_LEG_LENGTH = 0.056;
export const FIGURE_FOOT_DEPTH = 0.018;
export const FIGURE_WIDTH = 0.028;

export const PHYSICS_SUBSTEPS = 4;
export const MAX_BALL_SPEED = 2.85;
export const BALL_ROLL_DRAG = 0.42;
export const WALL_RESTITUTION = 0.82;
export const POST_RESTITUTION = 0.86;

export const ROD_SLIDE_SPEED = 1.02;
export const ROD_SLIDE_ACCEL = 16.0;
export const BUMPER_MARGIN = 0.036;

export const LIFT_ANGLE = 1.38;
export const LIFT_CLEARANCE_ANGLE = 0.96;
export const MAX_SWING_ANGLE = 0.92;
export const MAX_CHARGE_TIME = 0.55;
export const TAP_KICK_SPEED = 1.24;
export const CHARGE_BONUS_MULTIPLIER = 0.78;
export const PULL_SHOT_FRICTION = 0.65;
export const KICK_COOLDOWN = 0.13;
export const SWING_DURATION = 0.125;

export const CORNER_RAMP_SIZE = 0.098;
export const CORNER_RAMP_ACCEL = 0.65;
export const DEAD_BALL_SPEED = 0.04;
export const DEAD_BALL_TIMEOUT = 2.0;

export const GOAL_CELEBRATION_TIME = 1.45;
export const SERVE_DROP_TIME = 0.45;

export const ROD_ROLE_ORDER: readonly RodRole[] = ["gk", "def", "mid", "fwd"];

function centeredOffsets(count: number, spacing: number): number[] {
  const out: number[] = [];
  const start = -((count - 1) * spacing) / 2;
  for (let i = 0; i < count; i++) {
    out.push(Number((start + i * spacing).toFixed(4)));
  }
  return out;
}

function computeMaxSlide(offsets: readonly number[], overrideMax?: number): number {
  const halfSpan = offsets.length > 0 ? Math.abs(offsets[offsets.length - 1]) : 0;
  const physicalLimit = Math.max(0.05, HALF_WIDTH - BUMPER_MARGIN - halfSpan);
  if (overrideMax !== undefined) {
    return Math.min(physicalLimit, overrideMax);
  }
  return Number(physicalLimit.toFixed(4));
}

const GK_OFFSETS = centeredOffsets(1, 0);
const DEF_OFFSETS = centeredOffsets(2, 0.22);
const MID_OFFSETS = centeredOffsets(5, 0.118);
const FWD_OFFSETS = centeredOffsets(3, 0.185);

// Standard 8-rod 1-2-5-3 interleaved layout (Blue defends -X, Red defends +X)
export const ROD_CONFIGS: readonly RodConfig[] = [
  { index: 0, team: "blue", role: "gk", x: -0.525, figureOffsets: GK_OFFSETS, maxSlide: computeMaxSlide(GK_OFFSETS, 0.122) },
  { index: 1, team: "blue", role: "def", x: -0.375, figureOffsets: DEF_OFFSETS, maxSlide: computeMaxSlide(DEF_OFFSETS) },
  { index: 2, team: "red", role: "fwd", x: -0.225, figureOffsets: FWD_OFFSETS, maxSlide: computeMaxSlide(FWD_OFFSETS) },
  { index: 3, team: "blue", role: "mid", x: -0.075, figureOffsets: MID_OFFSETS, maxSlide: computeMaxSlide(MID_OFFSETS) },
  { index: 4, team: "red", role: "mid", x: 0.075, figureOffsets: MID_OFFSETS, maxSlide: computeMaxSlide(MID_OFFSETS) },
  { index: 5, team: "blue", role: "fwd", x: 0.225, figureOffsets: FWD_OFFSETS, maxSlide: computeMaxSlide(FWD_OFFSETS) },
  { index: 6, team: "red", role: "def", x: 0.375, figureOffsets: DEF_OFFSETS, maxSlide: computeMaxSlide(DEF_OFFSETS) },
  { index: 7, team: "red", role: "gk", x: 0.525, figureOffsets: GK_OFFSETS, maxSlide: computeMaxSlide(GK_OFFSETS, 0.122) }
];

export const AI_PRESETS: Record<AiLevel, AiPreset> = {
  rookie: {
    level: "rookie",
    label: "Rookie",
    reactionDelay: 0.24,
    positionError: 0.068,
    maxSpeedScale: 0.52,
    bounceDepth: 0,
    kickWindow: 0.055,
    pullShotChance: 0.05,
    chargeChance: 0.0,
    antiOwnGoalChance: 0.25,
    liftClearChance: 0.0
  },
  amateur: {
    level: "amateur",
    label: "Amateur",
    reactionDelay: 0.14,
    positionError: 0.036,
    maxSpeedScale: 0.72,
    bounceDepth: 0,
    kickWindow: 0.065,
    pullShotChance: 0.22,
    chargeChance: 0.2,
    antiOwnGoalChance: 0.65,
    liftClearChance: 0.25
  },
  pro: {
    level: "pro",
    label: "Pro",
    reactionDelay: 0.075,
    positionError: 0.017,
    maxSpeedScale: 0.9,
    bounceDepth: 1,
    kickWindow: 0.078,
    pullShotChance: 0.55,
    chargeChance: 0.45,
    antiOwnGoalChance: 0.92,
    liftClearChance: 0.65
  },
  legend: {
    level: "legend",
    label: "Legend",
    reactionDelay: 0.035,
    positionError: 0.006,
    maxSpeedScale: 1.05,
    bounceDepth: 2,
    kickWindow: 0.088,
    pullShotChance: 0.8,
    chargeChance: 0.65,
    antiOwnGoalChance: 0.99,
    liftClearChance: 0.9
  }
};

export const TEAM_PALETTES: Record<TeamColorTheme, TeamPalette> = {
  classic: {
    id: "classic",
    label: "Classic Blue vs Red",
    blueName: "BLUE",
    redName: "RED",
    bluePrimary: 0x1d6fe2,
    blueTrim: 0xeaf2ff,
    redPrimary: 0xd93535,
    redTrim: 0xfff0ea
  },
  gold: {
    id: "gold",
    label: "Gold vs Charcoal",
    blueName: "GOLD",
    redName: "ONYX",
    bluePrimary: 0xe6a817,
    blueTrim: 0x1f2933,
    redPrimary: 0x2c343f,
    redTrim: 0xf7d060
  },
  emerald: {
    id: "emerald",
    label: "Teal vs Orange",
    blueName: "TEAL",
    redName: "ORANGE",
    bluePrimary: 0x0f9d8a,
    blueTrim: 0xe6fff9,
    redPrimary: 0xe86a24,
    redTrim: 0xfff3e6
  }
};

export const THEME_ORDER: readonly TeamColorTheme[] = ["classic", "gold", "emerald"];
export const AI_LEVEL_ORDER: readonly AiLevel[] = ["rookie", "amateur", "pro", "legend"];
