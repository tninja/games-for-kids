import { DISH_SPECS, PALETTE } from "./constants";
import {
  ActiveDishState,
  DifficultyMode,
  DishId,
  Particle,
  PieDishState,
  PopcornDishState,
  SoundEvent,
  StepInput,
  ToastDishState
} from "./types";

export interface DishStepResult {
  completed: boolean;
  stars: 1 | 2 | 3;
  score: number;
  dishesMade: number;
  particles: Particle[];
  sounds: SoundEvent[];
}

export type RngFn = () => number;

export function createDishState(dishId: DishId, difficulty: DifficultyMode): ActiveDishState {
  const spec = DISH_SPECS[dishId];
  const isCozy = difficulty === "cozy";
  const target = isCozy ? spec.cozyTarget : spec.bustlingTarget;
  const timeLeftSec = isCozy ? null : spec.bustlingTimeSec;

  if (dishId === "golden_toast") {
    return {
      kind: "golden_toast",
      plated: 0,
      target,
      score: 0,
      streak: 0,
      timeLeftSec,
      spawnTimer: 0.4,
      nextId: 1,
      slices: [],
      toasterSquash: 0,
      birdAssistTimer: 0,
      feedbackText: "Ready to toast!",
      feedbackTimer: 1.2
    };
  }

  if (dishId === "flying_popcorn") {
    return {
      kind: "flying_popcorn",
      caught: 0,
      target,
      score: 0,
      streak: 0,
      timeLeftSec,
      bowlX: 0.5,
      bowlWobble: 0,
      spawnTimer: 0.35,
      nextId: 1,
      items: [],
      birdX: 0.25,
      birdAssistTimer: 0,
      feedbackText: "Slide bowl to catch!",
      feedbackTimer: 1.2
    };
  }

  return {
    kind: "pumpkin_pie",
    piesFinished: 0,
    target,
    score: 0,
    timeLeftSec,
    stage: "whipping",
    whipProgress: 0,
    creamDots: [],
    cookieDropY: 0,
    celebrateTimer: 0,
    lastPointerX: null,
    birdAssistTimer: 0,
    feedbackText: "Swirl whipped cream!",
    feedbackTimer: 1.2
  };
}

function makeBurst(
  x: number,
  y: number,
  color: string,
  count: number,
  shape: Particle["shape"],
  rng: RngFn
): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (rng() - 0.5) * 0.4;
    const speed = 60 + rng() * 110;
    out.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      color,
      size: 4 + rng() * 5,
      life: 0,
      maxLife: 0.45 + rng() * 0.35,
      shape
    });
  }
  return out;
}

function computeStars(
  difficulty: DifficultyMode,
  made: number,
  target: number,
  score: number
): 1 | 2 | 3 {
  if (difficulty === "cozy") {
    if (made >= target && score >= target * 110) {
      return 3;
    }
    if (made >= target) {
      return 2;
    }
    return 1;
  }
  if (made >= target && score >= target * 130) {
    return 3;
  }
  if (made >= Math.ceil(target * 0.7)) {
    return 2;
  }
  return 1;
}

