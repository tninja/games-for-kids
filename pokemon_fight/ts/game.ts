import { COVER, HEIGHT, RADIUS, WIDTH, hero, type ArtId, type HeroId, type Point, type Rect } from "./data";
import { blocked, clamp, distance, move, navigate, segmentDistance, unit, walkable } from "./physics";
import { BUDDY_ATTACK_PRIORITY, UPGRADES, type Upgrade } from "./upgrades";
import { stage as stageDefinition, type Stage, type StageId } from "./stages";

import { difficulty, type Difficulty, type DifficultyId } from "./difficulty";

export type Phase = "practice" | "playing" | "upgrade" | "paused" | "won" | "lost";
export interface Options { character: HeroId; buddy: HeroId | null; difficulty: DifficultyId; stage?: StageId; practice?: boolean; seed?: number }
export interface Actor extends Point {
  id: number; art: ArtId; hp: number; maxHp: number; radius: number;
  cooldown: number; hurt: number; shield: number; energy: number; revive: number;
  attackTime?: number; aim?: number;
}
export interface Enemy extends Actor {
  kind: "chaser" | "shooter" | "charger" | "guard" | "boss" | "dummy"; timer: number; turn: number;
  facing?: number; windup?: number; dash?: number; dashDirection?: Point; guardBroken?: number;
  haunt?: number; hauntDps?: number; hauntSlow?: number;
}
export type ShotKind = "metal" | "ghost" | "water" | "fire" | "pellet";
export interface Shot extends Point {
  id: number; vx: number; vy: number; life: number; damage: number; ally: boolean; color: string; splash: number; radius: number;
  kind?: ShotKind; source?: number; target?: number; age?: number; from?: Point; to?: Point;
  duration?: number; hits?: number[]; pierce?: number; spread?: number; haunt?: number;
  boomerang?: boolean; returning?: boolean; returnAt?: number;
}
export interface Pickup extends Point { id: number; kind: "energy" | "health"; life: number }
export interface Effect extends Point { color: string; radius: number; life: number; duration: number; kind: "burst" | "ring" | "heal" | "fire" | "haunt" | "block" }
export interface Hazard extends Point { end: Point; kind: "line" | "circle"; radius: number; wait: number; duration: number; fired: boolean; life: number; payload?: "ghost" | "water" | "fire" }
export interface GoalNode extends Point { id: number; progress: number; done: boolean; art: ArtId }
export interface FlameZone extends Point { id: number; radius: number; life: number; duration: number; tick: number; damage: number; source: number }
interface Burst { actor: Actor; delay: number; kind: ShotKind; target: Enemy; power: number }
export type GameEvent = "attack" | "metal" | "ghost" | "water" | "fire" | "block" | "charge" | "upgrade" | "objective" | "hurt" | "pickup" | "special" | "boss" | "won" | "lost" | "rescue";

export class ArenaGame {
  readonly options: Options;
  readonly level: Stage;
  readonly challenge: Difficulty;
  readonly obstacles: Rect[];
  phase: Phase;
  player: Actor;
  buddy: Actor | null;
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  pickups: Pickup[] = [];
  effects: Effect[] = [];
  hazards: Hazard[] = [];
  flames: FlameZone[] = [];
  upgradeChoices: Upgrade[] = [];
  upgradesTaken: string[] = [];
  buddyUpgrades: string[] = [];
  lastBuddyUpgrade: Upgrade | undefined;
  goalNodes: GoalNode[];
  objectiveRewarded = false;
  upgradeRound = 0;
  bossEnraged = false;
  events: GameEvent[] = [];
  elapsed = 0;
  practiceTime = 0;
  traveled = 0;
  hits = 0;
  defeated = 0;
  targetId: number | null = null;
  bossArrived = false;
  rescueUsed = false;
  announcement = "Find your feet!";
  announcementTime = 4;
  private spawnTimer = 1;
  private supplyTimer = 18;
  private serial = 0;
  private randomState: number;
  private beforePause: "practice" | "playing" = "playing";
  private targetOwner = new Map<number, number>();
  private bursts: Burst[] = [];
  private introducedCharger = false;
  private introducedGuard = false;

