import { Bird, GroundBase, makeRng, Pipe } from "./sprites";
import {
  BASE_Y,
  BIRD_COLORS,
  BirdColor,
  DROPPING_SPEED,
  FLAPPING_SPEED,
  FLYING_SPEED,
  GamePhase,
  PlayerMode,
  Rng,
  SCREEN_WIDTH,
  SoundKey,
  STORAGE_KEY,
  StorageLike,
  ThemeConfig
} from "./types";

export interface FlappyGameOptions {
  seed?: number;
  storage?: StorageLike | null;
  onSound?: (key: SoundKey) => void;
}

export class FlappyGame {
  public readonly rng: Rng;
  public readonly storage: StorageLike | null;
  public onSound?: (key: SoundKey) => void;
  public phase: GamePhase = "start";
  public mode: PlayerMode = "1p";
  public theme!: ThemeConfig;
  public ground!: GroundBase;
  public bird1!: Bird;
  public bird2: Bird | null = null;
  public pipes: Pipe[] = [];
  public score = 0;
  public bestScore = 0;
  public soundsPlayed: SoundKey[] = [];
  private canAddPipe = true;

  constructor(options: FlappyGameOptions = {}) {
    const seed =
      options.seed !== undefined
        ? options.seed
        : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    this.rng = makeRng(seed);
    this.storage = options.storage ?? null;
    this.onSound = options.onSound;
    this.bestScore = this.loadBestScore();
    this.resetToStart();
  }

  private loadBestScore(): number {
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

  private saveBestScore(): void {
    const whole = Math.floor(this.score);
    if (whole > this.bestScore) {
      this.bestScore = whole;
      if (this.storage) {
        try {
          this.storage.setItem(STORAGE_KEY, String(this.bestScore));
        } catch {
          // Ignore storage quota or privacy-mode errors.
        }
      }
    }
  }

  private emitSound = (key: SoundKey): void => {
    this.soundsPlayed.push(key);
    if (this.soundsPlayed.length > 64) {
      this.soundsPlayed.shift();
    }
    this.onSound?.(key);
  };

  private pickTheme(): ThemeConfig {
    const bird1Color = this.rng.choice(BIRD_COLORS);
    const others = BIRD_COLORS.filter((c) => c !== bird1Color) as BirdColor[];
    const bird2Color = this.rng.choice(others);
    return {
      background: this.rng.choice(["day", "night"] as const),
      pipe: this.rng.choice(["green", "red"] as const),
      bird1Color,
      bird2Color
    };
  }

  public resetToStart(): void {
    this.phase = "start";
    this.score = 0;
    this.pipes = [];
    this.canAddPipe = true;
    this.theme = this.pickTheme();
    this.ground = new GroundBase(BASE_Y, FLYING_SPEED);
    this.bird1 = new Bird(this.theme.bird1Color, 0.2, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
    this.bird2 = new Bird(this.theme.bird2Color, 0.05, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
  }

  private addPipePair(x: number): void {
    const pos = Pipe.randomPairY(this.rng);
    this.pipes.push(new Pipe(x, pos.topY, FLYING_SPEED, "top"));
    this.pipes.push(new Pipe(x, pos.bottomY, FLYING_SPEED, "bottom"));
  }

  public startGame(mode: PlayerMode = "1p"): void {
    this.mode = mode;
    this.phase = "playing";
    this.score = 0;
    this.canAddPipe = true;
    this.theme = this.pickTheme();
    this.ground = new GroundBase(BASE_Y, FLYING_SPEED);
    this.bird1 = new Bird(this.theme.bird1Color, 0.2, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED);
    this.bird2 =
      mode === "2p"
        ? new Bird(this.theme.bird2Color, 0.05, BASE_Y, DROPPING_SPEED, FLAPPING_SPEED)
        : null;
    this.pipes = [];
    for (let i = 0; i < 2; i++) {
      this.addPipePair(SCREEN_WIDTH + 200 + (i * SCREEN_WIDTH) / 2);
    }
    this.emitSound("swoosh");
  }

  public flap(playerIndex: 1 | 2): boolean {
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

  public toggleAutoFlap(playerIndex: 1 | 2): boolean {
    if (playerIndex === 1) {
      return this.bird1.toggleAutoFlap(this.emitSound);
    }
    if (playerIndex === 2 && this.bird2) {
      return this.bird2.toggleAutoFlap(this.emitSound);
    }
    return false;
  }

  public step(dt: number): void {
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

    const nextPipes: Pipe[] = [];
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
}
