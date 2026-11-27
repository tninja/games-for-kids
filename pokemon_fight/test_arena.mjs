import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ArenaGame, HEROES, STAGES, UPGRADES, DIFFICULTIES, arenaView, COVER, RADIUS, move, blocked, walkable, navigate, segmentDistance } = require("../docs/pokemon_fight/app.js");
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
  game.upgradeRound = 2; // Both intermissions have already been completed.
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
  const navigate = (point, goal, radius) => game.navigate(point, goal, radius);
  const blocked = (a, b) => game.blocked(a, b, game.player.art === "greninja" ? 9 : 3);
  const walkable = (point, radius) => game.walkable(point, radius);
  const warnings = game.hazards.filter(hazard => !hazard.fired).map(hazard => ({ ...hazard }));
  for (const enemy of game.enemies) if ((enemy.windup ?? 0) > 0) warnings.push({ ...enemy, kind: "line", end: game.chargeEnd(enemy), radius: 20 });
  const margin = (point, hazard) => (hazard.kind === "line" ? segmentDistance(point, hazard, hazard.end) : pointDistance(point, hazard)) - hazard.radius - RADIUS;
  if (warnings.some(hazard => margin(player, hazard) < 28)) {
    let best = null;
    for (const length of [150, 90, 45]) for (let i = 0; i < 16; i++) {
      const direction = { x: Math.cos(i * Math.PI / 8), y: Math.sin(i * Math.PI / 8) };
      const destination = { x: player.x + direction.x * length, y: player.y + direction.y * length };
      if (!walkable(destination, RADIUS) || game.blocked(player, destination, RADIUS)) continue;
      const score = Math.min(...warnings.map(hazard => margin(destination, hazard))) - length * 0.01;
      if (!best || score > best.score) best = { direction, score };
    }
    if (best) return best.direction;
  }
  const threat = game.shots.find(shot => !shot.ally && pointDistance(player, shot) < 100);
  if (threat) {
    let dx = threat.kind === "ghost" ? player.x - threat.x : -threat.vy;
    let dy = threat.kind === "ghost" ? player.y - threat.y : threat.vx;
    const length = Math.hypot(dx, dy) || 1;
    dx = dx / length * 120; dy = dy / length * 120;
    if (!walkable({ x: player.x + dx * 0.4, y: player.y + dy * 0.4 }, RADIUS)) [dx, dy] = [-dy, dx];
    return navigate(player, { x: player.x + dx, y: player.y + dy }, RADIUS);
  }
  const healing = game.pickups.find(item => item.kind === "health" && player.hp < player.maxHp - 1 && pointDistance(item, player) < 170);
  if (healing) return navigate(player, healing, RADIUS);
  const target = game.enemies.filter(item => item.hp > 0).sort((a, b) => pointDistance(player, a) - pointDistance(player, b))[0];
  if (!target) return { x: 0, y: 0 };
  const gap = pointDistance(player, target);
  if (target.kind === "guard" && game.player.art !== "duskull" && game.player.art !== "darmanitan" &&
      Math.cos(Math.atan2(player.y - target.y, player.x - target.x) - (target.facing ?? 0)) > 0.1 && gap < 240) {
    const radial = { x: player.x - target.x, y: player.y - target.y };
    const length = Math.hypot(radial.x, radial.y) || 1;
    const tangent = { x: -radial.y / length, y: radial.x / length };
    return navigate(player, { x: player.x + tangent.x * 90, y: player.y + tangent.y * 90 }, RADIUS);
  }
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
      for (let i = 0; i < 60 * 300 && ["playing", "upgrade"].includes(game.phase); i++) {
        if (game.phase === "upgrade") game.chooseUpgrade(game.upgradeChoices[seed % 3].id);
        else game.step(dt, driver(game));
      }
      assert.equal(game.phase, "won", spec.name + ", seed " + seed + ": hp=" + game.player.hp + " t=" + game.elapsed.toFixed(1));
      assert.equal(game.buddy, null);
      assert.equal(game.upgradesTaken.length, 2);
      assert.equal(game.bossEnraged, true);
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
      for (let i = 0; i < 60 * 300 && ["playing", "upgrade"].includes(game.phase); i++) {
        if (game.phase === "upgrade") game.chooseUpgrade(game.upgradeChoices[0].id);
        else game.step(dt, driver(game));
      }
      assert.equal(game.phase, "won", spec.name + ", " + difficulty + ", buddy=" + buddy + ": hp=" + game.player.hp + " t=" + game.elapsed.toFixed(1));
    }
  }
});

