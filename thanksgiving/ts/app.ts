import { drawStickerIcon } from "./artwork";
import { FeastAudio } from "./audio";
import {
  DISH_SEQUENCE,
  DISH_SPECS,
  LEAF_COLORS,
  MAX_CUSTOM_NOTE_LEN,
  MAX_LEAVES,
  STAGE_LOGICAL_H,
  STAGE_LOGICAL_W,
  STICKER_PRESETS
} from "./constants";
import {
  applyAction,
  createInitialState,
  drainPendingSounds,
  EMPTY_INPUT,
  getChefLabel,
  getCurrentDishId,
  stepGame
} from "./game";
import { getTablePrompt } from "./gratitude";
import { exportPostcard, renderPostcardCanvas } from "./postcard";
import { renderStageCanvas } from "./renderer";
import { DifficultyMode, GameState, LeafColor, PlayMode, StickerId } from "./types";

export {
  applyAction,
  createInitialState,
  DISH_SEQUENCE,
  DISH_SPECS,
  drainPendingSounds,
  EMPTY_INPUT,
  getChefLabel,
  getCurrentDishId,
  getTablePrompt,
  LEAF_COLORS,
  MAX_CUSTOM_NOTE_LEN,
  MAX_LEAVES,
  STICKER_PRESETS,
  stepGame
};

function byId<T extends HTMLElement>(id: string): T | null {
  if (typeof document === "undefined") {
    return null;
  }
  return document.getElementById(id) as T | null;
}

