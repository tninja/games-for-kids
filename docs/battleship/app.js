(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BattleshipWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
"use strict";
var __BattleshipBundle = (() => {
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

  // battleship/ts/app.ts
  var app_exports = {};
  __export(app_exports, {
    BattleshipGame: () => BattleshipGame,
    BattleshipWebApp: () => BattleshipWebApp,
    ComputerPlayer: () => ComputerPlayer,
    FLEET_NAMES: () => FLEET_NAMES,
    FLEET_SIZES: () => FLEET_SIZES,
    Fleet: () => Fleet,
    FleetGroup: () => FleetGroup,
    HEIGHT: () => HEIGHT,
    MOBILE_HEIGHT: () => MOBILE_HEIGHT,
    MOBILE_WIDTH: () => MOBILE_WIDTH,
    Player: () => Player,
    WIDTH: () => WIDTH,
    encodeLoc: () => encodeLoc,
    makeRng: () => makeRng
  });

  // battleship/ts/fleet.ts
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
  function encodeLoc(row, col) {
    return String.fromCharCode(65 + row) + String(col + 1);
  }
  function orthogonalNeighbors(row, col, boardSize) {
    const dirs = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];
    const result = [];
    for (const [nr, nc] of dirs) {
      if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
        result.push([nr, nc]);
      }
    }
    return result;
  }
  var Fleet = class {
    constructor(x, y, size, direction, name) {
      this.coordinates = [];
      this.hits = [];
      this.name = name;
      this.size = size;
      this.direction = direction;
      for (let i = 0; i < size; i++) {
        this.coordinates.push(direction === "vertical" ? [x + i, y] : [x, y + i]);
      }
    }
    hasCoord(x, y) {
      return this.coordinates.some(([cx, cy]) => cx === x && cy === y);
    }
    hasHit(x, y) {
      return this.hits.some(([hx, hy]) => hx === x && hy === y);
    }
    hit(x, y) {
      if (this.hasCoord(x, y) && !this.hasHit(x, y)) {
        this.hits.push([x, y]);
        return true;
      }
      return false;
    }
    isSunk() {
      return this.hits.length === this.size;
    }
  };
  var FleetGroup = class {
    constructor() {
      this.fleets = [];
    }
    add(fleet) {
      this.fleets.push(fleet);
    }
    findAt(x, y) {
      for (const fleet of this.fleets) {
        if (fleet.hasCoord(x, y)) {
          return fleet;
        }
      }
      return null;
    }
    hit(x, y) {
      for (const fleet of this.fleets) {
        if (fleet.hit(x, y)) {
          return fleet.name;
        }
      }
      return null;
    }
    allSunk() {
      return this.fleets.length > 0 && this.fleets.every((fleet) => fleet.isSunk());
    }
  };

  // battleship/ts/types.ts
  var WIDTH = 1280;
  var HEIGHT = 880;
  var MOBILE_WIDTH = 560;
  var MOBILE_HEIGHT = 1120;
  var COLORS = {
    INK: "rgb(231, 241, 244)",
    MUTED: "rgb(157, 181, 190)",
    NAVY: "rgb(14, 29, 40)",
    PANEL: "rgb(24, 44, 57)",
    CARD: "rgb(34, 59, 73)",
    BORDER: "rgb(67, 95, 107)",
    OCEAN: "rgb(18, 46, 66)",
    OCEAN_HOVER: "rgb(33, 74, 102)",
    SHIP_FILL: "rgb(112, 138, 152)",
    SHIP_SUNK: "rgb(92, 54, 62)",
    GREEN: "rgb(159, 235, 164)",
    GOLD: "rgb(255, 207, 107)",
    CORAL: "rgb(249, 143, 121)",
    BLUE: "rgb(96, 190, 247)"
  };
  var FLEET_NAMES = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer"
  ];
  var FLEET_SIZES = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 3
  };
  var FLEET_LABELS = {
    carrier: "Carrier",
    battleship: "Battleship",
    cruiser: "Cruiser",
    submarine: "Submarine",
    destroyer: "Destroyer"
  };
  var PLAYER_PANEL = { x: 34, y: 118, width: 590, height: 526 };
  var ENEMY_PANEL = { x: 656, y: 118, width: 590, height: 526 };
  var MOBILE_ENEMY_PANEL = { x: 10, y: 10, width: 540, height: 544 };
  var MOBILE_PLAYER_PANEL = { x: 10, y: 566, width: 540, height: 544 };
  var ROSTER_PANEL = { x: 34, y: 660, width: 590, height: 196 };
  var LOG_PANEL = { x: 656, y: 660, width: 590, height: 196 };

  // battleship/ts/game.ts
  var Player = class {
    constructor(name, boardSize = 7) {
      this.fleetGroup = new FleetGroup();
      this.hitHistory = [];
      this.wasHitHistory = [];
      this.name = name;
      this.boardSize = boardSize;
    }
    hasTried(x, y) {
      return this.hitHistory.some(([hx, hy]) => hx === x && hy === y);
    }
    hitRecordAt(x, y) {
      for (const rec of this.hitHistory) {
        if (rec[0] === x && rec[1] === y) {
          return rec;
        }
      }
      return null;
    }
    wasHitAt(x, y) {
      return this.wasHitHistory.some(([hx, hy]) => hx === x && hy === y);
    }
    randomInit(fleetNames = FLEET_NAMES, rng) {
      const gen = rng ?? makeRng(Date.now());
      const n = this.boardSize;
      for (let layoutTry = 0; layoutTry < 50; layoutTry++) {
        const board = Array.from({ length: n }, () => new Array(n).fill(0));
        const group = new FleetGroup();
        let failed = false;
        for (const fname of fleetNames) {
          const size = FLEET_SIZES[fname];
          let placed = false;
          for (let attempt = 0; attempt < 250; attempt++) {
            const direction = gen.choice(["vertical", "horizontal"]);
            const x = direction === "vertical" ? gen.randInt(0, n - size) : gen.randInt(0, n - 1);
            const y = direction === "horizontal" ? gen.randInt(0, n - size) : gen.randInt(0, n - 1);
            let clear = true;
            for (let step = 0; step < size; step++) {
              const cx = direction === "vertical" ? x + step : x;
              const cy = direction === "horizontal" ? y + step : y;
              if (board[cx][cy] !== 0) {
                clear = false;
                break;
              }
            }
            if (clear) {
              for (let mark = 0; mark < size; mark++) {
                const mx = direction === "vertical" ? x + mark : x;
                const my = direction === "horizontal" ? y + mark : y;
                board[mx][my] = 1;
              }
              group.add(new Fleet(x, y, size, direction, fname));
              placed = true;
              break;
            }
          }
          if (!placed) {
            failed = true;
            break;
          }
        }
        if (!failed) {
          this.fleetGroup = group;
          return;
        }
      }
      throw new Error("Failed to place fleet on board of size " + n);
    }
    hit(targetPlayer, x, y) {
      targetPlayer.wasHitHistory.push([x, y]);
      const result = targetPlayer.fleetGroup.hit(x, y);
      this.hitHistory.push([x, y, result !== null]);
      return result;
    }
    allSunk() {
      return this.fleetGroup.allSunk();
    }
  };
  var ComputerPlayer = class extends Player {
    randomShot(boardSize, rng) {
      const possible = [];
      const priority = [];
      for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
          if (!this.hasTried(x, y)) {
            possible.push([x, y]);
            if ((x + y) % 2 === 0) {
              priority.push([x, y]);
            }
          }
        }
      }
      return rng.choice(priority.length > 0 ? priority : possible);
    }
    chooseNextShot(opponent, rng) {
      const n = this.boardSize;
      const gen = rng ?? makeRng(Date.now());
      const hitsInProgress = [];
      for (const [hx, hy, isHit] of this.hitHistory) {
        if (!isHit) {
          continue;
        }
        const isSunk = opponent.fleetGroup.fleets.some((fl) => fl.isSunk() && fl.hasCoord(hx, hy));
        if (!isSunk) {
          hitsInProgress.push([hx, hy]);
        }
      }
      if (hitsInProgress.length > 0) {
        let candidates = [];
        if (hitsInProgress.length > 1) {
          const points = hitsInProgress.slice().sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
          if (points[0][0] === points[1][0]) {
            const row = points[0][0];
            let minCol = points[0][1];
            let maxCol = points[0][1];
            for (const pt of points) {
              if (pt[0] === row) {
                minCol = Math.min(minCol, pt[1]);
                maxCol = Math.max(maxCol, pt[1]);
              }
            }
            if (minCol - 1 >= 0) {
              candidates.push([row, minCol - 1]);
            }
            if (maxCol + 1 < n) {
              candidates.push([row, maxCol + 1]);
            }
          } else {
            const col = points[0][1];
            let minRow = points[0][0];
            let maxRow = points[0][0];
            for (const pt of points) {
              if (pt[1] === col) {
                minRow = Math.min(minRow, pt[0]);
                maxRow = Math.max(maxRow, pt[0]);
              }
            }
            if (minRow - 1 >= 0) {
              candidates.push([minRow - 1, col]);
            }
            if (maxRow + 1 < n) {
              candidates.push([maxRow + 1, col]);
            }
          }
        } else {
          candidates = orthogonalNeighbors(hitsInProgress[0][0], hitsInProgress[0][1], n);
        }
        candidates = candidates.filter(([cx, cy]) => !this.hasTried(cx, cy));
        if (candidates.length === 0 && hitsInProgress.length > 1) {
          for (const [hx, hy] of hitsInProgress) {
            for (const [ax, ay] of orthogonalNeighbors(hx, hy, n)) {
              if (!this.hasTried(ax, ay)) {
                candidates.push([ax, ay]);
              }
            }
          }
        }
        if (candidates.length > 0) {
          return gen.choice(candidates);
        }
      }
      return this.randomShot(n, gen);
    }
  };
  var BattleshipGame = class {
    constructor(options = {}) {
      this.shotsFired = 0;
      this.gameOver = false;
      this.winner = null;
      this.logs = ["Fleet deployed. Aim with arrows/WASD or click Enemy Fleet."];
      this.boardSize = options.boardSize === 10 ? 10 : 7;
      this.seed = options.seed !== void 0 ? options.seed : (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
      this.rng = makeRng(this.seed);
      this.player = new Player("You", this.boardSize);
      this.computer = new ComputerPlayer("Computer", this.boardSize);
      this.player.randomInit(FLEET_NAMES, this.rng);
      this.computer.randomInit(FLEET_NAMES, this.rng);
    }
    pushLog(line) {
      this.logs.unshift(line);
      if (this.logs.length > 5) {
        this.logs.length = 5;
      }
    }
    rerollPlayerFleet() {
      if (this.shotsFired > 0 || this.gameOver) {
        return false;
      }
      this.player.randomInit(FLEET_NAMES, this.rng);
      this.pushLog("Re-rolled your fleet positions.");
      return true;
    }
    playerFire(row, col) {
      if (this.gameOver) {
        return { accepted: false, reason: "game_over" };
      }
      if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
        return { accepted: false, reason: "out_of_bounds" };
      }
      if (this.player.hasTried(row, col)) {
        return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
      }
      this.shotsFired += 1;
      const loc = encodeLoc(row, col);
      const hitName = this.player.hit(this.computer, row, col);
      const hitFleet = hitName ? this.computer.fleetGroup.findAt(row, col) : null;
      const sunkName = hitFleet && hitFleet.isSunk() ? hitFleet.name : null;
      if (sunkName) {
        this.pushLog("You fired " + loc + ": HIT and SUNK enemy " + FLEET_LABELS[sunkName] + "!");
      } else if (hitName) {
        this.pushLog("You fired " + loc + ": HIT enemy " + FLEET_LABELS[hitName] + "!");
      } else {
        this.pushLog("You fired " + loc + ": Miss.");
      }
      if (this.computer.allSunk()) {
        this.gameOver = true;
        this.winner = "You";
        this.pushLog("Victory! You sank the entire enemy fleet.");
        return {
          accepted: true,
          coord: loc,
          hit: hitName,
          sunk: sunkName,
          computerShot: null,
          gameOver: true,
          winner: this.winner
        };
      }
      const compTarget = this.computer.chooseNextShot(this.player, this.rng);
      const compLoc = encodeLoc(compTarget[0], compTarget[1]);
      const compHit = this.computer.hit(this.player, compTarget[0], compTarget[1]);
      const compFleet = compHit ? this.player.fleetGroup.findAt(compTarget[0], compTarget[1]) : null;
      const compSunk = compFleet && compFleet.isSunk() ? compFleet.name : null;
      if (compSunk) {
        this.pushLog("Computer fired " + compLoc + ": SUNK your " + FLEET_LABELS[compSunk] + "!");
      } else if (compHit) {
        this.pushLog("Computer fired " + compLoc + ": Hit your " + FLEET_LABELS[compHit] + ".");
      } else {
        this.pushLog("Computer fired " + compLoc + ": Miss.");
      }
      if (this.player.allSunk()) {
        this.gameOver = true;
        this.winner = "Computer";
        this.pushLog("Defeat! Computer sank all your ships.");
      }
      return {
        accepted: true,
        coord: loc,
        hit: hitName,
        sunk: sunkName,
        computerShot: {
          coord: compLoc,
          row: compTarget[0],
          col: compTarget[1],
          hit: compHit,
          sunk: compSunk
        },
        gameOver: this.gameOver,
        winner: this.winner
      };
    }
  };

  // battleship/ts/painter.ts
  function collidePoint(rect, pt) {
    return pt[0] >= rect.x && pt[0] <= rect.x + rect.width && pt[1] >= rect.y && pt[1] <= rect.y + rect.height;
  }
  var Painter = class {
    constructor(ctx) {
      this.errors = [];
      this.ctx = ctx;
    }
    setFont(size, weight = "600") {
      const px = Math.max(11, Math.round(size * 0.68));
      this.ctx.font = weight + " " + px + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      return Math.round(size * 0.78);
    }
    text(message, rect, size = 22, color = COLORS.INK, align = "left", weight = "600") {
      const lineHeight = this.setFont(size, weight);
      const paragraphs = String(message).split("\n");
      const lines = [];
      for (const para of paragraphs) {
        const trimmed = para.trim();
        const words = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
        let line = "";
        for (const word of words) {
          const candidate = (line ? line + " " + word : word).trim();
          if (line && this.ctx.measureText(candidate).width > rect.width) {
            lines.push(line);
            line = word;
          } else {
            line = candidate;
          }
        }
        lines.push(line);
      }
      const totalHeight = lines.length * lineHeight;
      const tooWide = lines.some((l) => this.ctx.measureText(l).width > rect.width + 2);
      if (totalHeight > rect.height + 2 || tooWide) {
        this.errors.push(message);
      }
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = "top";
      this.ctx.textAlign = align;
      const drawX = align === "center" ? rect.x + rect.width / 2 : align === "right" ? rect.x + rect.width : rect.x;
      for (let i = 0; i < lines.length; i++) {
        this.ctx.fillText(lines[i], drawX, rect.y + i * lineHeight);
      }
      this.ctx.textAlign = "left";
      return totalHeight;
    }
    panel(rect, color = COLORS.PANEL, radius = 16) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
      } else {
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      }
      this.ctx.fill();
    }
    strokeRoundRect(rect, color, lineWidth, radius = 16) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
      } else {
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      }
      this.ctx.stroke();
    }
  };

  // battleship/ts/sound.ts
  var SoundEffects = class {
    constructor() {
      this.muted = false;
      this.played = [];
      this.ctx = null;
    }
    ensureContext() {
      if (typeof window === "undefined") {
        return null;
      }
      const win = window;
      const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      if (!this.ctx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
      if (this.ctx.state === "suspended" && this.ctx.resume) {
        this.ctx.resume();
      }
      return this.ctx;
    }
    toggle() {
      this.muted = !this.muted;
      return this.muted;
    }
    tone(ctx, freqStart, freqEnd, duration, type, volume, delay) {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, start);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + duration);
      }
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(1e-3, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    }
    noise(ctx, duration, cutoffHz, volume, delay) {
      const start = ctx.currentTime + delay;
      const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoffHz, start);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(1e-3, start + duration);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(start);
    }
    play(kind) {
      if (this.muted) {
        return false;
      }
      this.played.push(kind);
      if (this.played.length > 64) {
        this.played.shift();
      }
      const ctx = this.ensureContext();
      if (!ctx) {
        return true;
      }
      if (kind === "launch") {
        this.tone(ctx, 520, 170, 0.14, "triangle", 0.12, 0);
      } else if (kind === "miss") {
        this.tone(ctx, 300, 110, 0.16, "sine", 0.12, 0);
        this.noise(ctx, 0.18, 1200, 0.1, 0.02);
      } else if (kind === "hit") {
        this.tone(ctx, 180, 46, 0.24, "sawtooth", 0.16, 0);
        this.noise(ctx, 0.22, 850, 0.18, 0);
      } else if (kind === "sunk") {
        this.tone(ctx, 140, 34, 0.42, "sawtooth", 0.2, 0);
        this.tone(ctx, 220, 55, 0.28, "square", 0.1, 0.08);
        this.noise(ctx, 0.38, 650, 0.22, 0);
      } else if (kind === "win") {
        this.tone(ctx, 523.25, 523.25, 0.14, "triangle", 0.14, 0);
        this.tone(ctx, 659.25, 659.25, 0.14, "triangle", 0.14, 0.11);
        this.tone(ctx, 783.99, 783.99, 0.14, "triangle", 0.14, 0.22);
        this.tone(ctx, 1046.5, 1046.5, 0.28, "triangle", 0.16, 0.33);
      } else if (kind === "lose") {
        this.tone(ctx, 392, 392, 0.18, "sawtooth", 0.1, 0);
        this.tone(ctx, 311.13, 311.13, 0.18, "sawtooth", 0.1, 0.16);
        this.tone(ctx, 261.63, 220, 0.34, "sawtooth", 0.12, 0.32);
      } else if (kind === "click") {
        this.tone(ctx, 640, 480, 0.05, "sine", 0.08, 0);
      }
      return true;
    }
  };

  // battleship/ts/app.ts
  var BattleshipWebApp = class {
    constructor(canvas, options = {}) {
      this.layoutErrors = [];
      this.gameCount = 0;
      this.mobileMode = false;
      this.hover = [-1, -1];
      this.hoverCell = null;
      this.cursor = [0, 0];
      this.statusMessage = "";
      this.statusColor = COLORS.GREEN;
      this.clock = 0;
      this.projectiles = [];
      this.particles = [];
      this.ripples = [];
      this.pendingEvents = [];
      this.pendingEnemyKeys = {};
      this.pendingPlayerKeys = {};
      this.shakeTime = 0;
      this.shakeDuration = 0.35;
      this.shakeIntensity = 0;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("2D canvas context is required");
      }
      this.canvas = canvas;
      this.ctx = ctx;
      this.painter = new Painter(this.ctx);
      this.sound = new SoundEffects();
      this.baseSeed = options.seed;
      this.boardSize = options.boardSize === 10 ? 10 : 7;
      this.startNewGame(this.boardSize);
    }
    nextSeed() {
      if (this.baseSeed !== void 0) {
        this.gameCount += 1;
        return this.baseSeed + this.gameCount - 1;
      }
      return void 0;
    }
    clearVisuals() {
      this.projectiles = [];
      this.particles = [];
      this.ripples = [];
      this.pendingEvents = [];
      this.pendingEnemyKeys = {};
      this.pendingPlayerKeys = {};
      this.shakeTime = 0;
      this.shakeIntensity = 0;
    }
    startNewGame(boardSize) {
      this.clearVisuals();
      this.boardSize = boardSize === 10 ? 10 : 7;
      this.game = new BattleshipGame({
        boardSize: this.boardSize,
        seed: this.nextSeed()
      });
      this.cursor = [0, 0];
      this.hoverCell = null;
      this.statusMessage = "Your turn! Aim at Enemy Fleet (" + this.boardSize + "x" + this.boardSize + ").";
      this.statusColor = COLORS.GREEN;
    }
    setMobileMode(enabled) {
      this.mobileMode = Boolean(enabled);
    }
    playerPanelRect() {
      return this.mobileMode ? MOBILE_PLAYER_PANEL : PLAYER_PANEL;
    }
    enemyPanelRect() {
      return this.mobileMode ? MOBILE_ENEMY_PANEL : ENEMY_PANEL;
    }
    gridMetrics(panel) {
      const n = this.boardSize;
      const cellSize = this.mobileMode ? n === 10 ? 46 : 66 : n === 10 ? 42 : 58;
      const gridPx = n * cellSize;
      const originX = panel.x + Math.round((panel.width - gridPx) / 2) + 12;
      const originY = panel.y + 72;
      return { originX, originY, cellSize, gridPx };
    }
    playerCellCenter(row, col) {
      const m = this.gridMetrics(this.playerPanelRect());
      return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
    }
    enemyCellCenter(row, col) {
      const m = this.gridMetrics(this.enemyPanelRect());
      return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
    }
    enemyCellRect(row, col) {
      const m = this.gridMetrics(this.enemyPanelRect());
      return {
        x: m.originX + col * m.cellSize,
        y: m.originY + row * m.cellSize,
        width: m.cellSize,
        height: m.cellSize
      };
    }
    enemyCellAtPoint(pt) {
      const m = this.gridMetrics(this.enemyPanelRect());
      const col = Math.floor((pt[0] - m.originX) / m.cellSize);
      const row = Math.floor((pt[1] - m.originY) / m.cellSize);
      if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
        return [row, col];
      }
      return null;
    }
    isEnemyCellRevealed(row, col) {
      return Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col];
    }
    isPlayerCellRevealed(row, col) {
      return this.game.player.wasHitAt(row, col) && !this.pendingPlayerKeys[row + "," + col];
    }
    spawnImpact(center, kind) {
      const isHit = kind === "hit" || kind === "sunk";
      const ringColor = isHit ? kind === "sunk" ? COLORS.GOLD : COLORS.CORAL : COLORS.BLUE;
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: kind === "sunk" ? 0.55 : 0.4,
        maxLife: kind === "sunk" ? 0.55 : 0.4,
        maxRadius: kind === "sunk" ? 44 : 28,
        color: ringColor,
        lineWidth: kind === "sunk" ? 4 : 3
      });
      if (kind === "sunk") {
        this.ripples.push({
          x: center[0],
          y: center[1],
          life: 0.7,
          maxLife: 0.7,
          maxRadius: 62,
          color: COLORS.CORAL,
          lineWidth: 2
        });
      }
      const count = kind === "sunk" ? 20 : isHit ? 12 : 8;
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 2 * i / count + i % 2 * 0.2;
        const speed = (kind === "sunk" ? 130 : isHit ? 95 : 55) * (0.5 + i % 3 * 0.25);
        this.particles.push({
          x: center[0],
          y: center[1],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isHit ? 25 : 15),
          life: kind === "sunk" ? 0.65 : 0.45,
          maxLife: kind === "sunk" ? 0.65 : 0.45,
          color: isHit ? i % 2 === 0 ? COLORS.CORAL : COLORS.GOLD : COLORS.BLUE,
          size: kind === "sunk" ? 5 : 4
        });
      }
    }
    spawnVictoryConfetti() {
      const colors = [COLORS.GREEN, COLORS.GOLD, COLORS.BLUE, COLORS.CORAL];
      const ep = this.enemyPanelRect();
      for (let i = 0; i < 36; i++) {
        const angle = -Math.PI + Math.PI * i / 36;
        const speed = 140 + i % 5 * 45;
        this.particles.push({
          x: ep.x + ep.width / 2,
          y: ep.y + 180,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.1,
          maxLife: 1.1,
          color: colors[i % colors.length],
          size: 5
        });
      }
    }
    triggerShake(intensity = 7) {
      this.shakeDuration = 0.35;
      this.shakeTime = this.shakeDuration;
      this.shakeIntensity = intensity;
    }
    flushVisualQueue() {
      while (this.pendingEvents.length > 0 || this.projectiles.length > 0) {
        for (const proj of this.projectiles) {
          if (!proj.resolved) {
            proj.resolved = true;
            proj.onImpact(true);
          }
        }
        this.projectiles = [];
        if (this.pendingEvents.length > 0) {
          const evts = this.pendingEvents.splice(0, this.pendingEvents.length);
          for (const evt of evts) {
            evt.fn(true);
          }
        }
      }
      this.pendingEnemyKeys = {};
      this.pendingPlayerKeys = {};
      this.particles = [];
      this.ripples = [];
      this.shakeTime = 0;
    }
    tick(seconds) {
      const dt = Math.max(0, seconds);
      this.clock += dt;
      const remainingEvents = [];
      for (const evt of this.pendingEvents) {
        evt.delay -= dt;
        if (evt.delay <= 0) {
          evt.fn(false);
        } else {
          remainingEvents.push(evt);
        }
      }
      this.pendingEvents = remainingEvents;
      const activeProj = [];
      for (const p of this.projectiles) {
        p.elapsed += dt;
        if (p.elapsed >= p.duration) {
          if (!p.resolved) {
            p.resolved = true;
            p.onImpact(false);
          }
        } else {
          activeProj.push(p);
        }
      }
      this.projectiles = activeProj;
      const activeParticles = [];
      for (const pt of this.particles) {
        pt.life -= dt;
        if (pt.life > 0) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 140 * dt;
          activeParticles.push(pt);
        }
      }
      this.particles = activeParticles;
      const activeRipples = [];
      for (const rp of this.ripples) {
        rp.life -= dt;
        if (rp.life > 0) {
          activeRipples.push(rp);
        }
      }
      this.ripples = activeRipples;
      if (this.shakeTime > 0) {
        this.shakeTime = Math.max(0, this.shakeTime - dt);
      }
    }
    buttons() {
      const canReroll = this.game.shotsFired === 0 && !this.game.gameOver;
      return [
        {
          rect: { x: 528, y: 28, width: 162, height: 48 },
          label: this.sound.muted ? "Sound: Off (M)" : "Sound: On (M)",
          action: "toggle_sound",
          disabled: false
        },
        {
          rect: { x: 702, y: 28, width: 164, height: 48 },
          label: "Re-roll (F)",
          action: "reroll",
          disabled: !canReroll
        },
        {
          rect: { x: 878, y: 28, width: 190, height: 48 },
          label: "Board: " + this.boardSize + "x" + this.boardSize + " (G)",
          action: "toggle_size",
          disabled: false
        },
        {
          rect: { x: 1080, y: 28, width: 166, height: 48 },
          label: "New Game (R)",
          action: "new_game",
          disabled: false
        }
      ];
    }
    activate(action) {
      if (action === "toggle_sound") {
        const muted = this.sound.toggle();
        if (!muted) {
          this.sound.play("click");
        }
        this.statusMessage = muted ? "Sound muted." : "Sound enabled.";
        this.statusColor = COLORS.MUTED;
        return;
      }
      if (action === "reroll") {
        this.flushVisualQueue();
        if (this.game.rerollPlayerFleet()) {
          this.sound.play("click");
          this.statusMessage = "Re-rolled your fleet positions.";
          this.statusColor = COLORS.GOLD;
        } else {
          this.statusMessage = "Fleet locked after battle starts. Press R for New Game.";
          this.statusColor = COLORS.MUTED;
        }
        return;
      }
      if (action === "toggle_size") {
        const nextSize = this.boardSize === 7 ? 10 : 7;
        this.startNewGame(nextSize);
        this.sound.play("click");
        return;
      }
      if (action === "new_game") {
        this.startNewGame(this.boardSize);
        this.sound.play("click");
      }
    }
    fireAt(row, col) {
      if (this.game.gameOver) {
        this.flushVisualQueue();
        this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
        this.statusColor = this.game.winner === "You" ? COLORS.GREEN : COLORS.CORAL;
        return { accepted: false, reason: "game_over" };
      }
      if (this.game.player.hasTried(row, col)) {
        this.statusMessage = "Already fired at " + encodeLoc(row, col) + ". Pick another cell.";
        this.statusColor = COLORS.GOLD;
        return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
      }
      this.flushVisualQueue();
      const res = this.game.playerFire(row, col);
      if (!res.accepted) {
        return res;
      }
      const enemyKey = row + "," + col;
      this.pendingEnemyKeys[enemyKey] = true;
      const targetCenter = this.enemyCellCenter(row, col);
      const pp = this.playerPanelRect();
      const launchCenter = [pp.x + pp.width / 2, pp.y + pp.height / 2];
      if (res.computerShot) {
        this.pendingPlayerKeys[res.computerShot.row + "," + res.computerShot.col] = true;
      }
      this.sound.play("launch");
      this.statusMessage = "Firing at " + res.coord + "...";
      this.statusColor = COLORS.GOLD;
      this.projectiles.push({
        from: launchCenter,
        to: targetCenter,
        elapsed: 0,
        duration: 0.22,
        color: COLORS.GOLD,
        resolved: false,
        onImpact: (fastForward) => {
          delete this.pendingEnemyKeys[enemyKey];
          const kind = res.sunk ? "sunk" : res.hit ? "hit" : "miss";
          if (!fastForward) {
            this.spawnImpact(targetCenter, kind);
            this.sound.play(kind);
            if (res.sunk) {
              this.triggerShake(8);
            }
          }
          if (res.gameOver && res.winner === "You") {
            this.statusMessage = "VICTORY! You sank all enemy ships!";
            this.statusColor = COLORS.GREEN;
            if (!fastForward) {
              this.spawnVictoryConfetti();
              this.sound.play("win");
            }
          } else if (res.sunk) {
            this.statusMessage = "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
            this.statusColor = COLORS.GREEN;
          } else if (res.hit) {
            this.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
            this.statusColor = COLORS.GOLD;
          } else {
            this.statusMessage = "Miss at " + res.coord + ". Incoming fire...";
            this.statusColor = COLORS.BLUE;
          }
        }
      });
      if (res.computerShot) {
        const comp = res.computerShot;
        const compKey = comp.row + "," + comp.col;
        const compTargetCenter = this.playerCellCenter(comp.row, comp.col);
        const ep = this.enemyPanelRect();
        const compOrigin = [ep.x + ep.width / 2, ep.y + ep.height / 2];
        this.pendingEvents.push({
          delay: 0.28,
          fn: (fastForward) => {
            if (!fastForward) {
              this.sound.play("launch");
            }
            this.projectiles.push({
              from: compOrigin,
              to: compTargetCenter,
              elapsed: 0,
              duration: 0.22,
              color: COLORS.CORAL,
              resolved: false,
              onImpact: (ffImpact) => {
                delete this.pendingPlayerKeys[compKey];
                const compKind = comp.sunk ? "sunk" : comp.hit ? "hit" : "miss";
                if (!ffImpact && !fastForward) {
                  this.spawnImpact(compTargetCenter, compKind);
                  this.sound.play(compKind);
                  if (comp.sunk) {
                    this.triggerShake(8);
                  }
                }
                if (res.gameOver && res.winner === "Computer") {
                  this.statusMessage = "DEFEAT! Computer sank all your ships.";
                  this.statusColor = COLORS.CORAL;
                  if (!ffImpact && !fastForward) {
                    this.sound.play("lose");
                  }
                } else if (!res.sunk && !res.hit) {
                  this.statusMessage = "Miss at " + res.coord + ". Your turn!";
                  this.statusColor = COLORS.BLUE;
                }
              }
            });
          }
        });
      }
      return res;
    }
    handlePointerMove(pt) {
      this.hover = pt;
      this.hoverCell = this.enemyCellAtPoint(pt);
    }
    handlePointerDown(pt) {
      this.hover = pt;
      if (!this.mobileMode) {
        for (const btn of this.buttons()) {
          if (collidePoint(btn.rect, pt)) {
            this.activate(btn.action);
            return;
          }
        }
      }
      const cell = this.enemyCellAtPoint(pt);
      if (cell) {
        this.cursor = [cell[0], cell[1]];
        this.fireAt(cell[0], cell[1]);
      }
    }
    handleKeyDown(key) {
      const maxIdx = this.boardSize - 1;
      if (key === "ArrowUp" || key === "w" || key === "W") {
        this.cursor[0] = Math.max(0, this.cursor[0] - 1);
        return true;
      }
      if (key === "ArrowDown" || key === "s" || key === "S") {
        this.cursor[0] = Math.min(maxIdx, this.cursor[0] + 1);
        return true;
      }
      if (key === "ArrowLeft" || key === "a" || key === "A") {
        this.cursor[1] = Math.max(0, this.cursor[1] - 1);
        return true;
      }
      if (key === "ArrowRight" || key === "d" || key === "D") {
        this.cursor[1] = Math.min(maxIdx, this.cursor[1] + 1);
        return true;
      }
      if (key === "Enter" || key === " ") {
        this.fireAt(this.cursor[0], this.cursor[1]);
        return true;
      }
      if (key === "f" || key === "F") {
        this.activate("reroll");
        return true;
      }
      if (key === "g" || key === "G") {
        this.activate("toggle_size");
        return true;
      }
      if (key === "m" || key === "M") {
        this.activate("toggle_sound");
        return true;
      }
      if (key === "r" || key === "R") {
        this.activate("new_game");
        return true;
      }
      return false;
    }
    drawButton(btn) {
      const isHover = !btn.disabled && collidePoint(btn.rect, this.hover);
      const bg = btn.disabled ? "rgb(26, 42, 52)" : isHover ? "rgb(48, 77, 86)" : COLORS.CARD;
      const border = btn.disabled ? "rgb(48, 66, 76)" : isHover ? COLORS.GREEN : COLORS.BORDER;
      const textColor = btn.disabled ? COLORS.MUTED : COLORS.INK;
      this.painter.panel(btn.rect, bg, 12);
      this.painter.strokeRoundRect(btn.rect, border, 2, 12);
      this.painter.text(
        btn.label,
        { x: btn.rect.x + 8, y: btn.rect.y + 13, width: btn.rect.width - 16, height: 28 },
        21,
        textColor,
        "center",
        "700"
      );
    }
    drawMarker(rect, kind) {
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const ctx = this.ctx;
      if (kind === "hit") {
        const pad = Math.round(rect.width * 0.24);
        ctx.strokeStyle = COLORS.CORAL;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rect.x + pad, rect.y + pad);
        ctx.lineTo(rect.x + rect.width - pad, rect.y + rect.height - pad);
        ctx.moveTo(rect.x + rect.width - pad, rect.y + pad);
        ctx.lineTo(rect.x + pad, rect.y + rect.height - pad);
        ctx.stroke();
      } else {
        ctx.fillStyle = COLORS.BLUE;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(5, Math.round(rect.width * 0.16)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    drawBoard(panel, title, subtitle, isPlayer) {
      const p = this.painter;
      const ctx = this.ctx;
      p.panel(panel, COLORS.PANEL, 16);
      p.strokeRoundRect(panel, COLORS.BORDER, 2, 16);
      p.text(
        title,
        { x: panel.x + 22, y: panel.y + 14, width: 230, height: 30 },
        26,
        isPlayer ? COLORS.BLUE : COLORS.GOLD,
        "left",
        "700"
      );
      p.text(
        subtitle,
        { x: panel.x + 220, y: panel.y + 17, width: panel.width - 242, height: 26 },
        20,
        COLORS.MUTED,
        "right"
      );
      const m = this.gridMetrics(panel);
      const n = this.boardSize;
      for (let i = 0; i < n; i++) {
        p.text(
          String(i + 1),
          { x: m.originX + i * m.cellSize, y: m.originY - 24, width: m.cellSize, height: 22 },
          19,
          COLORS.MUTED,
          "center"
        );
        p.text(
          String.fromCharCode(65 + i),
          {
            x: m.originX - 28,
            y: m.originY + i * m.cellSize + Math.round((m.cellSize - 18) / 2),
            width: 22,
            height: 22
          },
          19,
          COLORS.MUTED,
          "center"
        );
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const cell = {
            x: m.originX + c * m.cellSize,
            y: m.originY + r * m.cellSize,
            width: m.cellSize,
            height: m.cellSize
          };
          let fill = COLORS.OCEAN;
          let marker = null;
          if (isPlayer) {
            const myFleet = this.game.player.fleetGroup.findAt(r, c);
            const revealedPlayerHit = this.isPlayerCellRevealed(r, c);
            if (myFleet) {
              if (myFleet.hasHit(r, c) && revealedPlayerHit) {
                fill = COLORS.SHIP_SUNK;
                marker = "hit";
              } else {
                fill = COLORS.SHIP_FILL;
              }
            } else if (revealedPlayerHit) {
              marker = "miss";
            }
          } else {
            const rec = this.isEnemyCellRevealed(r, c) ? this.game.player.hitRecordAt(r, c) : null;
            const isHover = this.hoverCell && this.hoverCell[0] === r && this.hoverCell[1] === c;
            if (rec) {
              if (rec[2]) {
                const enemyFleet = this.game.computer.fleetGroup.findAt(r, c);
                fill = enemyFleet && enemyFleet.isSunk() ? COLORS.SHIP_SUNK : "rgb(72, 46, 54)";
                marker = "hit";
              } else {
                fill = "rgb(20, 38, 52)";
                marker = "miss";
              }
            } else if (isHover && !this.game.gameOver) {
              fill = COLORS.OCEAN_HOVER;
            }
          }
          ctx.fillStyle = fill;
          ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
          ctx.strokeStyle = "rgb(48, 84, 108)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
          if (marker) {
            this.drawMarker(cell, marker);
          }
          if (!isPlayer && !this.game.gameOver && this.cursor[0] === r && this.cursor[1] === c) {
            ctx.strokeStyle = COLORS.GOLD;
            ctx.lineWidth = 2.5 + 1.1 * Math.sin(this.clock * 6);
            ctx.strokeRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
          }
        }
      }
      ctx.strokeStyle = COLORS.BORDER;
      ctx.lineWidth = 2;
      ctx.strokeRect(m.originX, m.originY, m.gridPx, m.gridPx);
    }
    revealedHitCount(fleet, isPlayerSide) {
      let revealedHits = 0;
      for (const [hx, hy] of fleet.hits) {
        const rev = isPlayerSide ? this.isPlayerCellRevealed(hx, hy) : this.isEnemyCellRevealed(hx, hy);
        if (rev) {
          revealedHits += 1;
        }
      }
      return revealedHits;
    }
    mobileState() {
      const mapFleets = (fleets, isPlayerSide) => fleets.map((f) => {
        const hits = this.revealedHitCount(f, isPlayerSide);
        return {
          name: f.name,
          label: FLEET_LABELS[f.name],
          size: f.size,
          revealedHits: hits,
          sunk: hits === f.size
        };
      });
      return {
        statusMessage: this.statusMessage,
        statusColor: this.statusColor,
        boardSize: this.boardSize,
        shotsFired: this.game.shotsFired,
        gameOver: this.game.gameOver,
        winner: this.game.winner,
        buttons: this.buttons().map((b) => ({
          label: b.label.replace(/ \([A-Z]\)$/, ""),
          action: b.action,
          disabled: b.disabled
        })),
        playerFleets: mapFleets(this.game.player.fleetGroup.fleets, true),
        enemyFleets: mapFleets(this.game.computer.fleetGroup.fleets, false),
        logs: this.game.logs.slice(0, 5)
      };
    }
    drawRoster() {
      const p = this.painter;
      const ctx = this.ctx;
      p.panel(ROSTER_PANEL, COLORS.PANEL, 16);
      p.strokeRoundRect(ROSTER_PANEL, COLORS.BORDER, 2, 16);
      p.text(
        "YOUR SHIPS",
        { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
        21,
        COLORS.BLUE,
        "left",
        "700"
      );
      p.text(
        "ENEMY SHIPS",
        { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
        21,
        COLORS.GOLD,
        "left",
        "700"
      );
      const drawCol = (fleets, startX, isPlayerSide) => {
        for (let i = 0; i < fleets.length; i++) {
          const f = fleets[i];
          const y = ROSTER_PANEL.y + 44 + i * 28;
          const revealedHits = this.revealedHitCount(f, isPlayerSide);
          const sunk = revealedHits === f.size;
          p.text(
            FLEET_LABELS[f.name],
            { x: startX, y, width: 120, height: 22 },
            18,
            sunk ? COLORS.CORAL : COLORS.INK
          );
          for (let pip = 0; pip < f.size; pip++) {
            const px = startX + 126 + pip * 16;
            const py = y + 4;
            ctx.fillStyle = sunk ? COLORS.CORAL : pip < revealedHits ? COLORS.GOLD : COLORS.GREEN;
            ctx.fillRect(px, py, 11, 11);
          }
          p.text(
            sunk ? "SUNK" : f.size - revealedHits + "/" + f.size,
            { x: startX + 214, y, width: 52, height: 22 },
            17,
            sunk ? COLORS.CORAL : COLORS.MUTED,
            "right"
          );
        }
      };
      drawCol(this.game.player.fleetGroup.fleets, ROSTER_PANEL.x + 20, true);
      drawCol(this.game.computer.fleetGroup.fleets, ROSTER_PANEL.x + 310, false);
    }
    drawBattleLog() {
      const p = this.painter;
      p.panel(LOG_PANEL, COLORS.PANEL, 16);
      const borderColor = this.game.gameOver ? this.game.winner === "You" ? COLORS.GREEN : COLORS.CORAL : COLORS.BORDER;
      p.strokeRoundRect(LOG_PANEL, borderColor, 2, 16);
      p.text(
        this.statusMessage,
        { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 14, width: LOG_PANEL.width - 40, height: 32 },
        23,
        this.statusColor,
        "left",
        "700"
      );
      p.text(
        this.game.logs.slice(0, 4).join("\n"),
        { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 54, width: LOG_PANEL.width - 40, height: 102 },
        19,
        COLORS.MUTED
      );
      const targetHint = "Target: " + encodeLoc(this.cursor[0], this.cursor[1]) + "  |  Shots: " + this.game.shotsFired + "  |  Arrows/WASD + Enter/Space or Click";
      p.text(
        targetHint,
        { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 162, width: LOG_PANEL.width - 40, height: 24 },
        18,
        COLORS.GOLD
      );
    }
    drawEffects() {
      const ctx = this.ctx;
      for (const rp of this.ripples) {
        const frac = 1 - rp.life / rp.maxLife;
        ctx.save?.();
        ctx.globalAlpha = Math.max(0, rp.life / rp.maxLife);
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = rp.lineWidth;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 6 + frac * rp.maxRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore?.();
      }
      for (const p of this.projectiles) {
        const t = Math.min(1, p.elapsed / p.duration);
        const arcLift = Math.sin(Math.PI * t) * 58;
        const px = p.from[0] + (p.to[0] - p.from[0]) * t;
        const py = p.from[1] + (p.to[1] - p.from[1]) * t - arcLift;
        const tailT = Math.max(0, t - 0.14);
        const tailLift = Math.sin(Math.PI * tailT) * 58;
        const tx = p.from[0] + (p.to[0] - p.from[0]) * tailT;
        const ty = p.from[1] + (p.to[1] - p.from[1]) * tailT - tailLift;
        ctx.save?.();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = COLORS.INK;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore?.();
      }
      for (const pt of this.particles) {
        ctx.save?.();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        ctx.restore?.();
      }
    }
    draw() {
      this.painter.errors = [];
      const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
      const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
      this.ctx.fillStyle = COLORS.NAVY;
      this.ctx.fillRect(0, 0, cw, ch);
      const shaking = this.shakeTime > 0;
      if (shaking && this.ctx.save && this.ctx.translate) {
        const ratio = this.shakeTime / this.shakeDuration;
        const dx = Math.sin(this.clock * 70) * this.shakeIntensity * ratio;
        const dy = Math.cos(this.clock * 85) * this.shakeIntensity * ratio;
        this.ctx.save();
        this.ctx.translate(dx, dy);
      }
      if (this.mobileMode) {
        this.drawBoard(this.enemyPanelRect(), "ENEMY FLEET", "Tap a square to fire", false);
        this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Ships & incoming hits", true);
        this.drawEffects();
      } else {
        this.painter.text(
          "BATTLESHIP",
          { x: 34, y: 20, width: 300, height: 42 },
          42,
          COLORS.GREEN,
          "left",
          "800"
        );
        this.painter.text(
          "Sink all 5 enemy warships before Computer sinks yours.",
          { x: 34, y: 68, width: 480, height: 28 },
          21,
          COLORS.MUTED
        );
        for (const btn of this.buttons()) {
          this.drawButton(btn);
        }
        this.drawBoard(PLAYER_PANEL, "YOUR FLEET", "Ships & incoming hits", true);
        this.drawBoard(
          ENEMY_PANEL,
          "ENEMY FLEET",
          "Target: " + encodeLoc(this.cursor[0], this.cursor[1]),
          false
        );
        this.drawRoster();
        this.drawBattleLog();
        this.drawEffects();
      }
      if (shaking) {
        this.ctx.restore?.();
      }
      this.layoutErrors = this.painter.errors.slice();
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
    const app = new BattleshipWebApp(canvasEl);
    window.battleshipApp = app;
    const mobileStatusText = document.getElementById("mobile-status-text");
    const mobileStatusSub = document.getElementById("mobile-status-sub");
    const mobileButtons = document.getElementById("mobile-buttons");
    const mobileRoster = document.getElementById("mobile-roster");
    const mobileLogs = document.getElementById("mobile-logs");
    let lastMobileKey = "";
    const syncViewport = () => {
      const isMobile = window.innerWidth <= 900 || window.innerHeight > window.innerWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const logW = isMobile ? MOBILE_WIDTH : WIDTH;
      const logH = isMobile ? MOBILE_HEIGHT : HEIGHT;
      app.setMobileMode(isMobile);
      const w = Math.round(logW * dpr);
      const h = Math.round(logH * dpr);
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w;
        canvasEl.height = h;
      }
      app.ctx.setTransform?.(dpr, 0, 0, dpr, 0, 0);
      app.draw();
    };
    const syncMobileDom = () => {
      if (!app.mobileMode || !mobileButtons) {
        return;
      }
      const st = app.mobileState();
      const key = JSON.stringify(st);
      if (key === lastMobileKey) {
        return;
      }
      lastMobileKey = key;
      if (mobileStatusText) {
        mobileStatusText.textContent = st.statusMessage;
        mobileStatusText.style.color = st.statusColor;
      }
      if (mobileStatusSub) {
        mobileStatusSub.textContent = "Board: " + st.boardSize + "x" + st.boardSize + " | Shots: " + st.shotsFired;
      }
      mobileButtons.innerHTML = "";
      for (const b of st.buttons) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mobile-btn";
        btn.textContent = b.label;
        btn.disabled = b.disabled;
        btn.addEventListener("click", () => {
          app.activate(b.action);
          app.draw();
          syncMobileDom();
        });
        mobileButtons.appendChild(btn);
      }
      if (mobileRoster) {
        mobileRoster.innerHTML = "";
        const buildCol = (title, fleets, isEnemy) => {
          const col = document.createElement("div");
          col.className = "mobile-roster-col" + (isEnemy ? " enemy" : "");
          const h4 = document.createElement("h4");
          h4.textContent = title;
          col.appendChild(h4);
          for (const f of fleets) {
            const row = document.createElement("div");
            row.className = "mobile-ship-row" + (f.sunk ? " sunk" : "");
            const name = document.createElement("span");
            name.textContent = f.label;
            const pips = document.createElement("span");
            pips.className = "mobile-pips";
            for (let p = 0; p < f.size; p++) {
              const pip = document.createElement("span");
              pip.className = "mobile-pip" + (f.sunk ? " sunk" : p < f.revealedHits ? " hit" : "");
              pips.appendChild(pip);
            }
            row.appendChild(name);
            row.appendChild(pips);
            col.appendChild(row);
          }
          return col;
        };
        mobileRoster.appendChild(buildCol("YOUR SHIPS", st.playerFleets, false));
        mobileRoster.appendChild(buildCol("ENEMY SHIPS", st.enemyFleets, true));
      }
      if (mobileLogs) {
        mobileLogs.textContent = st.logs.join("\n");
      }
    };
    const logicalFromEvent = (evt) => {
      const rect = canvasEl.getBoundingClientRect();
      const logW = app.mobileMode ? MOBILE_WIDTH : WIDTH;
      const logH = app.mobileMode ? MOBILE_HEIGHT : HEIGHT;
      const x = Math.round((evt.clientX - rect.left) * logW / rect.width);
      const y = Math.round((evt.clientY - rect.top) * logH / rect.height);
      return [x, y];
    };
    canvasEl.addEventListener("pointermove", (evt) => {
      app.handlePointerMove(logicalFromEvent(evt));
    });
    canvasEl.addEventListener("pointerdown", (evt) => {
      evt.preventDefault();
      app.handlePointerDown(logicalFromEvent(evt));
      syncMobileDom();
    });
    window.addEventListener("keydown", (evt) => {
      if (app.handleKeyDown(evt.key)) {
        evt.preventDefault();
        syncMobileDom();
      }
    });
    window.addEventListener("resize", () => {
      syncViewport();
      syncMobileDom();
    });
    syncViewport();
    syncMobileDom();
    let lastTime = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - lastTime) / 1e3, 0.1);
      lastTime = now;
      app.tick(dt);
      app.draw();
      syncMobileDom();
      window.requestAnimationFrame(frame);
    };
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
  return __BattleshipBundle;
});