function equip(game, id) {
  const upgrade = UPGRADES.find(item => item.id === id);
  assert.ok(upgrade, id);
  game.phase = "upgrade";
  game.upgradeChoices = [upgrade];
  assert.equal(game.chooseUpgrade(id), true);
}

test("Steelix sweeps multiple targets in a fan, pushes them back, and never hits behind itself", () => {
  const game = fresh("steelix");
  const front = enemy(100, 650, 450, "shooter");
  const side = enemy(101, 650, 515, "shooter");
  const behind = enemy(102, 330, 485, "shooter");
  game.enemies = [front, side, behind];
  advance(game, 0.55);
  assert.equal(front.hp, 80);
  assert.equal(side.hp, 80);
  assert.equal(behind.hp, 100);
  assert.ok(front.x > 670 && side.x > 670);
});

test("Ghost flames track through cover, attach a lingering haunt, and slow their target", () => {
  const game = fresh("duskull");
  Object.assign(game.player, { x: 200, y: 270 });
  const target = enemy(100, 450, 270, "shooter", 300);
  game.enemies = [target];
  assert.equal(blocked(game.player, target), true);
  advance(game, 1.5);
  assert.ok(target.hp < 300 && target.haunt > 0);
  game.shots = []; game.player.cooldown = 10;
  const before = target.hp;
  advance(game, 0.5);
  assert.ok(target.hp < before, "The attached flame keeps doing damage");
  target.kind = "chaser";
  const start = { x: target.x, y: target.y };
  advance(game, 0.2);
  assert.ok(pointDistance(start, target) < 10, "Haunting slows pursuit without another player button");
});

test("Greninja fires a three-star burst and each star can pierce a line of challengers", () => {
  const game = fresh("greninja");
  game.enemies = [enemy(100, 500, 360, "shooter", 100), enemy(101, 500, 310, "shooter", 100)];
  advance(game, 0.6);
  assert.equal(game.enemies[0].hp, 79);
  assert.equal(game.enemies[1].hp, 79);
});

test("Fireballs lob over cover, explode after flight, and leave a safe-for-player burning zone", () => {
  const game = fresh("darmanitan");
  Object.assign(game.player, { x: 200, y: 270 });
  const target = enemy(100, 450, 270, "shooter", 300);
  game.enemies = [target];
  const hp = game.player.hp;
  advance(game, 0.3);
  assert.equal(target.hp, 300);
  assert.equal(game.shots[0].kind, "fire");
  advance(game, 0.5);
  assert.ok(target.hp < 300 && game.flames.length > 0);
  const afterImpact = target.hp;
  game.player.cooldown = 10; game.shots = [];
  Object.assign(game.player, { x: target.x, y: target.y + 50 });
  advance(game, 0.5);
  assert.ok(target.hp < afterImpact);
  assert.equal(game.player.hp, hp);
});

