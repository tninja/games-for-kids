import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const fb = require("../docs/foosball/app.js");

test("1. Formation has 8 interleaved 1-2-5-3 rods (22 figures) with valid travel limits", () => {
  const game = new fb.FoosballGame({ seed: 1, mode: "1p" });
  assert.equal(game.rods.length, 8);
  const expected = [
    { team: "blue", role: "gk", count: 1 },
    { team: "blue", role: "def", count: 2 },
    { team: "red", role: "fwd", count: 3 },
    { team: "blue", role: "mid", count: 5 },
    { team: "red", role: "mid", count: 5 },
    { team: "blue", role: "fwd", count: 3 },
    { team: "red", role: "def", count: 2 },
    { team: "red", role: "gk", count: 1 }
  ];
  let totalFigures = 0;
  for (let i = 0; i < 8; i++) {
    const rod = game.rods[i];
    assert.equal(rod.team, expected[i].team, `rod ${i} team`);
    assert.equal(rod.role, expected[i].role, `rod ${i} role`);
    assert.equal(rod.figureOffsets.length, expected[i].count, `rod ${i} figure count`);
    assert.ok(rod.maxSlide > 0.04, `rod ${i} maxSlide positive`);
    if (i > 0) {
      assert.ok(rod.x > game.rods[i - 1].x, `rod ${i} x strictly increasing`);
    }
    totalFigures += rod.figureOffsets.length;
  }
  assert.equal(totalFigures, 22);
  // 5-man midfield has tighter lateral travel than 3-man forward
  assert.ok(game.rods[3].maxSlide < game.rods[5].maxSlide);
});

test("2. Physics: quick tap kick vs charged power shot & zero tunneling", () => {
  const runShot = (chargeSeconds) => {
    const game = new fb.FoosballGame({ seed: 2, mode: "2p_pvp" });
    game.startMatch();
    game.phase = "playing";
    // Place ball right in front of Blue Forward center figure (rod index 5)
    const fwd = game.rods[5];
    fwd.z = 0;
    game.ball.x = fwd.x + 0.028;
    game.ball.z = 0;
    game.ball.vx = 0;
    game.ball.vz = 0;
    // Lift red rods out of the way so we measure unobstructed shot speed
    for (const r of game.rods) {
      if (r.team === "red") r.angle = fb.LIFT_ANGLE;
    }

    if (chargeSeconds > 0) {
      const steps = Math.round(chargeSeconds * 60);
      for (let i = 0; i < steps; i++) {
        game.setPlayerInput("p1", { slide: 0, kickHeld: true, liftHeld: false });
        game.step(1 / 60);
      }
      // Release kick to unleash charged shot
      game.setPlayerInput("p1", { slide: 0, kickHeld: false, liftHeld: false });
    } else {
      game.setPlayerInput("p1", { slide: 0, kickHeld: true, liftHeld: false });
      game.step(1 / 60);
      game.setPlayerInput("p1", { slide: 0, kickHeld: false, liftHeld: false });
    }

    let maxVx = 0;
    for (let i = 0; i < 30; i++) {
      game.step(1 / 60);
      if (game.ball.vx > maxVx) maxVx = game.ball.vx;
      // Ball must stay within table + goal depth bounds (no tunneling)
      assert.ok(Math.abs(game.ball.z) <= fb.FIELD_WIDTH / 2 + 0.01, "Ball tunneled side wall");
      assert.ok(Math.abs(game.ball.x) <= fb.FIELD_LENGTH / 2 + fb.GOAL_DEPTH + 0.02, "Ball tunneled end wall");
    }
    return maxVx;
  };

  const tapSpeed = runShot(0);
  const chargedSpeed = runShot(0.45);
  assert.ok(tapSpeed > 0.65, `Tap shot too weak: ${tapSpeed}`);
  assert.ok(chargedSpeed > tapSpeed * 1.25, `Charged shot (${chargedSpeed}) should clearly exceed tap (${tapSpeed})`);
});

