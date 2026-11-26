import { STAGE_SEQUENCE } from "./constants";
import { createPrayerLeaf } from "./gratitude";
import {
  computeStageResult,
  createStageState,
  handleQuizAnswer,
  handleVerseTileTap,
  stepDavidHarpStage,
  stepLoavesStage,
  stepRunBackStage,
  stepVerseBuilderStage
} from "./minigames";
import {
  FrameInput,
  GameAction,
  GameConfig,
  GameState,
  SoundEvent,
  VerseId
} from "./types";
import { BUILDER_VERSE_QUEUE } from "./verses";

export const EMPTY_INPUT: FrameInput = {
  primaryTap: false,
  moveDir: 0,
  pointerXNorm: null,
  lanePick: null,
  harpString: null
};

function nextRng(state: GameState): number {
  state.rngState = (Math.imul(state.rngState, 1664525) + 1013904223) >>> 0;
  return state.rngState / 4294967296;
}

function addUnlockedVerse(state: GameState, verseId: VerseId): void {
  if (state.unlockedVerses.indexOf(verseId) < 0) {
    state.unlockedVerses.push(verseId);
  }
}

function finishActiveStage(state: GameState): void {
  if (!state.stageState) {
    return;
  }
  const res = computeStageResult(state.stageState, state.ageMode, state.activePlayerIndex);
  state.results.push(res);
  state.totalStars += res.stars;
  addUnlockedVerse(state, res.verseUnlocked);
  if (state.stageState.kind === "verse_builder") {
    for (let i = 0; i < BUILDER_VERSE_QUEUE.length; i++) {
      addUnlockedVerse(state, BUILDER_VERSE_QUEUE[i]);
    }
  }
  state.phase = "stage_complete";
  state.pendingSounds.push("stage_win");
}

function enterCurrentStage(state: GameState): void {
  const stageId = STAGE_SEQUENCE[state.stageIndex];
  state.stageState = createStageState(stageId, state.ageMode, () => nextRng(state));
  state.phase = "stage_intro";
}

export function createInitialState(config: GameConfig = {}): GameState {
  return {
    phase: "title",
    ageMode: config.ageMode || "explorer",
    langMode: config.langMode || "dual",
    playMode: "solo",
    playerCount: 1,
    activePlayerIndex: 0,
    stageIndex: 0,
    stageState: null,
    results: [],
    unlockedVerses: [],
    prayers: [],
    promptIndex: 0,
    totalStars: 0,
    muted: false,
    autoRead: false,
    harpMusic: true,
    elapsedSec: 0,
    rngState: (config.seed ?? 20261125) >>> 0,
    pendingSounds: [],
    easterSource: "none",
    easterLineIndex: 0,
    easterTimer: 0,
    jesusGlowTimer: 0,
    treeRustleTimer: 0,
    friendHopTimer: 0
  };
}

