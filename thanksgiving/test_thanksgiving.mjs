import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const api = require("../docs/thanksgiving/app.js");

function runToastDishToCompletion(state, autoCatch, useSecondary = false) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 1800) {
    let tap = false;
    if (autoCatch && state.dishState && state.dishState.kind === "golden_toast") {
      tap = state.dishState.slices.some(
        (s) => s.state === "flying" && s.y >= 0.24 && s.y <= 0.44
      );
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: !useSecondary && tap,
      secondaryTap: useSecondary && tap,
      moveDir: 0,
      moveDirP2: 0,
      pointerXNorm: null,
      swipeDelta: 0,
      snackPick: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Toast dish should reach dish_complete");
}

function runPopcornDishToCompletion(state, trackBowl, coopBirdTrack = false) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 2400) {
    let pointerX = null;
    let moveDirP2 = 0;
    if (state.dishState && state.dishState.kind === "flying_popcorn") {
      const edible = state.dishState.items
        .filter((it) => it.itemType !== "carrot")
        .sort((a, b) => b.y - a.y);
      if (trackBowl && edible[0]) {
        pointerX = edible[0].x;
      }
      if (coopBirdTrack && edible[0]) {
        const diff = edible[0].x - state.dishState.birdX;
        moveDirP2 = diff > 0.03 ? 1 : diff < -0.03 ? -1 : 0;
      }
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      secondaryTap: false,
      moveDir: 0,
      moveDirP2,
      pointerXNorm: pointerX,
      swipeDelta: 0,
      snackPick: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Popcorn dish should reach dish_complete");
}

function runChairDishToCompletion(state, tapBothPlayers = false) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 600) {
    const tapNow = guard % 4 === 0;
    api.stepGame(state, 1 / 30, {
      primaryTap: tapNow,
      secondaryTap: tapBothPlayers && tapNow,
      moveDir: 0,
      moveDirP2: 0,
      pointerXNorm: null,
      swipeDelta: 0,
      snackPick: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Folding chair interlude should reach dish_complete");
}

function runPlatterDishToCompletion(state, injectOneWrongTap = false) {
  let guard = 0;
  let injectedWrong = false;
  while (state.phase === "dish_play" && guard < 600) {
    let pick = null;
    if (guard % 3 === 0 && state.dishState && state.dishState.kind === "pretzel_platter") {
      const expected = state.dishState.order[state.dishState.matchedCount];
      if (injectOneWrongTap && !injectedWrong) {
        injectedWrong = true;
        pick = api.SNACK_IDS.find((id) => id !== expected);
      } else {
        pick = expected;
      }
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      secondaryTap: false,
      moveDir: 0,
      moveDirP2: 0,
      pointerXNorm: null,
      swipeDelta: 0,
      snackPick: pick
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Pretzel platter dish should reach dish_complete");
}

function runPieDishToCompletion(state, useSecondary = false) {
  let guard = 0;
  while (state.phase === "dish_play" && guard < 1200) {
    const dish = state.dishState;
    const isCookie = dish && dish.kind === "pumpkin_pie" && dish.stage === "cookie_drop";
    const isWhip = dish && dish.kind === "pumpkin_pie" && dish.stage === "whipping";
    api.stepGame(state, 1 / 30, {
      primaryTap: !useSecondary && Boolean(isCookie),
      secondaryTap: useSecondary && Boolean(isCookie || isWhip),
      moveDir: 0,
      moveDirP2: 0,
      pointerXNorm: null,
      swipeDelta: !useSecondary && isWhip ? 0.14 : 0,
      snackPick: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "dish_complete", "Pie dish should reach dish_complete");
}

function testFull5StageCozyPassAndPlayFlow() {
  const state = api.createInitialState({
    difficulty: "cozy",
    playMode: "pass_and_play",
    chefCount: 4,
    seed: 12345
  });

  assert.equal(api.DISH_SEQUENCE.length, 5, "Phase 2 has 5 stages");
  assert.equal(state.phase, "title");
  api.applyAction(state, { type: "START_FEAST" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 0);

  // Stage 1: Golden Toast
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "golden_toast");
  runToastDishToCompletion(state, true);

  // Stage 2: Flying Popcorn
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 1);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "flying_popcorn");
  runPopcornDishToCompletion(state, true);

  // Stage 3: Runaway Folding Chair Interlude
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 2);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "folding_chair");
  runChairDishToCompletion(state, false);
  assert.equal(state.results[2].stars, 3, "Tamed chair in Cozy mode earns 3 stars");

  // Stage 4: Pretzel & Jelly Bean Platter (with wrong-tap grace verification)
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 3);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "pretzel_platter");
  runPlatterDishToCompletion(state, true);
  assert.ok(state.results[3].stars >= 2);

  // Stage 5: Swirl Pumpkin Pie (wraps back to Chef 1)
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activeChefIndex, 0);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.dishState.kind, "pumpkin_pie");
  runPieDishToCompletion(state);

  assert.equal(state.results.length, 5);
  assert.equal(state.seatedGuests.length, 7, "All 5 guest groups + Beagle Chef + Little Bird seated");

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
  assert.ok(Array.from(state.leaves[1].message).length <= api.MAX_CUSTOM_NOTE_LEN);

  // Feast Finale
  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  assert.equal(state.phase, "feast_finale");
  const promptBefore = api.getTablePrompt(state.tablePromptIndex);
  api.applyAction(state, { type: "SHUFFLE_PROMPT" });
  assert.notEqual(promptBefore, api.getTablePrompt(state.tablePromptIndex));

  // Replay preserves settings
  api.applyAction(state, { type: "PLAY_AGAIN" });
  assert.equal(state.phase, "title");
  assert.equal(state.chefCount, 4);
}

