import {
  BALL_RADIUS,
  BALL_ROLL_DRAG,
  CHARGE_BONUS_MULTIPLIER,
  CORNER_RAMP_ACCEL,
  CORNER_RAMP_SIZE,
  FIGURE_FOOT_DEPTH,
  FIGURE_LEG_LENGTH,
  FIGURE_WIDTH,
  GOAL_DEPTH,
  HALF_GOAL_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  KICK_COOLDOWN,
  LIFT_ANGLE,
  LIFT_CLEARANCE_ANGLE,
  MAX_BALL_SPEED,
  MAX_CHARGE_TIME,
  MAX_SWING_ANGLE,
  PHYSICS_SUBSTEPS,
  POST_RESTITUTION,
  PULL_SHOT_FRICTION,
  ROD_SLIDE_ACCEL,
  ROD_SLIDE_SPEED,
  SWING_DURATION,
  TAP_KICK_SPEED,
  WALL_RESTITUTION
} from "./constants";
import { BallState, RodCommand, RodConfig, RodState, SoundEvent, Team } from "./types";

export interface PhysicsStepResult {
  goalScoredBy: Team | null;
  spinNoticeTeam: Team | null;
  soundEvents: Array<{ event: SoundEvent; intensity: number }>;
}

export function createRodState(cfg: RodConfig): RodState {
  return {
    index: cfg.index,
    team: cfg.team,
    role: cfg.role,
    x: cfg.x,
    z: 0,
    vz: 0,
    angle: 0,
    omega: 0,
    figureOffsets: cfg.figureOffsets,
    maxSlide: cfg.maxSlide,
    kickPhase: "idle",
    chargeTime: 0,
    swingTimer: 0,
    swingDuration: SWING_DURATION,
    swingStartAngle: 0,
    swingTargetAngle: MAX_SWING_ANGLE,
    swingPower: 1,
    cooldown: 0,
    prevKickHeld: false,
    hitBallThisSwing: false
  };
}

