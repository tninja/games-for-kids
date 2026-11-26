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
  while (state.phase === "stage_play" && guard < 2400) {
    let pointerX = null;
    if (trackBasket && state.stageState.items.length > 0) {
      const sorted = state.stageState.items.slice().sort((a, b) => b.y - a.y);
      pointerX = sorted[0].x;
    }
    api.stepGame(state, 1 / 30, {
      primaryTap: false,
      moveDir: 0,
      pointerXNorm: pointerX,
      lanePick: null
    });
    guard += 1;
  }
  assert.equal(state.phase, "stage_complete", "Stage 1 should reach stage_complete");
}

function runRunBackToCompletion(state, collectSparkles = true) {
  assert.equal(state.stageState.kind, "run_back_to_jesus");
  let sawTurnBack = false;
  let guard = 0;
  while (state.phase === "stage_play" && guard < 2400) {
    let lanePick = null;
    let primaryTap = false;
    if (state.stageState.subPhase === "road") {
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
      primaryTap = guard % 3 === 0;
    }
    api.stepGame(state, 1 / 30, {
      primaryTap,
      moveDir: 0,
      pointerXNorm: null,
      lanePick
    });
    guard += 1;
  }
  assert.ok(sawTurnBack, "Stage 2 must reach turn_back climax");
  assert.equal(state.phase, "stage_complete", "Stage 2 should reach stage_complete");
}

