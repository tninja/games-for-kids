(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.FlappyBirdWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
"use strict";
var __FlappyBirdBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // flappybird/ts/app.ts
  var app_exports = {};
  __export(app_exports, {
    BASE_Y: () => BASE_Y,
    BIRD_COLORS: () => BIRD_COLORS,
    BIRD_HEIGHT: () => BIRD_HEIGHT,
    BIRD_WIDTH: () => BIRD_WIDTH,
    Bird: () => Bird,
    DROPPING_SPEED: () => DROPPING_SPEED,
    FLAPPING_SPEED: () => FLAPPING_SPEED,
    FLYING_SPEED: () => FLYING_SPEED,
    FlappyGame: () => FlappyGame,
    FlappyWebApp: () => FlappyWebApp,
    GroundBase: () => GroundBase,
    PIPE_GAP_SIZE: () => PIPE_GAP_SIZE,
    PIPE_HEIGHT: () => PIPE_HEIGHT,
    PIPE_WIDTH: () => PIPE_WIDTH,
    Pipe: () => Pipe,
    SCREEN_HEIGHT: () => SCREEN_HEIGHT,
    SCREEN_WIDTH: () => SCREEN_WIDTH,
    makeRng: () => makeRng
  });

  // flappybird/ts/assets.ts
  var SoundBank = class {
    constructor(basePath = "resources/audios") {
      this.muted = false;
      this.emittedCount = 0;
      this.audios = {};
      this.play = (key) => {
        if (this.muted) {
          return false;
        }
        this.emittedCount += 1;
        const base = this.audios[key];
        if (!base) {
          return true;
        }
        try {
          const node = base.cloneNode(true);
          node.volume = 0.6;
          const p = node.play();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
            });
          }
        } catch {
        }
        return true;
      };
      if (typeof Audio === "undefined") {
        return;
      }
      const keys = ["die", "hit", "point", "swoosh", "wing"];
      for (const key of keys) {
        const audio = new Audio(basePath + "/" + key + ".wav");
        audio.preload = "auto";
        this.audios[key] = audio;
      }
    }
    toggle() {
      this.muted = !this.muted;
      return this.muted;
    }
  };
  var ImageBank = class {
    constructor(basePath = "resources/images") {
      this.images = {};
      if (typeof Image === "undefined") {
        return;
      }
      const names = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "background-day",
        "background-night",
        "base",
        "gameover",
        "message",
        "pipe-green",
        "pipe-red",
        "redbird-upflap",
        "redbird-midflap",
        "redbird-downflap",
        "bluebird-upflap",
        "bluebird-midflap",
        "bluebird-downflap",
        "yellowbird-upflap",
        "yellowbird-midflap",
        "yellowbird-downflap"
      ];
      for (const name of names) {
        const img = new Image();
        img.src = basePath + "/" + name + ".png";
        this.images[name] = img;
      }
    }
    getReady(key) {
      const img = this.images[key];
      if (img && img.complete && img.naturalWidth > 0) {
        return img;
      }
      return null;
    }
    background(kind) {
      return this.getReady("background-" + kind);
    }
    pipe(color) {
      return this.getReady("pipe-" + color);
    }
    bird(color, frame) {
      return this.getReady(color + "bird-" + frame + "flap");
    }
    digit(d) {
      return this.getReady(d);
    }
  };

  // flappybird/ts/types.ts
  var SCREEN_WIDTH = 288;
  var SCREEN_HEIGHT = 512;
  var BASE_Y_RATIO = 0.79;
  var BASE_Y = Math.round(SCREEN_HEIGHT * BASE_Y_RATIO);
  var PIPE_GAP_SIZE = 150;
  var DROPPING_SPEED = 12;
  var FLAPPING_SPEED = 3;
  var FLYING_SPEED = 4;
  var BIRD_WIDTH = 34;
  var BIRD_HEIGHT = 24;
  var PIPE_WIDTH = 52;
  var PIPE_HEIGHT = 320;
  var BASE_WIDTH = 336;
  var MESSAGE_WIDTH = 184;
  var MESSAGE_HEIGHT = 267;
  var GAMEOVER_WIDTH = 192;
  var GAMEOVER_HEIGHT = 42;
  var DIGIT_HEIGHT = 36;
  var DIGIT_WIDTHS = {
    "0": 24,
    "1": 16,
    "2": 24,
    "3": 24,
    "4": 24,
    "5": 24,
    "6": 24,
    "7": 24,
    "8": 24,
    "9": 24
  };
  var BIRD_COLORS = ["red", "blue", "yellow"];
  var FLAP_SEQUENCE = ["up", "mid", "down", "mid"];
  var STORAGE_KEY = "flappybird_best_v1";

  // flappybird/ts/sprites.ts
  function makeRng(seed) {
    let state = (seed >>> 0) + 1831565813;
    return {
      next() {
        state = state + 1831565813 >>> 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      },
      randInt(min, maxInclusive) {
        return min + Math.floor(this.next() * (maxInclusive - min + 1));
      },
      choice(items) {
        return items[Math.floor(this.next() * items.length)];
      }
    };
  }
  var Bird = class {
    constructor(color, xFraction = 0.2, baseHeight = BASE_Y, droppingSpeed = DROPPING_SPEED, flappingSpeed = FLAPPING_SPEED) {
      this.width = BIRD_WIDTH;
      this.height = BIRD_HEIGHT;
      this.speed = 0;
      this.autoFlap = false;
      this.flapFrameIndex = 0;
      this.wingTick = 0;
      this.bobShift = 1;
      this.bobCount = 0;
      this.color = color;
      this.x = SCREEN_WIDTH * xFraction;
      this.y = (SCREEN_HEIGHT - this.height) / 2;
      this.baseHeight = baseHeight;
      this.droppingSpeed = droppingSpeed;
      this.flappingSpeed = flappingSpeed;
    }
    currentFlapFrame() {
      return FLAP_SEQUENCE[this.flapFrameIndex];
    }
    get centerX() {
      return this.x + this.width / 2;
    }
    get bottom() {
      return this.y + this.height;
    }
    flipWingImage() {
      this.wingTick += 1;
      if (this.wingTick >= 5) {
        this.flapFrameIndex = (this.flapFrameIndex + 1) % FLAP_SEQUENCE.length;
        this.wingTick = 0;
      }
    }
    flyInStartInterface(onSound) {
      this.flipWingImage();
      onSound?.("wing");
      this.bobCount += 1;
      if (this.bobCount >= 16) {
        this.bobShift = -this.bobShift;
        this.bobCount = 0;
      }
      this.y += this.bobShift;
    }
    update(dt) {
      this.flipWingImage();
      this.speed -= this.droppingSpeed * dt;
      if (this.y + this.height - this.speed < this.baseHeight) {
        this.y -= this.speed;
      } else {
        this.y = this.baseHeight - this.height;
      }
    }
    isHittingBoundary(ceiling = 0, floor = this.baseHeight) {
      if (this.y + this.height >= Math.floor(floor)) {
        this.speed = 0;
        this.y = floor - this.height;
        return true;
      }
      if (this.y <= Math.ceil(ceiling)) {
        this.speed = 0;
        this.y = ceiling;
        return true;
      }
      return false;
    }
    collidesWithPipe(pipe) {
      const padX = 4;
      const padY = 3;
      const bx1 = this.x + padX;
      const bx2 = this.x + this.width - padX;
      const by1 = this.y + padY;
      const by2 = this.y + this.height - padY;
      const px1 = pipe.x;
      const px2 = pipe.x + pipe.width;
      const py1 = pipe.y;
      const py2 = pipe.y + pipe.height;
      return bx1 < px2 && bx2 > px1 && by1 < py2 && by2 > py1;
    }
    isHittingBoundaryOrPipe(pipes) {
      let dead = this.isHittingBoundary(0, this.baseHeight);
      for (const pipe of pipes) {
        if (this.collidesWithPipe(pipe)) {
          dead = true;
        }
      }
      return dead;
    }
    setFlapped(onSound) {
      this.speed = this.flappingSpeed;
      onSound?.("wing");
    }
    toggleAutoFlap(onSound) {
      this.autoFlap = !this.autoFlap;
      onSound?.("wing");
      return this.autoFlap;
    }
    autoFlapWhenNeeded(pipes, onSound) {
      if (!this.autoFlap) {
        return;
      }
      if (this.bottom > this.baseHeight - 10) {
        this.setFlapped(onSound);
        return;
      }
      let minRight = 1e3;
      let maxBottom = -1e3;
      let leftBottomPipe = null;
      for (const pipe of pipes) {
        const pipeRight = pipe.x + pipe.width;
        const pipeBottom = pipe.y + pipe.height;
        if (pipeRight < minRight && pipeRight > this.x) {
          minRight = pipeRight;
          maxBottom = pipeBottom;
          leftBottomPipe = pipe;
        } else if (pipeRight === minRight && pipeBottom > maxBottom) {
          maxBottom = pipeBottom;
          leftBottomPipe = pipe;
        }
      }
      if (leftBottomPipe && this.bottom > leftBottomPipe.y - 8) {
        this.setFlapped(onSound);
      }
    }
  };
  var Pipe = class {
    constructor(x, y, flyingSpeed = FLYING_SPEED, kind) {
      this.width = PIPE_WIDTH;
      this.height = PIPE_HEIGHT;
      this.usedForScore = false;
      this.x = x;
      this.y = y;
      this.flyingSpeed = flyingSpeed;
      this.top = kind === "top";
    }
    get centerX() {
      return this.x + this.width / 2;
    }
    moveLeft() {
      this.x -= this.flyingSpeed;
    }
    static randomPairY(rng) {
      const baseY = BASE_Y_RATIO_HEIGHT;
      const minUp = Math.floor(baseY * 0.2);
      const span = Math.max(1, Math.floor(baseY * 0.6 - PIPE_GAP_SIZE));
      const upY = minUp + rng.randInt(0, span - 1);
      return {
        topY: upY - PIPE_HEIGHT,
        bottomY: upY + PIPE_GAP_SIZE
      };
    }
  };
  var BASE_Y_RATIO_HEIGHT = 0.79 * SCREEN_HEIGHT;
  var GroundBase = class {
    constructor(y = BASE_Y, flyingSpeed = FLYING_SPEED) {
      this.x = 0;
      this.width = BASE_WIDTH;
      this.height = 112;
      this.y = y;
      this.diff = BASE_WIDTH - SCREEN_WIDTH;
      this.flyingSpeed = flyingSpeed;
    }
    update() {
      this.x = -((-this.x + this.flyingSpeed) % this.diff);
    }
  };

  // flappybird/ts/game.ts
  var FlappyGame = class {
    constructor(options = {}) {
      this.phase = "start";
      this.mode = "1p";
      this.bird2 = null;
      this.pipes = [];
      this.score = 0;
      this.bestScore = 0;
      this.soundsPlayed = [];
      this.canAddPipe = true;
      this.emitSound = (key) => {
        this.soundsPlayed.push(key);
        if (this.soundsPlayed.length > 64) {
          this.soundsPlayed.shift();
        }
        this.onSound?.(key);
      };
      const seed = options.seed !== void 0 ? options.seed : (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
      this.rng = makeRng(seed);
      this.storage = options.storage ?? null;
      this.onSound = options.onSound;
      this.bestScore = this.loadBestScore();
      this.resetToStart();
    }
    loadBestScore() {
      if (!this.storage) {
        return 0;
      }
      try {
        const raw = this.storage.getItem(STORAGE_KEY);
        const parsed = raw ? parseInt(raw, 10) : 0;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      } catch {
        return 0;
      }
    }
    saveBestScore() {
      const whole = Math.floor(this.score);
      if (whole > this.bestScore) {
        this.bestScore = whole;
        if (this.storage) {
          try {
            this.storage.setItem(STORAGE_KEY, String(this.bestScore));
          } catch {
          }
        }
      }
    }
    pickTheme() {
      const bird1Color = this.rng.choice(BIRD_COLORS);
      const others = BIRD_COLORS.filter((c) => c !== bird1Color);
      const bird2Color = this.rng.choice(others);
      return {
        background: this.rng.choice(["day", "night"]),
        pipe: this.rng.choice(["green", "red"]),
        bird1Color,
        bird2Color
      };
    }
    resetToStart() {
      this.phase = "start";
      this.score = 0;
      this.pipes = [];
      this.canAddPipe = true;
      this.theme = this.pickTheme();
      this.ground = new GroundBase(BASE_Y, FLYING_SPEED);
      this.bird1 = new Bird(this.theme.bird1Color, 0.2, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
      this.bird2 = new Bird(this.theme.bird2Color, 0.05, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
    }
    addPipePair(x) {
      const pos = Pipe.randomPairY(this.rng);
      this.pipes.push(new Pipe(x, pos.topY, FLYING_SPEED, "top"));
      this.pipes.push(new Pipe(x, pos.bottomY, FLYING_SPEED, "bottom"));
    }
    startGame(mode = "1p") {
      this.mode = mode;
      this.phase = "playing";
      this.score = 0;
      this.canAddPipe = true;
      this.theme = this.pickTheme();
      this.ground = new GroundBase(BASE_Y, FLYING_SPEED);
      this.bird1 = new Bird(this.theme.bird1Color, 0.2, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
      this.bird2 = mode === "2p" ? new Bird(this.theme.bird2Color, 0.05, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED) : null;
      this.pipes = [];
      for (let i = 0; i < 2; i++) {
        this.addPipePair(SCREEN_WIDTH + 200 + i * SCREEN_WIDTH / 2);
      }
      this.emitSound("swoosh");
    }
    flap(playerIndex) {
      if (this.phase !== "playing") {
        return false;
      }
      if (playerIndex === 1) {
        this.bird1.setFlapped(this.emitSound);
        return true;
      }
      if (playerIndex === 2 && this.bird2) {
        this.bird2.setFlapped(this.emitSound);
        return true;
      }
      return false;
    }
    toggleAutoFlap(playerIndex) {
      if (playerIndex === 1) {
        return this.bird1.toggleAutoFlap(this.emitSound);
      }
      if (playerIndex === 2 && this.bird2) {
        return this.bird2.toggleAutoFlap(this.emitSound);
      }
      return false;
    }
    step(dt) {
      if (this.phase === "start") {
        this.ground.update();
        this.bird1.flyInStartInterface();
        this.bird2?.flyInStartInterface();
        return;
      }
      if (this.phase === "gameover") {
        this.bird1.update(dt);
        this.bird2?.update(dt);
        return;
      }
      if (this.bird1.autoFlap) {
        this.bird1.autoFlapWhenNeeded(this.pipes, this.emitSound);
      }
      if (this.bird2 && this.bird2.autoFlap) {
        this.bird2.autoFlapWhenNeeded(this.pipes, this.emitSound);
      }
      this.bird1.update(dt);
      const b1Dead = this.bird1.isHittingBoundaryOrPipe(this.pipes);
      let b2Dead = false;
      if (this.bird2) {
        this.bird2.update(dt);
        b2Dead = this.bird2.isHittingBoundaryOrPipe(this.pipes);
      }
      if (b1Dead || b2Dead) {
        this.phase = "gameover";
        this.emitSound("hit");
        this.emitSound("die");
        this.saveBestScore();
        return;
      }
      const nextPipes = [];
      for (const pipe of this.pipes) {
        pipe.moveLeft();
        if (pipe.centerX < this.bird1.centerX && !pipe.usedForScore) {
          pipe.usedForScore = true;
          const prevWhole = Math.floor(this.score);
          this.score += 0.5;
          if (Math.floor(this.score) > prevWhole) {
            this.emitSound("point");
          }
        }
        if (pipe.x > 0 && pipe.x < 5 && this.canAddPipe) {
          this.addPipePair(SCREEN_WIDTH + 10);
          this.canAddPipe = false;
        }
        if (pipe.x + pipe.width < 0) {
          this.canAddPipe = true;
        } else {
          nextPipes.push(pipe);
        }
      }
      this.pipes = nextPipes;
      this.ground.update();
    }
  };

  // flappybird/ts/app.ts
  var FlappyWebApp = class {
    constructor(canvas, options = {}) {
      this.accumulator = 0;
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
    tick(seconds) {
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
    uiState() {
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
    activate(action) {
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
    handlePointerDown(pt) {
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
    handleKeyDown(key) {
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
    drawBackground() {
      const ctx = this.ctx;
      const bg = this.images.background(this.game.theme.background);
      if (bg && ctx.drawImage) {
        ctx.drawImage(bg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        return;
      }
      ctx.fillStyle = this.game.theme.background === "day" ? "#4ec0ca" : "#0e2236";
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    drawPipe(pipe) {
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
    drawGround() {
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
    drawBird(bird) {
      const ctx = this.ctx;
      const img = this.images.bird(bird.color, bird.currentFlapFrame());
      if (img && ctx.drawImage) {
        ctx.drawImage(img, bird.x, bird.y, bird.width, bird.height);
        return;
      }
      ctx.fillStyle = bird.color === "red" ? "#f96d55" : bird.color === "blue" ? "#60bef7" : "#ffcf6b";
      ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }
    drawScore() {
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
    draw() {
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
  };
  function bootBrowser() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    const canvasEl = document.getElementById("game-canvas");
    if (!canvasEl) {
      return;
    }
    const app = new FlappyWebApp(canvasEl, {
      storage: window.localStorage
    });
    window.flappyApp = app;
    const badgeEl = document.getElementById("status-badge");
    const scoreEl = document.getElementById("score-readout");
    const btn1p = document.getElementById("btn-1p");
    const btn2p = document.getElementById("btn-2p");
    const btnAi1 = document.getElementById("btn-ai1");
    const btnAi2 = document.getElementById("btn-ai2");
    const btnSound = document.getElementById("btn-sound");
    const btnRestart = document.getElementById("btn-restart");
    let lastKey = "";
    const syncDom = () => {
      const st = app.uiState();
      const key = JSON.stringify(st);
      if (key === lastKey) {
        return;
      }
      lastKey = key;
      if (badgeEl) {
        badgeEl.textContent = st.phase === "start" ? "Tap screen or choose 1P / 2P" : st.phase === "gameover" ? "Game Over - Tap or Space to restart" : st.mode === "2p" ? "2P Active (Left: Bird 1 | Right: Bird 2)" : "1P Active - Tap anywhere to flap";
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
    canvasEl.addEventListener("pointerdown", (evt) => {
      evt.preventDefault();
      const rect = canvasEl.getBoundingClientRect();
      const x = (evt.clientX - rect.left) * SCREEN_WIDTH / rect.width;
      const y = (evt.clientY - rect.top) * SCREEN_HEIGHT / rect.height;
      app.handlePointerDown([x, y]);
      syncDom();
    });
    window.addEventListener("keydown", (evt) => {
      if (app.handleKeyDown(evt.key)) {
        evt.preventDefault();
        syncDom();
      }
    });
    let lastTime = performance.now();
    const frame = (now) => {
      const dt = (now - lastTime) / 1e3;
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
  return __toCommonJS(app_exports);
})();
  return __FlappyBirdBundle;
});