export function mountApp(): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const canvas = byId<HTMLCanvasElement>("stage-canvas");
  const deckEl = byId<HTMLElement>("control-deck");
  const hudTitleEl = byId<HTMLElement>("hud-title");
  const hudMeterEl = byId<HTMLElement>("hud-meter");
  const modePillEl = byId<HTMLElement>("mode-pill");
  const muteBtn = byId<HTMLButtonElement>("mute-btn");
  const modalEl = byId<HTMLElement>("postcard-modal");
  const modalImg = byId<HTMLImageElement>("postcard-img");
  const modalStatus = byId<HTMLElement>("postcard-status");
  const modalCloseBtn = byId<HTMLButtonElement>("postcard-close-btn");
  const modalShareBtn = byId<HTMLButtonElement>("postcard-share-btn");

  if (!canvas || !deckEl) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const audio = new FeastAudio();
  const state: GameState = createInitialState({
    difficulty: "cozy",
    playMode: "pass_and_play",
    chefCount: 2,
    seed: Date.now() & 0x7fffffff
  });

  // Transient UI state
  let selectedSticker: StickerId = "family";
  let selectedLeafColor: LeafColor = "crimson";
  let customNoteDraft = "";
  let authorDraft = "";
  let lastRenderedPhaseKey = "";
  let lastPostcardCanvas: HTMLCanvasElement | null = null;

  // Live input accumulators
  let pendingPrimaryTap = false;
  let heldLeft = false;
  let heldRight = false;
  let activePointerXNorm: number | null = null;
  let pendingSwipeDelta = 0;
  let lastSwipeX: number | null = null;
  let lastSwipeY: number | null = null;

  function resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(STAGE_LOGICAL_W * dpr);
    canvas!.height = Math.round(STAGE_LOGICAL_H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function unlockAudio(): void {
    audio.unlock();
  }

  function clearInputs(): void {
    pendingPrimaryTap = false;
    heldLeft = false;
    heldRight = false;
    activePointerXNorm = null;
    pendingSwipeDelta = 0;
    lastSwipeX = null;
    lastSwipeY = null;
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      unlockAudio();
      applyAction(state, { type: "TOGGLE_MUTE" });
      audio.setMuted(state.muted);
      muteBtn.textContent = state.muted ? "SFX: Off" : "SFX: On";
    });
  }

  if (modalCloseBtn && modalEl) {
    modalCloseBtn.addEventListener("click", () => {
      modalEl.classList.add("hidden");
    });
  }

  if (modalShareBtn && modalStatus) {
    modalShareBtn.addEventListener("click", async () => {
      unlockAudio();
      if (!lastPostcardCanvas) {
        lastPostcardCanvas = renderPostcardCanvas(state);
      }
      const res = await exportPostcard(lastPostcardCanvas);
      if (res.method === "share") {
        modalStatus.textContent = "Shared! You can save it right to Photos.";
      } else {
        modalStatus.textContent = "Downloaded PNG! On iPhone, press & hold the image to Save to Photos.";
      }
    });
  }

  // Stage canvas direct pointer interactions (tap toast, drag popcorn, swipe pie)
  canvas.addEventListener("pointerdown", (e) => {
    unlockAudio();
    if (state.phase !== "dish_play" || !state.dishState) {
      return;
    }
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
    if (state.dishState.kind === "golden_toast") {
      pendingPrimaryTap = true;
    } else if (state.dishState.kind === "flying_popcorn") {
      activePointerXNorm = nx;
    } else if (state.dishState.kind === "pumpkin_pie") {
      if (state.dishState.stage === "cookie_drop") {
        pendingPrimaryTap = true;
      } else {
        lastSwipeX = nx;
        lastSwipeY = ny;
        pendingPrimaryTap = true;
      }
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (state.phase !== "dish_play" || !state.dishState) {
      return;
    }
    if (e.buttons === 0 && e.pointerType === "mouse") {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
    if (state.dishState.kind === "flying_popcorn") {
      activePointerXNorm = nx;
    } else if (state.dishState.kind === "pumpkin_pie" && state.dishState.stage === "whipping") {
      if (lastSwipeX !== null && lastSwipeY !== null) {
        const dist = Math.hypot(nx - lastSwipeX, ny - lastSwipeY);
        pendingSwipeDelta += dist;
      }
      lastSwipeX = nx;
      lastSwipeY = ny;
    }
  });

  const endCanvasPointer = () => {
    activePointerXNorm = null;
    lastSwipeX = null;
    lastSwipeY = null;
  };
  canvas.addEventListener("pointerup", endCanvasPointer);
  canvas.addEventListener("pointercancel", endCanvasPointer);

  // Laptop keyboard support
  window.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      return;
    }
    unlockAudio();
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      heldLeft = true;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      heldRight = true;
    } else if (e.code === "Space" || e.code === "Enter") {
      if (state.phase === "dish_play") {
        e.preventDefault();
        pendingPrimaryTap = true;
      } else if (state.phase === "pass_banner") {
        e.preventDefault();
        applyAction(state, { type: "CONFIRM_PASS" });
      } else if (state.phase === "dish_complete") {
        e.preventDefault();
        applyAction(state, { type: "NEXT_STAGE" });
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      heldLeft = false;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      heldRight = false;
    }
  });

  function makeBtn(label: string, className: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener("click", () => {
      unlockAudio();
      onClick();
    });
    return btn;
  }

  function renderDeck(): void {
    deckEl!.innerHTML = "";

    if (state.phase === "title") {
      const wrap = document.createElement("div");
      wrap.className = "deck-stack";

      const intro = document.createElement("p");
      intro.className = "deck-note";
      intro.textContent =
        "Cook 3 goofy Thanksgiving dishes, gather everyone at the backyard table, and hang leaves on the Gratitude Maple Tree!";
      wrap.appendChild(intro);

      // Difficulty row
      const diffRow = document.createElement("div");
      diffRow.className = "seg-row";
      const modes: { id: DifficultyMode; label: string }[] = [
        { id: "cozy", label: "Cozy (Ages 5+, No Timer)" },
        { id: "bustling", label: "Bustling Chef (Timed)" }
      ];
      for (let i = 0; i < modes.length; i++) {
        const m = modes[i];
        const b = makeBtn(
          m.label,
          "seg-btn" + (state.difficulty === m.id ? " active" : ""),
          () => {
            applyAction(state, { type: "SET_DIFFICULTY", difficulty: m.id });
            lastRenderedPhaseKey = "";
          }
        );
        diffRow.appendChild(b);
      }
      wrap.appendChild(diffRow);

      // Play mode / Chef count row
      const playRow = document.createElement("div");
      playRow.className = "seg-row";
      const setups: { mode: PlayMode; chefs: number; label: string }[] = [
        { mode: "solo", chefs: 1, label: "1 Chef" },
        { mode: "pass_and_play", chefs: 2, label: "2 Chefs" },
        { mode: "pass_and_play", chefs: 3, label: "3 Chefs" },
        { mode: "pass_and_play", chefs: 4, label: "4 Chefs" }
      ];
      for (let i = 0; i < setups.length; i++) {
        const s = setups[i];
        const active = state.playMode === s.mode && state.chefCount === s.chefs;
        const b = makeBtn(s.label, "seg-btn" + (active ? " active" : ""), () => {
          applyAction(state, { type: "SET_PLAY_MODE", playMode: s.mode, chefCount: s.chefs });
          lastRenderedPhaseKey = "";
        });
        playRow.appendChild(b);
      }
      wrap.appendChild(playRow);

      const startBtn = makeBtn("Start the Backyard Feast!", "primary-btn big-btn", () => {
        clearInputs();
        applyAction(state, { type: "START_FEAST" });
      });
      wrap.appendChild(startBtn);
      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "pass_banner") {
      const dishId = getCurrentDishId(state);
      const spec = DISH_SPECS[dishId];
      const wrap = document.createElement("div");
      wrap.className = "deck-stack center-stack";

      const badge = document.createElement("div");
      badge.className = "pass-badge";
      badge.textContent = "Pass the phone to " + getChefLabel(state.activeChefIndex) + "!";
      wrap.appendChild(badge);

      const sub = document.createElement("p");
      sub.className = "deck-note";
      sub.textContent = "Up next: " + spec.title + " - " + spec.instruction;
      wrap.appendChild(sub);

      const readyBtn = makeBtn("I'm Ready to Cook!", "primary-btn big-btn", () => {
        clearInputs();
        applyAction(state, { type: "CONFIRM_PASS" });
      });
      wrap.appendChild(readyBtn);
      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "dish_play" && state.dishState) {
      const wrap = document.createElement("div");
      wrap.className = "deck-stack";

      if (state.dishState.kind === "golden_toast") {
        const tip = document.createElement("p");
        tip.className = "deck-note";
        tip.textContent = "Tap when toast pops into the dashed Golden Zone!";
        wrap.appendChild(tip);

        const catchBtn = document.createElement("button");
        catchBtn.type = "button";
        catchBtn.className = "primary-btn giant-btn";
        catchBtn.textContent = "CATCH & BUTTER!";
        catchBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          unlockAudio();
          pendingPrimaryTap = true;
        });
        catchBtn.addEventListener("click", (e) => {
          // Keyboard Enter/Space activation has detail === 0; pointer taps are handled in pointerdown
          if (e.detail === 0) {
            unlockAudio();
            pendingPrimaryTap = true;
          }
        });
        wrap.appendChild(catchBtn);
      } else if (state.dishState.kind === "flying_popcorn") {
        // Wide thumb slide track
        const track = document.createElement("div");
        track.className = "slide-track";
        track.textContent = "<--  Slide thumb here to move the bowl  -->";
        track.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          unlockAudio();
          track.setPointerCapture(e.pointerId);
          const rect = track.getBoundingClientRect();
          activePointerXNorm = (e.clientX - rect.left) / Math.max(1, rect.width);
        });
        track.addEventListener("pointermove", (e) => {
          if (e.buttons === 0 && e.pointerType === "mouse") {
            return;
          }
          const rect = track.getBoundingClientRect();
          activePointerXNorm = (e.clientX - rect.left) / Math.max(1, rect.width);
        });
        const stopSlide = () => {
          activePointerXNorm = null;
        };
        track.addEventListener("pointerup", stopSlide);
        track.addEventListener("pointercancel", stopSlide);
        wrap.appendChild(track);

        // Big Left / Right tap buttons for younger kids & laptop clicks
        const lrRow = document.createElement("div");
        lrRow.className = "seg-row";
        const leftBtn = document.createElement("button");
        leftBtn.type = "button";
        leftBtn.className = "secondary-btn big-btn";
        leftBtn.textContent = "<< LEFT";
        leftBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          unlockAudio();
          heldLeft = true;
        });
        const stopL = () => {
          heldLeft = false;
        };
        leftBtn.addEventListener("pointerup", stopL);
        leftBtn.addEventListener("pointerleave", stopL);
        leftBtn.addEventListener("pointercancel", stopL);

        const rightBtn = document.createElement("button");
        rightBtn.type = "button";
        rightBtn.className = "secondary-btn big-btn";
        rightBtn.textContent = "RIGHT >>";
        rightBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          unlockAudio();
          heldRight = true;
        });
        const stopR = () => {
          heldRight = false;
        };
        rightBtn.addEventListener("pointerup", stopR);
        rightBtn.addEventListener("pointerleave", stopR);
        rightBtn.addEventListener("pointercancel", stopR);

        lrRow.appendChild(leftBtn);
        lrRow.appendChild(rightBtn);
        wrap.appendChild(lrRow);
      } else if (state.dishState.kind === "pumpkin_pie") {
        const isCookie = state.dishState.stage === "cookie_drop";
        if (isCookie) {
          const dropBtn = makeBtn("DROP MAPLE COOKIE!", "primary-btn giant-btn", () => {
            pendingPrimaryTap = true;
          });
          wrap.appendChild(dropBtn);
        } else {
          const pad = document.createElement("div");
          pad.className = "slide-track pie-pad";
          pad.textContent = "Rub back & forth here (or tap below) to whip cream!";
          pad.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            unlockAudio();
            pad.setPointerCapture(e.pointerId);
            const rect = pad.getBoundingClientRect();
            lastSwipeX = (e.clientX - rect.left) / Math.max(1, rect.width);
            lastSwipeY = (e.clientY - rect.top) / Math.max(1, rect.height);
            pendingPrimaryTap = true;
          });
          pad.addEventListener("pointermove", (e) => {
            if (e.buttons === 0 && e.pointerType === "mouse") {
              return;
            }
            const rect = pad.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
            const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
            if (lastSwipeX !== null && lastSwipeY !== null) {
              pendingSwipeDelta += Math.hypot(nx - lastSwipeX, ny - lastSwipeY);
            }
            lastSwipeX = nx;
            lastSwipeY = ny;
          });
          const endPad = () => {
            lastSwipeX = null;
            lastSwipeY = null;
          };
          pad.addEventListener("pointerup", endPad);
          pad.addEventListener("pointercancel", endPad);
          wrap.appendChild(pad);

          const whipBtn = makeBtn("WHIP CREAM SWIRL!", "primary-btn big-btn", () => {
            pendingPrimaryTap = true;
          });
          wrap.appendChild(whipBtn);
        }
      }

      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "dish_complete") {
      const last = state.results[state.results.length - 1];
      const wrap = document.createElement("div");
      wrap.className = "deck-stack center-stack";

      const msg = document.createElement("p");
      msg.className = "deck-note";
      msg.textContent = last
        ? last.guestUnlocked + " joined the backyard table! (" + String(last.stars) + " stars earned)"
        : "Dish served!";
      wrap.appendChild(msg);

      const isFinalDish = state.stageIndex + 1 >= DISH_SEQUENCE.length;
      const nextBtn = makeBtn(
        isFinalDish ? "Visit the Gratitude Maple Tree!" : "Cook Next Dish!",
        "primary-btn big-btn",
        () => {
          clearInputs();
          applyAction(state, { type: "NEXT_STAGE" });
        }
      );
      wrap.appendChild(nextBtn);
      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "gratitude_tree") {
      const wrap = document.createElement("div");
      wrap.className = "deck-stack gratitude-deck";

      const who = document.createElement("div");
      who.className = "gratitude-head";
      who.textContent =
        "Pick a sticker (or write a note) for " +
        getChefLabel(state.gratitudeChefCursor % state.chefCount) +
        ":";
      wrap.appendChild(who);

      // 8 Sticker Icon Buttons (vector drawn mini-canvases, ASCII-clean)
      const grid = document.createElement("div");
      grid.className = "sticker-grid";
      for (let i = 0; i < STICKER_PRESETS.length; i++) {
        const st = STICKER_PRESETS[i];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sticker-btn" + (selectedSticker === st.id ? " active" : "");
        const iconCanvas = document.createElement("canvas");
        iconCanvas.width = 40;
        iconCanvas.height = 40;
        const ictx = iconCanvas.getContext("2d");
        if (ictx) {
          drawStickerIcon(ictx, st.id, 20, 20, 26);
        }
        const lbl = document.createElement("span");
        lbl.textContent = st.label;
        btn.appendChild(iconCanvas);
        btn.appendChild(lbl);
        btn.addEventListener("click", () => {
          unlockAudio();
          selectedSticker = st.id;
          lastRenderedPhaseKey = "";
        });
        grid.appendChild(btn);
      }
      wrap.appendChild(grid);

      // Leaf color picker + optional name & note
      const colorRow = document.createElement("div");
      colorRow.className = "color-row";
      const colors: LeafColor[] = ["crimson", "amber", "gold", "russet"];
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "color-dot" + (selectedLeafColor === c ? " active" : "");
        swatch.style.backgroundColor = LEAF_COLORS[c].fill;
        swatch.setAttribute("aria-label", LEAF_COLORS[c].label);
        swatch.addEventListener("click", () => {
          unlockAudio();
          selectedLeafColor = c;
          lastRenderedPhaseKey = "";
        });
        colorRow.appendChild(swatch);
      }

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "note-input name-input";
      nameInput.maxLength = 16;
      nameInput.placeholder = "Name (optional)";
      nameInput.value = authorDraft;
      nameInput.addEventListener("input", () => {
        authorDraft = nameInput.value;
      });
      colorRow.appendChild(nameInput);
      wrap.appendChild(colorRow);

      const noteInput = document.createElement("input");
      noteInput.type = "text";
      noteInput.className = "note-input";
      noteInput.maxLength = MAX_CUSTOM_NOTE_LEN;
      noteInput.placeholder = "Optional: type your own thank-you note (any language)...";
      noteInput.value = customNoteDraft;
      noteInput.addEventListener("input", () => {
        customNoteDraft = noteInput.value;
      });
      wrap.appendChild(noteInput);

      const actionRow = document.createElement("div");
      actionRow.className = "seg-row";
      const addBtn = makeBtn(
        state.leaves.length >= MAX_LEAVES ? "Tree Full!" : "Hang Leaf on Tree",
        "primary-btn",
        () => {
          if (state.leaves.length >= MAX_LEAVES) {
            return;
          }
          applyAction(state, {
            type: "ADD_LEAF",
            stickerId: selectedSticker,
            leafColor: selectedLeafColor,
            customMessage: customNoteDraft,
            authorLabel: authorDraft
          });
          customNoteDraft = "";
          authorDraft = "";
          lastRenderedPhaseKey = "";
        }
      );
      if (state.leaves.length >= MAX_LEAVES) {
        addBtn.disabled = true;
      }
      const doneBtn = makeBtn(
        state.leaves.length > 0 ? "Let's Feast! (" + String(state.leaves.length) + ")" : "Let's Feast!",
        "secondary-btn",
        () => {
          applyAction(state, { type: "FINISH_GRATITUDE" });
        }
      );
      actionRow.appendChild(addBtn);
      actionRow.appendChild(doneBtn);
      wrap.appendChild(actionRow);

      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "feast_finale") {
      const wrap = document.createElement("div");
      wrap.className = "deck-stack";

      const promptBox = document.createElement("div");
      promptBox.className = "prompt-card";
      const promptTitle = document.createElement("div");
      promptTitle.className = "prompt-kicker";
      promptTitle.textContent = "Table Talk Prompt";
      const promptText = document.createElement("p");
      promptText.className = "prompt-text";
      promptText.textContent = getTablePrompt(state.tablePromptIndex);
      promptBox.appendChild(promptTitle);
      promptBox.appendChild(promptText);
      wrap.appendChild(promptBox);

      const btnRow = document.createElement("div");
      btnRow.className = "seg-row";
      const postcardBtn = makeBtn("Save Family Postcard", "primary-btn", () => {
        lastPostcardCanvas = renderPostcardCanvas(state);
        if (modalImg && modalEl && modalStatus) {
          modalImg.src = lastPostcardCanvas.toDataURL("image/png");
          modalStatus.textContent =
            "Tap Share / Save below, or press & hold the postcard on iPhone to save to Photos.";
          modalEl.classList.remove("hidden");
        }
      });
      const shuffleBtn = makeBtn("New Table Prompt", "secondary-btn", () => {
        applyAction(state, { type: "SHUFFLE_PROMPT" });
        lastRenderedPhaseKey = "";
      });
      btnRow.appendChild(postcardBtn);
      btnRow.appendChild(shuffleBtn);
      wrap.appendChild(btnRow);

      const replayBtn = makeBtn("Cook Another Feast!", "ghost-btn", () => {
        clearInputs();
        applyAction(state, { type: "PLAY_AGAIN" });
      });
      wrap.appendChild(replayBtn);

      deckEl!.appendChild(wrap);
    }
  }

  function updateHud(): void {
    if (modePillEl) {
      modePillEl.textContent = state.difficulty === "cozy" ? "Cozy Mode" : "Bustling Chef";
    }
    if (!hudTitleEl || !hudMeterEl) {
      return;
    }
    if (state.phase === "title") {
      hudTitleEl.textContent = "Beagle Chef's Backyard Feast";
      hudMeterEl.textContent = "3 Dishes + Gratitude Tree";
    } else if (state.phase === "pass_banner") {
      hudTitleEl.textContent = getChefLabel(state.activeChefIndex) + "'s Turn";
      hudMeterEl.textContent =
        "Dish " + String(state.stageIndex + 1) + "/" + String(DISH_SEQUENCE.length);
    } else if (state.phase === "dish_play" && state.dishState) {
      const spec = DISH_SPECS[state.dishState.kind];
      hudTitleEl.textContent = spec.shortTitle;
      const doneCount =
        state.dishState.kind === "golden_toast"
          ? state.dishState.plated
          : state.dishState.kind === "flying_popcorn"
            ? state.dishState.caught
            : state.dishState.piesFinished;
      const timerTxt =
        state.dishState.timeLeftSec !== null
          ? " | " + String(Math.ceil(state.dishState.timeLeftSec)) + "s"
          : " | Cozy";
      hudMeterEl.textContent =
        String(doneCount) + "/" + String(state.dishState.target) + timerTxt;
    } else if (state.phase === "dish_complete") {
      hudTitleEl.textContent = "Dish Served!";
      hudMeterEl.textContent = "Stars: " + String(state.totalStars);
    } else if (state.phase === "gratitude_tree") {
      hudTitleEl.textContent = "Gratitude Maple Tree";
      hudMeterEl.textContent = "Leaves: " + String(state.leaves.length) + "/" + String(MAX_LEAVES);
    } else {
      hudTitleEl.textContent = "Happy Thanksgiving!";
      hudMeterEl.textContent = "Total Stars: " + String(state.totalStars);
    }
  }

  function phaseKey(): string {
    const sub =
      state.phase === "dish_play" && state.dishState
        ? state.dishState.kind +
          ":" +
          (state.dishState.kind === "pumpkin_pie" ? state.dishState.stage : "play")
        : "";
    return [
      state.phase,
      sub,
      state.difficulty,
      state.playMode,
      state.chefCount,
      state.stageIndex,
      state.leaves.length,
      state.tablePromptIndex,
      selectedSticker,
      selectedLeafColor
    ].join("|");
  }

  let lastTs = performance.now();
  function loop(now: number): void {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
    lastTs = now;

    const moveDir: -1 | 0 | 1 = heldLeft && !heldRight ? -1 : heldRight && !heldLeft ? 1 : 0;
    stepGame(state, dt, {
      primaryTap: pendingPrimaryTap,
      moveDir,
      pointerXNorm: activePointerXNorm,
      swipeDelta: pendingSwipeDelta
    });
    pendingPrimaryTap = false;
    pendingSwipeDelta = 0;

    const sounds = drainPendingSounds(state);
    for (let i = 0; i < sounds.length; i++) {
      audio.play(sounds[i]);
    }

    const key = phaseKey();
    if (key !== lastRenderedPhaseKey) {
      lastRenderedPhaseKey = key;
      renderDeck();
    }
    updateHud();
    renderStageCanvas(ctx!, state);

    window.requestAnimationFrame(loop);
  }

  renderDeck();
  updateHud();
  renderStageCanvas(ctx, state);
  window.requestAnimationFrame(loop);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountApp());
  } else {
    mountApp();
  }
}
