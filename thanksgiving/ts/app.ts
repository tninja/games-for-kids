import { drawSnackIcon, drawStickerIcon } from "./artwork";
import { FeastAudio } from "./audio";
import {
  DISH_SEQUENCE,
  DISH_SPECS,
  LEAF_COLORS,
  MAX_CUSTOM_NOTE_LEN,
  MAX_LEAVES,
  SNACK_IDS,
  SNACK_SPECS,
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
import { DifficultyMode, GameState, LeafColor, PlayMode, SnackId, StickerId } from "./types";

export {
  applyAction,
  createInitialState,
  DISH_SEQUENCE,
  DISH_SPECS,
  drainPendingSounds,
  drawSnackIcon,
  drawStickerIcon,
  EMPTY_INPUT,
  getChefLabel,
  getCurrentDishId,
  getTablePrompt,
  LEAF_COLORS,
  MAX_CUSTOM_NOTE_LEN,
  MAX_LEAVES,
  renderPostcardCanvas,
  renderStageCanvas,
  SNACK_IDS,
  SNACK_SPECS,
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
  let pendingSecondaryTap = false;
  let pendingSnackPick: SnackId | null = null;
  let heldLeftP1 = false;
  let heldRightP1 = false;
  let heldLeftP2 = false;
  let heldRightP2 = false;
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
    pendingSecondaryTap = false;
    pendingSnackPick = null;
    heldLeftP1 = false;
    heldRightP1 = false;
    heldLeftP2 = false;
    heldRightP2 = false;
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
        modalStatus.textContent =
          "Downloaded PNG! On iPhone, press & hold the image to Save to Photos.";
      }
    });
  }

  // Stage canvas direct pointer interactions (dish gestures + character Easter eggs!)
  canvas.addEventListener("pointerdown", (e) => {
    unlockAudio();
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height);

    if (state.phase !== "dish_play" || !state.dishState) {
      // Interactive Easter eggs: tap Beagle Chef (left/doghouse) or Little Bird (right)!
      if (nx < 0.45) {
        applyAction(state, { type: "POKE_CHEF" });
      } else if (nx > 0.55) {
        applyAction(state, { type: "POKE_BIRD" });
      } else {
        applyAction(state, { type: state.easterEggCount % 2 === 0 ? "POKE_CHEF" : "POKE_BIRD" });
      }
      return;
    }

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    if (state.dishState.kind === "golden_toast" || state.dishState.kind === "folding_chair") {
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
        pendingSwipeDelta += Math.hypot(nx - lastSwipeX, ny - lastSwipeY);
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

  // Laptop 1P + 2P Co-op keyboard support
  window.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      return;
    }
    unlockAudio();
    const isCoop = state.playMode === "laptop_coop";

    if (e.code === "KeyA") {
      heldLeftP1 = true;
    } else if (e.code === "KeyD") {
      heldRightP1 = true;
    } else if (e.code === "ArrowLeft") {
      if (isCoop) {
        heldLeftP2 = true;
      } else {
        heldLeftP1 = true;
      }
    } else if (e.code === "ArrowRight") {
      if (isCoop) {
        heldRightP2 = true;
      } else {
        heldRightP1 = true;
      }
    }

    if (state.phase === "dish_play" && state.dishState) {
      if (state.dishState.kind === "pretzel_platter") {
        if (e.code === "Digit1" || (isCoop && e.code === "KeyA")) {
          e.preventDefault();
          pendingSnackPick = "pretzel";
        } else if (e.code === "Digit2" || (isCoop && e.code === "KeyS")) {
          e.preventDefault();
          pendingSnackPick = "orange_bean";
        } else if (e.code === "Digit3" || (isCoop && e.code === "ArrowLeft")) {
          e.preventDefault();
          pendingSnackPick = "berry_bean";
        } else if (e.code === "Digit4" || (isCoop && e.code === "ArrowRight")) {
          e.preventDefault();
          pendingSnackPick = "cider";
        }
        return;
      }

      if (e.code === "Space" || e.code === "KeyW") {
        e.preventDefault();
        pendingPrimaryTap = true;
      } else if (e.code === "Enter" || e.code === "ArrowUp") {
        e.preventDefault();
        if (isCoop) {
          pendingSecondaryTap = true;
        } else {
          pendingPrimaryTap = true;
        }
      }
    } else if (e.code === "Space" || e.code === "Enter") {
      if (state.phase === "pass_banner") {
        e.preventDefault();
        applyAction(state, { type: "CONFIRM_PASS" });
      } else if (state.phase === "dish_complete") {
        e.preventDefault();
        applyAction(state, { type: "NEXT_STAGE" });
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    const isCoop = state.playMode === "laptop_coop";
    if (e.code === "KeyA") {
      heldLeftP1 = false;
    } else if (e.code === "KeyD") {
      heldRightP1 = false;
    } else if (e.code === "ArrowLeft") {
      if (isCoop) {
        heldLeftP2 = false;
      } else {
        heldLeftP1 = false;
      }
    } else if (e.code === "ArrowRight") {
      if (isCoop) {
        heldRightP2 = false;
      } else {
        heldRightP1 = false;
      }
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

  function makeInstantActionBtn(
    label: string,
    className: string,
    onTrigger: () => void
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      unlockAudio();
      onTrigger();
    });
    btn.addEventListener("click", (e) => {
      if (e.detail === 0) {
        unlockAudio();
        onTrigger();
      }
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
        "Cook 4 Thanksgiving treats, tame the runaway lawn chair, hang leaves on the Gratitude Maple Tree, and save your Family Postcard!";
      wrap.appendChild(intro);

      const diffRow = document.createElement("div");
      diffRow.className = "seg-row";
      const modes: { id: DifficultyMode; label: string }[] = [
        { id: "cozy", label: "Cozy (Ages 5+, No Timer)" },
        { id: "bustling", label: "Bustling Chef (Timed)" }
      ];
      for (let i = 0; i < modes.length; i++) {
        const m = modes[i];
        diffRow.appendChild(
          makeBtn(m.label, "seg-btn" + (state.difficulty === m.id ? " active" : ""), () => {
            applyAction(state, { type: "SET_DIFFICULTY", difficulty: m.id });
            lastRenderedPhaseKey = "";
          })
        );
      }
      wrap.appendChild(diffRow);

      const playRow = document.createElement("div");
      playRow.className = "seg-row";
      const setups: { mode: PlayMode; chefs: number; label: string }[] = [
        { mode: "solo", chefs: 1, label: "1 Chef" },
        { mode: "pass_and_play", chefs: 2, label: "2 Pass" },
        { mode: "pass_and_play", chefs: 3, label: "3 Pass" },
        { mode: "pass_and_play", chefs: 4, label: "4 Pass" }
      ];
      for (let i = 0; i < setups.length; i++) {
        const s = setups[i];
        const active = state.playMode === s.mode && state.chefCount === s.chefs;
        playRow.appendChild(
          makeBtn(s.label, "seg-btn" + (active ? " active" : ""), () => {
            applyAction(state, { type: "SET_PLAY_MODE", playMode: s.mode, chefCount: s.chefs });
            lastRenderedPhaseKey = "";
          })
        );
      }
      wrap.appendChild(playRow);

      const coopRow = document.createElement("div");
      coopRow.className = "seg-row";
      coopRow.appendChild(
        makeBtn(
          "Laptop 2P Co-op (P1: WASD/Space + P2: Arrows/Enter)",
          "seg-btn" + (state.playMode === "laptop_coop" ? " active" : ""),
          () => {
            applyAction(state, { type: "SET_PLAY_MODE", playMode: "laptop_coop", chefCount: 2 });
            lastRenderedPhaseKey = "";
          }
        )
      );
      wrap.appendChild(coopRow);

      wrap.appendChild(
        makeBtn("Start the Backyard Feast!", "primary-btn big-btn", () => {
          clearInputs();
          applyAction(state, { type: "START_FEAST" });
        })
      );
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

      wrap.appendChild(
        makeBtn("I'm Ready!", "primary-btn big-btn", () => {
          clearInputs();
          applyAction(state, { type: "CONFIRM_PASS" });
        })
      );
      deckEl!.appendChild(wrap);
      return;
    }

    if (state.phase === "dish_play" && state.dishState) {
      const wrap = document.createElement("div");
      wrap.className = "deck-stack";
      const isCoop = state.playMode === "laptop_coop";

      if (state.dishState.kind === "golden_toast") {
        const tip = document.createElement("p");
        tip.className = "deck-note";
        tip.textContent = isCoop
          ? "P1 (Space) & P2 Bird (Enter): catch toast in the Golden Zone!"
          : "Tap when toast pops into the dashed Golden Zone!";
        wrap.appendChild(tip);

        wrap.appendChild(
          makeInstantActionBtn("CATCH & BUTTER!", "primary-btn giant-btn", () => {
            pendingPrimaryTap = true;
          })
        );
      } else if (state.dishState.kind === "flying_popcorn") {
        if (isCoop) {
          const coopTip = document.createElement("p");
          coopTip.className = "deck-note";
          coopTip.textContent = "P1: A / D moves Beagle Bowl | P2: Left / Right flies Bird Cup!";
          wrap.appendChild(coopTip);
        }

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

        const lrRow = document.createElement("div");
        lrRow.className = "seg-row";
        const leftBtn = document.createElement("button");
        leftBtn.type = "button";
        leftBtn.className = "secondary-btn big-btn";
        leftBtn.textContent = "<< LEFT";
        leftBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          unlockAudio();
          heldLeftP1 = true;
        });
        const stopL = () => {
          heldLeftP1 = false;
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
          heldRightP1 = true;
        });
        const stopR = () => {
          heldRightP1 = false;
        };
        rightBtn.addEventListener("pointerup", stopR);
        rightBtn.addEventListener("pointerleave", stopR);
        rightBtn.addEventListener("pointercancel", stopR);

        lrRow.appendChild(leftBtn);
        lrRow.appendChild(rightBtn);
        wrap.appendChild(lrRow);
      } else if (state.dishState.kind === "folding_chair") {
        const tip = document.createElement("p");
        tip.className = "deck-note";
        tip.textContent = isCoop
          ? "Team up! P1 (Space/W) + P2 (Enter/Up) tap fast to fold the lawn chair!"
          : "Tap fast to fold and tame the runaway backyard lawn chair!";
        wrap.appendChild(tip);

        wrap.appendChild(
          makeInstantActionBtn("TAME THE CHAIR!", "primary-btn giant-btn", () => {
            pendingPrimaryTap = true;
          })
        );
      } else if (state.dishState.kind === "pretzel_platter") {
        const tip = document.createElement("p");
        tip.className = "deck-note";
        tip.textContent = isCoop
          ? "Tap snacks in order! (P1: 1/2 or A/S | P2: 3/4 or Left/Right)"
          : "Tap the highlighted snacks in order to fill the platter!";
        wrap.appendChild(tip);

        const grid = document.createElement("div");
        grid.className = "snack-grid";
        for (let i = 0; i < SNACK_SPECS.length; i++) {
          const sp = SNACK_SPECS[i];
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "snack-btn";

          const ic = document.createElement("canvas");
          ic.width = 48;
          ic.height = 48;
          const ictx = ic.getContext("2d");
          if (ictx) {
            drawSnackIcon(ictx, sp.id, 24, 24, 34);
          }
          const lbl = document.createElement("span");
          lbl.className = "snack-label";
          lbl.textContent = sp.label;
          const hint = document.createElement("span");
          hint.className = "key-hint";
          hint.textContent = "[" + sp.keyHint + "]";

          btn.appendChild(ic);
          btn.appendChild(lbl);
          btn.appendChild(hint);

          btn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            unlockAudio();
            pendingSnackPick = sp.id;
          });
          btn.addEventListener("click", (e) => {
            if (e.detail === 0) {
              unlockAudio();
              pendingSnackPick = sp.id;
            }
          });
          grid.appendChild(btn);
        }
        wrap.appendChild(grid);
      } else if (state.dishState.kind === "pumpkin_pie") {
        const isCookie = state.dishState.stage === "cookie_drop";
        if (isCookie) {
          wrap.appendChild(
            makeInstantActionBtn("DROP MAPLE COOKIE!", "primary-btn giant-btn", () => {
              pendingPrimaryTap = true;
            })
          );
        } else {
          const pad = document.createElement("div");
          pad.className = "slide-track pie-pad";
          pad.textContent = isCoop
            ? "Swipe here, or P1 (Space) + P2 (Enter) tap together to whip cream!"
            : "Rub back & forth here (or tap below) to whip cream!";
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

          wrap.appendChild(
            makeInstantActionBtn("WHIP CREAM SWIRL!", "primary-btn big-btn", () => {
              pendingPrimaryTap = true;
            })
          );
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
        : "Stage complete!";
      wrap.appendChild(msg);

      const isFinalDish = state.stageIndex + 1 >= DISH_SEQUENCE.length;
      wrap.appendChild(
        makeBtn(
          isFinalDish ? "Visit the Gratitude Maple Tree!" : "Next Backyard Station!",
          "primary-btn big-btn",
          () => {
            clearInputs();
            applyAction(state, { type: "NEXT_STAGE" });
          }
        )
      );
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
      btnRow.appendChild(
        makeBtn("Save Family Postcard", "primary-btn", () => {
          lastPostcardCanvas = renderPostcardCanvas(state);
          if (modalImg && modalEl && modalStatus) {
            modalImg.src = lastPostcardCanvas.toDataURL("image/png");
            modalStatus.textContent =
              "Tap Share / Save below, or press & hold the postcard on iPhone to save to Photos.";
            modalEl.classList.remove("hidden");
          }
        })
      );
      btnRow.appendChild(
        makeBtn("New Table Prompt", "secondary-btn", () => {
          applyAction(state, { type: "SHUFFLE_PROMPT" });
          lastRenderedPhaseKey = "";
        })
      );
      wrap.appendChild(btnRow);

      wrap.appendChild(
        makeBtn("Cook Another Feast!", "ghost-btn", () => {
          clearInputs();
          applyAction(state, { type: "PLAY_AGAIN" });
        })
      );

      deckEl!.appendChild(wrap);
    }
  }

  function updateHud(): void {
    if (modePillEl) {
      const diffTxt = state.difficulty === "cozy" ? "Cozy" : "Bustling";
      const playTxt = state.playMode === "laptop_coop" ? "2P Co-op" : diffTxt;
      modePillEl.textContent = state.playMode === "laptop_coop" ? diffTxt + " | " + playTxt : diffTxt + " Mode";
    }
    if (!hudTitleEl || !hudMeterEl) {
      return;
    }
    if (state.phase === "title") {
      hudTitleEl.textContent = "Beagle Chef's Backyard Feast";
      hudMeterEl.textContent = "5 Stages + Gratitude Tree";
    } else if (state.phase === "pass_banner") {
      hudTitleEl.textContent = getChefLabel(state.activeChefIndex) + "'s Turn";
      hudMeterEl.textContent =
        "Stage " + String(state.stageIndex + 1) + "/" + String(DISH_SEQUENCE.length);
    } else if (state.phase === "dish_play" && state.dishState) {
      const spec = DISH_SPECS[state.dishState.kind];
      hudTitleEl.textContent = spec.shortTitle;
      let progressTxt = "";
      if (state.dishState.kind === "golden_toast") {
        progressTxt = String(state.dishState.plated) + "/" + String(state.dishState.target);
      } else if (state.dishState.kind === "flying_popcorn") {
        progressTxt = String(state.dishState.caught) + "/" + String(state.dishState.target);
      } else if (state.dishState.kind === "folding_chair") {
        progressTxt = String(Math.round(state.dishState.tamedProgress)) + "%";
      } else if (state.dishState.kind === "pretzel_platter") {
        progressTxt = String(state.dishState.plattersDone) + "/" + String(state.dishState.target);
      } else {
        progressTxt = String(state.dishState.piesFinished) + "/" + String(state.dishState.target);
      }
      const timerTxt =
        state.dishState.timeLeftSec !== null
          ? " | " + String(Math.ceil(state.dishState.timeLeftSec)) + "s"
          : " | Cozy";
      hudMeterEl.textContent = progressTxt + timerTxt;
    } else if (state.phase === "dish_complete") {
      hudTitleEl.textContent = "Stage Complete!";
      hudMeterEl.textContent = "Stars: " + String(state.totalStars);
    } else if (state.phase === "gratitude_tree") {
      hudTitleEl.textContent = "Gratitude Maple Tree";
      hudMeterEl.textContent = "Leaves: " + String(state.leaves.length) + "/" + String(MAX_LEAVES);
    } else {
      hudTitleEl.textContent = "Happy Thanksgiving!";
      hudMeterEl.textContent = "Total Stars: " + String(state.totalStars) + "/15";
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

    const moveDir: -1 | 0 | 1 =
      heldLeftP1 && !heldRightP1 ? -1 : heldRightP1 && !heldLeftP1 ? 1 : 0;
    const moveDirP2: -1 | 0 | 1 =
      heldLeftP2 && !heldRightP2 ? -1 : heldRightP2 && !heldLeftP2 ? 1 : 0;

    stepGame(state, dt, {
      primaryTap: pendingPrimaryTap,
      secondaryTap: pendingSecondaryTap,
      moveDir,
      moveDirP2,
      pointerXNorm: activePointerXNorm,
      swipeDelta: pendingSwipeDelta,
      snackPick: pendingSnackPick
    });
    pendingPrimaryTap = false;
    pendingSecondaryTap = false;
    pendingSwipeDelta = 0;
    pendingSnackPick = null;

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