function runVerseBuilderToCompletion(state, injectWrongTile = false, injectWrongQuiz = false) {
  assert.equal(state.stageState.kind, "verse_builder");
  let didWrongTile = false;
  let didWrongQuiz = false;
  let guard = 0;

  while (state.phase === "stage_play" && guard < 200) {
    const vb = state.stageState;
    if (vb.subPhase === "tiles") {
      const vId = vb.verseQueue[vb.verseCursor];
      const tiles = api.getVerseTiles(vId, state.ageMode);
      const expected = tiles[vb.placedTileIds.length];
      if (injectWrongTile && !didWrongTile && tiles.length > 1) {
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
  assert.equal(state.phase, "stage_complete", "Stage 3 should reach stage_complete");
}

function testExplorer3PlayerPassAndPlayFlow() {
  const state = api.createInitialState({
    ageMode: "explorer",
    langMode: "dual",
    playMode: "pass_and_play",
    playerCount: 3,
    seed: 20261125
  });

  assert.equal(state.phase, "title");
  api.applyAction(state, { type: "START_JOURNEY" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activePlayerIndex, 0);

  // Stage 1: Loaves & Fish
  api.applyAction(state, { type: "CONFIRM_PASS" });
  assert.equal(state.phase, "stage_intro");
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runLoavesToCompletion(state, true);
  assert.ok(state.unlockedVerses.includes("john_6_11"));
  assert.ok(state.results[0].stars >= 2);

  // Stage 2: Run Back to Thank Jesus
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activePlayerIndex, 1);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runRunBackToCompletion(state, true);
  assert.ok(state.unlockedVerses.includes("luke_17_15_16"));

  // Stage 3: Thankful Verse Builder (Explorer skips quiz)
  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "pass_banner");
  assert.equal(state.activePlayerIndex, 2);
  api.applyAction(state, { type: "CONFIRM_PASS" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runVerseBuilderToCompletion(state, true, false);
  assert.ok(state.unlockedVerses.includes("psalm_107_1"));
  assert.ok(state.unlockedVerses.includes("thess_5_18"));
  assert.equal(state.results.length, 3);

  // Prayer Card & Bilingual Sanitization
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

  // Journey Finale
  api.applyAction(state, { type: "FINISH_PRAYERS" });
  assert.equal(state.phase, "journey_finale");
  const promptBefore = api.getChurchPrompt(state.promptIndex).en;
  api.applyAction(state, { type: "SHUFFLE_PROMPT" });
  assert.notEqual(promptBefore, api.getChurchPrompt(state.promptIndex).en);

  // Replay preserves age/lang/player settings
  api.applyAction(state, { type: "PLAY_AGAIN" });
  assert.equal(state.phase, "title");
  assert.equal(state.playerCount, 3);
  assert.equal(state.langMode, "dual");
}

function testAdventurerSoloWithQuizAndFallbackPrayer() {
  const state = api.createInitialState({
    ageMode: "adventurer",
    langMode: "en",
    playMode: "solo",
    seed: 777
  });

  api.applyAction(state, { type: "START_JOURNEY" });
  assert.equal(state.phase, "stage_intro", "Solo mode skips pass_banner");
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runLoavesToCompletion(state, true);

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  runRunBackToCompletion(state, true);

  api.applyAction(state, { type: "NEXT_STAGE" });
  api.applyAction(state, { type: "BEGIN_STAGE" });
  assert.equal(state.stageState.quizQueue.length, 2, "Adventurer mode includes 2 Gospel reflection quizzes");
  runVerseBuilderToCompletion(state, false, true);
  assert.equal(state.results.length, 3);

  api.applyAction(state, { type: "NEXT_STAGE" });
  assert.equal(state.phase, "prayer_card");
  api.applyAction(state, { type: "FINISH_PRAYERS" });
  assert.equal(state.phase, "journey_finale");
  assert.equal(state.prayers.length, 1, "Empty prayer_card adds encouraging default prayer leaf");
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

  // Dual mode speaks EN first, then chains ZH on onend
  const ok = speech.speakLocalized({ en: "Give thanks", zh: "\u51e1\u4e8b\u8c22\u6069" }, "dual");
  assert.equal(ok, true);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].lang, "en-US");
  assert.equal(spoken[0].voice.name, "Samantha");
  spoken[0].onend();
  assert.equal(spoken.length, 2);
  assert.equal(spoken[1].lang, "zh-CN");
  assert.equal(spoken[1].voice.name, "Tingting");

  // Rapid re-tap invalidates stale onend callback
  const staleFirst = spoken[0];
  speech.speakLocalized({ en: "Jesus loves you", zh: "\u8036\u7a23\u7231\u4f60" }, "en");
  const countAfterRetap = spoken.length;
  staleFirst.onend();
  assert.equal(spoken.length, countAfterRetap, "Stale utterance onend must not trigger chained speech");

  // Muting cancels active speech and suppresses further calls
  const cancelsBeforeMute = cancelCount;
  speech.setMuted(true);
  assert.ok(cancelCount > cancelsBeforeMute);
  assert.equal(speech.speakLocalized({ en: "Silent", zh: "\u9759\u97f3" }, "dual"), false);

  // Unsupported browser fallback is a clean no-op
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
    playMode: "pass_and_play",
    playerCount: 2,
    seed: 99
  });
  api.renderStageCanvas(ctx, state); // title

  api.applyAction(state, { type: "START_JOURNEY" });
  api.renderStageCanvas(ctx, state); // pass_banner

  for (let s = 0; s < api.STAGE_SEQUENCE.length; s++) {
    if (state.phase === "pass_banner") {
      api.applyAction(state, { type: "CONFIRM_PASS" });
    }
    api.renderStageCanvas(ctx, state); // stage_intro
    api.applyAction(state, { type: "BEGIN_STAGE" });
    api.renderStageCanvas(ctx, state); // stage_play start

    if (state.stageState.kind === "loaves_and_fish") {
      api.applyAction(state, { type: "PRAY_WITH_JESUS" });
      api.stepGame(state, 1 / 30, api.EMPTY_INPUT);
      api.renderStageCanvas(ctx, state);
      runLoavesToCompletion(state, true, false);
    } else if (state.stageState.kind === "run_back_to_jesus") {
      api.stepGame(state, 1 / 30, api.EMPTY_INPUT);
      api.renderStageCanvas(ctx, state);
      state.stageState.subPhase = "turn_back";
      api.renderStageCanvas(ctx, state);
      runRunBackToCompletion(state, true);
    } else {
      api.renderStageCanvas(ctx, state); // tiles
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
  api.renderStageCanvas(ctx, state); // journey_finale

  // Validate 1080x1440 postcard rendering across all 3 langModes
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

testExplorer3PlayerPassAndPlayFlow();
testAdventurerSoloWithQuizAndFallbackPrayer();
testBilingualLocalizationAndAsciiSources();
testWebSpeechControllerBilingualChainingAndMute();
testStrictCanvasRenderingAndPostcard();
console.log("thankful_jesus tests passed (5/5 suites)");