function testLaptop2PCoopFlow() {
  const state = api.createInitialState({
    difficulty: "bustling",
    playMode: "laptop_coop",
    seed: 2026
  });
  assert.equal(state.chefCount, 2);
  api.applyAction(state, { type: "START_FEAST" });
  assert.equal(state.phase, "dish_play", "Laptop 2P Co-op skips pass banner");

  // Stage 1: P2 Bird secondaryTap catches toast
  runToastDishToCompletion(state, true, true);
  assert.ok(state.results[0].stars >= 2, "P2 Bird catches golden toast cleanly");

  // Stage 2: P2 Bird air-scoops popcorn while P1 holds still
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "flying_popcorn");
  runPopcornDishToCompletion(state, false, true);
  assert.ok(state.results[1].dishesMade > 0, "P2 Bird air-scoop catches kernels in 2P co-op");

  // Stage 3: Both players tap together to tame folding chair super fast
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "folding_chair");
  runChairDishToCompletion(state, true);
  assert.equal(state.results[2].stars, 3, "2P team-tame earns 3 stars quickly");

  // Stage 4: Pretzel platter
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "pretzel_platter");
  runPlatterDishToCompletion(state, false);

  // Stage 5: P2 secondaryTap whips cream & drops maple cookie
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "pumpkin_pie");
  runPieDishToCompletion(state, true);
  assert.equal(state.results.length, 5);
}

function testCozyLittleBirdRescueAndChairSpringBack() {
  const state = api.createInitialState({
    difficulty: "cozy",
    playMode: "solo",
    seed: 777
  });
  api.applyAction(state, { type: "START_FEAST" });
  runToastDishToCompletion(state, false);
  assert.ok(state.results[0].stars >= 1);

  api.applyAction(state, { type: "NEXT_STAGE" });
  runPopcornDishToCompletion(state, false);
  assert.ok(state.results[1].stars >= 1);

  // Chair spring-back test: tap twice, then pause 2.6s to verify playful spring-back
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.dishState.kind, "folding_chair");
  api.stepGame(state, 1 / 30, { ...api.EMPTY_INPUT, primaryTap: true });
  api.stepGame(state, 1 / 30, { ...api.EMPTY_INPUT, primaryTap: true });
  const afterTaps = state.dishState.tamedProgress;
  assert.ok(afterTaps >= 28);
  for (let i = 0; i < 85; i++) {
    api.stepGame(state, 1 / 30, api.EMPTY_INPUT);
  }
  assert.ok(state.dishState.tamedProgress < afterTaps, "Chair should playfully spring back if untouched");
  assert.ok(state.dishState.tamedProgress >= 8, "Chair spring-back never drops below floor");
}

