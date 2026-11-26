import { drawStickerIcon, drawTileIcon } from "./artwork";
import { JourneyAudio } from "./audio";
import {
  LEAF_COLORS,
  LEAF_COLOR_ORDER,
  MAX_CUSTOM_NOTE_LEN,
  MAX_PRAYERS,
  STAGE_LOGICAL_H,
  STAGE_LOGICAL_W,
  STAGE_SEQUENCE
} from "./constants";
import { EMPTY_INPUT, applyAction, createInitialState, drainSounds, stepGame } from "./game";
import { createPrayerLeaf, getChurchPrompt, getStickerPreset, sanitizeNote } from "./gratitude";
import {
  CHURCH_PROMPTS,
  STAGE_TEXT,
  STICKER_PRESETS,
  UI_TEXT,
  formatLocalized,
  formatPrimary,
  formatSecondary
} from "./i18n";
import { exportPostcard, renderPostcardCanvas } from "./postcard";
import { renderStageCanvas } from "./renderer";
import { JourneySpeech } from "./speech";
import {
  AgeMode,
  FrameInput,
  GameState,
  LangMode,
  LeafColor,
  LocalizedText,
  StickerId
} from "./types";
import {
  ADVENTURER_QUIZ_ORDER,
  BUILDER_VERSE_QUEUE,
  QUIZ_QUESTIONS,
  VERSES,
  VERSE_ORDER,
  getVerseById,
  getVerseTiles
} from "./verses";

// Re-export core API for headless Node tests & debugging
export {
  ADVENTURER_QUIZ_ORDER,
  BUILDER_VERSE_QUEUE,
  CHURCH_PROMPTS,
  EMPTY_INPUT,
  JourneyAudio,
  JourneySpeech,
  LEAF_COLORS,
  LEAF_COLOR_ORDER,
  MAX_CUSTOM_NOTE_LEN,
  MAX_PRAYERS,
  QUIZ_QUESTIONS,
  STAGE_SEQUENCE,
  STAGE_TEXT,
  STICKER_PRESETS,
  UI_TEXT,
  VERSES,
  VERSE_ORDER,
  applyAction,
  createInitialState,
  createPrayerLeaf,
  drainSounds,
  drawStickerIcon,
  drawTileIcon,
  exportPostcard,
  formatLocalized,
  formatPrimary,
  formatSecondary,
  getChurchPrompt,
  getStickerPreset,
  getVerseById,
  getVerseTiles,
  renderPostcardCanvas,
  renderStageCanvas,
  sanitizeNote,
  stepGame
};

function makeDualButtonContent(text: LocalizedText, langMode: LangMode): HTMLElement {
  const wrap = document.createElement("span");
  wrap.className = "btn-label";
  const main = document.createElement("span");
  main.className = "btn-main";
  main.textContent = formatPrimary(text, langMode);
  wrap.appendChild(main);
  const sec = formatSecondary(text, langMode);
  if (sec) {
    const sub = document.createElement("span");
    sub.className = "btn-sub";
    sub.textContent = sec;
    wrap.appendChild(sub);
  }
  return wrap;
}

function makeBilingualBlock(
  text: LocalizedText,
  langMode: LangMode,
  primaryClass = "bi-primary",
  secondaryClass = "bi-secondary"
): HTMLElement {
  const box = document.createElement("div");
  box.className = "bi-block";
  const p = document.createElement("div");
  p.className = primaryClass;
  p.textContent = formatPrimary(text, langMode);
  box.appendChild(p);
  const sec = formatSecondary(text, langMode);
  if (sec) {
    const s = document.createElement("div");
    s.className = secondaryClass;
    s.textContent = sec;
    box.appendChild(s);
  }
  return box;
}

