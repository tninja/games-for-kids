import { SoundBank } from "./assets";
import { FlappyGame } from "./game";
import { CameraMode, CameraPose, FlappyScene3D, SceneStats, worldX, worldY } from "./scene3d";
import { Bird, GroundBase, makeRng, Pipe } from "./sprites";
import {
  BASE_Y,
  FLAPPING_SPEED,
  GamePhase,
  PlayerMode,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  StorageLike
} from "./types";

export interface Flappy3DAppOptions {
  seed?: number;
  storage?: StorageLike | null;
  headless?: boolean;
  cameraMode?: CameraMode;
}

export interface Ui3DSnapshot {
  phase: GamePhase;
  mode: PlayerMode;
  score: number;
  bestScore: number;
  ai1: boolean;
  ai2: boolean;
  muted: boolean;
  cameraMode: CameraMode;
  webglAvailable: boolean;
}

export class Flappy3DApp {
  public readonly canvas: { clientWidth?: number; clientHeight?: number };
  public readonly sound: SoundBank;
  public readonly game: FlappyGame;
  public readonly scene3d: FlappyScene3D;
  public cameraMode: CameraMode;
  private accumulator = 0;
  private pendingRenderDt = 0;

  constructor(
    canvas: { clientWidth?: number; clientHeight?: number },
    options: Flappy3DAppOptions = {}
  ) {
    this.canvas = canvas;
    this.sound = new SoundBank("../flappybird/resources/audios");
    this.game = new FlappyGame({
      seed: options.seed,
      storage: options.storage ?? null,
      onSound: this.sound.play
    });
    this.cameraMode = options.cameraMode ?? "chase";
    const domCanvas =
      typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement
        ? canvas
        : null;
    this.scene3d = new FlappyScene3D(domCanvas, Boolean(options.headless));
  }

  public toggleCameraMode(): CameraMode {
    this.cameraMode = this.cameraMode === "chase" ? "side" : "chase";
    return this.cameraMode;
  }

  public computeCameraPose(): CameraPose {
    return this.scene3d.computeCameraPose(this.game, this.cameraMode);
  }

