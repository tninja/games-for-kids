import { FoosballAudio } from "./audio";
import {
  AI_LEVEL_ORDER,
  AI_PRESETS,
  BALL_RADIUS,
  DEAD_BALL_TIMEOUT,
  FIELD_LENGTH,
  FIELD_WIDTH,
  GOAL_DEPTH,
  GOAL_WIDTH,
  LIFT_ANGLE,
  LIFT_CLEARANCE_ANGLE,
  ROD_CONFIGS,
  TEAM_PALETTES,
  THEME_ORDER
} from "./constants";
import { FoosballGame } from "./game";
import { CameraPose, FoosballScene3D, SceneStats } from "./scene3d";
import {
  AiLevel,
  CameraMode,
  ControlMode,
  GameMode,
  MatchPhase,
  PlayerSlot,
  RodRole,
  SoundEvent,
  StorageLike,
  Team,
  TeamColorTheme
} from "./types";

export interface FoosballAppOptions {
  seed?: number;
  storage?: StorageLike | null;
  headless?: boolean;
  cameraMode?: CameraMode;
}

export interface StartMatchConfig {
  mode?: GameMode;
  aiLevel?: AiLevel;
  targetScore?: 5 | 7 | 10;
  controlMode?: ControlMode;
  strictSpinNotice?: boolean;
  p1OnDefense?: boolean;
}

export interface FoosballUiSnapshot {
  phase: MatchPhase;
  mode: GameMode;
  aiLevel: AiLevel;
  targetScore: 5 | 7 | 10;
  controlMode: ControlMode;
  strictSpinNotice: boolean;
  p1OnDefense: boolean;
  theme: TeamColorTheme;
  cameraMode: CameraMode;
  scoreBlue: number;
  scoreRed: number;
  winner: Team | null;
  lastScorer: Team | null;
  activeBlueRod: RodRole;
  activeRedRod: RodRole;
  deadBallProgress: number;
  spinNoticeTeam: Team | null;
  practiceHits: number;
  practiceStreak: number;
  practiceBestStreak: number;
  muted: boolean;
  webglAvailable: boolean;
}

const CAMERA_ORDER: readonly CameraMode[] = ["angled", "top", "closeup"];
const STORAGE_KEY = "foosball3d_prefs_v1";

export class FoosballApp {
  public readonly canvas: { clientWidth?: number; clientHeight?: number };
  public readonly audio: FoosballAudio;
  public readonly game: FoosballGame;
  public readonly scene3d: FoosballScene3D;
  public cameraMode: CameraMode;

  private storage: StorageLike | null;
  private keysDown: Set<string> = new Set();
  private touchSlide: Record<PlayerSlot, number> = { p1: 0, p2: 0 };
  private touchKick: Record<PlayerSlot, boolean> = { p1: false, p2: false };
  private touchLift: Record<PlayerSlot, boolean> = { p1: false, p2: false };
  private accumulator = 0;
  private pendingRenderDt = 0;

  constructor(
    canvas: { clientWidth?: number; clientHeight?: number },
    options: FoosballAppOptions = {}
  ) {
    this.canvas = canvas;
    this.storage = options.storage ?? null;
    this.audio = new FoosballAudio();

    const domCanvas =
      typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement
        ? canvas
        : null;
    this.scene3d = new FoosballScene3D(domCanvas, Boolean(options.headless));
    this.cameraMode = options.cameraMode ?? "angled";

    this.game = new FoosballGame({
      seed: options.seed,
      onSound: (event: SoundEvent, intensity?: number) => {
        this.audio.play(event, intensity);
        if (event === "goal" && this.game.lastScorer) {
          this.scene3d.spawnGoalConfetti(this.game.lastScorer);
          this.scene3d.triggerShake(0.28);
        } else if (event === "powerKick" || event === "post") {
          this.scene3d.triggerShake(0.14);
        } else if (event === "target") {
          this.scene3d.spawnGoalConfetti("blue");
          this.scene3d.triggerShake(0.18);
        }
      }
    });

    this.loadPreferences();
  }

