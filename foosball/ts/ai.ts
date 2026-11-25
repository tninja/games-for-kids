import {
  AI_PRESETS,
  BALL_RADIUS,
  HALF_GOAL_WIDTH,
  HALF_WIDTH,
  WALL_RESTITUTION
} from "./constants";
import { AiLevel, BallState, RodCommand, RodState, Team } from "./types";

export type RngFn = () => number;

interface CachedRodPlan {
  targetZ: number;
  pullDir: number;
  wantCharge: boolean;
  antiOwnGoal: boolean;
  liftClear: boolean;
}

export class FoosballAiController {
  public readonly team: Team;
  public level: AiLevel;
  private decisionTimer = 0;
  private plans: Map<number, CachedRodPlan> = new Map();

  constructor(team: Team, level: AiLevel) {
    this.team = team;
    this.level = level;
  }

  public reset(): void {
    this.decisionTimer = 0;
    this.plans.clear();
  }

  public predictBallZAtX(ball: BallState, targetX: number, maxBounces: number): number {
    const dx = targetX - ball.x;
    if (Math.abs(ball.vx) < 0.04 || dx * ball.vx <= 0) {
      return ball.z;
    }
    const time = Math.min(1.1, dx / ball.vx);
    let simZ = ball.z + ball.vz * time;
    if (maxBounces <= 0) {
      return Math.max(-HALF_WIDTH + BALL_RADIUS, Math.min(HALF_WIDTH - BALL_RADIUS, simZ));
    }

    const limit = HALF_WIDTH - BALL_RADIUS;
    let bounces = 0;
    while ((simZ > limit || simZ < -limit) && bounces < maxBounces) {
      if (simZ > limit) {
        simZ = limit - (simZ - limit) * WALL_RESTITUTION;
      } else {
        simZ = -limit + (-limit - simZ) * WALL_RESTITUTION;
      }
      bounces++;
    }
    return Math.max(-limit, Math.min(limit, simZ));
  }

  private chooseRodOffsetZ(rod: RodState, desiredBallZ: number): number {
    let bestTargetZ = 0;
    let bestErr = Infinity;
    for (let i = 0; i < rod.figureOffsets.length; i++) {
      const candidate = Math.max(-rod.maxSlide, Math.min(rod.maxSlide, desiredBallZ - rod.figureOffsets[i]));
      const figureZ = candidate + rod.figureOffsets[i];
      const err = Math.abs(figureZ - desiredBallZ);
      if (err < bestErr) {
        bestErr = err;
        bestTargetZ = candidate;
      }
    }
    return bestTargetZ;
  }

