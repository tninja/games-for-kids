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
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, rOut * 0.11);
  ctx.strokeStyle = stroke;
  ctx.lineJoin = "round";
  ctx.stroke();
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
  ctx.moveTo(0, s * 0.65);
  ctx.bezierCurveTo(-s * 1.1, -s * 0.05, -s * 0.85, -s * 0.9, 0, -s * 0.32);
  ctx.bezierCurveTo(s * 0.85, -s * 0.9, s * 1.1, -s * 0.05, 0, s * 0.65);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, s * 0.14);
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
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
  ctx.fillStyle = fill;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = Math.max(1.5, s * 0.12);
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
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.85, -s * 0.25, 0, s);
  ctx.quadraticCurveTo(-s * 0.85, -s * 0.25, 0, -s);
  ctx.closePath();
  ctx.fillStyle = spec.fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, s * 0.12);
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -s * 0.65);
  ctx.lineTo(0, s * 1.15);
  ctx.strokeStyle = spec.vein;
  ctx.lineWidth = Math.max(1.2, s * 0.1);
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
  ctx.rotate(timeSec * 0.15);
  ctx.fillStyle = "rgba(246, 196, 83, " + String(alpha) + ")";
  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const a = (i * Math.PI * 2) / rays;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r);
    ctx.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawGalileeBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeSec: number
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#D8EEF7");
  sky.addColorStop(0.55, "#F9ECCE");
  sky.addColorStop(1, "#FBE1B8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Warm sun & gentle rays
  drawSunRays(ctx, w * 0.82, h * 0.16, 95, timeSec, 0.22);
  ctx.save();
  ctx.beginPath();
  safeArc(ctx, w * 0.82, h * 0.16, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#FFE394";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#E5A93B";
  ctx.stroke();
  ctx.restore();

  // Distant Galilee hills
  ctx.fillStyle = "#B6C9A4";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.56);
  ctx.quadraticCurveTo(w * 0.25, h * 0.43, w * 0.55, h * 0.54);
  ctx.quadraticCurveTo(w * 0.82, h * 0.46, w, h * 0.55);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Sea of Galilee shimmering ribbon
  ctx.fillStyle = "#9ACCE0";
  ctx.fillRect(0, h * 0.55, w, h * 0.12);
  ctx.strokeStyle = "rgba(255, 253, 247, 0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const y = h * (0.58 + i * 0.025);
    const shift = Math.sin(timeSec * 1.4 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(w * (0.12 + i * 0.16) + shift, y);
    ctx.lineTo(w * (0.28 + i * 0.16) + shift, y);
    ctx.stroke();
  }

  // Foreground sunlit hillside meadow
  ctx.fillStyle = "#A9C17D";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.quadraticCurveTo(w * 0.5, h * 0.59, w, h * 0.66);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
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
  const bob = Math.sin(timeSec * 2.2) * 1.6 * s;
  ctx.save();
  ctx.translate(cx, baseY + bob);
  ctx.scale(s, s);

  // Soft golden warm halo behind head
  ctx.save();
  ctx.beginPath();
  safeArc(ctx, 0, -68, 25 + Math.sin(timeSec * 3) * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(246, 196, 83, 0.34)";
  ctx.fill();
  ctx.beginPath();
  safeArc(ctx, 0, -68, 19, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(229, 169, 59, 0.72)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Flowing warm cream robe
  ctx.beginPath();
  ctx.moveTo(-18, -44);
  ctx.lineTo(18, -44);
  ctx.lineTo(25, 0);
  ctx.quadraticCurveTo(0, 6, -25, 0);
  ctx.closePath();
  ctx.fillStyle = PALETTE.robeCream;
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Crimson-terracotta sash draped gracefully over shoulder
  ctx.beginPath();
  ctx.moveTo(-16, -44);
  ctx.lineTo(-4, -44);
  ctx.lineTo(18, -2);
  ctx.lineTo(4, -2);
  ctx.closePath();
  ctx.fillStyle = PALETTE.sashCrimson;
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arms & hands based on pose
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pose === "bless") {
    // Lifting hands gently in thanksgiving prayer
    ctx.beginPath();
    ctx.moveTo(-16, -36);
    ctx.quadraticCurveTo(-30, -44, -20, -56);
    ctx.moveTo(16, -36);
    ctx.quadraticCurveTo(30, -44, 20, -56);
    ctx.strokeStyle = PALETTE.robeCream;
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = "#F0C39B";
    ctx.beginPath();
    safeArc(ctx, -20, -58, 4.5, 0, Math.PI * 2);
    safeArc(ctx, 20, -58, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Open welcoming arms (slightly raised in celebrate)
    const handY = pose === "celebrate" ? -50 : -34;
    ctx.beginPath();
    ctx.moveTo(-16, -36);
    ctx.lineTo(-32, handY);
    ctx.moveTo(16, -36);
    ctx.lineTo(32, handY);
    ctx.strokeStyle = PALETTE.robeCream;
    ctx.lineWidth = 9.5;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = "#F0C39B";
    ctx.beginPath();
    safeArc(ctx, -33, handY, 4.5, 0, Math.PI * 2);
    safeArc(ctx, 33, handY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Hair silhouette behind head
  ctx.fillStyle = "#5B3B24";
  ctx.beginPath();
  safeEllipse(ctx, 0, -64, 17, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Warm gentle face
  ctx.fillStyle = "#F3C79F";
  ctx.beginPath();
  safeArc(ctx, 0, -66, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Soft beard
  ctx.fillStyle = "#5B3B24";
  ctx.beginPath();
  safeArc(ctx, 0, -62, 11, 0.2, Math.PI - 0.2);
  ctx.quadraticCurveTo(0, -49, -10.5, -60);
  ctx.closePath();
  ctx.fill();

  // Kind eyes & joyful smile
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -4.5, -68, 1.8, 0, Math.PI * 2);
  safeArc(ctx, 4.5, -68, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FFF8EB";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  safeArc(ctx, 0, -63, 4.2, 0.25, Math.PI - 0.25);
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
  const hop = happy ? Math.abs(Math.sin(timeSec * 6)) * 5 * s : Math.sin(timeSec * 2.5) * 1.2 * s;
  ctx.save();
  ctx.translate(cx, baseY - hop);
  ctx.scale(s, s);

  // Tunic body
  ctx.fillStyle = tunicColor;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-12, -32);
  ctx.lineTo(12, -32);
  ctx.lineTo(16, 0);
  ctx.lineTo(-16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Raised arms when happy
  const armY = happy ? -40 : -20;
  ctx.beginPath();
  ctx.moveTo(-11, -26);
  ctx.lineTo(-22, armY);
  ctx.moveTo(11, -26);
  ctx.lineTo(22, armY);
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Head
  ctx.fillStyle = "#F5CAA3";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeArc(ctx, 0, -44, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair cap
  ctx.fillStyle = "#4A3222";
  ctx.beginPath();
  safeArc(ctx, 0, -46, 11.5, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes & smile
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -3.8, -44, 1.6, 0, Math.PI * 2);
  safeArc(ctx, 3.8, -44, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  safeArc(ctx, 0, -41, 4, 0.2, Math.PI - 0.2);
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
  ctx.fillStyle = "#DF9D4B";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeEllipse(ctx, 0, 0, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#9C5B1D";
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
  ctx.fillStyle = "#7AB5CE";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  safeEllipse(ctx, -2, 0, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(19, -7);
  ctx.lineTo(19, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  safeArc(ctx, -8, -1.5, 1.8, 0, Math.PI * 2);
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
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  if (filledCount > 0) {
    drawBarleyLoaf(ctx, -12, -10, 0.72);
    drawBarleyLoaf(ctx, 11, -10, 0.72);
    if (filledCount > 2) {
      drawFish(ctx, 0, -14, 0.7);
    }
  }

  ctx.fillStyle = "#C98B4B";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-34, -8);
  ctx.lineTo(34, -8);
  ctx.lineTo(25, 18);
  ctx.quadraticCurveTo(0, 23, -25, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Woven rim & cross hatch
  drawRoundedRect(ctx, -37, -12, 74, 8, 4);
  ctx.fillStyle = "#A86C32";
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#7D4C1E";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-26, 4);
  ctx.lineTo(26, 4);
  ctx.moveTo(-14, -4);
  ctx.lineTo(-10, 17);
  ctx.moveTo(0, -4);
  ctx.lineTo(0, 19);
  ctx.moveTo(14, -4);
  ctx.lineTo(10, 17);
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
  ctx.beginPath();
  safeArc(ctx, 0, 0, 18 + Math.sin(timeSec * 6) * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(246, 196, 83, 0.45)";
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
  drawRoundedRect(ctx, -20, -12, 40, 20, 5);
  ctx.fillStyle = "#B67346";
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
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
  ctx.fillStyle = "#E0846C";
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  ctx.fillStyle = "#FFF8EB";
  ctx.beginPath();
  safeArc(ctx, 0, 0, 6, 0, Math.PI * 2);
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
  timeSec: number
): void {
  const w = safeR(width);
  const h = safeR(height);
  const trunkW = w * 0.16;
  const trunkH = h * 0.42;

  ctx.save();
  // Warm trunk
  ctx.fillStyle = "#8C5A37";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW * 0.7, baseY);
  ctx.quadraticCurveTo(cx - trunkW * 0.4, baseY - trunkH * 0.5, cx - trunkW * 0.45, baseY - trunkH);
  ctx.lineTo(cx + trunkW * 0.45, baseY - trunkH);
  ctx.quadraticCurveTo(cx + trunkW * 0.4, baseY - trunkH * 0.5, cx + trunkW * 0.7, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm layered canopy
  const canopyTop = baseY - h;
  const canopyCenterY = baseY - h * 0.62;
  const puffs = [
    { dx: -w * 0.26, dy: h * 0.04, rx: w * 0.25, ry: h * 0.22, fill: "#6D9361" },
    { dx: w * 0.26, dy: h * 0.04, rx: w * 0.25, ry: h * 0.22, fill: "#7FA56E" },
    { dx: 0, dy: -h * 0.08, rx: w * 0.34, ry: h * 0.27, fill: "#8BB174" },
    { dx: -w * 0.12, dy: h * 0.11, rx: w * 0.22, ry: h * 0.18, fill: "#789E68" },
    { dx: w * 0.14, dy: h * 0.11, rx: w * 0.22, ry: h * 0.18, fill: "#86AB70" }
  ];
  for (let i = 0; i < puffs.length; i++) {
    const p = puffs[i];
    ctx.beginPath();
    safeEllipse(ctx, cx + p.dx, canopyCenterY + p.dy, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.fill;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
  }

  // Hung prayer leaves
  const boxLeft = cx - w * 0.46;
  const boxTop = canopyTop + h * 0.06;
  const boxW = w * 0.92;
  const boxH = h * 0.62;
  for (let i = 0; i < prayers.length; i++) {
    const leaf = prayers[i];
    const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
    const sway = Math.sin(timeSec * 2.1 + i * 0.9) * 0.08;
    const lx = boxLeft + slot.x * boxW;
    const ly = boxTop + slot.y * boxH;
    drawLeaf(ctx, lx, ly, Math.max(10, w * 0.055), leaf.leafColor, slot.tilt + sway);
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