function stepToastDish(
  dish: ToastDishState,
  difficulty: DifficultyMode,
  dt: number,
  input: StepInput,
  rng: RngFn
): DishStepResult {
  const particles: Particle[] = [];
  const sounds: SoundEvent[] = [];
  const isCozy = difficulty === "cozy";

  dish.toasterSquash = Math.max(0, dish.toasterSquash - dt * 3.5);
  dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
  dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);

  if (dish.timeLeftSec !== null) {
    dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
  }

  // Spawn new toast slices when none or timer elapsed
  const activeFlying = dish.slices.filter((s) => s.state === "flying").length;
  dish.spawnTimer -= dt;
  const maxSimultaneous = isCozy ? 1 : 2;
  if (dish.spawnTimer <= 0 && activeFlying < maxSimultaneous && dish.plated < dish.target) {
    const startX = 0.42 + rng() * 0.16;
    const vy = isCozy ? -0.92 : -1.06;
    dish.slices.push({
      id: dish.nextId++,
      x: startX,
      y: 0.72,
      vx: (rng() - 0.5) * (isCozy ? 0.12 : 0.24),
      vy,
      rotation: (rng() - 0.5) * 0.25,
      state: "flying",
      age: 0
    });
    dish.toasterSquash = 1;
    dish.spawnTimer = isCozy ? 1.55 : 1.05;
    sounds.push("toast_pop");
  }

  // Golden zone vertical normalized range (top=0, bottom=1)
  const goldenMinY = isCozy ? 0.14 : 0.20;
  const goldenMaxY = isCozy ? 0.56 : 0.48;

  if (input.primaryTap) {
    let bestIndex = -1;
    let bestDist = 999;
    const idealY = (goldenMinY + goldenMaxY) * 0.5;
    for (let i = 0; i < dish.slices.length; i++) {
      const s = dish.slices[i];
      if (s.state === "flying" && s.y >= goldenMinY && s.y <= goldenMaxY) {
        const d = Math.abs(s.y - idealY);
        if (d < bestDist) {
          bestDist = d;
          bestIndex = i;
        }
      }
    }
    if (bestIndex >= 0) {
      const caught = dish.slices[bestIndex];
      caught.state = "caught";
      caught.age = 0;
      dish.plated += 1;
      dish.streak += 1;
      const bonus = bestDist < 0.08 ? 40 : 15;
      dish.score += 100 + bonus + Math.min(dish.streak - 1, 4) * 20;
      dish.feedbackText = bestDist < 0.08 ? "Golden Perfect!" : "Yummy Buttered!";
      dish.feedbackTimer = 0.85;
      sounds.push("good_catch");
      particles.push(...makeBurst(caught.x * 420, caught.y * 440, PALETTE.butter, 10, "star", rng));
    } else if (activeFlying > 0) {
      dish.streak = 0;
      dish.feedbackText = "Wait for the golden glow!";
      dish.feedbackTimer = 0.65;
      sounds.push("silly_bonk");
    }
  }

  // Update toast physics
  const gravity = isCozy ? 1.02 : 1.38;
  const kept: typeof dish.slices = [];
  for (let i = 0; i < dish.slices.length; i++) {
    const s = dish.slices[i];
    s.age += dt;
    if (s.state === "flying") {
      s.x = Math.max(0.16, Math.min(0.84, s.x + s.vx * dt));
      s.y += s.vy * dt;
      s.vy += gravity * dt;
      s.rotation += (s.vx * 2.2) * dt;

      if (s.y > 0.74 && s.vy > 0) {
        if (isCozy) {
          // Little Bird helper rescues missed toast in Cozy mode
          s.state = "rescued";
          s.age = 0;
          dish.plated += 1;
          dish.score += 80;
          dish.birdAssistTimer = 0.9;
          dish.feedbackText = "Little Bird caught it!";
          dish.feedbackTimer = 0.95;
          sounds.push("bird_rescue");
          particles.push(...makeBurst(s.x * 420, 310, PALETTE.birdYellow, 8, "star", rng));
        } else {
          s.state = "hat_bounce";
          s.age = 0;
          s.vy = -0.35;
          dish.streak = 0;
          dish.feedbackText = "Boing! Off Chef's hat!";
          dish.feedbackTimer = 0.75;
          sounds.push("silly_bonk");
          particles.push(...makeBurst(s.x * 420, 320, PALETTE.pumpkinGold, 6, "crumb", rng));
        }
      }
      kept.push(s);
    } else {
      // Animate caught/rescued/hat_bounce briefly then remove
      if (s.state === "hat_bounce") {
        s.y += s.vy * dt;
        s.vy += 1.4 * dt;
        s.rotation += 4 * dt;
      }
      if (s.age < 0.45) {
        kept.push(s);
      }
    }
  }
  dish.slices = kept;

  const done = dish.plated >= dish.target || (dish.timeLeftSec !== null && dish.timeLeftSec <= 0);
  if (done) {
    sounds.push("dish_win");
  }
  return {
    completed: done,
    stars: computeStars(difficulty, dish.plated, dish.target, dish.score),
    score: dish.score,
    dishesMade: dish.plated,
    particles,
    sounds
  };
}