function testBustlingTimerCompletionAndFallbackLeaf() {
  const state = api.createInitialState({
    difficulty: "bustling",
    playMode: "solo",
    seed: 999
  });
  api.applyAction(state, { type: "START_FEAST" });
  runToastDishToCompletion(state, false);
  assert.equal(state.results[0].stars, 1);

  api.applyAction(state, { type: "NEXT_STAGE" });
  runPopcornDishToCompletion(state, true);
  api.applyAction(state, { type: "NEXT_STAGE" });
  runChairDishToCompletion(state, false);
  api.applyAction(state, { type: "NEXT_STAGE" });
  runPlatterDishToCompletion(state, false);
  api.applyAction(state, { type: "NEXT_STAGE" });
  runPieDishToCompletion(state);
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "gratitude_tree");

  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  assert.equal(state.phase, "feast_finale");
  assert.equal(state.leaves.length, 1);
}

function makeStrictCanvasCtx() {
  function assertRadius(name, val) {
    assert.ok(
      typeof val === "number" && Number.isFinite(val) && val >= 0,
      "Invalid Canvas radius in " + name + ": " + String(val)
    );
  }
  return new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "measureText") return () => ({ width: 50 });
        if (prop === "createLinearGradient") return () => ({ addColorStop() {} });
        if (prop === "createRadialGradient") return () => ({ addColorStop() {} });
        if (prop === "arc") return (_x, _y, r) => assertRadius("arc.r", r);
        if (prop === "ellipse")
          return (_x, _y, rx, ry) => {
            assertRadius("ellipse.rx", rx);
            assertRadius("ellipse.ry", ry);
          };
        return () => {};
      }
    }
  );
}

function testStrictCanvasRenderingAcrossAllPhasesAndIcons() {
  const ctx = makeStrictCanvasCtx();

  // Verify every sticker icon and every snack icon renders with valid non-negative radii
  for (const st of api.STICKER_PRESETS) {
    api.drawStickerIcon(ctx, st.id, 20, 20, 26);
  }
  for (const id of api.SNACK_IDS) {
    api.drawSnackIcon(ctx, id, 24, 24, 34);
  }

  // Render every phase & every mini-game through renderStageCanvas
  const state = api.createInitialState({
    difficulty: "cozy",
    playMode: "pass_and_play",
    chefCount: 2,
    seed: 42
  });
  api.renderStageCanvas(ctx, state); // title

  // Verify Easter egg pokes (Beagle Chef Happy Dance + Little Bird Chatter)
  api.applyAction(state, { type: "POKE_CHEF" });
  assert.ok(state.chefDanceTimer > 0, "POKE_CHEF starts happy dance timer");
  assert.ok(state.easterBubbleText.length > 0, "POKE_CHEF sets speech bubble");
  api.renderStageCanvas(ctx, state); // dancing chef + music notes

  api.applyAction(state, { type: "POKE_BIRD" });
  assert.ok(state.birdChirpTimer > 0, "POKE_BIRD starts chirp loop timer");
  assert.ok(state.easterBubbleText.includes("|"), "POKE_BIRD shows classic comic bird chatter");
  api.renderStageCanvas(ctx, state); // chirping bird + music notes

  api.applyAction(state, { type: "START_FEAST" });
  api.renderStageCanvas(ctx, state); // pass_banner

  for (let s = 0; s < api.DISH_SEQUENCE.length; s++) {
    if (state.phase === "pass_banner") {
      api.applyAction(state, { type: "CONFIRM_PASS" });
    }
    api.stepGame(state, 1 / 30, api.EMPTY_INPUT);
    api.renderStageCanvas(ctx, state); // dish_play
    if (state.dishState.kind === "golden_toast") runToastDishToCompletion(state, true);
    else if (state.dishState.kind === "flying_popcorn") runPopcornDishToCompletion(state, true);
    else if (state.dishState.kind === "folding_chair") runChairDishToCompletion(state, false);
    else if (state.dishState.kind === "pretzel_platter") runPlatterDishToCompletion(state, false);
    else runPieDishToCompletion(state);
    api.renderStageCanvas(ctx, state); // dish_complete
    api.applyAction(state, { type: "NEXT_STAGE" });
  }

  assert.equal(state.phase, "gratitude_tree");
  api.renderStageCanvas(ctx, state);
  api.applyAction(state, {
    type: "ADD_LEAF",
    stickerId: "family",
    leafColor: "crimson",
    customMessage: "Happy Thanksgiving!",
    authorLabel: "Family"
  });
  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  api.renderStageCanvas(ctx, state); // feast_finale

  // Verify 1080x1440 postcard rendering with strict canvas validation
  const origDoc = globalThis.document;
  globalThis.document = {
    createElement() {
      return {
        width: 0,
        height: 0,
        getContext() {
          return ctx;
        }
      };
    }
  };
  try {
    api.renderPostcardCanvas(state);
  } finally {
    globalThis.document = origDoc;
  }
}

