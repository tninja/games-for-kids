import { COVER, HEIGHT, WIDTH, hero, type ArtId } from "./data";
import { type Actor, type ArenaGame, type Enemy } from "./game";
import { Artwork } from "./artwork";

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
}
function star(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points = 4): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / points;
    const r = i % 2 ? radius * 0.38 : radius;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
}

export class ArenaRenderer {
  private ctx: CanvasRenderingContext2D;
  private cssWidth = 1000;
  private cssHeight = 620;
  private dpr = 1;
  readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  constructor(readonly canvas: HTMLCanvasElement, readonly art: Artwork) {
    this.ctx = canvas.getContext("2d")!;
  }
  resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    this.cssWidth = Math.max(1, bounds.width);
    this.cssHeight = Math.max(1, bounds.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.cssWidth * this.dpr);
    this.canvas.height = Math.round(this.cssHeight * this.dpr);
  }
  draw(game: ArenaGame, time: number): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    ctx.fillStyle = "#132c31"; ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
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
        circle(ctx, hazard.x, hazard.y, hazard.radius); ctx.fill(); ctx.stroke();
        ctx.setLineDash([]); circle(ctx, hazard.x, hazard.y, hazard.radius * progress); ctx.stroke();
      } else {
        const angle = Math.atan2(hazard.end.y - hazard.y, hazard.end.x - hazard.x);
        const length = Math.hypot(hazard.end.x - hazard.x, hazard.end.y - hazard.y);
        ctx.translate(hazard.x, hazard.y); ctx.rotate(angle);
        rounded(ctx, 0, -hazard.radius, length, hazard.radius * 2, 10); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 0.65; ctx.fillStyle = "#ffb896";
        ctx.fillRect(0, -hazard.radius + 5, length * progress, 7);
      }
      ctx.restore();
    }
    for (const item of game.pickups) {
      ctx.save();
      ctx.translate(item.x, item.y + (this.reducedMotion ? 0 : Math.sin(time * 3 + item.id) * 3));
      ctx.shadowColor = item.kind === "health" ? "#b3ffce" : "#ffe49a";
      ctx.shadowBlur = 12; ctx.fillStyle = item.kind === "health" ? "#c4ffcb" : "#ffe49a";
      if (item.kind === "health") {
        rounded(ctx, -7, -13, 14, 26, 3); ctx.fill(); rounded(ctx, -13, -7, 26, 14, 3); ctx.fill();
      } else { star(ctx, 0, 0, 14); ctx.fill(); }
      ctx.restore();
    }
    if (game.stage === "PRACTICE") {
      ctx.save();
      ctx.strokeStyle = "#fff2b2"; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
      circle(ctx, 365, 485, 40); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#ffe49a"; star(ctx, 365, 485, 20); ctx.fill();
      ctx.restore();
    }
    const actors: (Actor | Enemy)[] = [game.player, ...(game.buddy ? [game.buddy] : []), ...game.enemies];
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) {
      this.actor(actor, actor === game.player ? "player" : actor === game.buddy ? "buddy" : "enemy", time, actor.id === game.targetId);
    }
    for (const shot of game.shots) {
      ctx.save();
      ctx.lineWidth = shot.radius * 1.3; ctx.lineCap = "round"; ctx.strokeStyle = shot.color + "88";
      ctx.beginPath(); ctx.moveTo(shot.x - shot.vx * 0.035, shot.y - shot.vy * 0.035); ctx.lineTo(shot.x, shot.y); ctx.stroke();
      ctx.fillStyle = shot.color; ctx.shadowColor = shot.color; ctx.shadowBlur = 10;
      circle(ctx, shot.x, shot.y, shot.radius); ctx.fill();
      ctx.strokeStyle = "#fff9df"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    for (const effect of game.effects) {
      const progress = 1 - effect.life / effect.duration;
      ctx.save(); ctx.globalAlpha = (1 - progress) * 0.8; ctx.strokeStyle = effect.color; ctx.fillStyle = effect.color;
      ctx.lineWidth = effect.kind === "ring" ? 9 * (1 - progress) + 2 : 3;
      circle(ctx, effect.x, effect.y, effect.radius * (0.25 + progress * 0.75)); ctx.stroke();
      if (!this.reducedMotion) {
        for (let i = 0; i < 8; i++) {
          const angle = i * Math.PI / 4 + progress;
          star(ctx, effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 7 * (1 - progress)); ctx.fill();
        }
      }
      ctx.restore();
    }
    if (game.phase === "won") {
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = ["#ffe49a", "#a4f4d0", "#c6a0ff", "#ff9c78"][i % 4];
        star(ctx, 40 + i * 33 % 920, 30 + (i * 83 + (this.reducedMotion ? 0 : time * 30)) % 550, 6 + i % 5); ctx.fill();
      }
    }
    ctx.restore();
  }
  private field(time: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#305947"; rounded(ctx, 8, 8, WIDTH - 16, HEIGHT - 16, 35); ctx.fill();
    ctx.fillStyle = "#42795a"; rounded(ctx, 22, 22, WIDTH - 44, HEIGHT - 44, 26); ctx.fill();
    for (let row = 0; row < 10; row++) for (let col = 0; col < 16; col++) {
      ctx.fillStyle = (row + col) % 2 ? "#ffffff04" : "#102c2408";
      ctx.fillRect(24 + col * 60, 25 + row * 57, 60, 57);
    }
    ctx.strokeStyle = "#c8e2af44"; ctx.lineWidth = 2;
    rounded(ctx, 55, 55, WIDTH - 110, HEIGHT - 110, 24); ctx.stroke();
    circle(ctx, 500, 310, 115); ctx.stroke();
    circle(ctx, 500, 310, 94); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(386, 310); ctx.lineTo(614, 310); ctx.stroke();
    ctx.fillStyle = "#42795a"; circle(ctx, 500, 310, 27); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d9e7a52b"; star(ctx, 500, 310, 15); ctx.fill();
    for (const [x, y] of [[65, 38], [920, 36], [62, 570], [930, 572]]) {
      ctx.fillStyle = "#244b3d"; circle(ctx, x, y, 28); ctx.fill();
      ctx.fillStyle = "#638e63"; circle(ctx, x - 8, y - 8, 19); ctx.fill(); circle(ctx, x + 11, y - 1, 16); ctx.fill();
      ctx.fillStyle = "#ffd479"; circle(ctx, x + 3, y - 12, 3); ctx.fill();
    }
    for (const rect of COVER) {
      ctx.fillStyle = "#142c3144"; rounded(ctx, rect.x + 6, rect.y + 9, rect.w, rect.h, 13); ctx.fill();
      ctx.fillStyle = "#78988a"; rounded(ctx, rect.x, rect.y - 8, rect.w, rect.h + 8, 12); ctx.fill();
      ctx.fillStyle = "#b0bda0"; rounded(ctx, rect.x + 3, rect.y - 9, rect.w - 6, rect.h - 5, 10); ctx.fill();
      ctx.strokeStyle = "#dbe1b2"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#8ca586";
      for (let i = 0; i < 3; i++) { rounded(ctx, rect.x + 12 + i * 30, rect.y + 3, 25, 22, 5); ctx.fill(); }
      ctx.fillStyle = "#c2db9c"; circle(ctx, rect.x + 12, rect.y + rect.h - 3, 9); ctx.fill();
    }
    if (!this.reducedMotion) {
      ctx.fillStyle = "#f2eaaa88";
      for (let i = 0; i < 8; i++) { circle(ctx, (i * 137 + time * 7) % 940 + 30, 50 + (i * 79) % 520, 1.6); ctx.fill(); }
    }
  }
  private actor(actor: Actor | Enemy, role: "player" | "buddy" | "enemy", time: number, targeted: boolean): void {
    const ctx = this.ctx;
    const boss = actor.art === "machamp";
    const color = role === "enemy" ? "#ffb496" : hero(actor.art as "steelix").color;
    const width = boss ? 130 : role === "enemy" ? 67 : actor.art === "steelix" ? 108 : 92;
    const height = width * 0.66;
    const bob = this.reducedMotion || actor.hp <= 0 ? 0 : Math.sin(time * 4 + actor.id) * 2;
    ctx.save();
    if (actor.hp <= 0) ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#0d25284d";
    ctx.beginPath(); ctx.ellipse(actor.x, actor.y + 3, width * 0.41, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = role === "buddy" ? "#e5fbff" : color; ctx.lineWidth = role === "enemy" ? 2 : 3;
    if (role === "buddy") ctx.setLineDash([5, 4]);
    circle(ctx, actor.x, actor.y, actor.radius + 3); ctx.stroke(); ctx.setLineDash([]);
    if (targeted) {
      ctx.strokeStyle = "#fff6b1"; ctx.lineWidth = 3; ctx.setLineDash([9, 5]);
      circle(ctx, actor.x, actor.y, actor.radius + 10); ctx.stroke(); ctx.setLineDash([]);
    }
    const top = actor.y - height - 16 + bob;
    ctx.save();
    rounded(ctx, actor.x - width / 2, top, width, height, 12); ctx.clip();
    this.art.paint(ctx, actor.art, actor.x - width / 2, top, width, height);
    if (actor.hurt > 0 && Math.floor(actor.hurt * 16) % 2) { ctx.fillStyle = "#fff4e66b"; ctx.fillRect(actor.x - width / 2, top, width, height); }
    ctx.restore();
    ctx.strokeStyle = color; ctx.lineWidth = role === "player" ? 4 : 2;
    rounded(ctx, actor.x - width / 2, top, width, height, 12); ctx.stroke();
    if (actor.shield > 0) {
      ctx.fillStyle = actor.art === "duskull" ? "#c6a0ff28" : "#fff1b425";
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(actor.x, top + height / 2, width * 0.64, height * 0.72, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    if (role === "player") {
      ctx.fillStyle = "#fff5c3"; star(ctx, actor.x, top - 12, 9); ctx.fill();
    } else if (role === "buddy") {
      ctx.fillStyle = "#c7f8e0"; circle(ctx, actor.x, top - 9, 5); ctx.fill();
      if (actor.hp <= 0) {
        ctx.strokeStyle = "#a4f4d0"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(actor.x, actor.y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * actor.revive / 1.5); ctx.stroke();
      }
    }
    if (!boss && role !== "player" && actor.hp > 0 && actor.hp < actor.maxHp) {
      ctx.fillStyle = "#182c39"; rounded(ctx, actor.x - 24, top - 10, 48, 5, 2); ctx.fill();
      ctx.fillStyle = role === "buddy" ? "#a4f4d0" : "#ffb496";
      rounded(ctx, actor.x - 24, top - 10, 48 * actor.hp / actor.maxHp, 5, 2); ctx.fill();
    }
    ctx.restore();
  }
  portrait(canvas: HTMLCanvasElement, id: ArtId): void {
    const ctx = canvas.getContext("2d")!;
    this.art.paint(ctx, id, 0, 0, canvas.width, canvas.height);
  }
}