test("Power-up intermissions freeze every combat timer until one valid choice is made", () => {
  const game = new ArenaGame({ character: "duskull", buddy: "steelix", difficulty: "relaxed", seed: 4 });
  game.elapsed = 27.99;
  game.step(dt, { x: 1, y: 0 });
  assert.equal(game.phase, "upgrade");
  assert.equal(game.upgradeChoices.length, 3);
  assert.equal(new Set(game.upgradeChoices.map(item => item.id)).size, 3);
  assert.equal(game.upgradeChoices.filter(item => item.hero === "duskull").length, 2);
  const snapshot = JSON.stringify(game);
  advance(game, 10, { x: 1, y: 1 });
  assert.equal(JSON.stringify(game), snapshot);
  assert.equal(game.chooseUpgrade("not-offered"), false);
  const selected = game.upgradeChoices[0].id;
  assert.equal(game.chooseUpgrade(selected), true);
  assert.equal(game.chooseUpgrade(selected), false);
  assert.equal(game.phase, "playing");
  assert.ok(game.player.shield >= 1);
  game.elapsed = 57.99;
  game.step(dt);
  assert.equal(game.phase, "upgrade");
  assert.equal(game.upgradeRound, 2);
  assert.equal(game.upgradeChoices.some(item => item.id === selected), false);
  game.chooseUpgrade(game.upgradeChoices[1].id);
  assert.equal(game.upgradesTaken.length, 2);
  const reset = new ArenaGame(game.options);
  assert.equal(reset.upgradesTaken.length, 0);
});

test("Offered upgrades are deterministic, hero-specific, and include a utility choice", () => {
  for (const spec of HEROES) {
    const rounds = [];
    for (let repeat = 0; repeat < 2; repeat++) {
      const game = new ArenaGame({ character: spec.id, buddy: null, difficulty: "relaxed", seed: 77 });
      game.elapsed = 27.99; game.step(dt);
      assert.ok(game.upgradeChoices.every(item => !item.hero || item.hero === spec.id));
      assert.equal(game.upgradeChoices.filter(item => !item.hero).length, 1);
      rounds.push(game.upgradeChoices.map(item => item.id));
    }
    assert.deepEqual(rounds[0], rounds[1]);
  }
});

test("Wide sweep and double tail change actual coverage and hit count", () => {
  const run = upgrade => {
    const game = fresh("steelix");
    Object.assign(game.player, { x: 500, y: 350 });
    if (upgrade) equip(game, upgrade);
    game.enemies = [enemy(100, 600, 350, "shooter", 200), enemy(101, 650, 500, "shooter", 200)];
    advance(game, 0.65);
    return game;
  };
  const normal = run(null), wide = run("steel-wide"), double = run("steel-double");
  assert.equal(normal.enemies[1].hp, 200);
  assert.ok(wide.enemies[1].hp < 200);
  assert.ok(double.enemies[0].hp < normal.enemies[0].hp);
});

test("Water stars can fan out or return for a second hit after their upgrades", () => {
  const fan = fresh("greninja");
  equip(fan, "water-fan");
  fan.enemies = [enemy(100, 500, 280, "shooter", 1000)];
  advance(fan, 0.22);
  assert.equal(fan.shots.filter(shot => shot.kind === "water").length, 9);
  const returning = fresh("greninja");
  equip(returning, "water-return");
  returning.enemies = [enemy(100, 500, 350, "shooter", 300)];
  advance(returning, 0.23);
  returning.player.cooldown = 10;
  advance(returning, 1.1);
  assert.ok(returning.enemies[0].hp <= 258, "Three stars can each hit once out and once back");
});

test("Health, ghost-twin, and lasting-fire upgrades affect the player's abilities", () => {
  const armor = fresh("steelix");
  armor.player.hp = 5;
  equip(armor, "steel-armor");
  assert.equal(armor.player.maxHp, 13);
  assert.equal(armor.player.hp, 8);
  const ghosts = fresh("duskull");
  equip(ghosts, "ghost-twins");
  ghosts.enemies = [enemy(100, 500, 220, "shooter", 1000)];
  advance(ghosts, 0.25);
  assert.equal(ghosts.shots.filter(shot => shot.kind === "ghost").length, 2);
  const fire = fresh("darmanitan");
  equip(fire, "fire-long");
  fire.enemies = [enemy(100, 500, 365, "shooter", 1000)];
  advance(fire, 0.8);
  fire.player.cooldown = 10; fire.shots = [];
  advance(fire, 3);
  assert.ok(fire.flames.length > 0 && fire.flames[0].life > 0);
});

