import { ImageBank, SoundBank } from "./assets";
import { FlappyGame } from "./game";
import { Bird, GroundBase, makeRng, Pipe } from "./sprites";
import {
  BASE_Y,
  BIRD_COLORS,
  BIRD_HEIGHT,
  BIRD_WIDTH,
  CanvasContextLike,
  CanvasLike,
  DIGIT_HEIGHT,
  DIGIT_WIDTHS,
  DROPPING_SPEED,
  FLAPPING_SPEED,
  FLYING_SPEED,
  GAMEOVER_HEIGHT,
  GAMEOVER_WIDTH,
  MESSAGE_HEIGHT,
  MESSAGE_WIDTH,
  PIPE_GAP_SIZE,
  PIPE_HEIGHT,
  PIPE_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  StorageLike,
  UiSnapshot
} from "./types";

export interface FlappyAppOptions {
  seed?: number;
  storage?: StorageLike | null;
}

export class FlappyWebApp {
  public readonly canvas: CanvasLike;
  public readonly ctx: CanvasContextLike;
  public readonly sound: SoundBank;
  public readonly images: ImageBank;
  public readonly game: FlappyGame;
  private accumulator = 0;

  constructor(canvas: CanvasLike, options: FlappyAppOptions = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D canvas context is required");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.sound = new SoundBank();
    this.images = new ImageBank();
    this.game = new FlappyGame({
      seed: options.seed,
      storage: options.storage ?? null,
      onSound: this.sound.play
    });
  }

