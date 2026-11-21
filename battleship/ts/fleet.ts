import { Coord, Direction, FleetName, Rng } from "./types";

export function makeRng(seed: number): Rng {
  let state = (seed >>> 0) + 0x6d2b79f5;
  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    randInt(min: number, maxInclusive: number): number {
      return min + Math.floor(this.next() * (maxInclusive - min + 1));
    },
    choice<T>(items: readonly T[]): T {
      return items[Math.floor(this.next() * items.length)];
    }
  };
}

export function encodeLoc(row: number, col: number): string {
  return String.fromCharCode(65 + row) + String(col + 1);
}

export function orthogonalNeighbors(row: number, col: number, boardSize: number): Coord[] {
  const dirs: Coord[] = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1]
  ];
  const result: Coord[] = [];
  for (const [nr, nc] of dirs) {
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      result.push([nr, nc]);
    }
  }
  return result;
}

export class Fleet {
  public readonly coordinates: Coord[] = [];
  public readonly name: FleetName;
  public readonly size: number;
  public readonly direction: Direction;
  public readonly hits: Coord[] = [];

  constructor(x: number, y: number, size: number, direction: Direction, name: FleetName) {
    this.name = name;
    this.size = size;
    this.direction = direction;
    for (let i = 0; i < size; i++) {
      this.coordinates.push(direction === "vertical" ? [x + i, y] : [x, y + i]);
    }
  }

  public hasCoord(x: number, y: number): boolean {
    return this.coordinates.some(([cx, cy]) => cx === x && cy === y);
  }

  public hasHit(x: number, y: number): boolean {
    return this.hits.some(([hx, hy]) => hx === x && hy === y);
  }

  public hit(x: number, y: number): boolean {
    if (this.hasCoord(x, y) && !this.hasHit(x, y)) {
      this.hits.push([x, y]);
      return true;
    }
    return false;
  }

  public isSunk(): boolean {
    return this.hits.length === this.size;
  }
}

export class FleetGroup {
  public fleets: Fleet[] = [];

  public add(fleet: Fleet): void {
    this.fleets.push(fleet);
  }

  public remove(name: FleetName): void {
    this.fleets = this.fleets.filter((f) => f.name !== name);
  }

  public findByName(name: FleetName): Fleet | null {
    for (const fleet of this.fleets) {
      if (fleet.name === name) {
        return fleet;
      }
    }
    return null;
  }

  public findAt(x: number, y: number): Fleet | null {
    for (const fleet of this.fleets) {
      if (fleet.hasCoord(x, y)) {
        return fleet;
      }
    }
    return null;
  }

  public isValidPlacement(
    x: number,
    y: number,
    size: number,
    direction: Direction,
    boardSize: number,
    ignoreName?: FleetName
  ): boolean {
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

  public replaceOrAdd(fleet: Fleet): void {
    const idx = this.fleets.findIndex((f) => f.name === fleet.name);
    if (idx >= 0) {
      this.fleets[idx] = fleet;
    } else {
      this.fleets.push(fleet);
    }
  }

  public hit(x: number, y: number): FleetName | null {
    for (const fleet of this.fleets) {
      if (fleet.hit(x, y)) {
        return fleet.name;
      }
    }
    return null;
  }

  public remainingCount(): number {
    let count = 0;
    for (const fleet of this.fleets) {
      if (!fleet.isSunk()) {
        count += 1;
      }
    }
    return count;
  }

  public minUnsunkSize(): number {
    let minSize = Infinity;
    for (const fleet of this.fleets) {
      if (!fleet.isSunk() && fleet.size < minSize) {
        minSize = fleet.size;
      }
    }
    return Number.isFinite(minSize) ? minSize : 0;
  }

  public allSunk(): boolean {
    return this.fleets.length > 0 && this.fleets.every((fleet) => fleet.isSunk());
  }
}