test("A front shield reduces direct hits, while flanking and ghost flames bypass it", () => {
  const hit = (fromY, kind) => {
    const game = fresh("steelix");
    game.player.cooldown = 10; game.player.energy = 0;
    const guard = enemy(100, 500, 360, "guard", 100);
    guard.facing = Math.PI / 2;
    game.enemies = [guard];
    game.shots = [{ id: 200, x: 500, y: fromY, vx: 0, vy: fromY > 360 ? -900 : 900,
      life: 1, damage: 20, ally: true, color: "#fff", radius: 7, splash: 0, kind, target: 100 }];
    game.step(dt);
    return guard.hp;
  };
  assert.equal(hit(382, "pellet"), 96);
  assert.equal(hit(338, "pellet"), 80);
  assert.equal(hit(382, "ghost"), 80);
});

test("Chargers telegraph a locked direction and cannot dash through stone shelters", () => {
  const game = fresh();
  game.player.cooldown = 10;
  const charger = enemy(100, 500, 300, "charger", 200);
  charger.timer = 0;
  game.enemies = [charger];
  game.step(dt);
  assert.ok(charger.windup > 1);
  assert.equal(charger.dashDirection.x, 0);
  game.player.x = 700;
  advance(game, 1.4);
  assert.equal(charger.x, 500);
  assert.ok(charger.y > 310);
  const wall = fresh();
  wall.player.cooldown = 10;
  const blockedCharger = enemy(101, 230, 270, "charger", 200);
  blockedCharger.windup = 0.01; blockedCharger.dashDirection = { x: 1, y: 0 };
  wall.enemies = [blockedCharger];
  assert.ok(wall.chargeEnd(blockedCharger).x < COVER[0].x);
  advance(wall, 0.65);
  assert.ok(blockedCharger.x <= COVER[0].x - blockedCharger.radius);
});

test("Machamp enters phase two once and adds cross punches and player-position slams", () => {
  const game = fresh();
  game.player.cooldown = 10;
  const boss = enemy(100, 500, 150, "boss", 1000);
  boss.hp = 490; boss.timer = 0;
  game.enemies = [boss];
  game.step(dt);
  assert.equal(game.bossEnraged, true);
  assert.equal(game.hazards.length, 2);
  assert.ok(game.hazards.every(hazard => hazard.kind === "line" && hazard.wait > 1.5));
  game.hazards = []; boss.timer = 0; boss.turn = 1;
  const position = { x: game.player.x, y: game.player.y };
  game.step(dt);
  assert.equal(game.hazards.length, 1);
  assert.equal(game.hazards[0].kind, "circle");
  assert.equal(game.hazards[0].x, position.x);
  assert.equal(game.hazards[0].y, position.y);
  assert.equal(game.events.filter(event => event === "boss").length, 1);
});

test("Phone portrait and landscape views enlarge Pokemon and keep edge portraits fully visible", () => {
  for (const [width, height] of [[390, 470], [320, 330], [440, 240]]) {
    for (const player of [{ x: 500, y: 485 }, { x: 42, y: 42 }, { x: 958, y: 578 }]) {
      const view = arenaView(width, height, player, undefined, true);
      const pictureWidth = 92 * 1.2 * view.scale;
      const oldWidth = 92 * Math.min(width / 1000, height / 620);
      assert.ok(pictureWidth >= 80 && pictureWidth > oldWidth * 2.5);
      const x = width / 2 + (player.x - view.x) * view.scale;
      const y = height / 2 + (player.y - view.y) * view.scale;
      assert.ok(x - pictureWidth / 2 >= 0 && x + pictureWidth / 2 <= width);
      assert.ok(y - (92 * 1.2 * 0.66 + 16) * view.scale >= 0);
    }
  }
  const desktop = arenaView(1000, 620, { x: 42, y: 42 }, undefined, false);
  assert.equal(desktop.scale, 1);
  assert.equal(desktop.x, 500);
  assert.equal(desktop.y, 310);
  const player = { x: 500, y: 415 }, boss = { x: 500, y: 150 };
  const framed = arenaView(390, 420, player, boss, true);
  const bossHead = 210 + (boss.y - 130 - framed.y) * framed.scale;
  const playerFeet = 210 + (player.y + 26 - framed.y) * framed.scale;
  assert.ok(bossHead >= 0 && playerFeet <= 420, "Frame both pictures when the phone has enough vertical room");
});

