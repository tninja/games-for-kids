export type AgeMode = "explorer" | "adventurer";
export type LangMode = "en" | "zh" | "dual";
export type PlayMode = "solo" | "pass_and_play";

export type GamePhase =
  | "title"
  | "pass_banner"
  | "stage_intro"
  | "stage_play"
  | "stage_complete"
  | "prayer_card"
  | "journey_finale";

export type StageId =
  | "loaves_and_fish"
  | "run_back_to_jesus"
  | "david_harp"
  | "verse_builder";

export type VerseId =
  | "john_6_11"
  | "luke_17_15_16"
  | "psalm_100_4"
  | "psalm_107_1"
  | "thess_5_18";

export type LeafColor = "gold" | "olive" | "crimson" | "sky";

export type StickerId =
  | "jesus_love"
  | "bible"
  | "family"
  | "church"
  | "food"
  | "healing"
  | "creation"
  | "joy";

export type TileIconId =
  | "bread"
  | "fish"
  | "heart"
  | "cross"
  | "sun"
  | "star"
  | "scroll"
  | "hands";

export type SoundEvent =
  | "pray_blessing"
  | "good_catch"
  | "blessing_token"
  | "gentle_bump"
  | "turn_step"
  | "tile_place"
  | "tile_hint"
  | "stage_win"
  | "prayer_hang"
  | "journey_fanfare"
  | "jesus_chime"
  | "tree_rustle"
  | "harp_0"
  | "harp_1"
  | "harp_2"
  | "harp_3";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface StageSpec {
  id: StageId;
  verseId: VerseId;
  explorerTarget: number;
  adventurerTarget: number;
  adventurerTimeSec: number;
}

export interface VerseTileDef {
  id: string;
  icon: TileIconId;
  text: LocalizedText;
}

export interface QuizQuestionDef {
  id: string;
  verseId: VerseId;
  question: LocalizedText;
  choices: LocalizedText[];
  correctIndex: number;
  encouragement: LocalizedText;
}

export interface VerseDef {
  id: VerseId;
  reference: LocalizedText;
  text: LocalizedText;
  explorerTiles: VerseTileDef[];
  adventurerTiles: VerseTileDef[];
  adventurerDecoy?: VerseTileDef;
}

export interface StickerPreset {
  id: StickerId;
  label: LocalizedText;
  caption: LocalizedText;
  accent: string;
}

export interface StageResult {
  stageId: StageId;
  playerIndex: number;
  stars: 1 | 2 | 3;
  score: number;
  tokensCollected: number;
  verseUnlocked: VerseId;
}

export interface PrayerLeaf {
  id: string;
  authorLabel: string;
  stickerId: StickerId;
  message: string;
  leafColor: LeafColor;
  treeSlot: number;
}

export interface LoavesDropItem {
  id: number;
  x: number; // 0.1..0.9
  y: number; // 0..1
  vy: number;
  swayPhase: number;
  itemType: "loaf" | "fish" | "blessing" | "gust";
}

export type PopKey =
  | ""
  | "popAmen"
  | "popShared"
  | "popBlessing"
  | "popGrace"
  | "popOops"
  | "popTurnBack"
  | "popThankJesus"
  | "popPraise"
  | "popHarmony"
  | "popDoveHelp"
  | "popWindGust";

export interface LoavesStageState {
  kind: "loaves_and_fish";
  prayedWithJesus: boolean;
  prayGlowTimer: number;
  basketX: number; // 0.14..0.86
  sharedCount: number;
  targetCount: number;
  blessingsCollected: number;
  streak: number;
  score: number;
  timeLeftSec: number;
  totalTimeSec: number;
  wobbleTimer: number;
  doveRescueTimer: number;
  doveRescueX: number;
  spawnTimer: number;
  nextItemId: number;
  items: LoavesDropItem[];
  lastPopKey: PopKey;
  lastPopTimer: number;
}

export interface RoadObstacle {
  id: number;
  lane: 0 | 1 | 2;
  y: number; // 0..1
  itemType: "sparkle" | "cart" | "toy";
}

