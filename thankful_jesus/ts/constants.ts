import { LeafColor, StageId, StageSpec } from "./types";

export const PALETTE = {
  parchment: "#FFF8EB",
  warmSky: "#E8F4FA",
  galileeBlue: "#AED9E8",
  warmPanel: "#F9EBD3",
  sunGold: "#F6C453",
  warmGold: "#E5A93B",
  oliveGreen: "#6F9463",
  oliveDark: "#4B6A42",
  terracotta: "#D46A43",
  terracottaDark: "#A94A27",
  sandalwood: "#B87A4B",
  robeCream: "#FFFDF7",
  sashCrimson: "#C64B3B",
  ink: "#2E241E",
  mutedInk: "#665042",
  skyAccent: "#5A95B8"
} as const;

export const LEAF_COLORS: Record<LeafColor, { fill: string; vein: string }> = {
  gold: { fill: "#F2C14E", vein: "#9C7516" },
  olive: { fill: "#6F9463", vein: "#3F5D37" },
  crimson: { fill: "#D46A43", vein: "#8C381A" },
  sky: { fill: "#6BA8C9", vein: "#3B6A85" }
};

export const LEAF_COLOR_ORDER: LeafColor[] = ["gold", "olive", "crimson", "sky"];

export const STAGE_SEQUENCE: StageId[] = [
  "loaves_and_fish",
  "run_back_to_jesus",
  "david_harp",
  "verse_builder"
];

export interface HarpStringSpec {
  index: 0 | 1 | 2 | 3;
  noteLabel: string;
  keyHint: string;
  color: string;
}

export const HARP_STRING_SPECS: HarpStringSpec[] = [
  { index: 0, noteLabel: "Do", keyHint: "1", color: "#D46A43" },
  { index: 1, noteLabel: "Re", keyHint: "2", color: "#E5A93B" },
  { index: 2, noteLabel: "Mi", keyHint: "3", color: "#6F9463" },
  { index: 3, noteLabel: "Sol", keyHint: "4", color: "#5A95B8" }
];

export const STAGE_SPECS: Record<StageId, StageSpec> = {
  loaves_and_fish: {
    id: "loaves_and_fish",
    verseId: "john_6_11",
    explorerTarget: 10,
    adventurerTarget: 16,
    adventurerTimeSec: 36
  },
  run_back_to_jesus: {
    id: "run_back_to_jesus",
    verseId: "luke_17_15_16",
    explorerTarget: 8,
    adventurerTarget: 12,
    adventurerTimeSec: 34
  },
  david_harp: {
    id: "david_harp",
    verseId: "psalm_100_4",
    explorerTarget: 10,
    adventurerTarget: 16,
    adventurerTimeSec: 34
  },
  verse_builder: {
    id: "verse_builder",
    verseId: "thess_5_18",
    explorerTarget: 2,
    adventurerTarget: 2,
    adventurerTimeSec: 60
  }
};

export interface TreeSlotCoord {
  x: number;
  y: number;
  tilt: number;
}

export const TREE_LEAF_SLOTS: TreeSlotCoord[] = [
  { x: 0.24, y: 0.34, tilt: -0.32 },
  { x: 0.50, y: 0.22, tilt: 0.10 },
  { x: 0.74, y: 0.34, tilt: 0.36 },
  { x: 0.34, y: 0.50, tilt: -0.20 },
  { x: 0.64, y: 0.49, tilt: 0.22 },
  { x: 0.19, y: 0.55, tilt: -0.40 },
  { x: 0.80, y: 0.53, tilt: 0.38 },
  { x: 0.49, y: 0.41, tilt: -0.08 },
  { x: 0.37, y: 0.29, tilt: -0.16 },
  { x: 0.62, y: 0.28, tilt: 0.19 },
  { x: 0.29, y: 0.66, tilt: -0.26 },
  { x: 0.69, y: 0.65, tilt: 0.25 }
];

export const MAX_CUSTOM_NOTE_LEN = 56;
export const MAX_PRAYERS = 12;
export const STAGE_LOGICAL_W = 420;
export const STAGE_LOGICAL_H = 440;
