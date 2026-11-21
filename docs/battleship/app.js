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
    BADGE_LABELS: () => BADGE_LABELS,
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
    ProfileStore: () => ProfileStore,
    WIDTH: () => WIDTH,
    encodeLoc: () => encodeLoc,
    makeRng: () => makeRng,
    rankForStars: () => rankForStars
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
    remove(name) {
      this.fleets = this.fleets.filter((f) => f.name !== name);
    }
    findByName(name) {
      for (const fleet of this.fleets) {
        if (fleet.name === name) {
          return fleet;
        }
      }
      return null;
    }
    findAt(x, y) {
      for (const fleet of this.fleets) {
        if (fleet.hasCoord(x, y)) {
          return fleet;
        }
      }
      return null;
    }
    isValidPlacement(x, y, size, direction, boardSize, ignoreName) {
      for (let i = 0; i < size; i++) {
        const r = direction === "vertical" ? x + i : x;
        const c = direction === "horizontal" ? y + i : y;
        if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
          return false;
        }
        for (const fleet of this.fleets) {
          if (ignoreName && fleet.name === ignoreName) {
            continue;
          }
          if (fleet.hasCoord(r, c)) {
            return false;
          }
        }
      }
      return true;
    }
    replaceOrAdd(fleet) {
      const idx = this.fleets.findIndex((f) => f.name === fleet.name);
      if (idx >= 0) {
        this.fleets[idx] = fleet;
      } else {
        this.fleets.push(fleet);
      }
    }
    hit(x, y) {
      for (const fleet of this.fleets) {
        if (fleet.hit(x, y)) {
          return fleet.name;
        }
      }
      return null;
    }
    remainingCount() {
      let count = 0;
      for (const fleet of this.fleets) {
        if (!fleet.isSunk()) {
          count += 1;
        }
      }
      return count;
    }
    minUnsunkSize() {
      let minSize = Infinity;
      for (const fleet of this.fleets) {
        if (!fleet.isSunk() && fleet.size < minSize) {
          minSize = fleet.size;
        }
      }
      return Number.isFinite(minSize) ? minSize : 0;
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
    INK: "rgb(240, 249, 255)",
    MUTED: "rgb(172, 206, 224)",
    NAVY: "rgb(12, 42, 68)",
    PANEL: "rgb(20, 60, 92)",
    CARD: "rgb(30, 78, 114)",
    BORDER: "rgb(74, 134, 172)",
    OCEAN: "rgb(18, 92, 144)",
    OCEAN_ALT: "rgb(22, 102, 156)",
    OCEAN_HOVER: "rgb(42, 134, 192)",
    OCEAN_MISS: "rgb(17, 68, 108)",
    WAVE: "rgb(108, 196, 240)",
    SHIP_FILL: "rgb(148, 174, 190)",
    SHIP_DARK: "rgb(92, 116, 134)",
    SHIP_ACCENT: "rgb(224, 238, 246)",
    SHIP_SUNK: "rgb(98, 54, 68)",
    GREEN: "rgb(138, 242, 168)",
    SONAR: "rgb(82, 236, 178)",
    GOLD: "rgb(255, 214, 92)",
    CORAL: "rgb(255, 118, 102)",
    ORANGE: "rgb(255, 162, 76)",
    BLUE: "rgb(104, 206, 255)",
    PURPLE: "rgb(190, 152, 255)"
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
  var DIFFICULTY_LABELS = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard"
  };
  var RULE_LABELS = {
    classic: "Classic",
    streak: "Streak",
    salvo: "Salvo"
  };
  var BADGE_LABELS = {
    first_win: "First Win",
    sharpshooter: "Sharpshooter",
    comeback_kid: "Comeback Kid",
    sonar_detective: "Sonar Detective",
    bomb_blast: "Bomb Blast",
    hot_streak: "Hot Streak",
    admiral_slayer: "Admiral Slayer"
  };
  var PLAYER_PANEL = { x: 34, y: 118, width: 590, height: 526 };
  var ENEMY_PANEL = { x: 656, y: 118, width: 590, height: 526 };
  var MOBILE_ENEMY_PANEL = { x: 10, y: 10, width: 540, height: 544 };
  var MOBILE_PLAYER_PANEL = { x: 10, y: 566, width: 540, height: 544 };
  var ROSTER_PANEL = { x: 34, y: 660, width: 590, height: 196 };
  var LOG_PANEL = { x: 656, y: 660, width: 590, height: 196 };

  // battleship/ts/game.ts
  var CAPTAIN_PROFILES = {
    easy: {
      name: "Cadet Pip",
      title: "Easy AI",
      intro: "Ahoy! Ready to play?"
    },
    normal: {
      name: "Captain Morgan",
      title: "Normal AI",
      intro: "All hands on deck!"
    },
    hard: {
      name: "Admiral Nova",
      title: "Hard AI",
      intro: "Show me your best tactics!"
    }
  };
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
    constructor(name, boardSize = 7, difficulty = "normal") {
      super(name, boardSize);
      this.difficulty = difficulty;
    }
    untriedCells() {
      const possible = [];
      for (let x = 0; x < this.boardSize; x++) {
        for (let y = 0; y < this.boardSize; y++) {
          if (!this.hasTried(x, y)) {
            possible.push([x, y]);
          }
        }
      }
      return possible;
    }
    randomShot(boardSize, rng, useParity) {
      const possible = [];
      const priority = [];
      for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
          if (!this.hasTried(x, y)) {
            possible.push([x, y]);
            if (useParity && (x + y) % 2 === 0) {
              priority.push([x, y]);
            }
          }
        }
      }
      return rng.choice(useParity && priority.length > 0 ? priority : possible);
    }
    probabilityShot(opponent, rng) {
      const n = this.boardSize;
      const scores = Array.from({ length: n }, () => new Array(n).fill(0));
      const unsunkSizes = opponent.fleetGroup.fleets.filter((fl) => !fl.isSunk()).map((fl) => fl.size);
      const isBlocked = (r, c) => {
        const rec = this.hitRecordAt(r, c);
        if (!rec) {
          return false;
        }
        if (!rec[2]) {
          return true;
        }
        return opponent.fleetGroup.fleets.some((fl) => fl.isSunk() && fl.hasCoord(r, c));
      };
      for (const size of unsunkSizes) {
        for (let r = 0; r < n; r++) {
          for (let c = 0; c <= n - size; c++) {
            let ok = true;
            for (let k = 0; k < size; k++) {
              if (isBlocked(r, c + k)) {
                ok = false;
                break;
              }
            }
            if (ok) {
              for (let k = 0; k < size; k++) {
                if (!this.hasTried(r, c + k)) {
                  scores[r][c + k] += 1;
                }
              }
            }
          }
        }
        for (let r = 0; r <= n - size; r++) {
          for (let c = 0; c < n; c++) {
            let ok = true;
            for (let k = 0; k < size; k++) {
              if (isBlocked(r + k, c)) {
                ok = false;
                break;
              }
            }
            if (ok) {
              for (let k = 0; k < size; k++) {
                if (!this.hasTried(r + k, c)) {
                  scores[r + k][c] += 1;
                }
              }
            }
          }
        }
      }
      let bestScore = -1;
      let best = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (this.hasTried(r, c)) {
            continue;
          }
          const s = scores[r][c] * 2 + ((r + c) % 2 === 0 ? 1 : 0);
          if (s > bestScore) {
            bestScore = s;
            best = [[r, c]];
          } else if (s === bestScore) {
            best.push([r, c]);
          }
        }
      }
      if (best.length > 0) {
        return rng.choice(best);
      }
      return this.randomShot(n, rng, true);
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
      if (this.difficulty === "easy") {
        if (hitsInProgress.length > 0 && gen.next() < 0.4) {
          const neighbors = [];
          for (const [hx, hy] of hitsInProgress) {
            for (const [ax, ay] of orthogonalNeighbors(hx, hy, n)) {
              if (!this.hasTried(ax, ay)) {
                neighbors.push([ax, ay]);
              }
            }
          }
          if (neighbors.length > 0) {
            return gen.choice(neighbors);
          }
        }
        const untried = this.untriedCells();
        return gen.choice(untried);
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
      if (this.difficulty === "hard") {
        return this.probabilityShot(opponent, gen);
      }
      return this.randomShot(n, gen, false);
    }
  };
  var BattleshipGame = class {
    constructor(options = {}) {
      this.activePlayerIndex = 0;
      this.waitingHandoff = false;
      this.turnNumber = 1;
      this.shotsFired = 0;
      this.shotsPerSide = [0, 0];
      this.hitsPerSide = [0, 0];
      this.currentStreak = [0, 0];
      this.bestStreak = [0, 0];
      this.missStreak = [0, 0];
      this.salvoRemaining = 1;
      this.sonarLeft = [2, 2];
      this.bombLeft = [1, 1];
      this.sonarUsedTurn = [0, 0];
      this.sonarScans = [[], []];
      this.lastSonarCenter = [null, null];
      this.sonarDetectiveEarned = [false, false];
      this.bombBlastEarned = [false, false];
      this.captainLine = "";
      this.captainMood = "neutral";
      this.gameOver = false;
      this.winner = null;
      this.logs = ["Fleet deployed. Aim with arrows/WASD or click Enemy Fleet."];
      this.boardSize = options.boardSize === 10 ? 10 : 7;
      this.playMode = options.playMode === "2p" ? "2p" : "1p";
      this.difficulty = options.difficulty ?? "normal";
      this.ruleMode = options.ruleMode ?? "classic";
      this.helperMode = Boolean(options.helperMode);
      this.seed = options.seed !== void 0 ? options.seed : (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
      this.rng = makeRng(this.seed);
      this.player = new Player(this.playMode === "2p" ? "Player 1" : "You", this.boardSize);
      this.computer = new ComputerPlayer(
        this.playMode === "2p" ? "Player 2" : "Computer",
        this.boardSize,
        this.difficulty
      );
      this.players = [this.player, this.computer];
      this.player.randomInit(FLEET_NAMES, this.rng);
      this.computer.randomInit(FLEET_NAMES, this.rng);
      this.salvoRemaining = this.ruleMode === "salvo" ? this.player.fleetGroup.remainingCount() : 1;
      const cap = CAPTAIN_PROFILES[this.difficulty];
      this.captainLine = cap.intro;
      this.captainMood = "neutral";
    }
    activePlayer() {
      return this.players[this.activePlayerIndex];
    }
    opponentPlayer() {
      return this.players[this.activePlayerIndex === 0 ? 1 : 0];
    }
    captainInfo() {
      if (this.playMode === "2p") {
        return null;
      }
      const base = CAPTAIN_PROFILES[this.difficulty];
      return {
        difficulty: this.difficulty,
        name: base.name,
        title: base.title,
        line: this.captainLine,
        mood: this.captainMood
      };
    }
    setCaptainQuip(event) {
      if (this.playMode === "2p") {
        return;
      }
      const lines = {
        easy: {
          player_miss: { text: "Splash! Safe for now!", mood: "happy" },
          player_hit: { text: "Whoa, nice shot!", mood: "shocked" },
          player_sunk: { text: "Oh no, my ship sank!", mood: "shocked" },
          ai_hit: { text: "Yay! I found one!", mood: "happy" },
          ai_sunk: { text: "Woohoo! Down it goes!", mood: "taunt" },
          sonar: { text: "Ooh, radar ping!", mood: "shocked" },
          bomb: { text: "Kaboom! Big splash!", mood: "shocked" },
          win: { text: "You win! Great job!", mood: "defeated" },
          lose: { text: "I won! Play again?", mood: "proud" }
        },
        normal: {
          player_miss: { text: "Nothing but ocean!", mood: "taunt" },
          player_hit: { text: "Direct hit! Ouch!", mood: "shocked" },
          player_sunk: { text: "You sank my warship!", mood: "shocked" },
          ai_hit: { text: "Right on target!", mood: "taunt" },
          ai_sunk: { text: "One ship down!", mood: "proud" },
          sonar: { text: "Clever sonar sweep!", mood: "neutral" },
          bomb: { text: "Brace for cross blast!", mood: "shocked" },
          win: { text: "Well fought, Captain!", mood: "defeated" },
          lose: { text: "Victory is mine!", mood: "proud" }
        },
        hard: {
          player_miss: { text: "Wasted shell, rookie.", mood: "taunt" },
          player_hit: { text: "Impressive calculation.", mood: "neutral" },
          player_sunk: { text: "Hull breached! Well played.", mood: "shocked" },
          ai_hit: { text: "Target locked.", mood: "proud" },
          ai_sunk: { text: "Fleet neutralized.", mood: "proud" },
          sonar: { text: "Counter-ping detected.", mood: "neutral" },
          bomb: { text: "Heavy ordnance incoming!", mood: "shocked" },
          win: { text: "You outsmarted the Admiral!", mood: "defeated" },
          lose: { text: "Strategy prevails!", mood: "proud" }
        }
      };
      const chosen = lines[this.difficulty][event];
      this.captainLine = chosen.text;
      this.captainMood = chosen.mood;
    }
    pushLog(line) {
      this.logs.unshift(line);
      if (this.logs.length > 6) {
        this.logs.length = 6;
      }
    }
    canPlaceShip(sideIndex, name, row, col, direction) {
      const side = this.players[sideIndex];
      const size = FLEET_SIZES[name];
      return side.fleetGroup.isValidPlacement(row, col, size, direction, this.boardSize, name);
    }
    placeShip(sideIndex, name, row, col, direction) {
      if (this.gameOver || this.shotsFired > 0) {
        return false;
      }
      if (!this.canPlaceShip(sideIndex, name, row, col, direction)) {
        return false;
      }
      const size = FLEET_SIZES[name];
      this.players[sideIndex].fleetGroup.replaceOrAdd(new Fleet(row, col, size, direction, name));
      return true;
    }
    rerollSideFleet(sideIndex) {
      if (this.gameOver || this.shotsFired > 0) {
        return false;
      }
      this.players[sideIndex].randomInit(FLEET_NAMES, this.rng);
      this.pushLog(this.players[sideIndex].name + " shuffled fleet positions.");
      return true;
    }
    rerollPlayerFleet() {
      if (this.shotsFired > 0 || this.gameOver) {
        return false;
      }
      this.player.randomInit(FLEET_NAMES, this.rng);
      this.pushLog("Re-rolled your fleet positions.");
      return true;
    }
    confirmHandoff() {
      if (!this.waitingHandoff) {
        return;
      }
      this.waitingHandoff = false;
      this.activePlayerIndex = this.activePlayerIndex === 0 ? 1 : 0;
      this.turnNumber += 1;
      this.resetTurnSalvo(this.activePlayerIndex);
      this.pushLog(this.activePlayer().name + "'s turn!");
    }
    untriedCountFor(shooter) {
      return this.boardSize * this.boardSize - shooter.hitHistory.length;
    }
    resetTurnSalvo(sideIndex) {
      if (this.ruleMode === "salvo") {
        const alive = this.players[sideIndex].fleetGroup.remainingCount();
        const untried = this.untriedCountFor(this.players[sideIndex]);
        this.salvoRemaining = Math.max(1, Math.min(alive, untried));
      } else {
        this.salvoRemaining = 1;
      }
    }
    useSonar(row, col) {
      if (this.gameOver) {
        return { accepted: false, reason: "game_over", row, col };
      }
      if (this.waitingHandoff) {
        return { accepted: false, reason: "not_ready" };
      }
      if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
        return { accepted: false, reason: "out_of_bounds" };
      }
      const idx = this.activePlayerIndex;
      if (this.sonarLeft[idx] <= 0) {
        return { accepted: false, reason: "no_charges" };
      }
      if (this.sonarUsedTurn[idx] === this.turnNumber) {
        return { accepted: false, reason: "already_scanned_turn" };
      }
      const target = this.opponentPlayer();
      let count = 0;
      for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize - 1, col + 1); c++) {
          const fl = target.fleetGroup.findAt(r, c);
          if (fl && !fl.hasHit(r, c)) {
            count += 1;
          }
        }
      }
      this.sonarLeft[idx] -= 1;
      this.sonarUsedTurn[idx] = this.turnNumber;
      this.lastSonarCenter[idx] = [row, col];
      const loc = encodeLoc(row, col);
      this.sonarScans[idx].push({ row, col, count, turnUsed: this.turnNumber });
      this.pushLog(
        this.activePlayer().name + " sonar at " + loc + ": " + count + (count === 1 ? " ship cell" : " ship cells") + " in 3x3!"
      );
      this.setCaptainQuip("sonar");
      return { accepted: true, row, col, coord: loc, count };
    }
    runComputerTurn() {
      const shots = [];
      const maxShots = this.ruleMode === "salvo" ? Math.max(1, Math.min(this.computer.fleetGroup.remainingCount(), this.untriedCountFor(this.computer))) : 1;
      let remaining = maxShots;
      while (remaining > 0 && !this.player.allSunk() && this.untriedCountFor(this.computer) > 0) {
        const compTarget = this.computer.chooseNextShot(this.player, this.rng);
        const compLoc = encodeLoc(compTarget[0], compTarget[1]);
        const compHit = this.computer.hit(this.player, compTarget[0], compTarget[1]);
        this.shotsPerSide[1] += 1;
        if (compHit) {
          this.hitsPerSide[1] += 1;
        }
        const compFleet = compHit ? this.player.fleetGroup.findAt(compTarget[0], compTarget[1]) : null;
        const compSunk = compFleet && compFleet.isSunk() ? compFleet.name : null;
        if (compSunk) {
          this.pushLog("Computer fired " + compLoc + ": SUNK your " + FLEET_LABELS[compSunk] + "!");
          this.setCaptainQuip("ai_sunk");
        } else if (compHit) {
          this.pushLog("Computer fired " + compLoc + ": Hit your " + FLEET_LABELS[compHit] + ".");
          this.setCaptainQuip("ai_hit");
        } else {
          this.pushLog("Computer fired " + compLoc + ": Miss.");
        }
        shots.push({
          coord: compLoc,
          row: compTarget[0],
          col: compTarget[1],
          hit: compHit,
          sunk: compSunk
        });
        if (this.player.allSunk()) {
          this.gameOver = true;
          this.winner = "Computer";
          this.pushLog("Defeat! Computer sank all your ships.");
          this.setCaptainQuip("lose");
          break;
        }
        if (this.ruleMode === "streak") {
          if (!compHit) {
            remaining = 0;
          }
        } else {
          remaining -= 1;
        }
      }
      if (!this.gameOver) {
        this.turnNumber += 1;
        this.resetTurnSalvo(0);
      }
      return shots;
    }
    useCrossBomb(row, col) {
      if (this.gameOver) {
        return { accepted: false, reason: "game_over", coord: encodeLoc(row, col) };
      }
      if (this.waitingHandoff) {
        return { accepted: false, reason: "not_ready" };
      }
      if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
        return { accepted: false, reason: "out_of_bounds" };
      }
      const idx = this.activePlayerIndex;
      if (this.bombLeft[idx] <= 0) {
        return { accepted: false, reason: "no_charges" };
      }
      const shooter = this.activePlayer();
      const target = this.opponentPlayer();
      const rawCells = [
        [row, col],
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
      ];
      const validTargets = rawCells.filter(
        ([r, c]) => r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && !shooter.hasTried(r, c)
      );
      if (validTargets.length === 0) {
        return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
      }
      this.bombLeft[idx] -= 1;
      const outcomes = [];
      let hitCount = 0;
      let lastHit = null;
      let lastSunk = null;
      for (const [r, c] of validTargets) {
        this.shotsFired += 1;
        this.shotsPerSide[idx] += 1;
        const loc = encodeLoc(r, c);
        const hitName = shooter.hit(target, r, c);
        const hitFleet = hitName ? target.fleetGroup.findAt(r, c) : null;
        const sunkName = hitFleet && hitFleet.isSunk() ? hitFleet.name : null;
        if (hitName) {
          hitCount += 1;
          this.hitsPerSide[idx] += 1;
          lastHit = hitName;
          if (sunkName) {
            lastSunk = sunkName;
          }
        }
        outcomes.push({ coord: loc, row: r, col: c, hit: hitName, sunk: sunkName });
      }
      if (hitCount >= 2) {
        this.bombBlastEarned[idx] = true;
      }
      if (hitCount > 0) {
        this.currentStreak[idx] += hitCount;
        this.bestStreak[idx] = Math.max(this.bestStreak[idx], this.currentStreak[idx]);
        this.missStreak[idx] = 0;
      } else {
        this.currentStreak[idx] = 0;
        this.missStreak[idx] += 1;
      }
      const centerLoc = encodeLoc(row, col);
      this.pushLog(
        shooter.name + " Cross Bomb at " + centerLoc + ": " + hitCount + " hit" + (hitCount === 1 ? "" : "s") + "!"
      );
      this.setCaptainQuip("bomb");
      if (target.allSunk()) {
        this.gameOver = true;
        this.winner = shooter.name;
        this.pushLog("Victory! " + shooter.name + " sank the entire enemy fleet.");
        this.setCaptainQuip("win");
        return {
          accepted: true,
          coord: centerLoc,
          hit: lastHit,
          sunk: lastSunk,
          cells: outcomes,
          computerShot: null,
          computerShots: [],
          gameOver: true,
          winner: this.winner
        };
      }
      if (this.ruleMode === "streak" && hitCount > 0) {
        return {
          accepted: true,
          coord: centerLoc,
          hit: lastHit,
          sunk: lastSunk,
          cells: outcomes,
          computerShot: null,
          computerShots: [],
          bonusTurn: true,
          streakCount: this.currentStreak[idx],
          gameOver: false,
          winner: null
        };
      }
      if (this.playMode === "2p") {
        this.waitingHandoff = true;
        return {
          accepted: true,
          coord: centerLoc,
          hit: lastHit,
          sunk: lastSunk,
          cells: outcomes,
          computerShot: null,
          computerShots: [],
          handoffRequired: true,
          gameOver: false,
          winner: null
        };
      }
      const compShots = this.runComputerTurn();
      return {
        accepted: true,
        coord: centerLoc,
        hit: lastHit,
        sunk: lastSunk,
        cells: outcomes,
        computerShot: compShots.length > 0 ? compShots[0] : null,
        computerShots: compShots,
        gameOver: this.gameOver,
        winner: this.winner
      };
    }
    playerFire(row, col) {
      if (this.gameOver) {
        return { accepted: false, reason: "game_over" };
      }
      if (this.waitingHandoff) {
        return { accepted: false, reason: "not_ready" };
      }
      if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
        return { accepted: false, reason: "out_of_bounds" };
      }
      if (this.activePlayerIndex === 1 && this.activePlayer().hasTried(row, col)) {
        return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
      }
      if (this.activePlayerIndex === 0) {
        if (this.player.hasTried(row, col)) {
          return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
        }
      }
      const idx = this.activePlayerIndex;
      const shooter = this.activePlayer();
      const target = this.opponentPlayer();
      this.shotsFired += 1;
      this.shotsPerSide[idx] += 1;
      const loc = encodeLoc(row, col);
      const hitName = shooter.hit(target, row, col);
      const hitFleet = hitName ? target.fleetGroup.findAt(row, col) : null;
      const sunkName = hitFleet && hitFleet.isSunk() ? hitFleet.name : null;
      if (hitName) {
        this.hitsPerSide[idx] += 1;
        this.currentStreak[idx] += 1;
        this.bestStreak[idx] = Math.max(this.bestStreak[idx], this.currentStreak[idx]);
        this.missStreak[idx] = 0;
        const lastCenter = this.lastSonarCenter[idx];
        if (lastCenter && this.sonarUsedTurn[idx] === this.turnNumber && Math.abs(lastCenter[0] - row) <= 1 && Math.abs(lastCenter[1] - col) <= 1) {
          this.sonarDetectiveEarned[idx] = true;
        }
      } else {
        this.currentStreak[idx] = 0;
        this.missStreak[idx] += 1;
      }
      if (sunkName) {
        this.pushLog(shooter.name + " fired " + loc + ": HIT and SUNK enemy " + FLEET_LABELS[sunkName] + "!");
        this.setCaptainQuip("player_sunk");
      } else if (hitName) {
        this.pushLog(shooter.name + " fired " + loc + ": HIT enemy " + FLEET_LABELS[hitName] + "!");
        this.setCaptainQuip("player_hit");
      } else {
        this.pushLog(shooter.name + " fired " + loc + ": Miss.");
        this.setCaptainQuip("player_miss");
      }
      const cellOutcome = { coord: loc, row, col, hit: hitName, sunk: sunkName };
      if (target.allSunk()) {
        this.gameOver = true;
        this.winner = shooter.name;
        this.pushLog("Victory! " + shooter.name + " sank the entire enemy fleet.");
        this.setCaptainQuip("win");
        return {
          accepted: true,
          coord: loc,
          hit: hitName,
          sunk: sunkName,
          cells: [cellOutcome],
          computerShot: null,
          computerShots: [],
          streakCount: this.currentStreak[idx],
          gameOver: true,
          winner: this.winner
        };
      }
      if (this.ruleMode === "streak" && hitName) {
        return {
          accepted: true,
          coord: loc,
          hit: hitName,
          sunk: sunkName,
          cells: [cellOutcome],
          computerShot: null,
          computerShots: [],
          bonusTurn: true,
          streakCount: this.currentStreak[idx],
          gameOver: false,
          winner: null
        };
      }
      if (this.ruleMode === "salvo") {
        this.salvoRemaining = Math.max(0, this.salvoRemaining - 1);
        if (this.salvoRemaining > 0 && this.untriedCountFor(shooter) > 0) {
          return {
            accepted: true,
            coord: loc,
            hit: hitName,
            sunk: sunkName,
            cells: [cellOutcome],
            computerShot: null,
            computerShots: [],
            bonusTurn: true,
            salvoRemaining: this.salvoRemaining,
            streakCount: this.currentStreak[idx],
            gameOver: false,
            winner: null
          };
        }
      }
      if (this.playMode === "2p") {
        this.waitingHandoff = true;
        return {
          accepted: true,
          coord: loc,
          hit: hitName,
          sunk: sunkName,
          cells: [cellOutcome],
          computerShot: null,
          computerShots: [],
          handoffRequired: true,
          streakCount: this.currentStreak[idx],
          gameOver: false,
          winner: null
        };
      }
      const compShots = this.runComputerTurn();
      return {
        accepted: true,
        coord: loc,
        hit: hitName,
        sunk: sunkName,
        cells: [cellOutcome],
        computerShot: compShots.length > 0 ? compShots[0] : null,
        computerShots: compShots,
        streakCount: this.currentStreak[idx],
        gameOver: this.gameOver,
        winner: this.winner
      };
    }
    impossibleEnemyCells(sideIndex = this.activePlayerIndex) {
      const impossible = /* @__PURE__ */ new Set();
      const shooter = this.players[sideIndex];
      const target = this.players[sideIndex === 0 ? 1 : 0];
      const n = this.boardSize;
      const minSize = target.fleetGroup.minUnsunkSize();
      if (minSize <= 1) {
        return impossible;
      }
      const isBlocked = (r, c) => {
        const rec = shooter.hitRecordAt(r, c);
        if (!rec) {
          return false;
        }
        if (!rec[2]) {
          return true;
        }
        return target.fleetGroup.fleets.some((fl) => fl.isSunk() && fl.hasCoord(r, c));
      };
      const canFit = Array.from({ length: n }, () => new Array(n).fill(false));
      const unsunkSizes = target.fleetGroup.fleets.filter((fl) => !fl.isSunk()).map((fl) => fl.size);
      for (const size of unsunkSizes) {
        for (let r = 0; r < n; r++) {
          for (let c = 0; c <= n - size; c++) {
            let ok = true;
            for (let k = 0; k < size; k++) {
              if (isBlocked(r, c + k)) {
                ok = false;
                break;
              }
            }
            if (ok) {
              for (let k = 0; k < size; k++) {
                canFit[r][c + k] = true;
              }
            }
          }
        }
        for (let r = 0; r <= n - size; r++) {
          for (let c = 0; c < n; c++) {
            let ok = true;
            for (let k = 0; k < size; k++) {
              if (isBlocked(r + k, c)) {
                ok = false;
                break;
              }
            }
            if (ok) {
              for (let k = 0; k < size; k++) {
                canFit[r + k][c] = true;
              }
            }
          }
        }
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (!shooter.hasTried(r, c) && !canFit[r][c]) {
            impossible.add(r + "," + c);
          }
        }
      }
      return impossible;
    }
    helperHint(sideIndex = this.activePlayerIndex) {
      if (!this.helperMode || this.gameOver || this.missStreak[sideIndex] < 4) {
        return null;
      }
      const target = this.players[sideIndex === 0 ? 1 : 0];
      for (const fl of target.fleetGroup.fleets) {
        if (fl.isSunk()) {
          continue;
        }
        for (const [r, c] of fl.coordinates) {
          if (!fl.hasHit(r, c)) {
            if ((r + c) % 2 === 0) {
              return { axis: "row", index: r, label: "Hint: Try Row " + String.fromCharCode(65 + r) + "!" };
            }
            return { axis: "col", index: c, label: "Hint: Try Col " + String(c + 1) + "!" };
          }
        }
      }
      return null;
    }
    evaluateBadgesFor(sideIndex) {
      const shots = this.shotsPerSide[sideIndex];
      const hits = this.hitsPerSide[sideIndex];
      const accuracy = shots > 0 ? Math.round(hits * 100 / shots) : 0;
      const side = this.players[sideIndex];
      const won = this.gameOver && this.winner === side.name;
      let stars = 0;
      if (won) {
        stars = accuracy >= 45 ? 3 : accuracy >= 30 ? 2 : 1;
      }
      const badges = [];
      if (won) {
        badges.push("first_win");
        if (accuracy >= 50) {
          badges.push("sharpshooter");
        }
        if (side.fleetGroup.remainingCount() === 1) {
          badges.push("comeback_kid");
        }
        if (this.playMode === "1p" && sideIndex === 0 && this.difficulty === "hard") {
          badges.push("admiral_slayer");
        }
      }
      if (this.sonarDetectiveEarned[sideIndex]) {
        badges.push("sonar_detective");
      }
      if (this.bombBlastEarned[sideIndex]) {
        badges.push("bomb_blast");
      }
      if (this.bestStreak[sideIndex] >= 3) {
        badges.push("hot_streak");
      }
      return { stars, accuracy, badges };
    }
    buildSummary(rankName, totalStars, newBadges) {
      const winnerIdx = this.winner === this.players[1].name ? 1 : 0;
      const evalIdx = this.playMode === "1p" ? 0 : winnerIdx;
      const evalRes = this.evaluateBadgesFor(evalIdx);
      return {
        winner: this.winner ?? "You",
        playerWon: this.playMode === "1p" ? this.winner === "You" : true,
        shots: this.shotsPerSide[evalIdx],
        hits: this.hitsPerSide[evalIdx],
        accuracy: evalRes.accuracy,
        stars: evalRes.stars,
        bestStreak: this.bestStreak[evalIdx],
        shipsRemaining: this.players[evalIdx].fleetGroup.remainingCount(),
        newBadges,
        rankName,
        totalStars
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

  // battleship/ts/profile.ts
  var STORAGE_KEY = "battleship_kids_profile_v1";
  var RANK_TIERS = [
    { minStars: 28, name: "Admiral" },
    { minStars: 16, name: "Commander" },
    { minStars: 8, name: "Captain" },
    { minStars: 3, name: "Ensign" },
    { minStars: 0, name: "Sailor" }
  ];
  function rankForStars(stars) {
    for (const tier of RANK_TIERS) {
      if (stars >= tier.minStars) {
        return tier.name;
      }
    }
    return "Sailor";
  }
  function defaultProfile() {
    return { wins: 0, games: 0, stars: 0, badges: [] };
  }
  var ProfileStore = class {
    constructor(persist = true) {
      this.data = persist ? this.load() : defaultProfile();
    }
    getStorage() {
      if (typeof window === "undefined") {
        return null;
      }
      try {
        return window.localStorage ?? null;
      } catch {
        return null;
      }
    }
    load() {
      const store = this.getStorage();
      if (!store) {
        return defaultProfile();
      }
      try {
        const raw = store.getItem(STORAGE_KEY);
        if (!raw) {
          return defaultProfile();
        }
        const parsed = JSON.parse(raw);
        return {
          wins: typeof parsed.wins === "number" ? Math.max(0, Math.floor(parsed.wins)) : 0,
          games: typeof parsed.games === "number" ? Math.max(0, Math.floor(parsed.games)) : 0,
          stars: typeof parsed.stars === "number" ? Math.max(0, Math.floor(parsed.stars)) : 0,
          badges: Array.isArray(parsed.badges) ? parsed.badges : []
        };
      } catch {
        return defaultProfile();
      }
    }
    save() {
      const store = this.getStorage();
      if (!store) {
        return;
      }
      try {
        store.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch {
      }
    }
    rankName() {
      return rankForStars(this.data.stars);
    }
    recordMatch(won, starsEarned, candidateBadges) {
      this.data.games += 1;
      if (won) {
        this.data.wins += 1;
        this.data.stars += Math.max(0, starsEarned);
      }
      const newlyUnlocked = [];
      for (const badge of candidateBadges) {
        if (!this.data.badges.includes(badge)) {
          this.data.badges.push(badge);
          newlyUnlocked.push(badge);
        }
      }
      this.save();
      return newlyUnlocked;
    }
  };

  // battleship/ts/ships.ts
  function drawOceanWaves(ctx, cell, row, col, clock) {
    const phase = clock * 2.2 + row * 0.9 + col * 0.7;
    const shift = Math.sin(phase) * 3;
    const y1 = cell.y + cell.height * 0.34;
    const y2 = cell.y + cell.height * 0.68;
    ctx.save?.();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = COLORS.WAVE;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cell.x + 8 + shift, y1);
    ctx.lineTo(cell.x + cell.width * 0.45 + shift, y1 - 2);
    ctx.lineTo(cell.x + cell.width - 10 + shift, y1);
    ctx.moveTo(cell.x + 12 - shift, y2);
    ctx.lineTo(cell.x + cell.width * 0.55 - shift, y2 + 2);
    ctx.lineTo(cell.x + cell.width - 8 - shift, y2);
    ctx.stroke();
    ctx.restore?.();
  }
  function drawShipHull(ctx, fleet, metrics, options) {
    if (fleet.coordinates.length === 0) {
      return;
    }
    const first = fleet.coordinates[0];
    const isHoriz = fleet.direction === "horizontal";
    const cs = metrics.cellSize;
    const pad = Math.max(4, Math.round(cs * 0.12));
    const x = metrics.originX + first[1] * cs + pad;
    const y = metrics.originY + first[0] * cs + pad;
    const w = (isHoriz ? fleet.size * cs : cs) - pad * 2;
    const h = (isHoriz ? cs : fleet.size * cs) - pad * 2;
    const hullPalette = {
      carrier: { main: "rgb(122, 152, 174)", trim: "rgb(218, 232, 242)", deck: "rgb(82, 108, 128)" },
      battleship: { main: "rgb(142, 168, 186)", trim: "rgb(255, 214, 92)", deck: "rgb(98, 122, 140)" },
      cruiser: { main: "rgb(120, 176, 196)", trim: "rgb(164, 238, 255)", deck: "rgb(78, 124, 146)" },
      submarine: { main: "rgb(76, 154, 158)", trim: "rgb(255, 214, 92)", deck: "rgb(52, 114, 120)" },
      destroyer: { main: "rgb(148, 184, 172)", trim: "rgb(236, 248, 242)", deck: "rgb(96, 132, 122)" }
    };
    const pal = hullPalette[fleet.name] ?? hullPalette.destroyer;
    const mainColor = options.sunk ? COLORS.SHIP_SUNK : pal.main;
    const deckColor = options.sunk ? "rgb(68, 36, 46)" : pal.deck;
    const trimColor = options.sunk ? "rgb(176, 112, 118)" : pal.trim;
    ctx.save?.();
    if (options.ghost) {
      ctx.globalAlpha = 0.52;
    } else if (options.sunk) {
      ctx.globalAlpha = 0.92;
    }
    ctx.fillStyle = mainColor;
    ctx.strokeStyle = options.selected ? COLORS.GOLD : trimColor;
    ctx.lineWidth = options.selected ? 3 : 2;
    ctx.beginPath();
    if (fleet.name === "submarine") {
      const r = Math.min(w, h) * 0.48;
      if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    } else if (isHoriz) {
      const bow = Math.min(cs * 0.42, w * 0.24);
      ctx.moveTo(x + 4, y + 2);
      ctx.lineTo(x + w - bow, y + 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w - bow, y + h - 2);
      ctx.lineTo(x + 4, y + h - 2);
      ctx.lineTo(x, y + h * 0.72);
      ctx.lineTo(x, y + h * 0.28);
      ctx.closePath?.();
    } else {
      const bow = Math.min(cs * 0.42, h * 0.24);
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w - 2, y + bow);
      ctx.lineTo(x + w - 2, y + h - 4);
      ctx.lineTo(x + w * 0.72, y + h);
      ctx.lineTo(x + w * 0.28, y + h);
      ctx.lineTo(x + 2, y + h - 4);
      ctx.lineTo(x + 2, y + bow);
      ctx.closePath?.();
    }
    ctx.fill();
    ctx.stroke();
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = deckColor;
    if (fleet.name === "carrier") {
      if (isHoriz) {
        ctx.fillRect(x + 8, y + 6, w - 24, h - 12);
        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 2;
        ctx.setLineDash?.([6, 6]);
        ctx.beginPath();
        ctx.moveTo(x + 12, cy);
        ctx.lineTo(x + w - 18, cy);
        ctx.stroke();
        ctx.setLineDash?.([]);
        ctx.fillStyle = trimColor;
        ctx.fillRect(x + w * 0.56, y + 4, Math.max(8, cs * 0.28), Math.max(6, h * 0.26));
      } else {
        ctx.fillRect(x + 6, y + 14, w - 12, h - 22);
        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 2;
        ctx.setLineDash?.([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, y + 18);
        ctx.lineTo(cx, y + h - 10);
        ctx.stroke();
        ctx.setLineDash?.([]);
        ctx.fillStyle = trimColor;
        ctx.fillRect(x + w - Math.max(10, w * 0.34), y + h * 0.48, Math.max(6, w * 0.26), Math.max(8, cs * 0.28));
      }
    } else if (fleet.name === "battleship") {
      const rTurret = Math.max(4, Math.round(Math.min(w, h) * 0.22));
      const positions = isHoriz ? [
        [x + w * 0.28, cy],
        [x + w * 0.68, cy]
      ] : [
        [cx, y + h * 0.32],
        [cx, y + h * 0.72]
      ];
      for (const [tx, ty] of positions) {
        ctx.fillStyle = deckColor;
        ctx.beginPath();
        ctx.arc(tx, ty, rTurret, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isHoriz) {
          ctx.moveTo(tx, ty - 2);
          ctx.lineTo(tx + rTurret + 6, ty - 2);
          ctx.moveTo(tx, ty + 2);
          ctx.lineTo(tx + rTurret + 6, ty + 2);
        } else {
          ctx.moveTo(tx - 2, ty);
          ctx.lineTo(tx - 2, ty - rTurret - 6);
          ctx.moveTo(tx + 2, ty);
          ctx.lineTo(tx + 2, ty - rTurret - 6);
        }
        ctx.stroke();
      }
    } else if (fleet.name === "submarine") {
      const rTower = Math.max(4, Math.round(Math.min(w, h) * 0.22));
      ctx.fillStyle = deckColor;
      ctx.beginPath();
      ctx.arc(cx, cy, rTower, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = trimColor;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, rTower * 0.45), 0, Math.PI * 2);
      ctx.fill();
    } else if (fleet.name === "cruiser") {
      const bw = isHoriz ? w * 0.36 : w * 0.5;
      const bh = isHoriz ? h * 0.5 : h * 0.36;
      ctx.fillStyle = deckColor;
      ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(3, Math.min(w, h) * 0.16), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const r = Math.max(3, Math.round(Math.min(w, h) * 0.18));
      ctx.fillStyle = deckColor;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = trimColor;
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }
    if (options.sunk) {
      ctx.strokeStyle = COLORS.BLUE;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const t = (options.clock * 0.8 + i * 0.33) % 1;
        const bx = x + w * (0.25 + i * 0.25);
        const by = y + h * 0.75 - t * Math.min(h, 24);
        ctx.globalAlpha = 0.65 * (1 - t);
        ctx.beginPath();
        ctx.arc(bx, by, 2.2 + i * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore?.();
  }
  function drawHitFlame(ctx, cell, clock) {
    const cx = cell.x + cell.width / 2;
    const cy = cell.y + cell.height / 2;
    const pulse = 1 + 0.14 * Math.sin(clock * 11 + cell.x * 0.1);
    const rOuter = Math.max(7, cell.width * 0.26) * pulse;
    const rInner = rOuter * 0.55;
    ctx.save?.();
    ctx.fillStyle = COLORS.CORAL;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, rOuter, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.GOLD;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgb(255, 246, 210)";
    ctx.lineWidth = 2.5;
    const pad = Math.round(cell.width * 0.28);
    ctx.beginPath();
    ctx.moveTo(cell.x + pad, cell.y + pad);
    ctx.lineTo(cell.x + cell.width - pad, cell.y + cell.height - pad);
    ctx.moveTo(cell.x + cell.width - pad, cell.y + pad);
    ctx.lineTo(cell.x + pad, cell.y + cell.height - pad);
    ctx.stroke();
    ctx.restore?.();
  }
  function drawMissSplash(ctx, cell) {
    const cx = cell.x + cell.width / 2;
    const cy = cell.y + cell.height / 2;
    const r = Math.max(5, Math.round(cell.width * 0.18));
    ctx.save?.();
    ctx.strokeStyle = COLORS.BLUE;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.INK;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2.5, r * 0.42), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore?.();
  }
  function drawCaptainPortrait(ctx, rect, captain) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2 + 4;
    const r = Math.min(rect.width, rect.height) * 0.34;
    const hatColor = captain.difficulty === "easy" ? COLORS.BLUE : captain.difficulty === "hard" ? COLORS.PURPLE : COLORS.GOLD;
    ctx.save?.();
    ctx.fillStyle = COLORS.CARD;
    ctx.strokeStyle = hatColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, rect.y + rect.height / 2, Math.min(rect.width, rect.height) * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgb(255, 224, 186)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hatColor;
    ctx.fillRect(cx - r * 0.95, cy - r * 1.15, r * 1.9, r * 0.5);
    ctx.fillStyle = COLORS.NAVY;
    ctx.fillRect(cx - r * 1.05, cy - r * 0.72, r * 2.1, r * 0.2);
    ctx.fillStyle = COLORS.NAVY;
    ctx.beginPath();
    ctx.arc(cx - r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.NAVY;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    if (captain.mood === "shocked") {
      ctx.arc(cx, cy + r * 0.36, r * 0.22, 0, Math.PI * 2);
    } else if (captain.mood === "defeated") {
      ctx.arc(cx, cy + r * 0.58, r * 0.3, Math.PI * 1.15, Math.PI * 1.85);
    } else {
      ctx.arc(cx, cy + r * 0.2, r * 0.32, Math.PI * 0.15, Math.PI * 0.85);
    }
    ctx.stroke();
    ctx.restore?.();
  }

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
      } else if (kind === "sonar") {
        this.tone(ctx, 1180, 1140, 0.36, "sine", 0.14, 0);
        this.tone(ctx, 1760, 1720, 0.22, "sine", 0.06, 0.08);
      } else if (kind === "bomb") {
        this.tone(ctx, 150, 28, 0.48, "sawtooth", 0.22, 0);
        this.noise(ctx, 0.45, 720, 0.24, 0);
        this.tone(ctx, 240, 50, 0.3, "square", 0.12, 0.12);
      } else if (kind === "combo") {
        this.tone(ctx, 587.33, 587.33, 0.1, "triangle", 0.13, 0);
        this.tone(ctx, 880, 880, 0.16, "triangle", 0.15, 0.08);
      } else if (kind === "place") {
        this.tone(ctx, 320, 440, 0.08, "triangle", 0.11, 0);
      } else if (kind === "rotate") {
        this.tone(ctx, 520, 680, 0.05, "sine", 0.08, 0);
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
      this.hoverPlayerCell = null;
      this.cursor = [0, 0];
      this.statusMessage = "";
      this.statusColor = COLORS.GREEN;
      this.clock = 0;
      this.projectiles = [];
      this.particles = [];
      this.ripples = [];
      this.popups = [];
      this.pendingEvents = [];
      this.pendingEnemyKeys = {};
      this.pendingPlayerKeys = {};
      this.shakeTime = 0;
      this.shakeDuration = 0.35;
      this.shakeIntensity = 0;
      this.weapon = "shot";
      this.placingMode = false;
      this.placingSide = 0;
      this.placingHandoffToP2 = false;
      this.selectedShipName = "carrier";
      this.placeDirection = "horizontal";
      this.summary = null;
      this.summaryRecorded = false;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("2D canvas context is required");
      }
      this.canvas = canvas;
      this.ctx = ctx;
      this.painter = new Painter(this.ctx);
      this.sound = new SoundEffects();
      this.profile = new ProfileStore(options.persistProfile !== false);
      this.baseSeed = options.seed;
      this.boardSize = options.boardSize === 10 ? 10 : 7;
      this.playMode = options.playMode === "2p" ? "2p" : "1p";
      this.difficulty = options.difficulty ?? "normal";
      this.ruleMode = options.ruleMode ?? "classic";
      this.helperMode = Boolean(options.helperMode);
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
      this.popups = [];
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
        seed: this.nextSeed(),
        playMode: this.playMode,
        difficulty: this.difficulty,
        ruleMode: this.ruleMode,
        helperMode: this.helperMode
      });
      this.cursor = [0, 0];
      this.hoverCell = null;
      this.hoverPlayerCell = null;
      this.weapon = "shot";
      this.selectedShipName = "carrier";
      this.placeDirection = "horizontal";
      this.placingHandoffToP2 = false;
      this.summary = null;
      this.summaryRecorded = false;
      if (this.playMode === "2p") {
        this.placingMode = true;
        this.placingSide = 0;
        this.statusMessage = "Player 1: Place your fleet or click Random, then tap Ready!";
        this.statusColor = COLORS.GOLD;
      } else {
        this.placingMode = false;
        this.placingSide = 0;
        this.statusMessage = "Your turn! Aim at Enemy Fleet (" + this.boardSize + "x" + this.boardSize + ").";
        this.statusColor = COLORS.GREEN;
      }
    }
    phase() {
      if (this.game.gameOver) {
        return "gameover";
      }
      if (this.placingHandoffToP2 || this.game.waitingHandoff) {
        return "handoff";
      }
      if (this.placingMode) {
        return "place";
      }
      return "battle";
    }
    handoffTitle() {
      if (this.placingHandoffToP2) {
        return "PASS TO PLAYER 2 TO PLACE SHIPS";
      }
      if (this.game.waitingHandoff) {
        const nextName = this.game.activePlayerIndex === 0 ? "PLAYER 2" : "PLAYER 1";
        return "PASS TO " + nextName;
      }
      return "";
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
    playerCellRect(row, col) {
      const m = this.gridMetrics(this.playerPanelRect());
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
    playerCellAtPoint(pt) {
      const m = this.gridMetrics(this.playerPanelRect());
      const col = Math.floor((pt[0] - m.originX) / m.cellSize);
      const row = Math.floor((pt[1] - m.originY) / m.cellSize);
      if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
        return [row, col];
      }
      return null;
    }
    isEnemyCellRevealed(row, col) {
      if (this.playMode === "1p") {
        return Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col];
      }
      return Boolean(this.game.activePlayer().hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col];
    }
    isPlayerCellRevealed(row, col) {
      const side = this.playMode === "1p" ? this.game.player : this.game.activePlayer();
      return side.wasHitAt(row, col) && !this.pendingPlayerKeys[row + "," + col];
    }
    addPopup(pos, text, color, size = 22) {
      this.popups.push({
        x: pos[0],
        y: pos[1] - 8,
        text,
        color,
        life: 1,
        maxLife: 1,
        size
      });
    }
    spawnImpact(center, kind) {
      const isHit = kind === "hit" || kind === "sunk";
      const ringColor = isHit ? kind === "sunk" ? COLORS.GOLD : COLORS.CORAL : COLORS.BLUE;
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: kind === "sunk" ? 0.55 : 0.4,
        maxLife: kind === "sunk" ? 0.55 : 0.4,
        maxRadius: kind === "sunk" ? 46 : 28,
        color: ringColor,
        lineWidth: kind === "sunk" ? 4 : 3
      });
      if (kind === "sunk") {
        this.ripples.push({
          x: center[0],
          y: center[1],
          life: 0.72,
          maxLife: 0.72,
          maxRadius: 64,
          color: COLORS.CORAL,
          lineWidth: 2
        });
      }
      const count = kind === "sunk" ? 22 : isHit ? 12 : 8;
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 2 * i / count + i % 2 * 0.2;
        const speed = (kind === "sunk" ? 135 : isHit ? 95 : 55) * (0.5 + i % 3 * 0.25);
        this.particles.push({
          x: center[0],
          y: center[1],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isHit ? 26 : 15),
          life: kind === "sunk" ? 0.68 : 0.45,
          maxLife: kind === "sunk" ? 0.68 : 0.45,
          color: isHit ? i % 2 === 0 ? COLORS.CORAL : COLORS.GOLD : COLORS.BLUE,
          size: kind === "sunk" ? 5 : 4
        });
      }
    }
    spawnSonarPulse(center) {
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: 0.75,
        maxLife: 0.75,
        maxRadius: 96,
        color: COLORS.SONAR,
        lineWidth: 4
      });
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: 0.5,
        maxLife: 0.5,
        maxRadius: 56,
        color: COLORS.GREEN,
        lineWidth: 2
      });
    }
    spawnVictoryConfetti() {
      const colors = [COLORS.GREEN, COLORS.GOLD, COLORS.BLUE, COLORS.CORAL, COLORS.PURPLE];
      const ep = this.enemyPanelRect();
      for (let i = 0; i < 40; i++) {
        const angle = -Math.PI + Math.PI * i / 40;
        const speed = 140 + i % 5 * 45;
        this.particles.push({
          x: ep.x + ep.width / 2,
          y: ep.y + 180,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.15,
          maxLife: 1.15,
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
    finalizeGameSummary() {
      if (this.summaryRecorded || !this.game.gameOver) {
        return;
      }
      this.summaryRecorded = true;
      const evalIdx = this.playMode === "1p" ? 0 : this.game.winner === this.game.players[1].name ? 1 : 0;
      const res = this.game.evaluateBadgesFor(evalIdx);
      const won = this.playMode === "1p" ? this.game.winner === "You" : true;
      const newBadges = this.profile.recordMatch(won, res.stars, res.badges);
      this.summary = this.game.buildSummary(
        this.profile.rankName(),
        this.profile.data.stars,
        newBadges
      );
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
      this.popups = [];
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
      const activePopups = [];
      for (const pop of this.popups) {
        pop.life -= dt;
        if (pop.life > 0) {
          pop.y -= 28 * dt;
          activePopups.push(pop);
        }
      }
      this.popups = activePopups;
      if (this.shakeTime > 0) {
        this.shakeTime = Math.max(0, this.shakeTime - dt);
      }
    }
    buttons() {
      const canReroll = this.game.shotsFired === 0 && !this.game.gameOver && !this.placingHandoffToP2;
      return [
        {
          rect: { x: 528, y: 14, width: 162, height: 42 },
          label: this.sound.muted ? "Sound: Off (M)" : "Sound: On (M)",
          action: "toggle_sound",
          disabled: false
        },
        {
          rect: { x: 702, y: 14, width: 164, height: 42 },
          label: "Re-roll (F)",
          action: "reroll",
          disabled: !canReroll
        },
        {
          rect: { x: 878, y: 14, width: 190, height: 42 },
          label: "Board: " + this.boardSize + "x" + this.boardSize + " (G)",
          action: "toggle_size",
          disabled: false
        },
        {
          rect: { x: 1080, y: 14, width: 166, height: 42 },
          label: "New Game (R)",
          action: "new_game",
          disabled: false
        }
      ];
    }
    modeButtons() {
      const canPlace = this.game.shotsFired === 0 && !this.game.gameOver && !this.placingHandoffToP2;
      return [
        {
          rect: { x: 34, y: 68, width: 126, height: 36 },
          label: this.playMode === "1p" ? "Mode: 1P" : "Mode: 2P",
          action: "toggle_mode",
          disabled: false,
          active: this.playMode === "2p"
        },
        {
          rect: { x: 170, y: 68, width: 152, height: 36 },
          label: "AI: " + DIFFICULTY_LABELS[this.difficulty],
          action: "cycle_ai",
          disabled: this.playMode === "2p"
        },
        {
          rect: { x: 332, y: 68, width: 166, height: 36 },
          label: "Rules: " + RULE_LABELS[this.ruleMode],
          action: "cycle_rules",
          disabled: false,
          active: this.ruleMode !== "classic"
        },
        {
          rect: { x: 508, y: 68, width: 148, height: 36 },
          label: this.helperMode ? "Helper: On" : "Helper: Off",
          action: "toggle_helper",
          disabled: false,
          active: this.helperMode
        },
        {
          rect: { x: 666, y: 68, width: 146, height: 36 },
          label: this.placingMode ? "Done Place" : "Place Ships",
          action: this.placingMode ? "finish_place" : "toggle_place",
          disabled: !canPlace,
          active: this.placingMode
        }
      ];
    }
    skillButtons() {
      const idx = this.game.activePlayerIndex;
      const inBattle = this.phase() === "battle";
      const sonarLeft = this.game.sonarLeft[idx];
      const bombLeft = this.game.bombLeft[idx];
      return [
        {
          rect: { x: 850, y: 68, width: 112, height: 36 },
          label: "Shot (1)",
          action: "select_shot",
          disabled: !inBattle,
          active: this.weapon === "shot",
          accent: COLORS.BLUE
        },
        {
          rect: { x: 972, y: 68, width: 132, height: 36 },
          label: "Sonar:" + sonarLeft + " (2)",
          action: "select_sonar",
          disabled: !inBattle || sonarLeft <= 0 || this.game.sonarUsedTurn[idx] === this.game.turnNumber,
          active: this.weapon === "sonar",
          accent: COLORS.SONAR
        },
        {
          rect: { x: 1114, y: 68, width: 132, height: 36 },
          label: "Bomb:" + bombLeft + " (3)",
          action: "select_bomb",
          disabled: !inBattle || bombLeft <= 0,
          active: this.weapon === "bomb",
          accent: COLORS.ORANGE
        }
      ];
    }
    placementDockRects() {
      const ep = this.enemyPanelRect();
      const shipCards = [];
      for (let i = 0; i < FLEET_NAMES.length; i++) {
        shipCards.push({
          name: FLEET_NAMES[i],
          rect: {
            x: ep.x + 28,
            y: ep.y + 84 + i * 62,
            width: ep.width - 56,
            height: 52
          }
        });
      }
      const btnY = ep.y + ep.height - 116;
      const halfW = Math.floor((ep.width - 70) / 2);
      return {
        shipCards,
        rotateBtn: {
          rect: { x: ep.x + 28, y: btnY, width: halfW, height: 42 },
          label: "Rotate: " + (this.placeDirection === "horizontal" ? "Horiz" : "Vert") + " (T)",
          action: "rotate_ship",
          disabled: false
        },
        randomBtn: {
          rect: { x: ep.x + 42 + halfW, y: btnY, width: halfW, height: 42 },
          label: "Random Fleet (F)",
          action: "reroll",
          disabled: false
        },
        readyBtn: {
          rect: { x: ep.x + 28, y: btnY + 52, width: ep.width - 56, height: 46 },
          label: this.playMode === "2p" && this.placingSide === 0 ? "Player 1 Ready -> Pass to P2" : "Start Battle!",
          action: "finish_place",
          disabled: false,
          active: true,
          accent: COLORS.GREEN
        }
      };
    }
    handoffButtonRect() {
      const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
      const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
      const w = Math.min(340, cw - 60);
      return {
        x: Math.round((cw - w) / 2),
        y: Math.round(ch / 2 + 24),
        width: w,
        height: 58
      };
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
        const ok = this.placingMode ? this.game.rerollSideFleet(this.placingSide) : this.game.rerollPlayerFleet();
        if (ok) {
          this.sound.play("click");
          this.statusMessage = "Re-rolled fleet positions.";
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
        return;
      }
      if (action === "toggle_mode") {
        this.playMode = this.playMode === "1p" ? "2p" : "1p";
        this.startNewGame(this.boardSize);
        this.sound.play("click");
        return;
      }
      if (action === "cycle_ai") {
        if (this.playMode === "2p") {
          return;
        }
        const order = ["easy", "normal", "hard"];
        this.difficulty = order[(order.indexOf(this.difficulty) + 1) % order.length];
        this.startNewGame(this.boardSize);
        this.sound.play("click");
        return;
      }
      if (action === "cycle_rules") {
        const order = ["classic", "streak", "salvo"];
        this.ruleMode = order[(order.indexOf(this.ruleMode) + 1) % order.length];
        this.startNewGame(this.boardSize);
        this.sound.play("click");
        return;
      }
      if (action === "toggle_helper") {
        this.helperMode = !this.helperMode;
        this.game.helperMode = this.helperMode;
        this.sound.play("click");
        this.statusMessage = this.helperMode ? "Helper On: Marks dead zones and gives hints after 4 misses." : "Helper Off.";
        this.statusColor = COLORS.BLUE;
        return;
      }
      if (action === "toggle_place") {
        if (this.game.shotsFired > 0 || this.game.gameOver) {
          this.statusMessage = "Fleet locked after battle starts.";
          this.statusColor = COLORS.MUTED;
          return;
        }
        this.placingMode = !this.placingMode;
        this.placingSide = 0;
        this.sound.play("click");
        this.statusMessage = this.placingMode ? "Click YOUR FLEET to place " + FLEET_LABELS[this.selectedShipName] + " (T or right-click to rotate)." : "Your turn! Aim at Enemy Fleet.";
        this.statusColor = this.placingMode ? COLORS.GOLD : COLORS.GREEN;
        return;
      }
      if (action === "rotate_ship") {
        this.placeDirection = this.placeDirection === "horizontal" ? "vertical" : "horizontal";
        this.sound.play("rotate");
        return;
      }
      if (action === "finish_place") {
        if (!this.placingMode) {
          return;
        }
        this.sound.play("click");
        if (this.playMode === "2p" && this.placingSide === 0) {
          this.placingHandoffToP2 = true;
          this.statusMessage = "Pass device to Player 2 to place ships.";
          this.statusColor = COLORS.GOLD;
        } else {
          this.placingMode = false;
          this.placingSide = 0;
          if (this.playMode === "2p") {
            this.game.activePlayerIndex = 1;
            this.game.waitingHandoff = true;
            this.statusMessage = "All ships placed! Pass to Player 1 to start battle.";
            this.statusColor = COLORS.GOLD;
          } else {
            this.statusMessage = "Fleet locked! Fire at Enemy Fleet!";
            this.statusColor = COLORS.GREEN;
          }
        }
        return;
      }
      if (action === "confirm_handoff") {
        this.sound.play("click");
        if (this.placingHandoffToP2) {
          this.placingHandoffToP2 = false;
          this.placingSide = 1;
          this.placingMode = true;
          this.statusMessage = "Player 2: Place your fleet or click Random, then Start Battle!";
          this.statusColor = COLORS.GOLD;
          return;
        }
        if (this.game.waitingHandoff) {
          this.flushVisualQueue();
          this.game.confirmHandoff();
          this.weapon = "shot";
          this.statusMessage = this.game.activePlayer().name + "'s turn! Fire at Enemy Fleet.";
          this.statusColor = COLORS.GREEN;
        }
        return;
      }
      if (action === "select_shot") {
        this.weapon = "shot";
        this.sound.play("click");
        this.statusMessage = "Standard Shot ready.";
        this.statusColor = COLORS.BLUE;
        return;
      }
      if (action === "select_sonar") {
        const idx = this.game.activePlayerIndex;
        if (this.game.sonarLeft[idx] <= 0 || this.game.sonarUsedTurn[idx] === this.game.turnNumber) {
          return;
        }
        this.weapon = "sonar";
        this.sound.play("click");
        this.statusMessage = "Sonar ready! Pick a center square to scan 3x3.";
        this.statusColor = COLORS.SONAR;
        return;
      }
      if (action === "select_bomb") {
        if (this.game.bombLeft[this.game.activePlayerIndex] <= 0) {
          return;
        }
        this.weapon = "bomb";
        this.sound.play("click");
        this.statusMessage = "Cross Bomb ready! Pick center square to blast + pattern.";
        this.statusColor = COLORS.ORANGE;
      }
    }
    useSonarAt(row, col) {
      const res = this.game.useSonar(row, col);
      if (!res.accepted) {
        if (res.reason === "no_charges") {
          this.statusMessage = "No Sonar charges left.";
        } else if (res.reason === "already_scanned_turn") {
          this.statusMessage = "Sonar already used this turn. Now fire a shot!";
        }
        this.statusColor = COLORS.GOLD;
        return res;
      }
      const center = this.enemyCellCenter(row, col);
      this.spawnSonarPulse(center);
      this.sound.play("sonar");
      const count = res.count ?? 0;
      this.addPopup(center, "SONAR: " + count, COLORS.SONAR, 24);
      this.weapon = "shot";
      this.statusMessage = "Sonar at " + res.coord + ": " + count + (count === 1 ? " hidden ship cell" : " hidden ship cells") + " in 3x3! Now fire!";
      this.statusColor = COLORS.SONAR;
      return res;
    }
    fireBombAt(row, col) {
      this.flushVisualQueue();
      const res = this.game.useCrossBomb(row, col);
      if (!res.accepted) {
        this.statusMessage = "Pick an untried target area for Cross Bomb.";
        this.statusColor = COLORS.GOLD;
        return res;
      }
      this.weapon = "shot";
      const cells = res.cells ?? [];
      for (const cell of cells) {
        this.pendingEnemyKeys[cell.row + "," + cell.col] = true;
      }
      const compShots = res.computerShots ?? [];
      for (const cs of compShots) {
        this.pendingPlayerKeys[cs.row + "," + cs.col] = true;
      }
      const pp = this.playerPanelRect();
      const launchCenter = [pp.x + pp.width / 2, pp.y + pp.height / 2];
      const targetCenter = this.enemyCellCenter(row, col);
      this.sound.play("launch");
      this.statusMessage = "Launching Cross Bomb at " + res.coord + "...";
      this.statusColor = COLORS.ORANGE;
      this.projectiles.push({
        from: launchCenter,
        to: targetCenter,
        elapsed: 0,
        duration: 0.28,
        color: COLORS.ORANGE,
        radius: 8,
        resolved: false,
        onImpact: (fastForward) => {
          let hitCount = 0;
          for (const cell of cells) {
            delete this.pendingEnemyKeys[cell.row + "," + cell.col];
            const pos = this.enemyCellCenter(cell.row, cell.col);
            const kind = cell.sunk ? "sunk" : cell.hit ? "hit" : "miss";
            if (cell.hit) {
              hitCount += 1;
            }
            if (!fastForward) {
              this.spawnImpact(pos, kind);
            }
          }
          if (!fastForward) {
            this.sound.play("bomb");
            this.triggerShake(10);
            this.addPopup(targetCenter, "BOMB x" + hitCount + "!", COLORS.ORANGE, 24);
          }
          if (res.gameOver) {
            this.finalizeGameSummary();
            this.statusMessage = "VICTORY! " + res.winner + " sank all enemy ships!";
            this.statusColor = COLORS.GREEN;
            if (!fastForward) {
              this.spawnVictoryConfetti();
              this.sound.play("win");
            }
          } else if (res.bonusTurn) {
            this.statusMessage = "Cross Bomb hit " + hitCount + "! Bonus shot earned!";
            this.statusColor = COLORS.GOLD;
            if (!fastForward) {
              this.sound.play("combo");
            }
          } else if (res.handoffRequired) {
            this.statusMessage = "Cross Bomb hit " + hitCount + "! Pass to next player.";
            this.statusColor = COLORS.GOLD;
          } else {
            this.statusMessage = "Cross Bomb hit " + hitCount + "! Incoming fire...";
            this.statusColor = COLORS.ORANGE;
          }
        }
      });
      this.scheduleComputerShots(res, 0.34);
      return res;
    }
    scheduleComputerShots(res, initialDelay) {
      const compShots = res.computerShots ?? (res.computerShot ? [res.computerShot] : []);
      if (compShots.length === 0) {
        return;
      }
      const ep = this.enemyPanelRect();
      const compOrigin = [ep.x + ep.width / 2, ep.y + ep.height / 2];
      compShots.forEach((comp, idx) => {
        const compKey = comp.row + "," + comp.col;
        const compTargetCenter = this.playerCellCenter(comp.row, comp.col);
        const isLast = idx === compShots.length - 1;
        this.pendingEvents.push({
          delay: initialDelay + idx * 0.28,
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
                    this.addPopup(compTargetCenter, "SUNK!", COLORS.CORAL, 22);
                  }
                }
                if (isLast && res.gameOver && res.winner === "Computer") {
                  this.finalizeGameSummary();
                  this.statusMessage = "DEFEAT! Computer sank all your ships.";
                  this.statusColor = COLORS.CORAL;
                  if (!ffImpact && !fastForward) {
                    this.sound.play("lose");
                  }
                } else if (isLast && !res.sunk && !res.hit) {
                  this.statusMessage = "Miss at " + res.coord + ". Your turn!";
                  this.statusColor = COLORS.BLUE;
                }
              }
            });
          }
        });
      });
    }
    fireAt(row, col) {
      if (this.phase() === "handoff" || this.phase() === "place") {
        return { accepted: false, reason: "not_ready" };
      }
      if (this.game.gameOver) {
        this.flushVisualQueue();
        this.finalizeGameSummary();
        this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
        this.statusColor = this.game.winner === "Computer" ? COLORS.CORAL : COLORS.GREEN;
        return { accepted: false, reason: "game_over" };
      }
      if (this.weapon === "sonar") {
        this.useSonarAt(row, col);
        return { accepted: false, reason: "not_ready" };
      }
      if (this.weapon === "bomb") {
        return this.fireBombAt(row, col);
      }
      const shooter = this.game.activePlayer();
      if (shooter.hasTried(row, col)) {
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
      const compShots = res.computerShots ?? (res.computerShot ? [res.computerShot] : []);
      for (const cs of compShots) {
        this.pendingPlayerKeys[cs.row + "," + cs.col] = true;
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
              this.addPopup(targetCenter, "SUNK!", COLORS.GOLD, 24);
            } else if (res.hit) {
              const st = res.streakCount ?? 1;
              const label = st >= 2 ? st + "x COMBO!" : "HIT!";
              this.addPopup(targetCenter, label, st >= 2 ? COLORS.GOLD : COLORS.CORAL, 22);
              if (st >= 2) {
                this.sound.play("combo");
              }
            }
          }
          if (res.gameOver && res.winner !== "Computer") {
            this.finalizeGameSummary();
            this.statusMessage = "VICTORY! " + res.winner + " sank all enemy ships!";
            this.statusColor = COLORS.GREEN;
            if (!fastForward) {
              this.spawnVictoryConfetti();
              this.sound.play("win");
            }
          } else if (res.bonusTurn && this.ruleMode === "salvo") {
            this.statusMessage = "Salvo! " + (res.salvoRemaining ?? 1) + " more shot(s) this turn.";
            this.statusColor = COLORS.GOLD;
          } else if (res.bonusTurn && this.ruleMode === "streak") {
            this.statusMessage = "Direct hit at " + res.coord + "! " + (res.streakCount ?? 1) + "x streak - Fire again!";
            this.statusColor = COLORS.GOLD;
          } else if (res.sunk) {
            this.statusMessage = "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
            this.statusColor = COLORS.GREEN;
          } else if (res.hit) {
            this.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
            this.statusColor = COLORS.GOLD;
          } else if (res.handoffRequired) {
            this.statusMessage = "Miss at " + res.coord + ". Pass to next player.";
            this.statusColor = COLORS.BLUE;
          } else {
            this.statusMessage = "Miss at " + res.coord + ". Incoming fire...";
            this.statusColor = COLORS.BLUE;
          }
        }
      });
      this.scheduleComputerShots(res, 0.28);
      return res;
    }
    placeSelectedShipAt(row, col) {
      const ok = this.game.placeShip(
        this.placingSide,
        this.selectedShipName,
        row,
        col,
        this.placeDirection
      );
      if (!ok) {
        this.statusMessage = "Cannot place " + FLEET_LABELS[this.selectedShipName] + " there.";
        this.statusColor = COLORS.CORAL;
        return false;
      }
      this.sound.play("place");
      const idx = FLEET_NAMES.indexOf(this.selectedShipName);
      this.selectedShipName = FLEET_NAMES[(idx + 1) % FLEET_NAMES.length];
      this.statusMessage = "Placed! Next: " + FLEET_LABELS[this.selectedShipName] + " (click board or press Battle).";
      this.statusColor = COLORS.GREEN;
      return true;
    }
    handlePointerMove(pt) {
      this.hover = pt;
      this.hoverCell = this.enemyCellAtPoint(pt);
      this.hoverPlayerCell = this.playerCellAtPoint(pt);
    }
    handleRightClick() {
      if (this.placingMode) {
        this.activate("rotate_ship");
      }
    }
    handlePointerDown(pt) {
      this.hover = pt;
      if (this.phase() === "handoff") {
        if (collidePoint(this.handoffButtonRect(), pt)) {
          this.activate("confirm_handoff");
        }
        return;
      }
      if (!this.mobileMode) {
        const allBtns = [...this.buttons(), ...this.modeButtons(), ...this.skillButtons()];
        for (const btn of allBtns) {
          if (!btn.disabled && collidePoint(btn.rect, pt)) {
            this.activate(btn.action);
            return;
          }
        }
      }
      if (this.placingMode) {
        const dock = this.placementDockRects();
        for (const card of dock.shipCards) {
          if (collidePoint(card.rect, pt)) {
            this.selectedShipName = card.name;
            this.sound.play("click");
            return;
          }
        }
        for (const btn of [dock.rotateBtn, dock.randomBtn, dock.readyBtn]) {
          if (collidePoint(btn.rect, pt)) {
            this.activate(btn.action);
            return;
          }
        }
        const pCell = this.playerCellAtPoint(pt);
        if (pCell) {
          this.placeSelectedShipAt(pCell[0], pCell[1]);
        }
        return;
      }
      if (this.playMode === "1p" && this.game.shotsFired === 0 && !this.game.gameOver) {
        const pCell = this.playerCellAtPoint(pt);
        if (pCell) {
          const clickedFleet = this.game.player.fleetGroup.findAt(pCell[0], pCell[1]);
          if (clickedFleet) {
            this.placingMode = true;
            this.placingSide = 0;
            this.selectedShipName = clickedFleet.name;
            this.placeDirection = clickedFleet.direction;
            this.sound.play("click");
            this.statusMessage = "Moving " + FLEET_LABELS[clickedFleet.name] + ". Click a new spot or press T to rotate.";
            this.statusColor = COLORS.GOLD;
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
      if (this.phase() === "handoff") {
        if (key === "Enter" || key === " ") {
          this.activate("confirm_handoff");
          return true;
        }
        return false;
      }
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
      if (key === "t" || key === "T") {
        if (this.placingMode) {
          this.activate("rotate_ship");
          return true;
        }
        return false;
      }
      if (key === "p" || key === "P") {
        this.activate(this.placingMode ? "finish_place" : "toggle_place");
        return true;
      }
      if (key === "1") {
        this.activate("select_shot");
        return true;
      }
      if (key === "2") {
        this.activate("select_sonar");
        return true;
      }
      if (key === "3") {
        this.activate("select_bomb");
        return true;
      }
      if (key === "h" || key === "H") {
        this.activate("toggle_helper");
        return true;
      }
      if (key === "Enter" || key === " ") {
        if (this.placingMode) {
          this.placeSelectedShipAt(this.cursor[0], this.cursor[1]);
        } else {
          this.fireAt(this.cursor[0], this.cursor[1]);
        }
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
    drawButton(btn, fontSize = 19) {
      const isHover = !btn.disabled && collidePoint(btn.rect, this.hover);
      const accent = btn.accent ?? COLORS.GREEN;
      const bg = btn.disabled ? "rgb(20, 48, 70)" : btn.active ? "rgb(36, 98, 128)" : isHover ? "rgb(44, 108, 146)" : COLORS.CARD;
      const border = btn.disabled ? "rgb(46, 82, 106)" : btn.active ? accent : isHover ? COLORS.GOLD : COLORS.BORDER;
      const textColor = btn.disabled ? COLORS.MUTED : btn.active ? accent : COLORS.INK;
      this.painter.panel(btn.rect, bg, 10);
      this.painter.strokeRoundRect(btn.rect, border, 2, 10);
      const textY = btn.rect.y + Math.max(6, Math.round((btn.rect.height - fontSize * 0.78) / 2));
      this.painter.text(
        btn.label,
        { x: btn.rect.x + 6, y: textY, width: btn.rect.width - 12, height: btn.rect.height - 8 },
        fontSize,
        textColor,
        "center",
        "700"
      );
    }
    drawPlacementDock() {
      const p = this.painter;
      const ep = this.enemyPanelRect();
      const dock = this.placementDockRects();
      p.panel(ep, COLORS.PANEL, 16);
      p.strokeRoundRect(ep, COLORS.GOLD, 2, 16);
      const sideName = this.game.players[this.placingSide].name;
      p.text(
        sideName.toUpperCase() + " SHIP DOCK",
        { x: ep.x + 24, y: ep.y + 16, width: ep.width - 48, height: 30 },
        24,
        COLORS.GOLD,
        "left",
        "700"
      );
      p.text(
        "Pick a ship, then click YOUR FLEET board to place it.",
        { x: ep.x + 24, y: ep.y + 48, width: ep.width - 48, height: 24 },
        18,
        COLORS.MUTED
      );
      for (const card of dock.shipCards) {
        const selected = card.name === this.selectedShipName;
        const bg = selected ? "rgb(38, 104, 142)" : COLORS.CARD;
        p.panel(card.rect, bg, 10);
        p.strokeRoundRect(card.rect, selected ? COLORS.GOLD : COLORS.BORDER, 2, 10);
        const size = FLEET_SIZES[card.name];
        p.text(
          FLEET_LABELS[card.name] + " (" + size + " cells)",
          { x: card.rect.x + 14, y: card.rect.y + 14, width: 250, height: 26 },
          20,
          selected ? COLORS.GOLD : COLORS.INK,
          "left",
          "700"
        );
        for (let i = 0; i < size; i++) {
          this.ctx.fillStyle = selected ? COLORS.GOLD : COLORS.BLUE;
          this.ctx.fillRect(card.rect.x + card.rect.width - 26 - i * 18, card.rect.y + 18, 13, 15);
        }
      }
      this.drawButton(dock.rotateBtn, 18);
      this.drawButton(dock.randomBtn, 18);
      this.drawButton(dock.readyBtn, 20);
    }
    drawBoard(panel, title, subtitle, isPlayer) {
      const p = this.painter;
      const ctx = this.ctx;
      p.panel(panel, COLORS.PANEL, 16);
      p.strokeRoundRect(panel, COLORS.BORDER, 2, 16);
      p.text(
        title,
        { x: panel.x + 22, y: panel.y + 14, width: 230, height: 30 },
        25,
        isPlayer ? COLORS.BLUE : COLORS.GOLD,
        "left",
        "700"
      );
      p.text(
        subtitle,
        { x: panel.x + 220, y: panel.y + 17, width: panel.width - 242, height: 26 },
        19,
        COLORS.MUTED,
        "right"
      );
      const m = this.gridMetrics(panel);
      const n = this.boardSize;
      const viewSide = this.placingMode ? this.game.players[this.placingSide] : this.playMode === "1p" ? this.game.player : this.game.activePlayer();
      const targetSide = this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();
      const helperDead = !isPlayer && this.helperMode ? this.game.impossibleEnemyCells() : null;
      const hint = !isPlayer && this.helperMode ? this.game.helperHint() : null;
      for (let i = 0; i < n; i++) {
        const colHi = hint && hint.axis === "col" && hint.index === i;
        const rowHi = hint && hint.axis === "row" && hint.index === i;
        p.text(
          String(i + 1),
          { x: m.originX + i * m.cellSize, y: m.originY - 24, width: m.cellSize, height: 22 },
          19,
          colHi ? COLORS.GOLD : COLORS.MUTED,
          "center",
          colHi ? "800" : "600"
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
          rowHi ? COLORS.GOLD : COLORS.MUTED,
          "center",
          rowHi ? "800" : "600"
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
          let fill = (r + c) % 2 === 0 ? COLORS.OCEAN : COLORS.OCEAN_ALT;
          if (!isPlayer) {
            const rec = this.isEnemyCellRevealed(r, c) ? viewSide.hitRecordAt(r, c) : null;
            const isHover = this.hoverCell && this.hoverCell[0] === r && this.hoverCell[1] === c;
            if (rec && !rec[2]) {
              fill = COLORS.OCEAN_MISS;
            } else if (isHover && !this.game.gameOver) {
              fill = COLORS.OCEAN_HOVER;
            }
          }
          ctx.fillStyle = fill;
          ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
          drawOceanWaves(ctx, cell, r, c, this.clock);
          ctx.strokeStyle = "rgb(48, 122, 168)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
          if (helperDead && helperDead.has(r + "," + c)) {
            ctx.save?.();
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = COLORS.MUTED;
            ctx.beginPath();
            ctx.arc(cell.x + cell.width / 2, cell.y + cell.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore?.();
          }
        }
      }
      if (isPlayer) {
        for (const fl of viewSide.fleetGroup.fleets) {
          const revHits = this.revealedHitCount(fl, true);
          drawShipHull(ctx, fl, m, {
            sunk: revHits === fl.size,
            selected: this.placingMode && fl.name === this.selectedShipName,
            clock: this.clock
          });
        }
        if (this.placingMode) {
          const anchor = this.hoverPlayerCell ?? this.cursor;
          const size = FLEET_SIZES[this.selectedShipName];
          const valid = this.game.canPlaceShip(
            this.placingSide,
            this.selectedShipName,
            anchor[0],
            anchor[1],
            this.placeDirection
          );
          ctx.save?.();
          ctx.globalAlpha = 0.48;
          ctx.fillStyle = valid ? COLORS.GREEN : COLORS.CORAL;
          for (let k = 0; k < size; k++) {
            const rr = this.placeDirection === "vertical" ? anchor[0] + k : anchor[0];
            const cc = this.placeDirection === "horizontal" ? anchor[1] + k : anchor[1];
            if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
              ctx.fillRect(m.originX + cc * m.cellSize + 3, m.originY + rr * m.cellSize + 3, m.cellSize - 6, m.cellSize - 6);
            }
          }
          ctx.restore?.();
        }
      } else {
        for (const fl of targetSide.fleetGroup.fleets) {
          const revHits = this.revealedHitCount(fl, false);
          const isSunk = revHits === fl.size;
          if (isSunk) {
            drawShipHull(ctx, fl, m, { sunk: true, clock: this.clock });
          } else if (this.game.gameOver) {
            drawShipHull(ctx, fl, m, { sunk: false, ghost: true, clock: this.clock });
          }
        }
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const cell = {
            x: m.originX + c * m.cellSize,
            y: m.originY + r * m.cellSize,
            width: m.cellSize,
            height: m.cellSize
          };
          if (isPlayer) {
            if (this.isPlayerCellRevealed(r, c)) {
              const myFleet = viewSide.fleetGroup.findAt(r, c);
              if (myFleet && myFleet.hasHit(r, c)) {
                drawHitFlame(ctx, cell, this.clock);
              } else {
                drawMissSplash(ctx, cell);
              }
            }
          } else {
            const rec = this.isEnemyCellRevealed(r, c) ? viewSide.hitRecordAt(r, c) : null;
            if (rec) {
              if (rec[2]) {
                drawHitFlame(ctx, cell, this.clock);
              } else {
                drawMissSplash(ctx, cell);
              }
            }
          }
        }
      }
      if (!isPlayer) {
        const scans = this.game.sonarScans[this.game.activePlayerIndex];
        for (const scan of scans) {
          const cx = m.originX + (scan.col + 0.5) * m.cellSize;
          const cy = m.originY + (scan.row + 0.5) * m.cellSize;
          ctx.save?.();
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = COLORS.SONAR;
          ctx.lineWidth = 2;
          const r0 = Math.max(0, scan.row - 1);
          const c0 = Math.max(0, scan.col - 1);
          const r1 = Math.min(n - 1, scan.row + 1);
          const c1 = Math.min(n - 1, scan.col + 1);
          ctx.strokeRect(
            m.originX + c0 * m.cellSize + 2,
            m.originY + r0 * m.cellSize + 2,
            (c1 - c0 + 1) * m.cellSize - 4,
            (r1 - r0 + 1) * m.cellSize - 4
          );
          ctx.globalAlpha = 0.88;
          ctx.fillStyle = "rgb(14, 64, 58)";
          ctx.beginPath();
          ctx.arc(cx, cy, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = COLORS.SONAR;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore?.();
          p.text(
            String(scan.count),
            { x: cx - 12, y: cy - 9, width: 24, height: 20 },
            18,
            COLORS.SONAR,
            "center",
            "800"
          );
        }
        if (!this.game.gameOver) {
          const aim = this.hoverCell ?? this.cursor;
          if (this.weapon === "sonar") {
            ctx.save?.();
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = COLORS.SONAR;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const rr = aim[0] + dr;
                const cc = aim[1] + dc;
                if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
                  ctx.fillRect(m.originX + cc * m.cellSize + 2, m.originY + rr * m.cellSize + 2, m.cellSize - 4, m.cellSize - 4);
                }
              }
            }
            ctx.restore?.();
          } else if (this.weapon === "bomb") {
            ctx.save?.();
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = COLORS.ORANGE;
            const dirs = [
              [0, 0],
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1]
            ];
            for (const [dr, dc] of dirs) {
              const rr = aim[0] + dr;
              const cc = aim[1] + dc;
              if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
                ctx.fillRect(m.originX + cc * m.cellSize + 2, m.originY + rr * m.cellSize + 2, m.cellSize - 4, m.cellSize - 4);
              }
            }
            ctx.restore?.();
          }
          const curRect = {
            x: m.originX + this.cursor[1] * m.cellSize,
            y: m.originY + this.cursor[0] * m.cellSize,
            width: m.cellSize,
            height: m.cellSize
          };
          ctx.strokeStyle = this.weapon === "sonar" ? COLORS.SONAR : this.weapon === "bomb" ? COLORS.ORANGE : COLORS.GOLD;
          ctx.lineWidth = 2.5 + 1.1 * Math.sin(this.clock * 6);
          ctx.strokeRect(curRect.x + 2, curRect.y + 2, curRect.width - 4, curRect.height - 4);
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
      const viewSide = this.placingMode ? this.game.players[this.placingSide] : this.playMode === "1p" ? this.game.player : this.game.activePlayer();
      const targetSide = this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();
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
      const toMobileBtns = (list) => list.map((b) => ({
        label: b.label.replace(/ \([A-Z0-9]\)$/, ""),
        action: b.action,
        disabled: b.disabled,
        active: b.active
      }));
      return {
        statusMessage: this.statusMessage,
        statusColor: this.statusColor,
        boardSize: this.boardSize,
        shotsFired: this.game.shotsFired,
        gameOver: this.game.gameOver,
        winner: this.game.winner,
        phase: this.phase(),
        playMode: this.playMode,
        activePlayerName: this.game.activePlayer().name,
        handoffTitle: this.handoffTitle(),
        difficulty: this.difficulty,
        ruleMode: this.ruleMode,
        helperMode: this.helperMode,
        weapon: this.weapon,
        sonarLeft: this.game.sonarLeft[this.game.activePlayerIndex],
        bombLeft: this.game.bombLeft[this.game.activePlayerIndex],
        captain: this.game.captainInfo(),
        rankName: this.profile.rankName(),
        totalStars: this.profile.data.stars,
        badgeCount: this.profile.data.badges.length,
        summary: this.summary,
        buttons: toMobileBtns(this.buttons()),
        modeButtons: toMobileBtns(this.modeButtons()),
        skillButtons: toMobileBtns(this.skillButtons()),
        playerFleets: mapFleets(viewSide.fleetGroup.fleets, true),
        enemyFleets: mapFleets(targetSide.fleetGroup.fleets, false),
        logs: this.game.logs.slice(0, 5)
      };
    }
    drawRoster() {
      const p = this.painter;
      const ctx = this.ctx;
      p.panel(ROSTER_PANEL, COLORS.PANEL, 16);
      p.strokeRoundRect(ROSTER_PANEL, COLORS.BORDER, 2, 16);
      const viewSide = this.placingMode ? this.game.players[this.placingSide] : this.playMode === "1p" ? this.game.player : this.game.activePlayer();
      const targetSide = this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();
      p.text(
        viewSide.name.toUpperCase() + " SHIPS",
        { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
        20,
        COLORS.BLUE,
        "left",
        "700"
      );
      p.text(
        targetSide.name.toUpperCase() + " SHIPS",
        { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
        20,
        COLORS.GOLD,
        "left",
        "700"
      );
      const drawCol = (fleets, startX, isPlayerSide) => {
        for (let i = 0; i < fleets.length; i++) {
          const f = fleets[i];
          const y = ROSTER_PANEL.y + 42 + i * 28;
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
      drawCol(viewSide.fleetGroup.fleets, ROSTER_PANEL.x + 20, true);
      drawCol(targetSide.fleetGroup.fleets, ROSTER_PANEL.x + 310, false);
    }
    drawBattleLog() {
      const p = this.painter;
      p.panel(LOG_PANEL, COLORS.PANEL, 16);
      const borderColor = this.game.gameOver ? this.game.winner === "Computer" ? COLORS.CORAL : COLORS.GREEN : COLORS.BORDER;
      p.strokeRoundRect(LOG_PANEL, borderColor, 2, 16);
      const cap = this.game.captainInfo();
      const contentX = cap ? LOG_PANEL.x + 96 : LOG_PANEL.x + 20;
      const contentW = cap ? LOG_PANEL.width - 116 : LOG_PANEL.width - 40;
      if (cap) {
        drawCaptainPortrait(
          this.ctx,
          { x: LOG_PANEL.x + 14, y: LOG_PANEL.y + 16, width: 70, height: 70 },
          cap
        );
        p.text(
          cap.name,
          { x: LOG_PANEL.x + 8, y: LOG_PANEL.y + 92, width: 84, height: 34 },
          15,
          COLORS.GOLD,
          "center",
          "700"
        );
        p.text(
          '"' + cap.line + '"',
          { x: contentX, y: LOG_PANEL.y + 12, width: contentW, height: 26 },
          19,
          COLORS.BLUE,
          "left",
          "700"
        );
      }
      if (this.game.gameOver && this.summary) {
        const s = this.summary;
        const starText = s.stars > 0 ? "Stars: " + "*".repeat(s.stars) : "Keep trying!";
        p.text(
          s.winner + " Wins! " + starText + " | Acc: " + s.accuracy + "%",
          { x: contentX, y: LOG_PANEL.y + (cap ? 42 : 16), width: contentW, height: 30 },
          21,
          s.playerWon ? COLORS.GREEN : COLORS.CORAL,
          "left",
          "700"
        );
        const badgeLine = s.newBadges.length > 0 ? "New Badges: " + s.newBadges.map((b) => BADGE_LABELS[b]).join(", ") : "Rank: " + s.rankName + " (" + s.totalStars + " stars) | Best Streak: " + s.bestStreak;
        p.text(
          badgeLine,
          { x: contentX, y: LOG_PANEL.y + (cap ? 76 : 54), width: contentW, height: 48 },
          18,
          COLORS.GOLD
        );
        p.text(
          "Enemy ships revealed above! Press R or New Game to play again.",
          { x: contentX, y: LOG_PANEL.y + 158, width: contentW, height: 24 },
          17,
          COLORS.MUTED
        );
        return;
      }
      p.text(
        this.statusMessage,
        { x: contentX, y: LOG_PANEL.y + (cap ? 40 : 14), width: contentW, height: 32 },
        21,
        this.statusColor,
        "left",
        "700"
      );
      const hint = this.game.helperHint();
      const logLines = this.game.logs.slice(0, hint ? 2 : 3).join("\n");
      p.text(
        logLines,
        { x: contentX, y: LOG_PANEL.y + (cap ? 74 : 52), width: contentW, height: 82 },
        18,
        COLORS.MUTED
      );
      const footer = hint ? hint.label + " | Shots: " + this.game.shotsFired : "Target: " + encodeLoc(this.cursor[0], this.cursor[1]) + " | Shots: " + this.game.shotsFired + " | Keys: 1/2/3 Weapons, P Place";
      p.text(
        footer,
        { x: contentX, y: LOG_PANEL.y + 162, width: contentW, height: 24 },
        17,
        COLORS.GOLD
      );
    }
    drawHandoffOverlay() {
      const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
      const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
      const ctx = this.ctx;
      ctx.save?.();
      ctx.fillStyle = "rgba(10, 32, 54, 0.94)";
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore?.();
      const cardW = Math.min(540, cw - 40);
      const card = {
        x: Math.round((cw - cardW) / 2),
        y: Math.round(ch / 2 - 120),
        width: cardW,
        height: 230
      };
      this.painter.panel(card, COLORS.PANEL, 20);
      this.painter.strokeRoundRect(card, COLORS.GOLD, 3, 20);
      this.painter.text(
        this.handoffTitle(),
        { x: card.x + 20, y: card.y + 34, width: card.width - 40, height: 40 },
        28,
        COLORS.GOLD,
        "center",
        "800"
      );
      this.painter.text(
        "Keep your ships secret! Tap Ready or press Space when ready.",
        { x: card.x + 24, y: card.y + 84, width: card.width - 48, height: 42 },
        19,
        COLORS.MUTED,
        "center"
      );
      this.drawButton(
        {
          rect: this.handoffButtonRect(),
          label: "I'M READY! (Space)",
          action: "confirm_handoff",
          disabled: false,
          active: true,
          accent: COLORS.GREEN
        },
        22
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
        ctx.lineWidth = p.radius ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = COLORS.INK;
        ctx.beginPath();
        ctx.arc(px, py, p.radius ?? 6, 0, Math.PI * 2);
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
      for (const pop of this.popups) {
        ctx.save?.();
        ctx.globalAlpha = Math.max(0, Math.min(1, pop.life / pop.maxLife));
        this.painter.text(
          pop.text,
          { x: pop.x - 80, y: pop.y - 14, width: 160, height: 30 },
          pop.size,
          pop.color,
          "center",
          "800"
        );
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
        if (this.placingMode) {
          this.drawPlacementDock();
          this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Tap grid to place ship", true);
        } else {
          this.drawBoard(this.enemyPanelRect(), "ENEMY FLEET", "Tap a square to fire", false);
          this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Ships & incoming hits", true);
        }
        this.drawEffects();
      } else {
        this.painter.text(
          "BATTLESHIP",
          { x: 34, y: 12, width: 220, height: 38 },
          38,
          COLORS.GREEN,
          "left",
          "800"
        );
        const rankBadge = "Rank: " + this.profile.rankName() + " | Stars: " + this.profile.data.stars + " | Badges: " + this.profile.data.badges.length;
        this.painter.text(
          rankBadge,
          { x: 256, y: 22, width: 266, height: 24 },
          18,
          COLORS.GOLD,
          "left",
          "700"
        );
        for (const btn of this.buttons()) {
          this.drawButton(btn, 19);
        }
        for (const btn of this.modeButtons()) {
          this.drawButton(btn, 17);
        }
        for (const btn of this.skillButtons()) {
          this.drawButton(btn, 17);
        }
        const viewTitle = this.placingMode ? this.game.players[this.placingSide].name.toUpperCase() + " FLEET" : this.playMode === "2p" ? this.game.activePlayer().name.toUpperCase() + " FLEET" : "YOUR FLEET";
        this.drawBoard(
          PLAYER_PANEL,
          viewTitle,
          this.placingMode ? "Click cell to place (T rotate)" : "Click ship before battle to move",
          true
        );
        if (this.placingMode) {
          this.drawPlacementDock();
        } else {
          const enemyTitle = this.playMode === "2p" ? this.game.opponentPlayer().name.toUpperCase() + " WATERS" : "ENEMY FLEET";
          this.drawBoard(
            ENEMY_PANEL,
            enemyTitle,
            "Target: " + encodeLoc(this.cursor[0], this.cursor[1]),
            false
          );
        }
        this.drawRoster();
        this.drawBattleLog();
        this.drawEffects();
      }
      if (this.phase() === "handoff") {
        this.drawHandoffOverlay();
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
    const mobileModes = document.getElementById("mobile-modes");
    const mobileSkills = document.getElementById("mobile-skills");
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
    const renderBtnGroup = (container, list) => {
      if (!container) {
        return;
      }
      container.innerHTML = "";
      for (const b of list) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mobile-btn" + (b.active ? " active" : "");
        btn.textContent = b.label;
        btn.disabled = b.disabled;
        btn.addEventListener("click", () => {
          app.activate(b.action);
          app.draw();
          syncMobileDom();
        });
        container.appendChild(btn);
      }
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
        const capText = st.captain ? " | " + st.captain.name + ': "' + st.captain.line + '"' : "";
        mobileStatusSub.textContent = "Rank: " + st.rankName + " (" + st.totalStars + "*) | " + st.boardSize + "x" + st.boardSize + " | Shots: " + st.shotsFired + capText;
      }
      renderBtnGroup(mobileButtons, st.buttons);
      renderBtnGroup(mobileModes, st.modeButtons);
      renderBtnGroup(mobileSkills, st.skillButtons);
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
      if (evt.button === 2) {
        app.handleRightClick();
        syncMobileDom();
        return;
      }
      app.handlePointerDown(logicalFromEvent(evt));
      syncMobileDom();
    });
    canvasEl.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
      app.handleRightClick();
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
