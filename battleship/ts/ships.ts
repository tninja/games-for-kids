import { Fleet } from "./fleet";
import { Painter } from "./painter";
import {
  BattleCam,
  CanvasContextLike,
  CaptainInfo,
  COLORS,
  FleetName,
  GridMetrics,
  HitBurst,
  Rect
} from "./types";

function rotatePoint(
  px: number,
  py: number,
  ox: number,
  oy: number,
  angle: number
): [number, number] {
  const dx = px - ox;
  const dy = py - oy;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  return [ox + dx * ca - dy * sa, oy + dx * sa + dy * ca];
}

function drawRotatedPoly(
  ctx: CanvasContextLike,
  pts: [number, number][],
  ox: number,
  oy: number,
  angle: number
): void {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const [rx, ry] = rotatePoint(pts[i][0], pts[i][1], ox, oy, angle);
    if (i === 0) {
      ctx.moveTo(rx, ry);
    } else {
      ctx.lineTo(rx, ry);
    }
  }
  ctx.closePath?.();
}

export function drawOceanWaves(
  ctx: CanvasContextLike,
  cell: Rect,
  row: number,
  col: number,
  clock: number
): void {
  const phase = clock * 2.2 + row * 0.9 + col * 0.7;
  const shift = Math.sin(phase) * 3;
  const y1 = cell.y + cell.height * 0.34;
  const y2 = cell.y + cell.height * 0.68;
  ctx.save?.();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = COLORS.WAVE;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cell.x + 8 + shift, y1);
  ctx.lineTo(cell.x + cell.width * 0.45 + shift, y1 - 2);
  ctx.lineTo(cell.x + cell.width - 10 + shift, y1);
  ctx.moveTo(cell.x + 12 - shift, y2);
  ctx.lineTo(cell.x + cell.width * 0.55 - shift, y2 + 2);
  ctx.lineTo(cell.x + cell.width - 8 - shift, y2);
  ctx.stroke();
  ctx.restore?.();
}

