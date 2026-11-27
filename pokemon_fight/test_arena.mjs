import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ArenaGame, HEROES, COVER, RADIUS, move, blocked, walkable, navigate, segmentDistance } = require("../docs/pokemon_fight/app.js");
const dt = 1 / 60;
const pointDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function fresh(character = "steelix", buddy = null) {
  const game = new ArenaGame({ character, buddy, difficulty: "relaxed", seed: 42 });
  game.bossArrived = true; // Isolate an encounter from timed wave spawning.
  return game;
}
function enemy(id, x, y, kind = "chaser", hp = 100) {
  return { id, x, y, kind, hp, maxHp: hp, radius: kind === "boss" ? 30 : 17,
    art: kind === "boss" ? "machamp" : kind === "shooter" ? "spewpa" : "machoke",
    cooldown: 0, hurt: 0, shield: 0, energy: 0, revive: 0, timer: 100, turn: 0 };
}
function incoming(game, damage = 1) {
  game.shots.push({ id: 9999, x: game.player.x, y: game.player.y, vx: 0, vy: 0, life: 1, damage,
    ally: false, color: "#ffffff", splash: 0, radius: 5 });
}
function advance(game, seconds, input = { x: 0, y: 0 }) {
  for (let i = 0; i < Math.ceil(seconds / dt); i++) game.step(dt, input);
}

test("Both favorite Pokemon and the complete four-character roster can start solo or with an optional partner", () => {
  assert.deepEqual(HEROES.map(item => item.id), ["steelix", "duskull", "greninja", "darmanitan"]);
  for (const spec of HEROES) {
    const solo = fresh(spec.id);
    assert.equal(solo.player.art, spec.id);
    assert.equal(solo.buddy, null);
    assert.equal(solo.player.radius, RADIUS);
    const duo = fresh(spec.id, spec.id === "duskull" ? "steelix" : "duskull");
    assert.ok(duo.buddy && duo.buddy.hp > 0);
  }
});

test("Diagonal movement has no speed advantage and Steelix's artwork does not enlarge its collision", () => {
  const straight = fresh();
  const diagonal = fresh();
  const a = { ...straight.player }, b = { ...diagonal.player };
  straight.step(dt, { x: 1, y: 0 });
  diagonal.step(dt, { x: 1, y: 1 });
  assert.ok(Math.abs(pointDistance(straight.player, a) - pointDistance(diagonal.player, b)) < 1e-8);
  assert.equal(fresh("steelix").player.radius, fresh("duskull").player.radius);
  const position = { x: 180, y: 270 };
  move(position, 700, 0, RADIUS);
  assert.ok(position.x <= COVER[0].x - RADIUS + 1);
  assert.ok(walkable(position, RADIUS));
  move(position, -10000, -10000, RADIUS);
  assert.ok(position.x >= 24 + RADIUS && position.y >= 24 + RADIUS);
});

test("Cover blocks targeting and fast projectile segments in both directions", () => {
  assert.equal(blocked({ x: 200, y: 270 }, { x: 450, y: 270 }), true);
  assert.equal(blocked({ x: 450, y: 270 }, { x: 200, y: 270 }), true);
  const game = fresh();
  Object.assign(game.player, { x: 200, y: 270 });
  game.enemies = [enemy(100, 450, 270), enemy(101, 200, 125)];
  game.step(dt);
  assert.equal(game.targetId, 101, "Choose an exposed enemy instead of wasting shots at cover");
  game.shots = [{ id: 500, x: 210, y: 270, vx: 24000, vy: 0, life: 1, damage: 999, ally: true, color: "#fff", radius: 6, splash: 0 }];
  game.step(dt);
  assert.equal(game.enemies.find(item => item.id === 100).hp, 100, "A fast shot must not tunnel through the shelter");
});