export function stepGame(
  state: GameState,
  dtSec: number,
  input: FrameInput = EMPTY_INPUT
): GameState {
  const dt = Math.max(0, Math.min(0.08, dtSec));
  state.elapsedSec += dt;
  if (state.easterTimer > 0) {
    state.easterTimer = Math.max(0, state.easterTimer - dt);
    if (state.easterTimer === 0) {
      state.easterSource = "none";
    }
  }
  if (state.jesusGlowTimer > 0) {
    state.jesusGlowTimer = Math.max(0, state.jesusGlowTimer - dt);
  }
  if (state.treeRustleTimer > 0) {
    state.treeRustleTimer = Math.max(0, state.treeRustleTimer - dt);
  }
  if (state.friendHopTimer > 0) {
    state.friendHopTimer = Math.max(0, state.friendHopTimer - dt);
  }

  if (state.phase !== "stage_play" || !state.stageState) {
    return state;
  }

  let finished = false;
  if (state.stageState.kind === "loaves_and_fish") {
    finished = stepLoavesStage(
      state.stageState,
      state.ageMode,
      dt,
      input,
      () => nextRng(state),
      state.pendingSounds
    );
  } else if (state.stageState.kind === "run_back_to_jesus") {
    finished = stepRunBackStage(
      state.stageState,
      state.ageMode,
      dt,
      input,
      () => nextRng(state),
      state.pendingSounds
    );
  } else if (state.stageState.kind === "david_harp") {
    finished = stepDavidHarpStage(
      state.stageState,
      state.ageMode,
      dt,
      input,
      () => nextRng(state),
      state.pendingSounds
    );
  } else {
    stepVerseBuilderStage(state.stageState, dt);
  }

  if (finished) {
    finishActiveStage(state);
  }
  return state;
}

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_AGE_MODE":
      state.ageMode = action.ageMode;
      break;
    case "SET_LANG_MODE":
      state.langMode = action.langMode;
      break;
    case "SET_PLAY_MODE":
      state.playMode = action.playMode;
      if (action.playMode === "solo") {
        state.playerCount = 1;
      } else {
        const count = action.playerCount ?? Math.max(2, state.playerCount);
        state.playerCount = Math.max(2, Math.min(4, count));
      }
      break;
    case "START_JOURNEY":
      state.stageIndex = 0;
      state.activePlayerIndex = 0;
      state.results = [];
      state.unlockedVerses = [];
      state.prayers = [];
      state.totalStars = 0;
      enterCurrentStage(state);
      break;
    case "CONFIRM_PASS":
      if (state.phase === "pass_banner") {
        enterCurrentStage(state);
      }
      break;
    case "BEGIN_STAGE":
      if (state.phase === "stage_intro") {
        state.phase = "stage_play";
      }
      break;
    case "PRAY_WITH_JESUS":
      if (
        state.phase === "stage_play" &&
        state.stageState &&
        state.stageState.kind === "loaves_and_fish" &&
        !state.stageState.prayedWithJesus
      ) {
        state.stageState.prayedWithJesus = true;
        state.stageState.prayGlowTimer = 1.6;
        state.stageState.score += 100;
        state.stageState.lastPopKey = "popAmen";
        state.stageState.lastPopTimer = 1.1;
        state.pendingSounds.push("pray_blessing");
      }
      break;
    case "TAP_VERSE_TILE":
      if (
        state.phase === "stage_play" &&
        state.stageState &&
        state.stageState.kind === "verse_builder"
      ) {
        const done = handleVerseTileTap(
          state.stageState,
          state.ageMode,
          action.tileId,
          () => nextRng(state),
          state.pendingSounds
        );
        if (done) {
          finishActiveStage(state);
        }
      }
      break;
    case "ANSWER_QUIZ":
      if (
        state.phase === "stage_play" &&
        state.stageState &&
        state.stageState.kind === "verse_builder"
      ) {
        const done = handleQuizAnswer(state.stageState, action.choiceIndex, state.pendingSounds);
        if (done) {
          finishActiveStage(state);
        }
      }
      break;
    case "NEXT_STAGE":
      if (state.phase === "stage_complete") {
        if (state.stageIndex + 1 < STAGE_SEQUENCE.length) {
          state.stageIndex += 1;
          enterCurrentStage(state);
        } else {
          state.stageState = null;
          state.phase = "prayer_card";
        }
      }
      break;
    case "ADD_PRAYER":
      if (state.phase === "prayer_card") {
        const leaf = createPrayerLeaf(
          state.prayers.length,
          action.stickerId,
          action.leafColor,
          action.customMessage,
          action.authorLabel,
          state.langMode
        );
        if (leaf) {
          state.prayers.push(leaf);
          state.pendingSounds.push("prayer_hang");
        }
      }
      break;
    case "FINISH_PRAYERS":
      if (state.phase === "prayer_card") {
        if (state.prayers.length === 0) {
          const fallback = createPrayerLeaf(0, "jesus_love", "gold", "", "", state.langMode);
          if (fallback) {
            state.prayers.push(fallback);
          }
        }
        state.phase = "journey_finale";
        state.pendingSounds.push("journey_fanfare");
      }
      break;
    case "SHUFFLE_PROMPT":
      state.promptIndex += 1;
      break;
    case "POKE_JESUS":
      state.easterSource = "jesus";
      state.easterLineIndex += 1;
      state.easterTimer = 3.2;
      state.jesusGlowTimer = 2.4;
      state.pendingSounds.push("jesus_chime");
      break;
    case "POKE_TREE":
      state.easterSource = "tree";
      state.easterLineIndex += 1;
      state.easterTimer = 3.0;
      state.treeRustleTimer = 2.2;
      state.pendingSounds.push("tree_rustle");
      break;
    case "POKE_FRIEND":
      state.easterSource = "friend";
      state.easterLineIndex += 1;
      state.easterTimer = 3.0;
      state.friendHopTimer = 2.2;
      state.pendingSounds.push("blessing_token");
      break;
    case "TOGGLE_MUTE":
      state.muted = !state.muted;
      break;
    case "TOGGLE_AUTO_READ":
      state.autoRead = !state.autoRead;
      break;
    case "TOGGLE_HARP_MUSIC":
      state.harpMusic = !state.harpMusic;
      break;
    case "PLAY_AGAIN":
      state.phase = "title";
      state.stageIndex = 0;
      state.activePlayerIndex = 0;
      state.stageState = null;
      state.results = [];
      state.unlockedVerses = [];
      state.prayers = [];
      state.totalStars = 0;
      break;
  }
  return state;
}

export function drainSounds(state: GameState): SoundEvent[] {
  if (state.pendingSounds.length === 0) {
    return [];
  }
  const out = state.pendingSounds.slice();
  state.pendingSounds.length = 0;
  return out;
}