export function mountThankfulJesusApp(): void {
  if (typeof document === "undefined") {
    return;
  }
  const canvas = document.getElementById("stage-canvas") as HTMLCanvasElement | null;
  const deck = document.getElementById("control-deck");
  const hudTitle = document.getElementById("hud-title");
  const hudMeter = document.getElementById("hud-meter");
  const hudListenBtn = document.getElementById("hud-listen-btn") as HTMLButtonElement | null;
  const backLink = document.getElementById("back-link");
  const muteBtn = document.getElementById("mute-btn") as HTMLButtonElement | null;
  const langEnBtn = document.getElementById("lang-en-btn") as HTMLButtonElement | null;
  const langZhBtn = document.getElementById("lang-zh-btn") as HTMLButtonElement | null;
  const langDualBtn = document.getElementById("lang-dual-btn") as HTMLButtonElement | null;
  const modal = document.getElementById("postcard-modal");
  const modalImg = document.getElementById("postcard-img") as HTMLImageElement | null;
  const modalStatus = document.getElementById("postcard-status");
  const modalShareBtn = document.getElementById("postcard-share-btn") as HTMLButtonElement | null;
  const modalCloseBtn = document.getElementById("postcard-close-btn") as HTMLButtonElement | null;

  if (!canvas || !deck) {
    return;
  }
  const stageCanvas = canvas;
  const controlDeck = deck;
  const ctx = stageCanvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const stageCtx = ctx;

  const state: GameState = createInitialState({
    ageMode: "explorer",
    langMode: "dual",
    playMode: "solo",
    seed: Date.now() & 0xfffffff
  });
  const audio = new JourneyAudio();
  const speech = new JourneySpeech();

  let selectedSticker: StickerId = "jesus_love";
  let selectedLeafColor: LeafColor = "gold";
  let draftAuthor = "";
  let draftPrayer = "";
  let cachedPostcardCanvas: HTMLCanvasElement | null = null;
  let lastDeckKey = "";
  let lastSpokenAutoKey = "";

  const keysHeld = new Set<string>();
  let pendingPrimaryTap = false;
  let pendingLanePick: 0 | 1 | 2 | null = null;
  let activePointerXNorm: number | null = null;

  function unlockAudio(): void {
    audio.unlock();
  }

  function resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(STAGE_LOGICAL_W * dpr);
    const targetH = Math.round(STAGE_LOGICAL_H * dpr);
    if (stageCanvas.width !== targetW || stageCanvas.height !== targetH) {
      stageCanvas.width = targetW;
      stageCanvas.height = targetH;
    }
    stageCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getCurrentSpeechPayload(): LocalizedText | null {
    if (state.phase === "title") {
      return {
        en: UI_TEXT.gameTitle.en + ". " + UI_TEXT.gameSubtitle.en,
        zh: UI_TEXT.gameTitle.zh + "\u3002" + UI_TEXT.gameSubtitle.zh
      };
    }
    if (state.phase === "stage_intro") {
      const id = STAGE_SEQUENCE[state.stageIndex];
      return {
        en: STAGE_TEXT[id].title.en + ". " + STAGE_TEXT[id].story.en,
        zh: STAGE_TEXT[id].title.zh + "\u3002" + STAGE_TEXT[id].story.zh
      };
    }
    if (state.phase === "stage_play" && state.stageState) {
      if (state.stageState.kind === "loaves_and_fish") {
        const v = getVerseById("john_6_11");
        return v.text;
      }
      if (state.stageState.kind === "run_back_to_jesus") {
        const v = getVerseById("luke_17_15_16");
        return v.text;
      }
      if (state.stageState.subPhase === "quiz") {
        const q = QUIZ_QUESTIONS[state.stageState.quizQueue[state.stageState.quizCursor]];
        return q ? q.question : null;
      }
      const vId = state.stageState.verseQueue[state.stageState.verseCursor];
      return getVerseById(vId).text;
    }
    if (state.phase === "stage_complete") {
      const last = state.results[state.results.length - 1];
      if (last) {
        const v = getVerseById(last.verseUnlocked);
        return {
          en: v.reference.en + ". " + v.text.en,
          zh: v.reference.zh + "\u3002" + v.text.zh
        };
      }
    }
    if (state.phase === "journey_finale") {
      const v = getVerseById("thess_5_18");
      const prayerEn = state.prayers.map((p) => p.message).join(". ");
      return {
        en: v.text.en + (prayerEn ? " " + prayerEn : ""),
        zh: v.text.zh + (prayerEn ? " " + prayerEn : "")
      };
    }
    if (state.phase === "prayer_card") {
      return UI_TEXT.prayerHeader;
    }
    return null;
  }

  function speakCurrentScreen(): void {
    unlockAudio();
    const payload = getCurrentSpeechPayload();
    if (payload) {
      speech.speakLocalized(payload, state.langMode);
    }
  }

  function maybeAutoRead(): void {
    if (!state.autoRead || state.muted || !speech.isSupported()) {
      return;
    }
    const key =
      state.phase +
      ":" +
      String(state.stageIndex) +
      ":" +
      (state.stageState && state.stageState.kind === "verse_builder"
        ? state.stageState.subPhase + ":" + String(state.stageState.quizCursor)
        : "");
    if (key === lastSpokenAutoKey) {
      return;
    }
    if (
      state.phase === "stage_intro" ||
      state.phase === "stage_complete" ||
      state.phase === "journey_finale"
    ) {
      lastSpokenAutoKey = key;
      const payload = getCurrentSpeechPayload();
      if (payload) {
        speech.speakLocalized(payload, state.langMode);
      }
    }
  }

  function updateTopBar(): void {
    if (backLink) {
      backLink.textContent = "<- " + formatPrimary(UI_TEXT.backGames, state.langMode);
    }
    if (langEnBtn) {
      langEnBtn.classList.toggle("active", state.langMode === "en");
    }
    if (langZhBtn) {
      langZhBtn.classList.toggle("active", state.langMode === "zh");
    }
    if (langDualBtn) {
      langDualBtn.classList.toggle("active", state.langMode === "dual");
    }
    if (muteBtn) {
      muteBtn.textContent = state.muted
        ? formatPrimary(UI_TEXT.sfxOff, state.langMode)
        : formatPrimary(UI_TEXT.sfxOn, state.langMode);
    }
    if (modalShareBtn) {
      modalShareBtn.textContent = formatPrimary(UI_TEXT.modalShare, state.langMode);
    }
    if (modalCloseBtn) {
      modalCloseBtn.textContent = formatPrimary(UI_TEXT.modalClose, state.langMode);
    }
  }

  function updateHud(): void {
    if (!hudTitle || !hudMeter) {
      return;
    }
    if (hudListenBtn) {
      hudListenBtn.style.display = speech.isSupported() ? "inline-flex" : "none";
      hudListenBtn.textContent = formatPrimary(UI_TEXT.listenBtn, state.langMode);
    }
    if (state.phase === "title") {
      hudTitle.textContent = formatPrimary(UI_TEXT.gameTitle, state.langMode);
      hudMeter.textContent = formatPrimary(
        state.ageMode === "explorer" ? UI_TEXT.explorerLabel : UI_TEXT.adventurerLabel,
        state.langMode
      );
      return;
    }
    if (state.phase === "pass_banner" || state.phase === "stage_intro") {
      const stageId = STAGE_SEQUENCE[state.stageIndex];
      hudTitle.textContent =
        String(state.stageIndex + 1) +
        "/3 " +
        formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
      hudMeter.textContent =
        formatPrimary(UI_TEXT.friendPrefix, state.langMode) +
        " " +
        String(state.activePlayerIndex + 1);
      return;
    }
    if (state.phase === "stage_play" && state.stageState) {
      const stageId = state.stageState.kind;
      hudTitle.textContent = formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
      if (state.stageState.kind === "loaves_and_fish") {
        const timerStr =
          state.ageMode === "adventurer"
            ? " | " + String(Math.ceil(state.stageState.timeLeftSec)) + "s"
            : "";
        hudMeter.textContent =
          formatPrimary(UI_TEXT.s1HudUnit, state.langMode) +
          " " +
          String(state.stageState.sharedCount) +
          "/" +
          String(state.stageState.targetCount) +
          timerStr;
      } else if (state.stageState.kind === "run_back_to_jesus") {
        if (state.stageState.subPhase === "turn_back") {
          hudMeter.textContent =
            formatPrimary(UI_TEXT.s2HudTurn, state.langMode) +
            " " +
            String(Math.round(state.stageState.turnBackProgress)) +
            "%";
        } else {
          hudMeter.textContent =
            formatPrimary(UI_TEXT.s2HudRoad, state.langMode) +
            " " +
            String(state.stageState.sparklesCollected) +
            "/" +
            String(state.stageState.targetSparkles);
        }
      } else {
        if (state.stageState.subPhase === "quiz") {
          hudMeter.textContent =
            formatPrimary(UI_TEXT.s3QuizKicker, state.langMode) +
            " " +
            String(state.stageState.quizCursor + 1) +
            "/" +
            String(state.stageState.quizQueue.length);
        } else {
          hudMeter.textContent =
            String(state.stageState.verseCursor + 1) +
            "/" +
            String(state.stageState.verseQueue.length);
        }
      }
      return;
    }
    if (state.phase === "stage_complete") {
      const last = state.results[state.results.length - 1];
      hudTitle.textContent = formatPrimary(UI_TEXT.starsEarned, state.langMode);
      hudMeter.textContent = String(last ? last.stars : 3) + " / 3";
      return;
    }
    if (state.phase === "prayer_card") {
      hudTitle.textContent = formatPrimary(UI_TEXT.pcPrayerSection, state.langMode);
      hudMeter.textContent = String(state.prayers.length) + "/" + String(MAX_PRAYERS);
      return;
    }
    hudTitle.textContent = formatPrimary(UI_TEXT.pcTitle, state.langMode);
    hudMeter.textContent =
      formatPrimary(UI_TEXT.starsEarned, state.langMode) + ": " + String(state.totalStars) + "/9";
  }

  function computeDeckKey(): string {
    let extra = "";
    if (state.stageState) {
      if (state.stageState.kind === "loaves_and_fish") {
        extra = state.stageState.prayedWithJesus ? "prayed" : "wait_pray";
      } else if (state.stageState.kind === "run_back_to_jesus") {
        extra = state.stageState.subPhase;
      } else {
        extra =
          state.stageState.subPhase +
          ":" +
          String(state.stageState.verseCursor) +
          ":" +
          String(state.stageState.placedTileIds.length) +
          ":" +
          String(state.stageState.wrongShakeTileId || "") +
          ":" +
          String(state.stageState.quizCursor) +
          ":" +
          state.stageState.quizFeedback;
      }
    }
    return [
      state.phase,
      state.langMode,
      state.ageMode,
      state.playMode,
      String(state.playerCount),
      String(state.activePlayerIndex),
      String(state.stageIndex),
      String(state.prayers.length),
      String(state.promptIndex),
      String(state.autoRead),
      selectedSticker,
      selectedLeafColor,
      extra
    ].join("|");
  }

  function buildDeck(force = false): void {
    const key = computeDeckKey();
    if (!force && key === lastDeckKey) {
      return;
    }
    lastDeckKey = key;
    controlDeck.innerHTML = "";

    const stack = document.createElement("div");
    stack.className = "deck-stack";

    if (state.phase === "title") {
      // Age mode selector (6-7 Explorer vs 8-9 Adventurer)
      const ageRow = document.createElement("div");
      ageRow.className = "seg-row";
      const ageModes: { mode: AgeMode; text: LocalizedText }[] = [
        { mode: "explorer", text: UI_TEXT.explorerLabel },
        { mode: "adventurer", text: UI_TEXT.adventurerLabel }
      ];
      for (let i = 0; i < ageModes.length; i++) {
        const item = ageModes[i];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "seg-btn" + (state.ageMode === item.mode ? " active" : "");
        btn.appendChild(makeDualButtonContent(item.text, state.langMode));
        btn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, { type: "SET_AGE_MODE", ageMode: item.mode });
          syncAll(true);
        });
        ageRow.appendChild(btn);
      }
      stack.appendChild(ageRow);

      // Player count selector (1P Solo, 2P, 3P, 4P Pass-and-Play)
      const playerRow = document.createElement("div");
      playerRow.className = "seg-row";
      const playerOptions: { count: number; text: LocalizedText }[] = [
        { count: 1, text: UI_TEXT.soloLabel },
        { count: 2, text: UI_TEXT.pass2Label },
        { count: 3, text: UI_TEXT.pass3Label },
        { count: 4, text: UI_TEXT.pass4Label }
      ];
      for (let i = 0; i < playerOptions.length; i++) {
        const opt = playerOptions[i];
        const btn = document.createElement("button");
        btn.type = "button";
        const active =
          (opt.count === 1 && state.playMode === "solo") ||
          (opt.count > 1 && state.playMode === "pass_and_play" && state.playerCount === opt.count);
        btn.className = "seg-btn" + (active ? " active" : "");
        btn.textContent = formatPrimary(opt.text, state.langMode);
        btn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, {
            type: "SET_PLAY_MODE",
            playMode: opt.count === 1 ? "solo" : "pass_and_play",
            playerCount: opt.count
          });
          syncAll(true);
        });
        playerRow.appendChild(btn);
      }
      stack.appendChild(playerRow);

      // Auto-read toggle (Web Speech)
      if (speech.isSupported()) {
        const speechRow = document.createElement("div");
        speechRow.className = "seg-row";
        const autoBtn = document.createElement("button");
        autoBtn.type = "button";
        autoBtn.className = "ghost-btn";
        autoBtn.appendChild(
          makeDualButtonContent(
            state.autoRead ? UI_TEXT.autoReadOn : UI_TEXT.autoReadOff,
            state.langMode
          )
        );
        autoBtn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, { type: "TOGGLE_AUTO_READ" });
          syncAll(true);
        });
        speechRow.appendChild(autoBtn);
        stack.appendChild(speechRow);
      }

      const startBtn = document.createElement("button");
      startBtn.type = "button";
      startBtn.className = "primary-btn giant-btn";
      startBtn.appendChild(makeDualButtonContent(UI_TEXT.startJourney, state.langMode));
      startBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "START_JOURNEY" });
        syncAll(true);
        maybeAutoRead();
      });
      stack.appendChild(startBtn);
      controlDeck.appendChild(stack);
      return;
    }

    if (state.phase === "pass_banner") {
      stack.classList.add("center-stack");
      const badge = document.createElement("div");
      badge.className = "pass-badge";
      badge.textContent =
        formatPrimary(UI_TEXT.passTitlePrefix, state.langMode) +
        " " +
        formatPrimary(UI_TEXT.friendPrefix, state.langMode) +
        " " +
        String(state.activePlayerIndex + 1) +
        "!";
      stack.appendChild(badge);

      const readyBtn = document.createElement("button");
      readyBtn.type = "button";
      readyBtn.className = "primary-btn giant-btn";
      readyBtn.appendChild(makeDualButtonContent(UI_TEXT.readyBtn, state.langMode));
      readyBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "CONFIRM_PASS" });
        syncAll(true);
        maybeAutoRead();
      });
      stack.appendChild(readyBtn);
      controlDeck.appendChild(stack);
      return;
    }

    if (state.phase === "stage_intro") {
      const stageId = STAGE_SEQUENCE[state.stageIndex];
      const card = document.createElement("div");
      card.className = "story-card";
      card.appendChild(makeBilingualBlock(STAGE_TEXT[stageId].story, state.langMode));
      stack.appendChild(card);

      if (speech.isSupported()) {
        const listenBtn = document.createElement("button");
        listenBtn.type = "button";
        listenBtn.className = "secondary-btn";
        listenBtn.appendChild(makeDualButtonContent(UI_TEXT.listenBtn, state.langMode));
        listenBtn.addEventListener("click", () => {
          speakCurrentScreen();
        });
        stack.appendChild(listenBtn);
      }

      const goBtn = document.createElement("button");
      goBtn.type = "button";
      goBtn.className = "primary-btn big-btn";
      goBtn.appendChild(makeDualButtonContent(UI_TEXT.beginStageBtn, state.langMode));
      goBtn.addEventListener("click", () => {
        unlockAudio();
        speech.stop();
        applyAction(state, { type: "BEGIN_STAGE" });
        syncAll(true);
      });
      stack.appendChild(goBtn);
      controlDeck.appendChild(stack);
      return;
    }

    if (state.phase === "stage_play" && state.stageState) {
      if (state.stageState.kind === "loaves_and_fish") {
        if (!state.stageState.prayedWithJesus) {
          const prayBtn = document.createElement("button");
          prayBtn.type = "button";
          prayBtn.className = "primary-btn giant-btn";
          prayBtn.appendChild(makeDualButtonContent(UI_TEXT.s1PrayBtn, state.langMode));
          prayBtn.addEventListener("click", () => {
            unlockAudio();
            applyAction(state, { type: "PRAY_WITH_JESUS" });
            syncAll(true);
          });
          stack.appendChild(prayBtn);
        } else {
          const track = document.createElement("div");
          track.className = "slide-track";
          track.appendChild(makeBilingualBlock(UI_TEXT.s1SlideHint, state.langMode));
          const updateTrackPointer = (ev: PointerEvent): void => {
            const rect = track.getBoundingClientRect();
            if (rect.width > 0) {
              activePointerXNorm = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
            }
          };
          track.addEventListener("pointerdown", (ev) => {
            unlockAudio();
            try {
              track.setPointerCapture(ev.pointerId);
            } catch {
              // Ignore synthetic event errors
            }
            updateTrackPointer(ev);
          });
          track.addEventListener("pointermove", (ev) => {
            if (ev.buttons > 0 || ev.pointerType === "touch") {
              updateTrackPointer(ev);
            }
          });
          track.addEventListener("pointerup", () => {
            activePointerXNorm = null;
          });
          track.addEventListener("pointercancel", () => {
            activePointerXNorm = null;
          });
          stack.appendChild(track);

          const btnRow = document.createElement("div");
          btnRow.className = "seg-row";
          const leftBtn = document.createElement("button");
          leftBtn.type = "button";
          leftBtn.className = "secondary-btn";
          leftBtn.textContent = "<- " + formatPrimary(UI_TEXT.s2LaneLeft, state.langMode);
          leftBtn.addEventListener("pointerdown", () => {
            unlockAudio();
            keysHeld.add("ArrowLeft");
          });
          leftBtn.addEventListener("pointerup", () => keysHeld.delete("ArrowLeft"));
          leftBtn.addEventListener("pointerleave", () => keysHeld.delete("ArrowLeft"));

          const rightBtn = document.createElement("button");
          rightBtn.type = "button";
          rightBtn.className = "secondary-btn";
          rightBtn.textContent = formatPrimary(UI_TEXT.s2LaneRight, state.langMode) + " ->";
          rightBtn.addEventListener("pointerdown", () => {
            unlockAudio();
            keysHeld.add("ArrowRight");
          });
          rightBtn.addEventListener("pointerup", () => keysHeld.delete("ArrowRight"));
          rightBtn.addEventListener("pointerleave", () => keysHeld.delete("ArrowRight"));

          btnRow.appendChild(leftBtn);
          btnRow.appendChild(rightBtn);
          stack.appendChild(btnRow);
        }
        controlDeck.appendChild(stack);
        return;
      }

      if (state.stageState.kind === "run_back_to_jesus") {
        if (state.stageState.subPhase === "turn_back") {
          const note = document.createElement("div");
          note.className = "story-card";
          note.appendChild(makeBilingualBlock(UI_TEXT.s2TurnPrompt, state.langMode));
          stack.appendChild(note);

          const turnBtn = document.createElement("button");
          turnBtn.type = "button";
          turnBtn.className = "primary-btn giant-btn pulse-btn";
          turnBtn.appendChild(makeDualButtonContent(UI_TEXT.s2TurnBtn, state.langMode));
          turnBtn.addEventListener("pointerdown", () => {
            unlockAudio();
            pendingPrimaryTap = true;
          });
          stack.appendChild(turnBtn);
        } else {
          const laneRow = document.createElement("div");
          laneRow.className = "seg-row";
          const lanes: { idx: 0 | 1 | 2; text: LocalizedText }[] = [
            { idx: 0, text: UI_TEXT.s2LaneLeft },
            { idx: 1, text: UI_TEXT.s2LaneMid },
            { idx: 2, text: UI_TEXT.s2LaneRight }
          ];
          for (let i = 0; i < lanes.length; i++) {
            const ln = lanes[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "primary-btn lane-btn";
            btn.appendChild(makeDualButtonContent(ln.text, state.langMode));
            btn.addEventListener("pointerdown", () => {
              unlockAudio();
              pendingLanePick = ln.idx;
            });
            laneRow.appendChild(btn);
          }
          stack.appendChild(laneRow);
        }
        controlDeck.appendChild(stack);
        return;
      }

      // Stage 3: Verse Builder (tiles or adventurer quiz)
      const vb = state.stageState;
      if (vb.subPhase === "quiz") {
        const qId = vb.quizQueue[vb.quizCursor];
        const q = QUIZ_QUESTIONS[qId];
        if (q) {
          const qCard = document.createElement("div");
          qCard.className = "story-card";
          qCard.appendChild(makeBilingualBlock(q.question, state.langMode));
          stack.appendChild(qCard);

          if (vb.quizFeedback === "retry") {
            const fb = document.createElement("div");
            fb.className = "deck-note retry-note";
            fb.textContent = formatLocalized(UI_TEXT.s3QuizRetry, state.langMode, " / ");
            stack.appendChild(fb);
          }

          for (let i = 0; i < q.choices.length; i++) {
            const choiceIdx = i;
            const cBtn = document.createElement("button");
            cBtn.type = "button";
            cBtn.className = "choice-btn";
            cBtn.appendChild(makeDualButtonContent(q.choices[i], state.langMode));
            cBtn.addEventListener("click", () => {
              unlockAudio();
              if (choiceIdx === q.correctIndex) {
                speech.speakLocalized(q.encouragement, state.langMode);
              }
              applyAction(state, { type: "ANSWER_QUIZ", choiceIndex: choiceIdx });
              syncAll(true);
            });
            stack.appendChild(cBtn);
          }
        }
        controlDeck.appendChild(stack);
        return;
      }

      // Verse Tiles grid
      const hint = document.createElement("div");
      hint.className = "deck-note";
      hint.textContent = formatPrimary(UI_TEXT.s3Hint, state.langMode);
      stack.appendChild(hint);

      const verseId = vb.verseQueue[vb.verseCursor];
      const allTiles = getVerseTiles(verseId, state.ageMode);
      const nextExpected = allTiles[vb.placedTileIds.length];

      const tileGrid = document.createElement("div");
      tileGrid.className = "tile-grid";
      for (let i = 0; i < vb.shuffledTileIds.length; i++) {
        const tid = vb.shuffledTileIds[i];
        const def = allTiles.find((t) => t.id === tid);
        if (!def) {
          continue;
        }
        const alreadyPlaced = vb.placedTileIds.indexOf(tid) >= 0;
        const isExplorerHint =
          !alreadyPlaced && state.ageMode === "explorer" && nextExpected && nextExpected.id === tid;
        const isShaking = vb.wrongShakeTileId === tid && vb.wrongShakeTimer > 0;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.disabled = alreadyPlaced;
        btn.className =
          "tile-btn" +
          (alreadyPlaced ? " placed" : "") +
          (isExplorerHint ? " hint-glow" : "") +
          (isShaking ? " shake" : "");

        const iconCanvas = document.createElement("canvas");
        iconCanvas.width = 28;
        iconCanvas.height = 28;
        const ictx = iconCanvas.getContext("2d");
        if (ictx) {
          drawTileIcon(ictx, def.icon, 14, 14, 24);
        }
        btn.appendChild(iconCanvas);
        btn.appendChild(makeDualButtonContent(def.text, state.langMode));

        btn.addEventListener("click", () => {
          unlockAudio();
          // Always read the tapped Bible phrase tile aloud via Web Speech!
          speech.speakLocalized(def.text, state.langMode);
          applyAction(state, { type: "TAP_VERSE_TILE", tileId: def.id });
          syncAll(true);
        });
        tileGrid.appendChild(btn);
      }
      stack.appendChild(tileGrid);
      controlDeck.appendChild(stack);
      return;
    }

    if (state.phase === "stage_complete") {
      const last = state.results[state.results.length - 1];
      const verse = getVerseById(last ? last.verseUnlocked : "john_6_11");

      const verseBox = document.createElement("div");
      verseBox.className = "verse-card";
      const refEl = document.createElement("div");
      refEl.className = "verse-ref";
      refEl.textContent = formatLocalized(verse.reference, state.langMode, " | ");
      verseBox.appendChild(refEl);
      verseBox.appendChild(makeBilingualBlock(verse.text, state.langMode, "verse-main", "verse-sub"));
      stack.appendChild(verseBox);

      if (speech.isSupported()) {
        const readBtn = document.createElement("button");
        readBtn.type = "button";
        readBtn.className = "secondary-btn";
        readBtn.appendChild(makeDualButtonContent(UI_TEXT.listenVerseBtn, state.langMode));
        readBtn.addEventListener("click", () => {
          speakCurrentScreen();
        });
        stack.appendChild(readBtn);
      }

      const hasMore = state.stageIndex + 1 < STAGE_SEQUENCE.length;
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "primary-btn big-btn";
      nextBtn.appendChild(
        makeDualButtonContent(hasMore ? UI_TEXT.nextStageBtn : UI_TEXT.goPrayerBtn, state.langMode)
      );
      nextBtn.addEventListener("click", () => {
        unlockAudio();
        speech.stop();
        applyAction(state, { type: "NEXT_STAGE" });
        syncAll(true);
        maybeAutoRead();
      });
      stack.appendChild(nextBtn);
      controlDeck.appendChild(stack);
      return;
    }

    if (state.phase === "prayer_card") {
      const head = document.createElement("div");
      head.className = "gratitude-head";
      head.appendChild(makeBilingualBlock(UI_TEXT.prayerHeader, state.langMode));
      stack.appendChild(head);

      // Leaf color dots + optional name input
      const colorRow = document.createElement("div");
      colorRow.className = "color-row";
      for (let i = 0; i < LEAF_COLOR_ORDER.length; i++) {
        const color = LEAF_COLOR_ORDER[i];
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "color-dot" + (selectedLeafColor === color ? " active" : "");
        dot.style.background = LEAF_COLORS[color].fill;
        dot.setAttribute("aria-label", color);
        dot.addEventListener("click", () => {
          selectedLeafColor = color;
          buildDeck(true);
        });
        colorRow.appendChild(dot);
      }
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.maxLength = 20;
      nameInput.className = "note-input name-input";
      nameInput.placeholder = formatPrimary(UI_TEXT.prayerNamePh, state.langMode);
      nameInput.value = draftAuthor;
      nameInput.addEventListener("input", () => {
        draftAuthor = nameInput.value;
      });
      colorRow.appendChild(nameInput);
      stack.appendChild(colorRow);

      // 8 vector-drawn gratitude sticker buttons
      const stickerGrid = document.createElement("div");
      stickerGrid.className = "sticker-grid";
      for (let i = 0; i < STICKER_PRESETS.length; i++) {
        const st = STICKER_PRESETS[i];
        const sBtn = document.createElement("button");
        sBtn.type = "button";
        sBtn.className = "sticker-btn" + (selectedSticker === st.id ? " active" : "");
        const ic = document.createElement("canvas");
        ic.width = 30;
        ic.height = 30;
        const ictx = ic.getContext("2d");
        if (ictx) {
          drawStickerIcon(ictx, st.id, 15, 15, 26);
        }
        sBtn.appendChild(ic);
        const lbl = document.createElement("span");
        lbl.textContent = formatPrimary(st.label, state.langMode);
        sBtn.appendChild(lbl);
        sBtn.addEventListener("click", () => {
          unlockAudio();
          selectedSticker = st.id;
          speech.speakLocalized(st.caption, state.langMode);
          buildDeck(true);
        });
        stickerGrid.appendChild(sBtn);
      }
      stack.appendChild(stickerGrid);

      const noteInput = document.createElement("input");
      noteInput.type = "text";
      noteInput.maxLength = MAX_CUSTOM_NOTE_LEN;
      noteInput.className = "note-input";
      noteInput.placeholder = formatPrimary(UI_TEXT.prayerNotePh, state.langMode);
      noteInput.value = draftPrayer;
      noteInput.addEventListener("input", () => {
        draftPrayer = noteInput.value;
      });
      stack.appendChild(noteInput);

      const actionRow = document.createElement("div");
      actionRow.className = "seg-row";
      const hangBtn = document.createElement("button");
      hangBtn.type = "button";
      hangBtn.className = "secondary-btn";
      hangBtn.disabled = state.prayers.length >= MAX_PRAYERS;
      hangBtn.appendChild(makeDualButtonContent(UI_TEXT.hangPrayerBtn, state.langMode));
      hangBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, {
          type: "ADD_PRAYER",
          stickerId: selectedSticker,
          leafColor: selectedLeafColor,
          customMessage: draftPrayer,
          authorLabel: draftAuthor
        });
        draftPrayer = "";
        draftAuthor = "";
        syncAll(true);
      });

      const doneBtn = document.createElement("button");
      doneBtn.type = "button";
      doneBtn.className = "primary-btn";
      doneBtn.appendChild(makeDualButtonContent(UI_TEXT.finishJourneyBtn, state.langMode));
      doneBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "FINISH_PRAYERS" });
        syncAll(true);
        maybeAutoRead();
      });

      actionRow.appendChild(hangBtn);
      actionRow.appendChild(doneBtn);
      stack.appendChild(actionRow);
      controlDeck.appendChild(stack);
      return;
    }

    // journey_finale
    const promptCard = document.createElement("div");
    promptCard.className = "prompt-card";
    const kicker = document.createElement("div");
    kicker.className = "prompt-kicker";
    kicker.textContent = formatLocalized(UI_TEXT.finaleKicker, state.langMode, " | ");
    promptCard.appendChild(kicker);
    promptCard.appendChild(
      makeBilingualBlock(getChurchPrompt(state.promptIndex), state.langMode, "prompt-text", "prompt-sub")
    );
    stack.appendChild(promptCard);

    if (speech.isSupported()) {
      const readBtn = document.createElement("button");
      readBtn.type = "button";
      readBtn.className = "secondary-btn";
      readBtn.appendChild(makeDualButtonContent(UI_TEXT.listenPrayerBtn, state.langMode));
      readBtn.addEventListener("click", () => {
        speakCurrentScreen();
      });
      stack.appendChild(readBtn);
    }

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "primary-btn big-btn";
    saveBtn.appendChild(makeDualButtonContent(UI_TEXT.saveCardBtn, state.langMode));
    saveBtn.addEventListener("click", async () => {
      unlockAudio();
      cachedPostcardCanvas = renderPostcardCanvas(state);
      const res = await exportPostcard(cachedPostcardCanvas);
      if (modal && modalImg && modalStatus) {
        modalImg.src = res.dataUrl;
        if (res.method === "share") {
          modalStatus.textContent = formatLocalized(UI_TEXT.modalShared, state.langMode, " / ");
        } else if (res.method === "download") {
          modalStatus.textContent = formatLocalized(UI_TEXT.modalDownloaded, state.langMode, " / ");
        } else {
          modalStatus.textContent = formatLocalized(UI_TEXT.modalTipIos, state.langMode, " / ");
        }
        modal.classList.remove("hidden");
      }
    });
    stack.appendChild(saveBtn);

    const bottomRow = document.createElement("div");
    bottomRow.className = "seg-row";
    const shuffleBtn = document.createElement("button");
    shuffleBtn.type = "button";
    shuffleBtn.className = "ghost-btn";
    shuffleBtn.textContent = formatPrimary(UI_TEXT.newPromptBtn, state.langMode);
    shuffleBtn.addEventListener("click", () => {
      unlockAudio();
      applyAction(state, { type: "SHUFFLE_PROMPT" });
      syncAll(true);
    });

    const replayBtn = document.createElement("button");
    replayBtn.type = "button";
    replayBtn.className = "ghost-btn";
    replayBtn.textContent = formatPrimary(UI_TEXT.playAgainBtn, state.langMode);
    replayBtn.addEventListener("click", () => {
      unlockAudio();
      speech.stop();
      applyAction(state, { type: "PLAY_AGAIN" });
      syncAll(true);
    });

    bottomRow.appendChild(shuffleBtn);
    bottomRow.appendChild(replayBtn);
    stack.appendChild(bottomRow);
    controlDeck.appendChild(stack);
  }

  function flushSounds(): void {
    const sounds = drainSounds(state);
    for (let i = 0; i < sounds.length; i++) {
      audio.play(sounds[i]);
    }
  }

  function syncAll(forceDeck = false): void {
    audio.setMuted(state.muted);
    speech.setMuted(state.muted);
    flushSounds();
    updateTopBar();
    updateHud();
    buildDeck(forceDeck);
    renderStageCanvas(stageCtx, state);
  }

  // Topbar bindings
  function bindLangBtn(btn: HTMLButtonElement | null, mode: LangMode): void {
    if (!btn) {
      return;
    }
    btn.addEventListener("click", () => {
      unlockAudio();
      applyAction(state, { type: "SET_LANG_MODE", langMode: mode });
      syncAll(true);
    });
  }
  bindLangBtn(langEnBtn, "en");
  bindLangBtn(langZhBtn, "zh");
  bindLangBtn(langDualBtn, "dual");

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      unlockAudio();
      applyAction(state, { type: "TOGGLE_MUTE" });
      syncAll(true);
    });
  }

  if (hudListenBtn) {
    hudListenBtn.addEventListener("click", () => {
      speakCurrentScreen();
    });
  }

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
  if (modalShareBtn && modalStatus) {
    modalShareBtn.addEventListener("click", async () => {
      if (!cachedPostcardCanvas) {
        cachedPostcardCanvas = renderPostcardCanvas(state);
      }
      const res = await exportPostcard(cachedPostcardCanvas);
      modalStatus.textContent =
        res.method === "share"
          ? formatLocalized(UI_TEXT.modalShared, state.langMode, " / ")
          : formatLocalized(UI_TEXT.modalTipIos, state.langMode, " / ");
    });
  }

  // Direct Canvas touch/pointer support for tactile iPhone play
  stageCanvas.addEventListener("pointerdown", (ev) => {
    unlockAudio();
    const rect = stageCanvas.getBoundingClientRect();
    const xNorm = rect.width > 0 ? Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)) : 0.5;
    if (state.phase === "stage_play" && state.stageState) {
      if (state.stageState.kind === "loaves_and_fish") {
        if (!state.stageState.prayedWithJesus) {
          applyAction(state, { type: "PRAY_WITH_JESUS" });
          syncAll(true);
        } else {
          activePointerXNorm = xNorm;
        }
      } else if (state.stageState.kind === "run_back_to_jesus") {
        if (state.stageState.subPhase === "turn_back") {
          pendingPrimaryTap = true;
        } else {
          pendingLanePick = xNorm < 0.36 ? 0 : xNorm > 0.64 ? 2 : 1;
        }
      }
    }
  });
  stageCanvas.addEventListener("pointermove", (ev) => {
    if (
      (ev.buttons > 0 || ev.pointerType === "touch") &&
      state.phase === "stage_play" &&
      state.stageState &&
      state.stageState.kind === "loaves_and_fish" &&
      state.stageState.prayedWithJesus
    ) {
      const rect = stageCanvas.getBoundingClientRect();
      if (rect.width > 0) {
        activePointerXNorm = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      }
    }
  });
  stageCanvas.addEventListener("pointerup", () => {
    activePointerXNorm = null;
  });
  stageCanvas.addEventListener("pointercancel", () => {
    activePointerXNorm = null;
  });

  // Laptop keyboard support
  window.addEventListener("keydown", (ev) => {
    if (document.activeElement && document.activeElement.tagName === "INPUT") {
      return;
    }
    if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
      keysHeld.add("ArrowLeft");
      if (
        state.phase === "stage_play" &&
        state.stageState &&
        state.stageState.kind === "run_back_to_jesus" &&
        state.stageState.subPhase === "road"
      ) {
        pendingLanePick = state.stageState.lane === 2 ? 1 : 0;
      }
    } else if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
      keysHeld.add("ArrowRight");
      if (
        state.phase === "stage_play" &&
        state.stageState &&
        state.stageState.kind === "run_back_to_jesus" &&
        state.stageState.subPhase === "road"
      ) {
        pendingLanePick = state.stageState.lane === 0 ? 1 : 2;
      }
    } else if (ev.key === " " || ev.key === "Enter") {
      ev.preventDefault();
      unlockAudio();
      pendingPrimaryTap = true;
    } else if (ev.key === "l" || ev.key === "L") {
      speakCurrentScreen();
    }
  });
  window.addEventListener("keyup", (ev) => {
    if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
      keysHeld.delete("ArrowLeft");
    } else if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
      keysHeld.delete("ArrowRight");
    }
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    renderStageCanvas(stageCtx, state);
  });

  resizeCanvas();
  syncAll(true);

  let lastTs = performance.now();
  function tick(now: number): void {
    const dt = Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
    lastTs = now;

    const moveDir =
      (keysHeld.has("ArrowRight") ? 1 : 0) - (keysHeld.has("ArrowLeft") ? 1 : 0);
    const frameInput: FrameInput = {
      primaryTap: pendingPrimaryTap,
      moveDir,
      pointerXNorm: activePointerXNorm,
      lanePick: pendingLanePick
    };
    pendingPrimaryTap = false;
    pendingLanePick = null;

    const prevPhase = state.phase;
    stepGame(state, dt, frameInput);
    flushSounds();
    updateHud();
    buildDeck(false);
    if (state.phase !== prevPhase) {
      maybeAutoRead();
    }
    renderStageCanvas(stageCtx, state);
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountThankfulJesusApp());
  } else {
    mountThankfulJesusApp();
  }
}
