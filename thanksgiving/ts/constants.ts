import { DishId, DishSpec, LeafColor, SnackId, SnackSpec, StickerPreset } from "./types";

export const PALETTE = {
  parchment: "#FFF6E5",
  warmSky: "#FDE8C8",
  warmPanel: "#F7DEC0",
  mapleCrimson: "#D95D39",
  pumpkinGold: "#F2A541",
  toastedSienna: "#8C4A27",
  sageLeaf: "#6B8F71",
  ink: "#2D2420",
  butter: "#FFE58F",
  cream: "#FFFDF7",
  birdYellow: "#FFD447",
  tableclothRed: "#C94A38",
  skyBlue: "#AED4E6",
  berryPurple: "#A5406B"
} as const;

export const LEAF_COLORS: Record<LeafColor, { fill: string; vein: string; label: string }> = {
  crimson: { fill: "#D95D39", vein: "#8E2D15", label: "Crimson" },
  amber: { fill: "#E58A32", vein: "#995111", label: "Amber" },
  gold: { fill: "#F2C14E", vein: "#9C7516", label: "Gold" },
  russet: { fill: "#A85634", vein: "#5E2B14", label: "Russet" }
};

export const DISH_SEQUENCE: DishId[] = [
  "golden_toast",
  "flying_popcorn",
  "folding_chair",
  "pretzel_platter",
  "pumpkin_pie"
];

export const DISH_SPECS: Record<DishId, DishSpec> = {
  golden_toast: {
    id: "golden_toast",
    title: "Golden Pop-Up Toast",
    shortTitle: "Pop-Up Toast",
    instruction: "Tap CATCH when the toast pops into the golden zone!",
    guestUnlocked: "Little Sister & Puppy Pal",
    cozyTarget: 5,
    bustlingTarget: 7,
    bustlingTimeSec: 32
  },
  flying_popcorn: {
    id: "flying_popcorn",
    title: "Flying Popcorn Bowl",
    shortTitle: "Flying Popcorn",
    instruction: "Slide the bowl to catch popcorn and dodge silly carrots!",
    guestUnlocked: "Grandma & Grandpa",
    cozyTarget: 10,
    bustlingTarget: 16,
    bustlingTimeSec: 34
  },
  folding_chair: {
    id: "folding_chair",
    title: "Runaway Folding Chair!",
    shortTitle: "Folding Chair",
    instruction: "Tap fast to fold and tame the bouncy backyard lawn chair!",
    guestUnlocked: "Neighborhood Friends",
    cozyTarget: 100,
    bustlingTarget: 100,
    bustlingTimeSec: 18
  },
  pretzel_platter: {
    id: "pretzel_platter",
    title: "Pretzel & Jelly Bean Platter",
    shortTitle: "Snack Platter",
    instruction: "Tap the matching snacks in order to fill each party platter!",
    guestUnlocked: "Cousins",
    cozyTarget: 4,
    bustlingTarget: 6,
    bustlingTimeSec: 34
  },
  pumpkin_pie: {
    id: "pumpkin_pie",
    title: "Swirl Pumpkin Pie",
    shortTitle: "Pumpkin Pie",
    instruction: "Swipe or tap to swirl whipped cream, then drop the maple cookie!",
    guestUnlocked: "Mom & Dad",
    cozyTarget: 2,
    bustlingTarget: 3,
    bustlingTimeSec: 32
  }
};

export const SNACK_IDS: SnackId[] = ["pretzel", "orange_bean", "berry_bean", "cider"];

export const SNACK_SPECS: SnackSpec[] = [
  { id: "pretzel", label: "Pretzel", keyHint: "1", accent: "#C77D3A" },
  { id: "orange_bean", label: "Orange Bean", keyHint: "2", accent: "#F29132" },
  { id: "berry_bean", label: "Berry Bean", keyHint: "3", accent: "#A5406B" },
  { id: "cider", label: "Apple Cider", keyHint: "4", accent: "#B8472F" }
];

export const STICKER_PRESETS: StickerPreset[] = [
  { id: "family", label: "Family", caption: "Thankful for my family!", accent: "#D95D39" },
  { id: "food", label: "Feast", caption: "Thankful for yummy food!", accent: "#E58A32" },
  { id: "play", label: "Play", caption: "Thankful for fun games together!", accent: "#5A8F7B" },
  { id: "pet", label: "Pets", caption: "Thankful for our furry friends!", accent: "#B06D3B" },
  { id: "home", label: "Home", caption: "Thankful for a cozy home!", accent: "#C95B48" },
  { id: "friend", label: "Friends", caption: "Thankful for kind friends!", accent: "#D49B2A" },
  { id: "laugh", label: "Laughs", caption: "Thankful for silly laughs!", accent: "#D16A47" },
  { id: "nature", label: "Autumn", caption: "Thankful for colorful autumn leaves!", accent: "#6B8F71" }
];

export const TABLE_PROMPTS: string[] = [
  "Turn to someone nearby and share one thing that made you laugh this year!",
  "What was the yummiest or funniest dish you wish Beagle Chef cooked today?",
  "Say thank you to one person in the room for a small kindness they showed you.",
  "If our family invented a silly Thanksgiving dish, what would we put in it?",
  "Name one cozy memory from this year you would hang on our Gratitude Tree!",
  "Give someone at the table a high-five and tell them one thing they are great at!",
  "If a tiny yellow bird helped cook dinner tonight, what dish would it make?",
  "Would you rather eat giant buttery popcorn or a mountain of pumpkin pie?",
  "Share one thing you learned this year that made you feel proud!",
  "Pick someone at the table and invent a funny chef nickname for them!"
];

export const CHEF_EASTER_LINES: string[] = [
  "Happy Dance! Toast & popcorn for everyone!",
  "Woof! Watch out for that bouncy lawn chair!",
  "Extra whipped cream on the pumpkin pie, please!",
  "Best backyard Thanksgiving crew ever!",
  "Chef hat on! Let's make yummy memories!"
];

export const BIRD_EASTER_LINES: string[] = [
  "|||| '||' ||! (Happy Thanksgiving!)",
  "|| '| ||'! (Pass the jelly beans!)",
  "'|| ||| '|! (Best sous-chef ever!)",
  "|||| ''|! (Save me a pumpkin crumb!)"
];

export interface TreeSlotCoord {
  x: number; // normalized 0..1 on tree canopy box
  y: number;
  tilt: number; // radians
}

export const TREE_LEAF_SLOTS: TreeSlotCoord[] = [
  { x: 0.24, y: 0.34, tilt: -0.35 },
  { x: 0.48, y: 0.22, tilt: 0.12 },
  { x: 0.72, y: 0.32, tilt: 0.38 },
  { x: 0.33, y: 0.52, tilt: -0.22 },
  { x: 0.62, y: 0.49, tilt: 0.24 },
  { x: 0.18, y: 0.54, tilt: -0.45 },
  { x: 0.80, y: 0.52, tilt: 0.42 },
  { x: 0.48, y: 0.42, tilt: -0.08 },
  { x: 0.36, y: 0.28, tilt: -0.18 },
  { x: 0.61, y: 0.27, tilt: 0.22 },
  { x: 0.28, y: 0.66, tilt: -0.28 },
  { x: 0.68, y: 0.65, tilt: 0.26 }
];

export const MAX_CUSTOM_NOTE_LEN = 48;
export const MAX_LEAVES = 12;
export const STAGE_LOGICAL_W = 420;
export const STAGE_LOGICAL_H = 440;