function stepPopcornDish(
  dish: PopcornDishState,
  difficulty: DifficultyMode,
  dt: number,
  input: StepInput,
  rng: RngFn
): DishStepResult {
  const particles: Particle[] = [];
  const sounds: SoundEvent[] = [];
  const isCozy = difficulty === "cozy";

  dish.bowlWobble = Math.max(0, dish.bowlWobble - dt * 3.2);
  dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
  dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);

  if (dish.timeLeftSec !== null) {
    dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
  }

  // Move bowl via pointer drag or directional button/keys
  if (input.pointerXNorm !== null) {
    const targetX = Math.max(0.14, Math.min(0.86, input.pointerXNorm));
    dish.bowlX += (targetX - dish.bowlX) * Math.min(1, dt * 18);
  } else if (input.moveDir !== 0) {
    const speed = isCozy ? 0.72 : 0.88;
    dish.bowlX = Math.max(0.14, Math.min(0.86, dish.bowlX + input.moveDir * speed * dt));
  }

  // Spawn kernels and occasional silly carrots from skillet
  dish.spawnTimer -= dt;
  if (dish.spawnTimer <= 0 && dish.caught < dish.target) {
    const roll = rng();
    const carrotChance = isCozy ? 0.14 : 0.24;
    const itemType: "kernel" | "golden_kernel" | "carrot" =
      roll < carrotChance ? "carrot" : roll < carrotChance + 0.18 ? "golden_kernel" : "kernel";
    const targetLandX = 0.16 + rng() * 0.68;
    const startX = 0.5 + (rng() - 0.5) * 0.14;
    dish.items.push({
      id: dish.nextId++,
      x: startX,
      y: 0.26,
      vx: (targetLandX - startX) * (isCozy ? 0.68 : 0.85),
      vy: -(0.35 + rng() * 0.22),
      itemType,
      rotation: rng() * Math.PI * 2,
      rescued: false
    });
    dish.spawnTimer = isCozy ? 0.78 : 0.52;
    sounds.push("toast_pop");
  }

  const gravity = isCozy ? 0.82 : 1.15;
  const catchHalfW = isCozy ? 0.145 : 0.115;
  const kept: typeof dish.items = [];

  for (let i = 0; i < dish.items.length; i++) {
    const it = dish.items[i];
    it.x = Math.max(0.08, Math.min(0.92, it.x + it.vx * dt));
    it.y += it.vy * dt;
    it.vy += gravity * dt;
    it.rotation += 2.6 * dt;

    // Bowl catch band
    if (it.y >= 0.74 && it.y <= 0.84 && it.vy > 0 && Math.abs(it.x - dish.bowlX) <= catchHalfW) {
      if (it.itemType === "carrot") {
        dish.bowlWobble = 1;
        dish.streak = 0;
        dish.feedbackText = "Oops! Silly carrot!";
        dish.feedbackTimer = 0.8;
        sounds.push("silly_bonk");
        particles.push(...makeBurst(it.x * 420, 340, PALETTE.mapleCrimson, 7, "crumb", rng));
      } else {
        const pts = it.itemType === "golden_kernel" ? 160 : 100;
        dish.caught += it.itemType === "golden_kernel" ? 2 : 1;
        dish.streak += 1;
        dish.score += pts + Math.min(dish.streak - 1, 5) * 15;
        dish.feedbackText = it.itemType === "golden_kernel" ? "Golden Butter Pop! +2" : "Pop! Nice catch!";
        dish.feedbackTimer = 0.7;
        sounds.push("good_catch");
        particles.push(
          ...makeBurst(
            it.x * 420,
            340,
            it.itemType === "golden_kernel" ? PALETTE.butter : PALETTE.cream,
            8,
            "star",
            rng
          )
        );
      }
      continue;
    }

    // Missed bottom of stage
    if (it.y > 0.88) {
      if (isCozy && it.itemType !== "carrot" && !it.rescued) {
        // AI Little Bird swoops in to save stray popcorn in Cozy mode
        dish.birdX = it.x;
        dish.birdAssistTimer = 0.75;
        dish.caught += 1;
        dish.score += 75;
        dish.feedbackText = "Little Bird scooped it!";
        dish.feedbackTimer = 0.8;
        sounds.push("bird_rescue");
        particles.push(...makeBurst(it.x * 420, 360, PALETTE.birdYellow, 6, "star", rng));
      }
      continue;
    }

    kept.push(it);
  }
  dish.items = kept;

  // Bird gently tracks leftmost kernel for lively motion
  if (dish.items.length > 0 && dish.birdAssistTimer <= 0) {
    dish.birdX += (dish.items[0].x - dish.birdX) * Math.min(1, dt * 3);
  }

  const done = dish.caught >= dish.target || (dish.timeLeftSec !== null && dish.timeLeftSec <= 0);
  if (done) {
    sounds.push("dish_win");
  }
  return {
    completed: done,
    stars: computeStars(difficulty, dish.caught, dish.target, dish.score),
    score: dish.score,
    dishesMade: dish.caught,
    particles,
    sounds
  };
}

