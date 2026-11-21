import { encodeLoc, Fleet, FleetGroup, makeRng } from "./fleet";
import { BattleshipGame, ComputerPlayer, Player } from "./game";
import { collidePoint, Painter } from "./painter";
import { ProfileStore, rankForStars } from "./profile";
import {
  drawCaptainPortrait,
  drawHitFlame,
  drawMissSplash,
  drawOceanWaves,
  drawShipHull
} from "./ships";
import { SoundEffects } from "./sound";
import {
  BADGE_LABELS,
  BoardSize,
  ButtonAction,
  ButtonSpec,
  CanvasContextLike,
  CanvasLike,
  COLORS,
  Coord,
  Difficulty,
  DIFFICULTY_LABELS,
  Direction,
  ENEMY_PANEL,
  FireResult,
  FLEET_LABELS,
  FLEET_NAMES,
  FLEET_SIZES,
  FleetName,
  FloatingPopup,
  GamePhase,
  GameSummary,
  GridMetrics,
  HEIGHT,
  LOG_PANEL,
  MOBILE_ENEMY_PANEL,
  MOBILE_HEIGHT,
  MOBILE_PLAYER_PANEL,
  MOBILE_WIDTH,
  MobileButtonSpec,
  MobileFleetInfo,
  MobileState,
  Particle,
  PendingEvent,
  PLAYER_PANEL,
  PlayMode,
  Projectile,
  Rect,
  Ripple,
  ROSTER_PANEL,
  RULE_LABELS,
  RuleMode,
  SonarResult,
  WeaponKind,
  WIDTH
} from "./types";

export interface BattleshipAppOptions {
  boardSize?: number;
  seed?: number;
  playMode?: PlayMode;
  difficulty?: Difficulty;
  ruleMode?: RuleMode;
  helperMode?: boolean;
  persistProfile?: boolean;
}

