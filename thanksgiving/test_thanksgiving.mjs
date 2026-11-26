import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const api = require("../docs/thanksgiving/app.js");

function runToastDishToCompletion(state, autoCatch) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 1800) {
    let tap = false;
    if (autoCatch && state.dishState && state.dishState.kind === "golden_toast") {
      tap = state.dishState.slices.some(
        (s) => s.state === "flying" && s.y >= 0.24 && s.y <= 0.44
      );
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: tap,
      moveDir: 0,
      pointerXNorm: null,
      swipeDelta: 0
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Toast dish should reach dish_complete");
}

function runPopcornDishToCompletion(state, trackBowl) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 2400) {
    let pointerX = null;
    if (trackBowl && state.dishState && state.dishState.kind === "flying_popcorn") {
      const edible = state.dishState.items
        .filter((it) => it.itemType !== "carrot")
        .sort((a, b) => b.y - a.y)[0];
      if (edible) {
        pointerX = edible.x;
      }
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      moveDir: 0,
      pointerXNorm: pointerX,
      swipeDelta: 0
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Popcorn dish should reach dish_complete");
}

function runPieDishToCompletion(state) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 1200) {
    const dish = state.dishState;
    const isCookie = dish && dish.kind === "pumpkin_pie" && dish.stage === "cookie_drop";
    const isWhip = dish && dish.kind === "pumpkin_pie" && dish.stage === "whipping";
    api.stepGame(state, 1 / 30, {
      primaryTap: Boolean(isCookie),
      moveDir: 0,
      pointerXNorm: null,
      swipeDelta: isWhip ? 0.14 : 0
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Pie dish should reach dish_complete");
}

function testFullCozyPassAndPlayFlow() {
  const state = api.createInitialState({
    difficulty: "cozy",
    playMode: "pass_and_play",
    chefCount: 3,
    seed: 12345
  });

  assert.equal(state.phase, "title");
  api.applyAction(state, { type: "START_FEAST" });
  assert.equal(state.phase, "pass_banner", "Multi-chef mode starts with pass banner");
  assert.equal(state.activeChefIndex, 0);

  // Dish 1: Golden Toast (Chef 1)
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.phase, "dish_play");
  assert.equal(state.dishState.kind, "golden_toast");
  runToastDishToCompletion(state, true);
  assert.equal(state.results.length, 1);
  assert.ok(state.results[0].stars >= 2, "Active toast catching earns >= 2 stars");

  // Dish 2: Flying Popcorn (Chef 2)
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 1, "Chef rotates to Chef 2");
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "flying_popcorn");
  runPopcornDishToCompletion(state, true);
  assert.equal(state.results.length, 2);

  // Dish 3: Pumpkin Pie (Chef 3)
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 2, "Chef rotates to Chef 3");
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "pumpkin_pie");
  runPieDishToCompletion(state);
  assert.equal(state.results.length, 3);
  assert.equal(state.seatedGuests.length, 5, "All guests seated at backyard table");

  // Gratitude Maple Tree
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "gratitude_tree");

  api.applyAction(state, {
    type: "ADD_LEAF",
    stickerId: "family",
    leafColor: "crimson",
    customMessage: "",
    authorLabel: ""
  });
  api.applyAction(state, {
    type: "ADD_LEAF",
    stickerId: "food",
    leafColor: "gold",
    customMessage: "Thank you Mom & Dad for pumpkin pie! This note is intentionally longer than forty eight chars.",
    authorLabel: "Emma"
  });

  assert.equal(state.leaves.length, 2);
  assert.equal(state.leaves[0].authorLabel, "Chef 1");
  assert.equal(state.leaves[0].message, "Thankful for my family!");
  assert.equal(state.leaves[1].authorLabel, "Emma");
  assert.ok(Array.from(state.leaves[1].message).length <= api.MAX_CUSTOM_NOTE_LEN);

  // Feast Finale & Prompt Shuffle
  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  assert.equal(state.phase, "feast_finale");
  const promptBefore = api.getTablePrompt(state.tablePromptIndex);
  api.applyAction(state, { type: "SHUFFLE_PROMPT" });
  const promptAfter = api.getTablePrompt(state.tablePromptIndex);
  assert.notEqual(promptBefore, promptAfter);

  // Replay preserves settings
  api.applyAction(state, { type: "PLAY_AGAIN" });
  assert.equal(state.phase, "title");
  assert.equal(state.chefCount, 3);
  assert.equal(state.difficulty, "cozy");
}

function testCozyLittleBirdRescueNoFail() {
  // Even with zero user input in Cozy mode, Little Bird rescues missed toast & popcorn
  const state = api.createInitialState({
    difficulty: "cozy",
    playMode: "solo",
    seed: 777
  });
  api.applyAction(state, { type: "START_FEAST" });
  assert.equal(state.phase, "dish_play", "Solo skips pass banner");
  runToastDishToCompletion(state, false);
  assert.ok(state.results[0].stars >= 1, "Cozy mode guarantees >= 1 star via Little Bird rescue");

  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "flying_popcorn");
  runPopcornDishToCompletion(state, false);
  assert.ok(state.results[1].stars >= 1, "Cozy popcorn rescues missed kernels via Little Bird");
}

function testBustlingTimerCompletionAndFallbackLeaf() {
  const state = api.createInitialState({
    difficulty: "bustling",
    playMode: "solo",
    seed: 999
  });
  api.applyAction(state, { type: "START_FEAST" });
  assert.ok(state.dishState.timeLeftSec > 0, "Bustling mode has active timer");

  // Run out timer on Dish 1 without catching -> still completes cleanly with 1 star
  runToastDishToCompletion(state, false);
  assert.equal(state.results[0].stars, 1);

  // Skip through Dishes 2 & 3 actively
  api.applyAction(state, { type: "NEXT_STAGE" });
  runPopcornDishToCompletion(state, true);
  api.applyAction(state, { type: "NEXT_STAGE" });
  runPieDishToCompletion(state);
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "gratitude_tree");

  // Finish gratitude without manually adding a leaf -> auto adds fallback family leaf
  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  assert.equal(state.phase, "feast_finale");
  assert.equal(state.leaves.length, 1, "Fallback family leaf added so postcard is never blank");
}

testFullCozyPassAndPlayFlow();
testCozyLittleBirdRescueNoFail();
testBustlingTimerCompletionAndFallbackLeaf();
console.log("thanksgiving tests passed (3/3 suites)");