  public tick(seconds: number): void {
    const fixedStep = 1 / 60;
    this.accumulator += Math.max(0, Math.min(0.1, seconds));
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

  public uiState(): UiSnapshot {
    return {
      phase: this.game.phase,
      mode: this.game.mode,
      score: Math.floor(this.game.score),
      bestScore: this.game.bestScore,
      ai1: this.game.bird1.autoFlap,
      ai2: Boolean(this.game.bird2 && this.game.bird2.autoFlap),
      muted: this.sound.muted
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
    if (action === "toggle_sound") {
      this.sound.toggle();
      return;
    }
    if (action === "restart") {
      this.game.startGame(this.game.mode);
    }
  }

  public handlePointerDown(pt: [number, number]): void {
    if (this.game.phase === "start") {
      this.game.startGame(pt[0] >= SCREEN_WIDTH / 2 ? "2p" : "1p");
      return;
    }
    if (this.game.phase === "gameover") {
      this.game.startGame(this.game.mode);
      return;
    }
    if (this.game.mode === "2p" && pt[0] >= SCREEN_WIDTH / 2) {
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

  private drawBackground(): void {
    const ctx = this.ctx;
    const bg = this.images.background(this.game.theme.background);
    if (bg && ctx.drawImage) {
      ctx.drawImage(bg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      return;
    }
    ctx.fillStyle = this.game.theme.background === "day" ? "#4ec0ca" : "#0e2236";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  private drawPipe(pipe: Pipe): void {
    const ctx = this.ctx;
    const img = this.images.pipe(this.game.theme.pipe);
    if (img && ctx.drawImage) {
      if (pipe.top && ctx.save && ctx.translate && ctx.rotate && ctx.restore) {
        ctx.save();
        ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
        ctx.restore();
      } else {
        ctx.drawImage(img, pipe.x, pipe.y, pipe.width, pipe.height);
      }
      return;
    }
    ctx.fillStyle = this.game.theme.pipe === "green" ? "#73bf2e" : "#d95b43";
    ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
  }

  private drawGround(): void {
    const ctx = this.ctx;
    const g = this.game.ground;
    const img = this.images.getReady("base");
    if (img && ctx.drawImage) {
      ctx.drawImage(img, g.x, g.y, g.width, g.height);
      return;
    }
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, g.y, SCREEN_WIDTH, SCREEN_HEIGHT - g.y);
  }

  private drawBird(bird: Bird): void {
    const ctx = this.ctx;
    const img = this.images.bird(bird.color, bird.currentFlapFrame());
    if (img && ctx.drawImage) {
      ctx.drawImage(img, bird.x, bird.y, bird.width, bird.height);
      return;
    }
    ctx.fillStyle =
      bird.color === "red" ? "#f96d55" : bird.color === "blue" ? "#60bef7" : "#ffcf6b";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
  }

  private drawScore(): void {
    const ctx = this.ctx;
    const digits = String(Math.floor(this.game.score)).split("");
    let totalWidth = 0;
    for (const d of digits) {
      totalWidth += DIGIT_WIDTHS[d] ?? 24;
    }
    let offset = (SCREEN_WIDTH - totalWidth) / 2;
    const y = SCREEN_HEIGHT * 0.1;

    for (const d of digits) {
      const w = DIGIT_WIDTHS[d] ?? 24;
      const img = this.images.digit(d);
      if (img && ctx.drawImage) {
        ctx.drawImage(img, offset, y, w, DIGIT_HEIGHT);
      } else {
        ctx.font = "700 30px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(d, offset, y);
      }
      offset += w;
    }
  }

  public draw(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    this.drawBackground();

    if (this.game.phase === "start") {
      const msg = this.images.getReady("message");
      const mx = (SCREEN_WIDTH - MESSAGE_WIDTH) / 2;
      const my = SCREEN_HEIGHT * 0.12;
      if (msg && ctx.drawImage) {
        ctx.drawImage(msg, mx, my, MESSAGE_WIDTH, MESSAGE_HEIGHT);
      } else {
        ctx.font = "700 22px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("FLAPPY BIRD", SCREEN_WIDTH / 2, my + 20);
      }
      this.drawGround();
      this.drawBird(this.game.bird1);
      if (this.game.bird2) {
        this.drawBird(this.game.bird2);
      }
      return;
    }

    for (const pipe of this.game.pipes) {
      this.drawPipe(pipe);
    }
    this.drawGround();
    this.drawScore();
    this.drawBird(this.game.bird1);
    if (this.game.bird2) {
      this.drawBird(this.game.bird2);
    }

    if (this.game.phase === "gameover") {
      const go = this.images.getReady("gameover");
      const gx = (SCREEN_WIDTH - GAMEOVER_WIDTH) / 2;
      const gy = SCREEN_HEIGHT * 0.36;
      if (go && ctx.drawImage) {
        ctx.drawImage(go, gx, gy, GAMEOVER_WIDTH, GAMEOVER_HEIGHT);
      } else {
        ctx.font = "700 24px sans-serif";
        ctx.fillStyle = "#f98f79";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("GAME OVER", SCREEN_WIDTH / 2, gy);
      }
    }
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
  const app = new FlappyWebApp(canvasEl as unknown as CanvasLike, {
    storage: window.localStorage
  });
  (window as unknown as { flappyApp?: FlappyWebApp }).flappyApp = app;

  const badgeEl = document.getElementById("status-badge");
  const scoreEl = document.getElementById("score-readout");
  const btn1p = document.getElementById("btn-1p");
  const btn2p = document.getElementById("btn-2p");
  const btnAi1 = document.getElementById("btn-ai1");
  const btnAi2 = document.getElementById("btn-ai2");
  const btnSound = document.getElementById("btn-sound");
  const btnRestart = document.getElementById("btn-restart");
  let lastKey = "";

  const syncDom = (): void => {
    const st = app.uiState();
    const key = JSON.stringify(st);
    if (key === lastKey) {
      return;
    }
    lastKey = key;
    if (badgeEl) {
      badgeEl.textContent =
        st.phase === "start"
          ? "Tap screen or choose 1P / 2P"
          : st.phase === "gameover"
            ? "Game Over - Tap or Space to restart"
            : st.mode === "2p"
              ? "2P Active (Left: Bird 1 | Right: Bird 2)"
              : "1P Active - Tap anywhere to flap";
    }
    if (scoreEl) {
      scoreEl.textContent = "Score: " + st.score + " | Best: " + st.bestScore;
    }
    if (btn1p) {
      btn1p.textContent = st.phase === "playing" ? "Flap P1" : "1P Start";
    }
    if (btn2p) {
      btn2p.textContent = st.phase === "playing" && st.mode === "2p" ? "Flap P2" : "2P Start";
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
    const x = ((evt.clientX - rect.left) * SCREEN_WIDTH) / rect.width;
    const y = ((evt.clientY - rect.top) * SCREEN_HEIGHT) / rect.height;
    app.handlePointerDown([x, y]);
    syncDom();
  });

  window.addEventListener("keydown", (evt: KeyboardEvent) => {
    if (app.handleKeyDown(evt.key)) {
      evt.preventDefault();
      syncDom();
    }
  });

  let lastTime = performance.now();
  const frame = (now: number): void => {
    const dt = (now - lastTime) / 1000.0;
    lastTime = now;
    app.tick(dt);
    app.draw();
    syncDom();
    window.requestAnimationFrame(frame);
  };
  app.draw();
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
  PIPE_GAP_SIZE,
  DROPPING_SPEED,
  FLAPPING_SPEED,
  FLYING_SPEED,
  BIRD_WIDTH,
  BIRD_HEIGHT,
  PIPE_WIDTH,
  PIPE_HEIGHT,
  BIRD_COLORS,
  makeRng,
  Bird,
  Pipe,
  GroundBase,
  FlappyGame
};
