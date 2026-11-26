import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const api = require("../docs/thankful_jesus/app.js");

function runLoavesToCompletion(state, trackBasket = true, expectUnprayed = true) {
  assert.equal(state.stageState.kind, "loaves_and_fish");
  if (expectUnprayed) {
    assert.equal(state.stageState.prayedWithJesus, false, "Stage 1 starts by praying with Jesus");
  }
  if (!state.stageState.prayedWithJesus) {
    api.applyAction(state, { type: "PRAY_WITH_JESUS" });
  }
  assert.equal(state.stageState.prayedWithJesus, true);

  let guard = 0;
  let sawDoveOrGust = false;
  while (state.phase === "stage_play" && guard < 3600) {
    let pointerX = null;
    if (trackBasket && state.stageState.items.length > 0) {
      const edible = state.stageState.items
        .filter((it) => it.itemType !== "gust")
        .sort((a, b) => b.y - a.y);
      if (edible[0]) {
        pointerX = edible[0].x;
      }
    }
    if (
      state.stageState.doveRescueTimer > 0 ||
      state.stageState.items.some((it) => it.itemType === "gust")
    ) {
      sawDoveOrGust = true;
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      moveDir: 0,
      pointerXNorm: pointerX,
      lanePick: null,
      harpString: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "stage_complete", "Stage 1 should reach stage_complete");
  return sawDoveOrGust;
}

function runRunBackToCompletion(state, collectSparkles = true) {
  assert.equal(state.stageState.kind, "run_back_to_jesus");
  let sawTurnBack = false;
  let sawDoubleWall = false;
  let guard = 0;
  while (state.phase === "stage_play" && guard < 3200) {
    let lanePick = null;
    let primaryTap = false;
    if (state.stageState.subPhase === "road") {
      const obstacles = state.stageState.items.filter((it) => it.itemType !== "sparkle");
      if (obstacles.length >= 2) {
        sawDoubleWall = true;
      }
      if (collectSparkles) {
        const sparkles = state.stageState.items
          .filter((it) => it.itemType === "sparkle")
          .sort((a, b) => b.y - a.y);
        if (sparkles[0]) {
          lanePick = sparkles[0].lane;
        }
      }
    } else {
      sawTurnBack = true;
      primaryTap = guard % 2 === 0;
    }
    api.stepGame(state, 1 / 30, {
      primaryTap,
      moveDir: 0,
      pointerXNorm: null,
      lanePick,
      harpString: null
    });
    guard += 1;
  }
  assert.ok(sawTurnBack, "Stage 2 must reach turn_back climax");
  assert.equal(state.phase, "stage_complete", "Stage 2 should reach stage_complete");
  return sawDoubleWall;
}

function runDavidHarpToCompletion(state, playNotes = true) {
  assert.equal(state.stageState.kind, "david_harp");
  let sawHarpSound = false;
  let guard = 0;
  while (state.phase === "stage_play" && guard < 3600) {
    let harpString = null;
    if (playNotes && state.stageState.notes.length > 0) {
      const ready = state.stageState.notes.find((n) => n.y >= 0.72 && n.y <= 0.86);
      if (ready) {
        harpString = ready.stringIndex;
      }
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      moveDir: 0,
      pointerXNorm: null,
      lanePick: null,
      harpString
    });
    if (state.pendingSounds.some((s) => s.startsWith("harp_"))) {
      sawHarpSound = true;
    }
    guard += 1;
  }
  assert.ok(sawHarpSound, "David's harp stage should emit pentatonic harp sounds");
  assert.equal(state.phase, "stage_complete", "Stage 3 David's Harp should reach stage_complete");
}

