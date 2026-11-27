import { HEIGHT, RADIUS, WIDTH, hero, type ArtId, type HeroId, type Point } from "./data";
import { blocked, clamp, distance, move, navigate, segmentDistance, unit, walkable } from "./physics";

export type Phase = "practice" | "playing" | "paused" | "won" | "lost";
export interface Options { character: HeroId; buddy: HeroId | null; difficulty: "relaxed" | "standard"; practice?: boolean; seed?: number }
export interface Actor extends Point {
  id: number; art: ArtId; hp: number; maxHp: number; radius: number;
  cooldown: number; hurt: number; shield: number; energy: number; revive: number;
}
export interface Enemy extends Actor { kind: "chaser" | "shooter" | "boss" | "dummy"; timer: number; turn: number }
export interface Shot extends Point { id: number; vx: number; vy: number; life: number; damage: number; ally: boolean; color: string; splash: number; radius: number }
export interface Pickup extends Point { id: number; kind: "energy" | "health"; life: number }
export interface Effect extends Point { color: string; radius: number; life: number; duration: number; kind: "burst" | "ring" | "heal" }
export interface Hazard extends Point { end: Point; kind: "line" | "circle"; radius: number; wait: number; duration: number; fired: boolean; life: number }
export type GameEvent = "attack" | "hurt" | "pickup" | "special" | "boss" | "won" | "lost" | "rescue";

export class ArenaGame {
  readonly options: Options;
  phase: Phase;
  player: Actor;
  buddy: Actor | null;
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  pickups: Pickup[] = [];
  effects: Effect[] = [];
  hazards: Hazard[] = [];
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

  constructor(options: Options) {
    this.options = { ...options };
    this.randomState = options.seed ?? Math.floor(Math.random() * 2147483646) + 1;
    this.player = this.makeActor(options.character, 500, 485);
    this.buddy = options.buddy ? this.makeActor(options.buddy, 575, 485) : null;
    this.phase = options.practice ? "practice" : "playing";
    if (options.practice) this.enemies.push(this.makeEnemy("dummy", 510, 330));
    else this.announce("Round 1 - find your rhythm!");
  }