export function createBallState(): BallState {
  return {
    x: 0,
    y: BALL_RADIUS,
    z: 0,
    vx: 0,
    vz: 0,
    spinX: 0,
    spinZ: 0,
    powerGlow: 0
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function approach(current: number, target: number, maxDelta: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

export function stepRod(
  rod: RodState,
  cmd: RodCommand,
  dt: number,
  sounds: Array<{ event: SoundEvent; intensity: number }>
): boolean {
  let spinNotice = false;
  const prevAngle = rod.angle;
  const maxSpeed = ROD_SLIDE_SPEED * (cmd.maxSpeedScale ?? 1.0);

  // Lateral sliding motion (direct input or AI targetZ)
  let desiredVz = clamp(cmd.slide, -1, 1) * maxSpeed;
  if (cmd.targetZ !== undefined && cmd.targetZ !== null) {
    const err = clamp(cmd.targetZ, -rod.maxSlide, rod.maxSlide) - rod.z;
    desiredVz = clamp(err * 14.0, -maxSpeed, maxSpeed);
  }
  rod.vz = approach(rod.vz, desiredVz, ROD_SLIDE_ACCEL * dt);
  rod.z += rod.vz * dt;

  // Rubber bumper clamp at rod limits
  if (rod.z > rod.maxSlide) {
    if (rod.vz > 0.35) sounds.push({ event: "bumper", intensity: Math.min(1, rod.vz) });
    rod.z = rod.maxSlide;
    rod.vz = -rod.vz * 0.15;
  } else if (rod.z < -rod.maxSlide) {
    if (rod.vz < -0.35) sounds.push({ event: "bumper", intensity: Math.min(1, -rod.vz) });
    rod.z = -rod.maxSlide;
    rod.vz = -rod.vz * 0.15;
  }

  if (rod.cooldown > 0) {
    rod.cooldown = Math.max(0, rod.cooldown - dt);
  }

  const kickJustPressed = cmd.kickHeld && !rod.prevKickHeld;
  const kickJustReleased = !cmd.kickHeld && rod.prevKickHeld;

  if (rod.kickPhase === "swinging") {
    rod.swingTimer += dt;
    const t = clamp(rod.swingTimer / rod.swingDuration, 0, 1);
    // Snappy ease-out curve for crisp foosball wrist flick
    const eased = 1 - Math.pow(1 - t, 2.2);
    rod.angle = rod.swingStartAngle + (rod.swingTargetAngle - rod.swingStartAngle) * eased;
    if (t >= 1) {
      rod.kickPhase = "recovering";
      rod.cooldown = KICK_COOLDOWN;
    }
    if (kickJustPressed) {
      spinNotice = true;
    }
  } else if (rod.kickPhase === "charging") {
    if (cmd.kickHeld) {
      rod.chargeTime = Math.min(MAX_CHARGE_TIME, rod.chargeTime + dt);
      const frac = rod.chargeTime / MAX_CHARGE_TIME;
      const targetBack = -0.24 - 0.7 * frac;
      rod.angle = approach(rod.angle, targetBack, 8.5 * dt);
    } else if (kickJustReleased || !cmd.kickHeld) {
      const frac = rod.chargeTime / MAX_CHARGE_TIME;
      rod.swingPower = 1.0 + CHARGE_BONUS_MULTIPLIER * frac;
      rod.swingStartAngle = rod.angle;
      rod.swingTargetAngle = MAX_SWING_ANGLE;
      rod.swingDuration = SWING_DURATION * (1.0 - 0.14 * frac);
      rod.swingTimer = 0;
      rod.hitBallThisSwing = false;
      rod.kickPhase = "swinging";
    }
  } else {
    // idle or recovering
    if (kickJustPressed) {
      if (rod.cooldown > 0.02) {
        spinNotice = true;
      } else {
        rod.kickPhase = "charging";
        rod.chargeTime = 0;
      }
    } else if (cmd.liftHeld) {
      rod.kickPhase = "idle";
      rod.angle = approach(rod.angle, LIFT_ANGLE, 15.0 * dt);
    } else {
      rod.angle = approach(rod.angle, 0, 9.5 * dt);
      if (rod.kickPhase === "recovering" && Math.abs(rod.angle) < 0.08 && rod.cooldown <= 0) {
        rod.kickPhase = "idle";
      }
    }
  }

  // Strictly bound rod angle to prevent 360-degree spinning
  rod.angle = clamp(rod.angle, -1.05, LIFT_ANGLE);
  rod.omega = dt > 1e-6 ? (rod.angle - prevAngle) / dt : 0;
  rod.prevKickHeld = cmd.kickHeld;
  return spinNotice;
}

function collideBallWithFigures(
  ball: BallState,
  rod: RodState,
  sounds: Array<{ event: SoundEvent; intensity: number }>
): void {
  // If rod is lifted flat above clearance angle, ball passes cleanly underneath
  if (Math.abs(rod.angle) >= LIFT_CLEARANCE_ANGLE) {
    return;
  }

  const teamDir = rod.team === "blue" ? 1 : -1;
  const footX = rod.x + Math.sin(rod.angle) * FIGURE_LEG_LENGTH * teamDir;
  const halfX = FIGURE_FOOT_DEPTH * 0.5;
  const halfZ = FIGURE_WIDTH * 0.5;

  // Quick broadphase check along X
  if (Math.abs(ball.x - footX) > halfX + BALL_RADIUS + 0.012) {
    return;
  }

  for (let i = 0; i < rod.figureOffsets.length; i++) {
    const footZ = rod.z + rod.figureOffsets[i];
    const minX = footX - halfX;
    const maxX = footX + halfX;
    const minZ = footZ - halfZ;
    const maxZ = footZ + halfZ;

    const closestX = clamp(ball.x, minX, maxX);
    const closestZ = clamp(ball.z, minZ, maxZ);
    const dx = ball.x - closestX;
    const dz = ball.z - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq >= BALL_RADIUS * BALL_RADIUS) {
      continue;
    }

    let nx = 0;
    let nz = 0;
    let penetration = 0;
    if (distSq > 1e-10) {
      const dist = Math.sqrt(distSq);
      nx = dx / dist;
      nz = dz / dist;
      penetration = BALL_RADIUS - dist;
    } else {
      // Ball center inside foot footprint: push along kick direction
      nx = teamDir;
      nz = 0;
      penetration = BALL_RADIUS + halfX;
    }

    ball.x += nx * (penetration + 0.0005);
    ball.z += nz * (penetration + 0.0005);

    const isForwardSwing = rod.kickPhase === "swinging" && rod.omega > 1.5;

    if (isForwardSwing && !rod.hitBallThisSwing) {
      rod.hitBallThisSwing = true;
      const baseKick = TAP_KICK_SPEED * rod.swingPower;
      const forwardSign = nx * teamDir >= -0.25 ? teamDir : Math.sign(nx || teamDir);
      const kickVx = forwardSign * Math.max(baseKick, Math.abs(ball.vx) * 0.55 + baseKick * 0.72);
      const offCenterZ = clamp((ball.z - footZ) / (halfZ + BALL_RADIUS), -1, 1);
      const pullVz = rod.vz * PULL_SHOT_FRICTION;
      ball.vx = kickVx;
      ball.vz = ball.vz * 0.32 + pullVz + offCenterZ * 0.28;
      if (rod.swingPower >= 1.3) {
        ball.powerGlow = 1.0;
        sounds.push({ event: "powerKick", intensity: clamp(rod.swingPower / 1.78, 0.5, 1) });
      } else {
        sounds.push({ event: "kick", intensity: 0.72 });
      }
    } else {
      const footVx = Math.cos(rod.angle) * rod.omega * FIGURE_LEG_LENGTH * teamDir;
      const footVz = rod.vz;
      const rvx = ball.vx - footVx;
      const rvz = ball.vz - footVz;
      const vn = rvx * nx + rvz * nz;

      if (vn < 0) {
        // Charging backswing softens impact for trapping/blocking
        const restitution = rod.kickPhase === "charging" ? 0.28 : 0.64;
        const j = -(1 + restitution) * vn;
        ball.vx += j * nx;
        ball.vz += j * nz;
        // Lateral friction from moving rod
        ball.vz += (footVz - ball.vz) * 0.16;
        if (Math.abs(vn) > 0.18) {
          sounds.push({ event: "kick", intensity: clamp(Math.abs(vn) / 1.6, 0.2, 0.75) });
        }
      }
    }

    // Clamp max ball speed after impact
    const speed = Math.hypot(ball.vx, ball.vz);
    if (speed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / speed;
      ball.vx *= scale;
      ball.vz *= scale;
    }
  }
}

function collideGoalPost(
  ball: BallState,
  px: number,
  pz: number,
  sounds: Array<{ event: SoundEvent; intensity: number }>
): void {
  const postRadius = 0.008;
  const dx = ball.x - px;
  const dz = ball.z - pz;
  const minDist = BALL_RADIUS + postRadius;
  const distSq = dx * dx + dz * dz;
  if (distSq < minDist * minDist && distSq > 1e-10) {
    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const nz = dz / dist;
    ball.x = px + nx * (minDist + 0.0004);
    ball.z = pz + nz * (minDist + 0.0004);
    const vn = ball.vx * nx + ball.vz * nz;
    if (vn < 0) {
      ball.vx -= (1 + POST_RESTITUTION) * vn * nx;
      ball.vz -= (1 + POST_RESTITUTION) * vn * nz;
      if (Math.abs(vn) > 0.18) {
        sounds.push({ event: "post", intensity: clamp(Math.abs(vn) / 1.8, 0.25, 1) });
      }
    }
  }
}

export function stepPhysics(
  ball: BallState,
  rods: RodState[],
  commands: readonly RodCommand[],
  dt: number
): PhysicsStepResult {
  const sounds: Array<{ event: SoundEvent; intensity: number }> = [];
  let goalScoredBy: Team | null = null;
  let spinNoticeTeam: Team | null = null;

  const subDt = dt / PHYSICS_SUBSTEPS;

  for (let s = 0; s < PHYSICS_SUBSTEPS; s++) {
    // 1. Update all 8 rods
    for (let i = 0; i < rods.length; i++) {
      const notice = stepRod(rods[i], commands[i], subDt, sounds);
      if (notice) {
        spinNoticeTeam = rods[i].team;
      }
    }

    // 2. Corner anti-dead-ball ramps
    const cornerX = HALF_LENGTH - CORNER_RAMP_SIZE;
    const cornerZ = HALF_WIDTH - CORNER_RAMP_SIZE;
    if (Math.abs(ball.x) > cornerX && Math.abs(ball.z) > cornerZ) {
      const rx = (Math.abs(ball.x) - cornerX) / CORNER_RAMP_SIZE;
      const rz = (Math.abs(ball.z) - cornerZ) / CORNER_RAMP_SIZE;
      if (rx + rz > 0.65) {
        ball.vx -= Math.sign(ball.x) * CORNER_RAMP_ACCEL * subDt;
        ball.vz -= Math.sign(ball.z) * CORNER_RAMP_ACCEL * subDt;
      }
    }

    // 3. Rolling drag & integrate ball position
    const drag = Math.exp(-BALL_ROLL_DRAG * subDt);
    ball.vx *= drag;
    ball.vz *= drag;

    const speed = Math.hypot(ball.vx, ball.vz);
    if (speed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / speed;
      ball.vx *= scale;
      ball.vz *= scale;
    }

    ball.x += ball.vx * subDt;
    ball.z += ball.vz * subDt;
    ball.y = BALL_RADIUS;
    ball.spinZ = -ball.vx / BALL_RADIUS;
    ball.spinX = ball.vz / BALL_RADIUS;
    ball.powerGlow = Math.max(0, ball.powerGlow - subDt * 1.8);

    // 4. Collide ball with all 8 rods' figures
    for (let i = 0; i < rods.length; i++) {
      collideBallWithFigures(ball, rods[i], sounds);
    }

    // 5. Side wall collisions (Z = +/- HALF_WIDTH)
    const maxZ = HALF_WIDTH - BALL_RADIUS;
    if (ball.z > maxZ) {
      ball.z = maxZ;
      if (ball.vz > 0) {
        if (ball.vz > 0.16) sounds.push({ event: "wood", intensity: clamp(ball.vz / 1.8, 0.15, 0.9) });
        ball.vz = -ball.vz * WALL_RESTITUTION;
      }
    } else if (ball.z < -maxZ) {
      ball.z = -maxZ;
      if (ball.vz < 0) {
        if (-ball.vz > 0.16) sounds.push({ event: "wood", intensity: clamp(-ball.vz / 1.8, 0.15, 0.9) });
        ball.vz = -ball.vz * WALL_RESTITUTION;
      }
    }

    // 6. Goal posts at x = +/- HALF_LENGTH, z = +/- HALF_GOAL_WIDTH
    collideGoalPost(ball, -HALF_LENGTH, -HALF_GOAL_WIDTH, sounds);
    collideGoalPost(ball, -HALF_LENGTH, HALF_GOAL_WIDTH, sounds);
    collideGoalPost(ball, HALF_LENGTH, -HALF_GOAL_WIDTH, sounds);
    collideGoalPost(ball, HALF_LENGTH, HALF_GOAL_WIDTH, sounds);

    // 7. End walls and goal mouths (X = +/- HALF_LENGTH)
    const inGoalMouth = Math.abs(ball.z) < HALF_GOAL_WIDTH - BALL_RADIUS * 0.35;
    const maxX = HALF_LENGTH - BALL_RADIUS;

    if (!inGoalMouth) {
      if (ball.x > maxX) {
        ball.x = maxX;
        if (ball.vx > 0) {
          if (ball.vx > 0.16) sounds.push({ event: "wood", intensity: clamp(ball.vx / 1.8, 0.15, 0.9) });
          ball.vx = -ball.vx * WALL_RESTITUTION;
        }
      } else if (ball.x < -maxX) {
        ball.x = -maxX;
        if (ball.vx < 0) {
          if (-ball.vx > 0.16) sounds.push({ event: "wood", intensity: clamp(-ball.vx / 1.8, 0.15, 0.9) });
          ball.vx = -ball.vx * WALL_RESTITUTION;
        }
      }
    } else {
      // Clamp inside goal box depth and detect goal line crossing
      const backLimit = HALF_LENGTH + GOAL_DEPTH - BALL_RADIUS;
      if (ball.x > backLimit) {
        ball.x = backLimit;
        ball.vx = -ball.vx * 0.25;
      } else if (ball.x < -backLimit) {
        ball.x = -backLimit;
        ball.vx = -ball.vx * 0.25;
      }
      if (goalScoredBy === null) {
        if (ball.x > HALF_LENGTH + BALL_RADIUS * 0.25) {
          goalScoredBy = "blue";
        } else if (ball.x < -HALF_LENGTH - BALL_RADIUS * 0.25) {
          goalScoredBy = "red";
        }
      }
    }
  }

  return { goalScoredBy, spinNoticeTeam, soundEvents: sounds };
}
