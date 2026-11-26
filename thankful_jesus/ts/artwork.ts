import { LEAF_COLORS, PALETTE, TREE_LEAF_SLOTS } from "./constants";
import { LeafColor, PrayerLeaf, StickerId, TileIconId } from "./types";

function safeR(val: number): number {
  return Number.isFinite(val) ? Math.max(0.5, val) : 0.5;
}

export function safeArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  start: number,
  end: number,
  ccw = false
): void {
  ctx.arc(x, y, safeR(r), start, end, ccw);
}

export function safeEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  start: number,
  end: number
): void {
  ctx.ellipse(x, y, safeR(rx), safeR(ry), rot, start, end);
}

function safeRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): CanvasGradient {
  return ctx.createRadialGradient(x0, y0, Math.max(0, safeR(r0)), x1, y1, safeR(r1));
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(58, 40, 24, 0.16)";
  ctx.beginPath();
  safeEllipse(ctx, cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  fill: string,
  stroke: string = PALETTE.ink
): void {
  const rOut = safeR(outerR);
  const rIn = safeR(rOut * 0.46);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? rOut : rIn;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(angle) * rad;
    const py = cy + Math.sin(angle) * rad;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  const grad = ctx.createLinearGradient(cx, cy - rOut, cx, cy + rOut);
  grad.addColorStop(0, "#FFF3B0");
  grad.addColorStop(0.45, fill);
  grad.addColorStop(1, fill);
  ctx.fillStyle = fill === "#E4D7C5" ? fill : grad;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, rOut * 0.1);
  ctx.strokeStyle = stroke;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Soft star sheen
  if (fill !== "#E4D7C5") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.beginPath();
    safeArc(ctx, cx - rOut * 0.16, cy - rOut * 0.22, rOut * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string
): void {
  const s = safeR(size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.68);
  ctx.bezierCurveTo(-s * 1.12, -s * 0.05, -s * 0.85, -s * 0.92, 0, -s * 0.32);
  ctx.bezierCurveTo(s * 0.85, -s * 0.92, s * 1.12, -s * 0.05, 0, s * 0.68);
  ctx.closePath();
  const g = ctx.createLinearGradient(-s, -s, s, s);
  g.addColorStop(0, "#FFAD99");
  g.addColorStop(0.35, fill);
  g.addColorStop(1, fill);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, s * 0.13);
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  safeEllipse(ctx, -s * 0.32, -s * 0.26, s * 0.18, s * 0.11, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCross(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string = PALETTE.sunGold
): void {
  const s = safeR(size);
  const bar = s * 0.34;
  ctx.save();
  ctx.translate(cx, cy);
  const grad = ctx.createLinearGradient(-s * 0.5, -s, s * 0.5, s);
  grad.addColorStop(0, "#FFF3BD");
  grad.addColorStop(0.45, fill);
  grad.addColorStop(1, fill);
  ctx.fillStyle = grad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = Math.max(1.4, s * 0.11);
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-bar / 2, -s);
  ctx.lineTo(bar / 2, -s);
  ctx.lineTo(bar / 2, -bar / 2 - s * 0.12);
  ctx.lineTo(s * 0.72, -bar / 2 - s * 0.12);
  ctx.lineTo(s * 0.72, bar / 2 - s * 0.12);
  ctx.lineTo(bar / 2, bar / 2 - s * 0.12);
  ctx.lineTo(bar / 2, s);
  ctx.lineTo(-bar / 2, s);
  ctx.lineTo(-bar / 2, bar / 2 - s * 0.12);
  ctx.lineTo(-s * 0.72, bar / 2 - s * 0.12);
  ctx.lineTo(-s * 0.72, -bar / 2 - s * 0.12);
  ctx.lineTo(-bar / 2, -bar / 2 - s * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: LeafColor,
  tilt = 0
): void {
  const s = safeR(size);
  const spec = LEAF_COLORS[color];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // Soft leaf body with warm top highlight gradient
  const grad = ctx.createLinearGradient(-s * 0.6, -s, s * 0.6, s);
  grad.addColorStop(0, "#FFF3CC");
  grad.addColorStop(0.28, spec.fill);
  grad.addColorStop(1, spec.vein);

  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.85, -s * 0.45, s * 0.72, s * 0.45, 0, s);
  ctx.bezierCurveTo(-s * 0.72, s * 0.45, -s * 0.85, -s * 0.45, 0, -s);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, s * 0.11);
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Midrib and delicate side veins
  ctx.strokeStyle = "rgba(255, 251, 236, 0.55)";
  ctx.lineWidth = Math.max(1.0, s * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.68);
  ctx.lineTo(0, s * 1.15);
  ctx.moveTo(0, -s * 0.15);
  ctx.lineTo(s * 0.32, -s * 0.35);
  ctx.moveTo(0, s * 0.22);
  ctx.lineTo(-s * 0.32, 0);
  ctx.stroke();
  ctx.restore();
}

