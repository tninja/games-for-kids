import { COVER, type ArtId, type Point, type Rect } from "./data";

export type StageId = 0 | 1 | 2 | 3 | 4;
export type EnemyRole = "chaser" | "shooter" | "charger" | "guard";
export type GoalKind = "defeat" | "rescue" | "collect" | "lantern" | "beacon";
export interface Stage {
  id: StageId; name: string; subtitle: string; symbol: string;
  theme: "meadow" | "woods" | "quarry" | "ember" | "sky";
  colors: { ground: string; edge: string; line: string; stone: string; leaf: string; accent: string };
  cover: readonly Rect[];
  boss: { art: ArtId; name: string; style: "punch" | "haunt" | "quake" | "eruption" | "water" };
  enemies: readonly EnemyRole[];
  enemyArt: Partial<Record<EnemyRole, ArtId>>;
  strength: number;
  goal: { kind: GoalKind; label: string; count: number; points: readonly Point[] };
}

export const STAGES: readonly Stage[] = [
  {
    id: 0, name: "Meadow Camp", subtitle: "Your first trainer badge", symbol: "\u2740", theme: "meadow",
    colors: { ground: "#42795a", edge: "#305947", line: "#c8e2af", stone: "#b0bda0", leaf: "#638e63", accent: "#ffd56a" },
    cover: COVER, boss: { art: "machamp", name: "Machamp", style: "punch" },
    enemies: ["chaser", "shooter", "charger", "guard"], enemyArt: {}, strength: 1,
    goal: { kind: "defeat", label: "Clear 12 challengers", count: 12, points: [] }
  },
  {
    id: 1, name: "Moonlit Woods", subtitle: "Find friends among the trees", symbol: "\u263D", theme: "woods",
    colors: { ground: "#34465d", edge: "#202e46", line: "#bcaee2", stone: "#767e9c", leaf: "#73618a", accent: "#c6a0ff" },
    cover: [{ x: 205, y: 205, w: 85, h: 100 }, { x: 710, y: 205, w: 85, h: 100 }, { x: 330, y: 360, w: 90, h: 65 }, { x: 580, y: 360, w: 90, h: 65 }],
    boss: { art: "duskull", name: "Duskull", style: "haunt" },
    enemies: ["chaser", "shooter", "shooter", "charger"], enemyArt: { chaser: "spewpa", shooter: "duskull" }, strength: 1.04,
    goal: { kind: "rescue", label: "Help 2 lost friends", count: 2, points: [{ x: 135, y: 445 }, { x: 865, y: 180 }] }
  },
  {
    id: 2, name: "Crystal Quarry", subtitle: "Golden waves and glittering paths", symbol: "\u25C6", theme: "quarry",
    colors: { ground: "#6f6858", edge: "#464d4e", line: "#e6d5a9", stone: "#afb7a9", leaf: "#9a936d", accent: "#9beaff" },
    cover: [{ x: 220, y: 185, w: 155, h: 60 }, { x: 625, y: 185, w: 155, h: 60 }, { x: 220, y: 365, w: 95, h: 100 }, { x: 685, y: 365, w: 95, h: 100 }],
    boss: { art: "steelix", name: "Radiant Steelix", style: "quake" },
    enemies: ["guard", "guard", "charger", "shooter"], enemyArt: {}, strength: 1.1,
    goal: { kind: "collect", label: "Gather 4 crystals", count: 4, points: [{ x: 120, y: 135 }, { x: 875, y: 140 }, { x: 120, y: 500 }, { x: 870, y: 500 }] }
  },
  {
    id: 3, name: "Ember Ruins", subtitle: "Light the old lanterns", symbol: "\u2668", theme: "ember",
    colors: { ground: "#78504b", edge: "#472d39", line: "#f5c591", stone: "#b08a75", leaf: "#ae704f", accent: "#ffb080" },
    cover: [{ x: 235, y: 240, w: 100, h: 110 }, { x: 665, y: 240, w: 100, h: 110 }, { x: 445, y: 285, w: 110, h: 65 }],
    boss: { art: "darmanitan", name: "Darmanitan", style: "eruption" },
    enemies: ["shooter", "charger", "shooter", "guard"], enemyArt: { shooter: "darmanitan" }, strength: 1.14,
    goal: { kind: "lantern", label: "Light 3 lanterns", count: 3, points: [{ x: 145, y: 445 }, { x: 500, y: 230 }, { x: 855, y: 445 }] }
  },
  {
    id: 4, name: "Sky Temple", subtitle: "Earn the final sky badge", symbol: "\u2736", theme: "sky",
    colors: { ground: "#507d8e", edge: "#294c67", line: "#c4f5ff", stone: "#adc9cc", leaf: "#89bbbd", accent: "#a5efff" },
    cover: [{ x: 220, y: 205, w: 85, h: 155 }, { x: 695, y: 205, w: 85, h: 155 }, { x: 445, y: 315, w: 110, h: 60 }],
    boss: { art: "greninja", name: "Greninja", style: "water" },
    enemies: ["charger", "guard", "shooter", "chaser"], enemyArt: { charger: "greninja", shooter: "spewpa" }, strength: 1.2,
    goal: { kind: "beacon", label: "Charge 2 sky beacons", count: 2, points: [{ x: 130, y: 310 }, { x: 870, y: 310 }] }
  }
];

export function stage(id: number = 0): Stage { return STAGES.find(item => item.id === id) ?? STAGES[0]; }
