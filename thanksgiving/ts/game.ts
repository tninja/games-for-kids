import {
  BIRD_EASTER_LINES,
  CHEF_EASTER_LINES,
  DISH_SEQUENCE,
  DISH_SPECS,
  PALETTE,
  TABLE_PROMPTS
} from "./constants";
import { createGratitudeLeaf } from "./gratitude";
import { createDishState, stepActiveDish } from "./minigames";
import { GameAction, GameConfig, GameState, StepInput } from "./types";

export const EMPTY_INPUT: StepInput = {
  primaryTap: false,
  secondaryTap: false,
  moveDir: 0,
  moveDirP2: 0,
  pointerXNorm: null,
  swipeDelta: 0,
  snackPick: null
};

export function nextRandom(state: GameState): number {
  state.rngState = (state.rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(state.rngState ^ (state.rngState >>> 15), 1 | state.rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function createInitialState(config: GameConfig = {}): GameState {
  const playMode = config.playMode ?? "pass_and_play";
  const rawCount =
    config.chefCount ?? (playMode === "solo" ? 1 : playMode === "laptop_coop" ? 2 : 2);
  const chefCount =
    playMode === "solo"
      ? 1
      : playMode === "laptop_coop"
        ? 2
        : Math.max(2, Math.min(4, rawCount));
  return {
    phase: "title",
    difficulty: config.difficulty ?? "cozy",
    playMode,
    chefCount,
    activeChefIndex: 0,
    stageIndex: 0,
    dishState: null,
    results: [],
    seatedGuests: ["Beagle Chef", "Little Bird"],
    leaves: [],
    gratitudeChefCursor: 0,
    tablePromptIndex: Math.abs((config.seed ?? 2026) % TABLE_PROMPTS.length),
    totalStars: 0,
    muted: false,
    elapsedSec: 0,
    particles: [],
    pendingSounds: [],
    rngState: (config.seed ?? 20261125) | 0,
    chefDanceTimer: 0,
    birdChirpTimer: 0,
    easterBubbleText: "",
    easterBubbleTimer: 0,
    easterEggCount: 0
  };
}

export function getCurrentDishId(state: GameState) {
  return DISH_SEQUENCE[Math.min(state.stageIndex, DISH_SEQUENCE.length - 1)];
}

export function getChefLabel(chefIndex: number): string {
  return "Chef " + String(chefIndex + 1);
}

function beginCurrentDish(state: GameState): void {
  const dishId = getCurrentDishId(state);
  state.dishState = createDishState(dishId, state.difficulty, () => nextRandom(state));
  state.phase = "dish_play";
}

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_DIFFICULTY": {
      state.difficulty = action.difficulty;
      return state;
    }
    case "SET_PLAY_MODE": {
      state.playMode = action.playMode;
      if (action.playMode === "solo") {
        state.chefCount = 1;
      } else if (action.playMode === "laptop_coop") {
        state.chefCount = 2;
      } else {
        const count = action.chefCount ?? Math.max(2, state.chefCount);
        state.chefCount = Math.max(2, Math.min(4, count));
      }
      return state;
    }
    case "START_FEAST": {
      state.stageIndex = 0;
      state.activeChefIndex = 0;
      state.results = [];
      state.seatedGuests = ["Beagle Chef", "Little Bird"];
      state.leaves = [];
      state.gratitudeChefCursor = 0;
      state.totalStars = 0;
      state.particles = [];
      if (state.playMode === "pass_and_play" && state.chefCount > 1) {
        state.phase = "pass_banner";
        state.dishState = null;
      } else {
        beginCurrentDish(state);
      }
      return state;
    }
    case "CONFIRM_PASS": {
      if (state.phase === "pass_banner") {
        beginCurrentDish(state);
      }
      return state;
    }
    case "NEXT_STAGE": {
      if (state.phase !== "dish_complete") {
        return state;
      }
      const nextIdx = state.stageIndex + 1;
      if (nextIdx >= DISH_SEQUENCE.length) {
        state.phase = "gratitude_tree";
        state.dishState = null;
        state.gratitudeChefCursor = 0;
        return state;
      }
      state.stageIndex = nextIdx;
      state.activeChefIndex = nextIdx % state.chefCount;
      if (state.playMode === "pass_and_play" && state.chefCount > 1) {
        state.phase = "pass_banner";
        state.dishState = null;
      } else {
        beginCurrentDish(state);
      }
      return state;
    }
    case "ADD_LEAF": {
      if (state.phase !== "gratitude_tree") {
        return state;
      }
      const author =
        action.authorLabel && action.authorLabel.trim().length > 0
          ? action.authorLabel
          : getChefLabel(state.gratitudeChefCursor % state.chefCount);
      const leaf = createGratitudeLeaf(
        state.leaves.length,
        action.stickerId,
        action.leafColor,
        action.customMessage,
        author
      );
      if (leaf) {
        state.leaves.push(leaf);
        state.gratitudeChefCursor += 1;
        state.pendingSounds.push("leaf_hang");
      }
      return state;
    }
    case "FINISH_GRATITUDE": {
      if (state.phase !== "gratitude_tree") {
        return state;
      }
      if (state.leaves.length === 0) {
        const fallback = createGratitudeLeaf(
          0,
          "family",
          "crimson",
          "Thankful for our Thanksgiving feast!",
          "Our Family"
        );
        if (fallback) {
          state.leaves.push(fallback);
        }
      }
      state.phase = "feast_finale";
      state.pendingSounds.push("feast_fanfare");
      return state;
    }
    case "SHUFFLE_PROMPT": {
      state.tablePromptIndex = (state.tablePromptIndex + 1) % TABLE_PROMPTS.length;
      return state;
    }
    case "POKE_CHEF": {
      state.chefDanceTimer = 1.45;
      state.easterEggCount += 1;
      state.easterBubbleText =
        CHEF_EASTER_LINES[(state.easterEggCount - 1) % CHEF_EASTER_LINES.length];
      state.easterBubbleTimer = 2.0;
      state.pendingSounds.push("happy_dance");
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        state.particles.push({
          x: 92,
          y: 300,
          vx: Math.cos(a) * 85,
          vy: Math.sin(a) * 75 - 65,
          color: i % 2 === 0 ? PALETTE.pumpkinGold : PALETTE.mapleCrimson,
          size: 7,
          life: 0,
          maxLife: 0.7,
          shape: "star"
        });
      }
      return state;
    }
    case "POKE_BIRD": {
      state.birdChirpTimer = 1.3;
      state.easterEggCount += 1;
      state.easterBubbleText =
        BIRD_EASTER_LINES[(state.easterEggCount - 1) % BIRD_EASTER_LINES.length];
      state.easterBubbleTimer = 2.0;
      state.pendingSounds.push("bird_chirp");
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        state.particles.push({
          x: 334,
          y: 255,
          vx: Math.cos(a) * 70,
          vy: Math.sin(a) * 65 - 55,
          color: PALETTE.birdYellow,
          size: 6,
          life: 0,
          maxLife: 0.65,
          shape: "star"
        });
      }
      return state;
    }
    case "TOGGLE_MUTE": {
      state.muted = !state.muted;
      return state;
    }
    case "PLAY_AGAIN": {
      const keepDifficulty = state.difficulty;
      const keepMode = state.playMode;
      const keepChefs = state.chefCount;
      const keepMuted = state.muted;
      const nextSeed = (state.rngState + 7919) | 0;
      const fresh = createInitialState({
        difficulty: keepDifficulty,
        playMode: keepMode,
        chefCount: keepChefs,
        seed: nextSeed
      });
      fresh.muted = keepMuted;
      Object.assign(state, fresh);
      return state;
    }
  }
}