export interface RunBackStageState {
  kind: "run_back_to_jesus";
  subPhase: "road" | "turn_back";
  lane: 0 | 1 | 2;
  sparklesCollected: number;
  targetSparkles: number;
  roadProgress: number; // 0..1 until crossroads
  turnBackProgress: number; // 0..100
  streak: number;
  wobbleTimer: number;
  score: number;
  timeLeftSec: number;
  totalTimeSec: number;
  spawnTimer: number;
  nextItemId: number;
  items: RoadObstacle[];
  lastPopKey: PopKey;
  lastPopTimer: number;
}

export interface VerseBuilderStageState {
  kind: "verse_builder";
  subPhase: "tiles" | "quiz";
  verseQueue: VerseId[];
  verseCursor: number;
  placedTileIds: string[];
  shuffledTileIds: string[];
  decoyTileId: string | null;
  wrongShakeTileId: string | null;
  wrongShakeWasDecoy: boolean;
  wrongShakeTimer: number;
  mistakes: number;
  versesCompleted: number;
  quizQueue: string[];
  quizCursor: number;
  quizFeedback: "none" | "correct" | "retry";
  quizFeedbackTimer: number;
  score: number;
}

export interface HarpNoteItem {
  id: number;
  stringIndex: 0 | 1 | 2 | 3;
  y: number; // 0..1
  golden: boolean;
}

export interface DavidHarpStageState {
  kind: "david_harp";
  notesPlayed: number;
  targetNotes: number;
  streak: number;
  score: number;
  timeLeftSec: number;
  totalTimeSec: number;
  spawnTimer: number;
  doubleBeatPending: boolean;
  melodyStep: number;
  missedCounter: number;
  doveRescueTimer: number;
  doveRescueX: number;
  nextNoteId: number;
  notes: HarpNoteItem[];
  stringGlow: [number, number, number, number];
  lastPopKey: PopKey;
  lastPopTimer: number;
}

export type ActiveStageState =
  | LoavesStageState
  | RunBackStageState
  | DavidHarpStageState
  | VerseBuilderStageState;

export interface FrameInput {
  primaryTap: boolean;
  moveDir: number; // -1 | 0 | 1
  pointerXNorm: number | null; // 0..1
  lanePick: 0 | 1 | 2 | null;
  harpString: 0 | 1 | 2 | 3 | null;
}

export type GameAction =
  | { type: "SET_AGE_MODE"; ageMode: AgeMode }
  | { type: "SET_LANG_MODE"; langMode: LangMode }
  | { type: "SET_PLAY_MODE"; playMode: PlayMode; playerCount?: number }
  | { type: "START_JOURNEY" }
  | { type: "CONFIRM_PASS" }
  | { type: "BEGIN_STAGE" }
  | { type: "PRAY_WITH_JESUS" }
  | { type: "TAP_VERSE_TILE"; tileId: string }
  | { type: "ANSWER_QUIZ"; choiceIndex: number }
  | { type: "NEXT_STAGE" }
  | {
      type: "ADD_PRAYER";
      stickerId: StickerId;
      leafColor: LeafColor;
      customMessage: string;
      authorLabel: string;
    }
  | { type: "FINISH_PRAYERS" }
  | { type: "SHUFFLE_PROMPT" }
  | { type: "POKE_JESUS" }
  | { type: "POKE_TREE" }
  | { type: "POKE_FRIEND" }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_AUTO_READ" }
  | { type: "PLAY_AGAIN" };

export interface GameConfig {
  ageMode?: AgeMode;
  langMode?: LangMode;
  playMode?: PlayMode;
  playerCount?: number;
  seed?: number;
}

export type EasterSource = "none" | "jesus" | "tree" | "friend";

export interface GameState {
  phase: GamePhase;
  ageMode: AgeMode;
  langMode: LangMode;
  playMode: PlayMode;
  playerCount: number;
  activePlayerIndex: number;
  stageIndex: number;
  stageState: ActiveStageState | null;
  results: StageResult[];
  unlockedVerses: VerseId[];
  prayers: PrayerLeaf[];
  promptIndex: number;
  totalStars: number;
  muted: boolean;
  autoRead: boolean;
  elapsedSec: number;
  rngState: number;
  pendingSounds: SoundEvent[];
  easterSource: EasterSource;
  easterLineIndex: number;
  easterTimer: number;
  jesusGlowTimer: number;
  treeRustleTimer: number;
  friendHopTimer: number;
}
