import { Fleet } from "./fleet";
import {
  CanvasContextLike,
  CaptainInfo,
  COLORS,
  GridMetrics,
  Rect
} from "./types";

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

export function drawShipHull(
  ctx: CanvasContextLike,
  fleet: Fleet,
  metrics: GridMetrics,
  options: {
    sunk: boolean;
    ghost?: boolean;
    selected?: boolean;
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
  const x = metrics.originX + first[1] * cs + pad;
  const y = metrics.originY + first[0] * cs + pad;
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

  // Pointed hull polygon for horizontal or vertical orientation.
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

  // Inner deck details unique to each ship class.
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

  // Rising bubbles on sunk ships.
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
  // Portrait circle backdrop
  ctx.fillStyle = COLORS.CARD;
  ctx.strokeStyle = hatColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, rect.y + rect.height / 2, Math.min(rect.width, rect.height) * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Face
  ctx.fillStyle = "rgb(255, 224, 186)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = hatColor;
  ctx.fillRect(cx - r * 0.95, cy - r * 1.15, r * 1.9, r * 0.5);
  ctx.fillStyle = COLORS.NAVY;
  ctx.fillRect(cx - r * 1.05, cy - r * 0.72, r * 2.1, r * 0.2);

  // Eyes
  ctx.fillStyle = COLORS.NAVY;
  ctx.beginPath();
  ctx.arc(cx - r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.34, cy - r * 0.12, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Mouth based on mood
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
