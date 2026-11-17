import { encodeLoc, Fleet, FleetGroup, makeRng } from "./fleet";
import { BattleshipGame, ComputerPlayer, Player } from "./game";
import { collidePoint, Painter } from "./painter";
import { SoundEffects } from "./sound";
import {
  BoardSize,
  ButtonAction,
  ButtonSpec,
  CanvasContextLike,
  CanvasLike,
  COLORS,
  Coord,
  ENEMY_PANEL,
  FireResult,
  FLEET_LABELS,
  FLEET_NAMES,
  FLEET_SIZES,
  GridMetrics,
  HEIGHT,
  LOG_PANEL,
  MOBILE_ENEMY_PANEL,
  MOBILE_HEIGHT,
  MOBILE_PLAYER_PANEL,
  MOBILE_WIDTH,
  MobileFleetInfo,
  MobileState,
  Particle,
  PendingEvent,
  PLAYER_PANEL,
  Projectile,
  Rect,
  Ripple,
  ROSTER_PANEL,
  WIDTH
} from "./types";

export interface BattleshipAppOptions {
  boardSize?: number;
  seed?: number;
}

export class BattleshipWebApp {
  public readonly canvas: CanvasLike;
  public readonly ctx: CanvasContextLike;
  public readonly painter: Painter;
  public readonly sound: SoundEffects;
  public layoutErrors: string[] = [];
  public readonly baseSeed?: number;
  public gameCount = 0;
  public boardSize: BoardSize;
  public mobileMode = false;
  public hover: Coord = [-1, -1];
  public hoverCell: Coord | null = null;
  public cursor: Coord = [0, 0];
  public statusMessage = "";
  public statusColor: string = COLORS.GREEN;
  public clock = 0;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public ripples: Ripple[] = [];
  public pendingEvents: PendingEvent[] = [];
  public pendingEnemyKeys: Record<string, boolean> = {};
  public pendingPlayerKeys: Record<string, boolean> = {};
  public shakeTime = 0;
  public shakeDuration = 0.35;
  public shakeIntensity = 0;
  public game!: BattleshipGame;

  constructor(canvas: CanvasLike, options: BattleshipAppOptions = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D canvas context is required");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.painter = new Painter(this.ctx);
    this.sound = new SoundEffects();
    this.baseSeed = options.seed;
    this.boardSize = options.boardSize === 10 ? 10 : 7;
    this.startNewGame(this.boardSize);
  }

  private nextSeed(): number | undefined {
    if (this.baseSeed !== undefined) {
      this.gameCount += 1;
      return this.baseSeed + this.gameCount - 1;
    }
    return undefined;
  }

  private clearVisuals(): void {
    this.projectiles = [];
    this.particles = [];
    this.ripples = [];
    this.pendingEvents = [];
    this.pendingEnemyKeys = {};
    this.pendingPlayerKeys = {};
    this.shakeTime = 0;
    this.shakeIntensity = 0;
  }

  private startNewGame(boardSize: BoardSize): void {
    this.clearVisuals();
    this.boardSize = boardSize === 10 ? 10 : 7;
    this.game = new BattleshipGame({
      boardSize: this.boardSize,
      seed: this.nextSeed()
    });
    this.cursor = [0, 0];
    this.hoverCell = null;
    this.statusMessage =
      "Your turn! Aim at Enemy Fleet (" + this.boardSize + "x" + this.boardSize + ").";
    this.statusColor = COLORS.GREEN;
  }

  public setMobileMode(enabled: boolean): void {
    this.mobileMode = Boolean(enabled);
  }

  public playerPanelRect(): Rect {
    return this.mobileMode ? MOBILE_PLAYER_PANEL : PLAYER_PANEL;
  }

  public enemyPanelRect(): Rect {
    return this.mobileMode ? MOBILE_ENEMY_PANEL : ENEMY_PANEL;
  }

  public gridMetrics(panel: Rect): GridMetrics {
    const n = this.boardSize;
    const cellSize = this.mobileMode ? (n === 10 ? 46 : 66) : n === 10 ? 42 : 58;
    const gridPx = n * cellSize;
    const originX = panel.x + Math.round((panel.width - gridPx) / 2) + 12;
    const originY = panel.y + 72;
    return { originX, originY, cellSize, gridPx };
  }

  public playerCellCenter(row: number, col: number): Coord {
    const m = this.gridMetrics(this.playerPanelRect());
    return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
  }