test("3. Physics: pull/push shot imparts lateral velocity when sliding while kicking", () => {
  const game = new fb.FoosballGame({ seed: 3, mode: "2p_pvp" });
  game.startMatch();
  game.phase = "playing";
  const fwd = game.rods[5];
  fwd.z = -0.02;
  game.ball.x = fwd.x + 0.026;
  game.ball.z = 0.0;
  game.ball.vx = 0;
  game.ball.vz = 0;

  // Slide rod in +Z while kicking
  game.setPlayerInput("p1", { slide: 1, kickHeld: true, liftHeld: false });
  game.step(1 / 60);
  game.step(1 / 60);
  game.setPlayerInput("p1", { slide: 1, kickHeld: false, liftHeld: false });
  for (let i = 0; i < 12; i++) {
    game.step(1 / 60);
  }
  assert.ok(game.ball.vx > 0.5, `Expected forward velocity, got ${game.ball.vx}`);
  assert.ok(game.ball.vz > 0.12, `Expected positive lateral pull-shot velocity, got ${game.ball.vz}`);
});

test("4. Physics: lifted rod lets ball pass underneath unobstructed", () => {
  const game = new fb.FoosballGame({ seed: 4, mode: "2p_pvp" });
  game.startMatch();
  game.phase = "playing";
  const mid = game.rods[3]; // Blue midfield (center figure at z=0)
  mid.z = 0;
  // Lift Blue rods via p1 liftHeld (and lift Red mid out of the way to isolate Blue mid)
  for (let i = 0; i < 20; i++) {
    game.setPlayerInput("p1", { slide: 0, kickHeld: false, liftHeld: true });
    game.setPlayerInput("p2", { slide: 0, kickHeld: false, liftHeld: true });
    game.step(1 / 60);
  }
  assert.ok(Math.abs(mid.angle) > fb.LIFT_CLEARANCE_ANGLE, "Mid rod should be lifted above clearance angle");

  // Shoot ball straight through mid.x at z=0
  game.ball.x = mid.x - 0.06;
  game.ball.z = 0;
  game.ball.vx = 1.1;
  game.ball.vz = 0;
  for (let i = 0; i < 12; i++) {
    game.step(1 / 60);
  }
  assert.ok(game.ball.x > mid.x + 0.04, `Ball should pass under lifted rod, x=${game.ball.x}, mid.x=${mid.x}`);
  assert.ok(game.ball.vx > 0.8, `Ball speed should remain forward, vx=${game.ball.vx}`);
});

test("5. Physics: corner anti-stuck slope and dead-ball 2s auto-reset", () => {
  // Corner ramp pushes motionless ball out of corner
  const gCorner = new fb.FoosballGame({ seed: 5, mode: "2p_pvp" });
  gCorner.startMatch();
  gCorner.phase = "playing";
  gCorner.ball.x = fb.FIELD_LENGTH / 2 - fb.BALL_RADIUS - 0.005;
  gCorner.ball.z = fb.FIELD_WIDTH / 2 - fb.BALL_RADIUS - 0.005;
  gCorner.ball.vx = 0;
  gCorner.ball.vz = 0;
  for (let i = 0; i < 30; i++) {
    gCorner.step(1 / 60);
  }
  assert.ok(gCorner.ball.vx < -0.02 || gCorner.ball.vz < -0.02, "Corner ramp must push ball inward");

  // Dead ball parked in midfield gap triggers auto-reset after 2.0s
  const gDead = new fb.FoosballGame({ seed: 6, mode: "2p_pvp" });
  gDead.startMatch();
  gDead.phase = "playing";
  gDead.ball.x = 0.0;
  gDead.ball.z = 0.06;
  gDead.ball.vx = 0;
  gDead.ball.vz = 0;
  for (let i = 0; i < 90; i++) {
    gDead.step(1 / 60);
  }
  assert.ok(gDead.deadBallTimer > 1.0, "Dead ball timer should accumulate while stalled");
  for (let i = 0; i < 50; i++) {
    gDead.step(1 / 60);
  }
  assert.equal(gDead.deadBallResets, 1, "Dead ball must auto-reset after 2 seconds");
  assert.equal(gDead.phase, "serving", "Dead ball reset should re-serve the ball");
});

test("6. Physics: gentle anti-spinning limits angle and prevents 360-degree spin", () => {
  const game = new fb.FoosballGame({ seed: 7, mode: "2p_pvp", strictSpinNotice: true });
  game.startMatch();
  game.phase = "playing";
  for (let i = 0; i < 60; i++) {
    game.setPlayerInput("p1", { slide: 0, kickHeld: i % 2 === 0, liftHeld: false });
    game.step(1 / 60);
    for (const r of game.rods) {
      assert.ok(Math.abs(r.angle) <= Math.PI * 0.75, `Rod spun too far: ${r.angle}`);
    }
  }
});