  private random(): number {
    this.randomState = Math.imul(this.randomState, 1664525) + 1013904223 | 0;
    return (this.randomState >>> 0) / 4294967296;
  }
  private makeActor(id: HeroId, x: number, y: number): Actor {
    const spec = hero(id);
    return { id: ++this.serial, art: id, x, y, hp: spec.hp, maxHp: spec.hp, radius: RADIUS, cooldown: 0, hurt: 0, shield: 0, energy: 25, revive: 0 };
  }
  private makeEnemy(kind: Enemy["kind"], x: number, y: number): Enemy {
    const hp = kind === "boss" ? (this.options.difficulty === "relaxed" ? 1300 : 1700) : kind === "shooter" ? 22 : kind === "dummy" ? 24 : 16;
    return { id: ++this.serial, art: kind === "boss" ? "machamp" : kind === "shooter" ? "spewpa" : "machoke", kind,
      x, y, hp, maxHp: hp, radius: kind === "boss" ? 30 : 17, cooldown: 0, hurt: 0, shield: 0, energy: 0, revive: 0, timer: 1.5, turn: 0 };
  }
  private emit(event: GameEvent): void { if (this.events.length < 40) this.events.push(event); }
  private terminal(): boolean { return this.phase === "won" || this.phase === "lost"; }
  private announce(text: string): void { this.announcement = text; this.announcementTime = 4; }
  private effect(point: Point, color: string, radius = 65, kind: Effect["kind"] = "burst"): void {
    this.effects.push({ ...point, color, radius, kind, life: 0.65, duration: 0.65 });
  }
  get boss(): Enemy | undefined { return this.enemies.find(enemy => enemy.kind === "boss" && enemy.hp > 0); }
  get stage(): string {
    if (this.phase === "practice" || this.phase === "paused" && this.beforePause === "practice") return "PRACTICE";
    return this.bossArrived ? "BOSS BATTLE" : this.elapsed < 45 ? "ROUND 1" : "ROUND 2";
  }
  pause(): void {
    if (this.phase === "practice" || this.phase === "playing") { this.beforePause = this.phase; this.phase = "paused"; }
  }
  resume(): void { if (this.phase === "paused") this.phase = this.beforePause; }
  finishPractice(): void {
    if (this.phase !== "practice") return;
    this.phase = "playing";
    this.enemies = []; this.shots = []; this.effects = []; this.pickups = [];
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
    this.announcementTime = Math.max(0, this.announcementTime - dt);
    this.effects = this.effects.filter(effect => (effect.life -= dt) > 0);
    for (const actor of [this.player, ...(this.buddy ? [this.buddy] : []), ...this.enemies]) {
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

  private updateEncounters(dt: number): void {
    if (!this.bossArrived && this.elapsed >= 90) {
      this.bossArrived = true;
      this.enemies = [this.makeEnemy("boss", 500, 148)];
      this.shots = this.shots.filter(shot => shot.ally);
      this.targetOwner.clear(); this.targetId = null;
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
    const sites = [{ x: 85, y: 100 }, { x: 500, y: 65 }, { x: 915, y: 110 }, { x: 85, y: 510 }, { x: 915, y: 510 }]
      .filter(point => distance(point, this.player) > 220);
    const point = sites[Math.floor(this.random() * sites.length)] ?? { x: 500, y: 65 };
    this.enemies.push(this.makeEnemy(this.elapsed >= 45 && this.random() > 0.45 ? "shooter" : "chaser", point.x, point.y));
  }
  private attack(actor: Actor, companion: boolean): void {
    if (actor.hp <= 0) return;
    const spec = hero(actor.art as HeroId);
    const eligible = (enemy: Enemy): boolean => enemy.hp > 0 && distance(actor, enemy) <= spec.range && !blocked(actor, enemy);
    let target = this.enemies.find(enemy => enemy.id === this.targetOwner.get(actor.id) && eligible(enemy));
    if (!target) target = this.enemies.filter(eligible).sort((a, b) => distance(actor, a) - distance(actor, b))[0];
    if (!companion) this.targetId = target?.id ?? null;
    if (!target) { this.targetOwner.delete(actor.id); return; }
    this.targetOwner.set(actor.id, target.id);
    if (actor.energy >= 100) this.special(actor, companion, target);
    if (actor.cooldown > 0 || target.hp <= 0) return;
    actor.cooldown = spec.interval * (companion ? 1.3 : 1);
    const vector = unit(target.x - actor.x, target.y - actor.y);
    this.shots.push({ id: ++this.serial, x: actor.x, y: actor.y, vx: vector.x * 490, vy: vector.y * 490, life: spec.range / 490 + 0.1,
      damage: spec.damage * (companion ? 0.5 : 1), color: spec.color, ally: true, splash: actor.art === "darmanitan" ? 48 : 0, radius: 6 });
    if (!companion) this.emit("attack");
  }
  private special(actor: Actor, companion: boolean, target: Enemy): void {
    const spec = hero(actor.art as HeroId);
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
        this.shots.push({ id: ++this.serial, x: actor.x, y: actor.y, vx: Math.cos(angle) * 560, vy: Math.sin(angle) * 560,
          life: 0.72, damage: 25 * power, color: spec.color, ally: true, splash: 0, radius: 8 });
      }
    } else for (const enemy of this.enemies.slice()) {
      if (enemy.hp > 0 && distance(center, enemy) <= radius && !blocked(center, enemy)) this.hitEnemy(enemy, 44 * power);
    }
    this.effect(center, spec.color, actor.art === "greninja" ? 70 : radius, "ring");
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
      const vector = navigate(buddy, goal, RADIUS);
      move(buddy, vector.x * 185 * dt, vector.y * 185 * dt, RADIUS);
    }
    if (!practice) this.attack(buddy, true);
  }
  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      const targets = [this.player, ...(this.buddy && this.buddy.hp > 0 ? [this.buddy] : [])];
      const target = targets.sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
      enemy.timer -= dt;
      if (enemy.kind === "boss") {
        if (enemy.timer <= 0 && !this.hazards.some(hazard => !hazard.fired)) {
          const direction = unit(this.player.x - enemy.x, this.player.y - enemy.y);
          const wait = this.options.difficulty === "relaxed" ? 1.9 : 1.5;
          this.hazards.push({ x: enemy.x, y: enemy.y, end: { x: enemy.x + direction.x * 470, y: enemy.y + direction.y * 470 },
            kind: enemy.turn++ % 2 === 0 ? "line" : "circle", radius: enemy.turn % 2 === 1 ? 38 : 155, wait, duration: wait, life: 0.5, fired: false });
          enemy.timer = wait + 3.2;
        }
        if (!this.hazards.some(hazard => !hazard.fired) && distance(enemy, this.player) > 205) {
          const direction = navigate(enemy, this.player, enemy.radius);
          move(enemy, direction.x * dt * 48, direction.y * dt * 48, enemy.radius);
        }
      } else if (enemy.kind === "chaser") {
        const direction = navigate(enemy, target, enemy.radius);
        move(enemy, direction.x * dt * (this.options.difficulty === "relaxed" ? 61 : 82), direction.y * dt * (this.options.difficulty === "relaxed" ? 61 : 82), enemy.radius);
      } else if (enemy.kind === "shooter" && enemy.timer <= 0) {
        enemy.timer = this.options.difficulty === "relaxed" ? 3.3 : 2.5;
        const direction = unit(target.x - enemy.x, target.y - enemy.y);
        this.shots.push({ id: ++this.serial, x: enemy.x, y: enemy.y, vx: direction.x * 125, vy: direction.y * 125,
          life: 7, damage: 1, ally: false, color: "#ff937d", splash: 0, radius: 9 });
      }
      for (const actor of targets) {
        if (distance(enemy, actor) < enemy.radius + actor.radius + 2) this.hurtActor(actor, 1);
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
        }
      } else hazard.life -= dt;
    }
    this.hazards = this.hazards.filter(hazard => !hazard.fired || hazard.life > 0);
  }
  private updateShots(dt: number): void {
    for (const shot of this.shots) {
      const before = { x: shot.x, y: shot.y };
      shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
      if (blocked(before, shot, shot.radius)) { shot.life = 0; continue; }
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
          shot.life = 0; break;
        }
      } else {
        for (const actor of [this.player, ...(this.buddy ? [this.buddy] : [])]) {
          if (actor.hp > 0 && segmentDistance(actor, before, shot) < actor.radius + shot.radius) { this.hurtActor(actor, shot.damage); shot.life = 0; break; }
        }
      }
    }
    this.shots = this.shots.filter(shot => shot.life > 0 && shot.x > 0 && shot.x < WIDTH && shot.y > 0 && shot.y < HEIGHT);
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
  }
  private hitEnemy(enemy: Enemy, damage: number): void {
    if (enemy.hp <= 0) return;
    enemy.hp = Math.max(0, enemy.hp - damage); enemy.hurt = 0.12;
    this.hits++;
    if (enemy.hp > 0) return;
    this.effect(enemy, "#ffe49a", 44);
    if (enemy.kind === "boss") {
      this.phase = "won"; this.hazards = []; this.emit("won"); return;
    }
    if (enemy.kind === "dummy") return;
    this.defeated++;
    this.pickups.push({ id: ++this.serial, x: enemy.x, y: enemy.y, life: 28, kind: this.random() < 0.22 ? "health" : "energy" });
  }
  private hurtActor(actor: Actor, damage: number): void {
    if (actor.hp <= 0 || actor.hurt > 0 || actor.shield > 0 || this.phase !== "playing") return;
    actor.hp = Math.max(0, actor.hp - damage);
    actor.hurt = 1.2;
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