test("Five stages have distinct layouts, themes, bosses, and bonus missions with reachable landmarks", () => {
  assert.equal(STAGES.length, 5);
  assert.equal(new Set(STAGES.map(stage => stage.theme)).size, 5);
  assert.equal(new Set(STAGES.map(stage => JSON.stringify(stage.cover))).size, 5);
  assert.equal(new Set(STAGES.map(stage => stage.boss.style)).size, 5);
  assert.equal(new Set(STAGES.map(stage => stage.goal.kind)).size, 5);
  for (const stage of STAGES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, stage: stage.id, difficulty: "relaxed", seed: 5 });
    assert.equal(game.level.id, stage.id);
    assert.ok(game.walkable(game.player, RADIUS));
    for (const node of game.goalNodes) {
      assert.ok(game.walkable(node, RADIUS), stage.name + " landmark inside an obstacle");
      const point = { x: game.player.x, y: game.player.y };
      for (let i = 0; i < 1300 && pointDistance(point, node) > 20; i++) {
        const direction = game.navigate(point, node, RADIUS);
        game.move(point, direction.x * 3, direction.y * 3, RADIUS);
      }
      assert.ok(pointDistance(point, node) < 25, stage.name + " unreachable bonus");
    }
  }
});

test("Map geometry belongs to each game and the safe tutorial swaps into the chosen map", () => {
  const meadow = new ArenaGame({ character: "steelix", buddy: null, difficulty: "relaxed", stage: 0 });
  const sky = new ArenaGame({ character: "steelix", buddy: null, difficulty: "relaxed", stage: 4 });
  const point = { x: 500, y: 340 };
  assert.equal(meadow.walkable(point, RADIUS), true);
  assert.equal(sky.walkable(point, RADIUS), false);
  assert.equal(blocked({ x: 500, y: 280 }, { x: 500, y: 420 }), false);
  assert.equal(sky.blocked({ x: 500, y: 280 }, { x: 500, y: 420 }), true);
  const practice = new ArenaGame({ character: "steelix", buddy: null, difficulty: "relaxed", stage: 4, practice: true });
  assert.equal(practice.walkable(point, RADIUS), true);
  practice.finishPractice();
  assert.equal(practice.walkable(point, RADIUS), false);
  assert.equal(meadow.walkable(point, RADIUS), true, "Another game must retain its own map");
});

test("Every bonus mission can finish with movement only, rewards once, and never gates the boss", () => {
  for (const stage of STAGES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, stage: stage.id, difficulty: "relaxed", seed: 5 });
    game.bossArrived = true;
    game.player.hp = 4;
    if (stage.goal.kind === "defeat") game.defeated = stage.goal.count;
    else for (const node of game.goalNodes) {
      Object.assign(game.player, { x: node.x, y: node.y });
      advance(game, 2.1);
      assert.equal(node.done, true, stage.name);
    }
    game.step(dt);
    assert.equal(game.objectiveComplete, true);
    assert.equal(game.objectiveRewarded, true);
    assert.equal(game.player.hp, 6);
    game.player.hp = 3;
    advance(game, 0.1);
    assert.equal(game.player.hp, 3, "Completed landmarks do not grant repeated healing");
    const noBonus = new ArenaGame({ character: "duskull", buddy: null, difficulty: "relaxed", stage: stage.id, seed: 1 });
    noBonus.upgradeRound = 2; noBonus.elapsed = 89.99;
    noBonus.step(dt);
    assert.ok(noBonus.boss, "The leader still arrives without a bonus objective");
    assert.equal(noBonus.boss.art, stage.boss.art);
  }
});