testFull5StageCozyPassAndPlayFlow();
testLaptop2PCoopFlow();
testCozyLittleBirdRescueAndChairSpringBack();
testBustlingTimerCompletionAndFallbackLeaf();
function runCurrentDishToCompletion(state) {
  const kind = state.dishState.kind;
  if (kind === "golden_toast") runToastDishToCompletion(state, true);
  else if (kind === "flying_popcorn") runPopcornDishToCompletion(state, true);
  else if (kind === "folding_chair") runChairDishToCompletion(state, false);
  else if (kind === "pretzel_platter") runPlatterDishToCompletion(state, false);
  else runPieDishToCompletion(state);
}

function testDuskLightingProgressesTowardFeast() {
  const state = api.createInitialState({ difficulty: "cozy", playMode: "solo", seed: 9 });
  const levels = [api.getDuskLevel(state)];
  assert.equal(levels[0], 0, "Title screen is bright afternoon");

  api.applyAction(state, { type: "START_FEAST" });
  for (let s = 0; s < api.DISH_SEQUENCE.length; s++) {
    levels.push(api.getDuskLevel(state));
    runCurrentDishToCompletion(state);
    levels.push(api.getDuskLevel(state));
    api.applyAction(state, { type: "NEXT_STAGE" });
  }
  assert.equal(state.phase, "gratitude_tree");
  levels.push(api.getDuskLevel(state));
  api.applyAction(state, { type: "FINISH_GRATITUDE" });
  levels.push(api.getDuskLevel(state));

  for (let i = 1; i < levels.length; i++) {
    assert.ok(levels[i] >= levels[i - 1], "Dusk never gets brighter: " + levels.join(","));
  }
  assert.ok(levels[levels.length - 2] > levels[levels.length - 3], "Gratitude tree is deeper dusk");
  assert.equal(levels[levels.length - 1], 1, "Feast finale is full sunset");

  assert.equal(api.getLightGlow(0), 0, "String lights are off in the afternoon");
  assert.equal(api.getLightGlow(1), 1, "String lights glow fully at sunset");
  assert.ok(api.getLightGlow(0.7) > 0 && api.getLightGlow(0.7) < 1, "Lights fade in gradually");
}

function makeMeasureCtx(charW = 10) {
  return { measureText: (s) => ({ width: Array.from(s).length * charW }) };
}