  constructor(options: Options) {
    this.level = stageDefinition(options.stage);
    this.obstacles = (options.practice ? COVER : this.level.cover).map(rect => ({ ...rect }));
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

  walkable(point: Point, radius: number): boolean { return walkable(point, radius, this.obstacles); }
  move(point: Point, dx: number, dy: number, radius: number): void { move(point, dx, dy, radius, this.obstacles); }
  blocked(a: Point, b: Point, padding = 3): boolean { return blocked(a, b, padding, this.obstacles); }
  navigate(point: Point, goal: Point, radius: number): Point { return navigate(point, goal, radius, this.obstacles); }
  get objectiveProgress(): number {
    return Math.min(this.level.goal.count, this.level.goal.kind === "defeat" ? this.defeated : this.goalNodes.filter(node => node.done).length);
  }
  get objectiveComplete(): boolean { return this.objectiveProgress >= this.level.goal.count; }

  private random(): number {
    this.randomState = Math.imul(this.randomState, 1664525) + 1013904223 | 0;
    return (this.randomState >>> 0) / 4294967296;
  }
  private makeActor(id: HeroId, x: number, y: number): Actor {
    const spec = hero(id);
    return { id: ++this.serial, art: id, x, y, hp: spec.hp, maxHp: spec.hp, radius: RADIUS, cooldown: 0, hurt: 0, shield: 0, energy: 25, revive: 0 };
  }
  private makeEnemy(kind: Enemy["kind"], x: number, y: number): Enemy {
    const baseHp = kind === "boss" ? this.challenge.bossHp : kind === "guard" ? 42 : kind === "charger" ? 26 : kind === "shooter" ? 24 : kind === "dummy" ? 24 : 20;
    const hp = kind === "dummy" ? baseHp : Math.round(baseHp * this.level.strength * (kind === "boss" ? 1 : this.challenge.enemyHp));
    const art = kind === "boss" ? this.level.boss.art : kind === "dummy" ? "machoke" : this.level.enemyArt[kind] ?? (kind === "shooter" ? "spewpa" : "machoke");
    return { id: ++this.serial, art, kind,
      x, y, hp, maxHp: hp, radius: kind === "boss" ? 30 : 17, cooldown: 0, hurt: 0, shield: 0, energy: 0, revive: 0, timer: 1.5, turn: 0,
      facing: Math.atan2(this.player.y - y, this.player.x - x) };
  }
  private emit(event: GameEvent): void { if (this.events.length < 40) this.events.push(event); }
  private terminal(): boolean { return this.phase === "won" || this.phase === "lost"; }
  private announce(text: string): void { this.announcement = text; this.announcementTime = 4; }
  private effect(point: Point, color: string, radius = 65, kind: Effect["kind"] = "burst"): void {
    this.effects.push({ ...point, color, radius, kind, life: 0.65, duration: 0.65 });
    if (this.effects.length > 160) this.effects.shift();
  }
  get boss(): Enemy | undefined { return this.enemies.find(enemy => enemy.kind === "boss" && enemy.hp > 0); }
  get stage(): string {
    if (this.phase === "practice" || this.phase === "paused" && this.beforePause === "practice") return "PRACTICE";
    return this.bossArrived ? this.bossEnraged ? "BOSS: PHASE 2" : "BOSS BATTLE" : this.elapsed < 45 ? "ROUND 1" : "ROUND 2";
  }
  pause(): void {
    if (this.phase === "practice" || this.phase === "playing") { this.beforePause = this.phase; this.phase = "paused"; }
  }
  resume(): void { if (this.phase === "paused") this.phase = this.beforePause; }
  finishPractice(): void {
    if (this.phase !== "practice") return;
    this.phase = "playing";
    this.obstacles.splice(0, this.obstacles.length, ...this.level.cover.map(rect => ({ ...rect })));
    this.enemies = []; this.shots = []; this.effects = []; this.pickups = []; this.flames = []; this.bursts = [];
    this.player.hp = this.player.maxHp;
    this.player.energy = 25;
    this.player.cooldown = 0;
    this.targetId = null;
    this.targetOwner.clear();
    this.player.x = 500; this.player.y = 485;
    if (this.buddy) { this.buddy.x = 575; this.buddy.y = 485; }
    this.announce("You have got this! Round 1 begins.");
  }
  step(dt: number, input: Point = { x: 0, y: 0 }): void {
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
    this.effects = this.effects.filter(effect => (effect.life -= dt) > 0);
    for (const actor of [this.player, ...(this.buddy ? [this.buddy] : []), ...this.enemies]) {
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

  private has(actor: Actor, upgrade: string): boolean {
    return actor === this.player ? this.upgradesTaken.includes(upgrade) : actor === this.buddy && this.buddyUpgrades.includes(upgrade);
  }
  private offerUpgrade(): void {
    const available = UPGRADES.filter(item => !this.upgradesTaken.includes(item.id));
    const shuffle = (items: Upgrade[]): Upgrade[] => {
      for (let i = items.length - 1; i > 0; i--) {
        const swap = Math.floor(this.random() * (i + 1));
        [items[i], items[swap]] = [items[swap], items[i]];
      }
      return items;
    };
    const signature = shuffle(available.filter(item => item.hero === this.options.character)).slice(0, 2);
    const utility = shuffle(available.filter(item => !item.hero)).slice(0, 1);
    this.upgradeChoices = shuffle([...signature, ...utility]);
    this.upgradeRound++;
    this.levelUpBuddy();
    this.phase = "upgrade";
    this.emit("upgrade");
  }
  private levelUpBuddy(): void {
    if (!this.buddy) return;
    const priority = BUDDY_ATTACK_PRIORITY[this.buddy.art as HeroId];
    const id = priority.find(candidate => !this.buddyUpgrades.includes(candidate) && UPGRADES.some(item => item.id === candidate && item.category === "attack"));
    if (!id) return;
    this.lastBuddyUpgrade = UPGRADES.find(item => item.id === id);
    this.buddyUpgrades.push(id);
  }
  private updateObjective(dt: number): void {
    if (this.level.goal.kind !== "defeat") {
      for (const node of this.goalNodes) {
        if (node.done) continue;
        const hold = this.level.goal.kind === "collect" ? 0 : this.level.goal.kind === "beacon" ? 2 : 1.2;
        if (distance(this.player, node) < (hold ? 56 : 35)) node.progress = hold ? Math.min(1, node.progress + dt / hold) : 1;
        else node.progress = Math.max(0, node.progress - dt * 0.5);
        if (node.progress >= 1) { node.done = true; this.effect(node, this.level.colors.accent, 60, "heal"); this.emit("pickup"); }
      }
    }
    if (!this.objectiveRewarded && this.objectiveComplete) {
      this.objectiveRewarded = true;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
      this.player.energy = 100;
      this.announce("Bonus complete! Two hearts and a charged special.");
      this.effect(this.player, "#b8f2d2", 95, "heal"); this.emit("objective");
    }
  }
  chooseUpgrade(id: string): boolean {
    if (this.phase !== "upgrade" || !this.upgradeChoices.some(item => item.id === id)) return false;
    const choice = this.upgradeChoices.find(item => item.id === id)!;
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

  private updateEncounters(dt: number): void {
    if (!this.bossArrived && this.elapsed >= 90) {
      this.bossArrived = true;
      this.enemies = [this.makeEnemy("boss", 500, 148)];
      this.flames = []; this.bursts = [];
      this.shots = this.shots.filter(shot => shot.ally);
      this.targetOwner.clear(); this.targetId = null;
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
    const sites = [{ x: 85, y: 100 }, { x: 500, y: 65 }, { x: 915, y: 110 }, { x: 85, y: 510 }, { x: 915, y: 510 }]
      .filter(point => distance(point, this.player) > 220);
    const point = sites[Math.floor(this.random() * sites.length)] ?? { x: 500, y: 65 };
    let kind: Enemy["kind"] = "chaser";
    if (this.elapsed >= 15 && !this.introducedCharger && this.level.enemies.includes("charger")) {
      kind = "charger"; this.introducedCharger = true; this.announce("Orange stripe? Step aside for a charge!");
    } else if (this.elapsed >= 45 && !this.introducedGuard && this.level.enemies.includes("guard")) {
      kind = "guard"; this.introducedGuard = true; this.announce("A shield! Try a side or a ghost flame.");
    } else if (this.elapsed >= 45) kind = this.level.enemies[Math.floor(this.random() * this.level.enemies.length)];
    else if (this.elapsed >= 15 && this.random() < 0.35) kind = this.level.enemies[0];
    this.enemies.push(this.makeEnemy(kind, point.x, point.y));
  }
  private attack(actor: Actor, companion: boolean): void {
    if (actor.hp <= 0) return;
    const spec = hero(actor.art as HeroId);
    const eligible = (enemy: Enemy): boolean => enemy.hp > 0 && distance(actor, enemy) <= spec.range &&
      (actor.art === "duskull" || actor.art === "darmanitan" || !this.blocked(actor, enemy, actor.art === "greninja" ? 9 : 3));
    let target = this.enemies.find(enemy => enemy.id === this.targetOwner.get(actor.id) && eligible(enemy));
    if (!target) target = this.enemies.filter(eligible).sort((a, b) => distance(actor, a) - distance(actor, b))[0];
    if (!companion) this.targetId = target?.id ?? null;
    if (!target) { this.targetOwner.delete(actor.id); return; }
    this.targetOwner.set(actor.id, target.id);
    if (actor.energy >= 100) this.special(actor, companion, target);
    if (actor.cooldown > 0 || target.hp <= 0) return;
    actor.cooldown = spec.interval * (companion ? 1.3 : 1);
    actor.attackTime = 0.3;
    actor.aim = Math.atan2(target.y - actor.y, target.x - actor.x);
    const power = companion ? 0.5 : 1;
    const kind: ShotKind = actor.art === "steelix" ? "metal" : actor.art === "duskull" ? "ghost" : actor.art === "greninja" ? "water" : "fire";
    this.launch(actor, target, kind, power);
    const extra = kind === "water" ? 2 : this.has(actor, "steel-double") || this.has(actor, "ghost-twins") || this.has(actor, "fire-twins") ? 1 : 0;
    for (let i = 1; i <= extra; i++) this.bursts.push({ actor, target, kind, power, delay: kind === "water" ? i * 0.1 : 0.2 });
    if (!companion) this.emit(kind);
  }
  private launch(actor: Actor, target: Enemy, kind: ShotKind, power: number): void {
    const spec = hero(actor.art as HeroId);
    const aim = Math.atan2(target.y - actor.y, target.x - actor.x);
    const angles = kind === "water" && this.has(actor, "water-fan") ? [-0.24, 0, 0.24] : [0];
    for (const offset of angles) {
      const speed = kind === "ghost" ? 220 : kind === "water" ? 630 : 490;
      const angle = aim + offset + (kind === "ghost" ? 0.5 : 0);
      const shot: Shot = { id: ++this.serial, x: actor.x, y: actor.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: kind === "ghost" ? 2.4 : spec.range / speed + 0.12, damage: spec.damage * power, ally: true, color: spec.color,
        splash: 0, radius: kind === "ghost" ? 11 : 7, kind, source: actor.id, target: target.id, age: 0,
        from: { x: actor.x, y: actor.y }, hits: [] };
      if (kind === "metal") { shot.spread = this.has(actor, "steel-wide") ? 1 : 0.58; shot.life = spec.range / speed; }
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
  private updateBursts(dt: number): void {
    const pending = this.bursts;
    this.bursts = [];
    for (const burst of pending) {
      burst.delay -= dt;
      if (burst.delay > 0) { this.bursts.push(burst); continue; }
      if (burst.actor.hp <= 0) continue;
      const target = burst.target.hp > 0 ? burst.target : this.enemies.find(enemy => enemy.hp > 0 && distance(burst.actor, enemy) < hero(burst.actor.art as HeroId).range);
      if (target) this.launch(burst.actor, target, burst.kind, burst.power);
    }
  }
  private special(actor: Actor, companion: boolean, target: Enemy): void {
    const spec = hero(actor.art as HeroId);
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
        this.shots.push({ id: ++this.serial, x: actor.x, y: actor.y, vx: Math.cos(angle) * 560, vy: Math.sin(angle) * 560,
          life: 0.72, damage: 25 * power, color: spec.color, ally: true, splash: 0, radius: 8,
          kind: "water", source: actor.id, hits: [], pierce: this.has(actor, "water-pierce") ? 5 : 2, age: 0 });
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
  private updateBuddy(dt: number, practice: boolean): void {
    const buddy = this.buddy;
    if (!buddy) return;
    if (buddy.hp <= 0) {
      buddy.revive = distance(this.player, buddy) < 85 ? buddy.revive + dt : 0;
      if (buddy.revive >= 1.5) { buddy.hp = Math.ceil(buddy.maxHp / 2); buddy.shield = 3; buddy.revive = 0; this.effect(buddy, "#a4f4d0", 70, "heal"); }
      return;
    }
    buddy.energy = Math.min(100, buddy.energy + dt * 5);
    let goal: Point = { x: this.player.x + (this.player.x < 500 ? 65 : -65), y: this.player.y + 30 };
    const nearby = this.enemies.filter(enemy => enemy.hp > 0).sort((a, b) => distance(buddy, a) - distance(buddy, b))[0];
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
  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      const targets = [this.player, ...(this.buddy && this.buddy.hp > 0 ? [this.buddy] : [])];
      const target = targets.sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
      const slow = (enemy.haunt ?? 0) > 0 ? enemy.hauntSlow ?? 0.68 : 1;
      enemy.timer -= dt;
      if (enemy.kind === "boss") {
        if (!this.bossEnraged && enemy.hp <= enemy.maxHp * 0.5) {
          this.bossEnraged = true;
          this.announce(this.level.boss.name + " phase 2! Watch for new patterns.");
          this.effect(enemy, "#ff9c78", 120, "ring"); this.emit("boss");
        }
        if (enemy.timer <= 0 && !this.hazards.some(hazard => !hazard.fired)) {
          const wait = this.challenge.bossWarning + (this.bossEnraged ? 0.2 : 0);
          this.castBossPattern(enemy, wait);
          enemy.timer = wait + (this.challenge.bossRest - (this.bossEnraged ? 0.6 : 0));
        }
        if (!this.hazards.some(hazard => !hazard.fired) && distance(enemy, this.player) > 205) {
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
          enemy.windup = Math.max(0, enemy.windup! - dt);
          if (enemy.windup === 0) { enemy.dash = 0.52; enemy.timer = this.challenge.chargeRest; }
        } else if ((enemy.dash ?? 0) > 0) {
          enemy.dash = Math.max(0, enemy.dash! - dt);
          this.move(enemy, enemy.dashDirection!.x * 440 * slow * dt, enemy.dashDirection!.y * 440 * slow * dt, enemy.radius);
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
          this.shots.push({ id: ++this.serial, x: enemy.x, y: enemy.y,
            vx: Math.cos(angle) * this.challenge.projectileSpeed, vy: Math.sin(angle) * this.challenge.projectileSpeed,
            life: 7, damage: 1, ally: false, color: "#ff937d", splash: 0, radius: 9 });
        }
      }
      for (const actor of targets) {
        if (distance(enemy, actor) < enemy.radius + actor.radius + 2) this.hurtActor(actor, enemy.kind === "charger" && (enemy.dash ?? 0) > 0 ? 2 : 1);
      }
    }
  }
  private castBossPattern(enemy: Enemy, wait: number): void {
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
      if (this.bossEnraged && pattern === 0) this.addHazard({ x: enemy.x + direction.y * 230, y: enemy.y - direction.x * 230 }, "line", 30, wait,
        { x: enemy.x - direction.y * 230, y: enemy.y + direction.x * 230 });
    }
  }
  private addHazard(point: Point, kind: Hazard["kind"], radius: number, wait: number, end: Point = point): Hazard {
    const hazard: Hazard = { x: point.x, y: point.y, end: { ...end }, kind, radius, wait, duration: wait, fired: false, life: 0.5 };
    this.hazards.push(hazard);
    return hazard;
  }
  chargeEnd(enemy: Enemy): Point {
    const direction = enemy.dashDirection ?? { x: 0, y: 1 };
    let destination: Point = { x: enemy.x, y: enemy.y };
    for (let step = 1; step <= 28; step++) {
      const candidate = { x: enemy.x + direction.x * step * 8, y: enemy.y + direction.y * step * 8 };
      if (!this.walkable(candidate, enemy.radius)) break;
      destination = candidate;
    }
    return destination;
  }
  private updateHaunts(dt: number): void {
    for (const enemy of this.enemies) {
      enemy.guardBroken = Math.max(0, (enemy.guardBroken ?? 0) - dt);
      if ((enemy.haunt ?? 0) > 0 && enemy.hp > 0) {
        const damage = Math.min(dt, enemy.haunt!) * (enemy.hauntDps ?? 0);
        enemy.haunt = Math.max(0, enemy.haunt! - dt);
        this.hitEnemy(enemy, damage, undefined, true);
        if (this.terminal()) return;
      }
    }
  }
  private updateHazards(dt: number): void {
    for (const hazard of this.hazards) {
      if (!hazard.fired) {
        hazard.wait -= dt;
        if (hazard.wait <= 0) {
          hazard.fired = true;
          for (const actor of [this.player, ...(this.buddy ? [this.buddy] : [])]) {
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
              this.shots.push({ id: ++this.serial, x: hazard.x, y: hazard.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: hazard.payload === "ghost" ? 3.2 : 2.5, damage: 1, ally: false, color: "#ff94ac", splash: 0, radius: 8, kind: hazard.payload === "ghost" ? "ghost" : "water", age: 0 });
            }
          }
        }
      } else hazard.life -= dt;
    }
    this.hazards = this.hazards.filter(hazard => !hazard.fired || hazard.life > 0);
  }
  private actorById(id: number | undefined): Actor | undefined {
    return this.player.id === id ? this.player : this.buddy && this.buddy.id === id ? this.buddy : undefined;
  }
  private beginReturn(shot: Shot): void {
    shot.returning = true;
    shot.hits = [];
    const actor = this.actorById(shot.source);
    shot.pierce = actor && this.has(actor, "water-pierce") ? 5 : 2;
  }
  private updateShots(dt: number): void {
    for (const shot of this.shots) {
      const before = { x: shot.x, y: shot.y };
      shot.age = (shot.age ?? 0) + dt;
      shot.life -= dt;
      if (shot.kind === "metal") {
        const origin = shot.from!;
        const front = Math.hypot(shot.vx, shot.vy) * shot.age;
        const previous = Math.max(0, front - Math.hypot(shot.vx, shot.vy) * dt);
        const aim = Math.atan2(shot.vy, shot.vx);
        shot.x = origin.x + Math.cos(aim) * front;
        shot.y = origin.y + Math.sin(aim) * front;
        for (const enemy of this.enemies) {
          if (enemy.hp <= 0 || shot.hits!.includes(enemy.id)) continue;
          const gap = distance(origin, enemy);
          const angle = Math.atan2(enemy.y - origin.y, enemy.x - origin.x) - aim;
          const spread = (shot.spread ?? 0.58) + Math.asin(Math.min(1, enemy.radius / Math.max(1, gap)));
          if (gap > front + enemy.radius || gap < previous - enemy.radius || Math.cos(angle) < Math.cos(spread) || this.blocked(origin, enemy)) continue;
          shot.hits!.push(enemy.id);
          this.hitEnemy(enemy, shot.damage, origin);
          if (enemy.hp > 0 && enemy.kind !== "boss") {
            const push = unit(enemy.x - origin.x, enemy.y - origin.y);
            this.move(enemy, push.x * 32, push.y * 32, enemy.radius);
          }
        }
        continue;
      }
      if (shot.kind === "fire") {
        const progress = Math.min(1, shot.age / shot.duration!);
        shot.x = shot.from!.x + (shot.to!.x - shot.from!.x) * progress;
        shot.y = shot.from!.y + (shot.to!.y - shot.from!.y) * progress;
        if (progress >= 1) {
          for (const enemy of this.enemies) {
            if (enemy.hp > 0 && distance(shot, enemy) < shot.splash + enemy.radius && !this.blocked(shot, enemy)) this.hitEnemy(enemy, shot.damage, shot, true);
          }
          this.makeFlame(shot, shot.splash, shot.damage * 0.14, shot.source!);
          this.effect(shot, shot.color, shot.splash, "fire");
          shot.life = 0;
        }
        continue;
      }
      if (shot.kind === "ghost") {
        const targets = shot.ally ? this.enemies : [this.player, ...(this.buddy ? [this.buddy] : [])];
        const target = targets.find(actor => actor.id === shot.target && actor.hp > 0) ??
          targets.filter(actor => actor.hp > 0 && distance(shot, actor) < 500).sort((a, b) => distance(shot, a) - distance(shot, b))[0];
        if (target) {
          shot.target = target.id;
          const aim = unit(target.x - shot.x, target.y - shot.y);
          const turn = Math.min(1, dt * 7);
          const speed = shot.ally ? 220 : 130 * this.challenge.bossProjectileSpeed;
          const heading = unit(shot.vx * (1 - turn) + aim.x * speed * turn, shot.vy * (1 - turn) + aim.y * speed * turn);
          shot.vx = heading.x * speed; shot.vy = heading.y * speed;
        }
      }
      if (shot.kind === "water" && shot.boomerang) {
        if (!shot.returning && shot.age >= (shot.returnAt ?? 0.65)) this.beginReturn(shot);
        if (shot.returning) {
          const owner = this.actorById(shot.source);
          if (owner) {
            const heading = unit(owner.x - shot.x, owner.y - shot.y);
            shot.vx = heading.x * 630; shot.vy = heading.y * 630;
            if (distance(owner, shot) < 22) { shot.life = 0; continue; }
          }
        }
      }
      shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      if (shot.kind !== "ghost" && this.blocked(before, shot, shot.radius)) { shot.life = 0; continue; }
      if (shot.ally) {
        for (const enemy of this.enemies) {
          if (enemy.hp <= 0 || shot.hits?.includes(enemy.id) || segmentDistance(enemy, before, shot) > enemy.radius + shot.radius) continue;
          this.hitEnemy(enemy, shot.damage, before, shot.kind === "ghost");
          (shot.hits ??= []).push(enemy.id);
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
            if (shot.boomerang && !shot.returning) { this.beginReturn(shot); break; }
          }
          shot.life = 0; break;
        }
      } else {
        for (const actor of [this.player, ...(this.buddy ? [this.buddy] : [])]) {
          if (actor.hp > 0 && segmentDistance(actor, before, shot) < actor.radius + shot.radius) { this.hurtActor(actor, shot.damage); shot.life = 0; break; }
        }
      }
    }
    this.shots = this.shots.filter(shot => shot.life > 0 && shot.x > -20 && shot.x < WIDTH + 20 && shot.y > -20 && shot.y < HEIGHT + 20);
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
  }
  private makeFlame(point: Point, radius: number, damage: number, source: number): void {
    const owner = this.actorById(source);
    const duration = owner && this.has(owner, "fire-long") ? 4.8 : 2.8;
    const nearby = this.flames.find(flame => flame.source === source && distance(point, flame) < Math.min(radius, flame.radius) * 0.6);
    if (nearby) { nearby.life = duration; nearby.duration = duration; nearby.radius = Math.max(nearby.radius, radius); nearby.damage = Math.max(nearby.damage, damage); return; }
    this.flames.push({ id: ++this.serial, x: point.x, y: point.y, radius, life: duration, duration, tick: 0.4, damage, source });
    if (this.flames.length > 14) this.flames.shift();
  }
  private updateFlames(dt: number): void {
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
    this.flames = this.flames.filter(flame => flame.life > 0);
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
  }
  private hitEnemy(enemy: Enemy, damage: number, source?: Point, bypassShield = false): void {
    if (enemy.hp <= 0) return;
    if (enemy.kind === "guard" && (enemy.guardBroken ?? 0) <= 0 && source && !bypassShield) {
      const toSource = Math.atan2(source.y - enemy.y, source.x - enemy.x);
      if (Math.cos(toSource - (enemy.facing ?? 0)) > 0.25) {
        damage *= 0.2;
        this.effect(enemy, "#b7edff", 32, "block"); this.emit("block");
      }
    }
    enemy.hp = Math.max(0, enemy.hp - damage);
    if (damage >= 0.5) enemy.hurt = 0.12;
    this.hits++;
    if (enemy.hp > 0) return;
    this.effect(enemy, "#ffe49a", 44);
    if (enemy.kind === "boss") {
      this.phase = "won"; this.hazards = []; this.emit("won"); return;
    }
    if (enemy.kind === "dummy") return;
    this.defeated++;
    this.pickups.push({ id: ++this.serial, x: enemy.x, y: enemy.y, life: 28, kind: this.random() < this.challenge.healthDropChance ? "health" : "energy" });
  }
  private hurtActor(actor: Actor, damage: number): void {
    if (actor.hp <= 0 || actor.hurt > 0 || actor.shield > 0 || this.phase !== "playing") return;
    actor.hp = Math.max(0, actor.hp - damage);
    actor.hurt = this.challenge.hurtGrace;
    this.effect(actor, "#ff937d", 42);
    if (actor !== this.player) return;
    this.emit("hurt");
    if (actor.hp > 0) return;
    if (this.buddy && this.buddy.hp > 0 && !this.rescueUsed) {
      this.rescueUsed = true;
      actor.hp = Math.ceil(actor.maxHp * 0.5); actor.shield = 4;
      this.announce("Buddy rescue! Back in the battle.");
      this.effect(actor, "#a4f4d0", 100, "heal"); this.emit("rescue");
    } else { this.phase = "lost"; this.emit("lost"); }
  }
  private collect(dt: number): void {
    for (const pickup of this.pickups) {
      pickup.life -= dt;
      if (pickup.kind === "health" && this.player.hp === this.player.maxHp) continue;
      const gap = distance(pickup, this.player);
      if (gap < 90) { const direction = unit(this.player.x - pickup.x, this.player.y - pickup.y); pickup.x += direction.x * 180 * dt; pickup.y += direction.y * 180 * dt; }
      if (distance(pickup, this.player) < 27) {
        if (pickup.kind === "health") { this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2); this.effect(this.player, "#a4f4d0", 60, "heal"); }
        else this.player.energy = Math.min(100, this.player.energy + 24);
        pickup.life = 0; this.emit("pickup");
      }
    }
    this.pickups = this.pickups.filter(pickup => pickup.life > 0).slice(-28);
  }
}

// Export a small public surface for deterministic headless verification.
export { HEROES, COVER, WIDTH, HEIGHT, RADIUS } from "./data";
export { walkable };