export function drawSunRays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  timeSec: number,
  alpha = 0.28
): void {
  const r = safeR(radius);
  ctx.save();
  ctx.translate(cx, cy);

  // Soft radial golden aura
  const aura = safeRadialGradient(ctx, 0, 0, 4, 0, 0, r);
  aura.addColorStop(0, "rgba(255, 238, 168, " + String(Math.min(0.65, alpha * 1.6)) + ")");
  aura.addColorStop(0.55, "rgba(246, 196, 83, " + String(alpha * 0.7) + ")");
  aura.addColorStop(1, "rgba(246, 196, 83, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  safeArc(ctx, 0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Gentle rotating sunbeams
  ctx.rotate(timeSec * 0.12);
  ctx.fillStyle = "rgba(255, 230, 145, " + String(alpha * 0.72) + ")";
  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const a = (i * Math.PI * 2) / rays;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a - 0.1) * r, Math.sin(a - 0.1) * r);
    ctx.lineTo(Math.cos(a + 0.1) * r, Math.sin(a + 0.1) * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawLightMotes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeSec: number
): void {
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const px = ((i * 53 + timeSec * (7 + (i % 3) * 3)) % (w - 24)) + 12;
    const py = 24 + ((i * 47 + Math.sin(timeSec * 1.4 + i) * 18) % (h * 0.65));
    const pulse = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(timeSec * 3.1 + i * 1.7));
    const r = 2 + (i % 3) * 1.1;
    ctx.fillStyle = "rgba(255, 245, 196, " + String(pulse.toFixed(2)) + ")";
    ctx.beginPath();
    safeArc(ctx, px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSoftCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Soft warm sunlit cloud underside shadow
  ctx.fillStyle = "rgba(244, 212, 184, 0.45)";
  ctx.beginPath();
  safeEllipse(ctx, 2, 10, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy warm-cream cloud puffs
  const grad = ctx.createLinearGradient(0, -20, 0, 14);
  grad.addColorStop(0, "rgba(255, 254, 250, 0.95)");
  grad.addColorStop(1, "rgba(255, 239, 216, 0.85)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  safeArc(ctx, -20, 5, 13, 0, Math.PI * 2);
  safeArc(ctx, -6, -4, 17, 0, Math.PI * 2);
  safeArc(ctx, 11, -2, 15, 0, Math.PI * 2);
  safeArc(ctx, 24, 6, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawWhiteDove(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  const flap = Math.sin(timeSec * 5.0) * 6.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Gentle luminous halo around peace dove
  const glow = safeRadialGradient(ctx, 0, 0, 2, 0, 0, 22);
  glow.addColorStop(0, "rgba(255, 250, 225, 0.55)");
  glow.addColorStop(1, "rgba(255, 250, 225, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  safeArc(ctx, 0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFDF9";
  ctx.strokeStyle = "#4A3A31";
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";

  // Tail feathers
  ctx.beginPath();
  ctx.moveTo(-9, 1);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-17, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  safeEllipse(ctx, 0, 0, 11, 5.5, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Far wing
  ctx.beginPath();
  ctx.moveTo(1, -2);
  ctx.quadraticCurveTo(6, -15 - flap * 0.45, 13, -7 - flap * 0.35);
  ctx.quadraticCurveTo(6, -3, 2, 1);
  ctx.closePath();
  ctx.fillStyle = "#F5EFE6";
  ctx.fill();
  ctx.stroke();

  // Near wing
  ctx.beginPath();
  ctx.moveTo(-2, -1);
  ctx.quadraticCurveTo(-8, -15 + flap, -18, -6 + flap * 0.7);
  ctx.quadraticCurveTo(-7, -2, -2, 2);
  ctx.closePath();
  ctx.fillStyle = "#FFFDF9";
  ctx.fill();
  ctx.stroke();

  // Eye & olive twig with two tiny leaves
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, 7, -1.5, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.oliveDark;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(10, -1);
  ctx.lineTo(18, 2);
  ctx.stroke();
  ctx.fillStyle = "#7BA86C";
  ctx.beginPath();
  safeEllipse(ctx, 15, -0.5, 2.5, 1.3, -0.5, 0, Math.PI * 2);
  safeEllipse(ctx, 17, 3, 2.5, 1.3, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGalileeBoat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  const bob = Math.sin(timeSec * 2.1) * 1.8;
  const tilt = Math.sin(timeSec * 1.7) * 0.045;
  ctx.save();
  ctx.translate(cx, cy + bob);

  // Soft water reflection underneath
  ctx.fillStyle = "rgba(85, 132, 160, 0.25)";
  ctx.beginPath();
  safeEllipse(ctx, 0, 11 * s, 18 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(tilt);
  ctx.scale(s, s);

  // Billowing warm striped sail
  const sailGrad = ctx.createLinearGradient(0, -26, 16, -2);
  sailGrad.addColorStop(0, "#FFFDF7");
  sailGrad.addColorStop(1, "#F7DFB9");
  ctx.fillStyle = sailGrad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.quadraticCurveTo(18, -15, 14, -3);
  ctx.lineTo(0, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm terracotta stripe across sail
  ctx.strokeStyle = "#D46A43";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(1, -13);
  ctx.quadraticCurveTo(9, -12, 13, -11);
  ctx.stroke();

  // Mast
  ctx.strokeStyle = "#7D4C1E";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -27);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Curved wooden hull with highlight
  const hullGrad = ctx.createLinearGradient(0, -2, 0, 9);
  hullGrad.addColorStop(0, "#C9854E");
  hullGrad.addColorStop(1, "#8C5229");
  ctx.fillStyle = hullGrad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-20, -2);
  ctx.quadraticCurveTo(0, 1, 20, -2);
  ctx.lineTo(13, 8);
  ctx.quadraticCurveTo(0, 10, -13, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDistantVillage(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Little Galilean stone houses
  const houses = [
    { dx: -16, dy: -8, w: 12, h: 9, c: "#F7E6CE" },
    { dx: -2, dy: -11, w: 14, h: 12, c: "#FFF2DF" },
    { dx: 14, dy: -7, w: 10, h: 8, c: "#EDD5B8" }
  ];
  for (let i = 0; i < houses.length; i++) {
    const hs = houses[i];
    ctx.fillStyle = hs.c;
    ctx.fillRect(hs.dx, hs.dy, hs.w, hs.h);
    ctx.fillStyle = "#C78D60";
    ctx.fillRect(hs.dx - 1, hs.dy - 2, hs.w + 2, 2.5);
    ctx.fillStyle = "#7E604C";
    ctx.fillRect(hs.dx + hs.w * 0.4, hs.dy + hs.h * 0.42, 2.5, 4);
  }

  // Slender Mediterranean cypress trees
  const trees = [-24, 11, 28];
  ctx.fillStyle = "#5F7E58";
  for (let i = 0; i < trees.length; i++) {
    ctx.beginPath();
    safeEllipse(ctx, trees[i], -9, 3, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawWildflower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  petalColor = "#FFF2A6",
  timeSec = 0
): void {
  const s = safeR(scale);
  const sway = Math.sin(timeSec * 2.2 + cx * 0.05) * 0.12;
  ctx.save();
  ctx.translate(cx, cy + 10 * s);
  ctx.rotate(sway);
  ctx.translate(0, -10 * s);
  ctx.scale(s, s);

  ctx.strokeStyle = PALETTE.oliveDark;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(2, 5, 0, 11);
  ctx.stroke();

  ctx.fillStyle = "#7EA569";
  ctx.beginPath();
  safeEllipse(ctx, 3.5, 6, 3.5, 1.5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = petalColor;
  ctx.strokeStyle = "rgba(46, 36, 30, 0.35)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    safeArc(ctx, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.sunGold;
  ctx.beginPath();
  safeArc(ctx, 0, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWheatStalk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale: number,
  timeSec: number
): void {
  const s = safeR(scale);
  const sway = Math.sin(timeSec * 1.9 + cx * 0.04) * 0.14;
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.rotate(sway);
  ctx.scale(s, s);
  ctx.strokeStyle = "#C9963B";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(3, -12, 1, -24);
  ctx.stroke();
  ctx.fillStyle = "#F2C45A";
  for (let i = 0; i < 4; i++) {
    const gy = -12 - i * 3.5;
    ctx.beginPath();
    safeEllipse(ctx, -2.5, gy, 2.6, 1.4, -0.6, 0, Math.PI * 2);
    safeEllipse(ctx, 3.5, gy - 1, 2.6, 1.4, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawGoldenFootprint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  tilt = 0
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(246, 196, 83, 0.88)";
  ctx.strokeStyle = PALETTE.terracottaDark;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  safeEllipse(ctx, 0, -4, 4.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  safeArc(ctx, 0, 6, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawHeartBurst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  timeSec: number
): void {
  const p = Math.max(0, Math.min(1, progress));
  const spread = 24 + (1 - p) * 48;
  const items = 5;
  for (let i = 0; i < items; i++) {
    const a =
      -Math.PI * 0.85 + (i / (items - 1)) * Math.PI * 0.7 + Math.sin(timeSec * 4 + i) * 0.08;
    const px = cx + Math.cos(a) * spread;
    const py = cy + Math.sin(a) * spread;
    if (i % 2 === 0) {
      drawHeart(ctx, px, py, 6.8, "#E06D53");
    } else {
      drawStar(ctx, px, py, 6.8, PALETTE.sunGold);
    }
  }
}

export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  primary: string,
  secondary: string | null,
  canvasWidth: number,
  tailX?: number
): void {
  ctx.save();
  ctx.font = "800 13px system-ui, -apple-system, sans-serif";
  const w1 = ctx.measureText(primary).width;
  let w2 = 0;
  if (secondary) {
    ctx.font = "700 12px system-ui, -apple-system, sans-serif";
    w2 = ctx.measureText(secondary).width;
  }
  const boxW = Math.min(canvasWidth - 28, Math.max(130, Math.max(w1, w2) + 30));
  const boxH = secondary ? 48 : 32;
  const x = Math.max(14, Math.min(canvasWidth - 14 - boxW, cx - boxW / 2));
  const y = Math.max(10, topY);

  // Soft storybook drop shadow
  drawRoundedRect(ctx, x + 2, y + 3, boxW, boxH, 14);
  ctx.fillStyle = "rgba(56, 38, 24, 0.14)";
  ctx.fill();

  drawRoundedRect(ctx, x, y, boxW, boxH, 14);
  const bg = ctx.createLinearGradient(x, y, x, y + boxH);
  bg.addColorStop(0, "#FFFEFA");
  bg.addColorStop(1, "#FFF2D9");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  if (typeof tailX === "number") {
    const tx = Math.max(x + 18, Math.min(x + boxW - 18, tailX));
    ctx.beginPath();
    ctx.moveTo(tx - 7, y + boxH - 1);
    ctx.lineTo(tx, y + boxH + 9);
    ctx.lineTo(tx + 7, y + boxH - 1);
    ctx.closePath();
    ctx.fillStyle = "#FFF2D9";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx - 7, y + boxH);
    ctx.lineTo(tx, y + boxH + 9);
    ctx.lineTo(tx + 7, y + boxH);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 13px system-ui, -apple-system, sans-serif";
  const trimPrimary = primary.length > 36 ? primary.slice(0, 35) + "..." : primary;
  ctx.fillText(trimPrimary, x + boxW / 2, secondary ? y + 19 : y + 21);

  if (secondary) {
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "700 12px system-ui, -apple-system, sans-serif";
    const trimSec = secondary.length > 26 ? secondary.slice(0, 25) + "..." : secondary;
    ctx.fillText(trimSec, x + boxW / 2, y + 38);
  }
  ctx.restore();
}

export function drawWindGustLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(timeSec * 8 + cy * 0.05) * 0.45);
  ctx.scale(s, s);

  // Swirling breeze lines
  ctx.strokeStyle = "rgba(110, 146, 168, 0.85)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.quadraticCurveTo(0, -14, 14, -4);
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(2, 14, 16, 4);
  ctx.stroke();

  // Dry tumbling autumn twig/leaf to dodge
  ctx.fillStyle = "#8C5835";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  safeEllipse(ctx, 0, 0, 11, 5.5, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawAdventurerTimerAndCombo(
  ctx: CanvasRenderingContext2D,
  w: number,
  timeLeftSec: number,
  totalTimeSec: number,
  streak: number
): void {
  const ratio = Math.max(0, Math.min(1, totalTimeSec > 0 ? timeLeftSec / totalTimeSec : 1));
  const barX = 16;
  const barY = 12;
  const barW = w - 32;
  const barH = 12;

  ctx.save();
  drawRoundedRect(ctx, barX, barY, barW, barH, 6);
  ctx.fillStyle = "rgba(46, 36, 30, 0.25)";
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  const fillW = Math.max(8, (barW - 4) * ratio);
  drawRoundedRect(ctx, barX + 2, barY + 2, fillW, barH - 4, 4);
  ctx.fillStyle = timeLeftSec <= 7 ? "#D94A38" : timeLeftSec <= 14 ? "#E89B2D" : "#F6C453";
  ctx.fill();

  if (streak >= 3) {
    const mult = streak >= 6 ? "x3" : "x2";
    const bx = w - 76;
    const by = 29;
    drawRoundedRect(ctx, bx, by, 60, 24, 12);
    ctx.fillStyle = streak >= 6 ? "#D46A43" : "#E5A93B";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFDF8";
    ctx.font = "800 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(mult + "!", bx + 30, by + 16);
  }
  ctx.restore();
}

export function drawStorybookFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.save();
  drawRoundedRect(ctx, 5, 5, w - 10, h - 10, 14);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(184, 122, 75, 0.36)";
  ctx.stroke();
  ctx.restore();
}

export function drawGalileeBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeSec: number
): void {
  // Luminous golden-hour Mediterranean sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, "#97CBE3");
  sky.addColorStop(0.36, "#CBE6F0");
  sky.addColorStop(0.68, "#FCE7C3");
  sky.addColorStop(1, "#FAD29F");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Warm sun radial bloom in upper right
  const sunX = w * 0.82;
  const sunY = h * 0.16;
  drawSunRays(ctx, sunX, sunY, 118, timeSec, 0.25);

  // Drifting warm rim-lit clouds
  const cloud1X = ((timeSec * 7 + w * 0.22) % (w + 96)) - 48;
  const cloud2X = ((timeSec * 4.5 + w * 0.62) % (w + 96)) - 48;
  drawSoftCloud(ctx, cloud1X, h * 0.14, 0.96);
  drawSoftCloud(ctx, cloud2X, h * 0.24, 0.78);

  // Radiant golden sun disc
  ctx.save();
  const sunGrad = safeRadialGradient(ctx, sunX - 5, sunY - 5, 4, sunX, sunY, 30);
  sunGrad.addColorStop(0, "#FFFDF0");
  sunGrad.addColorStop(0.6, "#FFE38C");
  sunGrad.addColorStop(1, "#F5B84B");
  ctx.beginPath();
  safeArc(ctx, sunX, sunY, 27, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
  ctx.restore();

  // Gentle white peace dove gliding across sky
  const doveX = ((timeSec * 15 + w * 0.15) % (w + 60)) - 30;
  const doveY = h * 0.29 + Math.sin(timeSec * 1.8) * 6;
  drawWhiteDove(ctx, doveX, doveY, 0.84, timeSec);

  // Far hazy purple-sage Galilee mountain ridge
  const farHill = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.56);
  farHill.addColorStop(0, "#C3B9C7");
  farHill.addColorStop(1, "#D9CCB8");
  ctx.fillStyle = farHill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.54);
  ctx.quadraticCurveTo(w * 0.18, h * 0.39, w * 0.44, h * 0.51);
  ctx.quadraticCurveTo(w * 0.72, h * 0.37, w, h * 0.50);
  ctx.lineTo(w, h * 0.62);
  ctx.lineTo(0, h * 0.62);
  ctx.closePath();
  ctx.fill();

  // Mid olive-sage sunlit hills
  const midHill = ctx.createLinearGradient(0, h * 0.44, 0, h * 0.58);
  midHill.addColorStop(0, "#A9BF8E");
  midHill.addColorStop(1, "#7F9F72");
  ctx.fillStyle = midHill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.56);
  ctx.quadraticCurveTo(w * 0.26, h * 0.44, w * 0.56, h * 0.54);
  ctx.quadraticCurveTo(w * 0.82, h * 0.47, w, h * 0.55);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Distant hillside Galilean village + cypresses
  drawDistantVillage(ctx, w * 0.22, h * 0.515, 0.88);

  // Shimmering Sea of Galilee with sunset reflection path
  const waterGrad = ctx.createLinearGradient(0, h * 0.54, 0, h * 0.68);
  waterGrad.addColorStop(0, "#75B5CF");
  waterGrad.addColorStop(0.5, "#92C9DD");
  waterGrad.addColorStop(1, "#6DA7C2");
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, h * 0.545, w, h * 0.13);

  // Golden sun-reflection shimmer on the water
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const wy = h * (0.558 + i * 0.017);
    const rw = (22 + i * 7) * (0.85 + 0.15 * Math.sin(timeSec * 3 + i));
    ctx.fillStyle = "rgba(255, 232, 165, " + String((0.46 - i * 0.05).toFixed(2)) + ")";
    ctx.beginPath();
    safeEllipse(ctx, sunX - 10 + Math.sin(timeSec * 2 + i) * 5, wy, rw, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Gentle water ripples + wooden fishing boat
  ctx.strokeStyle = "rgba(255, 253, 247, 0.48)";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const y = h * (0.575 + i * 0.022);
    const shift = Math.sin(timeSec * 1.4 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(w * (0.10 + i * 0.15) + shift, y);
    ctx.lineTo(w * (0.24 + i * 0.15) + shift, y);
    ctx.stroke();
  }
  drawGalileeBoat(ctx, w * 0.70 + Math.sin(timeSec * 0.35) * 14, h * 0.578, 0.74, timeSec);

  // Rich layered foreground sunlit meadow
  const meadowGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
  meadowGrad.addColorStop(0, "#BDD186");
  meadowGrad.addColorStop(0.45, "#9BB86B");
  meadowGrad.addColorStop(1, "#7B9B54");
  ctx.fillStyle = meadowGrad;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.quadraticCurveTo(w * 0.5, h * 0.59, w, h * 0.655);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Warm sunlit grass highlight crest
  ctx.strokeStyle = "rgba(255, 244, 196, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.652);
  ctx.quadraticCurveTo(w * 0.5, h * 0.592, w, h * 0.657);
  ctx.stroke();

  // Golden harvest wheat stalks & colorful wildflowers
  drawWheatStalk(ctx, w * 0.06, h * 0.94, 0.9, timeSec);
  drawWheatStalk(ctx, w * 0.11, h * 0.96, 0.78, timeSec + 0.5);
  drawWheatStalk(ctx, w * 0.94, h * 0.95, 0.88, timeSec + 1.1);

  const flowers = [
    { x: 0.09, y: 0.85, c: "#FFF5B8" },
    { x: 0.21, y: 0.91, c: "#FFD5C2" },
    { x: 0.88, y: 0.84, c: "#FFF5B8" },
    { x: 0.92, y: 0.92, c: "#E8F6FF" }
  ];
  for (let i = 0; i < flowers.length; i++) {
    drawWildflower(ctx, w * flowers[i].x, h * flowers[i].y, 0.85, flowers[i].c, timeSec);
  }

  drawLightMotes(ctx, w, h, timeSec);
}

export function drawJesus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale: number,
  pose: "welcome" | "bless" | "celebrate",
  timeSec: number
): void {
  const s = safeR(scale);
  const bob = Math.sin(timeSec * 2.2) * 1.5 * s;
  ctx.save();
  drawGroundShadow(ctx, cx, baseY + 3 * s, 26 * s, 6.5 * s);
  ctx.translate(cx, baseY + bob);
  ctx.scale(s, s);

  // Soft radiant golden-hour halo behind head
  const haloR = 30 + Math.sin(timeSec * 2.8) * 1.8;
  const haloGrad = safeRadialGradient(ctx, 0, -68, 4, 0, -68, haloR);
  haloGrad.addColorStop(0, "rgba(255, 245, 194, 0.82)");
  haloGrad.addColorStop(0.55, "rgba(246, 196, 83, 0.42)");
  haloGrad.addColorStop(1, "rgba(246, 196, 83, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  safeArc(ctx, 0, -68, haloR, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  safeArc(ctx, 0, -68, 20, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(235, 180, 68, 0.65)";
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Flowing cream linen robe with soft drapery shading
  const robeGrad = ctx.createLinearGradient(-24, -44, 24, 4);
  robeGrad.addColorStop(0, "#FFFDF9");
  robeGrad.addColorStop(0.6, "#FAF0DC");
  robeGrad.addColorStop(1, "#EAD6B5");
  ctx.beginPath();
  ctx.moveTo(-18, -44);
  ctx.lineTo(18, -44);
  ctx.quadraticCurveTo(23, -20, 26, 0);
  ctx.quadraticCurveTo(0, 7, -26, 0);
  ctx.quadraticCurveTo(-23, -20, -18, -44);
  ctx.closePath();
  ctx.fillStyle = robeGrad;
  ctx.fill();
  ctx.lineWidth = 2.3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Gentle vertical robe folds
  ctx.strokeStyle = "rgba(165, 128, 92, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -32);
  ctx.quadraticCurveTo(-11, -14, -12, 1);
  ctx.moveTo(6, -26);
  ctx.quadraticCurveTo(9, -12, 10, 1);
  ctx.stroke();

  // Warm terracotta-crimson mantle sash with subtle gold hem
  const sashGrad = ctx.createLinearGradient(-16, -44, 18, 0);
  sashGrad.addColorStop(0, "#DA5E49");
  sashGrad.addColorStop(0.55, PALETTE.sashCrimson);
  sashGrad.addColorStop(1, "#9B3325");
  ctx.beginPath();
  ctx.moveTo(-16, -44);
  ctx.lineTo(-3, -44);
  ctx.quadraticCurveTo(10, -22, 18, -1);
  ctx.lineTo(4, -1);
  ctx.quadraticCurveTo(-5, -22, -16, -44);
  ctx.closePath();
  ctx.fillStyle = sashGrad;
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gold woven trim along sash edge
  ctx.strokeStyle = "#F6C453";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-14, -41);
  ctx.quadraticCurveTo(-3, -20, 6, -3);
  ctx.stroke();

  // Arms & sleeves with gentle shading
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pose === "bless") {
    ctx.beginPath();
    ctx.moveTo(-16, -36);
    ctx.quadraticCurveTo(-31, -44, -20, -56);
    ctx.moveTo(16, -36);
    ctx.quadraticCurveTo(31, -44, 20, -56);
    ctx.strokeStyle = "#FAF0DC";
    ctx.lineWidth = 10.5;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.fillStyle = "#F3C79F";
    ctx.beginPath();
    safeArc(ctx, -20, -58, 4.6, 0, Math.PI * 2);
    safeArc(ctx, 20, -58, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const handY = pose === "celebrate" ? -51 : -34;
    ctx.beginPath();
    ctx.moveTo(-16, -36);
    ctx.lineTo(-32, handY);
    ctx.moveTo(16, -36);
    ctx.lineTo(32, handY);
    ctx.strokeStyle = "#FAF0DC";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.fillStyle = "#F3C79F";
    ctx.beginPath();
    safeArc(ctx, -33, handY, 4.6, 0, Math.PI * 2);
    safeArc(ctx, 33, handY, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Flowing chestnut hair behind head with warm highlight
  const hairGrad = ctx.createLinearGradient(-16, -82, 16, -46);
  hairGrad.addColorStop(0, "#754C2E");
  hairGrad.addColorStop(1, "#4B2E1A");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  safeEllipse(ctx, 0, -64, 17.5, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.1;
  ctx.stroke();

  // Warm gentle face with rosy cheeks
  const faceGrad = safeRadialGradient(ctx, -3, -70, 2, 0, -66, 15);
  faceGrad.addColorStop(0, "#FADAC0");
  faceGrad.addColorStop(1, "#EBB88C");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  safeArc(ctx, 0, -66, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Soft parted hair bangs
  ctx.fillStyle = "#5F3C23";
  ctx.beginPath();
  ctx.moveTo(-13, -68);
  ctx.quadraticCurveTo(-8, -81, 0, -78);
  ctx.quadraticCurveTo(8, -81, 13, -68);
  ctx.quadraticCurveTo(6, -75, 0, -73);
  ctx.quadraticCurveTo(-6, -75, -13, -68);
  ctx.closePath();
  ctx.fill();

  // Soft rosy cheeks
  ctx.fillStyle = "rgba(229, 128, 108, 0.32)";
  ctx.beginPath();
  safeEllipse(ctx, -7.2, -64, 3, 1.9, 0, 0, Math.PI * 2);
  safeEllipse(ctx, 7.2, -64, 3, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Groomed gentle beard
  ctx.fillStyle = "#5B3B24";
  ctx.beginPath();
  safeArc(ctx, 0, -62, 11.2, 0.18, Math.PI - 0.18);
  ctx.quadraticCurveTo(0, -48.5, -10.8, -60);
  ctx.closePath();
  ctx.fill();

  // Kind eyes with sparkling catchlights
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -4.5, -68, 2.0, 0, Math.PI * 2);
  safeArc(ctx, 4.5, -68, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  safeArc(ctx, -5.0, -68.7, 0.7, 0, Math.PI * 2);
  safeArc(ctx, 4.0, -68.7, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Warm joyful smile
  ctx.strokeStyle = "#FFF8EB";
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  safeArc(ctx, 0, -63, 4.2, 0.22, Math.PI - 0.22);
  ctx.stroke();

  ctx.restore();
}

export function drawChildFriend(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale: number,
  tunicColor: string,
  happy: boolean,
  timeSec: number
): void {
  const s = safeR(scale);
  const hop = happy ? Math.abs(Math.sin(timeSec * 5.8)) * 5 * s : Math.sin(timeSec * 2.5) * 1.2 * s;
  ctx.save();
  drawGroundShadow(ctx, cx, baseY + 3 * s, 17 * s, 4.5 * s);
  ctx.translate(cx, baseY - hop);
  ctx.scale(s, s);

  // Tunic body with gentle shading
  const tunicGrad = ctx.createLinearGradient(-14, -32, 16, 0);
  tunicGrad.addColorStop(0, tunicColor);
  tunicGrad.addColorStop(1, tunicColor);
  ctx.fillStyle = tunicGrad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-12, -32);
  ctx.lineTo(12, -32);
  ctx.lineTo(16, 0);
  ctx.quadraticCurveTo(0, 4, -16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Woven waist belt & tunic highlight
  ctx.fillStyle = "#F6C453";
  ctx.fillRect(-12, -16, 24, 4);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-12, -16, 24, 4);

  // Raised celebratory arms
  const armY = happy ? -40 : -20;
  ctx.beginPath();
  ctx.moveTo(-11, -26);
  ctx.lineTo(-22, armY);
  ctx.moveTo(11, -26);
  ctx.lineTo(22, armY);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Hands
  ctx.fillStyle = "#F5CAA3";
  ctx.beginPath();
  safeArc(ctx, -22, armY, 3.2, 0, Math.PI * 2);
  safeArc(ctx, 22, armY, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Head with warm skin glow
  const headGrad = safeRadialGradient(ctx, -3, -47, 2, 0, -44, 12);
  headGrad.addColorStop(0, "#FCE0C6");
  headGrad.addColorStop(1, "#EEBE93");
  ctx.fillStyle = headGrad;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  safeArc(ctx, 0, -44, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair cap with soft curls
  ctx.fillStyle = "#4A3222";
  ctx.beginPath();
  safeArc(ctx, 0, -46, 11.5, Math.PI * 0.96, Math.PI * 2.04);
  ctx.fill();
  ctx.beginPath();
  safeArc(ctx, -6, -52, 4.2, 0, Math.PI * 2);
  safeArc(ctx, 2, -54, 4.5, 0, Math.PI * 2);
  safeArc(ctx, 8, -51, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = "rgba(232, 128, 106, 0.36)";
  ctx.beginPath();
  safeEllipse(ctx, -6.2, -41.5, 2.5, 1.6, 0, 0, Math.PI * 2);
  safeEllipse(ctx, 6.2, -41.5, 2.5, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sparkling eyes & smile
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -3.8, -44.2, 1.8, 0, Math.PI * 2);
  safeArc(ctx, 3.8, -44.2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  safeArc(ctx, -4.3, -44.8, 0.65, 0, Math.PI * 2);
  safeArc(ctx, 3.3, -44.8, 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, 0, -41, 4.1, 0.18, Math.PI - 0.18);
  ctx.lineWidth = 1.7;
  ctx.stroke();

  ctx.restore();
}

export function drawBarleyLoaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  const grad = safeRadialGradient(ctx, -5, -4, 2, 0, 0, 17);
  grad.addColorStop(0, "#F8D184");
  grad.addColorStop(0.55, "#DF9D4B");
  grad.addColorStop(1, "#AE6B26");
  ctx.fillStyle = grad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  safeEllipse(ctx, 0, 0, 16.5, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#8C4E18";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-7, -5);
  ctx.lineTo(-3, 4);
  ctx.moveTo(2, -6);
  ctx.lineTo(6, 4);
  ctx.stroke();
  ctx.restore();
}

export function drawFish(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  const grad = ctx.createLinearGradient(0, -9, 0, 9);
  grad.addColorStop(0, "#B8E4F5");
  grad.addColorStop(0.5, "#74B4CE");
  grad.addColorStop(1, "#4C87A4");
  ctx.fillStyle = grad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeEllipse(ctx, -2, 0, 14.5, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(19, -7.5);
  ctx.lineTo(19, 7.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gentle fin & scale arc
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  safeArc(ctx, 0, 0, 5, -0.8, 0.8);
  ctx.stroke();

  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -8.5, -1.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  safeArc(ctx, -9, -2, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawWovenBasket(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  filledCount = 0
): void {
  const s = safeR(scale);
  ctx.save();
  drawGroundShadow(ctx, cx, cy + 20 * s, 28 * s, 5 * s);
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  if (filledCount > 0) {
    drawBarleyLoaf(ctx, -12, -10, 0.74);
    drawBarleyLoaf(ctx, 11, -10, 0.74);
    if (filledCount > 2) {
      drawFish(ctx, 0, -14, 0.72);
    }
  }

  const bGrad = ctx.createLinearGradient(-34, -8, 34, 22);
  bGrad.addColorStop(0, "#DEA05D");
  bGrad.addColorStop(0.5, "#C78747");
  bGrad.addColorStop(1, "#9B622A");
  ctx.fillStyle = bGrad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-34, -8);
  ctx.lineTo(34, -8);
  ctx.lineTo(25, 18);
  ctx.quadraticCurveTo(0, 24, -25, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Woven rim
  drawRoundedRect(ctx, -37, -12, 74, 8.5, 4);
  ctx.fillStyle = "#B37436";
  ctx.fill();
  ctx.stroke();

  // Braided cross hatch
  ctx.strokeStyle = "rgba(92, 52, 18, 0.65)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-27, 2);
  ctx.lineTo(27, 2);
  ctx.moveTo(-23, 10);
  ctx.lineTo(23, 10);
  ctx.moveTo(-15, -4);
  ctx.lineTo(-10, 18);
  ctx.moveTo(0, -4);
  ctx.lineTo(0, 20);
  ctx.moveTo(15, -4);
  ctx.lineTo(10, 18);
  ctx.stroke();

  ctx.restore();
}

export function drawBlessingToken(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  const pulse = 19 + Math.sin(timeSec * 6) * 2;
  const g = safeRadialGradient(ctx, 0, 0, 3, 0, 0, pulse);
  g.addColorStop(0, "rgba(255, 244, 178, 0.85)");
  g.addColorStop(0.6, "rgba(246, 196, 83, 0.42)");
  g.addColorStop(1, "rgba(246, 196, 83, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  safeArc(ctx, 0, 0, pulse, 0, Math.PI * 2);
  ctx.fill();
  drawStar(ctx, 0, 0, 14, PALETTE.sunGold);
  ctx.restore();
}

export function drawMarketCart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  // Colorful canopy roof
  ctx.fillStyle = "#D46A43";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -12);
  ctx.lineTo(22, -12);
  ctx.lineTo(17, -20);
  ctx.lineTo(-17, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawRoundedRect(ctx, -20, -12, 40, 20, 5);
  ctx.fillStyle = "#C38050";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#6E4427";
  ctx.beginPath();
  safeArc(ctx, -11, 12, 6, 0, Math.PI * 2);
  safeArc(ctx, 11, 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawToyBlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  drawRoundedRect(ctx, -14, -14, 28, 28, 6);
  const g = ctx.createLinearGradient(-14, -14, 14, 14);
  g.addColorStop(0, "#F39D82");
  g.addColorStop(1, "#D26B52");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  drawStar(ctx, 0, 0, 7.5, "#FFF6CC");
  ctx.restore();
}

export function drawGoldenHarp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  const shimmer = Math.sin(timeSec * 4) * 1.2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Soft golden aura behind harp
  const glow = safeRadialGradient(ctx, 0, 0, 4, 0, 0, 28);
  glow.addColorStop(0, "rgba(255, 236, 155, 0.45)");
  glow.addColorStop(1, "rgba(255, 236, 155, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  safeArc(ctx, 0, 0, 28, 0, Math.PI * 2);
  ctx.fill();

  // Golden shimmering strings
  ctx.strokeStyle = "#F8CD5C";
  ctx.lineWidth = 1.7;
  for (let i = 0; i < 4; i++) {
    const sx = -9 + i * 6;
    ctx.beginPath();
    ctx.moveTo(sx, -16 + i * 1.4);
    ctx.lineTo(sx, 14);
    ctx.stroke();
  }

  // Ornate carved lyre frame
  ctx.strokeStyle = "#B87A24";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-16, 15);
  ctx.quadraticCurveTo(-20, -14, -10, -22);
  ctx.quadraticCurveTo(4, -26 + shimmer * 0.3, 18, -12);
  ctx.lineTo(14, 15);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Base soundbox with warm wood gradient
  drawRoundedRect(ctx, -18, 12, 36, 9, 4);
  const boxG = ctx.createLinearGradient(-18, 12, 18, 21);
  boxG.addColorStop(0, "#D89A56");
  boxG.addColorStop(1, "#9B602B");
  ctx.fillStyle = boxG;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawMusicNote(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  color = "#D46A43",
  golden = false
): void {
  const s = safeR(scale);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  if (golden) {
    const g = safeRadialGradient(ctx, 0, 0, 3, 0, 0, 22);
    g.addColorStop(0, "rgba(255, 242, 168, 0.85)");
    g.addColorStop(1, "rgba(246, 196, 83, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    safeArc(ctx, 0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glossy note medallion
  const badgeG = safeRadialGradient(ctx, -4, -5, 2, 0, 0, 15);
  badgeG.addColorStop(0, "#FFF6D1");
  badgeG.addColorStop(0.38, golden ? PALETTE.sunGold : color);
  badgeG.addColorStop(1, golden ? "#D68E23" : color);
  ctx.beginPath();
  safeArc(ctx, 0, 0, 14.5, 0, Math.PI * 2);
  ctx.fillStyle = badgeG;
  ctx.fill();
  ctx.lineWidth = 2.1;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Crisp white eighth-note glyph
  ctx.fillStyle = "#FFFDF8";
  ctx.strokeStyle = "#FFFDF8";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeEllipse(ctx, -2.5, 4, 4.2, 3.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1.5, 3);
  ctx.lineTo(1.5, -7);
  ctx.quadraticCurveTo(7.5, -6, 7.5, -1);
  ctx.stroke();
  ctx.restore();
}

export function drawLittleSheep(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale = 1,
  timeSec = 0
): void {
  const s = safeR(scale);
  const bob = Math.abs(Math.sin(timeSec * 3.2)) * 2 * s;
  ctx.save();
  drawGroundShadow(ctx, cx, baseY + 4 * s, 14 * s, 3.5 * s);
  ctx.translate(cx, baseY - bob);
  ctx.scale(s, s);

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-8, 4);
  ctx.moveTo(6, -4);
  ctx.lineTo(6, 4);
  ctx.stroke();

  // Fluffy warm-cream wool puffs
  ctx.fillStyle = "#FFFDF6";
  ctx.lineWidth = 1.9;
  const puffs = [
    { x: -8, y: -12, r: 8 },
    { x: 0, y: -15.5, r: 9.2 },
    { x: 8.5, y: -12, r: 8 },
    { x: 0, y: -9, r: 8 }
  ];
  for (let i = 0; i < puffs.length; i++) {
    ctx.beginPath();
    safeArc(ctx, puffs[i].x, puffs[i].y, puffs[i].r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Gentle head & ear
  ctx.fillStyle = "#4A3A31";
  ctx.beginPath();
  safeArc(ctx, -14, -14, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  safeEllipse(ctx, -11, -17, 3.5, 1.8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFDF8";
  ctx.beginPath();
  safeArc(ctx, -15.5, -15, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGratitudeOliveTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number,
  prayers: PrayerLeaf[],
  timeSec: number,
  rustleTimer = 0
): void {
  const w = safeR(width);
  const h = safeR(height);
  const trunkW = w * 0.16;
  const trunkH = h * 0.44;
  const rustleShift = rustleTimer > 0 ? Math.sin(timeSec * 22) * 3.5 * Math.min(1, rustleTimer) : 0;

  ctx.save();
  drawGroundShadow(ctx, cx, baseY + 4, w * 0.38, h * 0.06);

  // Sculpted warm olive trunk with bark highlight
  const trunkGrad = ctx.createLinearGradient(cx - trunkW, baseY - trunkH, cx + trunkW, baseY);
  trunkGrad.addColorStop(0, "#A97149");
  trunkGrad.addColorStop(0.55, "#825231");
  trunkGrad.addColorStop(1, "#5F3920");
  ctx.fillStyle = trunkGrad;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW * 0.85, baseY);
  ctx.quadraticCurveTo(cx - trunkW * 0.42, baseY - trunkH * 0.45, cx - trunkW * 0.46, baseY - trunkH);
  ctx.lineTo(cx + trunkW * 0.46, baseY - trunkH);
  ctx.quadraticCurveTo(cx + trunkW * 0.42, baseY - trunkH * 0.45, cx + trunkW * 0.85, baseY);
  ctx.quadraticCurveTo(cx, baseY + 5, cx - trunkW * 0.85, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle bark lines
  ctx.strokeStyle = "rgba(255, 232, 200, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW * 0.15, baseY - trunkH * 0.8);
  ctx.quadraticCurveTo(cx - trunkW * 0.25, baseY - trunkH * 0.4, cx - trunkW * 0.12, baseY - 8);
  ctx.stroke();

  // Painterly multi-layered canopy (deep shadow -> mid olive -> warm sunlit crown)
  const canopyTop = baseY - h;
  const canopyCenterY = baseY - h * 0.62;
  const puffs = [
    { dx: -w * 0.26, dy: h * 0.06, rx: w * 0.26, ry: h * 0.22, top: "#89B071", bot: "#517347" },
    { dx: w * 0.26, dy: h * 0.06, rx: w * 0.26, ry: h * 0.22, top: "#95BC7A", bot: "#597B4E" },
    { dx: -w * 0.12, dy: h * 0.12, rx: w * 0.23, ry: h * 0.18, top: "#83AA6B", bot: "#55764A" },
    { dx: w * 0.14, dy: h * 0.12, rx: w * 0.23, ry: h * 0.18, top: "#8FB675", bot: "#5B7D50" },
    { dx: 0, dy: -h * 0.08, rx: w * 0.35, ry: h * 0.28, top: "#B4CF84", bot: "#648957" }
  ];
  for (let i = 0; i < puffs.length; i++) {
    const p = puffs[i];
    const px = cx + p.dx + rustleShift;
    const py = canopyCenterY + p.dy;
    const g = ctx.createLinearGradient(px, py - p.ry, px, py + p.ry);
    g.addColorStop(0, p.top);
    g.addColorStop(1, p.bot);
    ctx.beginPath();
    safeEllipse(ctx, px, py, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
  }

  // Warm dappled sun highlight on upper crown
  ctx.fillStyle = "rgba(255, 245, 190, 0.24)";
  ctx.beginPath();
  safeEllipse(ctx, cx + w * 0.06 + rustleShift, canopyCenterY - h * 0.17, w * 0.19, h * 0.11, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Hung prayer leaves
  const boxLeft = cx - w * 0.46 + rustleShift;
  const boxTop = canopyTop + h * 0.06;
  const boxW = w * 0.92;
  const boxH = h * 0.62;
  for (let i = 0; i < prayers.length; i++) {
    const leaf = prayers[i];
    const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
    const sway =
      Math.sin(timeSec * (rustleTimer > 0 ? 10 : 2.1) + i * 0.9) * (rustleTimer > 0 ? 0.22 : 0.08);
    const lx = boxLeft + slot.x * boxW;
    const ly = boxTop + slot.y * boxH;
    drawLeaf(ctx, lx, ly, Math.max(10.5, w * 0.058), leaf.leafColor, slot.tilt + sway);
  }

  // Fluttering leaf confetti when rustled
  if (rustleTimer > 0) {
    const burstColors: LeafColor[] = ["gold", "crimson", "olive", "sky"];
    const fall = 2.2 - rustleTimer;
    for (let i = 0; i < 4; i++) {
      const lx = cx + (i - 1.5) * (w * 0.22) + Math.sin(timeSec * 6 + i) * 10;
      const ly = canopyCenterY + fall * 42 + i * 8;
      drawLeaf(ctx, lx, ly, 9, burstColors[i], timeSec * 2 + i);
    }
  }
  ctx.restore();
}

export function drawStickerIcon(
  ctx: CanvasRenderingContext2D,
  stickerId: StickerId,
  cx: number,
  cy: number,
  size: number
): void {
  const s = safeR(size * 0.44);
  ctx.save();
  switch (stickerId) {
    case "jesus_love":
      drawHeart(ctx, cx, cy, s, "#D46A43");
      drawCross(ctx, cx, cy - s * 0.05, s * 0.45, "#FFF8EB");
      break;
    case "bible":
      drawRoundedRect(ctx, cx - s, cy - s * 0.85, s * 2, s * 1.7, s * 0.25);
      ctx.fillStyle = "#8E5A3C";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      drawCross(ctx, cx, cy, s * 0.52, PALETTE.sunGold);
      break;
    case "family":
      ctx.fillStyle = "#D46A43";
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      safeArc(ctx, cx - s * 0.45, cy - s * 0.35, s * 0.32, 0, Math.PI * 2);
      safeArc(ctx, cx + s * 0.45, cy - s * 0.35, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F6C453";
      ctx.beginPath();
      safeArc(ctx, cx, cy + s * 0.1, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case "church":
      ctx.fillStyle = "#FFFDF7";
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.95, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.95, cy + s * 0.85);
      ctx.lineTo(cx - s * 0.95, cy + s * 0.85);
      ctx.lineTo(cx - s * 0.95, cy - s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawCross(ctx, cx, cy + s * 0.2, s * 0.42, "#D46A43");
      break;
    case "food":
      drawBarleyLoaf(ctx, cx, cy - s * 0.25, s / 16);
      drawFish(ctx, cx, cy + s * 0.45, s / 17);
      break;
    case "healing":
      drawCross(ctx, cx, cy, s * 0.9, "#6F9463");
      break;
    case "creation":
      drawLeaf(ctx, cx, cy, s * 0.95, "olive", -0.2);
      break;
    case "joy":
      drawStar(ctx, cx, cy, s * 0.95, PALETTE.sunGold);
      break;
  }
  ctx.restore();
}

export function drawTileIcon(
  ctx: CanvasRenderingContext2D,
  icon: TileIconId,
  cx: number,
  cy: number,
  size: number
): void {
  const s = safeR(size * 0.45);
  switch (icon) {
    case "bread":
      drawBarleyLoaf(ctx, cx, cy, s / 15);
      break;
    case "fish":
      drawFish(ctx, cx, cy, s / 16);
      break;
    case "heart":
      drawHeart(ctx, cx, cy, s, "#D46A43");
      break;
    case "cross":
      drawCross(ctx, cx, cy, s * 0.88, PALETTE.sunGold);
      break;
    case "sun":
      ctx.save();
      ctx.beginPath();
      safeArc(ctx, cx, cy, s * 0.72, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.sunGold;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.restore();
      break;
    case "star":
      drawStar(ctx, cx, cy, s * 0.9, PALETTE.sunGold);
      break;
    case "scroll":
      drawRoundedRect(ctx, cx - s * 0.9, cy - s * 0.65, s * 1.8, s * 1.3, s * 0.25);
      ctx.fillStyle = "#FFF3D4";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      break;
    case "hands":
      drawHeart(ctx, cx, cy, s * 0.85, "#F6C453");
      break;
  }
}