test("Automatic attacks work without any movement or attack-button input", () => {
  for (const spec of HEROES) {
    const game = fresh(spec.id);
    game.enemies = [enemy(100, 500, 365, "shooter", 16)];
    advance(game, 1.7);
    assert.equal(game.enemies.length, 0, spec.name);
    assert.equal(game.defeated, 1);
  }
});

test("The same target remains selected until invalid, and an out-of-range target is released", () => {
  const game = fresh();
  game.enemies = [enemy(100, 500, 360, "shooter"), enemy(101, 680, 485, "shooter")];
  game.step(dt);
  assert.equal(game.targetId, 100);
  game.enemies[1].x = 550;
  game.step(dt);
  assert.equal(game.targetId, 100);
  game.enemies[0].y = 60;
  game.step(dt);
  assert.equal(game.targetId, 101);
});

test("Damage grants breathing room, and Duskull's automatically charged shield prevents damage", () => {
  const game = fresh("duskull");
  const hp = game.player.hp;
  incoming(game); incoming(game); game.step(dt);
  assert.equal(game.player.hp, hp - 1);
  game.player.energy = 100;
  game.enemies = [enemy(100, 500, 360, "shooter", 1000)];
  game.step(dt);
  assert.ok(game.player.shield > 4);
  game.player.hurt = 0;
  incoming(game, 3); game.step(dt);
  assert.equal(game.player.hp, hp - 1);
  assert.ok(game.player.energy < 1);
});

test("Full special energy is saved until there is an exposed target", () => {
  const game = fresh("greninja");
  game.player.energy = 100;
  advance(game, 2);
  assert.equal(game.player.energy, 100);
  game.enemies = [enemy(100, 500, 360, "shooter", 200)];
  game.step(dt);
  assert.ok(game.player.energy < 1);
  assert.ok(game.effects.length > 0);
});

test("Pause freezes combat, cooldowns, timers and movement; resume continues", () => {
  const game = fresh();
  incoming(game);
  game.pause();
  const snapshot = JSON.stringify({ player: game.player, elapsed: game.elapsed, shots: game.shots });
  advance(game, 5, { x: 1, y: 1 });
  assert.equal(JSON.stringify({ player: game.player, elapsed: game.elapsed, shots: game.shots }), snapshot);
  game.resume(); game.step(dt, { x: 1, y: 0 });
  assert.equal(game.phase, "playing");
  assert.ok(game.elapsed > 0);
});

test("Practice is safe, keeps the match clock at zero, and leads into a fresh encounter", () => {
  const game = new ArenaGame({ character: "duskull", buddy: null, difficulty: "relaxed", practice: true, seed: 1 });
  incoming(game, 100);
  advance(game, 2);
  assert.equal(game.phase, "practice");
  assert.equal(game.elapsed, 0);
  assert.equal(game.player.hp, game.player.maxHp);
  advance(game, 1, { x: -1, y: 0 });
  assert.equal(game.phase, "playing");
  assert.ok(game.elapsed < 1);
  assert.equal(game.bossArrived, false);
});

test("A living buddy can rescue the player exactly once, and nearby help revives a downed buddy", () => {
  const game = fresh("steelix", "duskull");
  game.player.hp = 1; incoming(game); game.step(dt);
  assert.equal(game.phase, "playing");
  assert.equal(game.rescueUsed, true);
  assert.equal(game.player.hp, 5);
  game.player.shield = 0; game.player.hurt = 0;
  game.player.hp = 1; incoming(game); game.step(dt);
  assert.equal(game.phase, "lost");
  const help = fresh("steelix", "duskull");
  Object.assign(help.buddy, { hp: 0, x: help.player.x + 30, y: help.player.y });
  advance(help, 1.6);
  assert.ok(help.buddy.hp > 0 && help.buddy.shield > 0);
});

