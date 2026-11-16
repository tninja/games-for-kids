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
    this.layoutErrors = [];
    this.baseSeed = opts.seed;
    this.gameCount = 0;
    this.boardSize = opts.boardSize === 10 ? 10 : 7;
    this.hover = [-1, -1];
    this.hoverCell = null;
    this.cursor = [0, 0];
    this.statusMessage = "";
    this.statusColor = GREEN;
    this._startNewGame(this.boardSize);
  }

  BattleshipWebApp.prototype._nextSeed = function () {
    if (this.baseSeed !== undefined) {
      this.gameCount += 1;
      return this.baseSeed + this.gameCount - 1;
    }
    return undefined;
  };

  BattleshipWebApp.prototype._startNewGame = function (boardSize) {
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

  BattleshipWebApp.prototype.gridMetrics = function (panel) {
    var n = this.boardSize;
    var cellSize = n === 10 ? 42 : 58;
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

  BattleshipWebApp.prototype.enemyCellRect = function (row, col) {
    var m = this.gridMetrics(ENEMY_PANEL);
    return {
      x: m.originX + col * m.cellSize,
      y: m.originY + row * m.cellSize,
      width: m.cellSize,
      height: m.cellSize
    };
  };

  BattleshipWebApp.prototype.enemyCellAtPoint = function (pt) {
    var m = this.gridMetrics(ENEMY_PANEL);
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
        rect: { x: 660, y: 28, width: 190, height: 48 },
        label: "Re-roll Fleet (F)",
        action: "reroll",
        disabled: !canReroll
      },
      {
        rect: { x: 864, y: 28, width: 196, height: 48 },
        label: "Board: " + this.boardSize + "x" + this.boardSize + " (G)",
        action: "toggle_size",
        disabled: false
      },
      {
        rect: { x: 1074, y: 28, width: 172, height: 48 },
        label: "New Game (R)",
        action: "new_game",
        disabled: false
      }
    ];
  };

  BattleshipWebApp.prototype.activate = function (action) {
    if (action === "reroll") {
      if (this.game.rerollPlayerFleet()) {
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
      return;
    }
    if (action === "new_game") {
      this._startNewGame(this.boardSize);
    }
  };

  BattleshipWebApp.prototype.fireAt = function (row, col) {
    var res = this.game.playerFire(row, col);
    if (!res.accepted) {
      if (res.reason === "already_fired") {
        this.statusMessage = "Already fired at " + res.coord + ". Pick another cell.";
        this.statusColor = GOLD;
      } else if (res.reason === "game_over") {
        this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
        this.statusColor = this.game.winner === "You" ? GREEN : CORAL;
      }
      return res;
    }

    if (res.gameOver) {
      this.statusMessage = res.winner === "You"
        ? "VICTORY! You sank all enemy ships!"
        : "DEFEAT! Computer sank all your ships.";
      this.statusColor = res.winner === "You" ? GREEN : CORAL;
      return res;
    }

    if (res.sunk) {
      this.statusMessage = "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
      this.statusColor = GREEN;
    } else if (res.hit) {
      this.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
      this.statusColor = GOLD;
    } else {
      this.statusMessage = "Miss at " + res.coord + ". Your turn!";
      this.statusColor = BLUE;
    }
    return res;
  };

  BattleshipWebApp.prototype.handlePointerMove = function (pt) {
    this.hover = pt;
    this.hoverCell = this.enemyCellAtPoint(pt);
  };

  BattleshipWebApp.prototype.handlePointerDown = function (pt) {
    this.hover = pt;
    var btns = this.buttons();
    for (var i = 0; i < btns.length; i++) {
      if (collidePoint(btns[i].rect, pt)) {
        this.activate(btns[i].action);
        return;
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
    p.text(title, { x: panel.x + 22, y: panel.y + 14, width: 280, height: 30 }, 26, isPlayer ? BLUE : GOLD, "left", "700");
    p.text(subtitle, { x: panel.x + 250, y: panel.y + 17, width: 316, height: 26 }, 20, MUTED, "right");

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
          if (myFleet) {
            if (myFleet.hasHit(r, c)) {
              fill = SHIP_SUNK;
              marker = "hit";
            } else {
              fill = SHIP_FILL;
            }
          } else if (this.game.player.wasHitAt(r, c)) {
            marker = "miss";
          }
        } else {
          var rec = this.game.player.hitRecordAt(r, c);
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
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 3;
          ctx.strokeRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
        }
      }
    }

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(m.originX, m.originY, m.gridPx, m.gridPx);
  };

  BattleshipWebApp.prototype._drawRoster = function () {
    var p = this.painter;
    var ctx = this.ctx;
    p.panel(ROSTER_PANEL, PANEL, 16);
    p.strokeRoundRect(ROSTER_PANEL, BORDER, 2, 16);
    p.text("YOUR SHIPS", { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 }, 21, BLUE, "left", "700");
    p.text("ENEMY SHIPS", { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 }, 21, GOLD, "left", "700");

    var drawCol = function (fleets, startX) {
      for (var i = 0; i < fleets.length; i++) {
        var f = fleets[i];
        var y = ROSTER_PANEL.y + 44 + i * 28;
        var sunk = f.isSunk();
        p.text(
          FLEET_LABELS[f.name],
          { x: startX, y: y, width: 120, height: 22 },
          18,
          sunk ? CORAL : INK
        );
        for (var pip = 0; pip < f.size; pip++) {
          var px = startX + 126 + pip * 16;
          var py = y + 4;
          ctx.fillStyle = sunk ? CORAL : (pip < f.hits.length ? GOLD : GREEN);
          ctx.fillRect(px, py, 11, 11);
        }
        p.text(
          sunk ? "SUNK" : (f.size - f.hits.length) + "/" + f.size,
          { x: startX + 214, y: y, width: 52, height: 22 },
          17,
          sunk ? CORAL : MUTED,
          "right"
        );
      }
    };

    drawCol(this.game.player.fleetGroup.fleets, ROSTER_PANEL.x + 20);
    drawCol(this.game.computer.fleetGroup.fleets, ROSTER_PANEL.x + 310);
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

  BattleshipWebApp.prototype.draw = function () {
    this.painter.errors = [];
    this.ctx.fillStyle = NAVY;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.painter.text("BATTLESHIP", { x: 34, y: 20, width: 300, height: 42 }, 42, GREEN, "left", "800");
    this.painter.text(
      "Sink all 5 enemy warships before Computer sinks yours.",
      { x: 34, y: 68, width: 600, height: 28 },
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

    function syncDpr() {
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      var w = Math.round(WIDTH * dpr);
      var h = Math.round(HEIGHT * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (app.ctx.setTransform) {
        app.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      app.draw();
    }

    function logicalFromEvent(evt) {
      var rect = canvas.getBoundingClientRect();
      var x = Math.round(((evt.clientX - rect.left) * WIDTH) / rect.width);
      var y = Math.round(((evt.clientY - rect.top) * HEIGHT) / rect.height);
      return [x, y];
    }

    canvas.addEventListener("pointermove", function (evt) {
      app.handlePointerMove(logicalFromEvent(evt));
      app.draw();
    });

    canvas.addEventListener("pointerdown", function (evt) {
      evt.preventDefault();
      app.handlePointerDown(logicalFromEvent(evt));
      app.draw();
    });

    window.addEventListener("keydown", function (evt) {
      var handled = app.handleKeyDown(evt.key);
      if (handled) {
        evt.preventDefault();
        app.draw();
      }
    });

    window.addEventListener("resize", syncDpr);
    syncDpr();
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