export function drawSinkingShipBreakup(
  ctx: CanvasContextLike,
  fleet: Fleet,
  metrics: GridMetrics,
  progress: number,
  clock: number
): void {
  if (fleet.coordinates.length === 0) {
    return;
  }
  const first = fleet.coordinates[0];
  const isHoriz = fleet.direction === "horizontal";
  const cs = metrics.cellSize;
  const pad = Math.max(4, Math.round(cs * 0.12));
  const x = metrics.originX + first[1] * cs + pad;
  const y = metrics.originY + first[0] * cs + pad;
  const w = (isHoriz ? fleet.size * cs : cs) - pad * 2;
  const h = (isHoriz ? cs : fleet.size * cs) - pad * 2;
  const p = Math.max(0, Math.min(1, progress));

  const jitter = p < 0.3 ? Math.sin(clock * 95) * 4 * (1 - p / 0.3) : 0;
  const crackP = Math.max(0, (p - 0.18) / 0.82);
  const splitGap = crackP * 10;
  const tilt = crackP * 0.42;
  const sinkDrop = crackP * (isHoriz ? h * 0.42 : cs * 0.35);

  const hullColor = p < 0.22 ? "rgb(255, 198, 122)" : COLORS.SHIP_SUNK;
  const trimColor = p < 0.22 ? "rgb(255, 248, 220)" : "rgb(220, 128, 124)";

  ctx.save?.();
  ctx.globalAlpha = Math.max(0.45, 1 - crackP * 0.42);
  ctx.fillStyle = hullColor;
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 2;

  if (isHoriz) {
    const midX = x + w / 2;
    const midY = y + h / 2;
    const bow = Math.min(cs * 0.4, w * 0.22);
    const leftPts: [number, number][] = [
      [x + jitter, y + 3 + sinkDrop],
      [midX - splitGap, y + 3 + sinkDrop],
      [midX - splitGap - 5, midY + sinkDrop],
      [midX - splitGap, y + h - 3 + sinkDrop],
      [x + jitter, y + h - 3 + sinkDrop]
    ];
    drawRotatedPoly(ctx, leftPts, midX - splitGap, midY + sinkDrop, -tilt);
    ctx.fill();
    ctx.stroke();

    const rightPts: [number, number][] = [
      [midX + splitGap, y + 3 + sinkDrop],
      [x + w - bow + jitter, y + 3 + sinkDrop],
      [x + w + jitter, midY + sinkDrop],
      [x + w - bow + jitter, y + h - 3 + sinkDrop],
      [midX + splitGap, y + h - 3 + sinkDrop],
      [midX + splitGap + 5, midY + sinkDrop]
    ];
    drawRotatedPoly(ctx, rightPts, midX + splitGap, midY + sinkDrop, tilt);
    ctx.fill();
    ctx.stroke();
  } else {
    const midX = x + w / 2;
    const midY = y + h / 2;
    const bow = Math.min(cs * 0.4, h * 0.22);
    const topPts: [number, number][] = [
      [midX + jitter, y + sinkDrop],
      [x + w - 3 + jitter, y + bow + sinkDrop],
      [x + w - 3 + jitter, midY - splitGap + sinkDrop],
      [midX, midY - splitGap - 5 + sinkDrop],
      [x + 3 + jitter, midY - splitGap + sinkDrop],
      [x + 3 + jitter, y + bow + sinkDrop]
    ];
    drawRotatedPoly(ctx, topPts, midX, midY - splitGap + sinkDrop, -tilt * 0.85);
    ctx.fill();
    ctx.stroke();

    const botPts: [number, number][] = [
      [x + 3 + jitter, midY + splitGap + sinkDrop],
      [midX, midY + splitGap + 5 + sinkDrop],
      [x + w - 3 + jitter, midY + splitGap + sinkDrop],
      [x + w - 3 + jitter, y + h - 3 + sinkDrop],
      [x + 3 + jitter, y + h - 3 + sinkDrop]
    ];
    drawRotatedPoly(ctx, botPts, midX, midY + splitGap + sinkDrop, tilt * 0.85);
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = "rgb(218, 246, 255)";
  ctx.lineWidth = 2.4;
  ctx.globalAlpha = Math.max(0.2, 0.9 * (1 - crackP * 0.4));
  const foamCount = Math.max(3, fleet.size + 1);
  for (let i = 0; i < foamCount; i++) {
    const frac = (i + 0.5) / foamCount;
    const fx = isHoriz ? x + w * frac : x + w * (0.25 + (i % 2) * 0.5);
    const fy = isHoriz ? y + h * 0.72 + Math.sin(clock * 14 + i) * 3 : y + h * frac;
    const rad = 3 + crackP * 7 + (i % 2) * 2;
    ctx.beginPath();
    ctx.arc(fx, fy, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore?.();
}

export function drawShipHull(
  ctx: CanvasContextLike,
  fleet: Fleet,
  metrics: GridMetrics,
  options: {
    sunk: boolean;
    ghost?: boolean;
    selected?: boolean;
    sinkProgress?: number;
    clock: number;
  }
): void {
  if (fleet.coordinates.length === 0) {
    return;
  }
  const first = fleet.coordinates[0];
  const isHoriz = fleet.direction === "horizontal";
  const cs = metrics.cellSize;
  const pad = Math.max(4, Math.round(cs * 0.12));
  const sinkP = options.sinkProgress ?? 1;
  const dip = options.sunk && sinkP < 1 ? Math.round(sinkP * 5) : 0;
  const x = metrics.originX + first[1] * cs + pad;
  const y = metrics.originY + first[0] * cs + pad + dip;
  const w = (isHoriz ? fleet.size * cs : cs) - pad * 2;
  const h = (isHoriz ? cs : fleet.size * cs) - pad * 2;

  const hullPalette: Record<string, { main: string; trim: string; deck: string }> = {
    carrier: { main: "rgb(122, 152, 174)", trim: "rgb(218, 232, 242)", deck: "rgb(82, 108, 128)" },
    battleship: { main: "rgb(142, 168, 186)", trim: "rgb(255, 214, 92)", deck: "rgb(98, 122, 140)" },
    cruiser: { main: "rgb(120, 176, 196)", trim: "rgb(164, 238, 255)", deck: "rgb(78, 124, 146)" },
    submarine: { main: "rgb(76, 154, 158)", trim: "rgb(255, 214, 92)", deck: "rgb(52, 114, 120)" },
    destroyer: { main: "rgb(148, 184, 172)", trim: "rgb(236, 248, 242)", deck: "rgb(96, 132, 122)" }
  };
  const pal = hullPalette[fleet.name] ?? hullPalette.destroyer;
  const mainColor = options.sunk ? COLORS.SHIP_SUNK : pal.main;
  const deckColor = options.sunk ? "rgb(68, 36, 46)" : pal.deck;
  const trimColor = options.sunk ? "rgb(176, 112, 118)" : pal.trim;

  ctx.save?.();
  if (options.ghost) {
    ctx.globalAlpha = 0.52;
  } else if (options.sunk) {
    ctx.globalAlpha = 0.92;
  }

  ctx.fillStyle = mainColor;
  ctx.strokeStyle = options.selected ? COLORS.GOLD : trimColor;
  ctx.lineWidth = options.selected ? 3 : 2;
  ctx.beginPath();
  if (fleet.name === "submarine") {
    const r = Math.min(w, h) * 0.48;
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  } else if (isHoriz) {
    const bow = Math.min(cs * 0.42, w * 0.24);
    ctx.moveTo(x + 4, y + 2);
    ctx.lineTo(x + w - bow, y + 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - bow, y + h - 2);
    ctx.lineTo(x + 4, y + h - 2);
    ctx.lineTo(x, y + h * 0.72);
    ctx.lineTo(x, y + h * 0.28);
    ctx.closePath?.();
  } else {
    const bow = Math.min(cs * 0.42, h * 0.24);
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w - 2, y + bow);
    ctx.lineTo(x + w - 2, y + h - 4);
    ctx.lineTo(x + w * 0.72, y + h);
    ctx.lineTo(x + w * 0.28, y + h);
    ctx.lineTo(x + 2, y + h - 4);
    ctx.lineTo(x + 2, y + bow);
    ctx.closePath?.();
  }
  ctx.fill();
  ctx.stroke();

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.fillStyle = deckColor;
  if (fleet.name === "carrier") {
    if (isHoriz) {
      ctx.fillRect(x + 8, y + 6, w - 24, h - 12);
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2;
      ctx.setLineDash?.([6, 6]);
      ctx.beginPath();
      ctx.moveTo(x + 12, cy);
      ctx.lineTo(x + w - 18, cy);
      ctx.stroke();
      ctx.setLineDash?.([]);
      ctx.fillStyle = trimColor;
      ctx.fillRect(x + w * 0.56, y + 4, Math.max(8, cs * 0.28), Math.max(6, h * 0.26));
    } else {
      ctx.fillRect(x + 6, y + 14, w - 12, h - 22);
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2;
      ctx.setLineDash?.([6, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, y + 18);
      ctx.lineTo(cx, y + h - 10);
      ctx.stroke();
      ctx.setLineDash?.([]);
      ctx.fillStyle = trimColor;
      ctx.fillRect(x + w - Math.max(10, w * 0.34), y + h * 0.48, Math.max(6, w * 0.26), Math.max(8, cs * 0.28));
    }
  } else if (fleet.name === "battleship") {
    const rTurret = Math.max(4, Math.round(Math.min(w, h) * 0.22));
    const positions = isHoriz
      ? [
          [x + w * 0.28, cy],
          [x + w * 0.68, cy]
        ]
      : [
          [cx, y + h * 0.32],
          [cx, y + h * 0.72]
        ];
    for (const [tx, ty] of positions) {
      ctx.fillStyle = deckColor;
      ctx.beginPath();
      ctx.arc(tx, ty, rTurret, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (isHoriz) {
        ctx.moveTo(tx, ty - 2);
        ctx.lineTo(tx + rTurret + 6, ty - 2);
        ctx.moveTo(tx, ty + 2);
        ctx.lineTo(tx + rTurret + 6, ty + 2);
      } else {
        ctx.moveTo(tx - 2, ty);
        ctx.lineTo(tx - 2, ty - rTurret - 6);
        ctx.moveTo(tx + 2, ty);
        ctx.lineTo(tx + 2, ty - rTurret - 6);
      }
      ctx.stroke();
    }
  } else if (fleet.name === "submarine") {
    const rTower = Math.max(4, Math.round(Math.min(w, h) * 0.22));
    ctx.fillStyle = deckColor;
    ctx.beginPath();
    ctx.arc(cx, cy, rTower, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, rTower * 0.45), 0, Math.PI * 2);
    ctx.fill();
  } else if (fleet.name === "cruiser") {
    const bw = isHoriz ? w * 0.36 : w * 0.5;
    const bh = isHoriz ? h * 0.5 : h * 0.36;
    ctx.fillStyle = deckColor;
    ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(3, Math.min(w, h) * 0.16), 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const r = Math.max(3, Math.round(Math.min(w, h) * 0.18));
    ctx.fillStyle = deckColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = trimColor;
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
  }

  if (options.sunk) {
    ctx.strokeStyle = COLORS.BLUE;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const t = (options.clock * 0.8 + i * 0.33) % 1;
      const bx = x + w * (0.25 + i * 0.25);
      const by = y + h * 0.75 - t * Math.min(h, 24);
      ctx.globalAlpha = 0.65 * (1 - t);
      ctx.beginPath();
      ctx.arc(bx, by, 2.2 + i * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore?.();
}

export function drawHitFlame(ctx: CanvasContextLike, cell: Rect, clock: number): void {
  const cx = cell.x + cell.width / 2;
  const cy = cell.y + cell.height / 2;
  const pulse = 1 + 0.14 * Math.sin(clock * 11 + cell.x * 0.1);
  const rOuter = Math.max(7, cell.width * 0.26) * pulse;
  const rInner = rOuter * 0.55;

  ctx.save?.();
  ctx.fillStyle = COLORS.CORAL;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, rOuter, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.GOLD;
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgb(255, 246, 210)";
  ctx.lineWidth = 2.5;
  const pad = Math.round(cell.width * 0.28);
  ctx.beginPath();
  ctx.moveTo(cell.x + pad, cell.y + pad);
  ctx.lineTo(cell.x + cell.width - pad, cell.y + cell.height - pad);
  ctx.moveTo(cell.x + cell.width - pad, cell.y + pad);
  ctx.lineTo(cell.x + pad, cell.y + cell.height - pad);
  ctx.stroke();
  ctx.restore?.();
}

export function drawMissSplash(ctx: CanvasContextLike, cell: Rect): void {
  const cx = cell.x + cell.width / 2;
  const cy = cell.y + cell.height / 2;
  const r = Math.max(5, Math.round(cell.width * 0.18));
  ctx.save?.();
  ctx.strokeStyle = COLORS.BLUE;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = COLORS.INK;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2.5, r * 0.42), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore?.();
}

export function drawCaptainPortrait(
  ctx: CanvasContextLike,
  rect: Rect,
  captain: CaptainInfo
): void {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2 + 4;
  const r = Math.min(rect.width, rect.height) * 0.34;
  const hatColor =
    captain.difficulty === "easy"
      ? COLORS.BLUE
      : captain.difficulty === "hard"
        ? COLORS.PURPLE
        : COLORS.GOLD;

  ctx.save?.();
  ctx.fillStyle = COLORS.CARD;
  ctx.strokeStyle = hatColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, rect.y + rect.height / 2, Math.min(rect.width, rect.height) * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgb(255, 224, 186)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hatColor;
  ctx.fillRect(cx - r * 0.95, cy - r * 1.15, r * 1.9, r * 0.5);
  ctx.fillStyle = COLORS.NAVY;
  ctx.fillRect(cx - r * 1.05, cy - r * 0.72, r * 2.1, r * 0.2);

  ctx.fillStyle = COLORS.NAVY;
  ctx.beginPath();
  ctx.arc(cx - r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.NAVY;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (captain.mood === "shocked") {
    ctx.arc(cx, cy + r * 0.36, r * 0.22, 0, Math.PI * 2);
  } else if (captain.mood === "defeated") {
    ctx.arc(cx, cy + r * 0.58, r * 0.3, Math.PI * 1.15, Math.PI * 1.85);
  } else {
    ctx.arc(cx, cy + r * 0.2, r * 0.32, Math.PI * 0.15, Math.PI * 0.85);
  }
  ctx.stroke();
  ctx.restore?.();
}

export function drawHitBurst(ctx: CanvasContextLike, burst: HitBurst): void {
  const progress = 1 - burst.life / burst.maxLife;
  const scaleBoost = burst.enormous ? 2.15 : burst.isSunk ? 1.65 : 1.08;
  const baseR = burst.cellSize * 0.52 * scaleBoost;
  const cx = burst.x;
  const cy = burst.y;

  ctx.save?.();

  // Enormous white-hot shockwave flash halo on ship sink / victory blasts.
  if ((burst.isSunk || burst.enormous) && progress < 0.42) {
    const pf = progress / 0.42;
    const haloR = baseR * (0.65 + 1.35 * pf);
    ctx.globalAlpha = Math.max(0, 0.78 * (1 - pf));
    ctx.fillStyle = "rgb(255, 248, 206)";
    ctx.beginPath();
    ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
    ctx.fill();
  }

  if (progress < 0.78) {
    const p0 = progress / 0.78;
    const jolt = Math.sin(p0 * Math.PI * 6) * (burst.enormous ? 6 : 4) * (1 - p0);
    const segW = burst.cellSize * 0.72;
    const segH = burst.cellSize * 0.5;
    ctx.globalAlpha = Math.max(0, 0.85 * (1 - p0));
    ctx.fillStyle = "rgb(92, 54, 62)";
    ctx.strokeStyle = COLORS.ORANGE;
    ctx.lineWidth = 2.2;
    ctx.fillRect(cx - segW / 2 + jolt, cy - segH / 2, segW, segH);
    ctx.strokeRect(cx - segW / 2 + jolt, cy - segH / 2, segW, segH);

    ctx.strokeStyle = "rgb(255, 240, 178)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - segW * 0.34 + jolt, cy - segH * 0.25);
    ctx.lineTo(cx - 2 + jolt, cy + 2);
    ctx.lineTo(cx + segW * 0.32 + jolt, cy + segH * 0.28);
    ctx.moveTo(cx + segW * 0.24 + jolt, cy - segH * 0.28);
    ctx.lineTo(cx - 2 + jolt, cy + 2);
    ctx.lineTo(cx - segW * 0.22 + jolt, cy + segH * 0.3);
    ctx.stroke();
  }

  if (progress < 0.62) {
    const p1 = progress / 0.62;
    const outerR = baseR * (0.52 + 1.18 * Math.sin(p1 * Math.PI * 0.75));
    const innerR = outerR * 0.44;
    const rays = burst.isSunk || burst.enormous ? 12 : 8;
    ctx.globalAlpha = Math.max(0, 1 - p1 * 0.85);
    ctx.fillStyle = p1 < 0.3 ? "rgb(255, 252, 224)" : COLORS.GOLD;
    ctx.beginPath();
    for (let i = 0; i < rays * 2; i++) {
      const ang = (Math.PI * i) / rays + p1 * 0.35;
      const rad = i % 2 === 0 ? outerR : innerR;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath?.();
    ctx.fill();

    const jetH = baseR * (0.95 + p1 * 1.25);
    const jetW = baseR * 0.38 * (1 - p1 * 0.35);
    ctx.fillStyle = COLORS.ORANGE;
    ctx.beginPath();
    ctx.moveTo(cx - jetW, cy);
    ctx.lineTo(cx, cy - jetH);
    ctx.lineTo(cx + jetW, cy);
    ctx.closePath?.();
    ctx.fill();
  }

  if (progress < 0.78) {
    const p2 = progress / 0.78;
    const fireR = baseR * (0.3 + 0.82 * Math.sin(p2 * Math.PI));
    ctx.globalAlpha = Math.max(0, 0.96 * (1 - p2 * 0.72));
    ctx.fillStyle = COLORS.CORAL;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, fireR), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.ORANGE;
    ctx.beginPath();
    ctx.arc(cx, cy - fireR * 0.12, Math.max(2, fireR * 0.74), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.GOLD;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1.5, fireR * 0.48), 0, Math.PI * 2);
    ctx.fill();
  }

  if (progress > 0.1) {
    const p3 = (progress - 0.1) / 0.9;
    if (burst.isSunk || burst.enormous) {
      // Rising mushroom cloud stem + boiling cap for huge sink explosions.
      ctx.globalAlpha = Math.max(0, 0.72 * (1 - p3 * 0.85));
      ctx.fillStyle = "rgb(255, 174, 92)";
      const stemH = baseR * (0.4 + p3 * 1.15);
      ctx.fillRect(cx - baseR * 0.16, cy - stemH, baseR * 0.32, stemH);
      const capY = cy - stemH;
      const capR = baseR * (0.38 + p3 * 0.44);
      ctx.fillStyle = p3 < 0.45 ? COLORS.CORAL : "rgb(206, 222, 234)";
      ctx.beginPath();
      ctx.arc(cx - capR * 0.55, capY + 4, capR * 0.68, 0, Math.PI * 2);
      ctx.arc(cx + capR * 0.55, capY + 4, capR * 0.68, 0, Math.PI * 2);
      ctx.arc(cx, capY - capR * 0.2, capR * 0.84, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const puffs: [number, number, number][] = [
        [-baseR * 0.34, -p3 * baseR * 1.05, 0.3],
        [baseR * 0.3, -p3 * baseR * 1.25, 0.26],
        [0, -p3 * baseR * 1.5, 0.35]
      ];
      ctx.fillStyle = "rgb(212, 226, 236)";
      ctx.globalAlpha = Math.max(0, 0.65 * (1 - p3));
      for (const [dx, dy, rFrac] of puffs) {
        ctx.beginPath();
        ctx.arc(cx + dx * (0.6 + p3 * 0.6), cy + dy, baseR * rFrac * (0.7 + p3 * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore?.();
}

function drawSideShipHalf(
  ctx: CanvasContextLike,
  fleetName: FleetName,
  side: "stern" | "bow",
  cx: number,
  waterY: number,
  shipW: number,
  shipH: number,
  splitGap: number,
  sinkY: number,
  tilt: number,
  flash: boolean
): void {
  const halfW = shipW / 2;
  const pivotX = side === "stern" ? cx - splitGap : cx + splitGap;
  const pivotY = waterY - shipH * 0.25 + sinkY;
  const hullFill = flash ? "rgb(255, 224, 146)" : fleetName === "submarine" ? "rgb(62, 136, 142)" : "rgb(122, 152, 174)";
  const hullDark = flash ? "rgb(255, 168, 92)" : fleetName === "submarine" ? "rgb(42, 98, 106)" : "rgb(78, 104, 126)";
  const trim = flash ? "rgb(255, 250, 228)" : COLORS.GOLD;

  ctx.fillStyle = hullFill;
  ctx.strokeStyle = trim;
  ctx.lineWidth = 2;

  if (side === "stern") {
    const leftX = pivotX - halfW;
    const topY = waterY - shipH + sinkY;
    const botY = waterY + 6 + sinkY;
    const pts: [number, number][] = [
      [leftX + 8, topY],
      [pivotX, topY],
      [pivotX - 7, (topY + botY) / 2],
      [pivotX, botY],
      [leftX + 18, botY],
      [leftX, topY + shipH * 0.45]
    ];
    drawRotatedPoly(ctx, pts, pivotX, pivotY, -tilt);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hullDark;
    if (fleetName === "carrier") {
      const deck: [number, number][] = [
        [leftX + 2, topY - 7],
        [pivotX, topY - 7],
        [pivotX, topY + 2],
        [leftX + 4, topY + 2]
      ];
      drawRotatedPoly(ctx, deck, pivotX, pivotY, -tilt);
      ctx.fill();
      const island: [number, number][] = [
        [leftX + halfW * 0.36, topY - 30],
        [leftX + halfW * 0.68, topY - 30],
        [leftX + halfW * 0.72, topY - 7],
        [leftX + halfW * 0.32, topY - 7]
      ];
      drawRotatedPoly(ctx, island, pivotX, pivotY, -tilt);
      ctx.fill();
    } else if (fleetName === "submarine") {
      const fin: [number, number][] = [
        [leftX + 12, topY - 10],
        [leftX + 24, topY - 10],
        [leftX + 28, topY + 2],
        [leftX + 10, topY + 2]
      ];
      drawRotatedPoly(ctx, fin, pivotX, pivotY, -tilt);
      ctx.fill();
    } else {
      const funnel: [number, number][] = [
        [leftX + halfW * 0.42, topY - 24],
        [leftX + halfW * 0.72, topY - 24],
        [leftX + halfW * 0.78, topY],
        [leftX + halfW * 0.36, topY]
      ];
      drawRotatedPoly(ctx, funnel, pivotX, pivotY, -tilt);
      ctx.fill();
    }
  } else {
    const rightX = pivotX + halfW;
    const topY = waterY - shipH + sinkY;
    const botY = waterY + 6 + sinkY;
    const pts: [number, number][] = [
      [pivotX, topY],
      [rightX, topY - 4],
      [rightX - 18, botY],
      [pivotX, botY],
      [pivotX + 7, (topY + botY) / 2]
    ];
    drawRotatedPoly(ctx, pts, pivotX, pivotY, tilt);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hullDark;
    if (fleetName === "carrier") {
      const deck: [number, number][] = [
        [pivotX, topY - 7],
        [rightX + 4, topY - 7],
        [rightX, topY + 2],
        [pivotX, topY + 2]
      ];
      drawRotatedPoly(ctx, deck, pivotX, pivotY, tilt);
      ctx.fill();
    } else if (fleetName === "submarine") {
      const tower: [number, number][] = [
        [pivotX + 10, topY - 24],
        [pivotX + 42, topY - 24],
        [pivotX + 46, topY + 2],
        [pivotX + 6, topY + 2]
      ];
      drawRotatedPoly(ctx, tower, pivotX, pivotY, tilt);
      ctx.fill();
      const peri: [number, number][] = [
        [pivotX + 24, topY - 40],
        [pivotX + 34, topY - 40],
        [pivotX + 34, topY - 35],
        [pivotX + 28, topY - 35],
        [pivotX + 28, topY - 24],
        [pivotX + 24, topY - 24]
      ];
      ctx.fillStyle = trim;
      drawRotatedPoly(ctx, peri, pivotX, pivotY, tilt);
      ctx.fill();
    } else if (fleetName === "battleship") {
      const bridge: [number, number][] = [
        [pivotX + 6, topY - 28],
        [pivotX + 40, topY - 28],
        [pivotX + 46, topY],
        [pivotX + 4, topY]
      ];
      drawRotatedPoly(ctx, bridge, pivotX, pivotY, tilt);
      ctx.fill();
      const gun: [number, number][] = [
        [pivotX + 52, topY - 12],
        [pivotX + 74, topY - 12],
        [pivotX + 78, topY],
        [pivotX + 48, topY]
      ];
      drawRotatedPoly(ctx, gun, pivotX, pivotY, tilt);
      ctx.fill();
      ctx.strokeStyle = trim;
      ctx.lineWidth = 3;
      const [g1x, g1y] = rotatePoint(pivotX + 72, topY - 9, pivotX, pivotY, tilt);
      const [g2x, g2y] = rotatePoint(pivotX + 102, topY - 17, pivotX, pivotY, tilt);
      ctx.beginPath();
      ctx.moveTo(g1x, g1y);
      ctx.lineTo(g2x, g2y);
      ctx.stroke();
    } else {
      const bridge: [number, number][] = [
        [pivotX + 8, topY - 22],
        [pivotX + 38, topY - 22],
        [pivotX + 42, topY],
        [pivotX + 6, topY]
      ];
      drawRotatedPoly(ctx, bridge, pivotX, pivotY, tilt);
      ctx.fill();
      const mast: [number, number][] = [
        [pivotX + 22, topY - 36],
        [pivotX + 26, topY - 36],
        [pivotX + 26, topY - 22],
        [pivotX + 22, topY - 22]
      ];
      ctx.fillStyle = trim;
      drawRotatedPoly(ctx, mast, pivotX, pivotY, tilt);
      ctx.fill();
    }
  }
}

export function drawBattleCam(
  ctx: CanvasContextLike,
  painter: Painter,
  rect: Rect,
  cam: BattleCam,
  clock: number
): void {
  const t = Math.max(0, Math.min(1, 1 - cam.life / cam.maxLife));
  const impactT = 0.24;
  const hitShake =
    t >= impactT && t < 0.72 ? Math.sin(clock * 105) * 10 * (1 - (t - impactT) / 0.48) : 0;

  ctx.save?.();
  ctx.fillStyle = "rgba(6, 20, 34, 0.72)";
  ctx.fillRect(rect.x - 10, rect.y - 10, rect.width + 20, rect.height + 20);
  painter.panel(rect, COLORS.PANEL, 18);

  const inner: Rect = {
    x: rect.x + 12,
    y: rect.y + 42,
    width: rect.width - 24,
    height: rect.height - 88
  };
  const waterY = inner.y + Math.round(inner.height * 0.64);
  const skyFlash = t >= impactT && t < 0.46 ? Math.sin(((t - impactT) / 0.18) * Math.PI) : 0;

  ctx.fillStyle =
    skyFlash > 0.35
      ? "rgb(246, 152, 82)"
      : cam.isEnemy
        ? "rgb(36, 124, 184)"
        : "rgb(98, 56, 78)";
  ctx.fillRect(inner.x, inner.y, inner.width, waterY - inner.y);

  ctx.fillStyle = skyFlash > 0.35 ? "rgb(255, 224, 140)" : "rgb(112, 198, 240)";
  ctx.fillRect(inner.x, waterY - 14, inner.width, 14);

  ctx.fillStyle = "rgba(240, 249, 255, 0.78)";
  const cloudShift = t * 18;
  const clouds: [number, number, number][] = [
    [inner.x + 86 + cloudShift, inner.y + 34, 16],
    [inner.x + 104 + cloudShift, inner.y + 30, 20],
    [inner.x + 122 + cloudShift, inner.y + 35, 14],
    [inner.x + inner.width - 110 + cloudShift * 0.6, inner.y + 42, 14],
    [inner.x + inner.width - 92 + cloudShift * 0.6, inner.y + 38, 18]
  ];
  for (const [cx, cy, cr] of clouds) {
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgb(18, 86, 138)";
  ctx.fillRect(inner.x, waterY, inner.width, inner.y + inner.height - waterY);

  const shipCx = inner.x + inner.width / 2 + hitShake;
  const shipW = Math.min(270, inner.width * 0.56);
  const shipH = 34;
  const sinkP = t > impactT ? Math.max(0, (t - impactT) / (1 - impactT)) : 0;
  const splitGap = sinkP * 16;
  const tilt = sinkP * 0.58;
  const sinkY = sinkP * 54;
  const isFlash = t >= impactT && t < 0.38;

  drawSideShipHalf(ctx, cam.fleetName, "stern", shipCx, waterY, shipW, shipH, splitGap, sinkY, tilt, isFlash);
  drawSideShipHalf(ctx, cam.fleetName, "bow", shipCx, waterY, shipW, shipH, splitGap, sinkY, tilt, isFlash);

  if (t < impactT) {
    const p = t / impactT;
    const sx = inner.x + 40 + (shipCx - inner.x - 40) * p;
    const sy = inner.y + 12 + (waterY - 16 - inner.y - 12) * p;
    const tx = inner.x + 40 + (shipCx - inner.x - 40) * Math.max(0, p - 0.22);
    const ty = inner.y + 12 + (waterY - 16 - inner.y - 12) * Math.max(0, p - 0.22);
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.fillStyle = "rgb(255, 250, 224)";
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (t >= impactT) {
    const ep = Math.min(1, (t - impactT) / 0.72);
    const ex = shipCx;
    const ey = waterY - 14;
    // Giant cascading explosions across center, bow, and stern!
    const blasts: [number, number, number, number][] = [
      [0, 0, 0.0, 1.25],
      [-74, 4, 0.12, 0.82],
      [76, 2, 0.22, 0.88]
    ];
    for (const [bxOff, byOff, startP, scale] of blasts) {
      if (ep < startP) {
        continue;
      }
      const lp = Math.min(1, (ep - startP) / 0.62);
      if (lp >= 1) {
        continue;
      }
      const bx = ex + bxOff;
      const by = ey + byOff;
      const outerR = (38 + 82 * Math.sin(lp * Math.PI * 0.78)) * scale;
      const innerR = outerR * 0.44;
      ctx.globalAlpha = Math.max(0, 1 - lp * 0.82);
      ctx.fillStyle = lp < 0.28 ? "rgb(255, 252, 224)" : COLORS.GOLD;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const ang = (Math.PI * i) / 12 + lp * 0.35;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = bx + Math.cos(ang) * r;
        const py = by + Math.sin(ang) * r;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath?.();
      ctx.fill();

      ctx.fillStyle = COLORS.CORAL;
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(5, outerR * 0.62), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.ORANGE;
      ctx.beginPath();
      ctx.arc(bx, by - outerR * 0.08, Math.max(4, outerR * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }

    // Towering fiery mushroom cloud & giant water geysers
    if (ep < 0.92) {
      const mp = Math.min(1, ep / 0.92);
      ctx.globalAlpha = Math.max(0, 0.88 * (1 - mp * 0.62));
      const stemH = 26 + mp * 94;
      ctx.fillStyle = mp < 0.45 ? COLORS.ORANGE : "rgb(214, 226, 236)";
      ctx.fillRect(ex - 18, waterY - stemH, 36, stemH);
      const capR = 26 + mp * 34;
      const capY = waterY - stemH;
      ctx.fillStyle = mp < 0.42 ? COLORS.CORAL : "rgb(206, 222, 234)";
      ctx.beginPath();
      ctx.arc(ex - capR * 0.65, capY + 6, capR * 0.72, 0, Math.PI * 2);
      ctx.arc(ex + capR * 0.65, capY + 6, capR * 0.72, 0, Math.PI * 2);
      ctx.arc(ex, capY - capR * 0.2, capR * 0.92, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgb(220, 246, 255)";
      const gh = 78 * Math.sin(mp * Math.PI);
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(ex + dir * 56 - 14, waterY + 6);
        ctx.lineTo(ex + dir * 68, waterY - gh);
        ctx.lineTo(ex + dir * 56 + 14, waterY + 6);
        ctx.closePath?.();
        ctx.fill();
      }

      // Flying dark hull debris chunks arcing across the Battle Cam sky
      ctx.fillStyle = "rgb(62, 78, 92)";
      for (let i = 0; i < 8; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        const dx = dir * (28 + i * 18) * mp;
        const dy = -(75 + (i % 3) * 28) * mp + 115 * mp * mp;
        ctx.fillRect(ex + dx - 5, ey + dy - 3, 10, 6);
      }
    }

    // Extra celebratory sky fireworks during Victory Grand Finale Battle Cam!
    if (cam.victory) {
      const fwColors = [COLORS.GOLD, COLORS.GREEN, COLORS.CORAL, COLORS.BLUE, COLORS.PURPLE];
      for (let f = 0; f < 4; f++) {
        const fx = inner.x + inner.width * (0.16 + f * 0.23);
        const fy = inner.y + 34 + (f % 2) * 26;
        const fp = (ep * 1.4 + f * 0.25) % 1;
        ctx.globalAlpha = Math.max(0, 1 - fp);
        ctx.fillStyle = fwColors[f % fwColors.length];
        for (let k = 0; k < 8; k++) {
          const ang = (Math.PI * 2 * k) / 8;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(ang) * fp * 34, fy + Math.sin(ang) * fp * 34, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "rgb(14, 72, 122)";
  ctx.fillRect(inner.x, waterY + 6, inner.width, inner.y + inner.height - (waterY + 6));
  ctx.strokeStyle = "rgb(168, 232, 255)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let wx = inner.x; wx <= inner.x + inner.width; wx += 18) {
    const wy = waterY + 6 + Math.sin(clock * 8 + wx * 0.08) * 3.5;
    if (wx === inner.x) {
      ctx.moveTo(wx, wy);
    } else {
      ctx.lineTo(wx, wy);
    }
  }
  ctx.stroke();

  painter.strokeRoundRect(rect, cam.isEnemy ? COLORS.GOLD : COLORS.CORAL, 3, 18);
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(inner.x, inner.y, inner.width, inner.height);

  ctx.fillStyle = COLORS.CORAL;
  ctx.beginPath();
  ctx.arc(rect.x + 26, rect.y + 22, 6, 0, Math.PI * 2);
  ctx.fill();
  painter.text(
    "BATTLE CAM",
    { x: rect.x + 40, y: rect.y + 12, width: 160, height: 24 },
    20,
    COLORS.GOLD,
    "left",
    "800"
  );
  painter.text(
    "Click or Esc to skip",
    { x: rect.x + rect.width - 210, y: rect.y + 14, width: 192, height: 22 },
    16,
    COLORS.MUTED,
    "right"
  );
  painter.text(
    cam.title,
    { x: rect.x + 16, y: rect.y + rect.height - 40, width: rect.width - 32, height: 28 },
    24,
    cam.isEnemy ? COLORS.GOLD : COLORS.CORAL,
    "center",
    "800"
  );
  ctx.restore?.();
}
