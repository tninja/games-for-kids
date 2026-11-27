import { drawRoundedRect } from "./artwork";
import { PALETTE } from "./constants";
import { AFTERNOON_SKY, lerpColor, SUNSET_SKY } from "./lighting";

export const COUNTER_TOP_Y = 336;
export const COUNTER_FRONT_Y = 372;
export const KITCHEN_FLOOR_Y = 418;

const STAR_SPOTS: ReadonlyArray<[number, number]> = [
  [0.08, 0.1], [0.2, 0.22], [0.31, 0.07], [0.44, 0.17], [0.57, 0.06], [0.66, 0.24],
  [0.78, 0.12], [0.9, 0.2], [0.14, 0.34], [0.52, 0.3], [0.84, 0.33], [0.36, 0.38]
];

export function drawDuskSky(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  dusk: number
): void {
  ctx.save();
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, lerpColor(AFTERNOON_SKY[0], SUNSET_SKY[0], dusk));
  grad.addColorStop(0.6, lerpColor(AFTERNOON_SKY[1], SUNSET_SKY[1], dusk));
  grad.addColorStop(1, lerpColor(AFTERNOON_SKY[2], SUNSET_SKY[2], dusk));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Evening stars twinkle in once the sun is low
  const starAlpha = (dusk - 0.55) / 0.45;
  if (starAlpha > 0) {
    ctx.fillStyle = "#FFF8E1";
    for (let i = 0; i < STAR_SPOTS.length; i++) {
      const [sx, sy] = STAR_SPOTS[i];
      ctx.globalAlpha = starAlpha * (0.55 + 0.45 * Math.sin(t * 2.4 + i * 1.7));
      ctx.beginPath();
      ctx.arc(x + sx * w, y + sy * h, 1.2 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Sun sinks from (x, y) toward the horizon and warms from butter-yellow to deep orange.
export function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sinkDistance: number,
  dusk: number,
  scale = 1
): void {
  const cx = x - dusk * 30 * scale;
  const cy = y + dusk * sinkDistance;
  const core = lerpColor("#FFF4C2", "#FF9A57", dusk);
  ctx.save();
  const haloR = (48 + 34 * dusk) * scale;
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
  halo.addColorStop(0, core);
  halo.addColorStop(1, "rgba(255, 214, 150, 0)");
  ctx.globalAlpha = 0.55 + 0.25 * dusk;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Cool violet evening shade over everything below the horizon. Characters drawn
// afterwards stay bright, as if lit by the string lights.
export function drawDuskGroundTint(
  ctx: CanvasRenderingContext2D,
  x: number,
  horizonY: number,
  w: number,
  bottomY: number,
  dusk: number
): void {
  if (dusk <= 0) {
    return;
  }
  ctx.save();
  const fadeH = 80;
  const grad = ctx.createLinearGradient(0, horizonY - fadeH, 0, horizonY);
  grad.addColorStop(0, "rgba(80, 50, 120, 0)");
  grad.addColorStop(1, "rgba(80, 50, 120, " + (0.24 * dusk).toFixed(3) + ")");
  ctx.fillStyle = grad;
  ctx.fillRect(x, horizonY - fadeH, w, fadeH);
  ctx.fillStyle = "rgba(80, 50, 120, " + (0.24 * dusk).toFixed(3) + ")";
  ctx.fillRect(x, horizonY, w, bottomY - horizonY);
  ctx.restore();
}

export function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  alpha = 0.18
): void {
  ctx.save();
  ctx.fillStyle = "rgba(45, 36, 32, " + alpha.toFixed(3) + ")";
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawKitchenWall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dusk: number
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, lerpColor(PALETTE.parchment, "#F6D9B8", dusk));
  grad.addColorStop(0.7, lerpColor(PALETTE.warmSky, "#EDC39A", dusk));
  grad.addColorStop(1, "#E8C396");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.fillStyle = "rgba(217, 93, 57, 0.045)";
  for (let sx = 0; sx < w; sx += 36) {
    ctx.fillRect(sx, 0, 16, COUNTER_TOP_Y);
  }
  ctx.restore();
}

export function drawKitchenCounter(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = PALETTE.ink;

  // Butcher-block counter surface
  ctx.fillStyle = "#E2B07A";
  ctx.fillRect(0, COUNTER_TOP_Y, w, COUNTER_FRONT_Y - COUNTER_TOP_Y);
  ctx.strokeStyle = "rgba(140, 74, 39, 0.25)";
  ctx.lineWidth = 1.2;
  for (let gy = COUNTER_TOP_Y + 10; gy < COUNTER_FRONT_Y; gy += 11) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Cabinet fronts with rounded door panels and brass knobs
  ctx.fillStyle = "#C98A55";
  ctx.fillRect(0, COUNTER_FRONT_Y, w, KITCHEN_FLOOR_Y - COUNTER_FRONT_Y);
  const doorW = 70;
  for (let dx = 8; dx < w; dx += doorW + 10) {
    drawRoundedRect(ctx, dx, COUNTER_FRONT_Y + 7, doorW, KITCHEN_FLOOR_Y - COUNTER_FRONT_Y - 14, 7);
    ctx.fillStyle = "#D69A63";
    ctx.fill();
    ctx.strokeStyle = "rgba(45, 36, 32, 0.45)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "#F2C14E";
    ctx.beginPath();
    ctx.arc(dx + doorW - 11, COUNTER_FRONT_Y + 22, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Checkerboard floor strip
  ctx.fillStyle = "#EFD9B4";
  ctx.fillRect(0, KITCHEN_FLOOR_Y, w, h - KITCHEN_FLOOR_Y);
  ctx.fillStyle = "rgba(201, 74, 56, 0.28)";
  for (let fx = 0, i = 0; fx < w; fx += 22, i++) {
    ctx.fillRect(fx, KITCHEN_FLOOR_Y + (i % 2) * 11, 22, 11);
  }

  // Ink edges
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, COUNTER_TOP_Y);
  ctx.lineTo(w, COUNTER_TOP_Y);
  ctx.moveTo(0, COUNTER_FRONT_Y);
  ctx.lineTo(w, COUNTER_FRONT_Y);
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, KITCHEN_FLOOR_Y);
  ctx.lineTo(w, KITCHEN_FLOOR_Y);
  ctx.stroke();
  ctx.restore();
}

export function drawKitchenWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  dusk: number
): void {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 10);
  ctx.save();
  ctx.clip();
  drawDuskSky(ctx, x, y, w, h, t, dusk);
  drawSun(ctx, x + w * 0.74, y + h * 0.3, h * 0.55, dusk, 0.45);
  // Distant autumn hill and tree tops
  ctx.fillStyle = lerpColor("#B6C285", "#7E7A8E", dusk * 0.8);
  ctx.beginPath();
  ctx.ellipse(x + w * 0.4, y + h + 6, w * 0.8, h * 0.36, 0, Math.PI, 0);
  ctx.fill();
  const treeColors = ["#E58A32", "#D95D39", "#F2C14E"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = lerpColor(treeColors[i], "#9A5B5B", dusk * 0.6);
    ctx.beginPath();
    ctx.arc(x + w * (0.2 + i * 0.3), y + h * 0.8, h * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Wooden frame, mullions and sill
  ctx.strokeStyle = PALETTE.toastedSienna;
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  drawRoundedRect(ctx, x - 8, y + h - 2, w + 16, 9, 4);
  ctx.fillStyle = "#B8774A";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Gingham cafe curtains with a gentle sway
  const sway = Math.sin(t * 1.6) * 2;
  for (let side = 0; side < 2; side++) {
    const edgeX = side === 0 ? x - 4 : x + w + 4;
    const innerX = side === 0 ? x + w * 0.22 + sway : x + w * 0.78 + sway;
    ctx.fillStyle = "rgba(201, 74, 56, 0.85)";
    ctx.beginPath();
    ctx.moveTo(edgeX, y - 6);
    ctx.lineTo(innerX, y - 6);
    ctx.quadraticCurveTo(innerX - (side === 0 ? 8 : -8), y + h * 0.4, edgeX, y + h * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.fillRect(x - 10, y - 9, w + 20, 5);
  ctx.restore();
}

export function drawPendantLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  cordLen: number,
  glow: number,
  t: number
): void {
  ctx.save();
  const swing = Math.sin(t * 1.3) * 0.03;
  ctx.translate(x, 0);
  ctx.rotate(swing);

  // Warm light pool, stronger as evening falls
  const strength = 0.22 + 0.4 * glow;
  const poolR = 70 + 40 * glow;
  const pool = ctx.createRadialGradient(0, cordLen + 18, 0, 0, cordLen + 18, poolR);
  pool.addColorStop(0, "rgba(255, 226, 150, " + strength.toFixed(3) + ")");
  pool.addColorStop(1, "rgba(255, 226, 150, 0)");
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(0, cordLen + 18, poolR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, cordLen);
  ctx.stroke();

  ctx.fillStyle = "#FFE9A8";
  ctx.beginPath();
  ctx.arc(0, cordLen + 17, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETTE.sageLeaf;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-6, cordLen);
  ctx.lineTo(6, cordLen);
  ctx.lineTo(20, cordLen + 18);
  ctx.lineTo(-20, cordLen + 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawStoveRange(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  t: number
): void {
  const halfW = 96;
  ctx.save();
  ctx.strokeStyle = PALETTE.ink;

  // Copper range hood above the pan
  ctx.fillStyle = "#C9875A";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - 34, -4);
  ctx.lineTo(cx + 34, -4);
  ctx.lineTo(cx + 74, 34);
  ctx.lineTo(cx - 74, 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sage enamel stove body down to the counter
  drawRoundedRect(ctx, cx - halfW, topY, halfW * 2, COUNTER_TOP_Y - topY + 4, 12);
  ctx.fillStyle = "#86A89E";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#4F6A63";
  ctx.fillRect(cx - halfW + 3, topY + 3, halfW * 2 - 6, 12);

  // Knobs
  for (let k = 0; k < 4; k++) {
    ctx.fillStyle = PALETTE.cream;
    ctx.beginPath();
    ctx.arc(cx - 54 + k * 36, topY + 32, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Oven door with a warm glowing window
  drawRoundedRect(ctx, cx - 70, topY + 52, 140, COUNTER_TOP_Y - topY - 70, 10);
  ctx.fillStyle = "#9DBBB2";
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.stroke();
  const flicker = 0.75 + 0.25 * Math.sin(t * 7);
  drawRoundedRect(ctx, cx - 52, topY + 72, 104, 44, 8);
  ctx.fillStyle = "rgba(255, 154, 82, " + (0.75 * flicker).toFixed(3) + ")";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(cx - 40, topY + 60, 80, 5);

  // Burner flames under the pan
  for (let f = -2; f <= 2; f++) {
    const fh = 7 + 3 * Math.sin(t * 18 + f * 1.9);
    ctx.fillStyle = f % 2 === 0 ? "#5AA9E6" : "#FF9A52";
    ctx.beginPath();
    ctx.moveTo(cx + f * 14 - 4, topY);
    ctx.quadraticCurveTo(cx + f * 14, topY - fh * 2, cx + f * 14 + 4, topY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