function stepPieDish(
  dish: PieDishState,
  difficulty: DifficultyMode,
  dt: number,
  input: StepInput,
  rng: RngFn
): DishStepResult {
  const particles: Particle[] = [];
  const sounds: SoundEvent[] = [];
  const isCozy = difficulty === "cozy";

  dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
  dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);

  if (dish.timeLeftSec !== null) {
    dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
  }

  if (dish.stage === "whipping") {
    let added = 0;
    if (input.swipeDelta > 0.01) {
      added += input.swipeDelta * (isCozy ? 0.95 : 0.72);
    }
    if (input.primaryTap) {
      added += isCozy ? 0.24 : 0.17;
    }
    if (added > 0) {
      const prevDots = dish.creamDots.length;
      dish.whipProgress = Math.min(1, dish.whipProgress + added);
      const desiredDots = Math.floor(dish.whipProgress * 16);
      for (let d = prevDots; d < desiredDots; d++) {
        const angle = (Math.PI * 2 * d) / 16;
        dish.creamDots.push({
          angle,
          radius: 0.68 + (d % 2) * 0.08,
          size: 13 + (d % 3) * 2
        });
      }
      if (desiredDots > prevDots) {
        sounds.push("cream_swirl");
        particles.push(...makeBurst(210, 230, PALETTE.cream, 5, "circle", rng));
      }
      dish.feedbackText = "Swirl that cream!";
      dish.feedbackTimer = 0.6;
    }

    if (dish.whipProgress >= 1) {
      dish.stage = "cookie_drop";
      dish.cookieDropY = 0;
      dish.feedbackText = "Tap to drop the Maple Cookie!";
      dish.feedbackTimer = 1.5;
    }
  } else if (dish.stage === "cookie_drop") {
    if (input.primaryTap) {
      dish.stage = "pie_celebrate";
      dish.cookieDropY = 1;
      dish.celebrateTimer = 0.85;
      dish.piesFinished += 1;
      dish.score += isCozy ? 130 : 150;
      dish.feedbackText = "Ta-da! Sweet Pumpkin Pie!";
      dish.feedbackTimer = 0.9;
      sounds.push("good_catch");
      particles.push(...makeBurst(210, 230, PALETTE.pumpkinGold, 14, "star", rng));
    }
  } else if (dish.stage === "pie_celebrate") {
    dish.celebrateTimer -= dt;
    if (dish.celebrateTimer <= 0 && dish.piesFinished < dish.target) {
      dish.stage = "whipping";
      dish.whipProgress = 0;
      dish.creamDots = [];
      dish.cookieDropY = 0;
      dish.feedbackText = "Next pie! Swirl cream!";
      dish.feedbackTimer = 0.9;
    }
  }

  const done =
    (dish.piesFinished >= dish.target && dish.celebrateTimer <= 0) ||
    (dish.timeLeftSec !== null && dish.timeLeftSec <= 0);
  if (done) {
    sounds.push("dish_win");
  }
  return {
    completed: done,
    stars: computeStars(difficulty, dish.piesFinished, dish.target, dish.score),
    score: dish.score,
    dishesMade: dish.piesFinished,
    particles,
    sounds
  };
}

export function stepActiveDish(
  dish: ActiveDishState,
  difficulty: DifficultyMode,
  dt: number,
  input: StepInput,
  rng: RngFn
): DishStepResult {
  if (dish.kind === "golden_toast") {
    return stepToastDish(dish, difficulty, dt, input, rng);
  }
  if (dish.kind === "flying_popcorn") {
    return stepPopcornDish(dish, difficulty, dt, input, rng);
  }
  return stepPieDish(dish, difficulty, dt, input, rng);
}
