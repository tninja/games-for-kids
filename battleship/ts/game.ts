import { encodeLoc, Fleet, FleetGroup, makeRng, orthogonalNeighbors } from "./fleet";
import {
  BadgeId,
  BoardSize,
  CaptainInfo,
  CaptainMood,
  ComputerShotInfo,
  Coord,
  Difficulty,
  Direction,
  FireResult,
  FLEET_LABELS,
  FLEET_NAMES,
  FLEET_SIZES,
  FleetName,
  GameSummary,
  HelperHint,
  HitRecord,
  PlayMode,
  Rng,
  RuleMode,
  ShotCellOutcome,
  SonarResult,
  SonarScan
} from "./types";

const CAPTAIN_PROFILES: Record<Difficulty, { name: string; title: string; intro: string }> = {
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

export class Player {
  public readonly name: string;
  public readonly boardSize: number;
  public fleetGroup: FleetGroup = new FleetGroup();
  public hitHistory: HitRecord[] = [];
  public wasHitHistory: Coord[] = [];

  constructor(name: string, boardSize: number = 7) {
    this.name = name;
    this.boardSize = boardSize;
  }

  public hasTried(x: number, y: number): boolean {
    return this.hitHistory.some(([hx, hy]) => hx === x && hy === y);
  }

  public hitRecordAt(x: number, y: number): HitRecord | null {
    for (const rec of this.hitHistory) {
      if (rec[0] === x && rec[1] === y) {
        return rec;
      }
    }
    return null;
  }

  public wasHitAt(x: number, y: number): boolean {
    return this.wasHitHistory.some(([hx, hy]) => hx === x && hy === y);
  }

  public randomInit(fleetNames: readonly FleetName[] = FLEET_NAMES, rng?: Rng): void {
    const gen = rng ?? makeRng(Date.now());
    const n = this.boardSize;

    for (let layoutTry = 0; layoutTry < 50; layoutTry++) {
      const board: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
      const group = new FleetGroup();
      let failed = false;

      for (const fname of fleetNames) {
        const size = FLEET_SIZES[fname];
        let placed = false;

        for (let attempt = 0; attempt < 250; attempt++) {
          const direction = gen.choice<Direction>(["vertical", "horizontal"]);
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

  public hit(targetPlayer: Player, x: number, y: number): FleetName | null {
    targetPlayer.wasHitHistory.push([x, y]);
    const result = targetPlayer.fleetGroup.hit(x, y);
    this.hitHistory.push([x, y, result !== null]);
    return result;
  }

  public allSunk(): boolean {
    return this.fleetGroup.allSunk();
  }
}

export class ComputerPlayer extends Player {
  public difficulty: Difficulty;

  constructor(name: string, boardSize: number = 7, difficulty: Difficulty = "normal") {
    super(name, boardSize);
    this.difficulty = difficulty;
  }

  private untriedCells(): Coord[] {
    const possible: Coord[] = [];
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        if (!this.hasTried(x, y)) {
          possible.push([x, y]);
        }
      }
    }
    return possible;
  }

  private randomShot(boardSize: number, rng: Rng, useParity: boolean): Coord {
    const possible: Coord[] = [];
    const priority: Coord[] = [];
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

  private probabilityShot(opponent: Player, rng: Rng): Coord {
    const n = this.boardSize;
    const scores: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const unsunkSizes = opponent.fleetGroup.fleets
      .filter((fl) => !fl.isSunk())
      .map((fl) => fl.size);

    const isBlocked = (r: number, c: number): boolean => {
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
    let best: Coord[] = [];
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

  public chooseNextShot(opponent: Player, rng?: Rng): Coord {
    const n = this.boardSize;
    const gen = rng ?? makeRng(Date.now());
    const hitsInProgress: Coord[] = [];

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
        const neighbors: Coord[] = [];
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
      let candidates: Coord[] = [];
      if (hitsInProgress.length > 1) {
        const points = hitsInProgress
          .slice()
          .sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
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
}

export interface BattleshipGameOptions {
  boardSize?: number;
  seed?: number;
  playMode?: PlayMode;
  difficulty?: Difficulty;
  ruleMode?: RuleMode;
  helperMode?: boolean;
}

export class BattleshipGame {
  public readonly boardSize: BoardSize;
  public readonly seed: number;
  public readonly rng: Rng;
  public readonly playMode: PlayMode;
  public readonly difficulty: Difficulty;
  public readonly ruleMode: RuleMode;
  public helperMode: boolean;
  public readonly player: Player;
  public readonly computer: ComputerPlayer;
  public readonly players: [Player, Player];
  public activePlayerIndex: 0 | 1 = 0;
  public waitingHandoff = false;
  public turnNumber = 1;
  public shotsFired = 0;
  public shotsPerSide: [number, number] = [0, 0];
  public hitsPerSide: [number, number] = [0, 0];
  public currentStreak: [number, number] = [0, 0];
  public bestStreak: [number, number] = [0, 0];
  public missStreak: [number, number] = [0, 0];
  public salvoRemaining = 1;
  public sonarLeft: [number, number] = [2, 2];
  public bombLeft: [number, number] = [1, 1];
  public sonarUsedTurn: [number, number] = [0, 0];
  public sonarScans: [SonarScan[], SonarScan[]] = [[], []];
  public lastSonarCenter: [Coord | null, Coord | null] = [null, null];
  public sonarDetectiveEarned: [boolean, boolean] = [false, false];
  public bombBlastEarned: [boolean, boolean] = [false, false];
  public captainLine = "";
  public captainMood: CaptainMood = "neutral";
  public gameOver = false;
  public winner: string | null = null;
  public logs: string[] = ["Fleet deployed. Aim with arrows/WASD or click Enemy Fleet."];

  constructor(options: BattleshipGameOptions = {}) {
    this.boardSize = options.boardSize === 10 ? 10 : 7;
    this.playMode = options.playMode === "2p" ? "2p" : "1p";
    this.difficulty = options.difficulty ?? "normal";
    this.ruleMode = options.ruleMode ?? "classic";
    this.helperMode = Boolean(options.helperMode);
    this.seed =
      options.seed !== undefined
        ? options.seed
        : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
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

  public activePlayer(): Player {
    return this.players[this.activePlayerIndex];
  }

  public opponentPlayer(): Player {
    return this.players[this.activePlayerIndex === 0 ? 1 : 0];
  }

  public captainInfo(): CaptainInfo | null {
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

  private setCaptainQuip(
    event: "player_miss" | "player_hit" | "player_sunk" | "ai_hit" | "ai_sunk" | "sonar" | "bomb" | "win" | "lose"
  ): void {
    if (this.playMode === "2p") {
      return;
    }
    const lines: Record<Difficulty, Record<typeof event, { text: string; mood: CaptainMood }>> = {
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

  private pushLog(line: string): void {
    this.logs.unshift(line);
    if (this.logs.length > 6) {
      this.logs.length = 6;
    }
  }

  public canPlaceShip(
    sideIndex: 0 | 1,
    name: FleetName,
    row: number,
    col: number,
    direction: Direction
  ): boolean {
    const side = this.players[sideIndex];
    const size = FLEET_SIZES[name];
    return side.fleetGroup.isValidPlacement(row, col, size, direction, this.boardSize, name);
  }

  public placeShip(
    sideIndex: 0 | 1,
    name: FleetName,
    row: number,
    col: number,
    direction: Direction
  ): boolean {
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

  public rerollSideFleet(sideIndex: 0 | 1): boolean {
    if (this.gameOver || this.shotsFired > 0) {
      return false;
    }
    this.players[sideIndex].randomInit(FLEET_NAMES, this.rng);
    this.pushLog(this.players[sideIndex].name + " shuffled fleet positions.");
    return true;
  }

  public rerollPlayerFleet(): boolean {
    if (this.shotsFired > 0 || this.gameOver) {
      return false;
    }
    this.player.randomInit(FLEET_NAMES, this.rng);
    this.pushLog("Re-rolled your fleet positions.");
    return true;
  }

  public confirmHandoff(): void {
    if (!this.waitingHandoff) {
      return;
    }
    this.waitingHandoff = false;
    this.activePlayerIndex = this.activePlayerIndex === 0 ? 1 : 0;
    this.turnNumber += 1;
    this.resetTurnSalvo(this.activePlayerIndex);
    this.pushLog(this.activePlayer().name + "'s turn!");
  }

  private untriedCountFor(shooter: Player): number {
    return this.boardSize * this.boardSize - shooter.hitHistory.length;
  }

  private resetTurnSalvo(sideIndex: 0 | 1): void {
    if (this.ruleMode === "salvo") {
      const alive = this.players[sideIndex].fleetGroup.remainingCount();
      const untried = this.untriedCountFor(this.players[sideIndex]);
      this.salvoRemaining = Math.max(1, Math.min(alive, untried));
    } else {
      this.salvoRemaining = 1;
    }
  }

  public useSonar(row: number, col: number): SonarResult {
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
      this.activePlayer().name +
        " sonar at " +
        loc +
        ": " +
        count +
        (count === 1 ? " ship cell" : " ship cells") +
        " in 3x3!"
    );
    this.setCaptainQuip("sonar");
    return { accepted: true, row, col, coord: loc, count };
  }

  private runComputerTurn(): ComputerShotInfo[] {
    const shots: ComputerShotInfo[] = [];
    const maxShots =
      this.ruleMode === "salvo"
        ? Math.max(1, Math.min(this.computer.fleetGroup.remainingCount(), this.untriedCountFor(this.computer)))
        : 1;

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

  public useCrossBomb(row: number, col: number): FireResult {
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
    const rawCells: Coord[] = [
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
    const outcomes: ShotCellOutcome[] = [];
    let hitCount = 0;
    let lastHit: FleetName | null = null;
    let lastSunk: FleetName | null = null;

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

  public playerFire(row: number, col: number): FireResult {
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
      if (
        lastCenter &&
        this.sonarUsedTurn[idx] === this.turnNumber &&
        Math.abs(lastCenter[0] - row) <= 1 &&
        Math.abs(lastCenter[1] - col) <= 1
      ) {
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

    const cellOutcome: ShotCellOutcome = { coord: loc, row, col, hit: hitName, sunk: sunkName };

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

  public impossibleEnemyCells(sideIndex: 0 | 1 = this.activePlayerIndex): Set<string> {
    const impossible = new Set<string>();
    const shooter = this.players[sideIndex];
    const target = this.players[sideIndex === 0 ? 1 : 0];
    const n = this.boardSize;
    const minSize = target.fleetGroup.minUnsunkSize();
    if (minSize <= 1) {
      return impossible;
    }

    const isBlocked = (r: number, c: number): boolean => {
      const rec = shooter.hitRecordAt(r, c);
      if (!rec) {
        return false;
      }
      if (!rec[2]) {
        return true;
      }
      return target.fleetGroup.fleets.some((fl) => fl.isSunk() && fl.hasCoord(r, c));
    };

    const canFit = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
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

  public helperHint(sideIndex: 0 | 1 = this.activePlayerIndex): HelperHint | null {
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

  public evaluateBadgesFor(sideIndex: 0 | 1): {
    stars: number;
    accuracy: number;
    badges: BadgeId[];
  } {
    const shots = this.shotsPerSide[sideIndex];
    const hits = this.hitsPerSide[sideIndex];
    const accuracy = shots > 0 ? Math.round((hits * 100) / shots) : 0;
    const side = this.players[sideIndex];
    const won = this.gameOver && this.winner === side.name;

    let stars = 0;
    if (won) {
      stars = accuracy >= 45 ? 3 : accuracy >= 30 ? 2 : 1;
    }

    const badges: BadgeId[] = [];
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

  public buildSummary(rankName: string, totalStars: number, newBadges: BadgeId[]): GameSummary {
    const winnerIdx: 0 | 1 = this.winner === this.players[1].name ? 1 : 0;
    const evalIdx: 0 | 1 = this.playMode === "1p" ? 0 : winnerIdx;
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
}
