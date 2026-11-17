import {
  BASE_Y,
  BASE_WIDTH,
  BirdColor,
  BirdFlapFrame,
  BIRD_HEIGHT,
  BIRD_WIDTH,
  DROPPING_SPEED,
  FLAPPING_SPEED,
  FLAP_SEQUENCE,
  FLYING_SPEED,
  PIPE_GAP_SIZE,
  PIPE_HEIGHT,
  PIPE_WIDTH,
  Rng,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SoundKey
} from "./types";

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

export class Bird {
  public readonly x: number;
  public y: number;
  public readonly width = BIRD_WIDTH;
  public readonly height = BIRD_HEIGHT;
  public readonly baseHeight: number;
  public readonly droppingSpeed: number;
  public readonly flappingSpeed: number;
  public readonly color: BirdColor;
  public speed = 0;
  public autoFlap = false;
  public flapFrameIndex = 0;
  private wingTick = 0;
  private bobShift = 1;
  private bobCount = 0;

  constructor(
    color: BirdColor,
    xFraction: number = 0.2,
    baseHeight: number = BASE_Y,
    droppingSpeed: number = DROPPING_SPEED,
    flappingSpeed: number = FLAPPING_SPEED
  ) {
    this.color = color;
    this.x = SCREEN_WIDTH * xFraction;
    this.y = (SCREEN_HEIGHT - this.height) / 2;
    this.baseHeight = baseHeight;
    this.droppingSpeed = droppingSpeed;
    this.flappingSpeed = flappingSpeed;
  }

  public currentFlapFrame(): BirdFlapFrame {
    return FLAP_SEQUENCE[this.flapFrameIndex];
  }

  public get centerX(): number {
    return this.x + this.width / 2;
  }

  public get bottom(): number {
    return this.y + this.height;
  }

  public flipWingImage(): void {
    this.wingTick += 1;
    if (this.wingTick >= 5) {
      this.flapFrameIndex = (this.flapFrameIndex + 1) % FLAP_SEQUENCE.length;
      this.wingTick = 0;
    }
  }

  public flyInStartInterface(onSound?: (key: SoundKey) => void): void {
    this.flipWingImage();
    onSound?.("wing");
    this.bobCount += 1;
    if (this.bobCount >= 16) {
      this.bobShift = -this.bobShift;
      this.bobCount = 0;
    }
    this.y += this.bobShift;
  }

  public update(dt: number): void {
    this.flipWingImage();
    this.speed -= this.droppingSpeed * dt;
    if (this.y + this.height - this.speed < this.baseHeight) {
      this.y -= this.speed;
    } else {
      this.y = this.baseHeight - this.height;
    }
  }

  public isHittingBoundary(ceiling: number = 0, floor: number = this.baseHeight): boolean {
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

  public collidesWithPipe(pipe: Pipe): boolean {
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

  public isHittingBoundaryOrPipe(pipes: readonly Pipe[]): boolean {
    let dead = this.isHittingBoundary(0, this.baseHeight);
    for (const pipe of pipes) {
      if (this.collidesWithPipe(pipe)) {
        dead = true;
      }
    }
    return dead;
  }

  public setFlapped(onSound?: (key: SoundKey) => void): void {
    this.speed = this.flappingSpeed;
    onSound?.("wing");
  }

  public toggleAutoFlap(onSound?: (key: SoundKey) => void): boolean {
    this.autoFlap = !this.autoFlap;
    onSound?.("wing");
    return this.autoFlap;
  }

  public autoFlapWhenNeeded(pipes: readonly Pipe[], onSound?: (key: SoundKey) => void): void {
    if (!this.autoFlap) {
      return;
    }
    if (this.bottom > this.baseHeight - 10) {
      this.setFlapped(onSound);
      return;
    }

    let minRight = 1000;
    let maxBottom = -1000;
    let leftBottomPipe: Pipe | null = null;

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
}

export class Pipe {
  public x: number;
  public readonly y: number;
  public readonly width = PIPE_WIDTH;
  public readonly height = PIPE_HEIGHT;
  public readonly flyingSpeed: number;
  public readonly top: boolean;
  public usedForScore = false;

  constructor(x: number, y: number, flyingSpeed: number = FLYING_SPEED, kind: "top" | "bottom") {
    this.x = x;
    this.y = y;
    this.flyingSpeed = flyingSpeed;
    this.top = kind === "top";
  }

  public get centerX(): number {
    return this.x + this.width / 2;
  }

  public moveLeft(): void {
    this.x -= this.flyingSpeed;
  }

  public static randomPairY(rng: Rng): { topY: number; bottomY: number } {
    const baseY = BASE_Y_RATIO_HEIGHT;
    const minUp = Math.floor(baseY * 0.2);
    const span = Math.max(1, Math.floor(baseY * 0.6 - PIPE_GAP_SIZE));
    const upY = minUp + rng.randInt(0, span - 1);
    return {
      topY: upY - PIPE_HEIGHT,
      bottomY: upY + PIPE_GAP_SIZE
    };
  }
}

const BASE_Y_RATIO_HEIGHT = 0.79 * SCREEN_HEIGHT;

export class GroundBase {
  public x = 0;
  public readonly y: number;
  public readonly width = BASE_WIDTH;
  public readonly height = 112;
  public readonly diff: number;
  public readonly flyingSpeed: number;

  constructor(y: number = BASE_Y, flyingSpeed: number = FLYING_SPEED) {
    this.y = y;
    this.diff = BASE_WIDTH - SCREEN_WIDTH;
    this.flyingSpeed = flyingSpeed;
  }

  public update(): void {
    this.x = -((-this.x + this.flyingSpeed) % this.diff);
  }
}