test("Health and energy pickups belong to the player, and full health is not wasted", () => {
  const game = fresh("steelix", "duskull");
  game.player.hp = 5;
  game.player.energy = 10;
  game.pickups = [{ id: 100, x: game.player.x, y: game.player.y, kind: "health", life: 10 }];
  game.step(dt);
  assert.equal(game.player.hp, 7);
  game.player.hp = game.player.maxHp;
  game.pickups = [{ id: 101, x: game.player.x, y: game.player.y, kind: "health", life: 10 }];
  game.step(dt);
  assert.equal(game.pickups.length, 1);
  game.pickups = [{ id: 102, x: game.player.x, y: game.player.y, kind: "energy", life: 10 }];
  game.step(dt);
  assert.ok(game.player.energy >= 34);
});

test("The boss replaces the waves at 90 seconds, with no hard three-minute failure timer", () => {
  const game = new ArenaGame({ character: "steelix", buddy: null, difficulty: "relaxed", seed: 3 });
  game.elapsed = 89.99;
  game.enemies = [enemy(100, 90, 90)];
  game.step(dt);
  assert.equal(game.bossArrived, true);
  assert.equal(game.enemies.length, 1);
  assert.equal(game.boss.art, "machamp");
  game.elapsed = 190;
  game.step(dt);
  assert.equal(game.phase, "playing");
});

test("Boss warnings wait before damage and moving sideways avoids the marked stripe", () => {
  for (const dodge of [false, true]) {
    const game = fresh("steelix");
    game.enemies = [enemy(100, 500, 150, "boss", 1300)];
    game.enemies[0].timer = 0;
    game.step(dt);
    assert.equal(game.hazards.length, 1);
    assert.equal(game.hazards[0].kind, "line");
    const hp = game.player.hp;
    advance(game, 1, dodge ? { x: 1, y: 0 } : { x: 0, y: 0 });
    assert.equal(game.player.hp, hp, "The preview itself must not hurt");
    advance(game, 1);
    assert.equal(game.player.hp, dodge ? hp : hp - 2);
  }
});

test("The circular slam leaves time to move outside its radius", () => {
  for (const dodge of [false, true]) {
    const game = fresh();
    const boss = enemy(100, 500, 320, "boss", 2000);
    boss.timer = 0; boss.turn = 1;
    game.enemies = [boss];
    game.step(dt);
    assert.equal(game.hazards[0].kind, "circle");
    const hp = game.player.hp;
    advance(game, 2.1, dodge ? { x: 0, y: 1 } : { x: 0, y: 0 });
    assert.equal(game.player.hp, dodge ? hp : hp - 2);
  }
});

test("Signature attacks have distinct useful behavior: water fans out and fire blooms at the target", () => {
  const water = fresh("greninja");
  water.player.energy = 100;
  water.enemies = [enemy(100, 500, 360, "shooter", 1000)];
  water.step(dt);
  assert.ok(water.shots.length >= 5);
  assert.ok(new Set(water.shots.map(shot => Math.round(shot.vx))).size >= 5);
  const fire = fresh("darmanitan");
  fire.player.energy = 100;
  fire.enemies = [enemy(100, 500, 360, "shooter", 100), enemy(101, 540, 360, "shooter", 100), enemy(102, 800, 485, "shooter", 100)];
  fire.step(dt);
  assert.ok(fire.enemies[0].hp < 100 && fire.enemies[1].hp < 100);
  assert.equal(fire.enemies[2].hp, 100);
});

test("A defeat cannot turn into victory from a projectile later in the same step", () => {
  const game = fresh();
  game.player.hp = 1; game.player.cooldown = 10;
  const boss = enemy(100, 500, 365, "boss", 1);
  game.enemies = [enemy(101, game.player.x, game.player.y), boss];
  game.shots.push({ id: 200, x: boss.x, y: boss.y, vx: 0, vy: 0, life: 1, damage: 99, ally: true, color: "#fff", radius: 8, splash: 0 });
  game.step(dt);
  assert.equal(game.phase, "lost");
  assert.equal(boss.hp, 1);
  const elapsed = game.elapsed;
  advance(game, 2, { x: 1, y: 0 });
  assert.equal(game.elapsed, elapsed);
});