function runVerseBuilderToCompletion(state, injectWrongTile = false, injectWrongQuiz = false) {
  assert.equal(state.stageState.kind, "verse_builder");
  let didWrongTile = false;
  let didWrongQuiz = false;
  let didDecoyTap = false;
  let guard = 0;

  while (state.phase === "stage_play" && guard < 240) {
    const vb = state.stageState;
    if (vb.subPhase === "tiles") {
      const vId = vb.verseQueue[vb.verseCursor];
      const tiles = api.getVerseTiles(vId, state.ageMode);
      const expected = tiles[vb.placedTileIds.length];
      if (state.ageMode === "adventurer" && vb.decoyTileId && !didDecoyTap) {
        didDecoyTap = true;
        api.applyAction(state, { type: "TAP_VERSE_TILE", tileId: vb.decoyTileId });
        assert.equal(vb.wrongShakeWasDecoy, true, "Tapping decoy tile sets wrongShakeWasDecoy");
        api.stepGame(state, 0.05, api.EMPTY_INPUT);
      } else if (injectWrongTile && !didWrongTile && tiles.length > 1) {
        didWrongTile = true;
        const wrong = tiles.find((t) => t.id !== expected.id && !vb.placedTileIds.includes(t.id));
        api.applyAction(state, { type: "TAP_VERSE_TILE", tileId: wrong.id });
        assert.equal(vb.wrongShakeTileId, wrong.id, "Wrong tile triggers gentle shake");
        api.stepGame(state, 0.05, api.EMPTY_INPUT);
      } else {
        api.applyAction(state, { type: "TAP_VERSE_TILE", tileId: expected.id });
      }
    } else {
      const qId = vb.quizQueue[vb.quizCursor];
      const q = api.QUIZ_QUESTIONS[qId];
      if (injectWrongQuiz && !didWrongQuiz) {
        didWrongQuiz = true;
        const wrongIdx = (q.correctIndex + 1) % q.choices.length;
        api.applyAction(state, { type: "ANSWER_QUIZ", choiceIndex: wrongIdx });
        assert.equal(vb.quizFeedback, "retry", "Wrong quiz choice gives gentle retry feedback");
      } else {
        api.applyAction(state, { type: "ANSWER_QUIZ", choiceIndex: q.correctIndex });
      }
    }
    guard += 1;
  }
  assert.equal(state.phase, "stage_complete", "Stage 4 should reach stage_complete");
  return didDecoyTap;
}

function testExplorer67DoveHelperAndRelaxedFlow() {
  const state = api.createInitialState({
    ageMode: "explorer",
    langMode: "dual",
    seed: 20261125
  });

  assert.equal(state.phase, "title");
  api.applyAction(state, { type: "START_JOURNEY" });
  assert.equal(state.phase, "stage_intro", "Starts directly at stage_intro without pass_banner");

  // Stage 1: Hands-off verifies Explorer Dove Helper rescues missed loaves!
  api.applyAction(state, { type: "BEGIN_STAGE" });
  const sawDove = runLoavesToCompletion(state, false);
  assert.ok(sawDove, "Explorer Stage 1 Dove Helper must rescue missed items");
  assert.ok(state.unlockedVerses.includes("john_6_11"));

  // Stage 2: Gentle single-lane road + effortless 5-tap turn-back
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "stage_intro");
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runRunBackToCompletion(state, true);
  assert.ok(state.unlockedVerses.includes("luke_17_15_16"));

  // Stage 3: Hands-off verifies Explorer Dove Helper helps on Harp too!
  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runDavidHarpToCompletion(state, false);
  assert.ok(state.unlockedVerses.includes("psalm_100_4"));

  // Stage 4: 4 chunky tiles, zero decoy, skips quizzes
  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  assert.equal(state.stageState.decoyTileId, null, "Explorer mode has no decoy tile");
  assert.equal(state.stageState.quizQueue.length, 0, "Explorer mode skips quizzes");
  runVerseBuilderToCompletion(state, true, false);
  assert.equal(state.results.length, 4);

  // Prayer Card & Finale
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "prayer_card");
  api.applyAction(state, {
    type: "ADD_PRAYER",
    stickerId: "jesus_love",
    leafColor: "gold",
    customMessage: "",
    authorLabel: ""
  });
  api.applyAction(state, {
    type: "ADD_PRAYER",
    stickerId: "family",
    leafColor: "crimson",
    customMessage: "Thank You Jesus for my church family and Thanksgiving dinner! This sentence exceeds fifty six chars easily.",
    authorLabel: "Grace"
  });
  assert.equal(state.prayers.length, 2);
  assert.ok(Array.from(state.prayers[1].message).length <= api.MAX_CUSTOM_NOTE_LEN);

  api.applyAction(state, { type: "FINISH_PRAYERS" });
  assert.equal(state.phase, "journey_finale");
  const promptBefore = api.getChurchPrompt(state.promptIndex).en;
  api.applyAction(state, { type: "SHUFFLE_PROMPT" });
  assert.notEqual(promptBefore, api.getChurchPrompt(state.promptIndex).en);

  api.applyAction(state, { type: "PLAY_AGAIN" });
  assert.equal(state.phase, "title");
  assert.equal(state.langMode, "dual");
}

