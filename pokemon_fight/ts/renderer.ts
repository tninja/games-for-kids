import { HEIGHT, WIDTH, hero, type ArtId } from "./data";
import { type Actor, type ArenaGame, type Enemy } from "./game";
import { Artwork } from "./artwork";
import { arenaView, type ArenaView } from "./view";
import { clamp } from "./physics";

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
  private camera: { x: number; y: number } | undefined;
  private previousTime = 0;
  private portraitScale = 1;
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
    this.camera = undefined;
  }
  draw(game: ArenaGame, time: number): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    ctx.fillStyle = game.level.colors.edge; ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
    const closeup = window.matchMedia("(pointer: coarse)").matches || this.cssWidth < 700;
    const target = game.enemies.find(enemy => enemy.id === game.targetId && enemy.hp > 0);
    const view = arenaView(this.cssWidth, this.cssHeight, game.player, target, closeup);
    if (view.closeup && this.camera && !this.reducedMotion) {
      const blend = 1 - Math.exp(-Math.min(0.1, Math.max(0, time - this.previousTime)) * 10);
      view.x = this.camera.x + (view.x - this.camera.x) * blend;
      view.y = this.camera.y + (view.y - this.camera.y) * blend;
    }
    this.previousTime = time; this.camera = { x: view.x, y: view.y };
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
      ctx.fillStyle = "#ffab4e32"; ctx.strokeStyle = "#b8f2d2"; ctx.lineWidth = 2;
      circle(ctx, flame.x, flame.y, flame.radius); ctx.fill();
      ctx.setLineDash([5, 10]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#b8f2d2"; star(ctx, flame.x, flame.y, 11); ctx.fill();
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
      ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.rotate(angle);
      const length = Math.hypot(end.x - enemy.x, end.y - enemy.y);
      ctx.fillStyle = "#ffad4a33"; ctx.strokeStyle = "#ffe0a4"; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      rounded(ctx, 0, -20, Math.max(12, length), 40, 8); ctx.fill(); ctx.stroke(); ctx.restore();
    }
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
      if (shot.kind === "metal") {
        const radius = Math.max(2, Math.hypot(shot.x - shot.from!.x, shot.y - shot.from!.y));
        const angle = Math.atan2(shot.vy, shot.vx);
        const spread = shot.spread ?? 0.58;
        ctx.translate(shot.from!.x, shot.from!.y); ctx.rotate(angle);
        ctx.strokeStyle = "#ffe6a3"; ctx.fillStyle = "#ffd56a60"; ctx.lineWidth = 5; ctx.shadowColor = "#ffd56a"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(0, 0, radius, -spread, spread); ctx.arc(0, 0, Math.max(1, radius - 24), spread, -spread, true); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, radius, -spread, spread); ctx.stroke();
        ctx.restore(); continue;
      }
      if (shot.kind === "fire") {
        const progress = Math.min(1, (shot.age ?? 0) / shot.duration!);
        const lift = Math.sin(progress * Math.PI) * 85;
        ctx.strokeStyle = "#b8f2d299"; ctx.lineWidth = 2; ctx.setLineDash([5, 7]);
        circle(ctx, shot.to!.x, shot.to!.y, shot.splash * 0.65); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#132c3144"; ctx.beginPath(); ctx.ellipse(shot.x, shot.y + 2, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = "#ff9c50"; ctx.shadowBlur = 18;
        this.flame(shot.x, shot.y - lift, 19, "#ff934d");
        ctx.restore(); continue;
      }
      if (shot.kind === "ghost") {
        for (let i = 2; i > 0; i--) {
          ctx.globalAlpha = 0.25 / i;
          circle(ctx, shot.x - shot.vx * i * 0.065, shot.y - shot.vy * i * 0.065 + Math.sin((shot.age ?? 0) * 14 + i) * 5, 9 - i * 2);
          ctx.fillStyle = shot.ally ? "#c6a0ff" : "#ff9abb"; ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowColor = "#c6a0ff"; ctx.shadowBlur = 15;
        this.flame(shot.x, shot.y, 15, shot.ally ? "#bda0ff" : "#ff8faf");
        ctx.fillStyle = "#273044"; circle(ctx, shot.x - 3, shot.y, 1.7); ctx.fill(); circle(ctx, shot.x + 3, shot.y, 1.7); ctx.fill();
        ctx.restore(); continue;
      }
      if (shot.kind === "water") {
        ctx.strokeStyle = "#71dbff55"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(shot.x - shot.vx * 0.03, shot.y - shot.vy * 0.03); ctx.lineTo(shot.x, shot.y); ctx.stroke();
        ctx.translate(shot.x, shot.y); ctx.rotate((this.reducedMotion ? 0 : time * 15) * (shot.returning ? -1 : 1));
        ctx.fillStyle = shot.ally ? "#75dcff" : "#ff8c9f"; ctx.strokeStyle = shot.ally ? "#e5ffff" : "#ffe5d6"; ctx.lineWidth = 2;
        star(ctx, 0, 0, 13); ctx.fill(); ctx.stroke(); circle(ctx, 0, 0, 3); ctx.stroke();
        ctx.restore(); continue;
      }
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
      if (effect.kind === "fire") {
        for (let i = 0; i < 10; i++) {
          const angle = i * Math.PI / 5;
          this.flame(effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 16 * (1 - progress) + 3, "#ffac55");
        }
        ctx.restore(); continue;
      }
      if (effect.kind === "haunt") {
        for (let i = 0; i < 3; i++) {
          const angle = i * Math.PI * 2 / 3 + progress * 3;
          this.flame(effect.x + Math.cos(angle) * effect.radius * progress, effect.y + Math.sin(angle) * effect.radius * progress, 12, "#c6a0ff");
        }
        ctx.restore(); continue;
      }
      if (effect.kind === "block") {
        ctx.translate(effect.x, effect.y - 22); ctx.rotate(-0.2 + progress * 0.3);
        ctx.beginPath(); ctx.moveTo(-15, -17); ctx.lineTo(15, -17); ctx.lineTo(15, 4); ctx.lineTo(0, 19); ctx.lineTo(-15, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore(); continue;
      }
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
    if (view.closeup) { this.indicators(game, view); this.goalIndicator(game, view); }
  }
  private flame(x: number, y: number, size: number, color: string): void {
    const ctx = this.ctx;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -size); ctx.bezierCurveTo(size * 0.25, -size * 0.2, size, -size * 0.1, size * 0.65, size * 0.55);
    ctx.bezierCurveTo(size * 0.3, size, -size * 0.8, size * 0.8, -size * 0.65, size * 0.1);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.4, -size * 0.1, -size * 0.3, 0, -size); ctx.fill();
    ctx.fillStyle = "#fff3d1"; circle(ctx, 0, size * 0.25, size * 0.3); ctx.fill(); ctx.restore();
  }
  private indicators(game: ArenaGame, view: ArenaView): void {
    const ctx = this.ctx;
    const targets = [game.boss, game.enemies.find(enemy => enemy.id === game.targetId), game.buddy,
      ...game.enemies.slice().sort((a, b) => Math.hypot(a.x - game.player.x, a.y - game.player.y) - Math.hypot(b.x - game.player.x, b.y - game.player.y))];
    const seen = new Set<number>();
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
      rounded(ctx, px - 23, py - 17, 46, 34, 7); ctx.clip(); this.art.paint(ctx, target.art, px - 23, py - 17, 46, 34); ctx.restore();
      ctx.save(); ctx.strokeStyle = target === game.buddy ? "#b8f2d2" : "#ffe49a"; ctx.lineWidth = 2;
      rounded(ctx, px - 23, py - 17, 46, 34, 7); ctx.stroke();
      ctx.translate(px, py); ctx.rotate(Math.atan2(y - py, x - px));
      ctx.fillStyle = target === game.buddy ? "#b8f2d2" : "#ffe49a";
      ctx.beginPath(); ctx.moveTo(31, 0); ctx.lineTo(24, -5); ctx.lineTo(24, 5); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  private goals(game: ArenaGame, time: number): void {
    const ctx = this.ctx;
    const kind = game.level.goal.kind;
    for (const node of game.goalNodes) {
      if (node.done && kind === "collect") continue;
      ctx.save(); ctx.translate(node.x, node.y);
      ctx.strokeStyle = node.done ? "#b8f2d2" : game.level.colors.accent;
      ctx.fillStyle = node.done ? "#b8f2d222" : "#132c3144"; ctx.lineWidth = 2;
      circle(ctx, 0, 0, 36); ctx.fill(); ctx.stroke();
      if (kind === "rescue") {
        ctx.save(); rounded(ctx, -36, -60, 72, 48, 10); ctx.clip(); this.art.paint(ctx, node.art, -36, -60, 72, 48); ctx.restore();
        ctx.strokeStyle = "#b8f2d2"; rounded(ctx, -36, -60, 72, 48, 10); ctx.stroke();
        ctx.fillStyle = "#b8f2d2"; ctx.font = "bold 23px system-ui"; ctx.textAlign = "center"; ctx.fillText(node.done ? "\u2713" : "\u2661", 0, -69);
      } else if (kind === "collect") {
        ctx.fillStyle = "#9beaff"; ctx.strokeStyle = "#e7ffff";
        ctx.beginPath(); ctx.moveTo(0, -29); ctx.lineTo(18, -6); ctx.lineTo(0, 12); ctx.lineTo(-18, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -29); ctx.lineTo(0, 12); ctx.stroke();
      } else if (kind === "lantern") {
        ctx.fillStyle = "#d8b98e"; rounded(ctx, -17, -45, 34, 43, 6); ctx.fill();
        ctx.fillStyle = "#442f41"; rounded(ctx, -12, -38, 24, 31, 3); ctx.fill();
        if (node.done) this.flame(0, -23, 15, "#ffd56a");
        else { ctx.fillStyle = "#c1b7a2"; star(ctx, 0, -23, 9); ctx.fill(); }
      } else {
        ctx.fillStyle = "#cee9e6"; rounded(ctx, -14, -43, 28, 40, 5); ctx.fill();
        ctx.fillStyle = node.done ? "#fff1a6" : "#78b7c8"; star(ctx, 0, -49, 21, 5); ctx.fill();
        if (node.done) { ctx.globalAlpha = 0.18; ctx.fillStyle = "#fff1a6"; ctx.fillRect(-25, -125, 50, 125); ctx.globalAlpha = 1; }
      }
      if (node.progress > 0 && !node.done) {
        ctx.strokeStyle = "#fff4b0"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + node.progress * Math.PI * 2); ctx.stroke();
      } else if (!node.done && !this.reducedMotion) {
        ctx.globalAlpha = 0.3 + Math.sin(time * 3) * 0.12; ctx.strokeStyle = game.level.colors.accent;
        circle(ctx, 0, 0, 43); ctx.stroke();
      }
      ctx.restore();
    }
  }
  private goalIndicator(game: ArenaGame, view: ArenaView): void {
    if (game.stage === "PRACTICE") return;
    const target = game.goalNodes.filter(node => !node.done).sort((a, b) => Math.hypot(a.x - game.player.x, a.y - game.player.y) - Math.hypot(b.x - game.player.x, b.y - game.player.y))[0];
    if (!target) return;
    const x = this.cssWidth / 2 + (target.x - view.x) * view.scale;
    const y = this.cssHeight / 2 + (target.y - view.y) * view.scale;
    if (x >= 35 && x <= this.cssWidth - 35 && y >= 60 && y <= this.cssHeight - 35) return;
    const px = clamp(x, 36, this.cssWidth - 36), py = clamp(y, 60, this.cssHeight - 35);
    const ctx = this.ctx;
    ctx.save(); ctx.fillStyle = "#193b40"; ctx.strokeStyle = "#b8f2d2"; ctx.lineWidth = 2;
    circle(ctx, px, py, 19); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#b8f2d2"; ctx.font = "bold 24px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(game.level.goal.kind === "rescue" ? "\u2661" : game.level.goal.kind === "collect" ? "\u25C6" : "\u2736", px, py);
    ctx.translate(px, py); ctx.rotate(Math.atan2(y - py, x - px));
    ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(23, -5); ctx.lineTo(23, 5); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  private scenery(game: ArenaGame, time: number): void {
    const ctx = this.ctx;
    ctx.save();
    if (game.level.theme === "woods") {
      ctx.fillStyle = "#bddbff0a";
      ctx.beginPath(); ctx.moveTo(380, 25); ctx.lineTo(600, 25); ctx.lineTo(740, 590); ctx.lineTo(200, 590); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ead8ff";
      for (let i = 0; i < 12; i++) { circle(ctx, 70 + i * 77 % 880, 70 + (i * 113 + (this.reducedMotion ? 0 : time * 6)) % 470, 2); ctx.fill(); }
    } else if (game.level.theme === "quarry") {
      ctx.strokeStyle = "#353b3e44"; ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) { const x = 100 + i * 125, y = 100 + i * 67 % 430; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 15, y + 20); ctx.lineTo(x + 4, y + 38); ctx.stroke(); }
    } else if (game.level.theme === "ember") {
      ctx.strokeStyle = "#ffb17199"; ctx.lineWidth = 5;
      rounded(ctx, 16, 16, WIDTH - 32, HEIGHT - 32, 30); ctx.stroke();
      for (const [x, y] of [[55, 60], [945, 60], [55, 560], [945, 560]]) this.flame(x, y, 18, "#ffc484");
    } else if (game.level.theme === "sky") {
      ctx.fillStyle = "#efffff22";
      for (let i = 0; i < 9; i++) {
        const x = 30 + i * 119 % 940, y = i % 2 ? 27 : 590;
        ctx.beginPath(); ctx.ellipse(x, y, 55, 21, 0, 0, Math.PI * 2); ctx.fill();
        circle(ctx, x - 20, y - 14, 25); ctx.fill(); circle(ctx, x + 12, y - 17, 20); ctx.fill();
      }
    }
    ctx.restore();
  }
  private field(time: number, game: ArenaGame): void {
    const ctx = this.ctx;
    const palette = game.level.colors;
    ctx.fillStyle = palette.edge; rounded(ctx, 8, 8, WIDTH - 16, HEIGHT - 16, 35); ctx.fill();
    ctx.fillStyle = palette.ground; rounded(ctx, 22, 22, WIDTH - 44, HEIGHT - 44, 26); ctx.fill();
    for (let row = 0; row < 10; row++) for (let col = 0; col < 16; col++) {
      ctx.fillStyle = (row + col) % 2 ? "#ffffff04" : "#102c2408";
      ctx.fillRect(24 + col * 60, 25 + row * 57, 60, 57);
    }
    ctx.strokeStyle = palette.line + "44"; ctx.lineWidth = 2;
    rounded(ctx, 55, 55, WIDTH - 110, HEIGHT - 110, 24); ctx.stroke();
    circle(ctx, 500, 310, 115); ctx.stroke();
    circle(ctx, 500, 310, 94); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(386, 310); ctx.lineTo(614, 310); ctx.stroke();
    ctx.fillStyle = palette.ground; circle(ctx, 500, 310, 27); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d9e7a52b"; star(ctx, 500, 310, 15); ctx.fill();
    for (const [x, y] of [[65, 38], [920, 36], [62, 570], [930, 572]]) {
      ctx.fillStyle = "#244b3d"; circle(ctx, x, y, 28); ctx.fill();
      ctx.fillStyle = palette.leaf; circle(ctx, x - 8, y - 8, 19); ctx.fill(); circle(ctx, x + 11, y - 1, 16); ctx.fill();
      ctx.fillStyle = "#ffd479"; circle(ctx, x + 3, y - 12, 3); ctx.fill();
    }
    for (const rect of game.obstacles) {
      ctx.fillStyle = "#142c3144"; rounded(ctx, rect.x + 6, rect.y + 9, rect.w, rect.h, 13); ctx.fill();
      ctx.fillStyle = "#78988a"; rounded(ctx, rect.x, rect.y - 8, rect.w, rect.h + 8, 12); ctx.fill();
      ctx.fillStyle = palette.stone; rounded(ctx, rect.x + 3, rect.y - 9, rect.w - 6, rect.h - 5, 10); ctx.fill();
      ctx.strokeStyle = "#dbe1b2"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#8ca586";
      for (let i = 0; i < 3; i++) { rounded(ctx, rect.x + 12 + i * 30, rect.y + 3, 25, 22, 5); ctx.fill(); }
      ctx.fillStyle = "#c2db9c"; circle(ctx, rect.x + 12, rect.y + rect.h - 3, 9); ctx.fill();
      if (game.level.theme === "woods") {
        ctx.fillStyle = "#243842"; rounded(ctx, rect.x + rect.w * 0.42, rect.y - 8, rect.w * 0.16, rect.h, 5); ctx.fill();
        ctx.fillStyle = palette.leaf;
        circle(ctx, rect.x + rect.w * 0.32, rect.y + 10, rect.w * 0.38); ctx.fill();
        circle(ctx, rect.x + rect.w * 0.65, rect.y + 2, rect.w * 0.4); ctx.fill();
      } else if (game.level.theme === "quarry") {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i % 2 ? "#b4e8e5" : "#7faec0";
          ctx.beginPath(); ctx.moveTo(rect.x + 15 + i * 22, rect.y + rect.h - 10); ctx.lineTo(rect.x + 27 + i * 22, rect.y - 25 - i * 5); ctx.lineTo(rect.x + 43 + i * 22, rect.y + rect.h - 10); ctx.closePath(); ctx.fill();
        }
      } else if (game.level.theme === "ember") {
        ctx.fillStyle = "#734b4c"; rounded(ctx, rect.x + 10, rect.y + 2, rect.w - 20, rect.h - 22, 6); ctx.fill();
        ctx.strokeStyle = "#ffc488"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rect.x + 15, rect.y + 12); ctx.lineTo(rect.x + rect.w / 2, rect.y + 26); ctx.lineTo(rect.x + rect.w - 15, rect.y + 9); ctx.stroke();
      } else if (game.level.theme === "sky") {
        ctx.fillStyle = "#d6e9df"; rounded(ctx, rect.x + 10, rect.y - 25, rect.w - 20, 22, 5); ctx.fill();
        ctx.fillStyle = "#71c8e7"; ctx.fillRect(rect.x + rect.w / 2 - 10, rect.y - 22, 20, 42);
      }
    }
    this.scenery(game, time);
    if (!this.reducedMotion) {
      ctx.fillStyle = "#f2eaaa88";
      for (let i = 0; i < 8; i++) { circle(ctx, (i * 137 + time * 7) % 940 + 30, 50 + (i * 79) % 520, 1.6); ctx.fill(); }
    }
  }
  private actor(actor: Actor | Enemy, role: "player" | "buddy" | "enemy", time: number, targeted: boolean): void {
    const ctx = this.ctx;
    const boss = role === "enemy" && (actor as Enemy).kind === "boss";
    const enemy = role === "enemy" ? actor as Enemy : undefined;
    const color = role === "enemy" ? enemy?.kind === "guard" ? "#b7edff" : enemy?.kind === "charger" ? "#ffc072" : "#ffb496" : hero(actor.art as "steelix").color;
    const width = (boss ? 130 : role === "enemy" ? 67 : actor.art === "steelix" ? 108 : 92) * this.portraitScale;
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
    if (enemy?.kind === "guard") {
      ctx.strokeStyle = (enemy.guardBroken ?? 0) > 0 ? "#b7edff55" : "#b7edff";
      ctx.lineWidth = 9;
      if ((enemy.guardBroken ?? 0) > 0) ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius + 14, (enemy.facing ?? 0) - 1.3, (enemy.facing ?? 0) + 1.3); ctx.stroke(); ctx.setLineDash([]);
    }
    if ((enemy?.haunt ?? 0) > 0) {
      ctx.strokeStyle = "#c6a0ff"; ctx.lineWidth = 3; ctx.setLineDash([4, 5]);
      circle(ctx, actor.x, actor.y, actor.radius + 8); ctx.stroke(); ctx.setLineDash([]);
      this.flame(actor.x + actor.radius + 8, actor.y - 20, 9, "#c6a0ff");
    }
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