test("A controlled player can navigate around a shelter rather than passing through it", () => {
  const point = { x: 210, y: 270 };
  const goal = { x: 450, y: 270 };
  for (let i = 0; i < 500 && pointDistance(point, goal) > 10; i++) {
    const direction = navigate(point, goal, RADIUS);
    move(point, direction.x * 3, direction.y * 3, RADIUS);
    assert.ok(walkable(point, RADIUS));
  }
  assert.ok(pointDistance(point, goal) < 15, JSON.stringify(point));
});

// A deterministic movement-only driver checks encounter reachability, not child skill.
function driver(game) {
  const player = game.player;
  for (const hazard of game.hazards) {
    if (hazard.fired) continue;
    if (hazard.kind === "line" && segmentDistance(player, hazard, hazard.end) < hazard.radius + 42) {
      const dx = hazard.end.x - hazard.x, dy = hazard.end.y - hazard.y;
      const sign = (player.x - hazard.x) * -dy + (player.y - hazard.y) * dx >= 0 ? 1 : -1;
      const direction = { x: -dy * sign, y: dx * sign };
      const length = Math.hypot(direction.x, direction.y);
      return { x: direction.x / length, y: direction.y / length };
    }
    if (hazard.kind === "circle" && pointDistance(player, hazard) < hazard.radius + 45) return navigate(player, { x: player.x + (player.x - hazard.x), y: player.y + (player.y - hazard.y) }, RADIUS);
  }
  const healing = game.pickups.find(item => item.kind === "health" && player.hp < player.maxHp - 1 && pointDistance(item, player) < 170);
  if (healing) return navigate(player, healing, RADIUS);
  const target = game.enemies.filter(item => item.hp > 0).sort((a, b) => pointDistance(player, a) - pointDistance(player, b))[0];
  if (!target) return { x: 0, y: 0 };
  const gap = pointDistance(player, target);
  if (gap > 215 || blocked(player, target)) return navigate(player, target, RADIUS);
  if (gap < 145) {
    const away = navigate(player, { x: player.x + (player.x - target.x), y: player.y + (player.y - target.y) }, RADIUS);
    if (walkable({ x: player.x + away.x * 45, y: player.y + away.y * 45 }, RADIUS)) return away;
  }
  return { x: 0, y: 0 };
}

test("Every character can complete a real relaxed wave-and-boss round without a buddy", context => {
  for (const spec of HEROES) {
    for (const seed of [7, 19]) {
      const game = new ArenaGame({ character: spec.id, buddy: null, difficulty: "relaxed", seed });
      for (let i = 0; i < 60 * 300 && game.phase === "playing"; i++) game.step(dt, driver(game));
      assert.equal(game.phase, "won", spec.name + ", seed " + seed + ": hp=" + game.player.hp + " t=" + game.elapsed.toFixed(1));
      assert.equal(game.buddy, null);
      assert.ok(game.elapsed > 90 && game.elapsed < 240, "Keep a completed round close to the three-minute pacing goal");
      context.diagnostic(spec.id + " solo, seed " + seed + ": " + game.elapsed.toFixed(1) + " seconds, " + game.player.hp + " HP left");
    }
  }
});

test("Standard solo mode and the optional companion both allow complete rounds", () => {
  for (const spec of HEROES) {
    for (const difficulty of ["relaxed", "standard"]) {
      const buddy = difficulty === "relaxed" ? spec.id === "duskull" ? "steelix" : "duskull" : null;
      const game = new ArenaGame({ character: spec.id, buddy, difficulty, seed: 11 });
      for (let i = 0; i < 60 * 300 && game.phase === "playing"; i++) game.step(dt, driver(game));
      assert.equal(game.phase, "won", spec.name + ", " + difficulty + ", buddy=" + buddy + ": hp=" + game.player.hp + " t=" + game.elapsed.toFixed(1));
    }
  }
});