function testAdventurer89ChallengesDecoyAndQuizzes() {
  const state = api.createInitialState({
    ageMode: "adventurer",
    langMode: "en",
    seed: 777
  });

  api.applyAction(state, { type: "START_JOURNEY" });
  assert.equal(state.phase, "stage_intro");
  api.applyAction(state, { type: "BEGIN_STAGE" });
  const sawGust = runLoavesToCompletion(state, true);
  assert.ok(sawGust, "Adventurer Stage 1 spawns wind gusts to dodge");

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  const sawWall = runRunBackToCompletion(state, true);
  assert.ok(sawWall, "Adventurer Stage 2 spawns 2-lane obstacle walls");

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runDavidHarpToCompletion(state, true);

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  assert.ok(state.stageState.decoyTileId, "Adventurer Stage 4 mixes in a decoy tile");
  assert.equal(state.stageState.quizQueue.length, 3, "Adventurer mode includes 3 reflection quizzes");
  const tappedDecoy = runVerseBuilderToCompletion(state, false, true);
  assert.ok(tappedDecoy, "Verified decoy tile shake rejection");
  assert.equal(state.results.length, 4);

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "FINISH_PRAYERS" });
  assert.equal(state.phase, "journey_finale");
  assert.equal(state.prayers.length, 1);
}

function testBilingualLocalizationAndAsciiSources() {
  const tsDir = path.join(__dirname, "ts");
  const files = fs.readdirSync(tsDir).filter((f) => f.endsWith(".ts") || f.endsWith(".mjs"));
  assert.ok(files.length >= 10, "Expected thankful_jesus/ts modules");
  for (const f of files) {
    const content = fs.readFileSync(path.join(tsDir, f), "utf8");
    for (let i = 0; i < content.length; i++) {
      assert.ok(content.charCodeAt(i) <= 127, "Non-ASCII byte in source file " + f + " at index " + i);
    }
  }

  const cjkRe = /[\u4e00-\u9fff]/;
  for (const [key, val] of Object.entries(api.UI_TEXT)) {
    assert.ok(val.en.length > 0, "Missing en for UI_TEXT." + key);
    assert.ok(val.zh.length > 0, "Missing zh for UI_TEXT." + key);
    if (key !== "langEn") {
      assert.ok(cjkRe.test(val.zh), "Expected decoded CJK characters in UI_TEXT." + key);
    }
  }
  for (const vId of api.VERSE_ORDER) {
    const v = api.getVerseById(vId);
    assert.ok(v.text.en.length > 10 && cjkRe.test(v.text.zh), "Verse " + vId + " has both EN & ZH");
    assert.ok(v.explorerTiles.length >= 4 && v.adventurerTiles.length >= 4);
  }
  for (const st of api.STICKER_PRESETS) {
    assert.ok(st.caption.en.length > 0 && cjkRe.test(st.caption.zh));
  }
  for (const line of [...api.JESUS_EASTER_LINES, ...api.TREE_EASTER_LINES, ...api.FRIEND_EASTER_LINES]) {
    assert.ok(line.en.length > 0 && cjkRe.test(line.zh), "Easter line has EN & ZH");
  }
  assert.equal(api.formatLocalized({ en: "Hello", zh: "NiHao" }, "en"), "Hello");
  assert.equal(api.formatLocalized({ en: "Hello", zh: "NiHao" }, "zh"), "NiHao");
  assert.equal(api.formatLocalized({ en: "Hello", zh: "NiHao" }, "dual", " / "), "Hello / NiHao");
}

