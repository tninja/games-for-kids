(function(root,factory){if(typeof module==="object"&&module.exports){module.exports=factory();}else{root.PocketArena=factory();}})(typeof self!=="undefined"?self:this,function(){
"use strict";
var __PocketArena = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // pokemon_fight/ts/app.ts
  var app_exports = {};
  __export(app_exports, {
    ART: () => ART,
    ArenaGame: () => ArenaGame,
    COVER: () => COVER,
    DEFAULT_DIFFICULTY: () => DEFAULT_DIFFICULTY,
    DIFFICULTIES: () => DIFFICULTIES,
    HEIGHT: () => HEIGHT,
    HEROES: () => HEROES,
    PocketArenaApp: () => PocketArenaApp,
    RADIUS: () => RADIUS,
    STAGES: () => STAGES,
    UPGRADES: () => UPGRADES,
    WIDTH: () => WIDTH,
    app: () => app,
    arenaView: () => arenaView,
    blocked: () => blocked,
    move: () => move,
    navigate: () => navigate,
    segmentDistance: () => segmentDistance,
    walkable: () => walkable
  });

  // pokemon_fight/ts/data.ts
  var WIDTH = 1e3;
  var HEIGHT = 620;
  var RADIUS = 18;
  var COVER = [
    { x: 270, y: 242, w: 112, h: 62 },
    { x: 618, y: 316, w: 112, h: 62 }
  ];
  var HEROES = [
    { id: "steelix", name: "Radiant Steelix", title: "Sweep the whole crowd", description: "Golden tail waves sweep a fan and push challengers back.", color: "#ffd56a", hp: 10, speed: 188, damage: 20, interval: 0.8, range: 265, special: "Golden tail sweep" },
    { id: "duskull", name: "Duskull", title: "Let the spirits chase", description: "Tracking ghost flames slip past cover, haunt and slow.", color: "#c6a0ff", hp: 8, speed: 201, damage: 10, interval: 0.65, range: 300, special: "Spirit shield" },
    { id: "greninja", name: "Greninja", title: "Line them up", description: "Three quick water stars pierce through a line of targets.", color: "#71dbff", hp: 8, speed: 226, damage: 7, interval: 0.85, range: 320, special: "Water star burst" },
    { id: "darmanitan", name: "Darmanitan", title: "Lead them into the fire", description: "Lob fireballs over cover and leave glowing flame patches.", color: "#ff9c78", hp: 9, speed: 198, damage: 19, interval: 1.1, range: 300, special: "Firework bloom" }
  ];
  var ART = {
    steelix: { file: "IMG_0713.jpeg", turn: false, crop: [0.286, 0.262, 0.583, 0.273] },
    duskull: { file: "IMG_0714.jpeg", turn: true, crop: [0.192, 0.187, 0.558, 0.265] },
    greninja: { file: "IMG_0712.jpeg", turn: false, crop: [0.199, 0.215, 0.614, 0.269] },
    darmanitan: { file: "IMG_0718.jpeg", turn: true, crop: [0.206, 0.215, 0.587, 0.273] },
    machamp: { file: "IMG_0717.jpeg", turn: true, crop: [0.16, 0.224, 0.558, 0.265] },
    machoke: { file: "IMG_0719.jpeg", turn: true, crop: [0.158, 0.285, 0.575, 0.258] },
    spewpa: { file: "IMG_0715.jpeg", turn: true, crop: [0.303, 0.309, 0.536, 0.249] }
  };
  var hero = (id) => HEROES.find((item) => item.id === id);

  // pokemon_fight/ts/physics.ts
  var clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function unit(x, y) {
    const length = Math.hypot(x, y);
    return length > 1e-4 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
  }
  function circleRect(point, radius, rect) {
    return Math.hypot(point.x - clamp(point.x, rect.x, rect.x + rect.w), point.y - clamp(point.y, rect.y, rect.y + rect.h)) < radius;
  }
  function walkable(point, radius, cover = COVER) {
    return point.x >= radius + 24 && point.x <= WIDTH - radius - 24 && point.y >= radius + 24 && point.y <= HEIGHT - radius - 24 && !cover.some((rect) => circleRect(point, radius, rect));
  }
  function move(point, dx, dy, radius, cover = COVER) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (radius * 0.5)));
    for (let step = 0; step < steps; step++) {
      const x = clamp(point.x + dx / steps, 24 + radius, WIDTH - 24 - radius);
      const y = clamp(point.y + dy / steps, 24 + radius, HEIGHT - 24 - radius);
      if (walkable({ x, y: point.y }, radius, cover)) point.x = x;
      if (walkable({ x: point.x, y }, radius, cover)) point.y = y;
    }
  }
  function segmentRect(a, b, rect, padding = 0) {
    let near = 0;
    let far = 1;
    for (const axis of ["x", "y"]) {
      const delta = b[axis] - a[axis];
      const min = rect[axis] - padding;
      const max = rect[axis] + (axis === "x" ? rect.w : rect.h) + padding;
      if (Math.abs(delta) < 1e-5) {
        if (a[axis] < min || a[axis] > max) return false;
      } else {
        let first = (min - a[axis]) / delta;
        let second = (max - a[axis]) / delta;
        if (first > second) [first, second] = [second, first];
        near = Math.max(near, first);
        far = Math.min(far, second);
        if (near > far) return false;
      }
    }
    return true;
  }
  var blocked = (a, b, padding = 3, cover = COVER) => cover.some((rect) => segmentRect(a, b, rect, padding));
  function segmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
  }
  function navigate(point, goal, radius, cover = COVER) {
    if (!blocked(point, goal, radius + 2, cover)) return unit(goal.x - point.x, goal.y - point.y);
    const touching = cover.find((rect) => point.x > rect.x - radius - 4 && point.x < rect.x + rect.w + radius + 4 && point.y > rect.y - radius - 4 && point.y < rect.y + rect.h + radius + 4);
    if (touching) {
      const away = unit(point.x - clamp(point.x, touching.x, touching.x + touching.w), point.y - clamp(point.y, touching.y, touching.y + touching.h));
      if (Math.hypot(away.x, away.y) > 0) return away;
    }
    const gap = radius + 12;
    const nodes = [point, ...cover.flatMap((rect) => [
      { x: rect.x - gap, y: rect.y - gap },
      { x: rect.x + rect.w + gap, y: rect.y - gap },
      { x: rect.x - gap, y: rect.y + rect.h + gap },
      { x: rect.x + rect.w + gap, y: rect.y + rect.h + gap }
    ]), goal];
    const costs = nodes.map(() => Infinity);
    const next = nodes.map(() => -1);
    const visited = /* @__PURE__ */ new Set();
    costs[nodes.length - 1] = 0;
    for (let step = 0; step < nodes.length; step++) {
      let best = -1;
      for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (best < 0 || costs[i] < costs[best])) best = i;
      if (best < 0 || !Number.isFinite(costs[best])) break;
      visited.add(best);
      for (let i = 0; i < nodes.length; i++) {
        if (visited.has(i) || blocked(nodes[i], nodes[best], radius + 2, cover)) continue;
        const cost = costs[best] + distance(nodes[i], nodes[best]);
        if (cost < costs[i]) {
          costs[i] = cost;
          next[i] = best;
        }
      }
    }
    let target = next[0];
    while (target >= 0 && distance(point, nodes[target]) < 3 && next[target] >= 0) target = next[target];
    const destination = target >= 0 ? nodes[target] : goal;
    return unit(destination.x - point.x, destination.y - point.y);
  }

  // pokemon_fight/ts/upgrades.ts
  var UPGRADES = [
    { id: "steel-wide", category: "attack", hero: "steelix", name: "Wide sweep", description: "A wider wave catches more challengers.", symbol: "\u25D4" },
    { id: "steel-double", category: "attack", hero: "steelix", name: "Double tail", description: "A second golden wave follows the first.", symbol: "\u224B" },
    { id: "steel-armor", category: "defense", hero: "steelix", name: "Rock armor", description: "Three extra hearts and a fresh heal.", symbol: "\u2B21" },
    { id: "ghost-twins", category: "attack", hero: "duskull", name: "Twin spirits", description: "Send out an extra tracking ghost flame.", symbol: "\u2637" },
    { id: "ghost-haunt", category: "attack", hero: "duskull", name: "Long haunt", description: "Ghost flames linger and slow for longer.", symbol: "\u25CE" },
    { id: "ghost-guard", category: "defense", hero: "duskull", name: "Cozy shield", description: "Your automatic spirit shield lasts longer.", symbol: "\u2661" },
    { id: "water-fan", category: "attack", hero: "greninja", name: "Three ways", description: "Each water star becomes a three-way fan.", symbol: "\u2733" },
    { id: "water-return", category: "attack", hero: "greninja", name: "Come back", description: "Water stars return for another hit.", symbol: "\u21BA" },
    { id: "water-pierce", category: "attack", hero: "greninja", name: "Star stream", description: "Water stars pierce through more targets.", symbol: "\u2727" },
    { id: "fire-twins", category: "attack", hero: "darmanitan", name: "Double fire", description: "Lob a second fireball beside the first.", symbol: "\u2668" },
    { id: "fire-long", category: "attack", hero: "darmanitan", name: "Lasting glow", description: "Flame patches stay warm for longer.", symbol: "\u2600" },
    { id: "fire-big", category: "attack", hero: "darmanitan", name: "Big bloom", description: "Bigger bursts catch nearby challengers.", symbol: "\u2739" },
    { id: "swift-feet", category: "utility", name: "Happy feet", description: "Move a little faster around the arena.", symbol: "\u2248" },
    { id: "big-heart", category: "defense", name: "Big heart", description: "Three extra hearts and a fresh heal.", symbol: "\u2665" },
    { id: "quick-charge", category: "utility", name: "Star power", description: "Charge your automatic special faster.", symbol: "\u26A1" }
  ];
  var BUDDY_ATTACK_PRIORITY = {
    steelix: ["steel-double", "steel-wide"],
    duskull: ["ghost-twins", "ghost-haunt"],
    greninja: ["water-fan", "water-return", "water-pierce"],
    darmanitan: ["fire-twins", "fire-big", "fire-long"]
  };

  // pokemon_fight/ts/stages.ts
  var STAGES = [
    {
      id: 0,
      name: "Meadow Camp",
      subtitle: "Your first trainer badge",
      symbol: "\u2740",
      theme: "meadow",
      colors: { ground: "#42795a", edge: "#305947", line: "#c8e2af", stone: "#b0bda0", leaf: "#638e63", accent: "#ffd56a" },
      cover: COVER,
      boss: { art: "machamp", name: "Machamp", style: "punch" },
      enemies: ["chaser", "shooter", "charger", "guard"],
      enemyArt: {},
      strength: 1,
      goal: { kind: "defeat", label: "Clear 12 challengers", count: 12, points: [] }
    },
    {
      id: 1,
      name: "Moonlit Woods",
      subtitle: "Find friends among the trees",
      symbol: "\u263D",
      theme: "woods",
      colors: { ground: "#34465d", edge: "#202e46", line: "#bcaee2", stone: "#767e9c", leaf: "#73618a", accent: "#c6a0ff" },
      cover: [{ x: 205, y: 205, w: 85, h: 100 }, { x: 710, y: 205, w: 85, h: 100 }, { x: 330, y: 360, w: 90, h: 65 }, { x: 580, y: 360, w: 90, h: 65 }],
      boss: { art: "duskull", name: "Duskull", style: "haunt" },
      enemies: ["chaser", "shooter", "shooter", "charger"],
      enemyArt: { chaser: "spewpa", shooter: "duskull" },
      strength: 1.04,
      goal: { kind: "rescue", label: "Help 2 lost friends", count: 2, points: [{ x: 135, y: 445 }, { x: 865, y: 180 }] }
    },
    {
      id: 2,
      name: "Crystal Quarry",
      subtitle: "Golden waves and glittering paths",
      symbol: "\u25C6",
      theme: "quarry",
      colors: { ground: "#6f6858", edge: "#464d4e", line: "#e6d5a9", stone: "#afb7a9", leaf: "#9a936d", accent: "#9beaff" },
      cover: [{ x: 220, y: 185, w: 155, h: 60 }, { x: 625, y: 185, w: 155, h: 60 }, { x: 220, y: 365, w: 95, h: 100 }, { x: 685, y: 365, w: 95, h: 100 }],
      boss: { art: "steelix", name: "Radiant Steelix", style: "quake" },
      enemies: ["guard", "guard", "charger", "shooter"],
      enemyArt: {},
      strength: 1.1,
      goal: { kind: "collect", label: "Gather 4 crystals", count: 4, points: [{ x: 120, y: 135 }, { x: 875, y: 140 }, { x: 120, y: 500 }, { x: 870, y: 500 }] }
    },
    {
      id: 3,
      name: "Ember Ruins",
      subtitle: "Light the old lanterns",
      symbol: "\u2668",
      theme: "ember",
      colors: { ground: "#78504b", edge: "#472d39", line: "#f5c591", stone: "#b08a75", leaf: "#ae704f", accent: "#ffb080" },
      cover: [{ x: 235, y: 240, w: 100, h: 110 }, { x: 665, y: 240, w: 100, h: 110 }, { x: 445, y: 285, w: 110, h: 65 }],
      boss: { art: "darmanitan", name: "Darmanitan", style: "eruption" },
      enemies: ["shooter", "charger", "shooter", "guard"],
      enemyArt: { shooter: "darmanitan" },
      strength: 1.14,
      goal: { kind: "lantern", label: "Light 3 lanterns", count: 3, points: [{ x: 145, y: 445 }, { x: 500, y: 230 }, { x: 855, y: 445 }] }
    },
    {
      id: 4,
      name: "Sky Temple",
      subtitle: "Earn the final sky badge",
      symbol: "\u2736",
      theme: "sky",
      colors: { ground: "#507d8e", edge: "#294c67", line: "#c4f5ff", stone: "#adc9cc", leaf: "#89bbbd", accent: "#a5efff" },
      cover: [{ x: 220, y: 205, w: 85, h: 155 }, { x: 695, y: 205, w: 85, h: 155 }, { x: 445, y: 315, w: 110, h: 60 }],
      boss: { art: "greninja", name: "Greninja", style: "water" },
      enemies: ["charger", "guard", "shooter", "chaser"],
      enemyArt: { charger: "greninja", shooter: "spewpa" },
      strength: 1.2,
      goal: { kind: "beacon", label: "Charge 2 sky beacons", count: 2, points: [{ x: 130, y: 310 }, { x: 870, y: 310 }] }
    }
  ];
  function stage(id = 0) {
    return STAGES.find((item) => item.id === id) ?? STAGES[0];
  }

  // pokemon_fight/ts/difficulty.ts
  var DIFFICULTIES = [
    {
      id: "relaxed",
      name: "Easy",
      description: "Fewer challengers, slow shots, and plenty of time to dodge.",
      enemyLimit: 5,
      spawnInterval: 3.4,
      enemyHp: 1,
      chaserSpeed: 61,
      movement: 1,
      shooterInterval: 3.3,
      projectileSpeed: 125,
      shooterShots: 1,
      chargeWarning: 1.2,
      chargeRest: 3.2,
      bossHp: 1400,
      bossWarning: 1.9,
      bossRest: 3.2,
      bossProjectileSpeed: 1,
      hurtGrace: 1.2,
      supplyInterval: 22,
      healthDropChance: 0.22
    },
    {
      id: "standard",
      name: "Normal",
      description: "A lively battle with more challengers and faster shots. Start here!",
      enemyLimit: 8,
      spawnInterval: 2.2,
      enemyHp: 1,
      chaserSpeed: 86,
      movement: 1,
      shooterInterval: 2.5,
      projectileSpeed: 155,
      shooterShots: 1,
      chargeWarning: 1,
      chargeRest: 3,
      bossHp: 1850,
      bossWarning: 1.5,
      bossRest: 3,
      bossProjectileSpeed: 1,
      hurtGrace: 1.2,
      supplyInterval: 24,
      healthDropChance: 0.2
    },
    {
      id: "hard",
      name: "Hard",
      description: "Busy waves, three-shot fans, and shorter warnings. Keep moving!",
      enemyLimit: 11,
      spawnInterval: 1.6,
      enemyHp: 1.12,
      chaserSpeed: 105,
      movement: 1.12,
      shooterInterval: 2,
      projectileSpeed: 185,
      shooterShots: 3,
      chargeWarning: 0.85,
      chargeRest: 2.6,
      bossHp: 2150,
      bossWarning: 1.2,
      bossRest: 2.2,
      bossProjectileSpeed: 1.3,
      hurtGrace: 0.95,
      supplyInterval: 28,
      healthDropChance: 0.17
    },
    {
      id: "expert",
      name: "Expert",
      description: "The biggest waves, fastest shots, and fierce leaders. For a big challenge!",
      enemyLimit: 14,
      spawnInterval: 1.15,
      enemyHp: 1.25,
      chaserSpeed: 122,
      movement: 1.25,
      shooterInterval: 1.6,
      projectileSpeed: 215,
      shooterShots: 3,
      chargeWarning: 0.7,
      chargeRest: 2.2,
      bossHp: 2450,
      bossWarning: 1,
      bossRest: 1.7,
      bossProjectileSpeed: 1.45,
      hurtGrace: 0.8,
      supplyInterval: 32,
      healthDropChance: 0.14
    }
  ];
  var DEFAULT_DIFFICULTY = "standard";
  var validDifficulty = (id) => DIFFICULTIES.some((item) => item.id === id);
  function difficulty(id) {
    return DIFFICULTIES.find((item) => item.id === id) ?? DIFFICULTIES[1];
  }

  // pokemon_fight/ts/game.ts
  var ArenaGame = class {
    constructor(options) {
      this.enemies = [];
      this.shots = [];
      this.pickups = [];
      this.effects = [];
      this.hazards = [];
      this.flames = [];
      this.upgradeChoices = [];
      this.upgradesTaken = [];
      this.buddyUpgrades = [];
      this.objectiveRewarded = false;
      this.upgradeRound = 0;
      this.bossEnraged = false;
      this.events = [];
      this.elapsed = 0;
      this.practiceTime = 0;
      this.traveled = 0;
      this.hits = 0;
      this.defeated = 0;
      this.targetId = null;
      this.bossArrived = false;
      this.rescueUsed = false;
      this.announcement = "Find your feet!";
      this.announcementTime = 4;
      this.spawnTimer = 1;
      this.supplyTimer = 18;
      this.serial = 0;
      this.beforePause = "playing";
      this.targetOwner = /* @__PURE__ */ new Map();
      this.bursts = [];
      this.introducedCharger = false;
      this.introducedGuard = false;
      this.level = stage(options.stage);
      this.obstacles = (options.practice ? COVER : this.level.cover).map((rect) => ({ ...rect }));
      this.challenge = difficulty(options.difficulty);
      this.options = { ...options, difficulty: this.challenge.id, stage: this.level.id };
      this.supplyTimer = this.challenge.supplyInterval - 4;
      this.randomState = options.seed ?? Math.floor(Math.random() * 2147483646) + 1;
      this.player = this.makeActor(options.character, 500, 485);
      this.buddy = options.buddy ? this.makeActor(options.buddy, 575, 485) : null;
      this.goalNodes = this.level.goal.points.map((point, index) => ({ ...point, id: ++this.serial, progress: 0, done: false, art: index % 2 ? "greninja" : "spewpa" }));
      this.phase = options.practice ? "practice" : "playing";
      if (options.practice) this.enemies.push(this.makeEnemy("dummy", 510, 330));
      else this.announce(this.level.name + " - your adventure begins!");
    }
    walkable(point, radius) {
      return walkable(point, radius, this.obstacles);
    }
    move(point, dx, dy, radius) {
      move(point, dx, dy, radius, this.obstacles);
    }
    blocked(a, b, padding = 3) {
      return blocked(a, b, padding, this.obstacles);
    }
    navigate(point, goal, radius) {
      return navigate(point, goal, radius, this.obstacles);
    }
    get objectiveProgress() {
      return Math.min(this.level.goal.count, this.level.goal.kind === "defeat" ? this.defeated : this.goalNodes.filter((node) => node.done).length);
    }
    get objectiveComplete() {
      return this.objectiveProgress >= this.level.goal.count;
    }
    random() {
      this.randomState = Math.imul(this.randomState, 1664525) + 1013904223 | 0;
      return (this.randomState >>> 0) / 4294967296;
    }
    makeActor(id, x, y) {
      const spec = hero(id);
      return { id: ++this.serial, art: id, x, y, hp: spec.hp, maxHp: spec.hp, radius: RADIUS, cooldown: 0, hurt: 0, shield: 0, energy: 25, revive: 0 };
    }
    makeEnemy(kind, x, y) {
      const baseHp = kind === "boss" ? this.challenge.bossHp : kind === "guard" ? 42 : kind === "charger" ? 26 : kind === "shooter" ? 24 : kind === "dummy" ? 24 : 20;
      const hp = kind === "dummy" ? baseHp : Math.round(baseHp * this.level.strength * (kind === "boss" ? 1 : this.challenge.enemyHp));
      const art = kind === "boss" ? this.level.boss.art : kind === "dummy" ? "machoke" : this.level.enemyArt[kind] ?? (kind === "shooter" ? "spewpa" : "machoke");
      return {
        id: ++this.serial,
        art,
        kind,
        x,
        y,
        hp,
        maxHp: hp,
        radius: kind === "boss" ? 30 : 17,
        cooldown: 0,
        hurt: 0,
        shield: 0,
        energy: 0,
        revive: 0,
        timer: 1.5,
        turn: 0,
        facing: Math.atan2(this.player.y - y, this.player.x - x)
      };
    }
    emit(event) {
      if (this.events.length < 40) this.events.push(event);
    }
    terminal() {
      return this.phase === "won" || this.phase === "lost";
    }
    announce(text2) {
      this.announcement = text2;
      this.announcementTime = 4;
    }
    effect(point, color, radius = 65, kind = "burst") {
      this.effects.push({ ...point, color, radius, kind, life: 0.65, duration: 0.65 });
      if (this.effects.length > 160) this.effects.shift();
    }
    get boss() {
      return this.enemies.find((enemy) => enemy.kind === "boss" && enemy.hp > 0);
    }
    get stage() {
      if (this.phase === "practice" || this.phase === "paused" && this.beforePause === "practice") return "PRACTICE";
      return this.bossArrived ? this.bossEnraged ? "BOSS: PHASE 2" : "BOSS BATTLE" : this.elapsed < 45 ? "ROUND 1" : "ROUND 2";
    }
    pause() {
      if (this.phase === "practice" || this.phase === "playing") {
        this.beforePause = this.phase;
        this.phase = "paused";
      }
    }
    resume() {
      if (this.phase === "paused") this.phase = this.beforePause;
    }
    finishPractice() {
      if (this.phase !== "practice") return;
      this.phase = "playing";
      this.obstacles.splice(0, this.obstacles.length, ...this.level.cover.map((rect) => ({ ...rect })));
      this.enemies = [];
      this.shots = [];
      this.effects = [];
      this.pickups = [];
      this.flames = [];
      this.bursts = [];
      this.player.hp = this.player.maxHp;
      this.player.energy = 25;
      this.player.cooldown = 0;
      this.targetId = null;
      this.targetOwner.clear();
      this.player.x = 500;
      this.player.y = 485;
      if (this.buddy) {
        this.buddy.x = 575;
        this.buddy.y = 485;
      }
      this.announce("You have got this! Round 1 begins.");
    }
    step(dt, input = { x: 0, y: 0 }) {
      if (this.phase !== "playing" && this.phase !== "practice") return;
      dt = clamp(dt, 0, 1 / 30);
      const practice = this.phase === "practice";
      if (practice) this.practiceTime += dt;
      else this.elapsed += dt;
      if (!practice && !this.bossArrived && this.upgradeRound < 2 && this.elapsed >= [28, 58][this.upgradeRound]) {
        this.offerUpgrade();
        return;
      }
      this.announcementTime = Math.max(0, this.announcementTime - dt);
      this.effects = this.effects.filter((effect) => (effect.life -= dt) > 0);
      for (const actor of [this.player, ...this.buddy ? [this.buddy] : [], ...this.enemies]) {
        actor.cooldown = Math.max(0, actor.cooldown - dt);
        actor.hurt = Math.max(0, actor.hurt - dt);
        actor.shield = Math.max(0, actor.shield - dt);
        actor.attackTime = Math.max(0, (actor.attackTime ?? 0) - dt);
      }
      const length = Math.hypot(input.x, input.y);
      const direction = length > 1 ? unit(input.x, input.y) : input;
      const old = { x: this.player.x, y: this.player.y };
      const speed = hero(this.options.character).speed * (this.has(this.player, "swift-feet") ? 1.15 : 1);
      this.move(this.player, direction.x * speed * dt, direction.y * speed * dt, RADIUS);
      this.traveled += distance(old, this.player);
      if (!practice) this.updateObjective(dt);
      this.player.energy = Math.min(100, this.player.energy + dt * (this.has(this.player, "quick-charge") ? 8.4 : 6));
      this.updateHaunts(dt);
      if (this.terminal()) return;
      this.attack(this.player, false);
      if (this.terminal()) return;
      this.updateBuddy(dt, practice);
      if (this.terminal()) return;
      if (!practice) {
        this.updateEncounters(dt);
        this.updateEnemies(dt);
        if (this.terminal()) return;
        this.updateHazards(dt);
      }
      if (this.terminal()) return;
      this.updateBursts(dt);
      this.updateShots(dt);
      if (this.terminal()) return;
      this.updateFlames(dt);
      if (this.terminal()) return;
      this.collect(dt);
      if (practice && this.traveled > 110 && this.hits > 0) this.finishPractice();
    }
    has(actor, upgrade) {
      return actor === this.player ? this.upgradesTaken.includes(upgrade) : actor === this.buddy && this.buddyUpgrades.includes(upgrade);
    }
    offerUpgrade() {
      const available = UPGRADES.filter((item) => !this.upgradesTaken.includes(item.id));
      const shuffle = (items) => {
        for (let i = items.length - 1; i > 0; i--) {
          const swap = Math.floor(this.random() * (i + 1));
          [items[i], items[swap]] = [items[swap], items[i]];
        }
        return items;
      };
      const signature = shuffle(available.filter((item) => item.hero === this.options.character)).slice(0, 2);
      const utility = shuffle(available.filter((item) => !item.hero)).slice(0, 1);
      this.upgradeChoices = shuffle([...signature, ...utility]);
      this.upgradeRound++;
      this.levelUpBuddy();
      this.phase = "upgrade";
      this.emit("upgrade");
    }
    levelUpBuddy() {
      if (!this.buddy) return;
      const priority = BUDDY_ATTACK_PRIORITY[this.buddy.art];
      const id = priority.find((candidate) => !this.buddyUpgrades.includes(candidate) && UPGRADES.some((item) => item.id === candidate && item.category === "attack"));
      if (!id) return;
      this.lastBuddyUpgrade = UPGRADES.find((item) => item.id === id);
      this.buddyUpgrades.push(id);
    }
    updateObjective(dt) {
      if (this.level.goal.kind !== "defeat") {
        for (const node of this.goalNodes) {
          if (node.done) continue;
          const hold = this.level.goal.kind === "collect" ? 0 : this.level.goal.kind === "beacon" ? 2 : 1.2;
          if (distance(this.player, node) < (hold ? 56 : 35)) node.progress = hold ? Math.min(1, node.progress + dt / hold) : 1;
          else node.progress = Math.max(0, node.progress - dt * 0.5);
          if (node.progress >= 1) {
            node.done = true;
            this.effect(node, this.level.colors.accent, 60, "heal");
            this.emit("pickup");
          }
        }
      }
      if (!this.objectiveRewarded && this.objectiveComplete) {
        this.objectiveRewarded = true;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
        this.player.energy = 100;
        this.announce("Bonus complete! Two hearts and a charged special.");
        this.effect(this.player, "#b8f2d2", 95, "heal");
        this.emit("objective");
      }
    }
    chooseUpgrade(id) {
      if (this.phase !== "upgrade" || !this.upgradeChoices.some((item) => item.id === id)) return false;
      const choice = this.upgradeChoices.find((item) => item.id === id);
      this.upgradesTaken.push(id);
      if (id === "big-heart" || id === "steel-armor") {
        this.player.maxHp += 3;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 3);
      }
      this.upgradeChoices = [];
      this.player.shield = Math.max(this.player.shield, 1);
      if (this.buddy) this.buddy.shield = Math.max(this.buddy.shield, 1);
      this.player.energy = Math.min(100, this.player.energy + 20);
      this.phase = "playing";
      this.announce(choice.name + "! Try your new power.");
      return true;
    }
    updateEncounters(dt) {
      if (!this.bossArrived && this.elapsed >= 90) {
        this.bossArrived = true;
        this.enemies = [this.makeEnemy("boss", 500, 148)];
        this.flames = [];
        this.bursts = [];
        this.shots = this.shots.filter((shot) => shot.ally);
        this.targetOwner.clear();
        this.targetId = null;
        this.announce(this.level.boss.name + " has arrived! Watch the ground.");
        this.emit("boss");
        this.pickups.push({ x: 500, y: 420, id: ++this.serial, life: 35, kind: "health" });
      }
      if (this.bossArrived) return;
      if (this.elapsed >= 45 && this.elapsed - dt < 45) this.announce("Round 2 - use the stone shelters!");
      this.spawnTimer -= dt;
      this.supplyTimer -= dt;
      if (this.supplyTimer <= 0) {
        this.supplyTimer = this.challenge.supplyInterval;
        this.pickups.push({ id: ++this.serial, x: 470 + this.random() * 60, y: 290 + this.random() * 55, kind: "health", life: 32 });
      }
      const max = this.challenge.enemyLimit;
      if (this.spawnTimer > 0 || this.enemies.length >= max) return;
      this.spawnTimer = this.challenge.spawnInterval;
      const sites = [{ x: 85, y: 100 }, { x: 500, y: 65 }, { x: 915, y: 110 }, { x: 85, y: 510 }, { x: 915, y: 510 }].filter((point2) => distance(point2, this.player) > 220);
      const point = sites[Math.floor(this.random() * sites.length)] ?? { x: 500, y: 65 };
      let kind = "chaser";
      if (this.elapsed >= 15 && !this.introducedCharger && this.level.enemies.includes("charger")) {
        kind = "charger";
        this.introducedCharger = true;
        this.announce("Orange stripe? Step aside for a charge!");
      } else if (this.elapsed >= 45 && !this.introducedGuard && this.level.enemies.includes("guard")) {
        kind = "guard";
        this.introducedGuard = true;
        this.announce("A shield! Try a side or a ghost flame.");
      } else if (this.elapsed >= 45) kind = this.level.enemies[Math.floor(this.random() * this.level.enemies.length)];
      else if (this.elapsed >= 15 && this.random() < 0.35) kind = this.level.enemies[0];
      this.enemies.push(this.makeEnemy(kind, point.x, point.y));
    }
    attack(actor, companion) {
      if (actor.hp <= 0) return;
      const spec = hero(actor.art);
      const eligible = (enemy) => enemy.hp > 0 && distance(actor, enemy) <= spec.range && (actor.art === "duskull" || actor.art === "darmanitan" || !this.blocked(actor, enemy, actor.art === "greninja" ? 9 : 3));
      let target = this.enemies.find((enemy) => enemy.id === this.targetOwner.get(actor.id) && eligible(enemy));
      if (!target) target = this.enemies.filter(eligible).sort((a, b) => distance(actor, a) - distance(actor, b))[0];
      if (!companion) this.targetId = target?.id ?? null;
      if (!target) {
        this.targetOwner.delete(actor.id);
        return;
      }
      this.targetOwner.set(actor.id, target.id);
      if (actor.energy >= 100) this.special(actor, companion, target);
      if (actor.cooldown > 0 || target.hp <= 0) return;
      actor.cooldown = spec.interval * (companion ? 1.3 : 1);
      actor.attackTime = 0.3;
      actor.aim = Math.atan2(target.y - actor.y, target.x - actor.x);
      const power = companion ? 0.5 : 1;
      const kind = actor.art === "steelix" ? "metal" : actor.art === "duskull" ? "ghost" : actor.art === "greninja" ? "water" : "fire";
      this.launch(actor, target, kind, power);
      const extra = kind === "water" ? 2 : this.has(actor, "steel-double") || this.has(actor, "ghost-twins") || this.has(actor, "fire-twins") ? 1 : 0;
      for (let i = 1; i <= extra; i++) this.bursts.push({ actor, target, kind, power, delay: kind === "water" ? i * 0.1 : 0.2 });
      if (!companion) this.emit(kind);
    }
    launch(actor, target, kind, power) {
      const spec = hero(actor.art);
      const aim = Math.atan2(target.y - actor.y, target.x - actor.x);
      const angles = kind === "water" && this.has(actor, "water-fan") ? [-0.24, 0, 0.24] : [0];
      for (const offset of angles) {
        const speed = kind === "ghost" ? 220 : kind === "water" ? 630 : 490;
        const angle = aim + offset + (kind === "ghost" ? 0.5 : 0);
        const shot = {
          id: ++this.serial,
          x: actor.x,
          y: actor.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: kind === "ghost" ? 2.4 : spec.range / speed + 0.12,
          damage: spec.damage * power,
          ally: true,
          color: spec.color,
          splash: 0,
          radius: kind === "ghost" ? 11 : 7,
          kind,
          source: actor.id,
          target: target.id,
          age: 0,
          from: { x: actor.x, y: actor.y },
          hits: []
        };
        if (kind === "metal") {
          shot.spread = this.has(actor, "steel-wide") ? 1 : 0.58;
          shot.life = spec.range / speed;
        }
        if (kind === "ghost") shot.haunt = this.has(actor, "ghost-haunt") ? 5 : 3;
        if (kind === "water") {
          shot.pierce = this.has(actor, "water-pierce") ? 5 : 2;
          shot.boomerang = this.has(actor, "water-return");
          shot.returnAt = shot.life;
          if (shot.boomerang) shot.life += 1.2;
        }
        if (kind === "fire") {
          shot.duration = 0.68;
          shot.life = 1;
          shot.to = { x: target.x, y: target.y };
          shot.splash = this.has(actor, "fire-big") ? 100 : 72;
        }
        this.shots.push(shot);
      }
    }
    updateBursts(dt) {
      const pending = this.bursts;
      this.bursts = [];
      for (const burst of pending) {
        burst.delay -= dt;
        if (burst.delay > 0) {
          this.bursts.push(burst);
          continue;
        }
        if (burst.actor.hp <= 0) continue;
        const target = burst.target.hp > 0 ? burst.target : this.enemies.find((enemy) => enemy.hp > 0 && distance(burst.actor, enemy) < hero(burst.actor.art).range);
        if (target) this.launch(burst.actor, target, burst.kind, burst.power);
      }
    }
    special(actor, companion, target) {
      const spec = hero(actor.art);
      actor.energy = 0;
      const power = companion ? 0.5 : 1;
      const radius = actor.art === "steelix" ? 290 : actor.art === "darmanitan" ? 95 : actor.art === "duskull" ? 140 : 340;
      if (actor.art === "duskull") actor.shield = this.has(actor, "ghost-guard") ? 7 : 4.5;
      if (actor.art === "steelix") actor.shield = 1.2;
      const center = actor.art === "darmanitan" ? { x: target.x, y: target.y } : actor;
      if (actor.art === "greninja") {
        const aim = Math.atan2(target.y - actor.y, target.x - actor.x);
        for (let i = -2; i <= 2; i++) {
          const angle = aim + i * 0.15;
          this.shots.push({
            id: ++this.serial,
            x: actor.x,
            y: actor.y,
            vx: Math.cos(angle) * 560,
            vy: Math.sin(angle) * 560,
            life: 0.72,
            damage: 25 * power,
            color: spec.color,
            ally: true,
            splash: 0,
            radius: 8,
            kind: "water",
            source: actor.id,
            hits: [],
            pierce: this.has(actor, "water-pierce") ? 5 : 2,
            age: 0
          });
        }
      } else for (const enemy of this.enemies.slice()) {
        if (enemy.hp > 0 && distance(center, enemy) <= radius && !this.blocked(center, enemy)) {
          if (actor.art === "steelix") enemy.guardBroken = 3;
          this.hitEnemy(enemy, 44 * power, center, true);
        }
      }
      if (actor.art === "darmanitan") this.makeFlame(center, this.has(actor, "fire-big") ? 125 : 95, 3 * power, actor.id);
      this.effect(center, spec.color, actor.art === "greninja" ? 70 : radius, actor.art === "darmanitan" ? "fire" : actor.art === "duskull" ? "haunt" : "ring");
      this.emit("special");
      if (!companion) this.announce(spec.special + "!");
    }
    updateBuddy(dt, practice) {
      const buddy = this.buddy;
      if (!buddy) return;
      if (buddy.hp <= 0) {
        buddy.revive = distance(this.player, buddy) < 85 ? buddy.revive + dt : 0;
        if (buddy.revive >= 1.5) {
          buddy.hp = Math.ceil(buddy.maxHp / 2);
          buddy.shield = 3;
          buddy.revive = 0;
          this.effect(buddy, "#a4f4d0", 70, "heal");
        }
        return;
      }
      buddy.energy = Math.min(100, buddy.energy + dt * 5);
      let goal = { x: this.player.x + (this.player.x < 500 ? 65 : -65), y: this.player.y + 30 };
      const nearby = this.enemies.filter((enemy) => enemy.hp > 0).sort((a, b) => distance(buddy, a) - distance(buddy, b))[0];
      if (nearby && distance(buddy, nearby) < 260 && distance(buddy, nearby) < 115) {
        const away = unit(buddy.x - nearby.x, buddy.y - nearby.y);
        goal = { x: buddy.x + away.x * 100, y: buddy.y + away.y * 100 };
      }
      for (const hazard of this.hazards) {
        if (hazard.fired) continue;
        if (hazard.kind === "circle" && distance(buddy, hazard) < hazard.radius + 35) {
          const away = unit(buddy.x - hazard.x || 1, buddy.y - hazard.y);
          goal = { x: hazard.x + away.x * (hazard.radius + 65), y: hazard.y + away.y * (hazard.radius + 65) };
        } else if (hazard.kind === "line" && segmentDistance(buddy, hazard, hazard.end) < hazard.radius + 35) {
          const vector = unit(hazard.end.x - hazard.x, hazard.end.y - hazard.y);
          const sign = (buddy.x - hazard.x) * -vector.y + (buddy.y - hazard.y) * vector.x >= 0 ? 1 : -1;
          goal = { x: buddy.x - vector.y * 150 * sign, y: buddy.y + vector.x * 150 * sign };
        }
      }
      if (distance(buddy, goal) > 16) {
        const vector = this.navigate(buddy, goal, RADIUS);
        this.move(buddy, vector.x * 185 * dt, vector.y * 185 * dt, RADIUS);
      }
      if (!practice) this.attack(buddy, true);
    }
    updateEnemies(dt) {
      for (const enemy of this.enemies) {
        if (enemy.hp <= 0) continue;
        const targets = [this.player, ...this.buddy && this.buddy.hp > 0 ? [this.buddy] : []];
        const target = targets.sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
        const slow = (enemy.haunt ?? 0) > 0 ? enemy.hauntSlow ?? 0.68 : 1;
        enemy.timer -= dt;
        if (enemy.kind === "boss") {
          if (!this.bossEnraged && enemy.hp <= enemy.maxHp * 0.5) {
            this.bossEnraged = true;
            this.announce(this.level.boss.name + " phase 2! Watch for new patterns.");
            this.effect(enemy, "#ff9c78", 120, "ring");
            this.emit("boss");
          }
          if (enemy.timer <= 0 && !this.hazards.some((hazard) => !hazard.fired)) {
            const wait = this.challenge.bossWarning + (this.bossEnraged ? 0.2 : 0);
            this.castBossPattern(enemy, wait);
            enemy.timer = wait + (this.challenge.bossRest - (this.bossEnraged ? 0.6 : 0));
          }
          if (!this.hazards.some((hazard) => !hazard.fired) && distance(enemy, this.player) > 205) {
            const direction = this.navigate(enemy, this.player, enemy.radius);
            const speed = (this.level.boss.style === "water" ? 95 : 48) * this.challenge.movement;
            this.move(enemy, direction.x * dt * speed * slow, direction.y * dt * speed * slow, enemy.radius);
          }
        } else if (enemy.kind === "chaser") {
          const direction = this.navigate(enemy, target, enemy.radius);
          const speed = this.challenge.chaserSpeed * slow;
          this.move(enemy, direction.x * dt * speed, direction.y * dt * speed, enemy.radius);
        } else if (enemy.kind === "charger") {
          if ((enemy.windup ?? 0) > 0) {
            enemy.windup = Math.max(0, enemy.windup - dt);
            if (enemy.windup === 0) {
              enemy.dash = 0.52;
              enemy.timer = this.challenge.chargeRest;
            }
          } else if ((enemy.dash ?? 0) > 0) {
            enemy.dash = Math.max(0, enemy.dash - dt);
            this.move(enemy, enemy.dashDirection.x * 440 * slow * dt, enemy.dashDirection.y * 440 * slow * dt, enemy.radius);
          } else if (enemy.timer <= 0 && distance(enemy, target) < 310) {
            enemy.dashDirection = unit(target.x - enemy.x, target.y - enemy.y);
            enemy.windup = this.challenge.chargeWarning;
            this.emit("charge");
          } else {
            const direction = this.navigate(enemy, target, enemy.radius);
            this.move(enemy, direction.x * 52 * this.challenge.movement * slow * dt, direction.y * 52 * this.challenge.movement * slow * dt, enemy.radius);
          }
        } else if (enemy.kind === "guard") {
          const desired = Math.atan2(target.y - enemy.y, target.x - enemy.x);
          const delta = Math.atan2(Math.sin(desired - (enemy.facing ?? 0)), Math.cos(desired - (enemy.facing ?? 0)));
          enemy.facing = (enemy.facing ?? 0) + clamp(delta, -0.8 * dt, 0.8 * dt);
          if (distance(enemy, target) > 75) {
            const direction = this.navigate(enemy, target, enemy.radius);
            this.move(enemy, direction.x * 48 * this.challenge.movement * slow * dt, direction.y * 48 * this.challenge.movement * slow * dt, enemy.radius);
          }
        } else if (enemy.kind === "shooter" && enemy.timer <= 0) {
          enemy.timer = this.challenge.shooterInterval;
          const aim = Math.atan2(target.y - enemy.y, target.x - enemy.x);
          for (let i = 0; i < this.challenge.shooterShots; i++) {
            const angle = aim + (i - (this.challenge.shooterShots - 1) / 2) * 0.24;
            this.shots.push({
              id: ++this.serial,
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angle) * this.challenge.projectileSpeed,
              vy: Math.sin(angle) * this.challenge.projectileSpeed,
              life: 7,
              damage: 1,
              ally: false,
              color: "#ff937d",
              splash: 0,
              radius: 9
            });
          }
        }
        for (const actor of targets) {
          if (distance(enemy, actor) < enemy.radius + actor.radius + 2) this.hurtActor(actor, enemy.kind === "charger" && (enemy.dash ?? 0) > 0 ? 2 : 1);
        }
      }
    }
    castBossPattern(enemy, wait) {
      const direction = unit(this.player.x - enemy.x, this.player.y - enemy.y);
      const pattern = enemy.turn++ % (this.bossEnraged ? 3 : 2);
      const end = { x: enemy.x + direction.x * 470, y: enemy.y + direction.y * 470 };
      if (this.level.boss.style === "haunt") {
        this.addHazard(this.player, "circle", 85, wait).payload = "ghost";
        if (this.bossEnraged) this.addHazard({ x: clamp(this.player.x + 150, 100, 900), y: clamp(this.player.y - 90, 100, 520) }, "circle", 65, wait + 0.3).payload = "ghost";
      } else if (this.level.boss.style === "quake") {
        if (pattern === 1) this.addHazard(enemy, "circle", 165, wait);
        else for (const offset of [-90, 90]) this.addHazard({ x: clamp(this.player.x + offset, 70, 930), y: 48 }, "line", 32, wait, { x: clamp(this.player.x + offset, 70, 930), y: 572 });
        if (this.bossEnraged) this.addHazard(this.player, "circle", 70, wait + 0.25);
      } else if (this.level.boss.style === "eruption") {
        this.addHazard(this.player, "circle", 90, wait).payload = "fire";
        if (this.bossEnraged) this.addHazard({ x: clamp(this.player.x - 145, 100, 900), y: clamp(this.player.y + 80, 100, 520) }, "circle", 75, wait + 0.3).payload = "fire";
      } else if (this.level.boss.style === "water") {
        this.addHazard(enemy, "line", 28, wait, end).payload = "water";
        if (this.bossEnraged) this.addHazard(this.player, "circle", 80, wait + 0.25);
      } else if (this.bossEnraged && pattern === 1) {
        this.addHazard(this.player, "circle", 100, wait);
      } else {
        this.addHazard(enemy, pattern === 0 ? "line" : "circle", pattern === 0 ? 38 : 155, wait, end);
        if (this.bossEnraged && pattern === 0) this.addHazard(
          { x: enemy.x + direction.y * 230, y: enemy.y - direction.x * 230 },
          "line",
          30,
          wait,
          { x: enemy.x - direction.y * 230, y: enemy.y + direction.x * 230 }
        );
      }
    }
    addHazard(point, kind, radius, wait, end = point) {
      const hazard = { x: point.x, y: point.y, end: { ...end }, kind, radius, wait, duration: wait, fired: false, life: 0.5 };
      this.hazards.push(hazard);
      return hazard;
    }
    chargeEnd(enemy) {
      const direction = enemy.dashDirection ?? { x: 0, y: 1 };
      let destination = { x: enemy.x, y: enemy.y };
      for (let step = 1; step <= 28; step++) {
        const candidate = { x: enemy.x + direction.x * step * 8, y: enemy.y + direction.y * step * 8 };
        if (!this.walkable(candidate, enemy.radius)) break;
        destination = candidate;
      }
      return destination;
    }
    updateHaunts(dt) {
      for (const enemy of this.enemies) {
        enemy.guardBroken = Math.max(0, (enemy.guardBroken ?? 0) - dt);
        if ((enemy.haunt ?? 0) > 0 && enemy.hp > 0) {
          const damage = Math.min(dt, enemy.haunt) * (enemy.hauntDps ?? 0);
          enemy.haunt = Math.max(0, enemy.haunt - dt);
          this.hitEnemy(enemy, damage, void 0, true);
          if (this.terminal()) return;
        }
      }
    }
    updateHazards(dt) {
      for (const hazard of this.hazards) {
        if (!hazard.fired) {
          hazard.wait -= dt;
          if (hazard.wait <= 0) {
            hazard.fired = true;
            for (const actor of [this.player, ...this.buddy ? [this.buddy] : []]) {
              if (hazard.kind === "circle" ? distance(actor, hazard) < hazard.radius + actor.radius : segmentDistance(actor, hazard, hazard.end) < hazard.radius + actor.radius) this.hurtActor(actor, 2);
            }
            this.effect(hazard.kind === "circle" ? hazard : hazard.end, "#ff937d", hazard.radius + 30, "ring");
            if (hazard.payload === "fire") this.addHazard(hazard, "circle", hazard.radius * 0.85, 0.8);
            else if (hazard.payload) {
              const direction = Math.atan2(this.player.y - hazard.y, this.player.x - hazard.x);
              const count = hazard.payload === "ghost" ? 3 : 5;
              for (let i = 0; i < count; i++) {
                const angle = direction + (i - (count - 1) / 2) * 0.28;
                const speed = (hazard.payload === "ghost" ? 130 : 210) * this.challenge.bossProjectileSpeed;
                this.shots.push({
                  id: ++this.serial,
                  x: hazard.x,
                  y: hazard.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: hazard.payload === "ghost" ? 3.2 : 2.5,
                  damage: 1,
                  ally: false,
                  color: "#ff94ac",
                  splash: 0,
                  radius: 8,
                  kind: hazard.payload === "ghost" ? "ghost" : "water",
                  age: 0
                });
              }
            }
          }
        } else hazard.life -= dt;
      }
      this.hazards = this.hazards.filter((hazard) => !hazard.fired || hazard.life > 0);
    }
    actorById(id) {
      return this.player.id === id ? this.player : this.buddy && this.buddy.id === id ? this.buddy : void 0;
    }
    beginReturn(shot) {
      shot.returning = true;
      shot.hits = [];
      const actor = this.actorById(shot.source);
      shot.pierce = actor && this.has(actor, "water-pierce") ? 5 : 2;
    }
    updateShots(dt) {
      for (const shot of this.shots) {
        const before = { x: shot.x, y: shot.y };
        shot.age = (shot.age ?? 0) + dt;
        shot.life -= dt;
        if (shot.kind === "metal") {
          const origin = shot.from;
          const front = Math.hypot(shot.vx, shot.vy) * shot.age;
          const previous = Math.max(0, front - Math.hypot(shot.vx, shot.vy) * dt);
          const aim = Math.atan2(shot.vy, shot.vx);
          shot.x = origin.x + Math.cos(aim) * front;
          shot.y = origin.y + Math.sin(aim) * front;
          for (const enemy of this.enemies) {
            if (enemy.hp <= 0 || shot.hits.includes(enemy.id)) continue;
            const gap = distance(origin, enemy);
            const angle = Math.atan2(enemy.y - origin.y, enemy.x - origin.x) - aim;
            const spread = (shot.spread ?? 0.58) + Math.asin(Math.min(1, enemy.radius / Math.max(1, gap)));
            if (gap > front + enemy.radius || gap < previous - enemy.radius || Math.cos(angle) < Math.cos(spread) || this.blocked(origin, enemy)) continue;
            shot.hits.push(enemy.id);
            this.hitEnemy(enemy, shot.damage, origin);
            if (enemy.hp > 0 && enemy.kind !== "boss") {
              const push = unit(enemy.x - origin.x, enemy.y - origin.y);
              this.move(enemy, push.x * 32, push.y * 32, enemy.radius);
            }
          }
          continue;
        }
        if (shot.kind === "fire") {
          const progress = Math.min(1, shot.age / shot.duration);
          shot.x = shot.from.x + (shot.to.x - shot.from.x) * progress;
          shot.y = shot.from.y + (shot.to.y - shot.from.y) * progress;
          if (progress >= 1) {
            for (const enemy of this.enemies) {
              if (enemy.hp > 0 && distance(shot, enemy) < shot.splash + enemy.radius && !this.blocked(shot, enemy)) this.hitEnemy(enemy, shot.damage, shot, true);
            }
            this.makeFlame(shot, shot.splash, shot.damage * 0.14, shot.source);
            this.effect(shot, shot.color, shot.splash, "fire");
            shot.life = 0;
          }
          continue;
        }
        if (shot.kind === "ghost") {
          const targets = shot.ally ? this.enemies : [this.player, ...this.buddy ? [this.buddy] : []];
          const target = targets.find((actor) => actor.id === shot.target && actor.hp > 0) ?? targets.filter((actor) => actor.hp > 0 && distance(shot, actor) < 500).sort((a, b) => distance(shot, a) - distance(shot, b))[0];
          if (target) {
            shot.target = target.id;
            const aim = unit(target.x - shot.x, target.y - shot.y);
            const turn = Math.min(1, dt * 7);
            const speed = shot.ally ? 220 : 130 * this.challenge.bossProjectileSpeed;
            const heading = unit(shot.vx * (1 - turn) + aim.x * speed * turn, shot.vy * (1 - turn) + aim.y * speed * turn);
            shot.vx = heading.x * speed;
            shot.vy = heading.y * speed;
          }
        }
        if (shot.kind === "water" && shot.boomerang) {
          if (!shot.returning && shot.age >= (shot.returnAt ?? 0.65)) this.beginReturn(shot);
          if (shot.returning) {
            const owner = this.actorById(shot.source);
            if (owner) {
              const heading = unit(owner.x - shot.x, owner.y - shot.y);
              shot.vx = heading.x * 630;
              shot.vy = heading.y * 630;
              if (distance(owner, shot) < 22) {
                shot.life = 0;
                continue;
              }
            }
          }
        }
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        if (shot.kind !== "ghost" && this.blocked(before, shot, shot.radius)) {
          shot.life = 0;
          continue;
        }
        if (shot.ally) {
          for (const enemy of this.enemies) {
            if (enemy.hp <= 0 || shot.hits?.includes(enemy.id) || segmentDistance(enemy, before, shot) > enemy.radius + shot.radius) continue;
            this.hitEnemy(enemy, shot.damage, before, shot.kind === "ghost");
            (shot.hits ?? (shot.hits = [])).push(enemy.id);
            if (shot.kind === "ghost" && enemy.hp > 0) {
              const owner = this.actorById(shot.source);
              const stronger = owner && this.has(owner, "ghost-haunt");
              enemy.haunt = Math.max(enemy.haunt ?? 0, shot.haunt ?? 3);
              enemy.hauntDps = Math.max(enemy.hauntDps ?? 0, shot.damage * (stronger ? 0.46 : 0.32));
              enemy.hauntSlow = stronger ? 0.5 : 0.68;
              this.effect(enemy, shot.color, 26, "haunt");
            }
            if (shot.splash) {
              for (const other of this.enemies.slice()) {
                if (other !== enemy && other.hp > 0 && distance(other, enemy) < shot.splash && !this.blocked(enemy, other)) this.hitEnemy(other, shot.damage * 0.55, enemy);
              }
              this.effect(enemy, shot.color, shot.splash);
            }
            if (shot.kind === "water") {
              shot.pierce = (shot.pierce ?? 2) - 1;
              if (shot.pierce > 0) continue;
              if (shot.boomerang && !shot.returning) {
                this.beginReturn(shot);
                break;
              }
            }
            shot.life = 0;
            break;
          }
        } else {
          for (const actor of [this.player, ...this.buddy ? [this.buddy] : []]) {
            if (actor.hp > 0 && segmentDistance(actor, before, shot) < actor.radius + shot.radius) {
              this.hurtActor(actor, shot.damage);
              shot.life = 0;
              break;
            }
          }
        }
      }
      this.shots = this.shots.filter((shot) => shot.life > 0 && shot.x > -20 && shot.x < WIDTH + 20 && shot.y > -20 && shot.y < HEIGHT + 20);
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    }
    makeFlame(point, radius, damage, source) {
      const owner = this.actorById(source);
      const duration = owner && this.has(owner, "fire-long") ? 4.8 : 2.8;
      const nearby = this.flames.find((flame) => flame.source === source && distance(point, flame) < Math.min(radius, flame.radius) * 0.6);
      if (nearby) {
        nearby.life = duration;
        nearby.duration = duration;
        nearby.radius = Math.max(nearby.radius, radius);
        nearby.damage = Math.max(nearby.damage, damage);
        return;
      }
      this.flames.push({ id: ++this.serial, x: point.x, y: point.y, radius, life: duration, duration, tick: 0.4, damage, source });
      if (this.flames.length > 14) this.flames.shift();
    }
    updateFlames(dt) {
      for (const flame of this.flames) {
        flame.life -= dt;
        flame.tick -= dt;
        if (flame.life <= 0 || flame.tick > 0) continue;
        flame.tick += 0.4;
        for (const enemy of this.enemies) {
          if (enemy.hp > 0 && distance(flame, enemy) < flame.radius + enemy.radius && !this.blocked(flame, enemy)) this.hitEnemy(enemy, flame.damage, flame, true);
        }
        if (this.terminal()) return;
      }
      this.flames = this.flames.filter((flame) => flame.life > 0);
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    }
    hitEnemy(enemy, damage, source, bypassShield = false) {
      if (enemy.hp <= 0) return;
      if (enemy.kind === "guard" && (enemy.guardBroken ?? 0) <= 0 && source && !bypassShield) {
        const toSource = Math.atan2(source.y - enemy.y, source.x - enemy.x);
        if (Math.cos(toSource - (enemy.facing ?? 0)) > 0.25) {
          damage *= 0.2;
          this.effect(enemy, "#b7edff", 32, "block");
          this.emit("block");
        }
      }
      enemy.hp = Math.max(0, enemy.hp - damage);
      if (damage >= 0.5) enemy.hurt = 0.12;
      this.hits++;
      if (enemy.hp > 0) return;
      this.effect(enemy, "#ffe49a", 44);
      if (enemy.kind === "boss") {
        this.phase = "won";
        this.hazards = [];
        this.emit("won");
        return;
      }
      if (enemy.kind === "dummy") return;
      this.defeated++;
      this.pickups.push({ id: ++this.serial, x: enemy.x, y: enemy.y, life: 28, kind: this.random() < this.challenge.healthDropChance ? "health" : "energy" });
    }
    hurtActor(actor, damage) {
      if (actor.hp <= 0 || actor.hurt > 0 || actor.shield > 0 || this.phase !== "playing") return;
      actor.hp = Math.max(0, actor.hp - damage);
      actor.hurt = this.challenge.hurtGrace;
      this.effect(actor, "#ff937d", 42);
      if (actor !== this.player) return;
      this.emit("hurt");
      if (actor.hp > 0) return;
      if (this.buddy && this.buddy.hp > 0 && !this.rescueUsed) {
        this.rescueUsed = true;
        actor.hp = Math.ceil(actor.maxHp * 0.5);
        actor.shield = 4;
        this.announce("Buddy rescue! Back in the battle.");
        this.effect(actor, "#a4f4d0", 100, "heal");
        this.emit("rescue");
      } else {
        this.phase = "lost";
        this.emit("lost");
      }
    }
    collect(dt) {
      for (const pickup of this.pickups) {
        pickup.life -= dt;
        if (pickup.kind === "health" && this.player.hp === this.player.maxHp) continue;
        const gap = distance(pickup, this.player);
        if (gap < 90) {
          const direction = unit(this.player.x - pickup.x, this.player.y - pickup.y);
          pickup.x += direction.x * 180 * dt;
          pickup.y += direction.y * 180 * dt;
        }
        if (distance(pickup, this.player) < 27) {
          if (pickup.kind === "health") {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
            this.effect(this.player, "#a4f4d0", 60, "heal");
          } else this.player.energy = Math.min(100, this.player.energy + 24);
          pickup.life = 0;
          this.emit("pickup");
        }
      }
      this.pickups = this.pickups.filter((pickup) => pickup.life > 0).slice(-28);
    }
  };

  // pokemon_fight/ts/artwork.ts
  var Artwork = class {
    constructor() {
      this.pictures = /* @__PURE__ */ new Map();
      this.failed = [];
      this.loaded = 0;
    }
    async load(onProgress) {
      for (const id of Object.keys(ART)) {
        try {
          this.pictures.set(id, await this.read(id));
        } catch {
          this.failed.push(id);
        }
        this.loaded++;
        onProgress();
      }
    }
    read(id) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        const timeout = window.setTimeout(() => finish(new Error("Card image timed out")), 18e3);
        const finish = (error, result) => {
          clearTimeout(timeout);
          image.onload = null;
          image.onerror = null;
          image.src = "";
          if (error) reject(error);
          else resolve(result);
        };
        image.onload = () => {
          try {
            const spec = ART[id];
            const upright = document.createElement("canvas");
            upright.width = 1024;
            upright.height = 1365;
            const context = upright.getContext("2d");
            context.translate(512, 682.5);
            if (spec.turn) {
              context.rotate(-Math.PI / 2);
              context.drawImage(image, -682.5, -512, 1365, 1024);
            } else context.drawImage(image, -512, -682.5, 1024, 1365);
            const cropped = document.createElement("canvas");
            cropped.width = 384;
            cropped.height = 256;
            const [x, y, w, h] = spec.crop;
            cropped.getContext("2d").drawImage(upright, x * 1024, y * 1365, w * 1024, h * 1365, 0, 0, 384, 256);
            upright.width = upright.height = 1;
            finish(void 0, cropped);
          } catch (error) {
            finish(error instanceof Error ? error : new Error("Card art unavailable"));
          }
        };
        image.onerror = () => finish(new Error("Card art unavailable"));
        image.src = "assets/" + ART[id].file;
      });
    }
    paint(context, id, x, y, width, height) {
      const picture = this.pictures.get(id);
      if (picture) context.drawImage(picture, x, y, width, height);
      else {
        const spec = HEROES.find((item) => item.id === id);
        context.fillStyle = spec?.color ?? "#c2d7b2";
        context.fillRect(x, y, width, height);
        context.fillStyle = "#182840";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold " + Math.floor(height * 0.34) + "px system-ui";
        context.fillText(id.slice(0, 2).toUpperCase(), x + width / 2, y + height / 2);
      }
    }
  };

  // pokemon_fight/ts/view.ts
  function arenaView(width, height, player, target, closeup) {
    const fit = Math.min(width / WIDTH, height / HEIGHT);
    const scale = closeup ? Math.max(fit, Math.min(0.95, width / 400, height / 260)) : fit;
    const visibleWidth = width / scale;
    const visibleHeight = height / scale;
    const padding = closeup ? 80 : 0;
    let focusX = player.x + (target ? clamp((target.x - player.x) * 0.3, -85, 85) : 0);
    let focusY = player.y + (target ? clamp((target.y - player.y) * 0.3, -85, 85) : 0);
    if (closeup && target) {
      const left = Math.min(player.x, target.x) - 80;
      const right = Math.max(player.x, target.x) + 80;
      const top = Math.min(player.y - 110, target.y - 130);
      const bottom = Math.max(player.y, target.y) + 26;
      if (right - left + 16 <= visibleWidth) focusX = clamp(focusX, right + 8 - visibleWidth / 2, left - 8 + visibleWidth / 2);
      if (bottom - top + 16 <= visibleHeight) focusY = clamp(focusY, bottom + 8 - visibleHeight / 2, top - 8 + visibleHeight / 2);
    }
    return {
      scale,
      width: visibleWidth,
      height: visibleHeight,
      closeup,
      x: visibleWidth >= WIDTH + padding * 2 ? WIDTH / 2 : clamp(focusX, visibleWidth / 2 - padding, WIDTH + padding - visibleWidth / 2),
      y: visibleHeight >= HEIGHT + padding * 2 ? HEIGHT / 2 : clamp(focusY, visibleHeight / 2 - padding, HEIGHT + padding - visibleHeight / 2)
    };
  }

  // pokemon_fight/ts/renderer.ts
  function rounded(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }
  function circle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  }
  function star(ctx, x, y, radius, points = 4) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / points;
      const r = i % 2 ? radius * 0.38 : radius;
      if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
  }
  var ArenaRenderer = class {
    constructor(canvas, art) {
      this.canvas = canvas;
      this.art = art;
      this.cssWidth = 1e3;
      this.cssHeight = 620;
      this.dpr = 1;
      this.previousTime = 0;
      this.portraitScale = 1;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.ctx = canvas.getContext("2d");
    }
    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      this.cssWidth = Math.max(1, bounds.width);
      this.cssHeight = Math.max(1, bounds.height);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.cssWidth * this.dpr);
      this.canvas.height = Math.round(this.cssHeight * this.dpr);
      this.camera = void 0;
    }
    draw(game, time) {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      ctx.fillStyle = game.level.colors.edge;
      ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
      const closeup = window.matchMedia("(pointer: coarse)").matches || this.cssWidth < 700;
      const target = game.enemies.find((enemy) => enemy.id === game.targetId && enemy.hp > 0);
      const view = arenaView(this.cssWidth, this.cssHeight, game.player, target, closeup);
      if (view.closeup && this.camera && !this.reducedMotion) {
        const blend = 1 - Math.exp(-Math.min(0.1, Math.max(0, time - this.previousTime)) * 10);
        view.x = this.camera.x + (view.x - this.camera.x) * blend;
        view.y = this.camera.y + (view.y - this.camera.y) * blend;
      }
      this.previousTime = time;
      this.camera = { x: view.x, y: view.y };
      this.portraitScale = view.closeup ? 1.2 : 1;
      ctx.save();
      ctx.translate(this.cssWidth / 2, this.cssHeight / 2);
      ctx.scale(view.scale, view.scale);
      ctx.translate(-view.x, -view.y);
      this.field(time, game);
      if (game.stage !== "PRACTICE") this.goals(game, time);
      for (const flame of game.flames) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, flame.life) * 0.8;
        ctx.fillStyle = "#ffab4e32";
        ctx.strokeStyle = "#b8f2d2";
        ctx.lineWidth = 2;
        circle(ctx, flame.x, flame.y, flame.radius);
        ctx.fill();
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#b8f2d2";
        star(ctx, flame.x, flame.y, 11);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3 + flame.id;
          const radius = flame.radius * (i % 2 ? 0.56 : 0.2);
          this.flame(flame.x + Math.cos(angle) * radius, flame.y + Math.sin(angle) * radius, 9 + (this.reducedMotion ? 0 : Math.sin(time * 8 + i) * 2), "#ffad55");
        }
        ctx.restore();
      }
      for (const enemy of game.enemies) {
        if ((enemy.windup ?? 0) <= 0) continue;
        const end = game.chargeEnd(enemy);
        const angle = Math.atan2(end.y - enemy.y, end.x - enemy.x);
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(angle);
        const length = Math.hypot(end.x - enemy.x, end.y - enemy.y);
        ctx.fillStyle = "#ffad4a33";
        ctx.strokeStyle = "#ffe0a4";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        rounded(ctx, 0, -20, Math.max(12, length), 40, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      for (const hazard of game.hazards) {
        const progress = 1 - Math.max(0, hazard.wait) / hazard.duration;
        ctx.save();
        ctx.fillStyle = hazard.fired ? "#fff0bd99" : "#ff675e44";
        ctx.strokeStyle = hazard.fired ? "#fff1b4" : "#ffe0c6";
        ctx.lineWidth = hazard.fired ? 6 : 3;
        ctx.setLineDash(hazard.fired ? [] : [11, 7]);
        if (hazard.kind === "circle") {
          circle(ctx, hazard.x, hazard.y, hazard.radius);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          circle(ctx, hazard.x, hazard.y, hazard.radius * progress);
          ctx.stroke();
        } else {
          const angle = Math.atan2(hazard.end.y - hazard.y, hazard.end.x - hazard.x);
          const length = Math.hypot(hazard.end.x - hazard.x, hazard.end.y - hazard.y);
          ctx.translate(hazard.x, hazard.y);
          ctx.rotate(angle);
          rounded(ctx, 0, -hazard.radius, length, hazard.radius * 2, 10);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 0.65;
          ctx.fillStyle = "#ffb896";
          ctx.fillRect(0, -hazard.radius + 5, length * progress, 7);
        }
        ctx.restore();
      }
      for (const item of game.pickups) {
        ctx.save();
        ctx.translate(item.x, item.y + (this.reducedMotion ? 0 : Math.sin(time * 3 + item.id) * 3));
        ctx.shadowColor = item.kind === "health" ? "#b3ffce" : "#ffe49a";
        ctx.shadowBlur = 12;
        ctx.fillStyle = item.kind === "health" ? "#c4ffcb" : "#ffe49a";
        if (item.kind === "health") {
          rounded(ctx, -7, -13, 14, 26, 3);
          ctx.fill();
          rounded(ctx, -13, -7, 26, 14, 3);
          ctx.fill();
        } else {
          star(ctx, 0, 0, 14);
          ctx.fill();
        }
        ctx.restore();
      }
      if (game.stage === "PRACTICE") {
        ctx.save();
        ctx.strokeStyle = "#fff2b2";
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 7]);
        circle(ctx, 365, 485, 40);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#ffe49a";
        star(ctx, 365, 485, 20);
        ctx.fill();
        ctx.restore();
      }
      const actors = [game.player, ...game.buddy ? [game.buddy] : [], ...game.enemies];
      actors.sort((a, b) => a.y - b.y);
      for (const actor of actors) {
        this.actor(actor, actor === game.player ? "player" : actor === game.buddy ? "buddy" : "enemy", time, actor.id === game.targetId);
      }
      for (const shot of game.shots) {
        ctx.save();
        if (shot.kind === "metal") {
          const radius = Math.max(2, Math.hypot(shot.x - shot.from.x, shot.y - shot.from.y));
          const angle = Math.atan2(shot.vy, shot.vx);
          const spread = shot.spread ?? 0.58;
          ctx.translate(shot.from.x, shot.from.y);
          ctx.rotate(angle);
          ctx.strokeStyle = "#ffe6a3";
          ctx.fillStyle = "#ffd56a60";
          ctx.lineWidth = 5;
          ctx.shadowColor = "#ffd56a";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, radius, -spread, spread);
          ctx.arc(0, 0, Math.max(1, radius - 24), spread, -spread, true);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, radius, -spread, spread);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        if (shot.kind === "fire") {
          const progress = Math.min(1, (shot.age ?? 0) / shot.duration);
          const lift = Math.sin(progress * Math.PI) * 85;
          ctx.strokeStyle = "#b8f2d299";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 7]);
          circle(ctx, shot.to.x, shot.to.y, shot.splash * 0.65);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#132c3144";
          ctx.beginPath();
          ctx.ellipse(shot.x, shot.y + 2, 13, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = "#ff9c50";
          ctx.shadowBlur = 18;
          this.flame(shot.x, shot.y - lift, 19, "#ff934d");
          ctx.restore();
          continue;
        }
        if (shot.kind === "ghost") {
          for (let i = 2; i > 0; i--) {
            ctx.globalAlpha = 0.25 / i;
            circle(ctx, shot.x - shot.vx * i * 0.065, shot.y - shot.vy * i * 0.065 + Math.sin((shot.age ?? 0) * 14 + i) * 5, 9 - i * 2);
            ctx.fillStyle = shot.ally ? "#c6a0ff" : "#ff9abb";
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.shadowColor = "#c6a0ff";
          ctx.shadowBlur = 15;
          this.flame(shot.x, shot.y, 15, shot.ally ? "#bda0ff" : "#ff8faf");
          ctx.fillStyle = "#273044";
          circle(ctx, shot.x - 3, shot.y, 1.7);
          ctx.fill();
          circle(ctx, shot.x + 3, shot.y, 1.7);
          ctx.fill();
          ctx.restore();
          continue;
        }
        if (shot.kind === "water") {
          ctx.strokeStyle = "#71dbff55";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(shot.x - shot.vx * 0.03, shot.y - shot.vy * 0.03);
          ctx.lineTo(shot.x, shot.y);
          ctx.stroke();
          ctx.translate(shot.x, shot.y);
          ctx.rotate((this.reducedMotion ? 0 : time * 15) * (shot.returning ? -1 : 1));
          ctx.fillStyle = shot.ally ? "#75dcff" : "#ff8c9f";
          ctx.strokeStyle = shot.ally ? "#e5ffff" : "#ffe5d6";
          ctx.lineWidth = 2;
          star(ctx, 0, 0, 13);
          ctx.fill();
          ctx.stroke();
          circle(ctx, 0, 0, 3);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        ctx.lineWidth = shot.radius * 1.3;
        ctx.lineCap = "round";
        ctx.strokeStyle = shot.color + "88";
        ctx.beginPath();
        ctx.moveTo(shot.x - shot.vx * 0.035, shot.y - shot.vy * 0.035);
        ctx.lineTo(shot.x, shot.y);
        ctx.stroke();
        ctx.fillStyle = shot.color;
        ctx.shadowColor = shot.color;
        ctx.shadowBlur = 10;
        circle(ctx, shot.x, shot.y, shot.radius);
        ctx.fill();
        ctx.strokeStyle = "#fff9df";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
      for (const effect of game.effects) {
        const progress = 1 - effect.life / effect.duration;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.8;
        ctx.strokeStyle = effect.color;
        ctx.fillStyle = effect.color;
        ctx.lineWidth = effect.kind === "ring" ? 9 * (1 - progress) + 2 : 3;
        if (effect.kind === "fire") {
          for (let i = 0; i < 10; i++) {
            const angle = i * Math.PI / 5;
            this.flame(effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 16 * (1 - progress) + 3, "#ffac55");
          }
          ctx.restore();
          continue;
        }
        if (effect.kind === "haunt") {
          for (let i = 0; i < 3; i++) {
            const angle = i * Math.PI * 2 / 3 + progress * 3;
            this.flame(effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 12, "#c6a0ff");
          }
          ctx.restore();
          continue;
        }
        if (effect.kind === "block") {
          ctx.translate(effect.x, effect.y - 22);
          ctx.rotate(-0.2 + progress * 0.3);
          ctx.beginPath();
          ctx.moveTo(-15, -17);
          ctx.lineTo(15, -17);
          ctx.lineTo(15, 4);
          ctx.lineTo(0, 19);
          ctx.lineTo(-15, 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          continue;
        }
        circle(ctx, effect.x, effect.y, effect.radius * (0.25 + progress * 0.75));
        ctx.stroke();
        if (!this.reducedMotion) {
          for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4 + progress;
            star(ctx, effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 7 * (1 - progress));
            ctx.fill();
          }
        }
        ctx.restore();
      }
      if (game.phase === "won") {
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = ["#ffe49a", "#a4f4d0", "#c6a0ff", "#ff9c78"][i % 4];
          star(ctx, 40 + i * 33 % 920, 30 + (i * 83 + (this.reducedMotion ? 0 : time * 30)) % 550, 6 + i % 5);
          ctx.fill();
        }
      }
      ctx.restore();
      if (view.closeup) {
        this.indicators(game, view);
        this.goalIndicator(game, view);
      }
    }
    flame(x, y, size, color) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 0.25, -size * 0.2, size, -size * 0.1, size * 0.65, size * 0.55);
      ctx.bezierCurveTo(size * 0.3, size, -size * 0.8, size * 0.8, -size * 0.65, size * 0.1);
      ctx.bezierCurveTo(-size * 0.5, -size * 0.4, -size * 0.1, -size * 0.3, 0, -size);
      ctx.fill();
      ctx.fillStyle = "#fff3d1";
      circle(ctx, 0, size * 0.25, size * 0.3);
      ctx.fill();
      ctx.restore();
    }
    indicators(game, view) {
      const ctx = this.ctx;
      const targets = [
        game.boss,
        game.enemies.find((enemy) => enemy.id === game.targetId),
        game.buddy,
        ...game.enemies.slice().sort((a, b) => Math.hypot(a.x - game.player.x, a.y - game.player.y) - Math.hypot(b.x - game.player.x, b.y - game.player.y))
      ];
      const seen = /* @__PURE__ */ new Set();
      let count = 0;
      for (const target of targets) {
        if (!target || seen.has(target.id) || target.hp <= 0) continue;
        seen.add(target.id);
        const x = this.cssWidth / 2 + (target.x - view.x) * view.scale;
        const y = this.cssHeight / 2 + (target.y - view.y) * view.scale;
        const baseWidth = target === game.boss ? 130 : target === game.buddy ? target.art === "steelix" ? 108 : 92 : 67;
        const portraitHalfWidth = baseWidth * this.portraitScale * view.scale / 2;
        const portraitHeight = (baseWidth * this.portraitScale * 0.66 + 16) * view.scale;
        if (x >= portraitHalfWidth && x <= this.cssWidth - portraitHalfWidth && y - portraitHeight >= 0 && y <= this.cssHeight - 28) continue;
        if (count++ >= 3) break;
        const px = clamp(x, 36, this.cssWidth - 36);
        const py = clamp(y - portraitHeight < 0 ? 32 : y, 32, Math.max(32, this.cssHeight - 35));
        ctx.save();
        rounded(ctx, px - 23, py - 17, 46, 34, 7);
        ctx.clip();
        this.art.paint(ctx, target.art, px - 23, py - 17, 46, 34);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = target === game.buddy ? "#b8f2d2" : "#ffe49a";
        ctx.lineWidth = 2;
        rounded(ctx, px - 23, py - 17, 46, 34, 7);
        ctx.stroke();
        ctx.translate(px, py);
        ctx.rotate(Math.atan2(y - py, x - px));
        ctx.fillStyle = target === game.buddy ? "#b8f2d2" : "#ffe49a";
        ctx.beginPath();
        ctx.moveTo(31, 0);
        ctx.lineTo(24, -5);
        ctx.lineTo(24, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    goals(game, time) {
      const ctx = this.ctx;
      const kind = game.level.goal.kind;
      for (const node of game.goalNodes) {
        if (node.done && kind === "collect") continue;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.strokeStyle = node.done ? "#b8f2d2" : game.level.colors.accent;
        ctx.fillStyle = node.done ? "#b8f2d222" : "#132c3144";
        ctx.lineWidth = 2;
        circle(ctx, 0, 0, 36);
        ctx.fill();
        ctx.stroke();
        if (kind === "rescue") {
          ctx.save();
          rounded(ctx, -36, -60, 72, 48, 10);
          ctx.clip();
          this.art.paint(ctx, node.art, -36, -60, 72, 48);
          ctx.restore();
          ctx.strokeStyle = "#b8f2d2";
          rounded(ctx, -36, -60, 72, 48, 10);
          ctx.stroke();
          ctx.fillStyle = "#b8f2d2";
          ctx.font = "bold 23px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(node.done ? "\u2713" : "\u2661", 0, -69);
        } else if (kind === "collect") {
          ctx.fillStyle = "#9beaff";
          ctx.strokeStyle = "#e7ffff";
          ctx.beginPath();
          ctx.moveTo(0, -29);
          ctx.lineTo(18, -6);
          ctx.lineTo(0, 12);
          ctx.lineTo(-18, -6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -29);
          ctx.lineTo(0, 12);
          ctx.stroke();
        } else if (kind === "lantern") {
          ctx.fillStyle = "#d8b98e";
          rounded(ctx, -17, -45, 34, 43, 6);
          ctx.fill();
          ctx.fillStyle = "#442f41";
          rounded(ctx, -12, -38, 24, 31, 3);
          ctx.fill();
          if (node.done) this.flame(0, -23, 15, "#ffd56a");
          else {
            ctx.fillStyle = "#c1b7a2";
            star(ctx, 0, -23, 9);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = "#cee9e6";
          rounded(ctx, -14, -43, 28, 40, 5);
          ctx.fill();
          ctx.fillStyle = node.done ? "#fff1a6" : "#78b7c8";
          star(ctx, 0, -49, 21, 5);
          ctx.fill();
          if (node.done) {
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = "#fff1a6";
            ctx.fillRect(-25, -125, 50, 125);
            ctx.globalAlpha = 1;
          }
        }
        if (node.progress > 0 && !node.done) {
          ctx.strokeStyle = "#fff4b0";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + node.progress * Math.PI * 2);
          ctx.stroke();
        } else if (!node.done && !this.reducedMotion) {
          ctx.globalAlpha = 0.3 + Math.sin(time * 3) * 0.12;
          ctx.strokeStyle = game.level.colors.accent;
          circle(ctx, 0, 0, 43);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    goalIndicator(game, view) {
      if (game.stage === "PRACTICE") return;
      const target = game.goalNodes.filter((node) => !node.done).sort((a, b) => Math.hypot(a.x - game.player.x, a.y - game.player.y) - Math.hypot(b.x - game.player.x, b.y - game.player.y))[0];
      if (!target) return;
      const x = this.cssWidth / 2 + (target.x - view.x) * view.scale;
      const y = this.cssHeight / 2 + (target.y - view.y) * view.scale;
      if (x >= 35 && x <= this.cssWidth - 35 && y >= 60 && y <= this.cssHeight - 35) return;
      const px = clamp(x, 36, this.cssWidth - 36), py = clamp(y, 60, this.cssHeight - 35);
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = "#193b40";
      ctx.strokeStyle = "#b8f2d2";
      ctx.lineWidth = 2;
      circle(ctx, px, py, 19);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#b8f2d2";
      ctx.font = "bold 24px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(game.level.goal.kind === "rescue" ? "\u2661" : game.level.goal.kind === "collect" ? "\u25C6" : "\u2736", px, py);
      ctx.translate(px, py);
      ctx.rotate(Math.atan2(y - py, x - px));
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(23, -5);
      ctx.lineTo(23, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    scenery(game, time) {
      const ctx = this.ctx;
      ctx.save();
      if (game.level.theme === "woods") {
        ctx.fillStyle = "#bddbff0a";
        ctx.beginPath();
        ctx.moveTo(380, 25);
        ctx.lineTo(600, 25);
        ctx.lineTo(740, 590);
        ctx.lineTo(200, 590);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ead8ff";
        for (let i = 0; i < 12; i++) {
          circle(ctx, 70 + i * 77 % 880, 70 + (i * 113 + (this.reducedMotion ? 0 : time * 6)) % 470, 2);
          ctx.fill();
        }
      } else if (game.level.theme === "quarry") {
        ctx.strokeStyle = "#353b3e44";
        ctx.lineWidth = 3;
        for (let i = 0; i < 7; i++) {
          const x = 100 + i * 125, y = 100 + i * 67 % 430;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 15, y + 20);
          ctx.lineTo(x + 4, y + 38);
          ctx.stroke();
        }
      } else if (game.level.theme === "ember") {
        ctx.strokeStyle = "#ffb17199";
        ctx.lineWidth = 5;
        rounded(ctx, 16, 16, WIDTH - 32, HEIGHT - 32, 30);
        ctx.stroke();
        for (const [x, y] of [[55, 60], [945, 60], [55, 560], [945, 560]]) this.flame(x, y, 18, "#ffc484");
      } else if (game.level.theme === "sky") {
        ctx.fillStyle = "#efffff22";
        for (let i = 0; i < 9; i++) {
          const x = 30 + i * 119 % 940, y = i % 2 ? 27 : 590;
          ctx.beginPath();
          ctx.ellipse(x, y, 55, 21, 0, 0, Math.PI * 2);
          ctx.fill();
          circle(ctx, x - 20, y - 14, 25);
          ctx.fill();
          circle(ctx, x + 12, y - 17, 20);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    field(time, game) {
      const ctx = this.ctx;
      const palette = game.level.colors;
      ctx.fillStyle = palette.edge;
      rounded(ctx, 8, 8, WIDTH - 16, HEIGHT - 16, 35);
      ctx.fill();
      ctx.fillStyle = palette.ground;
      rounded(ctx, 22, 22, WIDTH - 44, HEIGHT - 44, 26);
      ctx.fill();
      for (let row = 0; row < 10; row++) for (let col = 0; col < 16; col++) {
        ctx.fillStyle = (row + col) % 2 ? "#ffffff04" : "#102c2408";
        ctx.fillRect(24 + col * 60, 25 + row * 57, 60, 57);
      }
      ctx.strokeStyle = palette.line + "44";
      ctx.lineWidth = 2;
      rounded(ctx, 55, 55, WIDTH - 110, HEIGHT - 110, 24);
      ctx.stroke();
      circle(ctx, 500, 310, 115);
      ctx.stroke();
      circle(ctx, 500, 310, 94);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(386, 310);
      ctx.lineTo(614, 310);
      ctx.stroke();
      ctx.fillStyle = palette.ground;
      circle(ctx, 500, 310, 27);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d9e7a52b";
      star(ctx, 500, 310, 15);
      ctx.fill();
      for (const [x, y] of [[65, 38], [920, 36], [62, 570], [930, 572]]) {
        ctx.fillStyle = "#244b3d";
        circle(ctx, x, y, 28);
        ctx.fill();
        ctx.fillStyle = palette.leaf;
        circle(ctx, x - 8, y - 8, 19);
        ctx.fill();
        circle(ctx, x + 11, y - 1, 16);
        ctx.fill();
        ctx.fillStyle = "#ffd479";
        circle(ctx, x + 3, y - 12, 3);
        ctx.fill();
      }
      for (const rect of game.obstacles) {
        ctx.fillStyle = "#142c3144";
        rounded(ctx, rect.x + 6, rect.y + 9, rect.w, rect.h, 13);
        ctx.fill();
        ctx.fillStyle = "#78988a";
        rounded(ctx, rect.x, rect.y - 8, rect.w, rect.h + 8, 12);
        ctx.fill();
        ctx.fillStyle = palette.stone;
        rounded(ctx, rect.x + 3, rect.y - 9, rect.w - 6, rect.h - 5, 10);
        ctx.fill();
        ctx.strokeStyle = "#dbe1b2";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#8ca586";
        for (let i = 0; i < 3; i++) {
          rounded(ctx, rect.x + 12 + i * 30, rect.y + 3, 25, 22, 5);
          ctx.fill();
        }
        ctx.fillStyle = "#c2db9c";
        circle(ctx, rect.x + 12, rect.y + rect.h - 3, 9);
        ctx.fill();
        if (game.level.theme === "woods") {
          ctx.fillStyle = "#243842";
          rounded(ctx, rect.x + rect.w * 0.42, rect.y - 8, rect.w * 0.16, rect.h, 5);
          ctx.fill();
          ctx.fillStyle = palette.leaf;
          circle(ctx, rect.x + rect.w * 0.32, rect.y + 10, rect.w * 0.38);
          ctx.fill();
          circle(ctx, rect.x + rect.w * 0.65, rect.y + 2, rect.w * 0.4);
          ctx.fill();
        } else if (game.level.theme === "quarry") {
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i % 2 ? "#b4e8e5" : "#7faec0";
            ctx.beginPath();
            ctx.moveTo(rect.x + 15 + i * 22, rect.y + rect.h - 10);
            ctx.lineTo(rect.x + 27 + i * 22, rect.y - 25 - i * 5);
            ctx.lineTo(rect.x + 43 + i * 22, rect.y + rect.h - 10);
            ctx.closePath();
            ctx.fill();
          }
        } else if (game.level.theme === "ember") {
          ctx.fillStyle = "#734b4c";
          rounded(ctx, rect.x + 10, rect.y + 2, rect.w - 20, rect.h - 22, 6);
          ctx.fill();
          ctx.strokeStyle = "#ffc488";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(rect.x + 15, rect.y + 12);
          ctx.lineTo(rect.x + rect.w / 2, rect.y + 26);
          ctx.lineTo(rect.x + rect.w - 15, rect.y + 9);
          ctx.stroke();
        } else if (game.level.theme === "sky") {
          ctx.fillStyle = "#d6e9df";
          rounded(ctx, rect.x + 10, rect.y - 25, rect.w - 20, 22, 5);
          ctx.fill();
          ctx.fillStyle = "#71c8e7";
          ctx.fillRect(rect.x + rect.w / 2 - 10, rect.y - 22, 20, 42);
        }
      }
      this.scenery(game, time);
      if (!this.reducedMotion) {
        ctx.fillStyle = "#f2eaaa88";
        for (let i = 0; i < 8; i++) {
          circle(ctx, (i * 137 + time * 7) % 940 + 30, 50 + i * 79 % 520, 1.6);
          ctx.fill();
        }
      }
    }
    actor(actor, role, time, targeted) {
      const ctx = this.ctx;
      const boss = role === "enemy" && actor.kind === "boss";
      const enemy = role === "enemy" ? actor : void 0;
      const color = role === "enemy" ? enemy?.kind === "guard" ? "#b7edff" : enemy?.kind === "charger" ? "#ffc072" : "#ffb496" : hero(actor.art).color;
      const width = (boss ? 130 : role === "enemy" ? 67 : actor.art === "steelix" ? 108 : 92) * this.portraitScale;
      const height = width * 0.66;
      const bob = this.reducedMotion || actor.hp <= 0 ? 0 : Math.sin(time * 4 + actor.id) * 2;
      ctx.save();
      if (actor.hp <= 0) ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#0d25284d";
      ctx.beginPath();
      ctx.ellipse(actor.x, actor.y + 3, width * 0.41, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = role === "buddy" ? "#e5fbff" : color;
      ctx.lineWidth = role === "enemy" ? 2 : 3;
      if (role === "buddy") ctx.setLineDash([5, 4]);
      circle(ctx, actor.x, actor.y, actor.radius + 3);
      ctx.stroke();
      ctx.setLineDash([]);
      if (targeted) {
        ctx.strokeStyle = "#fff6b1";
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 5]);
        circle(ctx, actor.x, actor.y, actor.radius + 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const top = actor.y - height - 16 + bob;
      ctx.save();
      rounded(ctx, actor.x - width / 2, top, width, height, 12);
      ctx.clip();
      this.art.paint(ctx, actor.art, actor.x - width / 2, top, width, height);
      if (actor.hurt > 0 && Math.floor(actor.hurt * 16) % 2) {
        ctx.fillStyle = "#fff4e66b";
        ctx.fillRect(actor.x - width / 2, top, width, height);
      }
      ctx.restore();
      ctx.strokeStyle = color;
      ctx.lineWidth = role === "player" ? 4 : 2;
      rounded(ctx, actor.x - width / 2, top, width, height, 12);
      ctx.stroke();
      if (enemy?.kind === "guard") {
        ctx.strokeStyle = (enemy.guardBroken ?? 0) > 0 ? "#b7edff55" : "#b7edff";
        ctx.lineWidth = 9;
        if ((enemy.guardBroken ?? 0) > 0) ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 14, (enemy.facing ?? 0) - 1.3, (enemy.facing ?? 0) + 1.3);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if ((enemy?.haunt ?? 0) > 0) {
        ctx.strokeStyle = "#c6a0ff";
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 5]);
        circle(ctx, actor.x, actor.y, actor.radius + 8);
        ctx.stroke();
        ctx.setLineDash([]);
        this.flame(actor.x + actor.radius + 8, actor.y - 20, 9, "#c6a0ff");
      }
      if (actor.shield > 0) {
        ctx.fillStyle = actor.art === "duskull" ? "#c6a0ff28" : "#fff1b425";
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(actor.x, top + height / 2, width * 0.64, height * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (role === "player") {
        ctx.fillStyle = "#fff5c3";
        star(ctx, actor.x, top - 12, 9);
        ctx.fill();
      } else if (role === "buddy") {
        ctx.fillStyle = "#c7f8e0";
        circle(ctx, actor.x, top - 9, 5);
        ctx.fill();
        if (actor.hp <= 0) {
          ctx.strokeStyle = "#a4f4d0";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(actor.x, actor.y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * actor.revive / 1.5);
          ctx.stroke();
        }
      }
      if (!boss && role !== "player" && actor.hp > 0 && actor.hp < actor.maxHp) {
        ctx.fillStyle = "#182c39";
        rounded(ctx, actor.x - 24, top - 10, 48, 5, 2);
        ctx.fill();
        ctx.fillStyle = role === "buddy" ? "#a4f4d0" : "#ffb496";
        rounded(ctx, actor.x - 24, top - 10, 48 * actor.hp / actor.maxHp, 5, 2);
        ctx.fill();
      }
      ctx.restore();
    }
    portrait(canvas, id) {
      const ctx = canvas.getContext("2d");
      this.art.paint(ctx, id, 0, 0, canvas.width, canvas.height);
    }
  };

  // pokemon_fight/ts/audio.ts
  var Sounds = class {
    constructor() {
      this.enabled = true;
      this.context = null;
      this.recent = /* @__PURE__ */ new Map();
    }
    unlock() {
      try {
        this.context ?? (this.context = new AudioContext());
        void this.context.resume().catch(() => void 0);
      } catch {
      }
    }
    play(event) {
      const context = this.context;
      if (!this.enabled || !context || context.state !== "running") return;
      if (context.currentTime - (this.recent.get(event) ?? -10) < (event === "block" ? 0.25 : 0.12)) return;
      this.recent.set(event, context.currentTime);
      const tones = {
        attack: [330],
        hurt: [140, 100],
        pickup: [620, 830],
        special: [440, 660, 880],
        metal: [230, 140],
        ghost: [360, 540],
        water: [920, 1100, 1320],
        fire: [155, 85],
        block: [750],
        charge: [180, 230],
        upgrade: [523, 659, 880],
        objective: [523, 784, 1046],
        boss: [160, 200, 240],
        won: [523, 659, 784, 1046],
        lost: [330, 260, 220],
        rescue: [392, 523, 784]
      };
      tones[event].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const attack = ["attack", "metal", "ghost", "water", "fire"].includes(event);
        const start = context.currentTime + index * (event === "water" ? 0.045 : 0.09);
        const duration = event === "ghost" ? 0.2 : event === "water" ? 0.065 : 0.14;
        oscillator.type = event === "ghost" || event === "attack" ? "sine" : event === "water" ? "square" : event === "fire" ? "sawtooth" : "triangle";
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * (event === "ghost" ? 1.4 : event === "metal" || event === "fire" ? 0.5 : 0.85), start + duration);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(attack ? 0.023 : 0.05, start + 8e-3);
        gain.gain.exponentialRampToValueAtTime(1e-3, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
      });
    }
  };

  // pokemon_fight/ts/app.ts
  var validHero = (id) => HEROES.some((item) => item.id === id);
  var validStage = (id) => STAGES.some((item) => item.id === id);
  function preferences() {
    const defaults = { character: "steelix", buddy: "duskull", companion: true, difficulty: DEFAULT_DIFFICULTY, difficultyVersion: 2, practiced: false, sound: true, stage: 0, cleared: [], bonuses: [] };
    try {
      const saved = JSON.parse(localStorage.getItem("pocket-arena-v1") ?? "null");
      if (!saved || typeof saved !== "object") return defaults;
      return {
        character: validHero(saved.character) ? saved.character : defaults.character,
        buddy: validHero(saved.buddy) ? saved.buddy : defaults.buddy,
        companion: typeof saved.companion === "boolean" ? saved.companion : true,
        // Earlier versions silently selected Easy. Upgrade that old default once;
        // every choice made with the new menu, including Easy, is remembered.
        difficulty: saved.difficultyVersion === 2 && validDifficulty(saved.difficulty) ? saved.difficulty : DEFAULT_DIFFICULTY,
        difficultyVersion: 2,
        practiced: saved.practiced === true,
        sound: saved.sound !== false,
        stage: validStage(saved.stage) ? saved.stage : 0,
        cleared: Array.isArray(saved.cleared) ? [...new Set(saved.cleared.filter(validStage))] : [],
        bonuses: Array.isArray(saved.bonuses) ? [...new Set(saved.bonuses.filter(validStage))] : []
      };
    } catch {
      return defaults;
    }
  }
  function element(id) {
    return document.getElementById(id);
  }
  function text(id, value) {
    const node = element(id);
    if (node.textContent !== value) node.textContent = value;
  }
  var PocketArenaApp = class {
    constructor() {
      this.game = null;
      this.art = new Artwork();
      this.sound = new Sounds();
      this.prefs = preferences();
      this.keys = /* @__PURE__ */ new Set();
      this.stick = { x: 0, y: 0 };
      this.pointer = null;
      this.lastTime = 0;
      this.accumulator = 0;
      this.lastPhase = null;
      this.lastHp = -1;
      this.progressFinished = false;
      this.renderer = new ArenaRenderer(element("arena"), this.art);
      this.sound.enabled = this.prefs.sound;
      this.makeSelection();
      this.makeStages();
      this.bindControls();
      this.updateSound();
      void this.art.load(() => {
        for (const item of HEROES) this.renderer.portrait(element("portrait-" + item.id), item.id);
        this.progressFinished = this.art.loaded === 7;
        text("art-status", this.progressFinished ? this.art.failed.length ? "Some card pictures could not load. Color badges will stand in." : "Your real card pictures. Ready to play." : "Opening your card pictures... " + this.art.loaded + " / 7");
        this.updateStart();
      });
      if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => this.renderer.resize()).observe(element("arena-wrap"));
      else window.addEventListener("resize", () => this.renderer.resize());
      requestAnimationFrame((time) => this.frame(time));
    }
    save() {
      try {
        localStorage.setItem("pocket-arena-v1", JSON.stringify(this.prefs));
      } catch {
      }
    }
    makeSelection() {
      const list = element("characters");
      for (const item of HEROES) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "character";
        button.dataset.character = item.id;
        button.style.setProperty("--hero-color", item.color);
        button.innerHTML = '<span class="portrait-frame"><canvas id="portrait-' + item.id + '" width="384" height="256" aria-hidden="true"></canvas><span class="selected-mark" aria-hidden="true">&#10003;</span></span><span class="character-name">' + item.name + '</span><span class="character-title">' + item.title + "</span>";
        button.addEventListener("click", () => {
          this.prefs.character = item.id;
          if (this.prefs.buddy === item.id) this.prefs.buddy = HEROES.find((other) => other.id !== item.id).id;
          this.refreshSelection();
          this.save();
        });
        list.append(button);
        this.renderer.portrait(element("portrait-" + item.id), item.id);
      }
      element("companion").checked = this.prefs.companion;
      element("difficulty").value = this.prefs.difficulty;
      text("difficulty-hint", difficulty(this.prefs.difficulty).description);
      this.refreshSelection();
    }
    refreshSelection() {
      const buttons = Array.from(document.querySelectorAll(".character"));
      for (const node of buttons) node.setAttribute("aria-pressed", String(node.dataset.character === this.prefs.character));
      const selected = hero(this.prefs.character);
      element("selection-description").style.setProperty("--hero-color", selected.color);
      text("selection-description", selected.description + " Special: " + selected.special + ".");
      const select = element("buddy-character");
      select.replaceChildren();
      for (const item of HEROES.filter((item2) => item2.id !== this.prefs.character)) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.append(option);
      }
      select.value = this.prefs.buddy;
      element("buddy-choice").hidden = !this.prefs.companion;
      if (window.matchMedia("(pointer: coarse), (max-width: 520px)").matches) {
        const chosen = buttons.find((button) => button.dataset.character === this.prefs.character);
        if (chosen) element("characters").scrollLeft = chosen.offsetLeft - (element("characters").clientWidth - chosen.offsetWidth) / 2;
      }
      this.updateStart();
    }
    updateStart() {
      element("start").disabled = !this.progressFinished && !this.art.pictures.has(this.prefs.character) && !this.art.failed.includes(this.prefs.character);
    }
    makeStages() {
      for (const item of STAGES) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "stage-card";
        button.dataset.stage = String(item.id);
        button.style.setProperty("--stage-color", item.colors.accent);
        button.addEventListener("click", () => {
          this.prefs.stage = item.id;
          this.refreshStages();
          this.save();
        });
        element("stage-list").append(button);
      }
      this.refreshStages();
    }
    refreshStages() {
      for (const button of Array.from(document.querySelectorAll(".stage-card"))) {
        const item = stage(Number(button.dataset.stage));
        button.setAttribute("aria-pressed", String(this.prefs.stage === item.id));
        const done = this.prefs.cleared.includes(item.id);
        const bonus = this.prefs.bonuses.includes(item.id);
        button.innerHTML = '<span class="stage-symbol" aria-hidden="true">' + item.symbol + '</span><span class="stage-number">STAGE ' + (item.id + 1) + "</span><strong>" + item.name + '</strong><span class="stage-card-status">' + (done ? bonus ? "Badge + bonus earned" : "Badge earned" : "Ready to explore") + "</span>";
      }
      const selected = stage(this.prefs.stage);
      text("stage-hint", selected.subtitle + ". Leader: " + selected.boss.name + ". Bonus: " + selected.goal.label + ".");
      text("badge-count", this.prefs.cleared.length + " / " + STAGES.length + " badges");
    }
    bindControls() {
      element("start").addEventListener("click", () => this.start());
      element("retry").addEventListener("click", () => this.start(false));
      element("next-stage").addEventListener("click", () => {
        if (!this.game || this.game.phase !== "won" || this.game.level.id >= STAGES.length - 1) return;
        this.prefs.stage = stage(this.game.level.id + 1).id;
        this.refreshStages();
        this.save();
        this.start(false);
      });
      element("choose-again").addEventListener("click", () => this.home());
      element("pause-home").addEventListener("click", () => this.home());
      element("pause").addEventListener("click", () => this.pause());
      element("resume").addEventListener("click", () => this.resume());
      element("restart").addEventListener("click", () => this.start(false));
      element("skip-practice").addEventListener("click", () => {
        this.game?.finishPractice();
        this.prefs.practiced = true;
        this.save();
        this.clearInput();
      });
      element("practice-again").addEventListener("click", () => {
        this.prefs.practiced = false;
        this.start(true);
      });
      element("sound").addEventListener("click", () => {
        this.sound.enabled = !this.sound.enabled;
        this.prefs.sound = this.sound.enabled;
        this.sound.unlock();
        this.updateSound();
        this.save();
      });
      element("companion").addEventListener("change", () => {
        this.prefs.companion = element("companion").checked;
        this.refreshSelection();
        this.save();
      });
      element("buddy-character").addEventListener("change", () => {
        this.prefs.buddy = element("buddy-character").value;
        this.save();
      });
      element("difficulty").addEventListener("change", () => {
        const id = element("difficulty").value;
        if (!validDifficulty(id)) return;
        this.prefs.difficulty = id;
        text("difficulty-hint", difficulty(id).description);
        this.save();
      });
      window.addEventListener("keydown", (event) => {
        const modal = !element("upgrade-panel").hidden ? element("upgrade-panel") : !element("pause-panel").hidden ? element("pause-panel") : !element("result-panel").hidden ? element("result-panel") : null;
        if (modal && event.key === "Tab") {
          const buttons = Array.from(modal.querySelectorAll("button")).filter((button) => !button.hidden && !button.disabled);
          const index = buttons.indexOf(document.activeElement);
          if (event.shiftKey && index <= 0) {
            event.preventDefault();
            buttons[buttons.length - 1].focus();
          } else if (!event.shiftKey && (index < 0 || index === buttons.length - 1)) {
            event.preventDefault();
            buttons[0].focus();
          }
        }
        if (!this.game) return;
        if (this.game.phase === "upgrade") {
          if (!event.repeat && ["Digit1", "Digit2", "Digit3"].includes(event.code)) {
            event.preventDefault();
            const choice = this.game.upgradeChoices[Number(event.code.slice(-1)) - 1];
            if (choice) this.choosePower(choice.id);
          }
          return;
        }
        const movement = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];
        if (movement.includes(event.code) && (this.game.phase === "playing" || this.game.phase === "practice")) {
          event.preventDefault();
          this.keys.add(event.code);
        }
        if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) {
          if (this.game.phase === "paused") this.resume();
          else this.pause();
        }
      });
      window.addEventListener("keyup", (event) => this.keys.delete(event.code));
      window.addEventListener("blur", () => this.pause());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.pause();
      });
      const joystick = element("joystick");
      const update = (event) => {
        const bounds = joystick.getBoundingClientRect();
        const radius = bounds.width / 2 - 20;
        let x = (event.clientX - bounds.left - bounds.width / 2) / radius;
        let y = (event.clientY - bounds.top - bounds.height / 2) / radius;
        const magnitude = Math.hypot(x, y);
        if (magnitude > 1) {
          x /= magnitude;
          y /= magnitude;
        }
        this.stick = magnitude < 0.1 ? { x: 0, y: 0 } : { x, y };
        element("stick-knob").style.transform = "translate(" + this.stick.x * radius + "px," + this.stick.y * radius + "px)";
      };
      joystick.addEventListener("pointerdown", (event) => {
        if (!this.game || !["playing", "practice"].includes(this.game.phase) || this.pointer !== null) return;
        event.preventDefault();
        this.pointer = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        update(event);
        this.sound.unlock();
      });
      joystick.addEventListener("pointermove", (event) => {
        if (event.pointerId === this.pointer) {
          event.preventDefault();
          update(event);
        }
      });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) joystick.addEventListener(name, (event) => {
        if (event.pointerId === this.pointer) this.clearInput();
      });
    }
    updateSound() {
      text("sound", this.sound.enabled ? "Sound on" : "Sound off");
      element("sound").setAttribute("aria-pressed", String(this.sound.enabled));
    }
    clearInput() {
      this.keys.clear();
      this.stick = { x: 0, y: 0 };
      const joystick = element("joystick");
      const previous = this.pointer;
      this.pointer = null;
      if (previous !== null && joystick.hasPointerCapture(previous)) joystick.releasePointerCapture(previous);
      element("stick-knob").style.transform = "translate(0,0)";
    }
    start(practice = !this.prefs.practiced) {
      this.sound.unlock();
      this.save();
      this.clearInput();
      const options = { character: this.prefs.character, buddy: this.prefs.companion ? this.prefs.buddy : null, difficulty: this.prefs.difficulty, stage: this.prefs.stage, practice };
      this.game = new ArenaGame(options);
      document.body.classList.add("in-battle");
      this.lastHp = -1;
      this.lastPhase = null;
      this.accumulator = 0;
      this.lastTime = 0;
      element("selection").hidden = true;
      element("battle").hidden = false;
      element("pause-panel").hidden = true;
      element("result-panel").hidden = true;
      element("upgrade-panel").hidden = true;
      element("health").style.setProperty("--hero-color", hero(this.prefs.character).color);
      text("player-name", hero(this.prefs.character).name);
      this.renderer.resize();
      element("arena").focus({ preventScroll: true });
    }
    home() {
      this.game = null;
      this.clearInput();
      document.body.classList.remove("in-battle");
      element("battle").hidden = true;
      element("selection").hidden = false;
      element("pause-panel").hidden = true;
      element("result-panel").hidden = true;
      element("upgrade-panel").hidden = true;
      this.refreshStages();
      element("start").focus({ preventScroll: true });
    }
    pause() {
      this.clearInput();
      if (!this.game || !["practice", "playing"].includes(this.game.phase)) return;
      this.game.pause();
      element("pause-panel").hidden = false;
      element("resume").focus({ preventScroll: true });
    }
    resume() {
      if (!this.game || this.game.phase !== "paused") return;
      this.game.resume();
      this.clearInput();
      this.lastTime = 0;
      this.accumulator = 0;
      element("pause-panel").hidden = true;
      element("arena").focus({ preventScroll: true });
    }
    input() {
      if (Math.hypot(this.stick.x, this.stick.y) > 0.05) return this.stick;
      return {
        x: Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) - Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA")),
        y: Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) - Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"))
      };
    }
    choosePower(id) {
      if (!this.game?.chooseUpgrade(id)) return;
      this.clearInput();
      this.accumulator = 0;
      this.lastTime = 0;
      element("upgrade-panel").hidden = true;
      element("arena").focus({ preventScroll: true });
    }
    showUpgrade() {
      const game = this.game;
      this.clearInput();
      this.accumulator = 0;
      text("upgrade-count", "POWER-UP " + game.upgradeRound + " OF 2");
      element("buddy-upgrade-note").hidden = !game.buddy || !game.lastBuddyUpgrade;
      text("buddy-upgrade-note", game.buddy && game.lastBuddyUpgrade ? hero(game.buddy.art).name + " reached Lv " + (game.buddyUpgrades.length + 1) + " and automatically learned " + game.lastBuddyUpgrade.name + "." : "");
      const choices = element("upgrade-choices");
      choices.replaceChildren();
      game.upgradeChoices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "upgrade-choice";
        button.style.setProperty("--hero-color", hero(this.prefs.character).color);
        button.innerHTML = '<span class="upgrade-symbol" aria-hidden="true">' + choice.symbol + "</span><strong>" + choice.name + "</strong><span>" + choice.description + "</span><small>Choose " + (index + 1) + "</small>";
        button.addEventListener("click", () => this.choosePower(choice.id));
        choices.append(button);
      });
      element("upgrade-panel").hidden = false;
      choices.querySelector("button")?.focus({ preventScroll: true });
    }
    frame(time) {
      const delta = this.lastTime === 0 ? 0 : Math.min(0.08, (time - this.lastTime) / 1e3);
      this.lastTime = time;
      if (this.game) {
        this.accumulator += delta;
        while (this.accumulator >= 1 / 60) {
          this.game.step(1 / 60, this.input());
          this.accumulator -= 1 / 60;
        }
        for (const event of this.game.events.splice(0)) this.sound.play(event);
        this.renderer.draw(this.game, time / 1e3);
        this.hud();
      }
      requestAnimationFrame((next) => this.frame(next));
    }
    hud() {
      const game = this.game;
      if (game.phase !== this.lastPhase) {
        if (this.lastPhase === "practice" && game.phase === "playing") {
          this.prefs.practiced = true;
          this.save();
        }
        this.lastPhase = game.phase;
        if (game.phase === "upgrade") this.showUpgrade();
        if (game.phase === "won" || game.phase === "lost") {
          this.clearInput();
          element("result-panel").hidden = false;
          element("result-medal").classList.toggle("victory", game.phase === "won");
          text("result-symbol", game.phase === "won" ? "\u2605" : "\u2665");
          if (game.phase === "won") {
            if (!this.prefs.cleared.includes(game.level.id)) this.prefs.cleared.push(game.level.id);
            if (game.objectiveComplete && !this.prefs.bonuses.includes(game.level.id)) this.prefs.bonuses.push(game.level.id);
            this.save();
            this.refreshStages();
          }
          const next = STAGES[game.level.id + 1];
          element("next-stage").hidden = game.phase !== "won" || !next;
          text("next-stage", next ? "Next: " + next.name : "Adventure complete");
          text("result-title", game.phase === "won" ? this.prefs.cleared.length === STAGES.length ? "All five badges earned!" : game.level.name + " cleared!" : "A good try, trainer!");
          text("result-description", game.phase === "won" ? "You defeated " + game.level.boss.name + " with " + hero(this.prefs.character).name + ". " + (game.objectiveComplete ? "Bonus badge earned, too!" : "Try the bonus mission next time.") : "Every battle is practice. Try moving away from the glowing danger zones.");
          text("result-stats", game.defeated + " challengers cleared  /  " + this.clock(game.elapsed) + " played");
          text("result-powerups", game.upgradesTaken.map((id) => UPGRADES.find((item) => item.id === id)?.name ?? "").join(" + "));
          element("result-powerups").hidden = game.upgradesTaken.length === 0;
          element(game.phase === "won" && next ? "next-stage" : "retry").focus({ preventScroll: true });
        }
      }
      if (this.lastHp !== game.player.hp) {
        this.lastHp = game.player.hp;
        element("hearts").innerHTML = Array.from({ length: game.player.maxHp }, (_, index) => '<span class="' + (index < game.player.hp ? "" : "empty") + '">&#9829;</span>').join("");
        element("health").setAttribute("aria-label", "Health: " + game.player.hp + " of " + game.player.maxHp);
      }
      element("energy").value = game.player.energy;
      text("stage", game.stage + " / " + game.challenge.name);
      text("clock", this.clock(game.elapsed));
      text("buddy-status", game.buddy ? game.buddy.hp > 0 ? "Buddy: " + hero(game.buddy.art).name + " / Lv " + (game.buddyUpgrades.length + 1) : "Stand near your buddy to help!" : "Solo trainer");
      text("mission-name", game.level.id + 1 + ". " + game.level.name);
      text("mission-progress", game.stage === "PRACTICE" ? "Practice first. Your adventure starts next." : (game.objectiveComplete ? "Bonus complete! " : "Bonus: ") + game.level.goal.label + " (" + game.objectiveProgress + "/" + game.level.goal.count + ")");
      text("powerup-status", "Power-ups " + game.upgradesTaken.length + " / 2");
      element("boss-hud").hidden = !game.bossArrived;
      element("boss-health").value = game.boss ? game.boss.hp / game.boss.maxHp * 100 : 0;
      text("boss-name", game.level.boss.name.toUpperCase() + (game.bossEnraged ? " - PHASE 2" : ""));
      const warning = game.hazards.find((hazard) => !hazard.fired);
      text("boss-tip", warning ? warning.kind === "line" ? "Dodge the stripe!" : "Leave the circle!" : "Find an opening!");
      element("practice-tip").hidden = game.stage !== "PRACTICE";
      text("toast", game.announcementTime > 0 ? game.announcement : "");
      element("toast").hidden = game.announcementTime <= 0;
    }
    clock(seconds) {
      return Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
    }
  };
  var app;
  if (typeof document !== "undefined" && document.getElementById("arena")) app = new PocketArenaApp();
  return __toCommonJS(app_exports);
})();

return __PocketArena;
});