  private loadPreferences(): void {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<{
        muted: boolean;
        theme: TeamColorTheme;
        aiLevel: AiLevel;
        targetScore: 5 | 7 | 10;
        practiceBestStreak: number;
      }>;
      if (typeof data.muted === "boolean") this.audio.setMuted(data.muted);
      if (data.theme && TEAM_PALETTES[data.theme]) this.game.theme = data.theme;
      if (data.aiLevel && AI_PRESETS[data.aiLevel]) this.game.setAiLevel(data.aiLevel);
      if (data.targetScore === 5 || data.targetScore === 7 || data.targetScore === 10) {
        this.game.setTargetScore(data.targetScore);
      }
      if (typeof data.practiceBestStreak === "number" && data.practiceBestStreak > 0) {
        this.game.practiceBestStreak = data.practiceBestStreak;
      }
    } catch {
      // Ignore malformed stored preferences
    }
  }

  public savePreferences(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted: this.audio.muted,
          theme: this.game.theme,
          aiLevel: this.game.aiLevel,
          targetScore: this.game.targetScore,
          practiceBestStreak: this.game.practiceBestStreak
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  public startMatch(config: StartMatchConfig = {}): void {
    this.audio.unlock();
    if (config.mode) this.game.setMode(config.mode);
    if (config.aiLevel) this.game.setAiLevel(config.aiLevel);
    if (config.targetScore) this.game.setTargetScore(config.targetScore);
    if (config.controlMode) this.game.setControlMode(config.controlMode);
    if (config.strictSpinNotice !== undefined) this.game.strictSpinNotice = config.strictSpinNotice;
    if (config.p1OnDefense !== undefined) this.game.p1OnDefense = config.p1OnDefense;
    this.game.startMatch();
    this.savePreferences();
  }

  public returnToMenu(): void {
    this.game.phase = "menu";
    this.keysDown.clear();
    this.touchSlide = { p1: 0, p2: 0 };
    this.touchKick = { p1: false, p2: false };
    this.touchLift = { p1: false, p2: false };
  }

  public cycleCameraMode(): CameraMode {
    const idx = CAMERA_ORDER.indexOf(this.cameraMode);
    this.cameraMode = CAMERA_ORDER[(idx + 1) % CAMERA_ORDER.length];
    return this.cameraMode;
  }

  public setCameraMode(mode: CameraMode): void {
    this.cameraMode = mode;
  }

  public cycleTheme(): TeamColorTheme {
    const idx = THEME_ORDER.indexOf(this.game.theme);
    this.game.theme = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    this.savePreferences();
    return this.game.theme;
  }

  public toggleMute(): boolean {
    const m = this.audio.toggleMute();
    this.savePreferences();
    return m;
  }

  public toggleControlMode(): ControlMode {
    const next: ControlMode = this.game.controlMode === "sync" ? "advanced" : "sync";
    this.game.setControlMode(next);
    return next;
  }

  public toggleCoopSwap(): boolean {
    return this.game.toggleCoopSwap();
  }

  public setTouchSlide(slot: PlayerSlot, value: number): void {
    this.audio.unlock();
    this.touchSlide[slot] = Math.max(-1, Math.min(1, value));
  }

  public setTouchKick(slot: PlayerSlot, held: boolean): void {
    this.audio.unlock();
    this.touchKick[slot] = held;
  }

  public setTouchLift(slot: PlayerSlot, held: boolean): void {
    this.audio.unlock();
    this.touchLift[slot] = held;
  }

  public handleKeyDown(key: string): void {
    this.audio.unlock();
    const norm = key.length === 1 ? key.toLowerCase() : key;
    const wasDown = this.keysDown.has(norm);
    this.keysDown.add(norm);

    if (wasDown) return;

    if (norm === "v") {
      this.cycleCameraMode();
      return;
    }
    if (norm === "m") {
      this.toggleMute();
      return;
    }
    if (norm === "r" && this.game.phase !== "menu") {
      this.game.startMatch();
      return;
    }

    // Advanced mode rod cycling
    if (this.game.controlMode === "advanced") {
      if (norm === "q") this.game.cycleActiveRod("blue", -1);
      if (norm === "e") this.game.cycleActiveRod("blue", 1);
      if (norm === "," || norm === "[") this.game.cycleActiveRod("red", -1);
      if (norm === "." || norm === "]") this.game.cycleActiveRod("red", 1);
    }
  }

  public handleKeyUp(key: string): void {
    const norm = key.length === 1 ? key.toLowerCase() : key;
    this.keysDown.delete(norm);
  }

  private syncInputs(): void {
    const k = this.keysDown;
    const mode = this.game.mode;

    if (mode === "1p" || mode === "practice") {
      let slide = 0;
      if (k.has("w") || k.has("ArrowUp")) slide -= 1;
      if (k.has("s") || k.has("ArrowDown")) slide += 1;
      if (Math.abs(this.touchSlide.p1) > 0.01) slide = this.touchSlide.p1;

      const kickHeld = k.has(" ") || k.has("d") || k.has("ArrowRight") || this.touchKick.p1;
      const liftHeld = k.has("a") || k.has("ArrowLeft") || this.touchLift.p1;
      this.game.setPlayerInput("p1", { slide, kickHeld, liftHeld });
      this.game.setPlayerInput("p2", { slide: 0, kickHeld: false, liftHeld: false });
      return;
    }

    if (mode === "2p_coop") {
      let p1Slide = 0;
      if (k.has("w")) p1Slide -= 1;
      if (k.has("s")) p1Slide += 1;
      if (Math.abs(this.touchSlide.p1) > 0.01) p1Slide = this.touchSlide.p1;

      let p2Slide = 0;
      if (k.has("ArrowUp")) p2Slide -= 1;
      if (k.has("ArrowDown")) p2Slide += 1;
      if (Math.abs(this.touchSlide.p2) > 0.01) p2Slide = this.touchSlide.p2;

      this.game.setPlayerInput("p1", {
        slide: p1Slide,
        kickHeld: k.has("d") || k.has(" ") || this.touchKick.p1,
        liftHeld: k.has("a") || this.touchLift.p1
      });
      this.game.setPlayerInput("p2", {
        slide: p2Slide,
        kickHeld: k.has("ArrowRight") || k.has("Enter") || this.touchKick.p2,
        liftHeld: k.has("ArrowLeft") || this.touchLift.p2
      });
      return;
    }

    // 2p_pvp: P1 (Blue, left -> shoots right with D) vs P2 (Red, right -> shoots left with ArrowLeft)
    let p1Slide = 0;
    if (k.has("w")) p1Slide -= 1;
    if (k.has("s")) p1Slide += 1;
    if (Math.abs(this.touchSlide.p1) > 0.01) p1Slide = this.touchSlide.p1;

    let p2Slide = 0;
    if (k.has("ArrowUp")) p2Slide -= 1;
    if (k.has("ArrowDown")) p2Slide += 1;
    if (Math.abs(this.touchSlide.p2) > 0.01) p2Slide = this.touchSlide.p2;

    this.game.setPlayerInput("p1", {
      slide: p1Slide,
      kickHeld: k.has("d") || this.touchKick.p1,
      liftHeld: k.has("a") || this.touchLift.p1
    });
    this.game.setPlayerInput("p2", {
      slide: p2Slide,
      kickHeld: k.has("ArrowLeft") || k.has("Enter") || this.touchKick.p2,
      liftHeld: k.has("ArrowRight") || this.touchLift.p2
    });
  }

  public tick(seconds: number): void {
    const fixedStep = 1 / 60;
    const clamped = Math.max(0, Math.min(0.1, seconds));
    this.pendingRenderDt += clamped;
    this.accumulator += clamped;

    while (this.accumulator >= fixedStep * 0.5) {
      this.syncInputs();
      this.game.step(fixedStep);
      this.accumulator -= fixedStep;
      if (this.accumulator < fixedStep * 0.5) {
        this.accumulator = 0;
        break;
      }
    }
  }

  public render(): void {
    const dt = this.pendingRenderDt;
    this.pendingRenderDt = 0;
    this.scene3d.render(this.game, dt, this.cameraMode);
  }

  public resize(): void {
    this.scene3d.resize();
  }

  public computeCameraPose(): CameraPose {
    return this.scene3d.computeCameraPose(this.game, this.cameraMode);
  }

  public sceneStats(): SceneStats {
    return this.scene3d.stats(this.cameraMode);
  }

  public uiState(): FoosballUiSnapshot {
    return {
      phase: this.game.phase,
      mode: this.game.mode,
      aiLevel: this.game.aiLevel,
      targetScore: this.game.targetScore,
      controlMode: this.game.controlMode,
      strictSpinNotice: this.game.strictSpinNotice,
      p1OnDefense: this.game.p1OnDefense,
      theme: this.game.theme,
      cameraMode: this.cameraMode,
      scoreBlue: this.game.score.blue,
      scoreRed: this.game.score.red,
      winner: this.game.winner,
      lastScorer: this.game.lastScorer,
      activeBlueRod: this.game.activeRodRole.blue,
      activeRedRod: this.game.activeRodRole.red,
      deadBallProgress: Math.min(1, this.game.deadBallTimer / DEAD_BALL_TIMEOUT),
      spinNoticeTeam: this.game.spinNoticeTeam,
      practiceHits: this.game.practiceHits,
      practiceStreak: this.game.practiceStreak,
      practiceBestStreak: this.game.practiceBestStreak,
      muted: this.audio.muted,
      webglAvailable: this.scene3d.webglAvailable
    };
  }
}