export function stepGame(state: GameState, dtSec: number, input: StepInput = EMPTY_INPUT): GameState {
  const dt = Math.max(0, Math.min(0.05, dtSec));
  state.elapsedSec += dt;
  state.chefDanceTimer = Math.max(0, state.chefDanceTimer - dt);
  state.birdChirpTimer = Math.max(0, state.birdChirpTimer - dt);
  state.easterBubbleTimer = Math.max(0, state.easterBubbleTimer - dt);

  const nextParticles = [];
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    p.life += dt;
    if (p.life < p.maxLife) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 190 * dt;
      nextParticles.push(p);
    }
  }
  state.particles = nextParticles;

  if (state.phase === "dish_play" && state.dishState) {
    const res = stepActiveDish(
      state.dishState,
      state.difficulty,
      state.playMode,
      dt,
      input,
      () => nextRandom(state)
    );
    if (res.particles.length > 0) {
      state.particles.push(...res.particles);
    }
    if (res.sounds.length > 0) {
      state.pendingSounds.push(...res.sounds);
    }
    if (res.completed) {
      const dishId = state.dishState.kind;
      const spec = DISH_SPECS[dishId];
      state.results.push({
        dishId,
        chefIndex: state.activeChefIndex,
        stars: res.stars,
        score: res.score,
        dishesMade: res.dishesMade,
        guestUnlocked: spec.guestUnlocked
      });
      state.totalStars += res.stars;
      if (!state.seatedGuests.includes(spec.guestUnlocked)) {
        state.seatedGuests.push(spec.guestUnlocked);
      }
      state.phase = "dish_complete";
    }
  }

  return state;
}

export function drainPendingSounds(state: GameState): GameState["pendingSounds"] {
  if (state.pendingSounds.length === 0) {
    return [];
  }
  const out = state.pendingSounds.slice();
  state.pendingSounds.length = 0;
  return out;
}