  public tick(seconds: number): void {
    const fixedStep = 1 / 60;
    const clamped = Math.max(0, Math.min(0.1, seconds));
    this.pendingRenderDt += clamped;
    this.accumulator += clamped;
    while (this.accumulator >= fixedStep * 0.5) {
      const stepDt = Math.min(fixedStep, this.accumulator);
      this.game.step(fixedStep);
      this.accumulator -= stepDt;
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

  public sceneStats(): SceneStats {
    return this.scene3d.stats(this.cameraMode, this.game);
  }

  public uiState(): Ui3DSnapshot {
    return {
      phase: this.game.phase,
      mode: this.game.mode,
      score: Math.floor(this.game.score),
      bestScore: this.game.bestScore,
      ai1: this.game.bird1.autoFlap,
      ai2: Boolean(this.game.bird2 && this.game.bird2.autoFlap),
      muted: this.sound.muted,
      cameraMode: this.cameraMode,
      webglAvailable: this.scene3d.webglAvailable
    };
  }

  public activate(action: string): void {
    if (action === "start_1p") {
      this.game.startGame("1p");
      return;
    }
    if (action === "start_2p") {
      this.game.startGame("2p");
      return;
    }
    if (action === "flap_1") {
      if (this.game.phase !== "playing") {
        this.game.startGame("1p");
      } else {
        this.game.flap(1);
      }
      return;
    }
    if (action === "flap_2") {
      if (this.game.phase !== "playing") {
        this.game.startGame("2p");
      } else {
        this.game.flap(2);
      }
      return;
    }
    if (action === "toggle_ai1") {
      this.game.toggleAutoFlap(1);
      return;
    }
    if (action === "toggle_ai2") {
      this.game.toggleAutoFlap(2);
      return;
    }
    if (action === "toggle_view") {
      this.toggleCameraMode();
      return;
    }
    if (action === "toggle_sound") {
      this.sound.toggle();
      return;
    }
    if (action === "restart") {
      this.game.startGame(this.game.mode);
    }
  }

  public handlePointerDown(localX: number, viewWidth: number): void {
    const w = Math.max(1, viewWidth);
    if (this.game.phase === "start") {
      this.game.startGame(localX >= w / 2 ? "2p" : "1p");
      return;
    }
    if (this.game.phase === "gameover") {
      this.game.startGame(this.game.mode);
      return;
    }
    if (this.game.mode === "2p" && localX >= w / 2) {
      this.game.flap(2);
    } else {
      this.game.flap(1);
    }
  }

  public handleKeyDown(key: string): boolean {
    if (key === " ") {
      if (this.game.phase === "playing") {
        this.game.flap(1);
      } else {
        this.game.startGame(this.game.phase === "gameover" ? this.game.mode : "1p");
      }
      return true;
    }
    if (key === "Shift") {
      if (this.game.phase === "playing") {
        this.game.flap(2);
      } else {
        this.game.startGame("2p");
      }
      return true;
    }
    if (key === "ArrowUp" || key === "w" || key === "W") {
      if (this.game.phase === "playing") {
        this.game.flap(1);
      } else {
        this.game.startGame("1p");
      }
      return true;
    }
    if (key === "1") {
      this.game.toggleAutoFlap(1);
      return true;
    }
    if (key === "2") {
      this.game.toggleAutoFlap(2);
      return true;
    }
    if (key === "v" || key === "V") {
      this.toggleCameraMode();
      return true;
    }
    if (key === "m" || key === "M") {
      this.sound.toggle();
      return true;
    }
    if (key === "r" || key === "R") {
      this.game.startGame(this.game.mode);
      return true;
    }
    return false;
  }
}

function bootBrowser(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const canvasEl = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvasEl) {
    return;
  }
  const app = new Flappy3DApp(canvasEl, { storage: window.localStorage });
  (window as unknown as { flappy3dApp?: Flappy3DApp }).flappy3dApp = app;

  const badgeEl = document.getElementById("status-badge");
  const scoreEl = document.getElementById("score-readout");
  const bigScoreEl = document.getElementById("hud-big-score");
  const btn1p = document.getElementById("btn-1p");
  const btn2p = document.getElementById("btn-2p");
  const btnView = document.getElementById("btn-view");
  const btnAi1 = document.getElementById("btn-ai1");
  const btnAi2 = document.getElementById("btn-ai2");
  const btnSound = document.getElementById("btn-sound");
  const btnRestart = document.getElementById("btn-restart");
  let lastKey = "";

  const syncSize = (): void => {
    const rect = canvasEl.getBoundingClientRect();
    app.scene3d.resize(Math.max(288, Math.round(rect.width)), Math.max(420, Math.round(rect.height)));
  };

  const syncDom = (): void => {
    const st = app.uiState();
    const key = JSON.stringify(st);
    if (key === lastKey) {
      return;
    }
    lastKey = key;
    if (badgeEl) {
      badgeEl.textContent = !st.webglAvailable
        ? "WebGL unavailable in this browser context"
        : st.phase === "start"
          ? "3D Ready - Tap screen or choose 1P / 2P"
          : st.phase === "gameover"
            ? "Game Over! Tap or Space to fly again"
            : st.mode === "2p"
              ? "2P 3D Flight (Left: Bird 1 | Right: Bird 2)"
              : "3D Flight - Tap anywhere to flap";
    }
    if (scoreEl) {
      scoreEl.textContent = "Score: " + st.score + " | Best: " + st.bestScore;
    }
    if (bigScoreEl) {
      bigScoreEl.textContent = st.phase === "start" ? "FLAPPY 3D" : String(st.score);
    }
    if (btn1p) {
      btn1p.textContent = st.phase === "playing" ? "Flap P1" : "1P Start";
    }
    if (btn2p) {
      btn2p.textContent = st.phase === "playing" && st.mode === "2p" ? "Flap P2" : "2P Start";
    }
    if (btnView) {
      btnView.textContent = st.cameraMode === "chase" ? "View: 3D Chase" : "View: 2.5D Side";
    }
    if (btnAi1) {
      btnAi1.textContent = "AI 1: " + (st.ai1 ? "ON" : "OFF");
      btnAi1.className = "ctrl-btn" + (st.ai1 ? " active" : "");
    }
    if (btnAi2) {
      btnAi2.textContent = "AI 2: " + (st.ai2 ? "ON" : "OFF");
      btnAi2.className = "ctrl-btn" + (st.ai2 ? " active" : "");
    }
    if (btnSound) {
      btnSound.textContent = st.muted ? "Sound: OFF" : "Sound: ON";
    }
  };

  btn1p?.addEventListener("click", () => {
    app.activate("flap_1");
    syncDom();
  });
  btn2p?.addEventListener("click", () => {
    app.activate("flap_2");
    syncDom();
  });
  btnView?.addEventListener("click", () => {
    app.activate("toggle_view");
    syncDom();
  });
  btnAi1?.addEventListener("click", () => {
    app.activate("toggle_ai1");
    syncDom();
  });
  btnAi2?.addEventListener("click", () => {
    app.activate("toggle_ai2");
    syncDom();
  });
  btnSound?.addEventListener("click", () => {
    app.activate("toggle_sound");
    syncDom();
  });
  btnRestart?.addEventListener("click", () => {
    app.activate("restart");
    syncDom();
  });

  canvasEl.addEventListener("pointerdown", (evt: PointerEvent) => {
    evt.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    app.handlePointerDown(evt.clientX - rect.left, rect.width);
    syncDom();
  });

  window.addEventListener("keydown", (evt: KeyboardEvent) => {
    if (app.handleKeyDown(evt.key)) {
      evt.preventDefault();
      syncDom();
    }
  });

  window.addEventListener("resize", syncSize);
  syncSize();

  let lastTime = performance.now();
  const frame = (now: number): void => {
    const dt = (now - lastTime) / 1000.0;
    lastTime = now;
    app.tick(dt);
    app.render();
    syncDom();
    window.requestAnimationFrame(frame);
  };
  app.render();
  syncDom();
  window.requestAnimationFrame(frame);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootBrowser);
  } else {
    bootBrowser();
  }
}

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BASE_Y,
  FLAPPING_SPEED,
  worldX,
  worldY,
  makeRng,
  Bird,
  Pipe,
  GroundBase,
  FlappyGame,
  FlappyScene3D
};
