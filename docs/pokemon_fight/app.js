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
    HEIGHT: () => HEIGHT,
    HEROES: () => HEROES,
    PocketArenaApp: () => PocketArenaApp,
    RADIUS: () => RADIUS,
    WIDTH: () => WIDTH,
    app: () => app,
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
    { id: "steelix", name: "Radiant Steelix", title: "The golden guardian", description: "Sturdy armor and a mighty tail sweep.", color: "#ffd56a", hp: 10, speed: 188, damage: 11, interval: 0.39, range: 265, special: "Golden tail sweep" },
    { id: "duskull", name: "Duskull", title: "The friendly phantom", description: "Ghostly orbs and a cozy spirit shield.", color: "#c6a0ff", hp: 8, speed: 201, damage: 8, interval: 0.34, range: 290, special: "Spirit shield" },
    { id: "greninja", name: "Greninja", title: "The water ninja", description: "Quick feet and a splash of water stars.", color: "#71dbff", hp: 8, speed: 226, damage: 8, interval: 0.29, range: 300, special: "Water star burst" },
    { id: "darmanitan", name: "Darmanitan", title: "The firecracker", description: "Fireballs that splash nearby challengers.", color: "#ff9c78", hp: 9, speed: 198, damage: 12, interval: 0.48, range: 280, special: "Firework bloom" }
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
  function walkable(point, radius) {
    return point.x >= radius + 24 && point.x <= WIDTH - radius - 24 && point.y >= radius + 24 && point.y <= HEIGHT - radius - 24 && !COVER.some((rect) => circleRect(point, radius, rect));
  }
  function move(point, dx, dy, radius) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (radius * 0.5)));
    for (let step = 0; step < steps; step++) {
      const x = clamp(point.x + dx / steps, 24 + radius, WIDTH - 24 - radius);
      const y = clamp(point.y + dy / steps, 24 + radius, HEIGHT - 24 - radius);
      if (walkable({ x, y: point.y }, radius)) point.x = x;
      if (walkable({ x: point.x, y }, radius)) point.y = y;
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
  var blocked = (a, b, padding = 3) => COVER.some((rect) => segmentRect(a, b, rect, padding));
  function segmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
  }
  function navigate(point, goal, radius) {
    if (!blocked(point, goal, radius + 2)) return unit(goal.x - point.x, goal.y - point.y);
    const gap = radius + 12;
    const nodes = [point, ...COVER.flatMap((rect) => [
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
        if (visited.has(i) || blocked(nodes[i], nodes[best], radius + 2)) continue;
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

  // pokemon_fight/ts/game.ts
  var ArenaGame = class {
    constructor(options) {
      this.enemies = [];
      this.shots = [];
      this.pickups = [];
      this.effects = [];
      this.hazards = [];
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
      this.options = { ...options };
      this.randomState = options.seed ?? Math.floor(Math.random() * 2147483646) + 1;
      this.player = this.makeActor(options.character, 500, 485);
      this.buddy = options.buddy ? this.makeActor(options.buddy, 575, 485) : null;
      this.phase = options.practice ? "practice" : "playing";
      if (options.practice) this.enemies.push(this.makeEnemy("dummy", 510, 330));
      else this.announce("Round 1 - find your rhythm!");
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
      const hp = kind === "boss" ? this.options.difficulty === "relaxed" ? 1300 : 1700 : kind === "shooter" ? 22 : kind === "dummy" ? 24 : 16;
      return {
        id: ++this.serial,
        art: kind === "boss" ? "machamp" : kind === "shooter" ? "spewpa" : "machoke",
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
        turn: 0
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
    }
    get boss() {
      return this.enemies.find((enemy) => enemy.kind === "boss" && enemy.hp > 0);
    }
    get stage() {
      if (this.phase === "practice" || this.phase === "paused" && this.beforePause === "practice") return "PRACTICE";
      return this.bossArrived ? "BOSS BATTLE" : this.elapsed < 45 ? "ROUND 1" : "ROUND 2";
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
      this.enemies = [];
      this.shots = [];
      this.effects = [];
      this.pickups = [];
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
      this.announcementTime = Math.max(0, this.announcementTime - dt);
      this.effects = this.effects.filter((effect) => (effect.life -= dt) > 0);
      for (const actor of [this.player, ...this.buddy ? [this.buddy] : [], ...this.enemies]) {
        actor.cooldown = Math.max(0, actor.cooldown - dt);
        actor.hurt = Math.max(0, actor.hurt - dt);
        actor.shield = Math.max(0, actor.shield - dt);
      }
      const length = Math.hypot(input.x, input.y);
      const direction = length > 1 ? unit(input.x, input.y) : input;
      const old = { x: this.player.x, y: this.player.y };
      move(this.player, direction.x * hero(this.options.character).speed * dt, direction.y * hero(this.options.character).speed * dt, RADIUS);
      this.traveled += distance(old, this.player);
      this.player.energy = Math.min(100, this.player.energy + dt * 6);
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
      this.updateShots(dt);
      if (this.terminal()) return;
      this.collect(dt);
      if (practice && this.traveled > 110 && this.hits > 0) this.finishPractice();
    }
    updateEncounters(dt) {
      if (!this.bossArrived && this.elapsed >= 90) {
        this.bossArrived = true;
        this.enemies = [this.makeEnemy("boss", 500, 148)];
        this.shots = this.shots.filter((shot) => shot.ally);
        this.targetOwner.clear();
        this.targetId = null;
        this.announce("Machamp has arrived! Watch the ground.");
        this.emit("boss");
        this.pickups.push({ x: 500, y: 420, id: ++this.serial, life: 35, kind: "health" });
      }
      if (this.bossArrived) return;
      if (this.elapsed >= 45 && this.elapsed - dt < 45) this.announce("Round 2 - use the stone shelters!");
      this.spawnTimer -= dt;
      this.supplyTimer -= dt;
      if (this.supplyTimer <= 0) {
        this.supplyTimer = 22;
        this.pickups.push({ id: ++this.serial, x: 470 + this.random() * 60, y: 290 + this.random() * 55, kind: "health", life: 32 });
      }
      const max = this.options.difficulty === "relaxed" ? 5 : 8;
      if (this.spawnTimer > 0 || this.enemies.length >= max) return;
      this.spawnTimer = this.options.difficulty === "relaxed" ? 3.4 : 2.5;
      const sites = [{ x: 85, y: 100 }, { x: 500, y: 65 }, { x: 915, y: 110 }, { x: 85, y: 510 }, { x: 915, y: 510 }].filter((point2) => distance(point2, this.player) > 220);
      const point = sites[Math.floor(this.random() * sites.length)] ?? { x: 500, y: 65 };
      this.enemies.push(this.makeEnemy(this.elapsed >= 45 && this.random() > 0.45 ? "shooter" : "chaser", point.x, point.y));
    }
    attack(actor, companion) {
      if (actor.hp <= 0) return;
      const spec = hero(actor.art);
      const eligible = (enemy) => enemy.hp > 0 && distance(actor, enemy) <= spec.range && !blocked(actor, enemy);
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
      const vector = unit(target.x - actor.x, target.y - actor.y);
      this.shots.push({
        id: ++this.serial,
        x: actor.x,
        y: actor.y,
        vx: vector.x * 490,
        vy: vector.y * 490,
        life: spec.range / 490 + 0.1,
        damage: spec.damage * (companion ? 0.5 : 1),
        color: spec.color,
        ally: true,
        splash: actor.art === "darmanitan" ? 48 : 0,
        radius: 6
      });
      if (!companion) this.emit("attack");
    }
    special(actor, companion, target) {
      const spec = hero(actor.art);
      actor.energy = 0;
      const power = companion ? 0.5 : 1;
      const radius = actor.art === "steelix" ? 290 : actor.art === "darmanitan" ? 95 : actor.art === "duskull" ? 140 : 340;
      if (actor.art === "duskull") actor.shield = 4.5;
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
            radius: 8
          });
        }
      } else for (const enemy of this.enemies.slice()) {
        if (enemy.hp > 0 && distance(center, enemy) <= radius && !blocked(center, enemy)) this.hitEnemy(enemy, 44 * power);
      }
      this.effect(center, spec.color, actor.art === "greninja" ? 70 : radius, "ring");
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
        const vector = navigate(buddy, goal, RADIUS);
        move(buddy, vector.x * 185 * dt, vector.y * 185 * dt, RADIUS);
      }
      if (!practice) this.attack(buddy, true);
    }
    updateEnemies(dt) {
      for (const enemy of this.enemies) {
        if (enemy.hp <= 0) continue;
        const targets = [this.player, ...this.buddy && this.buddy.hp > 0 ? [this.buddy] : []];
        const target = targets.sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
        enemy.timer -= dt;
        if (enemy.kind === "boss") {
          if (enemy.timer <= 0 && !this.hazards.some((hazard) => !hazard.fired)) {
            const direction = unit(this.player.x - enemy.x, this.player.y - enemy.y);
            const wait = this.options.difficulty === "relaxed" ? 1.9 : 1.5;
            this.hazards.push({
              x: enemy.x,
              y: enemy.y,
              end: { x: enemy.x + direction.x * 470, y: enemy.y + direction.y * 470 },
              kind: enemy.turn++ % 2 === 0 ? "line" : "circle",
              radius: enemy.turn % 2 === 1 ? 38 : 155,
              wait,
              duration: wait,
              life: 0.5,
              fired: false
            });
            enemy.timer = wait + 3.2;
          }
          if (!this.hazards.some((hazard) => !hazard.fired) && distance(enemy, this.player) > 205) {
            const direction = navigate(enemy, this.player, enemy.radius);
            move(enemy, direction.x * dt * 48, direction.y * dt * 48, enemy.radius);
          }
        } else if (enemy.kind === "chaser") {
          const direction = navigate(enemy, target, enemy.radius);
          move(enemy, direction.x * dt * (this.options.difficulty === "relaxed" ? 61 : 82), direction.y * dt * (this.options.difficulty === "relaxed" ? 61 : 82), enemy.radius);
        } else if (enemy.kind === "shooter" && enemy.timer <= 0) {
          enemy.timer = this.options.difficulty === "relaxed" ? 3.3 : 2.5;
          const direction = unit(target.x - enemy.x, target.y - enemy.y);
          this.shots.push({
            id: ++this.serial,
            x: enemy.x,
            y: enemy.y,
            vx: direction.x * 125,
            vy: direction.y * 125,
            life: 7,
            damage: 1,
            ally: false,
            color: "#ff937d",
            splash: 0,
            radius: 9
          });
        }
        for (const actor of targets) {
          if (distance(enemy, actor) < enemy.radius + actor.radius + 2) this.hurtActor(actor, 1);
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
          }
        } else hazard.life -= dt;
      }
      this.hazards = this.hazards.filter((hazard) => !hazard.fired || hazard.life > 0);
    }
    updateShots(dt) {
      for (const shot of this.shots) {
        const before = { x: shot.x, y: shot.y };
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        shot.life -= dt;
        if (blocked(before, shot, shot.radius)) {
          shot.life = 0;
          continue;
        }
        if (shot.ally) {
          for (const enemy of this.enemies) {
            if (enemy.hp <= 0 || segmentDistance(enemy, before, shot) > enemy.radius + shot.radius) continue;
            this.hitEnemy(enemy, shot.damage);
            if (shot.splash) {
              for (const other of this.enemies.slice()) {
                if (other !== enemy && other.hp > 0 && distance(other, enemy) < shot.splash && !blocked(enemy, other)) this.hitEnemy(other, shot.damage * 0.55);
              }
              this.effect(enemy, shot.color, shot.splash);
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
      this.shots = this.shots.filter((shot) => shot.life > 0 && shot.x > 0 && shot.x < WIDTH && shot.y > 0 && shot.y < HEIGHT);
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    }
    hitEnemy(enemy, damage) {
      if (enemy.hp <= 0) return;
      enemy.hp = Math.max(0, enemy.hp - damage);
      enemy.hurt = 0.12;
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
      this.pickups.push({ id: ++this.serial, x: enemy.x, y: enemy.y, life: 28, kind: this.random() < 0.22 ? "health" : "energy" });
    }
    hurtActor(actor, damage) {
      if (actor.hp <= 0 || actor.hurt > 0 || actor.shield > 0 || this.phase !== "playing") return;
      actor.hp = Math.max(0, actor.hp - damage);
      actor.hurt = 1.2;
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
    }
    draw(game, time) {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      ctx.fillStyle = "#132c31";
      ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
      const scale = Math.min(this.cssWidth / WIDTH, this.cssHeight / HEIGHT);
      ctx.save();
      ctx.translate((this.cssWidth - WIDTH * scale) / 2, (this.cssHeight - HEIGHT * scale) / 2);
      ctx.scale(scale, scale);
      this.field(time);
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
    }
    field(time) {
      const ctx = this.ctx;
      ctx.fillStyle = "#305947";
      rounded(ctx, 8, 8, WIDTH - 16, HEIGHT - 16, 35);
      ctx.fill();
      ctx.fillStyle = "#42795a";
      rounded(ctx, 22, 22, WIDTH - 44, HEIGHT - 44, 26);
      ctx.fill();
      for (let row = 0; row < 10; row++) for (let col = 0; col < 16; col++) {
        ctx.fillStyle = (row + col) % 2 ? "#ffffff04" : "#102c2408";
        ctx.fillRect(24 + col * 60, 25 + row * 57, 60, 57);
      }
      ctx.strokeStyle = "#c8e2af44";
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
      ctx.fillStyle = "#42795a";
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
        ctx.fillStyle = "#638e63";
        circle(ctx, x - 8, y - 8, 19);
        ctx.fill();
        circle(ctx, x + 11, y - 1, 16);
        ctx.fill();
        ctx.fillStyle = "#ffd479";
        circle(ctx, x + 3, y - 12, 3);
        ctx.fill();
      }
      for (const rect of COVER) {
        ctx.fillStyle = "#142c3144";
        rounded(ctx, rect.x + 6, rect.y + 9, rect.w, rect.h, 13);
        ctx.fill();
        ctx.fillStyle = "#78988a";
        rounded(ctx, rect.x, rect.y - 8, rect.w, rect.h + 8, 12);
        ctx.fill();
        ctx.fillStyle = "#b0bda0";
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
      }
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
      const boss = actor.art === "machamp";
      const color = role === "enemy" ? "#ffb496" : hero(actor.art).color;
      const width = boss ? 130 : role === "enemy" ? 67 : actor.art === "steelix" ? 108 : 92;
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
      this.lastAttack = 0;
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
      if (event === "attack" && context.currentTime - this.lastAttack < 0.18) return;
      if (event === "attack") this.lastAttack = context.currentTime;
      const tones = {
        attack: [330],
        hurt: [140, 100],
        pickup: [620, 830],
        special: [440, 660, 880],
        boss: [160, 200, 240],
        won: [523, 659, 784, 1046],
        lost: [330, 260, 220],
        rescue: [392, 523, 784]
      };
      tones[event].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.09;
        oscillator.type = event === "attack" ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(event === "attack" ? 0.015 : 0.055, start + 8e-3);
        gain.gain.exponentialRampToValueAtTime(1e-3, start + 0.12);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    }
  };

  // pokemon_fight/ts/app.ts
  var validHero = (id) => HEROES.some((item) => item.id === id);
  function preferences() {
    const defaults = { character: "steelix", buddy: "duskull", companion: true, difficulty: "relaxed", practiced: false, sound: true };
    try {
      const saved = JSON.parse(localStorage.getItem("pocket-arena-v1") ?? "null");
      if (!saved || typeof saved !== "object") return defaults;
      return {
        character: validHero(saved.character) ? saved.character : defaults.character,
        buddy: validHero(saved.buddy) ? saved.buddy : defaults.buddy,
        companion: typeof saved.companion === "boolean" ? saved.companion : true,
        difficulty: saved.difficulty === "standard" ? "standard" : "relaxed",
        practiced: saved.practiced === true,
        sound: saved.sound !== false
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
      this.refreshSelection();
    }
    refreshSelection() {
      for (const node of Array.from(document.querySelectorAll(".character"))) node.setAttribute("aria-pressed", String(node.dataset.character === this.prefs.character));
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
      this.updateStart();
    }
    updateStart() {
      element("start").disabled = !this.progressFinished && !this.art.pictures.has(this.prefs.character) && !this.art.failed.includes(this.prefs.character);
    }
    bindControls() {
      element("start").addEventListener("click", () => this.start());
      element("retry").addEventListener("click", () => this.start(false));
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
        this.prefs.difficulty = element("difficulty").value;
        this.save();
      });
      window.addEventListener("keydown", (event) => {
        const modal = !element("pause-panel").hidden ? element("pause-panel") : !element("result-panel").hidden ? element("result-panel") : null;
        if (modal && event.key === "Tab") {
          const buttons = Array.from(modal.querySelectorAll("button"));
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
      const options = { character: this.prefs.character, buddy: this.prefs.companion ? this.prefs.buddy : null, difficulty: this.prefs.difficulty, practice };
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
        if (game.phase === "won" || game.phase === "lost") {
          this.clearInput();
          element("result-panel").hidden = false;
          element("result-medal").classList.toggle("victory", game.phase === "won");
          text("result-symbol", game.phase === "won" ? "\u2605" : "\u2665");
          text("result-title", game.phase === "won" ? "Training badge earned!" : "A good try, trainer!");
          text("result-description", game.phase === "won" ? "You defeated Machamp with " + hero(this.prefs.character).name + ". Ready for another adventure?" : "Every battle is practice. Try moving away from the glowing danger zones.");
          text("result-stats", game.defeated + " challengers cleared  /  " + this.clock(game.elapsed) + " played");
          element("retry").focus({ preventScroll: true });
        }
      }
      if (this.lastHp !== game.player.hp) {
        this.lastHp = game.player.hp;
        element("hearts").innerHTML = Array.from({ length: game.player.maxHp }, (_, index) => '<span class="' + (index < game.player.hp ? "" : "empty") + '">&#9829;</span>').join("");
        element("health").setAttribute("aria-label", "Health: " + game.player.hp + " of " + game.player.maxHp);
      }
      element("energy").value = game.player.energy;
      text("stage", game.stage);
      text("clock", this.clock(game.elapsed));
      text("buddy-status", game.buddy ? game.buddy.hp > 0 ? "Buddy: " + hero(game.buddy.art).name : "Stand near your buddy to help!" : "Solo trainer");
      element("boss-hud").hidden = !game.bossArrived;
      element("boss-health").value = game.boss ? game.boss.hp / game.boss.maxHp * 100 : 0;
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