  public enemyCellCenter(row: number, col: number): Coord {
    const m = this.gridMetrics(this.enemyPanelRect());
    return [m.originX + (col + 0.5) * m.cellSize, m.originY + (row + 0.5) * m.cellSize];
  }

  public enemyCellRect(row: number, col: number): Rect {
    const m = this.gridMetrics(this.enemyPanelRect());
    return {
      x: m.originX + col * m.cellSize,
      y: m.originY + row * m.cellSize,
      width: m.cellSize,
      height: m.cellSize
    };
  }

  public enemyCellAtPoint(pt: Coord): Coord | null {
    const m = this.gridMetrics(this.enemyPanelRect());
    const col = Math.floor((pt[0] - m.originX) / m.cellSize);
    const row = Math.floor((pt[1] - m.originY) / m.cellSize);
    if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
      return [row, col];
    }
    return null;
  }

  public isEnemyCellRevealed(row: number, col: number): boolean {
    return (
      Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col]
    );
  }

  public isPlayerCellRevealed(row: number, col: number): boolean {
    return this.game.player.wasHitAt(row, col) && !this.pendingPlayerKeys[row + "," + col];
  }

  private spawnImpact(center: Coord, kind: "hit" | "miss" | "sunk"): void {
    const isHit = kind === "hit" || kind === "sunk";
    const ringColor = isHit ? (kind === "sunk" ? COLORS.GOLD : COLORS.CORAL) : COLORS.BLUE;
    this.ripples.push({
      x: center[0],
      y: center[1],
      life: kind === "sunk" ? 0.55 : 0.4,
      maxLife: kind === "sunk" ? 0.55 : 0.4,
      maxRadius: kind === "sunk" ? 44 : 28,
      color: ringColor,
      lineWidth: kind === "sunk" ? 4 : 3
    });
    if (kind === "sunk") {
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: 0.7,
        maxLife: 0.7,
        maxRadius: 62,
        color: COLORS.CORAL,
        lineWidth: 2
      });
    }
    const count = kind === "sunk" ? 20 : isHit ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (i % 2) * 0.2;
      const speed = (kind === "sunk" ? 130 : isHit ? 95 : 55) * (0.5 + (i % 3) * 0.25);
      this.particles.push({
        x: center[0],
        y: center[1],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isHit ? 25 : 15),
        life: kind === "sunk" ? 0.65 : 0.45,
        maxLife: kind === "sunk" ? 0.65 : 0.45,
        color: isHit ? (i % 2 === 0 ? COLORS.CORAL : COLORS.GOLD) : COLORS.BLUE,
        size: kind === "sunk" ? 5 : 4
      });
    }
  }

  private spawnVictoryConfetti(): void {
    const colors = [COLORS.GREEN, COLORS.GOLD, COLORS.BLUE, COLORS.CORAL];
    const ep = this.enemyPanelRect();
    for (let i = 0; i < 36; i++) {
      const angle = -Math.PI + (Math.PI * i) / 36;
      const speed = 140 + (i % 5) * 45;
      this.particles.push({
        x: ep.x + ep.width / 2,
        y: ep.y + 180,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.1,
        maxLife: 1.1,
        color: colors[i % colors.length],
        size: 5
      });
    }
  }

  private triggerShake(intensity: number = 7): void {
    this.shakeDuration = 0.35;
    this.shakeTime = this.shakeDuration;
    this.shakeIntensity = intensity;
  }

  public flushVisualQueue(): void {
    while (this.pendingEvents.length > 0 || this.projectiles.length > 0) {
      for (const proj of this.projectiles) {
        if (!proj.resolved) {
          proj.resolved = true;
          proj.onImpact(true);
        }
      }
      this.projectiles = [];
      if (this.pendingEvents.length > 0) {
        const evts = this.pendingEvents.splice(0, this.pendingEvents.length);
        for (const evt of evts) {
          evt.fn(true);
        }
      }
    }
    this.pendingEnemyKeys = {};
    this.pendingPlayerKeys = {};
    this.particles = [];
    this.ripples = [];
    this.shakeTime = 0;
  }

  public tick(seconds: number): void {
    const dt = Math.max(0, seconds);
    this.clock += dt;

    const remainingEvents: PendingEvent[] = [];
    for (const evt of this.pendingEvents) {
      evt.delay -= dt;
      if (evt.delay <= 0) {
        evt.fn(false);
      } else {
        remainingEvents.push(evt);
      }
    }
    this.pendingEvents = remainingEvents;

    const activeProj: Projectile[] = [];
    for (const p of this.projectiles) {
      p.elapsed += dt;
      if (p.elapsed >= p.duration) {
        if (!p.resolved) {
          p.resolved = true;
          p.onImpact(false);
        }
      } else {
        activeProj.push(p);
      }
    }
    this.projectiles = activeProj;

    const activeParticles: Particle[] = [];
    for (const pt of this.particles) {
      pt.life -= dt;
      if (pt.life > 0) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 140 * dt;
        activeParticles.push(pt);
      }
    }
    this.particles = activeParticles;

    const activeRipples: Ripple[] = [];
    for (const rp of this.ripples) {
      rp.life -= dt;
      if (rp.life > 0) {
        activeRipples.push(rp);
      }
    }
    this.ripples = activeRipples;

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
  }

  public buttons(): ButtonSpec[] {
    const canReroll = this.game.shotsFired === 0 && !this.game.gameOver;
    return [
      {
        rect: { x: 528, y: 28, width: 162, height: 48 },
        label: this.sound.muted ? "Sound: Off (M)" : "Sound: On (M)",
        action: "toggle_sound",
        disabled: false
      },
      {
        rect: { x: 702, y: 28, width: 164, height: 48 },
        label: "Re-roll (F)",
        action: "reroll",
        disabled: !canReroll
      },
      {
        rect: { x: 878, y: 28, width: 190, height: 48 },
        label: "Board: " + this.boardSize + "x" + this.boardSize + " (G)",
        action: "toggle_size",
        disabled: false
      },
      {
        rect: { x: 1080, y: 28, width: 166, height: 48 },
        label: "New Game (R)",
        action: "new_game",
        disabled: false
      }
    ];
  }

  public activate(action: ButtonAction): void {
    if (action === "toggle_sound") {
      const muted = this.sound.toggle();
      if (!muted) {
        this.sound.play("click");
      }
      this.statusMessage = muted ? "Sound muted." : "Sound enabled.";
      this.statusColor = COLORS.MUTED;
      return;
    }
    if (action === "reroll") {
      this.flushVisualQueue();
      if (this.game.rerollPlayerFleet()) {
        this.sound.play("click");
        this.statusMessage = "Re-rolled your fleet positions.";
        this.statusColor = COLORS.GOLD;
      } else {
        this.statusMessage = "Fleet locked after battle starts. Press R for New Game.";
        this.statusColor = COLORS.MUTED;
      }
      return;
    }
    if (action === "toggle_size") {
      const nextSize: BoardSize = this.boardSize === 7 ? 10 : 7;
      this.startNewGame(nextSize);
      this.sound.play("click");
      return;
    }
    if (action === "new_game") {
      this.startNewGame(this.boardSize);
      this.sound.play("click");
    }
  }

  public fireAt(row: number, col: number): FireResult {
    if (this.game.gameOver) {
      this.flushVisualQueue();
      this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
      this.statusColor = this.game.winner === "You" ? COLORS.GREEN : COLORS.CORAL;
      return { accepted: false, reason: "game_over" };
    }
    if (this.game.player.hasTried(row, col)) {
      this.statusMessage = "Already fired at " + encodeLoc(row, col) + ". Pick another cell.";
      this.statusColor = COLORS.GOLD;
      return { accepted: false, reason: "already_fired", coord: encodeLoc(row, col) };
    }

    this.flushVisualQueue();
    const res = this.game.playerFire(row, col);
    if (!res.accepted) {
      return res;
    }

    const enemyKey = row + "," + col;
    this.pendingEnemyKeys[enemyKey] = true;
    const targetCenter = this.enemyCellCenter(row, col);
    const pp = this.playerPanelRect();
    const launchCenter: Coord = [pp.x + pp.width / 2, pp.y + pp.height / 2];

    if (res.computerShot) {
      this.pendingPlayerKeys[res.computerShot.row + "," + res.computerShot.col] = true;
    }

    this.sound.play("launch");
    this.statusMessage = "Firing at " + res.coord + "...";
    this.statusColor = COLORS.GOLD;

    this.projectiles.push({
      from: launchCenter,
      to: targetCenter,
      elapsed: 0,
      duration: 0.22,
      color: COLORS.GOLD,
      resolved: false,
      onImpact: (fastForward: boolean) => {
        delete this.pendingEnemyKeys[enemyKey];
        const kind: "hit" | "miss" | "sunk" = res.sunk ? "sunk" : res.hit ? "hit" : "miss";
        if (!fastForward) {
          this.spawnImpact(targetCenter, kind);
          this.sound.play(kind);
          if (res.sunk) {
            this.triggerShake(8);
          }
        }
        if (res.gameOver && res.winner === "You") {
          this.statusMessage = "VICTORY! You sank all enemy ships!";
          this.statusColor = COLORS.GREEN;
          if (!fastForward) {
            this.spawnVictoryConfetti();
            this.sound.play("win");
          }
        } else if (res.sunk) {
          this.statusMessage =
            "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
          this.statusColor = COLORS.GREEN;
        } else if (res.hit) {
          this.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
          this.statusColor = COLORS.GOLD;
        } else {
          this.statusMessage = "Miss at " + res.coord + ". Incoming fire...";
          this.statusColor = COLORS.BLUE;
        }
      }
    });

    if (res.computerShot) {
      const comp = res.computerShot;
      const compKey = comp.row + "," + comp.col;
      const compTargetCenter = this.playerCellCenter(comp.row, comp.col);
      const ep = this.enemyPanelRect();
      const compOrigin: Coord = [ep.x + ep.width / 2, ep.y + ep.height / 2];

      this.pendingEvents.push({
        delay: 0.28,
        fn: (fastForward: boolean) => {
          if (!fastForward) {
            this.sound.play("launch");
          }
          this.projectiles.push({
            from: compOrigin,
            to: compTargetCenter,
            elapsed: 0,
            duration: 0.22,
            color: COLORS.CORAL,
            resolved: false,
            onImpact: (ffImpact: boolean) => {
              delete this.pendingPlayerKeys[compKey];
              const compKind: "hit" | "miss" | "sunk" = comp.sunk
                ? "sunk"
                : comp.hit
                  ? "hit"
                  : "miss";
              if (!ffImpact && !fastForward) {
                this.spawnImpact(compTargetCenter, compKind);
                this.sound.play(compKind);
                if (comp.sunk) {
                  this.triggerShake(8);
                }
              }
              if (res.gameOver && res.winner === "Computer") {
                this.statusMessage = "DEFEAT! Computer sank all your ships.";
                this.statusColor = COLORS.CORAL;
                if (!ffImpact && !fastForward) {
                  this.sound.play("lose");
                }
              } else if (!res.sunk && !res.hit) {
                this.statusMessage = "Miss at " + res.coord + ". Your turn!";
                this.statusColor = COLORS.BLUE;
              }
            }
          });
        }
      });
    }

    return res;
  }

  public handlePointerMove(pt: Coord): void {
    this.hover = pt;
    this.hoverCell = this.enemyCellAtPoint(pt);
  }

  public handlePointerDown(pt: Coord): void {
    this.hover = pt;
    if (!this.mobileMode) {
      for (const btn of this.buttons()) {
        if (collidePoint(btn.rect, pt)) {
          this.activate(btn.action);
          return;
        }
      }
    }
    const cell = this.enemyCellAtPoint(pt);
    if (cell) {
      this.cursor = [cell[0], cell[1]];
      this.fireAt(cell[0], cell[1]);
    }
  }

  public handleKeyDown(key: string): boolean {
    const maxIdx = this.boardSize - 1;
    if (key === "ArrowUp" || key === "w" || key === "W") {
      this.cursor[0] = Math.max(0, this.cursor[0] - 1);
      return true;
    }
    if (key === "ArrowDown" || key === "s" || key === "S") {
      this.cursor[0] = Math.min(maxIdx, this.cursor[0] + 1);
      return true;
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
      this.cursor[1] = Math.max(0, this.cursor[1] - 1);
      return true;
    }
    if (key === "ArrowRight" || key === "d" || key === "D") {
      this.cursor[1] = Math.min(maxIdx, this.cursor[1] + 1);
      return true;
    }
    if (key === "Enter" || key === " ") {
      this.fireAt(this.cursor[0], this.cursor[1]);
      return true;
    }
    if (key === "f" || key === "F") {
      this.activate("reroll");
      return true;
    }
    if (key === "g" || key === "G") {
      this.activate("toggle_size");
      return true;
    }
    if (key === "m" || key === "M") {
      this.activate("toggle_sound");
      return true;
    }
    if (key === "r" || key === "R") {
      this.activate("new_game");
      return true;
    }
    return false;
  }

  private drawButton(btn: ButtonSpec): void {
    const isHover = !btn.disabled && collidePoint(btn.rect, this.hover);
    const bg = btn.disabled ? "rgb(26, 42, 52)" : isHover ? "rgb(48, 77, 86)" : COLORS.CARD;
    const border = btn.disabled ? "rgb(48, 66, 76)" : isHover ? COLORS.GREEN : COLORS.BORDER;
    const textColor = btn.disabled ? COLORS.MUTED : COLORS.INK;
    this.painter.panel(btn.rect, bg, 12);
    this.painter.strokeRoundRect(btn.rect, border, 2, 12);
    this.painter.text(
      btn.label,
      { x: btn.rect.x + 8, y: btn.rect.y + 13, width: btn.rect.width - 16, height: 28 },
      21,
      textColor,
      "center",
      "700"
    );
  }

  private drawMarker(rect: Rect, kind: "hit" | "miss"): void {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const ctx = this.ctx;
    if (kind === "hit") {
      const pad = Math.round(rect.width * 0.24);
      ctx.strokeStyle = COLORS.CORAL;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rect.x + pad, rect.y + pad);
      ctx.lineTo(rect.x + rect.width - pad, rect.y + rect.height - pad);
      ctx.moveTo(rect.x + rect.width - pad, rect.y + pad);
      ctx.lineTo(rect.x + pad, rect.y + rect.height - pad);
      ctx.stroke();
    } else {
      ctx.fillStyle = COLORS.BLUE;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(5, Math.round(rect.width * 0.16)), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBoard(panel: Rect, title: string, subtitle: string, isPlayer: boolean): void {
    const p = this.painter;
    const ctx = this.ctx;
    p.panel(panel, COLORS.PANEL, 16);
    p.strokeRoundRect(panel, COLORS.BORDER, 2, 16);
    p.text(
      title,
      { x: panel.x + 22, y: panel.y + 14, width: 230, height: 30 },
      26,
      isPlayer ? COLORS.BLUE : COLORS.GOLD,
      "left",
      "700"
    );
    p.text(
      subtitle,
      { x: panel.x + 220, y: panel.y + 17, width: panel.width - 242, height: 26 },
      20,
      COLORS.MUTED,
      "right"
    );

    const m = this.gridMetrics(panel);
    const n = this.boardSize;

    for (let i = 0; i < n; i++) {
      p.text(
        String(i + 1),
        { x: m.originX + i * m.cellSize, y: m.originY - 24, width: m.cellSize, height: 22 },
        19,
        COLORS.MUTED,
        "center"
      );
      p.text(
        String.fromCharCode(65 + i),
        {
          x: m.originX - 28,
          y: m.originY + i * m.cellSize + Math.round((m.cellSize - 18) / 2),
          width: 22,
          height: 22
        },
        19,
        COLORS.MUTED,
        "center"
      );
    }

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell: Rect = {
          x: m.originX + c * m.cellSize,
          y: m.originY + r * m.cellSize,
          width: m.cellSize,
          height: m.cellSize
        };
        let fill: string = COLORS.OCEAN;
        let marker: "hit" | "miss" | null = null;

        if (isPlayer) {
          const myFleet = this.game.player.fleetGroup.findAt(r, c);
          const revealedPlayerHit = this.isPlayerCellRevealed(r, c);
          if (myFleet) {
            if (myFleet.hasHit(r, c) && revealedPlayerHit) {
              fill = COLORS.SHIP_SUNK;
              marker = "hit";
            } else {
              fill = COLORS.SHIP_FILL;
            }
          } else if (revealedPlayerHit) {
            marker = "miss";
          }
        } else {
          const rec = this.isEnemyCellRevealed(r, c) ? this.game.player.hitRecordAt(r, c) : null;
          const isHover = this.hoverCell && this.hoverCell[0] === r && this.hoverCell[1] === c;
          if (rec) {
            if (rec[2]) {
              const enemyFleet = this.game.computer.fleetGroup.findAt(r, c);
              fill = enemyFleet && enemyFleet.isSunk() ? COLORS.SHIP_SUNK : "rgb(72, 46, 54)";
              marker = "hit";
            } else {
              fill = "rgb(20, 38, 52)";
              marker = "miss";
            }
          } else if (isHover && !this.game.gameOver) {
            fill = COLORS.OCEAN_HOVER;
          }
        }

        ctx.fillStyle = fill;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        ctx.strokeStyle = "rgb(48, 84, 108)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);

        if (marker) {
          this.drawMarker(cell, marker);
        }

        if (!isPlayer && !this.game.gameOver && this.cursor[0] === r && this.cursor[1] === c) {
          ctx.strokeStyle = COLORS.GOLD;
          ctx.lineWidth = 2.5 + 1.1 * Math.sin(this.clock * 6);
          ctx.strokeRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
        }
      }
    }

    ctx.strokeStyle = COLORS.BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(m.originX, m.originY, m.gridPx, m.gridPx);
  }

  private revealedHitCount(fleet: Fleet, isPlayerSide: boolean): number {
    let revealedHits = 0;
    for (const [hx, hy] of fleet.hits) {
      const rev = isPlayerSide
        ? this.isPlayerCellRevealed(hx, hy)
        : this.isEnemyCellRevealed(hx, hy);
      if (rev) {
        revealedHits += 1;
      }
    }
    return revealedHits;
  }

  public mobileState(): MobileState {
    const mapFleets = (fleets: Fleet[], isPlayerSide: boolean): MobileFleetInfo[] =>
      fleets.map((f) => {
        const hits = this.revealedHitCount(f, isPlayerSide);
        return {
          name: f.name,
          label: FLEET_LABELS[f.name],
          size: f.size,
          revealedHits: hits,
          sunk: hits === f.size
        };
      });

    return {
      statusMessage: this.statusMessage,
      statusColor: this.statusColor,
      boardSize: this.boardSize,
      shotsFired: this.game.shotsFired,
      gameOver: this.game.gameOver,
      winner: this.game.winner,
      buttons: this.buttons().map((b) => ({
        label: b.label.replace(/ \([A-Z]\)$/, ""),
        action: b.action,
        disabled: b.disabled
      })),
      playerFleets: mapFleets(this.game.player.fleetGroup.fleets, true),
      enemyFleets: mapFleets(this.game.computer.fleetGroup.fleets, false),
      logs: this.game.logs.slice(0, 5)
    };
  }

  private drawRoster(): void {
    const p = this.painter;
    const ctx = this.ctx;
    p.panel(ROSTER_PANEL, COLORS.PANEL, 16);
    p.strokeRoundRect(ROSTER_PANEL, COLORS.BORDER, 2, 16);
    p.text(
      "YOUR SHIPS",
      { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
      21,
      COLORS.BLUE,
      "left",
      "700"
    );
    p.text(
      "ENEMY SHIPS",
      { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
      21,
      COLORS.GOLD,
      "left",
      "700"
    );

    const drawCol = (fleets: Fleet[], startX: number, isPlayerSide: boolean): void => {
      for (let i = 0; i < fleets.length; i++) {
        const f = fleets[i];
        const y = ROSTER_PANEL.y + 44 + i * 28;
        const revealedHits = this.revealedHitCount(f, isPlayerSide);
        const sunk = revealedHits === f.size;
        p.text(
          FLEET_LABELS[f.name],
          { x: startX, y, width: 120, height: 22 },
          18,
          sunk ? COLORS.CORAL : COLORS.INK
        );
        for (let pip = 0; pip < f.size; pip++) {
          const px = startX + 126 + pip * 16;
          const py = y + 4;
          ctx.fillStyle = sunk ? COLORS.CORAL : pip < revealedHits ? COLORS.GOLD : COLORS.GREEN;
          ctx.fillRect(px, py, 11, 11);
        }
        p.text(
          sunk ? "SUNK" : f.size - revealedHits + "/" + f.size,
          { x: startX + 214, y, width: 52, height: 22 },
          17,
          sunk ? COLORS.CORAL : COLORS.MUTED,
          "right"
        );
      }
    };

    drawCol(this.game.player.fleetGroup.fleets, ROSTER_PANEL.x + 20, true);
    drawCol(this.game.computer.fleetGroup.fleets, ROSTER_PANEL.x + 310, false);
  }

  private drawBattleLog(): void {
    const p = this.painter;
    p.panel(LOG_PANEL, COLORS.PANEL, 16);
    const borderColor = this.game.gameOver
      ? this.game.winner === "You"
        ? COLORS.GREEN
        : COLORS.CORAL
      : COLORS.BORDER;
    p.strokeRoundRect(LOG_PANEL, borderColor, 2, 16);
    p.text(
      this.statusMessage,
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 14, width: LOG_PANEL.width - 40, height: 32 },
      23,
      this.statusColor,
      "left",
      "700"
    );

    p.text(
      this.game.logs.slice(0, 4).join("\n"),
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 54, width: LOG_PANEL.width - 40, height: 102 },
      19,
      COLORS.MUTED
    );

    const targetHint =
      "Target: " +
      encodeLoc(this.cursor[0], this.cursor[1]) +
      "  |  Shots: " +
      this.game.shotsFired +
      "  |  Arrows/WASD + Enter/Space or Click";
    p.text(
      targetHint,
      { x: LOG_PANEL.x + 20, y: LOG_PANEL.y + 162, width: LOG_PANEL.width - 40, height: 24 },
      18,
      COLORS.GOLD
    );
  }

  private drawEffects(): void {
    const ctx = this.ctx;
    for (const rp of this.ripples) {
      const frac = 1 - rp.life / rp.maxLife;
      ctx.save?.();
      ctx.globalAlpha = Math.max(0, rp.life / rp.maxLife);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = rp.lineWidth;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 6 + frac * rp.maxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore?.();
    }
    for (const p of this.projectiles) {
      const t = Math.min(1, p.elapsed / p.duration);
      const arcLift = Math.sin(Math.PI * t) * 58;
      const px = p.from[0] + (p.to[0] - p.from[0]) * t;
      const py = p.from[1] + (p.to[1] - p.from[1]) * t - arcLift;
      const tailT = Math.max(0, t - 0.14);
      const tailLift = Math.sin(Math.PI * tailT) * 58;
      const tx = p.from[0] + (p.to[0] - p.from[0]) * tailT;
      const ty = p.from[1] + (p.to[1] - p.from[1]) * tailT - tailLift;
      ctx.save?.();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.fillStyle = COLORS.INK;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore?.();
    }
    for (const pt of this.particles) {
      ctx.save?.();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      ctx.restore?.();
    }
  }

  public draw(): void {
    this.painter.errors = [];
    const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
    const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
    this.ctx.fillStyle = COLORS.NAVY;
    this.ctx.fillRect(0, 0, cw, ch);

    const shaking = this.shakeTime > 0;
    if (shaking && this.ctx.save && this.ctx.translate) {
      const ratio = this.shakeTime / this.shakeDuration;
      const dx = Math.sin(this.clock * 70) * this.shakeIntensity * ratio;
      const dy = Math.cos(this.clock * 85) * this.shakeIntensity * ratio;
      this.ctx.save();
      this.ctx.translate(dx, dy);
    }

    if (this.mobileMode) {
      this.drawBoard(this.enemyPanelRect(), "ENEMY FLEET", "Tap a square to fire", false);
      this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Ships & incoming hits", true);
      this.drawEffects();
    } else {
      this.painter.text(
        "BATTLESHIP",
        { x: 34, y: 20, width: 300, height: 42 },
        42,
        COLORS.GREEN,
        "left",
        "800"
      );
      this.painter.text(
        "Sink all 5 enemy warships before Computer sinks yours.",
        { x: 34, y: 68, width: 480, height: 28 },
        21,
        COLORS.MUTED
      );

      for (const btn of this.buttons()) {
        this.drawButton(btn);
      }

      this.drawBoard(PLAYER_PANEL, "YOUR FLEET", "Ships & incoming hits", true);
      this.drawBoard(
        ENEMY_PANEL,
        "ENEMY FLEET",
        "Target: " + encodeLoc(this.cursor[0], this.cursor[1]),
        false
      );
      this.drawRoster();
      this.drawBattleLog();
      this.drawEffects();
    }

    if (shaking) {
      this.ctx.restore?.();
    }

    this.layoutErrors = this.painter.errors.slice();
  }
}