export class BattleshipWebApp {
  public readonly canvas: CanvasLike;
  public readonly ctx: CanvasContextLike;
  public readonly painter: Painter;
  public readonly sound: SoundEffects;
  public readonly profile: ProfileStore;
  public layoutErrors: string[] = [];
  public readonly baseSeed?: number;
  public gameCount = 0;
  public boardSize: BoardSize;
  public playMode: PlayMode;
  public difficulty: Difficulty;
  public ruleMode: RuleMode;
  public helperMode: boolean;
  public mobileMode = false;
  public hover: Coord = [-1, -1];
  public hoverCell: Coord | null = null;
  public hoverPlayerCell: Coord | null = null;
  public cursor: Coord = [0, 0];
  public statusMessage = "";
  public statusColor: string = COLORS.GREEN;
  public clock = 0;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public ripples: Ripple[] = [];
  public popups: FloatingPopup[] = [];
  public pendingEvents: PendingEvent[] = [];
  public pendingEnemyKeys: Record<string, boolean> = {};
  public pendingPlayerKeys: Record<string, boolean> = {};
  public shakeTime = 0;
  public shakeDuration = 0.35;
  public shakeIntensity = 0;
  public weapon: WeaponKind = "shot";
  public placingMode = false;
  public placingSide: 0 | 1 = 0;
  public placingHandoffToP2 = false;
  public selectedShipName: FleetName = "carrier";
  public placeDirection: Direction = "horizontal";
  public summary: GameSummary | null = null;
  public summaryRecorded = false;
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
    this.profile = new ProfileStore(options.persistProfile !== false);
    this.baseSeed = options.seed;
    this.boardSize = options.boardSize === 10 ? 10 : 7;
    this.playMode = options.playMode === "2p" ? "2p" : "1p";
    this.difficulty = options.difficulty ?? "normal";
    this.ruleMode = options.ruleMode ?? "classic";
    this.helperMode = Boolean(options.helperMode);
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
    this.popups = [];
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
      seed: this.nextSeed(),
      playMode: this.playMode,
      difficulty: this.difficulty,
      ruleMode: this.ruleMode,
      helperMode: this.helperMode
    });
    this.cursor = [0, 0];
    this.hoverCell = null;
    this.hoverPlayerCell = null;
    this.weapon = "shot";
    this.selectedShipName = "carrier";
    this.placeDirection = "horizontal";
    this.placingHandoffToP2 = false;
    this.summary = null;
    this.summaryRecorded = false;

    if (this.playMode === "2p") {
      this.placingMode = true;
      this.placingSide = 0;
      this.statusMessage = "Player 1: Place your fleet or click Random, then tap Ready!";
      this.statusColor = COLORS.GOLD;
    } else {
      this.placingMode = false;
      this.placingSide = 0;
      this.statusMessage =
        "Your turn! Aim at Enemy Fleet (" + this.boardSize + "x" + this.boardSize + ").";
      this.statusColor = COLORS.GREEN;
    }
  }

  public phase(): GamePhase {
    if (this.game.gameOver) {
      return "gameover";
    }
    if (this.placingHandoffToP2 || this.game.waitingHandoff) {
      return "handoff";
    }
    if (this.placingMode) {
      return "place";
    }
    return "battle";
  }

  public handoffTitle(): string {
    if (this.placingHandoffToP2) {
      return "PASS TO PLAYER 2 TO PLACE SHIPS";
    }
    if (this.game.waitingHandoff) {
      const nextName = this.game.activePlayerIndex === 0 ? "PLAYER 2" : "PLAYER 1";
      return "PASS TO " + nextName;
    }
    return "";
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

  public playerCellRect(row: number, col: number): Rect {
    const m = this.gridMetrics(this.playerPanelRect());
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

  public playerCellAtPoint(pt: Coord): Coord | null {
    const m = this.gridMetrics(this.playerPanelRect());
    const col = Math.floor((pt[0] - m.originX) / m.cellSize);
    const row = Math.floor((pt[1] - m.originY) / m.cellSize);
    if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
      return [row, col];
    }
    return null;
  }

  public isEnemyCellRevealed(row: number, col: number): boolean {
    if (this.playMode === "1p") {
      return (
        Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + "," + col]
      );
    }
    return (
      Boolean(this.game.activePlayer().hitRecordAt(row, col)) &&
      !this.pendingEnemyKeys[row + "," + col]
    );
  }

  public isPlayerCellRevealed(row: number, col: number): boolean {
    const side = this.playMode === "1p" ? this.game.player : this.game.activePlayer();
    return side.wasHitAt(row, col) && !this.pendingPlayerKeys[row + "," + col];
  }

  private addPopup(pos: Coord, text: string, color: string, size: number = 22): void {
    this.popups.push({
      x: pos[0],
      y: pos[1] - 8,
      text,
      color,
      life: 1.0,
      maxLife: 1.0,
      size
    });
  }

  private spawnImpact(center: Coord, kind: "hit" | "miss" | "sunk"): void {
    const isHit = kind === "hit" || kind === "sunk";
    const ringColor = isHit ? (kind === "sunk" ? COLORS.GOLD : COLORS.CORAL) : COLORS.BLUE;
    this.ripples.push({
      x: center[0],
      y: center[1],
      life: kind === "sunk" ? 0.55 : 0.4,
      maxLife: kind === "sunk" ? 0.55 : 0.4,
      maxRadius: kind === "sunk" ? 46 : 28,
      color: ringColor,
      lineWidth: kind === "sunk" ? 4 : 3
    });
    if (kind === "sunk") {
      this.ripples.push({
        x: center[0],
        y: center[1],
        life: 0.72,
        maxLife: 0.72,
        maxRadius: 64,
        color: COLORS.CORAL,
        lineWidth: 2
      });
    }
    const count = kind === "sunk" ? 22 : isHit ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (i % 2) * 0.2;
      const speed = (kind === "sunk" ? 135 : isHit ? 95 : 55) * (0.5 + (i % 3) * 0.25);
      this.particles.push({
        x: center[0],
        y: center[1],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isHit ? 26 : 15),
        life: kind === "sunk" ? 0.68 : 0.45,
        maxLife: kind === "sunk" ? 0.68 : 0.45,
        color: isHit ? (i % 2 === 0 ? COLORS.CORAL : COLORS.GOLD) : COLORS.BLUE,
        size: kind === "sunk" ? 5 : 4
      });
    }
  }

  private spawnSonarPulse(center: Coord): void {
    this.ripples.push({
      x: center[0],
      y: center[1],
      life: 0.75,
      maxLife: 0.75,
      maxRadius: 96,
      color: COLORS.SONAR,
      lineWidth: 4
    });
    this.ripples.push({
      x: center[0],
      y: center[1],
      life: 0.5,
      maxLife: 0.5,
      maxRadius: 56,
      color: COLORS.GREEN,
      lineWidth: 2
    });
  }

  private spawnVictoryConfetti(): void {
    const colors = [COLORS.GREEN, COLORS.GOLD, COLORS.BLUE, COLORS.CORAL, COLORS.PURPLE];
    const ep = this.enemyPanelRect();
    for (let i = 0; i < 40; i++) {
      const angle = -Math.PI + (Math.PI * i) / 40;
      const speed = 140 + (i % 5) * 45;
      this.particles.push({
        x: ep.x + ep.width / 2,
        y: ep.y + 180,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.15,
        maxLife: 1.15,
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

  private finalizeGameSummary(): void {
    if (this.summaryRecorded || !this.game.gameOver) {
      return;
    }
    this.summaryRecorded = true;
    const evalIdx: 0 | 1 =
      this.playMode === "1p" ? 0 : this.game.winner === this.game.players[1].name ? 1 : 0;
    const res = this.game.evaluateBadgesFor(evalIdx);
    const won = this.playMode === "1p" ? this.game.winner === "You" : true;
    const newBadges = this.profile.recordMatch(won, res.stars, res.badges);
    this.summary = this.game.buildSummary(
      this.profile.rankName(),
      this.profile.data.stars,
      newBadges
    );
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
    this.popups = [];
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

    const activePopups: FloatingPopup[] = [];
    for (const pop of this.popups) {
      pop.life -= dt;
      if (pop.life > 0) {
        pop.y -= 28 * dt;
        activePopups.push(pop);
      }
    }
    this.popups = activePopups;

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
  }

  public buttons(): ButtonSpec[] {
    const canReroll = this.game.shotsFired === 0 && !this.game.gameOver && !this.placingHandoffToP2;
    return [
      {
        rect: { x: 528, y: 14, width: 162, height: 42 },
        label: this.sound.muted ? "Sound: Off (M)" : "Sound: On (M)",
        action: "toggle_sound",
        disabled: false
      },
      {
        rect: { x: 702, y: 14, width: 164, height: 42 },
        label: "Re-roll (F)",
        action: "reroll",
        disabled: !canReroll
      },
      {
        rect: { x: 878, y: 14, width: 190, height: 42 },
        label: "Board: " + this.boardSize + "x" + this.boardSize + " (G)",
        action: "toggle_size",
        disabled: false
      },
      {
        rect: { x: 1080, y: 14, width: 166, height: 42 },
        label: "New Game (R)",
        action: "new_game",
        disabled: false
      }
    ];
  }

  public modeButtons(): ButtonSpec[] {
    const canPlace = this.game.shotsFired === 0 && !this.game.gameOver && !this.placingHandoffToP2;
    return [
      {
        rect: { x: 34, y: 68, width: 126, height: 36 },
        label: this.playMode === "1p" ? "Mode: 1P" : "Mode: 2P",
        action: "toggle_mode",
        disabled: false,
        active: this.playMode === "2p"
      },
      {
        rect: { x: 170, y: 68, width: 152, height: 36 },
        label: "AI: " + DIFFICULTY_LABELS[this.difficulty],
        action: "cycle_ai",
        disabled: this.playMode === "2p"
      },
      {
        rect: { x: 332, y: 68, width: 166, height: 36 },
        label: "Rules: " + RULE_LABELS[this.ruleMode],
        action: "cycle_rules",
        disabled: false,
        active: this.ruleMode !== "classic"
      },
      {
        rect: { x: 508, y: 68, width: 148, height: 36 },
        label: this.helperMode ? "Helper: On" : "Helper: Off",
        action: "toggle_helper",
        disabled: false,
        active: this.helperMode
      },
      {
        rect: { x: 666, y: 68, width: 146, height: 36 },
        label: this.placingMode ? "Done Place" : "Place Ships",
        action: this.placingMode ? "finish_place" : "toggle_place",
        disabled: !canPlace,
        active: this.placingMode
      }
    ];
  }

  public skillButtons(): ButtonSpec[] {
    const idx = this.game.activePlayerIndex;
    const inBattle = this.phase() === "battle";
    const sonarLeft = this.game.sonarLeft[idx];
    const bombLeft = this.game.bombLeft[idx];
    return [
      {
        rect: { x: 850, y: 68, width: 112, height: 36 },
        label: "Shot (1)",
        action: "select_shot",
        disabled: !inBattle,
        active: this.weapon === "shot",
        accent: COLORS.BLUE
      },
      {
        rect: { x: 972, y: 68, width: 132, height: 36 },
        label: "Sonar:" + sonarLeft + " (2)",
        action: "select_sonar",
        disabled: !inBattle || sonarLeft <= 0 || this.game.sonarUsedTurn[idx] === this.game.turnNumber,
        active: this.weapon === "sonar",
        accent: COLORS.SONAR
      },
      {
        rect: { x: 1114, y: 68, width: 132, height: 36 },
        label: "Bomb:" + bombLeft + " (3)",
        action: "select_bomb",
        disabled: !inBattle || bombLeft <= 0,
        active: this.weapon === "bomb",
        accent: COLORS.ORANGE
      }
    ];
  }

  private placementDockRects(): {
    shipCards: { name: FleetName; rect: Rect }[];
    rotateBtn: ButtonSpec;
    randomBtn: ButtonSpec;
    readyBtn: ButtonSpec;
  } {
    const ep = this.enemyPanelRect();
    const shipCards: { name: FleetName; rect: Rect }[] = [];
    for (let i = 0; i < FLEET_NAMES.length; i++) {
      shipCards.push({
        name: FLEET_NAMES[i],
        rect: {
          x: ep.x + 28,
          y: ep.y + 84 + i * 62,
          width: ep.width - 56,
          height: 52
        }
      });
    }
    const btnY = ep.y + ep.height - 116;
    const halfW = Math.floor((ep.width - 70) / 2);
    return {
      shipCards,
      rotateBtn: {
        rect: { x: ep.x + 28, y: btnY, width: halfW, height: 42 },
        label: "Rotate: " + (this.placeDirection === "horizontal" ? "Horiz" : "Vert") + " (T)",
        action: "rotate_ship",
        disabled: false
      },
      randomBtn: {
        rect: { x: ep.x + 42 + halfW, y: btnY, width: halfW, height: 42 },
        label: "Random Fleet (F)",
        action: "reroll",
        disabled: false
      },
      readyBtn: {
        rect: { x: ep.x + 28, y: btnY + 52, width: ep.width - 56, height: 46 },
        label:
          this.playMode === "2p" && this.placingSide === 0
            ? "Player 1 Ready -> Pass to P2"
            : "Start Battle!",
        action: "finish_place",
        disabled: false,
        active: true,
        accent: COLORS.GREEN
      }
    };
  }

  private handoffButtonRect(): Rect {
    const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
    const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
    const w = Math.min(340, cw - 60);
    return {
      x: Math.round((cw - w) / 2),
      y: Math.round(ch / 2 + 24),
      width: w,
      height: 58
    };
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
      const ok = this.placingMode
        ? this.game.rerollSideFleet(this.placingSide)
        : this.game.rerollPlayerFleet();
      if (ok) {
        this.sound.play("click");
        this.statusMessage = "Re-rolled fleet positions.";
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
      return;
    }
    if (action === "toggle_mode") {
      this.playMode = this.playMode === "1p" ? "2p" : "1p";
      this.startNewGame(this.boardSize);
      this.sound.play("click");
      return;
    }
    if (action === "cycle_ai") {
      if (this.playMode === "2p") {
        return;
      }
      const order: Difficulty[] = ["easy", "normal", "hard"];
      this.difficulty = order[(order.indexOf(this.difficulty) + 1) % order.length];
      this.startNewGame(this.boardSize);
      this.sound.play("click");
      return;
    }
    if (action === "cycle_rules") {
      const order: RuleMode[] = ["classic", "streak", "salvo"];
      this.ruleMode = order[(order.indexOf(this.ruleMode) + 1) % order.length];
      this.startNewGame(this.boardSize);
      this.sound.play("click");
      return;
    }
    if (action === "toggle_helper") {
      this.helperMode = !this.helperMode;
      this.game.helperMode = this.helperMode;
      this.sound.play("click");
      this.statusMessage = this.helperMode
        ? "Helper On: Marks dead zones and gives hints after 4 misses."
        : "Helper Off.";
      this.statusColor = COLORS.BLUE;
      return;
    }
    if (action === "toggle_place") {
      if (this.game.shotsFired > 0 || this.game.gameOver) {
        this.statusMessage = "Fleet locked after battle starts.";
        this.statusColor = COLORS.MUTED;
        return;
      }
      this.placingMode = !this.placingMode;
      this.placingSide = 0;
      this.sound.play("click");
      this.statusMessage = this.placingMode
        ? "Click YOUR FLEET to place " + FLEET_LABELS[this.selectedShipName] + " (T or right-click to rotate)."
        : "Your turn! Aim at Enemy Fleet.";
      this.statusColor = this.placingMode ? COLORS.GOLD : COLORS.GREEN;
      return;
    }
    if (action === "rotate_ship") {
      this.placeDirection = this.placeDirection === "horizontal" ? "vertical" : "horizontal";
      this.sound.play("rotate");
      return;
    }
    if (action === "finish_place") {
      if (!this.placingMode) {
        return;
      }
      this.sound.play("click");
      if (this.playMode === "2p" && this.placingSide === 0) {
        this.placingHandoffToP2 = true;
        this.statusMessage = "Pass device to Player 2 to place ships.";
        this.statusColor = COLORS.GOLD;
      } else {
        this.placingMode = false;
        this.placingSide = 0;
        if (this.playMode === "2p") {
          this.game.activePlayerIndex = 1;
          this.game.waitingHandoff = true;
          this.statusMessage = "All ships placed! Pass to Player 1 to start battle.";
          this.statusColor = COLORS.GOLD;
        } else {
          this.statusMessage = "Fleet locked! Fire at Enemy Fleet!";
          this.statusColor = COLORS.GREEN;
        }
      }
      return;
    }
    if (action === "confirm_handoff") {
      this.sound.play("click");
      if (this.placingHandoffToP2) {
        this.placingHandoffToP2 = false;
        this.placingSide = 1;
        this.placingMode = true;
        this.statusMessage = "Player 2: Place your fleet or click Random, then Start Battle!";
        this.statusColor = COLORS.GOLD;
        return;
      }
      if (this.game.waitingHandoff) {
        this.flushVisualQueue();
        this.game.confirmHandoff();
        this.weapon = "shot";
        this.statusMessage = this.game.activePlayer().name + "'s turn! Fire at Enemy Fleet.";
        this.statusColor = COLORS.GREEN;
      }
      return;
    }
    if (action === "select_shot") {
      this.weapon = "shot";
      this.sound.play("click");
      this.statusMessage = "Standard Shot ready.";
      this.statusColor = COLORS.BLUE;
      return;
    }
    if (action === "select_sonar") {
      const idx = this.game.activePlayerIndex;
      if (this.game.sonarLeft[idx] <= 0 || this.game.sonarUsedTurn[idx] === this.game.turnNumber) {
        return;
      }
      this.weapon = "sonar";
      this.sound.play("click");
      this.statusMessage = "Sonar ready! Pick a center square to scan 3x3.";
      this.statusColor = COLORS.SONAR;
      return;
    }
    if (action === "select_bomb") {
      if (this.game.bombLeft[this.game.activePlayerIndex] <= 0) {
        return;
      }
      this.weapon = "bomb";
      this.sound.play("click");
      this.statusMessage = "Cross Bomb ready! Pick center square to blast + pattern.";
      this.statusColor = COLORS.ORANGE;
    }
  }

  public useSonarAt(row: number, col: number): SonarResult {
    const res = this.game.useSonar(row, col);
    if (!res.accepted) {
      if (res.reason === "no_charges") {
        this.statusMessage = "No Sonar charges left.";
      } else if (res.reason === "already_scanned_turn") {
        this.statusMessage = "Sonar already used this turn. Now fire a shot!";
      }
      this.statusColor = COLORS.GOLD;
      return res;
    }
    const center = this.enemyCellCenter(row, col);
    this.spawnSonarPulse(center);
    this.sound.play("sonar");
    const count = res.count ?? 0;
    this.addPopup(center, "SONAR: " + count, COLORS.SONAR, 24);
    this.weapon = "shot";
    this.statusMessage =
      "Sonar at " +
      res.coord +
      ": " +
      count +
      (count === 1 ? " hidden ship cell" : " hidden ship cells") +
      " in 3x3! Now fire!";
    this.statusColor = COLORS.SONAR;
    return res;
  }

  public fireBombAt(row: number, col: number): FireResult {
    this.flushVisualQueue();
    const res = this.game.useCrossBomb(row, col);
    if (!res.accepted) {
      this.statusMessage = "Pick an untried target area for Cross Bomb.";
      this.statusColor = COLORS.GOLD;
      return res;
    }
    this.weapon = "shot";
    const cells = res.cells ?? [];
    for (const cell of cells) {
      this.pendingEnemyKeys[cell.row + "," + cell.col] = true;
    }
    const compShots = res.computerShots ?? [];
    for (const cs of compShots) {
      this.pendingPlayerKeys[cs.row + "," + cs.col] = true;
    }

    const pp = this.playerPanelRect();
    const launchCenter: Coord = [pp.x + pp.width / 2, pp.y + pp.height / 2];
    const targetCenter = this.enemyCellCenter(row, col);
    this.sound.play("launch");
    this.statusMessage = "Launching Cross Bomb at " + res.coord + "...";
    this.statusColor = COLORS.ORANGE;

    this.projectiles.push({
      from: launchCenter,
      to: targetCenter,
      elapsed: 0,
      duration: 0.28,
      color: COLORS.ORANGE,
      radius: 8,
      resolved: false,
      onImpact: (fastForward: boolean) => {
        let hitCount = 0;
        for (const cell of cells) {
          delete this.pendingEnemyKeys[cell.row + "," + cell.col];
          const pos = this.enemyCellCenter(cell.row, cell.col);
          const kind: "hit" | "miss" | "sunk" = cell.sunk ? "sunk" : cell.hit ? "hit" : "miss";
          if (cell.hit) {
            hitCount += 1;
          }
          if (!fastForward) {
            this.spawnImpact(pos, kind);
          }
        }
        if (!fastForward) {
          this.sound.play("bomb");
          this.triggerShake(10);
          this.addPopup(targetCenter, "BOMB x" + hitCount + "!", COLORS.ORANGE, 24);
        }
        if (res.gameOver) {
          this.finalizeGameSummary();
          this.statusMessage = "VICTORY! " + res.winner + " sank all enemy ships!";
          this.statusColor = COLORS.GREEN;
          if (!fastForward) {
            this.spawnVictoryConfetti();
            this.sound.play("win");
          }
        } else if (res.bonusTurn) {
          this.statusMessage = "Cross Bomb hit " + hitCount + "! Bonus shot earned!";
          this.statusColor = COLORS.GOLD;
          if (!fastForward) {
            this.sound.play("combo");
          }
        } else if (res.handoffRequired) {
          this.statusMessage = "Cross Bomb hit " + hitCount + "! Pass to next player.";
          this.statusColor = COLORS.GOLD;
        } else {
          this.statusMessage = "Cross Bomb hit " + hitCount + "! Incoming fire...";
          this.statusColor = COLORS.ORANGE;
        }
      }
    });

    this.scheduleComputerShots(res, 0.34);
    return res;
  }

  private scheduleComputerShots(res: FireResult, initialDelay: number): void {
    const compShots = res.computerShots ?? (res.computerShot ? [res.computerShot] : []);
    if (compShots.length === 0) {
      return;
    }
    const ep = this.enemyPanelRect();
    const compOrigin: Coord = [ep.x + ep.width / 2, ep.y + ep.height / 2];

    compShots.forEach((comp, idx) => {
      const compKey = comp.row + "," + comp.col;
      const compTargetCenter = this.playerCellCenter(comp.row, comp.col);
      const isLast = idx === compShots.length - 1;
      this.pendingEvents.push({
        delay: initialDelay + idx * 0.28,
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
                  this.addPopup(compTargetCenter, "SUNK!", COLORS.CORAL, 22);
                }
              }
              if (isLast && res.gameOver && res.winner === "Computer") {
                this.finalizeGameSummary();
                this.statusMessage = "DEFEAT! Computer sank all your ships.";
                this.statusColor = COLORS.CORAL;
                if (!ffImpact && !fastForward) {
                  this.sound.play("lose");
                }
              } else if (isLast && !res.sunk && !res.hit) {
                this.statusMessage = "Miss at " + res.coord + ". Your turn!";
                this.statusColor = COLORS.BLUE;
              }
            }
          });
        }
      });
    });
  }

  public fireAt(row: number, col: number): FireResult {
    if (this.phase() === "handoff" || this.phase() === "place") {
      return { accepted: false, reason: "not_ready" };
    }
    if (this.game.gameOver) {
      this.flushVisualQueue();
      this.finalizeGameSummary();
      this.statusMessage = this.game.winner + " won! Press R or New Game to play again.";
      this.statusColor = this.game.winner === "Computer" ? COLORS.CORAL : COLORS.GREEN;
      return { accepted: false, reason: "game_over" };
    }
    if (this.weapon === "sonar") {
      this.useSonarAt(row, col);
      return { accepted: false, reason: "not_ready" };
    }
    if (this.weapon === "bomb") {
      return this.fireBombAt(row, col);
    }

    const shooter = this.game.activePlayer();
    if (shooter.hasTried(row, col)) {
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

    const compShots = res.computerShots ?? (res.computerShot ? [res.computerShot] : []);
    for (const cs of compShots) {
      this.pendingPlayerKeys[cs.row + "," + cs.col] = true;
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
            this.addPopup(targetCenter, "SUNK!", COLORS.GOLD, 24);
          } else if (res.hit) {
            const st = res.streakCount ?? 1;
            const label = st >= 2 ? st + "x COMBO!" : "HIT!";
            this.addPopup(targetCenter, label, st >= 2 ? COLORS.GOLD : COLORS.CORAL, 22);
            if (st >= 2) {
              this.sound.play("combo");
            }
          }
        }
        if (res.gameOver && res.winner !== "Computer") {
          this.finalizeGameSummary();
          this.statusMessage = "VICTORY! " + res.winner + " sank all enemy ships!";
          this.statusColor = COLORS.GREEN;
          if (!fastForward) {
            this.spawnVictoryConfetti();
            this.sound.play("win");
          }
        } else if (res.bonusTurn && this.ruleMode === "salvo") {
          this.statusMessage =
            "Salvo! " + (res.salvoRemaining ?? 1) + " more shot(s) this turn.";
          this.statusColor = COLORS.GOLD;
        } else if (res.bonusTurn && this.ruleMode === "streak") {
          this.statusMessage =
            "Direct hit at " + res.coord + "! " + (res.streakCount ?? 1) + "x streak - Fire again!";
          this.statusColor = COLORS.GOLD;
        } else if (res.sunk) {
          this.statusMessage =
            "Direct hit at " + res.coord + "! Enemy " + FLEET_LABELS[res.sunk] + " sunk!";
          this.statusColor = COLORS.GREEN;
        } else if (res.hit) {
          this.statusMessage = "Hit at " + res.coord + "! (" + FLEET_LABELS[res.hit] + ")";
          this.statusColor = COLORS.GOLD;
        } else if (res.handoffRequired) {
          this.statusMessage = "Miss at " + res.coord + ". Pass to next player.";
          this.statusColor = COLORS.BLUE;
        } else {
          this.statusMessage = "Miss at " + res.coord + ". Incoming fire...";
          this.statusColor = COLORS.BLUE;
        }
      }
    });

    this.scheduleComputerShots(res, 0.28);
    return res;
  }

  public placeSelectedShipAt(row: number, col: number): boolean {
    const ok = this.game.placeShip(
      this.placingSide,
      this.selectedShipName,
      row,
      col,
      this.placeDirection
    );
    if (!ok) {
      this.statusMessage = "Cannot place " + FLEET_LABELS[this.selectedShipName] + " there.";
      this.statusColor = COLORS.CORAL;
      return false;
    }
    this.sound.play("place");
    const idx = FLEET_NAMES.indexOf(this.selectedShipName);
    this.selectedShipName = FLEET_NAMES[(idx + 1) % FLEET_NAMES.length];
    this.statusMessage =
      "Placed! Next: " + FLEET_LABELS[this.selectedShipName] + " (click board or press Battle).";
    this.statusColor = COLORS.GREEN;
    return true;
  }

  public handlePointerMove(pt: Coord): void {
    this.hover = pt;
    this.hoverCell = this.enemyCellAtPoint(pt);
    this.hoverPlayerCell = this.playerCellAtPoint(pt);
  }

  public handleRightClick(): void {
    if (this.placingMode) {
      this.activate("rotate_ship");
    }
  }

  public handlePointerDown(pt: Coord): void {
    this.hover = pt;
    if (this.phase() === "handoff") {
      if (collidePoint(this.handoffButtonRect(), pt)) {
        this.activate("confirm_handoff");
      }
      return;
    }

    if (!this.mobileMode) {
      const allBtns = [...this.buttons(), ...this.modeButtons(), ...this.skillButtons()];
      for (const btn of allBtns) {
        if (!btn.disabled && collidePoint(btn.rect, pt)) {
          this.activate(btn.action);
          return;
        }
      }
    }

    if (this.placingMode) {
      const dock = this.placementDockRects();
      for (const card of dock.shipCards) {
        if (collidePoint(card.rect, pt)) {
          this.selectedShipName = card.name;
          this.sound.play("click");
          return;
        }
      }
      for (const btn of [dock.rotateBtn, dock.randomBtn, dock.readyBtn]) {
        if (collidePoint(btn.rect, pt)) {
          this.activate(btn.action);
          return;
        }
      }
      const pCell = this.playerCellAtPoint(pt);
      if (pCell) {
        this.placeSelectedShipAt(pCell[0], pCell[1]);
      }
      return;
    }

    // Quick-edit ship by clicking YOUR FLEET before first shot in 1P mode.
    if (this.playMode === "1p" && this.game.shotsFired === 0 && !this.game.gameOver) {
      const pCell = this.playerCellAtPoint(pt);
      if (pCell) {
        const clickedFleet = this.game.player.fleetGroup.findAt(pCell[0], pCell[1]);
        if (clickedFleet) {
          this.placingMode = true;
          this.placingSide = 0;
          this.selectedShipName = clickedFleet.name;
          this.placeDirection = clickedFleet.direction;
          this.sound.play("click");
          this.statusMessage =
            "Moving " + FLEET_LABELS[clickedFleet.name] + ". Click a new spot or press T to rotate.";
          this.statusColor = COLORS.GOLD;
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
    if (this.phase() === "handoff") {
      if (key === "Enter" || key === " ") {
        this.activate("confirm_handoff");
        return true;
      }
      return false;
    }

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
    if (key === "t" || key === "T") {
      if (this.placingMode) {
        this.activate("rotate_ship");
        return true;
      }
      return false;
    }
    if (key === "p" || key === "P") {
      this.activate(this.placingMode ? "finish_place" : "toggle_place");
      return true;
    }
    if (key === "1") {
      this.activate("select_shot");
      return true;
    }
    if (key === "2") {
      this.activate("select_sonar");
      return true;
    }
    if (key === "3") {
      this.activate("select_bomb");
      return true;
    }
    if (key === "h" || key === "H") {
      this.activate("toggle_helper");
      return true;
    }
    if (key === "Enter" || key === " ") {
      if (this.placingMode) {
        this.placeSelectedShipAt(this.cursor[0], this.cursor[1]);
      } else {
        this.fireAt(this.cursor[0], this.cursor[1]);
      }
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

  private drawButton(btn: ButtonSpec, fontSize: number = 19): void {
    const isHover = !btn.disabled && collidePoint(btn.rect, this.hover);
    const accent = btn.accent ?? COLORS.GREEN;
    const bg = btn.disabled
      ? "rgb(20, 48, 70)"
      : btn.active
        ? "rgb(36, 98, 128)"
        : isHover
          ? "rgb(44, 108, 146)"
          : COLORS.CARD;
    const border = btn.disabled
      ? "rgb(46, 82, 106)"
      : btn.active
        ? accent
        : isHover
          ? COLORS.GOLD
          : COLORS.BORDER;
    const textColor = btn.disabled ? COLORS.MUTED : btn.active ? accent : COLORS.INK;
    this.painter.panel(btn.rect, bg, 10);
    this.painter.strokeRoundRect(btn.rect, border, 2, 10);
    const textY = btn.rect.y + Math.max(6, Math.round((btn.rect.height - fontSize * 0.78) / 2));
    this.painter.text(
      btn.label,
      { x: btn.rect.x + 6, y: textY, width: btn.rect.width - 12, height: btn.rect.height - 8 },
      fontSize,
      textColor,
      "center",
      "700"
    );
  }

  private drawPlacementDock(): void {
    const p = this.painter;
    const ep = this.enemyPanelRect();
    const dock = this.placementDockRects();
    p.panel(ep, COLORS.PANEL, 16);
    p.strokeRoundRect(ep, COLORS.GOLD, 2, 16);
    const sideName = this.game.players[this.placingSide].name;
    p.text(
      sideName.toUpperCase() + " SHIP DOCK",
      { x: ep.x + 24, y: ep.y + 16, width: ep.width - 48, height: 30 },
      24,
      COLORS.GOLD,
      "left",
      "700"
    );
    p.text(
      "Pick a ship, then click YOUR FLEET board to place it.",
      { x: ep.x + 24, y: ep.y + 48, width: ep.width - 48, height: 24 },
      18,
      COLORS.MUTED
    );

    for (const card of dock.shipCards) {
      const selected = card.name === this.selectedShipName;
      const bg = selected ? "rgb(38, 104, 142)" : COLORS.CARD;
      p.panel(card.rect, bg, 10);
      p.strokeRoundRect(card.rect, selected ? COLORS.GOLD : COLORS.BORDER, 2, 10);
      const size = FLEET_SIZES[card.name];
      p.text(
        FLEET_LABELS[card.name] + " (" + size + " cells)",
        { x: card.rect.x + 14, y: card.rect.y + 14, width: 250, height: 26 },
        20,
        selected ? COLORS.GOLD : COLORS.INK,
        "left",
        "700"
      );
      for (let i = 0; i < size; i++) {
        this.ctx.fillStyle = selected ? COLORS.GOLD : COLORS.BLUE;
        this.ctx.fillRect(card.rect.x + card.rect.width - 26 - i * 18, card.rect.y + 18, 13, 15);
      }
    }

    this.drawButton(dock.rotateBtn, 18);
    this.drawButton(dock.randomBtn, 18);
    this.drawButton(dock.readyBtn, 20);
  }

  private drawBoard(panel: Rect, title: string, subtitle: string, isPlayer: boolean): void {
    const p = this.painter;
    const ctx = this.ctx;
    p.panel(panel, COLORS.PANEL, 16);
    p.strokeRoundRect(panel, COLORS.BORDER, 2, 16);
    p.text(
      title,
      { x: panel.x + 22, y: panel.y + 14, width: 230, height: 30 },
      25,
      isPlayer ? COLORS.BLUE : COLORS.GOLD,
      "left",
      "700"
    );
    p.text(
      subtitle,
      { x: panel.x + 220, y: panel.y + 17, width: panel.width - 242, height: 26 },
      19,
      COLORS.MUTED,
      "right"
    );

    const m = this.gridMetrics(panel);
    const n = this.boardSize;
    const viewSide = this.placingMode
      ? this.game.players[this.placingSide]
      : this.playMode === "1p"
        ? this.game.player
        : this.game.activePlayer();
    const targetSide =
      this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();
    const helperDead = !isPlayer && this.helperMode ? this.game.impossibleEnemyCells() : null;
    const hint = !isPlayer && this.helperMode ? this.game.helperHint() : null;

    for (let i = 0; i < n; i++) {
      const colHi = hint && hint.axis === "col" && hint.index === i;
      const rowHi = hint && hint.axis === "row" && hint.index === i;
      p.text(
        String(i + 1),
        { x: m.originX + i * m.cellSize, y: m.originY - 24, width: m.cellSize, height: 22 },
        19,
        colHi ? COLORS.GOLD : COLORS.MUTED,
        "center",
        colHi ? "800" : "600"
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
        rowHi ? COLORS.GOLD : COLORS.MUTED,
        "center",
        rowHi ? "800" : "600"
      );
    }

    // 1. Ocean background cells & wave animation
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell: Rect = {
          x: m.originX + c * m.cellSize,
          y: m.originY + r * m.cellSize,
          width: m.cellSize,
          height: m.cellSize
        };
        let fill: string = (r + c) % 2 === 0 ? COLORS.OCEAN : COLORS.OCEAN_ALT;
        if (!isPlayer) {
          const rec = this.isEnemyCellRevealed(r, c) ? viewSide.hitRecordAt(r, c) : null;
          const isHover = this.hoverCell && this.hoverCell[0] === r && this.hoverCell[1] === c;
          if (rec && !rec[2]) {
            fill = COLORS.OCEAN_MISS;
          } else if (isHover && !this.game.gameOver) {
            fill = COLORS.OCEAN_HOVER;
          }
        }
        ctx.fillStyle = fill;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        drawOceanWaves(ctx, cell, r, c, this.clock);
        ctx.strokeStyle = "rgb(48, 122, 168)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);

        if (helperDead && helperDead.has(r + "," + c)) {
          ctx.save?.();
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = COLORS.MUTED;
          ctx.beginPath();
          ctx.arc(cell.x + cell.width / 2, cell.y + cell.height / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore?.();
        }
      }
    }

    // 2. Vector ship hulls
    if (isPlayer) {
      for (const fl of viewSide.fleetGroup.fleets) {
        const revHits = this.revealedHitCount(fl, true);
        drawShipHull(ctx, fl, m, {
          sunk: revHits === fl.size,
          selected: this.placingMode && fl.name === this.selectedShipName,
          clock: this.clock
        });
      }
      // Placement hover preview on YOUR FLEET
      if (this.placingMode) {
        const anchor = this.hoverPlayerCell ?? this.cursor;
        const size = FLEET_SIZES[this.selectedShipName];
        const valid = this.game.canPlaceShip(
          this.placingSide,
          this.selectedShipName,
          anchor[0],
          anchor[1],
          this.placeDirection
        );
        ctx.save?.();
        ctx.globalAlpha = 0.48;
        ctx.fillStyle = valid ? COLORS.GREEN : COLORS.CORAL;
        for (let k = 0; k < size; k++) {
          const rr = this.placeDirection === "vertical" ? anchor[0] + k : anchor[0];
          const cc = this.placeDirection === "horizontal" ? anchor[1] + k : anchor[1];
          if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
            ctx.fillRect(m.originX + cc * m.cellSize + 3, m.originY + rr * m.cellSize + 3, m.cellSize - 6, m.cellSize - 6);
          }
        }
        ctx.restore?.();
      }
    } else {
      // Draw sunk enemy ships AND reveal all remaining enemy ships when game is over!
      for (const fl of targetSide.fleetGroup.fleets) {
        const revHits = this.revealedHitCount(fl, false);
        const isSunk = revHits === fl.size;
        if (isSunk) {
          drawShipHull(ctx, fl, m, { sunk: true, clock: this.clock });
        } else if (this.game.gameOver) {
          drawShipHull(ctx, fl, m, { sunk: false, ghost: true, clock: this.clock });
        }
      }
    }

    // 3. Hit flames & miss splashes
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell: Rect = {
          x: m.originX + c * m.cellSize,
          y: m.originY + r * m.cellSize,
          width: m.cellSize,
          height: m.cellSize
        };
        if (isPlayer) {
          if (this.isPlayerCellRevealed(r, c)) {
            const myFleet = viewSide.fleetGroup.findAt(r, c);
            if (myFleet && myFleet.hasHit(r, c)) {
              drawHitFlame(ctx, cell, this.clock);
            } else {
              drawMissSplash(ctx, cell);
            }
          }
        } else {
          const rec = this.isEnemyCellRevealed(r, c) ? viewSide.hitRecordAt(r, c) : null;
          if (rec) {
            if (rec[2]) {
              drawHitFlame(ctx, cell, this.clock);
            } else {
              drawMissSplash(ctx, cell);
            }
          }
        }
      }
    }

    // 4. Sonar scan badges, skill previews, and keyboard cursor on Enemy Board
    if (!isPlayer) {
      const scans = this.game.sonarScans[this.game.activePlayerIndex];
      for (const scan of scans) {
        const cx = m.originX + (scan.col + 0.5) * m.cellSize;
        const cy = m.originY + (scan.row + 0.5) * m.cellSize;
        ctx.save?.();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = COLORS.SONAR;
        ctx.lineWidth = 2;
        const r0 = Math.max(0, scan.row - 1);
        const c0 = Math.max(0, scan.col - 1);
        const r1 = Math.min(n - 1, scan.row + 1);
        const c1 = Math.min(n - 1, scan.col + 1);
        ctx.strokeRect(
          m.originX + c0 * m.cellSize + 2,
          m.originY + r0 * m.cellSize + 2,
          (c1 - c0 + 1) * m.cellSize - 4,
          (r1 - r0 + 1) * m.cellSize - 4
        );
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = "rgb(14, 64, 58)";
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.SONAR;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore?.();
        p.text(
          String(scan.count),
          { x: cx - 12, y: cy - 9, width: 24, height: 20 },
          18,
          COLORS.SONAR,
          "center",
          "800"
        );
      }

      if (!this.game.gameOver) {
        const aim = this.hoverCell ?? this.cursor;
        if (this.weapon === "sonar") {
          ctx.save?.();
          ctx.globalAlpha = 0.22;
          ctx.fillStyle = COLORS.SONAR;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const rr = aim[0] + dr;
              const cc = aim[1] + dc;
              if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
                ctx.fillRect(m.originX + cc * m.cellSize + 2, m.originY + rr * m.cellSize + 2, m.cellSize - 4, m.cellSize - 4);
              }
            }
          }
          ctx.restore?.();
        } else if (this.weapon === "bomb") {
          ctx.save?.();
          ctx.globalAlpha = 0.28;
          ctx.fillStyle = COLORS.ORANGE;
          const dirs: Coord[] = [
            [0, 0],
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
          ];
          for (const [dr, dc] of dirs) {
            const rr = aim[0] + dr;
            const cc = aim[1] + dc;
            if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
              ctx.fillRect(m.originX + cc * m.cellSize + 2, m.originY + rr * m.cellSize + 2, m.cellSize - 4, m.cellSize - 4);
            }
          }
          ctx.restore?.();
        }

        const curRect: Rect = {
          x: m.originX + this.cursor[1] * m.cellSize,
          y: m.originY + this.cursor[0] * m.cellSize,
          width: m.cellSize,
          height: m.cellSize
        };
        ctx.strokeStyle =
          this.weapon === "sonar" ? COLORS.SONAR : this.weapon === "bomb" ? COLORS.ORANGE : COLORS.GOLD;
        ctx.lineWidth = 2.5 + 1.1 * Math.sin(this.clock * 6);
        ctx.strokeRect(curRect.x + 2, curRect.y + 2, curRect.width - 4, curRect.height - 4);
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
    const viewSide = this.placingMode
      ? this.game.players[this.placingSide]
      : this.playMode === "1p"
        ? this.game.player
        : this.game.activePlayer();
    const targetSide =
      this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();
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

    const toMobileBtns = (list: ButtonSpec[]): MobileButtonSpec[] =>
      list.map((b) => ({
        label: b.label.replace(/ \([A-Z0-9]\)$/, ""),
        action: b.action,
        disabled: b.disabled,
        active: b.active
      }));

    return {
      statusMessage: this.statusMessage,
      statusColor: this.statusColor,
      boardSize: this.boardSize,
      shotsFired: this.game.shotsFired,
      gameOver: this.game.gameOver,
      winner: this.game.winner,
      phase: this.phase(),
      playMode: this.playMode,
      activePlayerName: this.game.activePlayer().name,
      handoffTitle: this.handoffTitle(),
      difficulty: this.difficulty,
      ruleMode: this.ruleMode,
      helperMode: this.helperMode,
      weapon: this.weapon,
      sonarLeft: this.game.sonarLeft[this.game.activePlayerIndex],
      bombLeft: this.game.bombLeft[this.game.activePlayerIndex],
      captain: this.game.captainInfo(),
      rankName: this.profile.rankName(),
      totalStars: this.profile.data.stars,
      badgeCount: this.profile.data.badges.length,
      summary: this.summary,
      buttons: toMobileBtns(this.buttons()),
      modeButtons: toMobileBtns(this.modeButtons()),
      skillButtons: toMobileBtns(this.skillButtons()),
      playerFleets: mapFleets(viewSide.fleetGroup.fleets, true),
      enemyFleets: mapFleets(targetSide.fleetGroup.fleets, false),
      logs: this.game.logs.slice(0, 5)
    };
  }

  private drawRoster(): void {
    const p = this.painter;
    const ctx = this.ctx;
    p.panel(ROSTER_PANEL, COLORS.PANEL, 16);
    p.strokeRoundRect(ROSTER_PANEL, COLORS.BORDER, 2, 16);

    const viewSide = this.placingMode
      ? this.game.players[this.placingSide]
      : this.playMode === "1p"
        ? this.game.player
        : this.game.activePlayer();
    const targetSide =
      this.playMode === "1p" ? this.game.computer : this.game.opponentPlayer();

    p.text(
      viewSide.name.toUpperCase() + " SHIPS",
      { x: ROSTER_PANEL.x + 20, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
      20,
      COLORS.BLUE,
      "left",
      "700"
    );
    p.text(
      targetSide.name.toUpperCase() + " SHIPS",
      { x: ROSTER_PANEL.x + 310, y: ROSTER_PANEL.y + 12, width: 250, height: 24 },
      20,
      COLORS.GOLD,
      "left",
      "700"
    );

    const drawCol = (fleets: Fleet[], startX: number, isPlayerSide: boolean): void => {
      for (let i = 0; i < fleets.length; i++) {
        const f = fleets[i];
        const y = ROSTER_PANEL.y + 42 + i * 28;
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

    drawCol(viewSide.fleetGroup.fleets, ROSTER_PANEL.x + 20, true);
    drawCol(targetSide.fleetGroup.fleets, ROSTER_PANEL.x + 310, false);
  }

  private drawBattleLog(): void {
    const p = this.painter;
    p.panel(LOG_PANEL, COLORS.PANEL, 16);
    const borderColor = this.game.gameOver
      ? this.game.winner === "Computer"
        ? COLORS.CORAL
        : COLORS.GREEN
      : COLORS.BORDER;
    p.strokeRoundRect(LOG_PANEL, borderColor, 2, 16);

    const cap = this.game.captainInfo();
    const contentX = cap ? LOG_PANEL.x + 96 : LOG_PANEL.x + 20;
    const contentW = cap ? LOG_PANEL.width - 116 : LOG_PANEL.width - 40;

    if (cap) {
      drawCaptainPortrait(
        this.ctx,
        { x: LOG_PANEL.x + 14, y: LOG_PANEL.y + 16, width: 70, height: 70 },
        cap
      );
      p.text(
        cap.name,
        { x: LOG_PANEL.x + 8, y: LOG_PANEL.y + 92, width: 84, height: 34 },
        15,
        COLORS.GOLD,
        "center",
        "700"
      );
      p.text(
        '"' + cap.line + '"',
        { x: contentX, y: LOG_PANEL.y + 12, width: contentW, height: 26 },
        19,
        COLORS.BLUE,
        "left",
        "700"
      );
    }

    if (this.game.gameOver && this.summary) {
      const s = this.summary;
      const starText = s.stars > 0 ? "Stars: " + "*".repeat(s.stars) : "Keep trying!";
      p.text(
        s.winner + " Wins! " + starText + " | Acc: " + s.accuracy + "%",
        { x: contentX, y: LOG_PANEL.y + (cap ? 42 : 16), width: contentW, height: 30 },
        21,
        s.playerWon ? COLORS.GREEN : COLORS.CORAL,
        "left",
        "700"
      );
      const badgeLine =
        s.newBadges.length > 0
          ? "New Badges: " + s.newBadges.map((b) => BADGE_LABELS[b]).join(", ")
          : "Rank: " + s.rankName + " (" + s.totalStars + " stars) | Best Streak: " + s.bestStreak;
      p.text(
        badgeLine,
        { x: contentX, y: LOG_PANEL.y + (cap ? 76 : 54), width: contentW, height: 48 },
        18,
        COLORS.GOLD
      );
      p.text(
        "Enemy ships revealed above! Press R or New Game to play again.",
        { x: contentX, y: LOG_PANEL.y + 158, width: contentW, height: 24 },
        17,
        COLORS.MUTED
      );
      return;
    }

    p.text(
      this.statusMessage,
      { x: contentX, y: LOG_PANEL.y + (cap ? 40 : 14), width: contentW, height: 32 },
      21,
      this.statusColor,
      "left",
      "700"
    );

    const hint = this.game.helperHint();
    const logLines = this.game.logs.slice(0, hint ? 2 : 3).join("\n");
    p.text(
      logLines,
      { x: contentX, y: LOG_PANEL.y + (cap ? 74 : 52), width: contentW, height: 82 },
      18,
      COLORS.MUTED
    );

    const footer = hint
      ? hint.label + " | Shots: " + this.game.shotsFired
      : "Target: " +
        encodeLoc(this.cursor[0], this.cursor[1]) +
        " | Shots: " +
        this.game.shotsFired +
        " | Keys: 1/2/3 Weapons, P Place";
    p.text(
      footer,
      { x: contentX, y: LOG_PANEL.y + 162, width: contentW, height: 24 },
      17,
      COLORS.GOLD
    );
  }

  private drawHandoffOverlay(): void {
    const cw = this.mobileMode ? MOBILE_WIDTH : WIDTH;
    const ch = this.mobileMode ? MOBILE_HEIGHT : HEIGHT;
    const ctx = this.ctx;
    ctx.save?.();
    ctx.fillStyle = "rgba(10, 32, 54, 0.94)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore?.();

    const cardW = Math.min(540, cw - 40);
    const card: Rect = {
      x: Math.round((cw - cardW) / 2),
      y: Math.round(ch / 2 - 120),
      width: cardW,
      height: 230
    };
    this.painter.panel(card, COLORS.PANEL, 20);
    this.painter.strokeRoundRect(card, COLORS.GOLD, 3, 20);
    this.painter.text(
      this.handoffTitle(),
      { x: card.x + 20, y: card.y + 34, width: card.width - 40, height: 40 },
      28,
      COLORS.GOLD,
      "center",
      "800"
    );
    this.painter.text(
      "Keep your ships secret! Tap Ready or press Space when ready.",
      { x: card.x + 24, y: card.y + 84, width: card.width - 48, height: 42 },
      19,
      COLORS.MUTED,
      "center"
    );
    this.drawButton(
      {
        rect: this.handoffButtonRect(),
        label: "I'M READY! (Space)",
        action: "confirm_handoff",
        disabled: false,
        active: true,
        accent: COLORS.GREEN
      },
      22
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
      ctx.lineWidth = p.radius ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.fillStyle = COLORS.INK;
      ctx.beginPath();
      ctx.arc(px, py, p.radius ?? 6, 0, Math.PI * 2);
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
    for (const pop of this.popups) {
      ctx.save?.();
      ctx.globalAlpha = Math.max(0, Math.min(1, pop.life / pop.maxLife));
      this.painter.text(
        pop.text,
        { x: pop.x - 80, y: pop.y - 14, width: 160, height: 30 },
        pop.size,
        pop.color,
        "center",
        "800"
      );
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
      if (this.placingMode) {
        this.drawPlacementDock();
        this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Tap grid to place ship", true);
      } else {
        this.drawBoard(this.enemyPanelRect(), "ENEMY FLEET", "Tap a square to fire", false);
        this.drawBoard(this.playerPanelRect(), "YOUR FLEET", "Ships & incoming hits", true);
      }
      this.drawEffects();
    } else {
      this.painter.text(
        "BATTLESHIP",
        { x: 34, y: 12, width: 220, height: 38 },
        38,
        COLORS.GREEN,
        "left",
        "800"
      );
      const rankBadge =
        "Rank: " +
        this.profile.rankName() +
        " | Stars: " +
        this.profile.data.stars +
        " | Badges: " +
        this.profile.data.badges.length;
      this.painter.text(
        rankBadge,
        { x: 256, y: 22, width: 266, height: 24 },
        18,
        COLORS.GOLD,
        "left",
        "700"
      );

      for (const btn of this.buttons()) {
        this.drawButton(btn, 19);
      }
      for (const btn of this.modeButtons()) {
        this.drawButton(btn, 17);
      }
      for (const btn of this.skillButtons()) {
        this.drawButton(btn, 17);
      }

      const viewTitle = this.placingMode
        ? this.game.players[this.placingSide].name.toUpperCase() + " FLEET"
        : this.playMode === "2p"
          ? this.game.activePlayer().name.toUpperCase() + " FLEET"
          : "YOUR FLEET";
      this.drawBoard(
        PLAYER_PANEL,
        viewTitle,
        this.placingMode ? "Click cell to place (T rotate)" : "Click ship before battle to move",
        true
      );
      if (this.placingMode) {
        this.drawPlacementDock();
      } else {
        const enemyTitle =
          this.playMode === "2p"
            ? this.game.opponentPlayer().name.toUpperCase() + " WATERS"
            : "ENEMY FLEET";
        this.drawBoard(
          ENEMY_PANEL,
          enemyTitle,
          "Target: " + encodeLoc(this.cursor[0], this.cursor[1]),
          false
        );
      }
      this.drawRoster();
      this.drawBattleLog();
      this.drawEffects();
    }

    if (this.phase() === "handoff") {
      this.drawHandoffOverlay();
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
  const mobileModes = document.getElementById("mobile-modes");
  const mobileSkills = document.getElementById("mobile-skills");
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

  const renderBtnGroup = (container: HTMLElement | null, list: MobileButtonSpec[]): void => {
    if (!container) {
      return;
    }
    container.innerHTML = "";
    for (const b of list) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mobile-btn" + (b.active ? " active" : "");
      btn.textContent = b.label;
      btn.disabled = b.disabled;
      btn.addEventListener("click", () => {
        app.activate(b.action);
        app.draw();
        syncMobileDom();
      });
      container.appendChild(btn);
    }
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
      const capText = st.captain ? " | " + st.captain.name + ': "' + st.captain.line + '"' : "";
      mobileStatusSub.textContent =
        "Rank: " +
        st.rankName +
        " (" +
        st.totalStars +
        "*) | " +
        st.boardSize +
        "x" +
        st.boardSize +
        " | Shots: " +
        st.shotsFired +
        capText;
    }
    renderBtnGroup(mobileButtons, st.buttons);
    renderBtnGroup(mobileModes, st.modeButtons);
    renderBtnGroup(mobileSkills, st.skillButtons);

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
    if (evt.button === 2) {
      app.handleRightClick();
      syncMobileDom();
      return;
    }
    app.handlePointerDown(logicalFromEvent(evt));
    syncMobileDom();
  });

  canvasEl.addEventListener("contextmenu", (evt: MouseEvent) => {
    evt.preventDefault();
    app.handleRightClick();
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
  BADGE_LABELS,
  encodeLoc,
  makeRng,
  rankForStars,
  ProfileStore,
  Fleet,
  FleetGroup,
  Player,
  ComputerPlayer,
  BattleshipGame
};
