(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BattleshipWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var WIDTH = 1280;
  var HEIGHT = 880;
  var MOBILE_WIDTH = 560;
  var MOBILE_HEIGHT = 1120;
  var INK = "rgb(231, 241, 244)";
  var MUTED = "rgb(157, 181, 190)";
  var NAVY = "rgb(14, 29, 40)";
  var PANEL = "rgb(24, 44, 57)";
  var CARD = "rgb(34, 59, 73)";
  var BORDER = "rgb(67, 95, 107)";
  var OCEAN = "rgb(18, 46, 66)";
  var OCEAN_HOVER = "rgb(33, 74, 102)";
  var SHIP_FILL = "rgb(112, 138, 152)";
  var SHIP_SUNK = "rgb(92, 54, 62)";
  var GREEN = "rgb(159, 235, 164)";
  var GOLD = "rgb(255, 207, 107)";
  var CORAL = "rgb(249, 143, 121)";
  var BLUE = "rgb(96, 190, 247)";

  var FLEET_NAMES = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
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

  function makeRng(seed) {
    var state = (seed >>> 0) + 0x6d2b79f5;
    return {
      next: function () {
        state = (state + 0x6d2b79f5) >>> 0;
        var t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      randInt: function (min, maxInclusive) {
        return min + Math.floor(this.next() * (maxInclusive - min + 1));
      },
      choice: function (items) {
        return items[Math.floor(this.next() * items.length)];
      }
    };
  }

  function encodeLoc(row, col) {
    return String.fromCharCode(65 + row) + String(col + 1);
  }

  function orthogonalNeighbors(row, col, boardSize) {
    var dirs = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
    var result = [];
    for (var i = 0; i < dirs.length; i++) {
      var nr = dirs[i][0];
      var nc = dirs[i][1];
      if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
        result.push([nr, nc]);
      }
    }
    return result;
  }

  function Fleet(x, y, size, direction, name) {
    this.coordinates = [];
    this.name = name;
    this.size = size;
    this.direction = direction;
    this.hits = [];
    for (var i = 0; i < size; i++) {
      if (direction === "vertical") {
        this.coordinates.push([x + i, y]);
      } else {
        this.coordinates.push([x, y + i]);
      }
    }
  }

  Fleet.prototype.hasCoord = function (x, y) {
    for (var i = 0; i < this.coordinates.length; i++) {
      if (this.coordinates[i][0] === x && this.coordinates[i][1] === y) {
        return true;
      }
    }
    return false;
  };

  Fleet.prototype.hasHit = function (x, y) {
    for (var i = 0; i < this.hits.length; i++) {
      if (this.hits[i][0] === x && this.hits[i][1] === y) {
        return true;
      }
    }
    return false;
  };

  Fleet.prototype.hit = function (x, y) {
    if (this.hasCoord(x, y) && !this.hasHit(x, y)) {
      this.hits.push([x, y]);
      return true;
    }
    return false;
  };

  Fleet.prototype.isSunk = function () {
    return this.hits.length === this.size;
  };

  function FleetGroup() {
    this.fleets = [];
  }

  FleetGroup.prototype.add = function (fleet) {
    this.fleets.push(fleet);
  };

  FleetGroup.prototype.findAt = function (x, y) {
    for (var i = 0; i < this.fleets.length; i++) {
      if (this.fleets[i].hasCoord(x, y)) {
        return this.fleets[i];
      }
    }
    return null;
  };

  FleetGroup.prototype.hit = function (x, y) {
    for (var i = 0; i < this.fleets.length; i++) {
      if (this.fleets[i].hit(x, y)) {
        return this.fleets[i].name;
      }
    }
    return null;
  };

  FleetGroup.prototype.allSunk = function () {
    for (var i = 0; i < this.fleets.length; i++) {
      if (!this.fleets[i].isSunk()) {
        return false;
      }
    }
    return this.fleets.length > 0;
  };

  function Player(name, boardSize) {
    this.name = name;
    this.boardSize = boardSize || 7;
    this.fleetGroup = new FleetGroup();
    this.hitHistory = [];
    this.wasHitHistory = [];
  }

  Player.prototype.hasTried = function (x, y) {
    for (var i = 0; i < this.hitHistory.length; i++) {
      if (this.hitHistory[i][0] === x && this.hitHistory[i][1] === y) {
        return true;
      }
    }
    return false;
  };

  Player.prototype.hitRecordAt = function (x, y) {
    for (var i = 0; i < this.hitHistory.length; i++) {
      if (this.hitHistory[i][0] === x && this.hitHistory[i][1] === y) {
        return this.hitHistory[i];
      }
    }
    return null;
  };

  Player.prototype.wasHitAt = function (x, y) {
    for (var i = 0; i < this.wasHitHistory.length; i++) {
      if (this.wasHitHistory[i][0] === x && this.wasHitHistory[i][1] === y) {
        return true;
      }
    }
    return false;
  };

  Player.prototype.randomInit = function (fleetNames, rng) {
    var names = fleetNames || FLEET_NAMES;
    var gen = rng || makeRng(Date.now());
    var n = this.boardSize;

    for (var layoutTry = 0; layoutTry < 50; layoutTry++) {
      var board = [];
      for (var r = 0; r < n; r++) {
        board.push(new Array(n).fill(0));
      }
      var group = new FleetGroup();
      var failed = false;

      for (var idx = 0; idx < names.length; idx++) {
        var fname = names[idx];
        var size = FLEET_SIZES[fname];
        var placed = false;

        for (var attempt = 0; attempt < 250; attempt++) {
          var direction = gen.choice(["vertical", "horizontal"]);
          var x = direction === "vertical" ? gen.randInt(0, n - size) : gen.randInt(0, n - 1);
          var y = direction === "horizontal" ? gen.randInt(0, n - size) : gen.randInt(0, n - 1);
          var clear = true;
          for (var step = 0; step < size; step++) {
            var cx = direction === "vertical" ? x + step : x;
            var cy = direction === "horizontal" ? y + step : y;
            if (board[cx][cy] !== 0) {
              clear = false;
              break;
            }
          }
          if (clear) {
            for (var mark = 0; mark < size; mark++) {
              var mx = direction === "vertical" ? x + mark : x;
              var my = direction === "horizontal" ? y + mark : y;
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
  };

  Player.prototype.hit = function (targetPlayer, x, y) {
    targetPlayer.wasHitHistory.push([x, y]);
    var result = targetPlayer.fleetGroup.hit(x, y);
    this.hitHistory.push([x, y, result !== null]);
    return result;
  };

  Player.prototype.allSunk = function () {
    return this.fleetGroup.allSunk();
  };

  function ComputerPlayer(name, boardSize) {
    Player.call(this, name, boardSize);
  }
  ComputerPlayer.prototype = Object.create(Player.prototype);
  ComputerPlayer.prototype.constructor = ComputerPlayer;

  ComputerPlayer.prototype._randomShot = function (boardSize, rng) {
    var possible = [];
    var priority = [];
    for (var x = 0; x < boardSize; x++) {
      for (var y = 0; y < boardSize; y++) {
        if (!this.hasTried(x, y)) {
          possible.push([x, y]);
          if ((x + y) % 2 === 0) {
            priority.push([x, y]);
          }
        }
      }
    }
    var pool = priority.length > 0 ? priority : possible;
    return rng.choice(pool);
  };

  ComputerPlayer.prototype.chooseNextShot = function (opponent, rng) {
    var n = this.boardSize;
    var gen = rng || makeRng(Date.now());
    var hitsInProgress = [];

    for (var i = 0; i < this.hitHistory.length; i++) {
      var rec = this.hitHistory[i];
      if (!rec[2]) {
        continue;
      }
      var hx = rec[0];
      var hy = rec[1];
      var isSunk = false;
      for (var f = 0; f < opponent.fleetGroup.fleets.length; f++) {
        var fl = opponent.fleetGroup.fleets[f];
        if (fl.isSunk() && fl.hasCoord(hx, hy)) {
          isSunk = true;
          break;
        }
      }
      if (!isSunk) {
        hitsInProgress.push([hx, hy]);
      }
    }

    if (hitsInProgress.length > 0) {
      var candidates = [];
      if (hitsInProgress.length > 1) {
        var points = hitsInProgress.slice().sort(function (a, b) {
          return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
        });
        if (points[0][0] === points[1][0]) {
          var row = points[0][0];
          var minCol = points[0][1];
          var maxCol = points[0][1];
          for (var p = 1; p < points.length; p++) {
            if (points[p][0] === row) {
              minCol = Math.min(minCol, points[p][1]);
              maxCol = Math.max(maxCol, points[p][1]);
            }
          }
          if (minCol - 1 >= 0) {
            candidates.push([row, minCol - 1]);
          }
          if (maxCol + 1 < n) {
            candidates.push([row, maxCol + 1]);
          }
        } else {
          var col = points[0][1];
          var minRow = points[0][0];
          var maxRow = points[0][0];
          for (var q = 1; q < points.length; q++) {
            if (points[q][1] === col) {
              minRow = Math.min(minRow, points[q][0]);
              maxRow = Math.max(maxRow, points[q][0]);
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

      var self = this;
      candidates = candidates.filter(function (pt) {
        return !self.hasTried(pt[0], pt[1]);
      });

      if (candidates.length === 0 && hitsInProgress.length > 1) {
        for (var hi = 0; hi < hitsInProgress.length; hi++) {
          var adj = orthogonalNeighbors(hitsInProgress[hi][0], hitsInProgress[hi][1], n);
          for (var ai = 0; ai < adj.length; ai++) {
            if (!self.hasTried(adj[ai][0], adj[ai][1])) {
              candidates.push(adj[ai]);
            }
          }
        }
      }

      if (candidates.length > 0) {
        return gen.choice(candidates);
      }
    }

    return this._randomShot(n, gen);
  };

  function BattleshipGame(options) {
    var opts = options || {};
    this.boardSize = opts.boardSize === 10 ? 10 : 7;
    this.seed = opts.seed !== undefined ? opts.seed : ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    this.rng = makeRng(this.seed);
    this.player = new Player("You", this.boardSize);
    this.computer = new ComputerPlayer("Computer", this.boardSize);
    this.player.randomInit(FLEET_NAMES, this.rng);
    this.computer.randomInit(FLEET_NAMES, this.rng);
    this.shotsFired = 0;
    this.gameOver = false;
    this.winner = null;
    this.logs = ["Fleet deployed. Aim with arrows/WASD or click Enemy Fleet."];
  }

  BattleshipGame.prototype._pushLog = function (line) {
    this.logs.unshift(line);
    if (this.logs.length > 5) {
      this.logs.length = 5;
    }
  };

  BattleshipGame.prototype.rerollPlayerFleet = function () {
    if (this.shotsFired > 0 || this.gameOver) {
      return false;
    }
    this.player.randomInit(FLEET_NAMES, this.rng);
    this._pushLog("Re-rolled your fleet positions.");
    return true;
  };

  BattleshipGame.prototype.playerFire = function (row, col) {
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
    var loc = encodeLoc(row, col);
    var hitName = this.player.hit(this.computer, row, col);
    var hitFleet = hitName ? this.computer.fleetGroup.findAt(row, col) : null;
    var sunkName = hitFleet && hitFleet.isSunk() ? hitFleet.name : null;

    if (sunkName) {
      this._pushLog("You fired " + loc + ": HIT and SUNK enemy " + FLEET_LABELS[sunkName] + "!");
    } else if (hitName) {
      this._pushLog("You fired " + loc + ": HIT enemy " + FLEET_LABELS[hitName] + "!");
    } else {
      this._pushLog("You fired " + loc + ": Miss.");
    }

    if (this.computer.allSunk()) {
      this.gameOver = true;
      this.winner = "You";
      this._pushLog("Victory! You sank the entire enemy fleet.");
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

    var compTarget = this.computer.chooseNextShot(this.player, this.rng);
    var compLoc = encodeLoc(compTarget[0], compTarget[1]);
    var compHit = this.computer.hit(this.player, compTarget[0], compTarget[1]);
    var compFleet = compHit ? this.player.fleetGroup.findAt(compTarget[0], compTarget[1]) : null;
    var compSunk = compFleet && compFleet.isSunk() ? compFleet.name : null;

    if (compSunk) {
      this._pushLog("Computer fired " + compLoc + ": SUNK your " + FLEET_LABELS[compSunk] + "!");
    } else if (compHit) {
      this._pushLog("Computer fired " + compLoc + ": Hit your " + FLEET_LABELS[compHit] + ".");
    } else {
      this._pushLog("Computer fired " + compLoc + ": Miss.");
    }

    if (this.player.allSunk()) {
      this.gameOver = true;
      this.winner = "Computer";
      this._pushLog("Defeat! Computer sank all your ships.");
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
  };

  function collidePoint(rect, pt) {
    return pt[0] >= rect.x && pt[0] <= rect.x + rect.width &&
      pt[1] >= rect.y && pt[1] <= rect.y + rect.height;
  }

  function SoundEffects() {
    this.muted = false;
    this.played = [];
    this.ctx = null;
  }

  SoundEffects.prototype._ensureContext = function () {
    if (typeof window === "undefined") {
      return null;
    }
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch (e) {
        return null;
      }
    }
    if (this.ctx.state === "suspended" && this.ctx.resume) {
      this.ctx.resume();
    }
    return this.ctx;
  };

  SoundEffects.prototype.toggle = function () {
    this.muted = !this.muted;
    return this.muted;
  };

  SoundEffects.prototype._tone = function (ctx, freqStart, freqEnd, duration, type, volume, delay) {
    var start = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freqStart, start);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + duration);
    }
    gain.gain.setValueAtTime(volume || 0.14, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  };

  SoundEffects.prototype._noise = function (ctx, duration, cutoffHz, volume, delay) {
    var start = ctx.currentTime + (delay || 0);
    var sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    var buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoffHz || 900, start);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume || 0.16, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(start);
  };

  SoundEffects.prototype.play = function (kind) {
    if (this.muted) {
      return false;
    }
    this.played.push(kind);
    if (this.played.length > 64) {
      this.played.shift();
    }
    var ctx = this._ensureContext();
    if (!ctx) {
      return true;
    }
    if (kind === "launch") {
      this._tone(ctx, 520, 170, 0.14, "triangle", 0.12, 0);
    } else if (kind === "miss") {
      this._tone(ctx, 300, 110, 0.16, "sine", 0.12, 0);
      this._noise(ctx, 0.18, 1200, 0.1, 0.02);
    } else if (kind === "hit") {
      this._tone(ctx, 180, 46, 0.24, "sawtooth", 0.16, 0);
      this._noise(ctx, 0.22, 850, 0.18, 0);
    } else if (kind === "sunk") {
      this._tone(ctx, 140, 34, 0.42, "sawtooth", 0.2, 0);
      this._tone(ctx, 220, 55, 0.28, "square", 0.1, 0.08);
      this._noise(ctx, 0.38, 650, 0.22, 0);
    } else if (kind === "win") {
      this._tone(ctx, 523.25, 523.25, 0.14, "triangle", 0.14, 0);
      this._tone(ctx, 659.25, 659.25, 0.14, "triangle", 0.14, 0.11);
      this._tone(ctx, 783.99, 783.99, 0.14, "triangle", 0.14, 0.22);
      this._tone(ctx, 1046.5, 1046.5, 0.28, "triangle", 0.16, 0.33);
    } else if (kind === "lose") {
      this._tone(ctx, 392.0, 392.0, 0.18, "sawtooth", 0.1, 0);
      this._tone(ctx, 311.13, 311.13, 0.18, "sawtooth", 0.1, 0.16);
      this._tone(ctx, 261.63, 220.0, 0.34, "sawtooth", 0.12, 0.32);
    } else if (kind === "click") {
      this._tone(ctx, 640, 480, 0.05, "sine", 0.08, 0);
    }
    return true;
  };

  function Painter(ctx) {
    this.ctx = ctx;
    this.errors = [];
  }

  Painter.prototype.setFont = function (size, weight) {
    var px = Math.max(11, Math.round(size * 0.68));
    this.ctx.font = (weight || "600") + " " + px + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    return Math.round(size * 0.78);
  };

  Painter.prototype.text = function (message, rect, size, color, align, weight) {
    var sz = size || 22;
    var fill = color || INK;
    var lineHeight = this.setFont(sz, weight);
    var paragraphs = String(message).split("\n");
    var lines = [];
    for (var p = 0; p < paragraphs.length; p++) {
      var words = paragraphs[p].trim().length ? paragraphs[p].trim().split(/\s+/) : [];
      var line = "";
      for (var w = 0; w < words.length; w++) {
        var word = words[w];
        var candidate = (line ? line + " " + word : word).trim();
        if (line && this.ctx.measureText(candidate).width > rect.width) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    var totalHeight = lines.length * lineHeight;
    var tooWide = false;
    for (var k = 0; k < lines.length; k++) {
      if (this.ctx.measureText(lines[k]).width > rect.width + 2) {
        tooWide = true;
      }
    }
    if (totalHeight > rect.height + 2 || tooWide) {
      this.errors.push(message);
    }
    this.ctx.fillStyle = fill;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = align || "left";
    var drawX = align === "center" ? rect.x + rect.width / 2 : (align === "right" ? rect.x + rect.width : rect.x);
    for (var i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], drawX, rect.y + i * lineHeight);
    }
    this.ctx.textAlign = "left";
    return totalHeight;
  };

  Painter.prototype.panel = function (rect, color, radius) {
    var r = radius === undefined ? 16 : radius;
    this.ctx.fillStyle = color || PANEL;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, r);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.fill();
  };

  Painter.prototype.strokeRoundRect = function (rect, color, lineWidth, radius) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius === undefined ? 16 : radius);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.stroke();
  };

  function BattleshipWebApp(canvas, options) {
    var opts = options || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.painter = new Painter(this.ctx);
    this.sound = new SoundEffects();
    this.layoutErrors = [];
    this.baseSeed = opts.seed;
    this.gameCount = 0;
    this.boardSize = opts.boardSize === 10 ? 10 : 7;
    this.mobileMode = false;
    this.hover = [-1, -1];
    this.hoverCell = null;
    this.cursor = [0, 0];
    this.statusMessage = "";
    this.statusColor = GREEN;
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
    this._startNewGame(this.boardSize);
  }

  BattleshipWebApp.prototype._nextSeed = function () {
    if (this.baseSeed !== undefined) {
      this.gameCount += 1;
      return this.baseSeed + this.gameCount - 1;
    }
    return undefined;
  };

  BattleshipWebApp.prototype._clearVisuals = function () {
    this.projectiles = [];
    this.particles = [];
    this.ripples = [];
    this.pendingEvents = [];
    this.pendingEnemyKeys = {};
    this.pendingPlayerKeys = {};
    this.shakeTime = 0;
    this.shakeIntensity = 0;
  };

  BattleshipWebApp.prototype._startNewGame = function (boardSize) {
    this._clearVisuals();
    this.boardSize = boardSize === 10 ? 10 : 7;
    this.game = new BattleshipGame({
      boardSize: this.boardSize,
      seed: this._nextSeed()
    });
    this.cursor = [0, 0];
    this.hoverCell = null;
    this.statusMessage = "Your turn! Aim at Enemy Fleet (" + this.boardSize + "x" + this.boardSize + ").";
    this.statusColor = GREEN;
  };

  BattleshipWebApp.prototype.setMobileMode = function (enabled) {
    this.mobileMode = Boolean(enabled);
  };

  BattleshipWebApp.prototype.playerPanelRect = function () {
    return this.mobileMode ? MOBILE_PLAYER_PANEL : PLAYER_PANEL;
  };

  BattleshipWebApp.prototype.enemyPanelRect = function () {
    return this.mobileMode ? MOBILE_ENEMY_PANEL : ENEMY_PANEL;
  };

  BattleshipWebApp.prototype.gridMetrics = function (panel) {
    var n = this.boardSize;
    var cellSize = this.mobileMode ? (n === 10 ? 46 : 66) : (n === 10 ? 42 : 58);
    var gridPx = n * cellSize;
    var originX = panel.x + Math.round((panel.width - gridPx) / 2) + 12;
    var originY = panel.y + 72;
    return {
      originX: originX,
      originY: originY,
      cellSize: cellSize,
      gridPx: gridPx
    };
  };

  BattleshipWebApp.prototype.playerCellCenter = function (row, col) {
    var m = this.gridMetrics(this.playerPanelRect());
    return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
  };

  BattleshipWebApp.prototype.enemyCellCenter = function (row, col) {
    var m = this.gridMetrics(this.enemyPanelRect());
    return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
  };

  BattleshipWebApp.prototype.isEnemyCellRevealed = function (row, col) {
    return Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col];
  };

  BattleshipWebApp.prototype.isPlayerCellRevealed = function (row, col) {
    return this.game.player.wasHitAt(row, col) && !this.pendingPlayerKeys[row + "," + col];
  };

  BattleshipWebApp.prototype._spawnImpact = function (center, kind) {
    var isHit = kind === "hit" || kind === "sunk";
    var ringColor = isHit ? (kind === "sunk" ? GOLD : CORAL) : BLUE;
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
        color: CORAL,
        lineWidth: 2
      });
    }
    var count = kind === "sunk" ? 20 : (isHit ? 12 : 8);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + (i % 2) * 0.2;
      var speed = (kind === "sunk" ? 130 : (isHit ? 95 : 55)) * (0.5 + (i % 3) * 0.25);
      this.particles.push({
        x: center[0],
        y: center[1],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isHit ? 25 : 15),
        life: kind === "sunk" ? 0.65 : 0.45,
        maxLife: kind === "sunk" ? 0.65 : 0.45,
        color: isHit ? (i % 2 === 0 ? CORAL : GOLD) : BLUE,
        size: kind === "sunk" ? 5 : 4
      });
    }
  };

  BattleshipWebApp.prototype._spawnVictoryConfetti = function () {
    var colors = [GREEN, GOLD, BLUE, CORAL];
    var ep = this.enemyPanelRect();
    for (var i = 0; i < 36; i++) {
      var angle = -Math.PI + (Math.PI * i) / 36;
      var speed = 140 + (i % 5) * 45;
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
  };

  BattleshipWebApp.prototype._triggerShake = function (intensity) {
    this.shakeDuration = 0.35;
    this.shakeTime = this.shakeDuration;
    this.shakeIntensity = intensity || 7;
  };

  BattleshipWebApp.prototype.flushVisualQueue = function () {
    while (this.pendingEvents.length > 0 || this.projectiles.length > 0) {
      for (var i = 0; i < this.projectiles.length; i++) {
        var proj = this.projectiles[i];
        if (!proj.resolved && proj.onImpact) {
          proj.resolved = true;
          proj.onImpact(true);
        }
      }
      this.projectiles = [];
      if (this.pendingEvents.length > 0) {
        var evts = this.pendingEvents.splice(0, this.pendingEvents.length);
        for (var j = 0; j < evts.length; j++) {
          evts[j].fn(true);
        }
      }
    }
    this.pendingEnemyKeys = {};
    this.pendingPlayerKeys = {};
    this.particles = [];
    this.ripples = [];
    this.shakeTime = 0;
  };

  BattleshipWebApp.prototype.tick = function (seconds) {
    var dt = Math.max(0, seconds);
    this.clock += dt;

    var remainingEvents = [];
    for (var e = 0; e < this.pendingEvents.length; e++) {
      var evt = this.pendingEvents[e];
      evt.delay -= dt;
      if (evt.delay <= 0) {
        evt.fn(false);
      } else {
        remainingEvents.push(evt);
      }
    }
    this.pendingEvents = remainingEvents;

    var activeProj = [];
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      p.elapsed += dt;
      if (p.elapsed >= p.duration) {
        if (!p.resolved && p.onImpact) {
          p.resolved = true;
          p.onImpact(false);
        }
      } else {
        activeProj.push(p);
      }
    }
    this.projectiles = activeProj;

    var activeParticles = [];
    for (var j = 0; j < this.particles.length; j++) {
      var pt = this.particles[j];
      pt.life -= dt;
      if (pt.life > 0) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 140 * dt;
        activeParticles.push(pt);
      }
    }
    this.particles = activeParticles;

    var activeRipples = [];
    for (var k = 0; k < this.ripples.length; k++) {
      var rp = this.ripples[k];
      rp.life -= dt;
      if (rp.life > 0) {
        activeRipples.push(rp);
      }
    }
    this.ripples = activeRipples;

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
  };

  BattleshipWebApp.prototype.enemyCellRect = function (row, col) {
    var m = this.gridMetrics(this.enemyPanelRect());
    return {
      x: m.originX + col * m.cellSize,
      y: m.originY + row * m.cellSize,
      width: m.cellSize,
      height: m.cellSize
    };
  };

  BattleshipWebApp.prototype.enemyCellAtPoint = function (pt) {
    var m = this.gridMetrics(this.enemyPanelRect());
    var col = Math.floor((pt[0] - m.originX) / m.cellSize);
    var row = Math.floor((pt[1] - m.originY) / m.cellSize);
    if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
      return [row, col];
    }
    return null;
  };

  BattleshipWebApp.prototype.buttons = function () {
    var canReroll = this.game.shotsFired === 0 && !this.game.gameOver;
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
  };

  BattleshipWebApp.prototype.activate = function (action) {
    if (action === "toggle_sound") {
      var muted = this.sound.toggle();
      if (!muted) {
        this.sound.play("click");
      }
      this.statusMessage = muted ? "Sound muted." : "Sound enabled.";
      this.statusColor = MUTED;
      return;
    }
    if (action === "reroll") {
      this.flushVisualQueue();
      if (this.game.rerollPlayerFleet()) {
        this.sound.play("click");
        this.statusMessage = "Re-rolled your fleet positions.";
        this.statusColor = GOLD;
      } else {
        this.statusMessage = "Fleet locked after battle starts. Press R for New Game.";
        this.statusColor = MUTED;
      }
      return;
    }
    if (action === "toggle_size") {
      var nextSize = this.boardSize === 7 ? 10 : 7;
      this._startNewGame(nextSize);
      this.sound.play("click");
      return;
    }
    if (action === "new_game") {
      this._startNewGame(this.boardSize);
      this.sound.play("click");
    }
  };

  BattleshipWebApp.prototype.fireAt = function (row, col) {
    if (this.game.gameOver) {
      this.flushVisualQueue();
      this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
      this.statusColor = this.game.winner === "You" ? GREEN : CORAL;
      return { accepted: false, reason: "game_over" };
    }
    if (this.game.player.hasTried(row, col)) {
      this.statusMessage = "Already fired at " + encodeLoc(row, col) + ". Pick another cell.";
      this.statusColor = GOLD;
      return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
    }

    this.flushVisualQueue();
    var res = this.game.playerFire(row, col);
    if (!res.accepted) {
      return res;
    }

    var self = this;
    var enemyKey = row + "," + col;
    this.pendingEnemyKeys[enemyKey] = true;
    var targetCenter = this.enemyCellCenter(row, col);
    var pp = this.playerPanelRect();
    var launchCenter = [pp.x + pp.width / 2, pp.y + pp.height / 2];

    if (res.computerShot) {
      this.pendingPlayerKeys[res.computerShot.row + "," + res.computerShot.col] = true;
    }

    this.sound.play("launch");
    this.statusMessage = "Firing at " + res.coord + "...";
    this.statusColor = GOLD;

    this.projectiles.push({
      from: launchCenter,
      to: targetCenter,
      elapsed: 0,
      duration: 0.22,
      color: GOLD,
      resolved: false,
      onImpact: function (fastForward) {
        delete self.pendingEnemyKeys[enemyKey];
        var kind = res.sunk ? "sunk" : (res.hit ? "hit" : "miss");
        if (!fastForward) {
          self._spawnImpact(targetCenter, kind);
          self.sound.play(kind);
          if (res.sunk) {
            self._triggerShake(8);
          }
        }
        if (res.gameOver && res.winner === "You") {
          self.statusMessage = "VICTORY! You sank all enemy ships!";
          self.statusColor = GREEN;
          if (!fastForward) {
            self._spawnVictoryConfetti();
            self.sound.play("win");
          }
        } else if (res.sunk) {
          self.statusMessage = "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
          self.statusColor = GREEN;
        } else if (res.hit) {
          self.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
          self.statusColor = GOLD;
        } else {
          self.statusMessage = "Miss at " + res.coord + ". Incoming fire...";
          self.statusColor = BLUE;
        }
      }
    });

    if (res.computerShot) {
      var comp = res.computerShot;
      var compKey = comp.row + "," + comp.col;
      var compTargetCenter = this.playerCellCenter(comp.row, comp.col);
      var ep = this.enemyPanelRect();
      var compOrigin = [ep.x + ep.width / 2, ep.y + ep.height / 2];

      this.pendingEvents.push({
        delay: 0.28,
        fn: function (fastForward) {
          if (!fastForward) {
            self.sound.play("launch");
          }
          self.projectiles.push({
            from: compOrigin,
            to: compTargetCenter,
            elapsed: 0,
            duration: 0.22,
            color: CORAL,
            resolved: false,
            onImpact: function (ffImpact) {
              delete self.pendingPlayerKeys[compKey];
              var compKind = comp.sunk ? "sunk" : (comp.hit ? "hit" : "miss");
              if (!ffImpact && !fastForward) {
                self._spawnImpact(compTargetCenter, compKind);
                self.sound.play(compKind);
                if (comp.sunk) {
                  self._triggerShake(8);
                }
              }
              if (res.gameOver && res.winner === "Computer") {
                self.statusMessage = "DEFEAT! Computer sank all your ships.";
                self.statusColor = CORAL;
                if (!ffImpact && !fastForward) {
                  self.sound.play("lose");
                }
              } else if (!res.sunk && !res.hit) {
                self.statusMessage = "Miss at " + res.coord + ". Your turn!";
                self.statusColor = BLUE;
              }
            }
          });
        }
      });
    }

    return res;
  };

  BattleshipWebApp.prototype.handlePointerMove = function (pt) {
    this.hover = pt;
    this.hoverCell = this.enemyCellAtPoint(pt);
  };

  BattleshipWebApp.prototype.handlePointerDown = function (pt) {
    this.hover = pt;
    if (!this.mobileMode) {
      var btns = this.buttons();
      for (var i = 0; i < btns.length; i++) {
        if (collidePoint(btns[i].rect, pt)) {
          this.activate(btns[i].action);
          return;
        }
      }
    }
    var cell = this.enemyCellAtPoint(pt);
    if (cell) {
      this.cursor = [cell[0], cell[1]];
      this.fireAt(cell[0], cell[1]);
    }
  };

  BattleshipWebApp.prototype.handleKeyDown = function (key) {
    var maxIdx = this.boardSize - 1;
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
  };

  BattleshipWebApp.prototype._drawButton = function (btn) {
    var isHover = !btn.disabled && collidePoint(btn.rect, this.hover);
    var bg = btn.disabled ? "rgb(26, 42, 52)" : (isHover ? "rgb(48, 77, 86)" : CARD);
    var border = btn.disabled ? "rgb(48, 66, 76)" : (isHover ? GREEN : BORDER);
    var textColor = btn.disabled ? MUTED : INK;
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
  };

  BattleshipWebApp.prototype._drawMarker = function (rect, kind) {
    var cx = rect.x + rect.width / 2;
    var cy = rect.y + rect.height / 2;
    var ctx = this.ctx;
    if (kind === "hit") {
      var pad = Math.round(rect.width * 0.24);
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rect.x + pad, rect.y + pad);
      ctx.lineTo(rect.x + rect.width - pad, rect.y + rect.height - pad);
      ctx.moveTo(rect.x + rect.width - pad, rect.y + pad);
      ctx.lineTo(rect.x + pad, rect.y + rect.height - pad);
      ctx.stroke();
    } else if (kind === "miss") {
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(5, Math.round(rect.width * 0.16)), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  BattleshipWebApp.prototype._drawBoard = function (panel, title, subtitle, isPlayer) {
    var p = this.painter;
    var ctx = this.ctx;
    p.panel(panel, PANEL, 16);
    p.strokeRoundRect(panel, BORDER, 2, 16);
    p.text(title, { x: panel.x + 22, y: panel.y + 14, width: 230, height: 30 }, 26, isPlayer ? BLUE : GOLD, "left", "700");
    p.text(subtitle, { x: panel.x + 220, y: panel.y + 17, width: panel.width - 242, height: 26 }, 20, MUTED, "right");

    var m = this.gridMetrics(panel);
    var n = this.boardSize;

    for (var i = 0; i < n; i++) {
      p.text(
        String(i + 1),
        { x: m.originX + i * m.cellSize, y: m.originY - 24, width: m.cellSize, height: 22 },
        19,
        MUTED,
        "center"
      );
      p.text(
        String.fromCharCode(65 + i),
        { x: m.originX - 28, y: m.originY + i * m.cellSize + Math.round((m.cellSize - 18) / 2), width: 22, height: 22 },
        19,
        MUTED,
        "center"
      );
    }

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var cell = {
          x: m.originX + c * m.cellSize,
          y: m.originY + r * m.cellSize,
          width: m.cellSize,
          height: m.cellSize
        };
        var fill = OCEAN;
        var marker = null;

        if (isPlayer) {
          var myFleet = this.game.player.fleetGroup.findAt(r, c);
          var revealedPlayerHit = this.isPlayerCellRevealed(r, c);
          if (myFleet) {
            if (myFleet.hasHit(r, c) && revealedPlayerHit) {
              fill = SHIP_SUNK;
              marker = "hit";
            } else {
              fill = SHIP_FILL;
            }
          } else if (revealedPlayerHit) {
            marker = "miss";
          }
        } else {
          var rec = this.isEnemyCellRevealed(r, c) ? this.game.player.hitRecordAt(r, c) : null;
          var isHover = this.hoverCell && this.hoverCell[0] === r && this.hoverCell[1] === c;
          if (rec) {
            if (rec[2]) {
              var enemyFleet = this.game.computer.fleetGroup.findAt(r, c);
              fill = enemyFleet && enemyFleet.isSunk() ? SHIP_SUNK : "rgb(72, 46, 54)";
              marker = "hit";
            } else {
              fill = "rgb(20, 38, 52)";
              marker = "miss";
            }
          } else if (isHover && !this.game.gameOver) {
            fill = OCEAN_HOVER;
          }
        }

        ctx.fillStyle = fill;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        ctx.strokeStyle = "rgb(48, 84, 108)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);

        if (marker) {
          this._drawMarker(cell, marker);
        }

        if (!isPlayer && !this.game.gameOver && this.cursor[0] === r && this.cursor[1] === c) {
          var pulse = 2.5 + 1.1 * Math.sin(this.clock * 6);
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = pulse;
          ctx.strokeRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
        }
      }
    }

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(m.originX, m.originY, m.gridPx, m.gridPx);
  };

  BattleshipWebApp.prototype._revealedHitCount = function (fleet, isPlayerSide) {
    var revealedHits = 0;
    for (var h = 0; h < fleet.hits.length; h++) {
      var hc = fleet.hits[h];
      var rev = isPlayerSide ? this.isPlayerCellRevealed(hc[0], hc[1]) : this.isEnemyCellRevealed(hc[0], hc[1]);
      if (rev) {
        revealedHits += 1;
      }
    }
    return revealedHits;
  };

  BattleshipWebApp.prototype.mobileState = function () {
    var self = this;
    function mapFleets(fleets, isPlayerSide) {
      return fleets.map(function (f) {
        var hits = self._revealedHitCount(f, isPlayerSide);
        return {
          name: f.name,
          label: FLEET_LABELS[f.name],
          size: f.size,
          revealedHits: hits,
          sunk: hits === f.size
        };
      });
    }
    return {
      statusMessage: this.statusMessage,
      statusColor: this.statusColor,
      boardSize: this.boardSize,
      shotsFired: this.game.shotsFired,
      gameOver: this.game.gameOver,
      winner: this.game.winner,
      buttons: this.buttons().map(function (b) {
        return { label: b.label.replace(/ \([A-Z]\)$/, ""), action: b.action, disabled: b.disabled };
      }),
      playerFleets: mapFleets(this.game.player.fleetGroup.fleets, true),
      enemyFleets: mapFleets(this.game.computer.fleetGroup.fleets, false),
      logs: this.game.logs.slice(0, 5)
    };
  };

  BattleshipWebApp.prototype._drawRoster = function () {
    var p = this.painter;
    var ctx = this.ctx;
    p.panel(ROSTER_PANEL, PANEL, 16);
    p.strokeRoundRect(ROSTER_PANEL, BORDER, 2, 16);
    p.text("YOUR SHIPS", { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 }, 21, BLUE, "left", "700");
    p.text("ENEMY SHIPS", { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 }, 21, GOLD, "left", "700");

    var self = this;
    var drawCol = function (fleets, startX, isPlayerSide) {
      for (var i = 0; i < fleets.length; i++) {
        var f = fleets[i];
        var y = ROSTER_PANEL.y + 44 + i * 28;
        var revealedHits = self._revealedHitCount(f, isPlayerSide);
        var sunk = revealedHits === f.size;
        p.text(
          FLEET_LABELS[f.name],
          { x: startX, y: y, width: 120, height: 22 },
          18,
          sunk ? CORAL : INK
        );
        for (var pip = 0; pip < f.size; pip++) {
          var px = startX + 126 + pip * 16;
          var py = y + 4;
          ctx.fillStyle = sunk ? CORAL : (pip < revealedHits ? GOLD : GREEN);
          ctx.fillRect(px, py, 11, 11);
        }
        p.text(
          sunk ? "SUNK" : (f.size - revealedHits) + "/" + f.size,
          { x: startX + 214, y: y, width: 52, height: 22 },
          17,
          sunk ? CORAL : MUTED,
          "right"
        );
      }
    };

    drawCol(this.game.player.fleetGroup.fleets, ROSTER_PANEL.x + 20, true);
    drawCol(this.game.computer.fleetGroup.fleets, ROSTER_PANEL.x + 310, false);
  };

  BattleshipWebApp.prototype._drawBattleLog = function () {
    var p = this.painter;
    p.panel(LOG_PANEL, PANEL, 16);
    p.strokeRoundRect(LOG_PANEL, this.game.gameOver ? (this.game.winner === "You" ? GREEN : CORAL) : BORDER, 2, 16);
    p.text(
      this.statusMessage,
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 14, width: LOG_PANEL.width - 40, height: 32 },
      23,
      this.statusColor,
      "left",
      "700"
    );

    var recent = this.game.logs.slice(0, 4).join("\n");
    p.text(
      recent,
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 54, width: LOG_PANEL.width - 40, height: 102 },
      19,
      MUTED
    );

    var targetHint = "Target: " + encodeLoc(this.cursor[0], this.cursor[1]) +
      "  |  Shots: " + this.game.shotsFired +
      "  |  Arrows/WASD + Enter/Space or Click";
    p.text(
      targetHint,
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 162, width: LOG_PANEL.width - 40, height: 24 },
      18,
      GOLD
    );
  };

  BattleshipWebApp.prototype._drawEffects = function () {
    var ctx = this.ctx;
    for (var i = 0; i < this.ripples.length; i++) {
      var rp = this.ripples[i];
      var frac = 1 - rp.life / rp.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, rp.life / rp.maxLife);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = rp.lineWidth;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 6 + frac * rp.maxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (var j = 0; j < this.projectiles.length; j++) {
      var p = this.projectiles[j];
      var t = Math.min(1, p.elapsed / p.duration);
      var arcLift = Math.sin(Math.PI * t) * 58;
      var px = p.from[0] + (p.to[0] - p.from[0]) * t;
      var py = p.from[1] + (p.to[1] - p.from[1]) * t - arcLift;
      var tailT = Math.max(0, t - 0.14);
      var tailLift = Math.sin(Math.PI * tailT) * 58;
      var tx = p.from[0] + (p.to[0] - p.from[0]) * tailT;
      var ty = p.from[1] + (p.to[1] - p.from[1]) * tailT - tailLift;
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (var k = 0; k < this.particles.length; k++) {
      var pt = this.particles[k];
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      ctx.restore();
    }
  };

  BattleshipWebApp.prototype.draw = function () {
    this.painter.errors = [];
    var cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
    var ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
    this.ctx.fillStyle = NAVY;
    this.ctx.fillRect(0, 0, cw, ch);

    var shaking = this.shakeTime > 0;
    if (shaking && this.ctx.save && this.ctx.translate) {
      var ratio = this.shakeTime / this.shakeDuration;
      var dx = Math.sin(this.clock * 70) * this.shakeIntensity * ratio;
      var dy = Math.cos(this.clock * 85) * this.shakeIntensity * ratio;
      this.ctx.save();
      this.ctx.translate(dx, dy);
    }

    if (this.mobileMode) {
      this._drawBoard(
        this.enemyPanelRect(),
        "ENEMY FLEET",
        "Tap a square to fire",
        false
      );
      this._drawBoard(
        this.playerPanelRect(),
        "YOUR FLEET",
        "Ships & incoming hits",
        true
      );
      this._drawEffects();
    } else {
      this.painter.text("BATTLESHIP", { x: 34, y: 20, width: 300, height: 42 }, 42, GREEN, "left", "800");
      this.painter.text(
        "Sink all 5 enemy warships before Computer sinks yours.",
        { x: 34, y: 68, width: 480, height: 28 },
        21,
        MUTED
      );

      var btns = this.buttons();
      for (var i = 0; i < btns.length; i++) {
        this._drawButton(btns[i]);
      }

      this._drawBoard(PLAYER_PANEL, "YOUR FLEET", "Ships & incoming hits", true);
      this._drawBoard(
        ENEMY_PANEL,
        "ENEMY FLEET",
        "Target: " + encodeLoc(this.cursor[0], this.cursor[1]),
        false
      );
      this._drawRoster();
      this._drawBattleLog();
      this._drawEffects();
    }

    if (shaking && this.ctx.restore) {
      this.ctx.restore();
    }

    this.layoutErrors = this.painter.errors.slice();
  };

  function bootBrowser() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    var canvas = document.getElementById("game-canvas");
    if (!canvas) {
      return;
    }
    var app = new BattleshipWebApp(canvas);
    window.battleshipApp = app;

    var mobileStatusText = document.getElementById("mobile-status-text");
    var mobileStatusSub = document.getElementById("mobile-status-sub");
    var mobileButtons = document.getElementById("mobile-buttons");
    var mobileRoster = document.getElementById("mobile-roster");
    var mobileLogs = document.getElementById("mobile-logs");
    var lastMobileKey = "";

    function syncViewport() {
      var isMobile = window.innerWidth <= 900 || window.innerHeight > window.innerWidth;
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      var logW = isMobile ? MOBILE_WIDTH : WIDTH;
      var logH = isMobile ? MOBILE_HEIGHT : HEIGHT;
      app.setMobileMode(isMobile);
      var w = Math.round(logW * dpr);
      var h = Math.round(logH * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (app.ctx.setTransform) {
        app.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      app.draw();
    }

    function syncMobileDom() {
      if (!app.mobileMode || !mobileButtons) {
        return;
      }
      var st = app.mobileState();
      var key = JSON.stringify(st);
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
      st.buttons.forEach(function (b) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mobile-btn";
        btn.textContent = b.label;
        btn.disabled = b.disabled;
        btn.addEventListener("click", function () {
          app.activate(b.action);
          app.draw();
          syncMobileDom();
        });
        mobileButtons.appendChild(btn);
      });
      if (mobileRoster) {
        mobileRoster.innerHTML = "";
        var buildCol = function (title, fleets, isEnemy) {
          var col = document.createElement("div");
          col.className = "mobile-roster-col" + (isEnemy ? " enemy" : "");
          var h4 = document.createElement("h4");
          h4.textContent = title;
          col.appendChild(h4);
          fleets.forEach(function (f) {
            var row = document.createElement("div");
            row.className = "mobile-ship-row" + (f.sunk ? " sunk" : "");
            var name = document.createElement("span");
            name.textContent = f.label;
            var pips = document.createElement("span");
            pips.className = "mobile-pips";
            for (var p = 0; p < f.size; p++) {
              var pip = document.createElement("span");
              pip.className = "mobile-pip" + (f.sunk ? " sunk" : (p < f.revealedHits ? " hit" : ""));
              pips.appendChild(pip);
            }
            row.appendChild(name);
            row.appendChild(pips);
            col.appendChild(row);
          });
          return col;
        };
        mobileRoster.appendChild(buildCol("YOUR SHIPS", st.playerFleets, false));
        mobileRoster.appendChild(buildCol("ENEMY SHIPS", st.enemyFleets, true));
      }
      if (mobileLogs) {
        mobileLogs.textContent = st.logs.join("\n");
      }
    }

    function logicalFromEvent(evt) {
      var rect = canvas.getBoundingClientRect();
      var logW = app.mobileMode ? MOBILE_WIDTH : WIDTH;
      var logH = app.mobileMode ? MOBILE_HEIGHT : HEIGHT;
      var x = Math.round(((evt.clientX - rect.left) * logW) / rect.width);
      var y = Math.round(((evt.clientY - rect.top) * logH) / rect.height);
      return [x, y];
    }

    canvas.addEventListener("pointermove", function (evt) {
      app.handlePointerMove(logicalFromEvent(evt));
    });

    canvas.addEventListener("pointerdown", function (evt) {
      evt.preventDefault();
      app.handlePointerDown(logicalFromEvent(evt));
      syncMobileDom();
    });

    window.addEventListener("keydown", function (evt) {
      var handled = app.handleKeyDown(evt.key);
      if (handled) {
        evt.preventDefault();
        syncMobileDom();
      }
    });

    window.addEventListener("resize", function () {
      syncViewport();
      syncMobileDom();
    });
    syncViewport();
    syncMobileDom();

    var lastTime = performance.now();
    function frame(now) {
      var dt = Math.min((now - lastTime) / 1000.0, 0.1);
      lastTime = now;
      app.tick(dt);
      app.draw();
      syncMobileDom();
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootBrowser);
    } else {
      bootBrowser();
    }
  }

  return {
    WIDTH: WIDTH,
    HEIGHT: HEIGHT,
    MOBILE_WIDTH: MOBILE_WIDTH,
    MOBILE_HEIGHT: MOBILE_HEIGHT,
    FLEET_NAMES: FLEET_NAMES,
    FLEET_SIZES: FLEET_SIZES,
    encodeLoc: encodeLoc,
    makeRng: makeRng,
    Fleet: Fleet,
    FleetGroup: FleetGroup,
    Player: Player,
    ComputerPlayer: ComputerPlayer,
    BattleshipGame: BattleshipGame,
    BattleshipWebApp: BattleshipWebApp
  };
});