test("Every buddy automatically selects two non-repeating attack upgrades without taking player choices", () => {
  for (const buddy of HEROES) {
    const game = new ArenaGame({ character: buddy.id, buddy: buddy.id, difficulty: "relaxed", seed: 19 });
    for (const time of [27.99, 57.99]) {
      game.elapsed = time; game.step(dt);
      assert.equal(game.phase, "upgrade");
      assert.equal(game.buddyUpgrades.length, game.upgradeRound);
      assert.equal(game.upgradesTaken.length, game.upgradeRound - 1);
      assert.equal(game.upgradeChoices.length, 3);
      assert.ok(game.buddyUpgrades.every(id => UPGRADES.some(item => item.id === id && item.category === "attack" && item.hero === buddy.id)));
      game.chooseUpgrade(game.upgradeChoices[0].id);
    }
    assert.equal(new Set(game.buddyUpgrades).size, 2);
    assert.equal(new ArenaGame(game.options).buddyUpgrades.length, 0);
  }
  const downed = new ArenaGame({ character: "steelix", buddy: "duskull", difficulty: "relaxed", seed: 1 });
  downed.buddy.hp = 0; downed.elapsed = 27.99; downed.step(dt);
  assert.equal(downed.buddyUpgrades[0], "ghost-twins", "A resting buddy still learns the next offensive upgrade");
});

test("Automatically chosen buddy powers actually change its projectiles", () => {
  const game = new ArenaGame({ character: "steelix", buddy: "greninja", difficulty: "relaxed", seed: 19 });
  game.elapsed = 27.99; game.step(dt);
  game.chooseUpgrade(game.upgradeChoices[0].id);
  game.bossArrived = true;
  game.player.cooldown = 10; game.player.energy = 0;
  Object.assign(game.buddy, { x: 500, y: 450, energy: 0, cooldown: 0 });
  game.enemies = [enemy(100, 500, 220, "shooter", 1000)];
  advance(game, 0.25);
  assert.equal(game.buddyUpgrades[0], "water-fan");
  assert.equal(game.shots.filter(shot => shot.source === game.buddy.id && shot.kind === "water").length, 9);
});

test("The stage leaders cast different telegraphed patterns and hostile projectiles", () => {
  const signatures = [];
  for (const stage of STAGES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, stage: stage.id, difficulty: "relaxed", seed: 1 });
    game.bossArrived = true; game.player.cooldown = 10; game.player.energy = 0;
    const boss = enemy(100, 500, 150, "boss", 5000);
    boss.art = stage.boss.art; boss.timer = 0;
    game.enemies = [boss];
    game.step(dt);
    assert.ok(game.hazards.length > 0 && game.hazards.every(hazard => hazard.wait > 1));
    signatures.push(game.hazards.map(hazard => hazard.kind + ":" + hazard.radius + ":" + hazard.payload).join("/"));
    if (["haunt", "water"].includes(stage.boss.style)) {
      advance(game, 2.1, { x: -1, y: 0 });
      assert.ok(game.shots.some(shot => !shot.ally && shot.kind === (stage.boss.style === "haunt" ? "ghost" : "water")), stage.name);
    }
  }
  assert.equal(new Set(signatures).size, 5);
});

test("All five stages can be completed by every hero without an AI partner", context => {
  for (const stage of STAGES) for (const spec of HEROES) {
    const game = new ArenaGame({ character: spec.id, buddy: null, stage: stage.id, difficulty: "relaxed", seed: 23 });
    for (let i = 0; i < 60 * 330 && ["playing", "upgrade"].includes(game.phase); i++) {
      if (game.phase === "upgrade") game.chooseUpgrade(game.upgradeChoices[0].id);
      else game.step(dt, driver(game));
    }
    assert.equal(game.phase, "won", stage.name + " / " + spec.name + ": " + game.elapsed.toFixed(1) + "s, " + game.player.hp + "hp");
    assert.equal(game.upgradesTaken.length, 2);
    context.diagnostic(stage.name + " / " + spec.id + ": " + game.elapsed.toFixed(1) + "s");
  }
});