function testPostcardWrapTextHandlesChineseAndEnglish() {
  const ctx = makeMeasureCtx(10);

  const zh = "感谢爸爸妈妈每天照顾我们一家人";
  const zhLines = api.wrapText(ctx, zh, 60);
  assert.ok(zhLines.length >= 3, "Chinese text without spaces wraps onto several lines");
  for (const line of zhLines) {
    assert.ok(ctx.measureText(line).width <= 60, "Chinese line fits width: " + line);
  }
  assert.equal(zhLines.join(""), zh, "No Chinese characters are lost while wrapping");

  assert.deepEqual(
    api.wrapText(ctx, "Thank you for pie", 100),
    ["Thank you", "for pie"],
    "English wraps at word boundaries"
  );

  const capped = api.wrapText(ctx, zh, 60, 2);
  assert.equal(capped.length, 2, "maxLines caps the number of lines");
  assert.ok(capped[1].endsWith("..."), "Truncated text ends with an ellipsis");
  assert.ok(ctx.measureText(capped[1]).width <= 60, "Ellipsis line still fits width");
}

function makeRecordingCtx() {
  const texts = [];
  const base = makeStrictCanvasCtx();
  const ctx = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "measureText") return (s) => ({ width: Array.from(String(s)).length * 11 });
        if (prop === "fillText") return (s) => texts.push(String(s));
        return base[prop];
      }
    }
  );
  return { ctx, texts };
}

function withFakeDocument(ctx, fn) {
  const origDoc = globalThis.document;
  globalThis.document = {
    createElement() {
      return { width: 0, height: 0, getContext: () => ctx };
    }
  };
  try {
    return fn();
  } finally {
    globalThis.document = origDoc;
  }
}

function testPostcardShowsAllLeavesAndFamilyName() {
  const state = api.createInitialState({ difficulty: "cozy", playMode: "solo", seed: 5 });
  state.phase = "gratitude_tree";
  for (let i = 0; i < api.MAX_LEAVES; i++) {
    api.applyAction(state, {
      type: "ADD_LEAF",
      stickerId: "family",
      leafColor: "gold",
      customMessage: i === 3 ? "谢谢奶奶做的南瓜派" : "",
      authorLabel: "Kid " + String(i + 1)
    });
  }
  assert.equal(state.leaves.length, api.MAX_LEAVES);
  api.applyAction(state, { type: "FINISH_GRATITUDE" });

  api.applyAction(state, { type: "SET_FAMILY_NAME", familyName: "  The   Wang Family  " });
  assert.equal(state.familyName, "The Wang Family", "Family name is whitespace-sanitized");

  const { ctx, texts } = makeRecordingCtx();
  withFakeDocument(ctx, () => api.renderPostcardCanvas(state));
  for (let i = 0; i < api.MAX_LEAVES; i++) {
    assert.ok(texts.includes("Kid " + String(i + 1)), "Postcard shows leaf author Kid " + String(i + 1));
  }
  assert.ok(texts.join("").includes("谢谢奶奶"), "Postcard shows the Chinese gratitude note");
  assert.ok(texts.some((t) => t.includes("The Wang Family")), "Postcard shows the family name");

  api.applyAction(state, { type: "SET_FAMILY_NAME", familyName: "x".repeat(80) });
  assert.ok(Array.from(state.familyName).length <= api.MAX_FAMILY_NAME_LEN, "Family name is capped");

  api.applyAction(state, { type: "PLAY_AGAIN" });
  assert.equal(Array.from(state.familyName).length, api.MAX_FAMILY_NAME_LEN, "Family name survives replay");
}

testStrictCanvasRenderingAcrossAllPhasesAndIcons();
testDuskLightingProgressesTowardFeast();
testPostcardWrapTextHandlesChineseAndEnglish();
testPostcardShowsAllLeavesAndFamilyName();
console.log("thanksgiving tests passed (8/8 suites)");