  public computeCommands(
    ball: BallState,
    rods: readonly RodState[],
    dt: number,
    rng: RngFn
  ): Map<number, RodCommand> {
    const preset = AI_PRESETS[this.level];
    const teamDir = this.team === "blue" ? 1 : -1;

    this.decisionTimer -= dt;
    const refreshDecision = this.decisionTimer <= 0;
    if (refreshDecision) {
      this.decisionTimer = preset.reactionDelay * (0.85 + rng() * 0.3);
    }

    // Locate opponent GK to aim pull shots away from the keeper
    let oppGkZ = 0;
    for (const r of rods) {
      if (r.team !== this.team && r.role === "gk") {
        oppGkZ = r.z;
        break;
      }
    }

    const commands = new Map<number, RodCommand>();

    for (const rod of rods) {
      if (rod.team !== this.team) continue;

      let plan = this.plans.get(rod.index);
      if (!plan || refreshDecision) {
        const predictedZ = this.predictBallZAtX(ball, rod.x, preset.bounceDepth);
        const noise = (rng() * 2 - 1) * preset.positionError;
        let aimZ = predictedZ + noise;

        if (rod.role === "gk") {
          const ballNearOwnHalf = (ball.x - rod.x) * teamDir < 0.72;
          const clampedGoalZ = Math.max(-HALF_GOAL_WIDTH * 0.92, Math.min(HALF_GOAL_WIDTH * 0.92, aimZ));
          aimZ = ballNearOwnHalf ? clampedGoalZ : clampedGoalZ * 0.4;
        }

        const targetZ = this.chooseRodOffsetZ(rod, aimZ);
        const doPull = rng() < preset.pullShotChance;
        // Aim angled pull shot away from opponent goalkeeper
        const openSide = oppGkZ >= 0 ? -1 : 1;
        const pullDir = doPull ? openSide : 0;

        plan = {
          targetZ,
          pullDir,
          wantCharge: rng() < preset.chargeChance,
          antiOwnGoal: rng() < preset.antiOwnGoalChance,
          liftClear: rng() < preset.liftClearChance
        };
        this.plans.set(rod.index, plan);
      }

      // > 0 means ball is on attacking side (in front of rod); < 0 means behind rod
      const relX = (ball.x - rod.x) * teamDir;
      let closestFigDistZ = Infinity;
      let closestFigZ = rod.z;
      for (const off of rod.figureOffsets) {
        const fz = rod.z + off;
        const d = Math.abs(fz - ball.z);
        if (d < closestFigDistZ) {
          closestFigDistZ = d;
          closestFigZ = fz;
        }
      }

      // Friendly shot / clearance approaching from behind -> lift front rod so ball passes through
      const friendlyShotFromBehind =
        rod.role !== "gk" &&
        relX < -0.01 &&
        relX > -0.35 &&
        ball.vx * teamDir > 0.35 &&
        closestFigDistZ < 0.055;

      // Ball trapped just behind rod moving slowly toward our goal -> step aside instead of hitting backward
      const behindOwnGoalRisk =
        rod.role !== "gk" &&
        relX < -0.008 &&
        relX > -0.055 &&
        ball.vx * teamDir <= 0.05 &&
        closestFigDistZ < 0.036;

      let liftHeld = false;
      let kickHeld = false;
      let targetZ: number | null = plan.targetZ;
      let slide = 0;

      if (friendlyShotFromBehind && plan.liftClear) {
        liftHeld = true;
      } else if (behindOwnGoalRisk && plan.antiOwnGoal) {
        // Slide figure out of the ball's path to avoid banking it toward own goal
        const dodgeDir = ball.z >= closestFigZ ? -1 : 1;
        targetZ = rod.z + dodgeDir * 0.055;
      } else {
        const inStrikeZone = relX >= -0.004 && relX <= preset.kickWindow;
        const aligned = closestFigDistZ < 0.038;
        const approachingZone =
          relX > preset.kickWindow &&
          relX < preset.kickWindow + 0.095 &&
          ball.vx * teamDir < -0.1;

        if (rod.kickPhase === "charging") {
          // Release strike as soon as ball is in strike zone or charge timer matures
          if ((inStrikeZone && aligned) || rod.chargeTime >= 0.24) {
            kickHeld = false;
            if (plan.pullDir !== 0) {
              slide = plan.pullDir;
              targetZ = null;
            }
          } else if (relX < -0.02 || relX > preset.kickWindow + 0.14) {
            // Ball left zone; release smoothly
            kickHeld = false;
          } else {
            kickHeld = true;
          }
        } else if (rod.kickPhase === "swinging") {
          // Keep lateral pull motion through swing for crisp angled shot
          if (plan.pullDir !== 0) {
            slide = plan.pullDir;
            targetZ = null;
          }
        } else if (approachingZone && aligned && plan.wantCharge && rod.cooldown <= 0) {
          // Cock back slightly early for a powerful strike
          kickHeld = true;
        } else if (inStrikeZone && aligned && rod.cooldown <= 0) {
          kickHeld = true;
          if (plan.pullDir !== 0) {
            slide = plan.pullDir;
            targetZ = null;
          }
        }
      }

      commands.set(rod.index, {
        slide,
        kickHeld,
        liftHeld,
        targetZ,
        maxSpeedScale: preset.maxSpeedScale
      });
    }

    return commands;
  }
}