test("Water targeting uses projectile width at a shelter corner instead of repeatedly firing into the edge", () => {
  const game = new ArenaGame({ character: "greninja", buddy: null, difficulty: "relaxed", stage: 3, seed: 1 });
  game.bossArrived = true;
  Object.assign(game.player, { x: 681.54, y: 380 });
  const corner = enemy(100, 574.75, 251.3, "shooter", 1000);
  const exposed = enemy(101, 500, 485, "shooter", 1000);
  game.enemies = [corner, exposed];
  assert.equal(game.blocked(game.player, corner, 3), false);
  assert.equal(game.blocked(game.player, corner, 9), true);
  game.step(dt);
  assert.equal(game.targetId, 101);
});

test("The expanded maps support standard difficulty and a growing optional buddy through all five leaders", () => {
  const configurations = [
    { character: "steelix", buddy: "duskull", difficulty: "relaxed" },
    { character: "duskull", buddy: "steelix", difficulty: "standard" },
    { character: "greninja", buddy: null, difficulty: "standard" }
  ];
  for (const stage of STAGES) for (const configuration of configurations) {
    const game = new ArenaGame({ ...configuration, stage: stage.id, seed: 31 });
    for (let i = 0; i < 60 * 330 && ["playing", "upgrade"].includes(game.phase); i++) {
      if (game.phase === "upgrade") game.chooseUpgrade(game.upgradeChoices[0].id);
      else game.step(dt, driver(game));
    }
    assert.equal(game.phase, "won", stage.name + " / " + JSON.stringify(configuration) + ": " + game.elapsed.toFixed(1) + "s, " + game.player.hp + "hp");
    if (game.buddy) {
      assert.equal(game.buddyUpgrades.length, 2);
      assert.ok(game.buddyUpgrades.every(id => UPGRADES.find(item => item.id === id).category === "attack"));
    }
  }
});

test("Navigation escapes a tight rounded quarry corner instead of stalling at a padded graph boundary", () => {
  const game = new ArenaGame({ character: "greninja", buddy: "steelix", stage: 2, difficulty: "standard" });
  const point = { x: 213.29502455613084, y: 261.7045893184212 };
  const goal = { x: 405.5561534868534, y: 190.61476857990715 };
  for (let i = 0; i < 800 && pointDistance(point, goal) > 22; i++) {
    const direction = game.navigate(point, goal, RADIUS);
    game.move(point, direction.x * 3, direction.y * 3, RADIUS);
    assert.ok(game.walkable(point, RADIUS));
  }
  assert.ok(pointDistance(point, goal) < 25, JSON.stringify(point));
});


test("Every stage has progressively denser waves on the four challenge settings", () => {
  assert.deepEqual(DIFFICULTIES.map(item => item.id), ["relaxed", "standard", "hard", "expert"]);
  for (const stage of STAGES) {
    const counts = [];
    for (const setting of DIFFICULTIES) {
      const game = new ArenaGame({ character: "steelix", buddy: null, stage: stage.id, difficulty: setting.id, seed: 9 });
      Object.assign(game.player, { cooldown: 1000, energy: -1000, shield: 1000 });
      game.upgradeRound = 2;
      advance(game, 12);
      counts.push(game.enemies.length);
      advance(game, 48);
      assert.equal(game.enemies.length, setting.enemyLimit, stage.name + " / " + setting.id);
      assert.equal(game.phase, "playing");
    }
    assert.ok(counts.every((value, index) => index === 0 || value > counts[index - 1]), stage.name + ": " + counts);
  }
});

