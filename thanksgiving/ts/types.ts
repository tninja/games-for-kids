export type DifficultyMode = "cozy" | "bustling";
export type PlayMode = "solo" | "pass_and_play" | "laptop_coop";

export type GamePhase =
  | "title"
  | "pass_banner"
  | "dish_play"
  | "dish_complete"
  | "gratitude_tree"
  | "feast_finale";

export type DishId =
  | "golden_toast"
  | "flying_popcorn"
  | "folding_chair"
  | "pretzel_platter"
  | "pumpkin_pie";

export type SnackId = "pretzel" | "orange_bean" | "berry_bean" | "cider";

export type LeafColor = "crimson" | "amber" | "gold" | "russet";

export type StickerId =
  | "family"
  | "food"
  | "play"
  | "pet"
  | "home"
  | "friend"
  | "laugh"
  | "nature";

export interface DishSpec {
  id: DishId;
  title: string;
  shortTitle: string;
  instruction: string;
  guestUnlocked: string;
  cozyTarget: number;
  bustlingTarget: number;
  bustlingTimeSec: number;
}

export interface StickerPreset {
  id: StickerId;
  label: string;
  caption: string;
  accent: string;
}

export interface SnackSpec {
  id: SnackId;
  label: string;
  keyHint: string;
  accent: string;
}

export interface DishResult {
  dishId: DishId;
  chefIndex: number;
  stars: 1 | 2 | 3;
  score: number;
  dishesMade: number;
  guestUnlocked: string;
}

export interface GratitudeLeaf {
  id: string;
  authorLabel: string;
  stickerId: StickerId;
  message: string;
  leafColor: LeafColor;
  treeSlot: number;
}

export interface ToastSlice {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  state: "flying" | "caught" | "rescued" | "hat_bounce";
  age: number;
}

export interface ToastDishState {
  kind: "golden_toast";
  plated: number;
  target: number;
  score: number;
  streak: number;
  timeLeftSec: number | null;
  spawnTimer: number;
  nextId: number;
  slices: ToastSlice[];
  toasterSquash: number;
  birdAssistTimer: number;
  feedbackText: string;
  feedbackTimer: number;
}

export interface FallingSnack {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  itemType: "kernel" | "golden_kernel" | "carrot";
  rotation: number;
  rescued: boolean;
}

export interface PopcornDishState {
  kind: "flying_popcorn";
  caught: number;
  target: number;
  score: number;
  streak: number;
  timeLeftSec: number | null;
  bowlX: number; // 0..1 normalized horizontal position (P1 Beagle Chef)
  bowlWobble: number;
  spawnTimer: number;
  nextId: number;
  items: FallingSnack[];
  birdX: number; // 0..1 normalized horizontal position (AI helper or P2 Little Bird)
  birdAssistTimer: number;
  feedbackText: string;
  feedbackTimer: number;
}

export interface ChairDishState {
  kind: "folding_chair";
  tamedProgress: number; // 0..100
  target: number; // 100
  taps: number;
  score: number;
  timeLeftSec: number | null;
  chairAngle: number; // wobble tilt radians
  chairHopY: number;
  springBackTimer: number;
  tamedCelebrateTimer: number;
  feedbackText: string;
  feedbackTimer: number;
}

export interface PlatterDishState {
  kind: "pretzel_platter";
  plattersDone: number;
  target: number;
  score: number;
  streak: number;
  timeLeftSec: number | null;
  order: SnackId[];
  matchedCount: number;
  wrongFlashTimer: number;
  platterBounce: number;
  birdHintTimer: number;
  feedbackText: string;
  feedbackTimer: number;
}

export interface CreamDot {
  angle: number;
  radius: number;
  size: number;
}

export interface PieDishState {
  kind: "pumpkin_pie";
  piesFinished: number;
  target: number;
  score: number;
  timeLeftSec: number | null;
  stage: "whipping" | "cookie_drop" | "pie_celebrate";
  whipProgress: number; // 0..1
  creamDots: CreamDot[];
  cookieDropY: number; // 0..1 animation
  celebrateTimer: number;
  lastPointerX: number | null;
  birdAssistTimer: number;
  feedbackText: string;
  feedbackTimer: number;
}

export type ActiveDishState =
  | ToastDishState
  | PopcornDishState
  | ChairDishState
  | PlatterDishState
  | PieDishState;

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: "circle" | "star" | "leaf" | "crumb";
}

export type SoundEvent =
  | "toast_pop"
  | "good_catch"
  | "bird_rescue"
  | "bird_chirp"
  | "happy_dance"
  | "silly_bonk"
  | "chair_boing"
  | "cream_swirl"
  | "dish_win"
  | "leaf_hang"
  | "feast_fanfare";

export interface StepInput {
  primaryTap: boolean;
  secondaryTap?: boolean; // Laptop 2P Co-op (Little Bird action)
  moveDir: -1 | 0 | 1; // P1 horizontal move
  moveDirP2?: -1 | 0 | 1; // Laptop 2P Co-op Little Bird horizontal move
  pointerXNorm: number | null; // 0..1 across stage width when dragging
  swipeDelta: number; // normalized motion delta for pie whipping
  snackPick?: SnackId | null; // Pretzel & Jelly Bean Platter pick
}

export interface GameConfig {
  difficulty?: DifficultyMode;
  playMode?: PlayMode;
  chefCount?: number;
  seed?: number;
}

export interface GameState {
  phase: GamePhase;
  difficulty: DifficultyMode;
  playMode: PlayMode;
  chefCount: number;
  activeChefIndex: number;
  stageIndex: number;
  dishState: ActiveDishState | null;
  results: DishResult[];
  seatedGuests: string[];
  leaves: GratitudeLeaf[];
  gratitudeChefCursor: number;
  tablePromptIndex: number;
  totalStars: number;
  muted: boolean;
  elapsedSec: number;
  particles: Particle[];
  pendingSounds: SoundEvent[];
  rngState: number;
  chefDanceTimer: number;
  birdChirpTimer: number;
  easterBubbleText: string;
  easterBubbleTimer: number;
  easterEggCount: number;
}

export type GameAction =
  | { type: "SET_DIFFICULTY"; difficulty: DifficultyMode }
  | { type: "SET_PLAY_MODE"; playMode: PlayMode; chefCount?: number }
  | { type: "START_FEAST" }
  | { type: "CONFIRM_PASS" }
  | { type: "NEXT_STAGE" }
  | {
      type: "ADD_LEAF";
      stickerId: StickerId;
      leafColor: LeafColor;
      customMessage: string;
      authorLabel?: string;
    }
  | { type: "FINISH_GRATITUDE" }
  | { type: "SHUFFLE_PROMPT" }
  | { type: "POKE_CHEF" }
  | { type: "POKE_BIRD" }
  | { type: "TOGGLE_MUTE" }
  | { type: "PLAY_AGAIN" };