function testWebSpeechControllerBilingualChainingAndMute() {
  const spoken = [];
  let cancelCount = 0;
  const voices = [
    { lang: "en-US", name: "Samantha", localService: true },
    { lang: "zh-CN", name: "Tingting", localService: true }
  ];
  const mockHost = {
    synth: {
      cancel() {
        cancelCount += 1;
      },
      speak(utt) {
        spoken.push(utt);
      },
      getVoices() {
        return voices;
      },
      onvoiceschanged: null
    },
    createUtterance(text) {
      return {
        text,
        lang: "",
        rate: 1,
        pitch: 1,
        voice: null,
        onend: null,
        onerror: null
      };
    }
  };

  const speech = new api.JourneySpeech(mockHost);
  assert.equal(speech.isSupported(), true);

  const ok = speech.speakLocalized({ en: "Give thanks", zh: "\u51e1\u4e8b\u8c22\u6069" }, "dual");
  assert.equal(ok, true);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].lang, "en-US");
  assert.equal(spoken[0].voice.name, "Samantha");
  spoken[0].onend();
  assert.equal(spoken.length, 2);
  assert.equal(spoken[1].lang, "zh-CN");
  assert.equal(spoken[1].voice.name, "Tingting");

  const staleFirst = spoken[0];
  speech.speakLocalized({ en: "Jesus loves you", zh: "\u8036\u7a23\u7231\u4f60" }, "en");
  const countAfterRetap = spoken.length;
  staleFirst.onend();
  assert.equal(spoken.length, countAfterRetap);

  const prayers = [
    api.createPrayerLeaf(0, "jesus_love", "gold", "Thank You Jesus for my church!", "Anna", "dual"),
    api.createPrayerLeaf(1, "family", "crimson", "\u8c22\u8c22\u8036\u7a23\u7231\u6211\u7684\u5bb6\u4eba\uff01", "Ben", "dual")
  ];
  const segs = api.buildPrayerTreeSegments(prayers, "dual", api.getVerseById("thess_5_18").text);
  assert.equal(segs.length, 4);
  const beforeSeq = spoken.length;
  assert.equal(speech.speakSequence(segs), true);
  spoken[spoken.length - 1].onend();
  spoken[spoken.length - 1].onend();
  spoken[spoken.length - 1].onend();
  assert.equal(spoken.length, beforeSeq + 4);
  assert.equal(spoken[spoken.length - 1].lang, "zh-CN");

  const cancelsBeforeMute = cancelCount;
  speech.setMuted(true);
  assert.ok(cancelCount > cancelsBeforeMute);
  assert.equal(speech.speakLocalized({ en: "Silent", zh: "\u9759\u97f3" }, "dual"), false);

  const unsupported = new api.JourneySpeech({ synth: null, createUtterance: null });
  assert.equal(unsupported.isSupported(), false);
  assert.equal(unsupported.speakLocalized({ en: "Hi", zh: "\u4f60\u597d" }, "dual"), false);
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
        if (prop === "measureText") return () => ({ width: 52 });
        if (prop === "createLinearGradient") return () => ({ addColorStop() {} });
        if (prop === "createRadialGradient")
          return (_x0, _y0, r0, _x1, _y1, r1) => {
            assertRadius("radialGradient.r0", r0);
            assertRadius("radialGradient.r1", r1);
            return { addColorStop() {} };
          };
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