test("7. Modes: 2P Co-op splits Blue Defense (P1) and Offense (P2) and supports role swap", () => {
  const game = new fb.FoosballGame({ seed: 8, mode: "2p_coop" });
  game.startMatch();
  game.phase = "playing";
  const zBefore = game.rods.map((r) => r.z);

  // Move P1 (+1) and P2 (-1) simultaneously
  for (let i = 0; i < 15; i++) {
    game.setPlayerInput("p1", { slide: 1, kickHeld: false, liftHeld: false });
    game.setPlayerInput("p2", { slide: -1, kickHeld: false, liftHeld: false });
    game.step(1 / 60);
  }
  // Blue GK (0) & Blue Def (1) moved positive; Blue Mid (3) & Blue Fwd (5) moved negative
  assert.ok(game.rods[0].z > zBefore[0] + 0.02, "P1 should move Blue GK");
  assert.ok(game.rods[1].z > zBefore[1] + 0.02, "P1 should move Blue Def");
  assert.ok(game.rods[3].z < zBefore[3] - 0.02, "P2 should move Blue Mid");
  assert.ok(game.rods[5].z < zBefore[5] - 0.02, "P2 should move Blue Fwd");

  // Swap roles: now P1 controls Offense, P2 controls Defense
  game.toggleCoopSwap();
  const gkMid = game.rods[0].z;
  const fwdMid = game.rods[5].z;
  for (let i = 0; i < 15; i++) {
    game.setPlayerInput("p1", { slide: 1, kickHeld: false, liftHeld: false });
    game.setPlayerInput("p2", { slide: -1, kickHeld: false, liftHeld: false });
    game.step(1 / 60);
  }
  assert.ok(game.rods[0].z < gkMid - 0.02, "After swap, P2 controls Blue GK");
  assert.ok(game.rods[5].z > fwdMid + 0.02, "After swap, P1 controls Blue Fwd");
});

test("8. Modes: 1P advanced rod switching isolates movement to active rod", () => {
  const game = new fb.FoosballGame({ seed: 9, mode: "1p", controlMode: "advanced" });
  game.startMatch();
  game.phase = "playing";
  game.selectRod("blue", "fwd");
  const gk0 = game.rods[0].z;
  const fwd0 = game.rods[5].z;
  for (let i = 0; i < 15; i++) {
    game.setPlayerInput("p1", { slide: 1, kickHeld: false, liftHeld: false });
    game.step(1 / 60);
  }
  assert.ok(game.rods[5].z > fwd0 + 0.02, "Active fwd rod should slide");
  assert.ok(Math.abs(game.rods[0].z - gk0) < 0.001, "Inactive gk rod should stay still in advanced mode");
});

test("9. Match rules: goal scoring, conceding-side serve, and winning at targetScore", () => {
  const game = new fb.FoosballGame({ seed: 10, mode: "2p_pvp", targetScore: 5 });
  game.startMatch();

  for (let g = 1; g <= 5; g++) {
    game.phase = "playing";
    game.ball.x = fb.FIELD_LENGTH / 2 + 0.01;
    game.ball.z = 0;
    game.ball.vx = 1.0;
    game.ball.vz = 0;
    game.step(1 / 60);
    assert.equal(game.score.blue, g);
    if (g < 5) {
      assert.equal(game.phase, "goal");
      assert.equal(game.nextServeTeam, "red", "Conceding team (Red) serves next");
      // Advance past goal celebration
      for (let t = 0; t < 110; t++) game.step(1 / 60);
      assert.ok(game.phase === "serving" || game.phase === "playing");
    } else {
      assert.equal(game.phase, "gameover");
      assert.equal(game.winner, "blue");
    }
  }
});