function bootBrowser(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const canvasEl = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvasEl) {
    return;
  }
  const app = new BattleshipWebApp(canvasEl as unknown as CanvasLike);
  (window as unknown as { battleshipApp?: BattleshipWebApp }).battleshipApp = app;

  const mobileStatusText = document.getElementById("mobile-status-text");
  const mobileStatusSub = document.getElementById("mobile-status-sub");
  const mobileButtons = document.getElementById("mobile-buttons");
  const mobileRoster = document.getElementById("mobile-roster");
  const mobileLogs = document.getElementById("mobile-logs");
  let lastMobileKey = "";

  const syncViewport = (): void => {
    const isMobile = window.innerWidth <= 900 || window.innerHeight > window.innerWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const logW = isMobile ? MOBILE_WIDTH : WIDTH;
    const logH = isMobile ? MOBILE_HEIGHT : HEIGHT;
    app.setMobileMode(isMobile);
    const w = Math.round(logW * dpr);
    const h = Math.round(logH * dpr);
    if (canvasEl.width !== w || canvasEl.height !== h) {
      canvasEl.width = w;
      canvasEl.height = h;
    }
    app.ctx.setTransform?.(dpr, 0, 0, dpr, 0, 0);
    app.draw();
  };

  const syncMobileDom = (): void => {
    if (!app.mobileMode || !mobileButtons) {
      return;
    }
    const st = app.mobileState();
    const key = JSON.stringify(st);
    if (key === lastMobileKey) {
      return;
    }
    lastMobileKey = key;
    if (mobileStatusText) {
      mobileStatusText.textContent = st.statusMessage;
      mobileStatusText.style.color = st.statusColor;
    }
    if (mobileStatusSub) {
      mobileStatusSub.textContent =
        "Board: " + st.boardSize + "x" + st.boardSize + " | Shots: " + st.shotsFired;
    }
    mobileButtons.innerHTML = "";
    for (const b of st.buttons) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mobile-btn";
      btn.textContent = b.label;
      btn.disabled = b.disabled;
      btn.addEventListener("click", () => {
        app.activate(b.action);
        app.draw();
        syncMobileDom();
      });
      mobileButtons.appendChild(btn);
    }
    if (mobileRoster) {
      mobileRoster.innerHTML = "";
      const buildCol = (title: string, fleets: MobileFleetInfo[], isEnemy: boolean): HTMLElement => {
        const col = document.createElement("div");
        col.className = "mobile-roster-col" + (isEnemy ? " enemy" : "");
        const h4 = document.createElement("h4");
        h4.textContent = title;
        col.appendChild(h4);
        for (const f of fleets) {
          const row = document.createElement("div");
          row.className = "mobile-ship-row" + (f.sunk ? " sunk" : "");
          const name = document.createElement("span");
          name.textContent = f.label;
          const pips = document.createElement("span");
          pips.className = "mobile-pips";
          for (let p = 0; p < f.size; p++) {
            const pip = document.createElement("span");
            pip.className = "mobile-pip" + (f.sunk ? " sunk" : p < f.revealedHits ? " hit" : "");
            pips.appendChild(pip);
          }
          row.appendChild(name);
          row.appendChild(pips);
          col.appendChild(row);
        }
        return col;
      };
      mobileRoster.appendChild(buildCol("YOUR SHIPS", st.playerFleets, false));
      mobileRoster.appendChild(buildCol("ENEMY SHIPS", st.enemyFleets, true));
    }
    if (mobileLogs) {
      mobileLogs.textContent = st.logs.join("\n");
    }
  };

  const logicalFromEvent = (evt: PointerEvent): Coord => {
    const rect = canvasEl.getBoundingClientRect();
    const logW = app.mobileMode ? MOBILE_WIDTH : WIDTH;
    const logH = app.mobileMode ? MOBILE_HEIGHT : HEIGHT;
    const x = Math.round(((evt.clientX - rect.left) * logW) / rect.width);
    const y = Math.round(((evt.clientY - rect.top) * logH) / rect.height);
    return [x, y];
  };

  canvasEl.addEventListener("pointermove", (evt: PointerEvent) => {
    app.handlePointerMove(logicalFromEvent(evt));
  });

  canvasEl.addEventListener("pointerdown", (evt: PointerEvent) => {
    evt.preventDefault();
    app.handlePointerDown(logicalFromEvent(evt));
    syncMobileDom();
  });

  window.addEventListener("keydown", (evt: KeyboardEvent) => {
    if (app.handleKeyDown(evt.key)) {
      evt.preventDefault();
      syncMobileDom();
    }
  });

  window.addEventListener("resize", () => {
    syncViewport();
    syncMobileDom();
  });
  syncViewport();
  syncMobileDom();

  let lastTime = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min((now - lastTime) / 1000.0, 0.1);
    lastTime = now;
    app.tick(dt);
    app.draw();
    syncMobileDom();
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootBrowser);
  } else {
    bootBrowser();
  }
}

export {
  WIDTH,
  HEIGHT,
  MOBILE_WIDTH,
  MOBILE_HEIGHT,
  FLEET_NAMES,
  FLEET_SIZES,
  encodeLoc,
  makeRng,
  Fleet,
  FleetGroup,
  Player,
  ComputerPlayer,
  BattleshipGame
};