export function mountFoosballBrowser(): FoosballApp | null {
  if (typeof document === "undefined") return null;
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) return null;

  let storage: StorageLike | null = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }

  const app = new FoosballApp(canvas, { storage });
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));

  // DOM bindings
  const el = (id: string) => document.getElementById(id);
  const menuOverlay = el("menu-overlay");
  const gameoverOverlay = el("gameover-overlay");
  const bannerEl = el("status-banner");
  const blueScoreEl = el("score-blue");
  const redScoreEl = el("score-red");
  const blueNameEl = el("name-blue");
  const redNameEl = el("name-red");
  const practiceHudEl = el("practice-hud");
  const touchDockEl = el("touch-dock");
  const p2TouchGroupEl = el("touch-p2");
  const p1TouchTitleEl = el("touch-p1-title");
  const p2TouchTitleEl = el("touch-p2-title");
  const controlsLegendEl = el("controls-legend");
  const camBtn = el("btn-camera");
  const muteBtn = el("btn-mute");
  const ctrlModeBtn = el("btn-ctrl-mode");
  const swapBtn = el("btn-swap-coop");
  const themeBtn = el("btn-theme");
  const winnerTitleEl = el("winner-title");
  const winnerSubEl = el("winner-sub");

  let selectedMode: GameMode = "1p";
  let selectedAi: AiLevel = app.game.aiLevel;
  let selectedScore: 5 | 7 | 10 = app.game.targetScore;
  let selectedControl: ControlMode = "sync";
  let selectedStrictSpin = false;

  const updateMenuButtons = (): void => {
    document.querySelectorAll<HTMLElement>("[data-mode]").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.mode === selectedMode);
    });
    document.querySelectorAll<HTMLElement>("[data-ai]").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.ai === selectedAi);
    });
    document.querySelectorAll<HTMLElement>("[data-score]").forEach((btn) => {
      btn.classList.toggle("selected", Number(btn.dataset.score) === selectedScore);
    });
    document.querySelectorAll<HTMLElement>("[data-ctrl]").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.ctrl === selectedControl);
    });
    const aiRow = el("menu-ai-row");
    const scoreRow = el("menu-score-row");
    if (aiRow) aiRow.style.display = selectedMode === "1p" || selectedMode === "2p_coop" ? "flex" : "none";
    if (scoreRow) scoreRow.style.display = selectedMode === "practice" ? "none" : "flex";
    const spinCheckbox = el("opt-strict-spin") as HTMLInputElement | null;
    if (spinCheckbox) spinCheckbox.checked = selectedStrictSpin;
  };

  document.querySelectorAll<HTMLElement>("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMode = btn.dataset.mode as GameMode;
      updateMenuButtons();
    });
  });
  document.querySelectorAll<HTMLElement>("[data-ai]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedAi = btn.dataset.ai as AiLevel;
      updateMenuButtons();
    });
  });
  document.querySelectorAll<HTMLElement>("[data-score]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedScore = Number(btn.dataset.score) as 5 | 7 | 10;
      updateMenuButtons();
    });
  });
  document.querySelectorAll<HTMLElement>("[data-ctrl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedControl = btn.dataset.ctrl as ControlMode;
      updateMenuButtons();
    });
  });
  const spinCheckbox = el("opt-strict-spin") as HTMLInputElement | null;
  if (spinCheckbox) {
    spinCheckbox.addEventListener("change", () => {
      selectedStrictSpin = spinCheckbox.checked;
    });
  }

  const beginConfiguredMatch = (): void => {
    if (isTouchDevice && (selectedMode === "2p_pvp" || selectedMode === "2p_coop")) {
      app.setCameraMode("top");
    }
    app.startMatch({
      mode: selectedMode,
      aiLevel: selectedAi,
      targetScore: selectedScore,
      controlMode: selectedControl,
      strictSpinNotice: selectedStrictSpin
    });
  };

  el("btn-start-match")?.addEventListener("click", beginConfiguredMatch);
  el("btn-rematch")?.addEventListener("click", () => app.game.startMatch());
  el("btn-menu-from-over")?.addEventListener("click", () => app.returnToMenu());
  el("btn-menu")?.addEventListener("click", () => app.returnToMenu());
  el("btn-restart")?.addEventListener("click", () => {
    if (app.game.phase !== "menu") app.game.startMatch();
  });
  camBtn?.addEventListener("click", () => app.cycleCameraMode());
  muteBtn?.addEventListener("click", () => app.toggleMute());
  themeBtn?.addEventListener("click", () => app.cycleTheme());
  ctrlModeBtn?.addEventListener("click", () => app.toggleControlMode());
  swapBtn?.addEventListener("click", () => app.toggleCoopSwap());

  // Multi-touch independent sliders & buttons
  const bindTouchSlider = (sliderId: string, slot: PlayerSlot): void => {
    const track = el(sliderId);
    if (!track) return;
    let activePointerId: number | null = null;
    const knob = track.querySelector<HTMLElement>(".slider-knob");

    const updateFromClientY = (clientY: number): void => {
      const rect = track.getBoundingClientRect();
      const norm = ((clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      const clamped = Math.max(-1, Math.min(1, norm));
      app.setTouchSlide(slot, clamped);
      if (knob) {
        knob.style.top = `${(clamped * 0.5 + 0.5) * 100}%`;
      }
    };

    const release = (): void => {
      activePointerId = null;
      app.setTouchSlide(slot, 0);
      if (knob) knob.style.top = "50%";
    };

    track.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      activePointerId = e.pointerId;
      track.setPointerCapture(e.pointerId);
      updateFromClientY(e.clientY);
    });
    track.addEventListener("pointermove", (e) => {
      if (e.pointerId !== activePointerId) return;
      e.preventDefault();
      updateFromClientY(e.clientY);
    });
    track.addEventListener("pointerup", (e) => {
      if (e.pointerId === activePointerId) release();
    });
    track.addEventListener("pointercancel", (e) => {
      if (e.pointerId === activePointerId) release();
    });
  };

  const bindHoldButton = (btnId: string, onState: (down: boolean) => void): void => {
    const btn = el(btnId);
    if (!btn) return;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add("pressed");
      onState(true);
    });
    const up = (): void => {
      btn.classList.remove("pressed");
      onState(false);
    };
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("lostpointercapture", up);
  };

  bindTouchSlider("slider-p1", "p1");
  bindTouchSlider("slider-p2", "p2");
  bindHoldButton("touch-p1-kick", (d) => app.setTouchKick("p1", d));
  bindHoldButton("touch-p1-lift", (d) => app.setTouchLift("p1", d));
  bindHoldButton("touch-p2-kick", (d) => app.setTouchKick("p2", d));
  bindHoldButton("touch-p2-lift", (d) => app.setTouchLift("p2", d));

  // Keyboard listeners
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    app.handleKeyDown(e.key);
  });
  window.addEventListener("keyup", (e) => {
    app.handleKeyUp(e.key);
  });
  window.addEventListener("resize", () => app.resize());

  const syncDom = (): void => {
    const ui = app.uiState();
    const pal = TEAM_PALETTES[ui.theme];

    if (menuOverlay) menuOverlay.style.display = ui.phase === "menu" ? "flex" : "none";
    if (gameoverOverlay) gameoverOverlay.style.display = ui.phase === "gameover" ? "flex" : "none";
    if (blueScoreEl) blueScoreEl.textContent = String(ui.scoreBlue);
    if (redScoreEl) redScoreEl.textContent = ui.mode === "practice" ? String(ui.practiceHits) : String(ui.scoreRed);
    if (blueNameEl) blueNameEl.textContent = ui.mode === "practice" ? "GOALS" : pal.blueName;
    if (redNameEl) {
      redNameEl.textContent =
        ui.mode === "practice"
          ? "TARGETS"
          : ui.mode === "2p_pvp"
            ? pal.redName
            : `AI (${AI_PRESETS[ui.aiLevel].label.toUpperCase()})`;
    }

    if (practiceHudEl) {
      practiceHudEl.style.display = ui.mode === "practice" && ui.phase !== "menu" ? "block" : "none";
      practiceHudEl.textContent = `Target Hits: ${ui.practiceHits}  |  Streak: ${ui.practiceStreak}  |  Best: ${ui.practiceBestStreak}`;
    }

    if (bannerEl) {
      if (ui.phase === "menu") {
        bannerEl.textContent = "Choose a mode and kick off!";
      } else if (ui.phase === "serving") {
        bannerEl.textContent = "Ball dropping from serve hole...";
      } else if (ui.phase === "goal") {
        if (ui.mode === "practice") {
          bannerEl.textContent = ui.practiceStreak > 0 ? `BULLSEYE! Streak x${ui.practiceStreak}` : "GOAL! Aim for the glowing target!";
        } else {
          const teamLabel = ui.lastScorer === "blue" ? pal.blueName : pal.redName;
          bannerEl.textContent = `GOAL! ${teamLabel} scores!`;
        }
      } else if (ui.phase === "gameover") {
        const winLabel = ui.winner === "blue" ? pal.blueName : pal.redName;
        bannerEl.textContent = `${winLabel} wins ${ui.scoreBlue} - ${ui.scoreRed}!`;
      } else if (ui.deadBallProgress > 0.35) {
        const remain = Math.max(0.1, (1 - ui.deadBallProgress) * DEAD_BALL_TIMEOUT).toFixed(1);
        bannerEl.textContent = `Dead ball detected - re-serving in ${remain}s...`;
      } else if (ui.spinNoticeTeam) {
        bannerEl.textContent = "No spinning! Use crisp flicks or charged shots.";
      } else if (ui.mode === "2p_coop") {
        const p1Role = ui.p1OnDefense ? "DEF (GK+2)" : "OFF (5+3)";
        const p2Role = ui.p1OnDefense ? "OFF (5+3)" : "DEF (GK+2)";
        bannerEl.textContent = `2P Co-op vs ${AI_PRESETS[ui.aiLevel].label} | P1: ${p1Role} | P2: ${p2Role}`;
      } else if (ui.mode === "practice") {
        bannerEl.textContent = "Free Practice - Hold Kick to charge power shots, Slide + Kick for pull shots!";
      } else if (ui.controlMode === "advanced") {
        bannerEl.textContent = `Advanced Rods | ${pal.blueName}: ${ui.activeBlueRod.toUpperCase()}${ui.mode === "2p_pvp" ? ` | ${pal.redName}: ${ui.activeRedRod.toUpperCase()}` : ""}`;
      } else {
        bannerEl.textContent = `First to ${ui.targetScore} | Hold Kick = Power Shot | Lift = Pass Through`;
      }
    }

    if (winnerTitleEl && winnerSubEl && ui.phase === "gameover") {
      const winLabel = ui.winner === "blue" ? pal.blueName : pal.redName;
      winnerTitleEl.textContent = `${winLabel} WINS!`;
      winnerSubEl.textContent = `Final Score: ${ui.scoreBlue} - ${ui.scoreRed}`;
    }

    if (camBtn) camBtn.textContent = `Cam: ${ui.cameraMode.toUpperCase()}`;
    if (muteBtn) muteBtn.textContent = ui.muted ? "Sound: OFF" : "Sound: ON";
    if (themeBtn) themeBtn.textContent = `Colors: ${pal.blueName}/${pal.redName}`;
    if (ctrlModeBtn) {
      ctrlModeBtn.style.display = ui.mode === "2p_coop" ? "none" : "inline-flex";
      ctrlModeBtn.textContent = ui.controlMode === "sync" ? "Rods: Sync" : "Rods: Single";
    }
    if (swapBtn) {
      swapBtn.style.display = ui.mode === "2p_coop" ? "inline-flex" : "none";
      swapBtn.textContent = ui.p1OnDefense ? "Swap (P1 Def)" : "Swap (P1 Off)";
    }

    const needTwoPlayers = ui.mode === "2p_pvp" || ui.mode === "2p_coop";
    if (p2TouchGroupEl) p2TouchGroupEl.style.display = needTwoPlayers ? "flex" : "none";
    if (touchDockEl) touchDockEl.style.display = ui.phase === "menu" ? "none" : "flex";
    if (p1TouchTitleEl) {
      p1TouchTitleEl.textContent =
        ui.mode === "2p_coop" ? (ui.p1OnDefense ? "P1 DEF" : "P1 OFF") : `P1 ${pal.blueName}`;
    }
    if (p2TouchTitleEl) {
      p2TouchTitleEl.textContent =
        ui.mode === "2p_coop" ? (ui.p1OnDefense ? "P2 OFF" : "P2 DEF") : `P2 ${pal.redName}`;
    }

    if (controlsLegendEl) {
      if (ui.mode === "2p_coop") {
        controlsLegendEl.textContent =
          "P1: W/S slide, D kick/charge, A lift  |  P2: Up/Down slide, Right/Enter kick/charge, Left lift  |  V camera  M mute";
      } else if (ui.mode === "2p_pvp") {
        controlsLegendEl.textContent =
          "P1 (Left): W/S slide, D shoot, A lift (Q/E rod)  |  P2 (Right): Up/Down slide, Left shoot, Right lift (,/. rod)";
      } else {
        controlsLegendEl.textContent =
          "W/S or Up/Down: Slide  |  Space / D / Right: Tap Kick or Hold Power Shot  |  A / Left: Lift Rods  |  Q/E: Rod (Single mode)  |  V: Cam";
      }
    }
  };

  updateMenuButtons();
  syncDom();

  let lastTs = performance.now();
  const loop = (ts: number): void => {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    app.tick(dt);
    app.render();
    syncDom();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return app;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      mountFoosballBrowser();
    });
  } else {
    mountFoosballBrowser();
  }
}

export {
  AI_LEVEL_ORDER,
  AI_PRESETS,
  BALL_RADIUS,
  FIELD_LENGTH,
  FIELD_WIDTH,
  FoosballAudio,
  FoosballGame,
  FoosballScene3D,
  GOAL_DEPTH,
  GOAL_WIDTH,
  LIFT_ANGLE,
  LIFT_CLEARANCE_ANGLE,
  ROD_CONFIGS,
  TEAM_PALETTES,
  THEME_ORDER
};
