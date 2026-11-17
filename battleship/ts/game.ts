import { encodeLoc, Fleet, FleetGroup, makeRng, orthogonalNeighbors } from "./fleet";
import {
  BoardSize,
  Coord,
  Direction,
  FireResult,
  FLEET_LABELS,
  FLEET_NAMES,
  FLEET_SIZES,
  FleetName,
  HitRecord,
  Rng
} from "./types";

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
  private randomShot(boardSize: number, rng: Rng): Coord {
    const possible: Coord[] = [];
    const priority: Coord[] = [];
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

    return this.randomShot(n, gen);
  }
}

export interface BattleshipGameOptions {
  boardSize?: number;
  seed?: number;
}

export class BattleshipGame {
  public readonly boardSize: BoardSize;
  public readonly seed: number;
  public readonly rng: Rng;
  public readonly player: Player;
  public readonly computer: ComputerPlayer;
  public shotsFired = 0;
  public gameOver = false;
  public winner: "You" | "Computer" | null = null;
  public logs: string[] = ["Fleet deployed. Aim with arrows/WASD or click Enemy Fleet."];

  constructor(options: BattleshipGameOptions = {}) {
    this.boardSize = options.boardSize === 10 ? 10 : 7;
    this.seed =
      options.seed !== undefined
        ? options.seed
        : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    this.rng = makeRng(this.seed);
    this.player = new Player("You", this.boardSize);
    this.computer = new ComputerPlayer("Computer", this.boardSize);
    this.player.randomInit(FLEET_NAMES, this.rng);
    this.computer.randomInit(FLEET_NAMES, this.rng);
  }

  private pushLog(line: string): void {
    this.logs.unshift(line);
    if (this.logs.length > 5) {
      this.logs.length = 5;
    }
  }

  public rerollPlayerFleet(): boolean {
    if (this.shotsFired > 0 || this.gameOver) {
      return false;
    }
    this.player.randomInit(FLEET_NAMES, this.rng);
    this.pushLog("Re-rolled your fleet positions.");
    return true;
  }

  public playerFire(row: number, col: number): FireResult {
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
}