test("Harder shooters fire faster projectiles more often and add dodgeable three-shot fans", () => {
  let previousSpeed = 0, previousInterval = Infinity;
  for (const setting of DIFFICULTIES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, difficulty: setting.id, seed: 1 });
    game.bossArrived = true; game.player.cooldown = 1000; game.player.energy = -1000;
    const shooter = enemy(100, 750, 450, "shooter", 1000); shooter.timer = 0;
    game.enemies = [shooter];
    game.step(dt);
    const shots = game.shots.filter(shot => !shot.ally);
    assert.equal(shots.length, setting.id === "hard" || setting.id === "expert" ? 3 : 1);
    const speed = Math.hypot(shots[0].vx, shots[0].vy);
    assert.ok(speed > previousSpeed);
    assert.ok(shooter.timer < previousInterval);
    assert.equal(new Set(shots.map(shot => Math.atan2(shot.vy, shot.vx).toFixed(3))).size, shots.length);
    if (shots.length === 3) {
      const aim = Math.atan2(game.player.y - shooter.y, game.player.x - shooter.x);
      assert.ok(Math.abs(Math.atan2(shots[1].vy, shots[1].vx) - aim) < 0.001, "The center shot aims at the player");
    }
    previousSpeed = speed; previousInterval = shooter.timer;
  }
});

test("Higher challenge levels shorten actual charge warnings, boss warnings and rest periods", () => {
  let previousCharge = Infinity, previousWarning = Infinity, previousRest = Infinity, previousSpeed = 0;
  for (const setting of DIFFICULTIES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, difficulty: setting.id, seed: 1 });
    game.bossArrived = true; game.player.cooldown = 1000; game.player.energy = -1000;
    const charger = enemy(100, 700, 485, "charger", 1000); charger.timer = 0;
    game.enemies = [charger]; game.step(dt);
    assert.ok(charger.windup < previousCharge && charger.windup >= 0.7);
    previousCharge = charger.windup;
    const chaser = enemy(102, 700, 485, "chaser", 1000);
    game.enemies = [chaser]; game.step(dt);
    const speed = (700 - chaser.x) / dt;
    assert.ok(speed > previousSpeed); previousSpeed = speed;
    const boss = enemy(101, 500, 150, "boss", 1000); boss.timer = 0;
    game.enemies = [boss]; game.step(dt);
    const warning = game.hazards[0];
    assert.ok(warning.wait > 0.9 && warning.wait < previousWarning, "Every tier keeps a visible warning");
    assert.ok(boss.timer - warning.duration < previousRest);
    assert.equal(warning.fired, false);
    previousWarning = warning.wait; previousRest = boss.timer - warning.duration;
  }
});

test("Easy keeps generous hit protection while advanced settings require more careful dodging", () => {
  const damage = [];
  for (const setting of DIFFICULTIES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, difficulty: setting.id, seed: 1 });
    game.bossArrived = true;
    incoming(game); game.step(dt);
    assert.equal(game.player.hp, game.player.maxHp - 1);
    advance(game, 0.9);
    incoming(game); game.step(dt);
    damage.push(game.player.maxHp - game.player.hp);
  }
  assert.deepEqual(damage, [1, 1, 1, 2]);
});

test("Difficulty preserves movement controls, hero damage, safe practice and two offensive buddy upgrades", () => {
  const distances = [], damage = [];
  for (const setting of DIFFICULTIES) {
    const game = new ArenaGame({ character: "steelix", buddy: null, difficulty: setting.id, seed: 1 });
    game.bossArrived = true;
    advance(game, 0.5, { x: 1, y: 0 }); distances.push(game.player.x);
    game.player.energy = 0;
    const target = enemy(100, game.player.x + 100, game.player.y, "shooter", 1000);
    game.enemies = [target]; advance(game, 0.4); damage.push(1000 - target.hp);
    const practice = new ArenaGame({ character: "duskull", buddy: "steelix", difficulty: setting.id, practice: true, seed: 1 });
    incoming(practice, 100); practice.step(dt);
    assert.equal(practice.player.hp, practice.player.maxHp);
    assert.equal(practice.elapsed, 0);
    practice.finishPractice();
    for (const time of [27.99, 57.99]) {
      practice.elapsed = time; practice.step(dt);
      assert.equal(practice.phase, "upgrade");
      practice.chooseUpgrade(practice.upgradeChoices[0].id);
    }
    assert.deepEqual(practice.buddyUpgrades, ["steel-double", "steel-wide"]);
  }
  assert.equal(new Set(distances).size, 1);
  assert.equal(new Set(damage).size, 1);
  assert.ok(damage[0] > 0);
});