function testStrictCanvasRenderingAndPostcard() {
  const ctx = makeStrictCanvasCtx();

  for (const st of api.STICKER_PRESETS) {
    api.drawStickerIcon(ctx, st.id, 15, 15, 26);
  }
  const tileIcons = ["bread", "fish", "heart", "cross", "sun", "star", "scroll", "hands"];
  for (const ic of tileIcons) {
    api.drawTileIcon(ctx, ic, 14, 14, 24);
  }

  const state = api.createInitialState({
    ageMode: "adventurer",
    langMode: "dual",
    seed: 99
  });
  api.renderStageCanvas(ctx, state); // title

  api.applyAction(state, { type: "POKE_JESUS" });
  api.renderStageCanvas(ctx, state);
  api.applyAction(state, { type: "POKE_TREE" });
  api.renderStageCanvas(ctx, state);
  api.applyAction(state, { type: "POKE_FRIEND" });
  api.renderStageCanvas(ctx, state);

  api.applyAction(state, { type: "START_JOURNEY" });
  for (let s = 0; s < api.STAGE_SEQUENCE.length; s++) {
    api.renderStageCanvas(ctx, state); // stage_intro
    api.applyAction(state, { type: "BEGIN_STAGE" });
    api.renderStageCanvas(ctx, state); // stage_play start

    if (state.stageState.kind === "loaves_and_fish") {
      api.applyAction(state, { type: "PRAY_WITH_JESUS" });
      state.stageState.streak = 6;
      state.stageState.doveRescueTimer = 0.5;
      state.stageState.items.push({ id: 999, x: 0.4, y: 0.5, vy: 0.4, swayPhase: 0, itemType: "gust" });
      api.renderStageCanvas(ctx, state);
      runLoavesToCompletion(state, true, false);
    } else if (state.stageState.kind === "run_back_to_jesus") {
      state.stageState.streak = 4;
      state.stageState.lastPopKey = "popGrace";
      state.stageState.lastPopTimer = 0.5;
      api.renderStageCanvas(ctx, state);
      state.stageState.subPhase = "turn_back";
      state.stageState.turnBackProgress = 65;
      state.stageState.lastPopKey = "popThankJesus";
      state.stageState.lastPopTimer = 0.5;
      api.renderStageCanvas(ctx, state);
      runRunBackToCompletion(state, true);
    } else if (state.stageState.kind === "david_harp") {
      state.stageState.streak = 5;
      state.stageState.doveRescueTimer = 0.5;
      api.stepGame(state, 1 / 30, { ...api.EMPTY_INPUT, harpString: 1 });
      state.stageState.lastPopKey = "popHarmony";
      state.stageState.lastPopTimer = 0.5;
      api.renderStageCanvas(ctx, state);
      runDavidHarpToCompletion(state, true);
    } else {
      api.renderStageCanvas(ctx, state);
      runVerseBuilderToCompletion(state, false, false);
    }

    api.renderStageCanvas(ctx, state); // stage_complete
    api.applyAction(state, { type: "NEXT_STAGE" });
  }

  assert.equal(state.phase, "prayer_card");
  api.renderStageCanvas(ctx, state);
  api.applyAction(state, {
    type: "ADD_PRAYER",
    stickerId: "jesus_love",
    leafColor: "gold",
    customMessage: "Thank You Jesus! \u8c22\u8c22\u8036\u7a23\uff01",
    authorLabel: "Noah"
  });
  api.applyAction(state, { type: "FINISH_PRAYERS" });
  api.renderStageCanvas(ctx, state);

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
    for (const mode of ["en", "zh", "dual"]) {
      state.langMode = mode;
      api.renderPostcardCanvas(state);
    }
  } finally {
    globalThis.document = origDoc;
  }
}

testExplorer67DoveHelperAndRelaxedFlow();
testAdventurer89ChallengesDecoyAndQuizzes();
testBilingualLocalizationAndAsciiSources();
testWebSpeechControllerBilingualChainingAndMute();
testStrictCanvasRenderingAndPostcard();
console.log("thankful_jesus tests passed (5/5 suites)");