test("10. Practice mode: lifts Red rods clear and scores target hits", () => {
  const game = new fb.FoosballGame({ seed: 11, mode: "practice" });
  game.startMatch();
  for (let i = 0; i < 30; i++) game.step(1 / 60);
  assert.equal(game.phase, "playing");
  for (const r of game.rods) {
    if (r.team === "red") {
      assert.ok(Math.abs(r.angle) > fb.LIFT_CLEARANCE_ANGLE, "Red rods stay lifted in practice mode");
    }
  }
  const targetZ = game.practiceTarget.z;
  game.ball.x = fb.FIELD_LENGTH / 2 - 0.02;
  game.ball.z = targetZ;
  game.ball.vx = 1.2;
  game.ball.vz = 0;
  for (let i = 0; i < 10; i++) game.step(1 / 60);
  assert.equal(game.practiceHits, 1, "Hitting glowing target should increment practiceHits");
  assert.equal(game.practiceStreak, 1);
});

test("11. AI levels: 4 humanized tiers configured & Legend outperforms Rookie", () => {
  const levels = ["rookie", "amateur", "pro", "legend"];
  for (const lvl of levels) {
    assert.ok(fb.AI_PRESETS[lvl], `Missing AI preset ${lvl}`);
  }
  assert.ok(fb.AI_PRESETS.rookie.reactionDelay > fb.AI_PRESETS.legend.reactionDelay);
  assert.ok(fb.AI_PRESETS.rookie.positionError > fb.AI_PRESETS.legend.positionError);
  assert.ok(fb.AI_PRESETS.legend.bounceDepth > fb.AI_PRESETS.rookie.bounceDepth);

  // Run deterministic AI-vs-AI match: Blue = Legend vs Red = Rookie
  const game = new fb.FoosballGame({
    seed: 42,
    mode: "1p",
    aiLevel: "rookie",
    blueAiOverride: "legend",
    targetScore: 5
  });
  game.startMatch();
  for (let i = 0; i < 60 * 90; i++) {
    game.step(1 / 60);
    if (game.phase === "gameover") break;
  }
  assert.ok(
    game.score.blue > game.score.red,
    `Legend (Blue ${game.score.blue}) should beat Rookie (Red ${game.score.red})`
  );
});

test("12. Headless FoosballApp: 3D scene anatomy, cameras, keyboard, and 2P multi-touch", () => {
  const canvas = { clientWidth: 960, clientHeight: 600 };
  const app = new fb.FoosballApp(canvas, { seed: 99, headless: true });
  app.render();
  const stats = app.sceneStats();
  assert.equal(stats.rodMeshes, 8);
  assert.equal(stats.figureMeshes, 22);
  assert.equal(stats.scoreBeads, 20);
  assert.equal(app.cameraMode, "angled");

  // Cycle cameras: angled -> top -> closeup -> angled
  app.cycleCameraMode();
  assert.equal(app.cameraMode, "top");
  const topPose = app.computeCameraPose();
  assert.ok(topPose.position[1] > 1.2 && Math.abs(topPose.position[2]) < 0.05);
  app.cycleCameraMode();
  assert.equal(app.cameraMode, "closeup");
  app.cycleCameraMode();
  assert.equal(app.cameraMode, "angled");

  // Start 2P PvP and test simultaneous keyboard + mute toggle
  app.startMatch({ mode: "2p_pvp", targetScore: 5 });
  app.handleKeyDown("w");
  app.handleKeyDown("ArrowDown");
  for (let i = 0; i < 20; i++) app.tick(1 / 60);
  app.render();
  assert.ok(app.game.rods[0].z < 0, "P1 W moves Blue rods toward -Z (top of screen)");
  assert.ok(app.game.rods[7].z > 0, "P2 ArrowDown moves Red rods toward +Z (bottom of screen)");
  app.handleKeyUp("w");
  app.handleKeyUp("ArrowDown");

  // Independent multi-touch pointers for P1 and P2
  app.setTouchSlide("p1", 0.8);
  app.setTouchSlide("p2", -0.8);
  for (let i = 0; i < 15; i++) app.tick(1 / 60);
  assert.ok(app.game.rods[0].vz > 0 || app.game.rods[0].z > -0.05);
  app.setTouchSlide("p1", 0);
  app.setTouchSlide("p2", 0);

  // Mute toggle & theme toggle
  assert.equal(app.uiState().muted, false);
  app.toggleMute();
  assert.equal(app.uiState().muted, true);
  app.cycleTheme();
  assert.notEqual(app.uiState().theme, "classic");
});
