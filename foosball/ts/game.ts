import { FoosballAiController, RngFn } from "./ai";
import {
  BALL_RADIUS,
  DEAD_BALL_SPEED,
  DEAD_BALL_TIMEOUT,
  GOAL_CELEBRATION_TIME,
  HALF_GOAL_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  LIFT_ANGLE,
  ROD_CONFIGS,
  ROD_ROLE_ORDER,
  SERVE_DROP_TIME
} from "./constants";
import { createBallState, createRodState, stepPhysics } from "./physics";
import {
  AiLevel,
  BallState,
  ControlMode,
  GameMode,
  GameOptions,
  MatchPhase,
  PlayerInput,
  PlayerSlot,
  PracticeTarget,
  RodCommand,
  RodRole,
  RodState,
  SoundEvent,
  Team,
  TeamColorTheme
} from "./types";

export function makeRng(seed: number): RngFn {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function emptyInput(): PlayerInput {
  return { slide: 0, kickHeld: false, liftHeld: false };
}

export class FoosballGame {
  public mode: GameMode;
  public aiLevel: AiLevel;
  public targetScore: 5 | 7 | 10;
  public controlMode: ControlMode;
  public strictSpinNotice: boolean;
  public p1OnDefense: boolean;
  public theme: TeamColorTheme;

  public phase: MatchPhase = "menu";
  public score: { blue: number; red: number } = { blue: 0, red: 0 };
  public winner: Team | null = null;
  public lastScorer: Team | null = null;
  public nextServeTeam: Team = "blue";
  public serveSide: 1 | -1 = 1;
  public phaseTimer = 0;

  public deadBallTimer = 0;
  public deadBallResets = 0;
  public spinNoticeTimer = 0;
  public spinNoticeTeam: Team | null = null;

  public practiceHits = 0;
  public practiceStreak = 0;
  public practiceBestStreak = 0;
  public practiceTarget: PracticeTarget = { z: 0, halfWidth: 0.048, pulse: 0 };

  public readonly rods: RodState[];
  public readonly ball: BallState;
  public activeRodRole: { blue: RodRole; red: RodRole } = { blue: "fwd", red: "fwd" };

  private rng: RngFn;
  private redAi: FoosballAiController;
  private blueAi: FoosballAiController | null;
  private inputs: Record<PlayerSlot, PlayerInput> = {
    p1: emptyInput(),
    p2: emptyInput()
  };
  private onSound?: (event: SoundEvent, intensity?: number) => void;

  constructor(options: GameOptions = {}) {
    this.rng = makeRng(options.seed ?? 20261124);
    this.mode = options.mode ?? "1p";
    this.aiLevel = options.aiLevel ?? "rookie";
    this.targetScore = options.targetScore ?? 5;
    this.controlMode = options.controlMode ?? "sync";
    this.strictSpinNotice = options.strictSpinNotice ?? false;
    this.p1OnDefense = options.p1OnDefense ?? true;
    this.theme = options.theme ?? "classic";
    this.onSound = options.onSound;

    this.rods = ROD_CONFIGS.map((cfg) => createRodState(cfg));
    this.ball = createBallState();
    this.redAi = new FoosballAiController("red", this.aiLevel);
    this.blueAi = options.blueAiOverride
      ? new FoosballAiController("blue", options.blueAiOverride)
      : null;
  }

  public setAiLevel(level: AiLevel): void {
    this.aiLevel = level;
    this.redAi.level = level;
  }

  public setMode(mode: GameMode): void {
    this.mode = mode;
  }

  public setTargetScore(target: 5 | 7 | 10): void {
    this.targetScore = target;
  }

  public setControlMode(mode: ControlMode): void {
    this.controlMode = mode;
  }

  public toggleCoopSwap(): boolean {
    this.p1OnDefense = !this.p1OnDefense;
    return this.p1OnDefense;
  }

  public selectRod(team: Team, role: RodRole): void {
    this.activeRodRole[team] = role;
  }

  public cycleActiveRod(team: Team, delta: 1 | -1): RodRole {
    const idx = ROD_ROLE_ORDER.indexOf(this.activeRodRole[team]);
    const next = (idx + delta + ROD_ROLE_ORDER.length) % ROD_ROLE_ORDER.length;
    this.activeRodRole[team] = ROD_ROLE_ORDER[next];
    return this.activeRodRole[team];
  }

  public setPlayerInput(slot: PlayerSlot, input: Partial<PlayerInput>): void {
    const cur = this.inputs[slot];
    if (input.slide !== undefined) cur.slide = input.slide;
    if (input.kickHeld !== undefined) cur.kickHeld = input.kickHeld;
    if (input.liftHeld !== undefined) cur.liftHeld = input.liftHeld;
  }

  public resetRods(): void {
    for (const rod of this.rods) {
      rod.z = 0;
      rod.vz = 0;
      rod.angle = this.mode === "practice" && rod.team === "red" ? LIFT_ANGLE : 0;
      rod.omega = 0;
      rod.kickPhase = "idle";
      rod.chargeTime = 0;
      rod.cooldown = 0;
      rod.prevKickHeld = false;
      rod.hitBallThisSwing = false;
    }
  }

  public startMatch(): void {
    this.score = { blue: 0, red: 0 };
    this.winner = null;
    this.lastScorer = null;
    this.deadBallTimer = 0;
    this.deadBallResets = 0;
    this.spinNoticeTimer = 0;
    this.spinNoticeTeam = null;
    this.practiceHits = 0;
    this.practiceStreak = 0;
    this.nextServeTeam = this.rng() < 0.5 ? "blue" : "red";
    this.redAi.reset();
    if (this.blueAi) this.blueAi.reset();
    this.resetRods();
    this.relocatePracticeTarget();
    this.beginServe(this.nextServeTeam);
    this.emitSound("whistle", 0.8);
  }

  private relocatePracticeTarget(): void {
    const maxOffset = HALF_GOAL_WIDTH - this.practiceTarget.halfWidth - 0.008;
    const prevZ = this.practiceTarget.z;
    let nextZ = (this.rng() * 2 - 1) * maxOffset;
    if (Math.abs(nextZ - prevZ) < 0.03) {
      nextZ = -Math.sign(prevZ || 1) * maxOffset * 0.7;
    }
    this.practiceTarget.z = Math.max(-maxOffset, Math.min(maxOffset, nextZ));
    this.practiceTarget.pulse = 1.0;
  }

  public beginServe(serveTeam: Team): void {
    this.nextServeTeam = serveTeam;
    this.phase = "serving";
    this.phaseTimer = this.mode === "practice" ? 0.25 : SERVE_DROP_TIME;
    this.deadBallTimer = 0;
    this.serveSide = this.rng() < 0.5 ? 1 : -1;

    if (this.mode === "practice") {
      // Serve cleanly near Blue midfield/forward for rapid shot practice
      this.ball.x = 0.04;
      this.ball.z = this.serveSide * (HALF_WIDTH - BALL_RADIUS * 1.4);
      this.ball.vx = 0.14;
      this.ball.vz = -this.serveSide * (0.45 + this.rng() * 0.15);
    } else {
      // Real table side serve hole: bias slightly toward serving team
      const teamBias = serveTeam === "blue" ? -0.025 : 0.025;
      this.ball.x = teamBias;
      this.ball.z = this.serveSide * (HALF_WIDTH - BALL_RADIUS * 1.2);
      this.ball.vx = teamBias * 1.8 + (this.rng() - 0.5) * 0.16;
      this.ball.vz = -this.serveSide * (0.58 + this.rng() * 0.16);
    }
    this.ball.y = BALL_RADIUS + 0.05;
    this.ball.powerGlow = 0;
    this.emitSound("serve", 0.7);
  }

  private emitSound(event: SoundEvent, intensity = 0.8): void {
    if (this.onSound) {
      this.onSound(event, intensity);
    }
  }

  private buildRodCommands(dt: number): RodCommand[] {
    const redAiCmds =
      this.mode === "1p" || this.mode === "2p_coop"
        ? this.redAi.computeCommands(this.ball, this.rods, dt, this.rng)
        : null;
    const blueAiCmds = this.blueAi
      ? this.blueAi.computeCommands(this.ball, this.rods, dt, this.rng)
      : null;

    return this.rods.map((rod): RodCommand => {
      // Practice mode: lift Red rods cleanly out of play
      if (this.mode === "practice" && rod.team === "red") {
        return { slide: 0, kickHeld: false, liftHeld: true };
      }

      if (rod.team === "blue") {
        if (blueAiCmds) {
          return blueAiCmds.get(rod.index) ?? { slide: 0, kickHeld: false, liftHeld: false };
        }
        if (this.mode === "2p_coop") {
          const isDefRod = rod.role === "gk" || rod.role === "def";
          const slot: PlayerSlot = isDefRod
            ? (this.p1OnDefense ? "p1" : "p2")
            : (this.p1OnDefense ? "p2" : "p1");
          const inp = this.inputs[slot];
          return { slide: inp.slide, kickHeld: inp.kickHeld, liftHeld: inp.liftHeld };
        }
        // 1p, 2p_pvp, or practice -> P1 controls Blue
        const inp = this.inputs.p1;
        if (this.controlMode === "advanced" && rod.role !== this.activeRodRole.blue) {
          return { slide: 0, kickHeld: false, liftHeld: false };
        }
        return { slide: inp.slide, kickHeld: inp.kickHeld, liftHeld: inp.liftHeld };
      } else {
        // Red team
        if (redAiCmds) {
          return redAiCmds.get(rod.index) ?? { slide: 0, kickHeld: false, liftHeld: false };
        }
        // 2p_pvp -> P2 controls Red
        const inp = this.inputs.p2;
        if (this.controlMode === "advanced" && rod.role !== this.activeRodRole.red) {
          return { slide: 0, kickHeld: false, liftHeld: false };
        }
        return { slide: inp.slide, kickHeld: inp.kickHeld, liftHeld: inp.liftHeld };
      }
    });
  }

  public step(dt: number): void {
    const clampedDt = Math.max(0, Math.min(0.05, dt));
    this.practiceTarget.pulse = Math.max(0, this.practiceTarget.pulse - clampedDt * 1.5);
    if (this.spinNoticeTimer > 0) {
      this.spinNoticeTimer = Math.max(0, this.spinNoticeTimer - clampedDt);
      if (this.spinNoticeTimer <= 0) this.spinNoticeTeam = null;
    }

    if (this.phase === "menu" || this.phase === "gameover") {
      return;
    }

    if (this.phase === "serving") {
      this.phaseTimer -= clampedDt;
      const frac = Math.max(0, Math.min(1, this.phaseTimer / SERVE_DROP_TIME));
      this.ball.y = BALL_RADIUS + frac * 0.05;
      // Allow players to position rods during serve drop
      const cmds = this.buildRodCommands(clampedDt);
      for (let i = 0; i < this.rods.length; i++) {
        // Keep ball fixed until serve drop finishes, only move rods lightly
        this.rods[i].z = Math.max(
          -this.rods[i].maxSlide,
          Math.min(this.rods[i].maxSlide, this.rods[i].z + cmds[i].slide * 0.7 * clampedDt)
        );
        if (this.mode === "practice" && this.rods[i].team === "red") {
          this.rods[i].angle = LIFT_ANGLE;
        }
      }
      if (this.phaseTimer <= 0) {
        this.ball.y = BALL_RADIUS;
        this.phase = "playing";
      }
      return;
    }

    if (this.phase === "goal") {
      this.phaseTimer -= clampedDt;
      // Let ball settle softly inside goal box
      this.ball.vx *= Math.exp(-5 * clampedDt);
      this.ball.vz *= Math.exp(-5 * clampedDt);
      this.ball.x = Math.max(-HALF_LENGTH - 0.065, Math.min(HALF_LENGTH + 0.065, this.ball.x + this.ball.vx * clampedDt));
      if (this.phaseTimer <= 0) {
        this.beginServe(this.nextServeTeam);
      }
      return;
    }

    // Active play
    const cmds = this.buildRodCommands(clampedDt);
    const res = stepPhysics(this.ball, this.rods, cmds, clampedDt);

    for (const s of res.soundEvents) {
      this.emitSound(s.event, s.intensity);
    }

    if (this.strictSpinNotice && res.spinNoticeTeam) {
      this.spinNoticeTeam = res.spinNoticeTeam;
      this.spinNoticeTimer = 1.2;
    }

    if (res.goalScoredBy) {
      this.handleGoal(res.goalScoredBy);
      return;
    }

    // Dead-ball check (motionless > 2.0s in play)
    const speed = Math.hypot(this.ball.vx, this.ball.vz);
    if (speed < DEAD_BALL_SPEED) {
      this.deadBallTimer += clampedDt;
      if (this.deadBallTimer >= DEAD_BALL_TIMEOUT) {
        this.deadBallResets += 1;
        this.deadBallTimer = 0;
        this.emitSound("whistle", 0.75);
        this.beginServe(this.nextServeTeam);
      }
    } else if (speed > DEAD_BALL_SPEED * 1.4) {
      this.deadBallTimer = 0;
    }
  }

  private handleGoal(scorer: Team): void {
    this.deadBallTimer = 0;
    this.lastScorer = scorer;

    if (this.mode === "practice") {
      if (scorer === "blue") {
        this.score.blue += 1;
        const hitTarget =
          Math.abs(this.ball.z - this.practiceTarget.z) <=
          this.practiceTarget.halfWidth + BALL_RADIUS;
        if (hitTarget) {
          this.practiceHits += 1;
          this.practiceStreak += 1;
          if (this.practiceStreak > this.practiceBestStreak) {
            this.practiceBestStreak = this.practiceStreak;
          }
          this.relocatePracticeTarget();
          this.emitSound("target", 1.0);
        } else {
          this.practiceStreak = 0;
          this.emitSound("goal", 0.85);
        }
      }
      this.phase = "goal";
      this.phaseTimer = 0.7;
      this.nextServeTeam = "blue";
      return;
    }

    if (scorer === "blue") {
      this.score.blue += 1;
      this.nextServeTeam = "red"; // Conceding team serves
    } else {
      this.score.red += 1;
      this.nextServeTeam = "blue";
    }

    this.emitSound("goal", 1.0);

    if (this.score.blue >= this.targetScore) {
      this.winner = "blue";
      this.phase = "gameover";
      this.emitSound("whistle", 1.0);
    } else if (this.score.red >= this.targetScore) {
      this.winner = "red";
      this.phase = "gameover";
      this.emitSound("whistle", 1.0);
    } else {
      this.phase = "goal";
      this.phaseTimer = GOAL_CELEBRATION_TIME;
    }
  }
}
