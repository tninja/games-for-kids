import { LEAF_COLORS, PALETTE, TREE_LEAF_SLOTS } from "./constants";
import { GratitudeLeaf, LeafColor, SnackId, StickerId } from "./types";

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, w / 2, h / 2);
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

export function drawMapleLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: LeafColor,
  tilt = 0
): void {
  const spec = LEAF_COLORS[color];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(size / 24, size / 24);

  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(6, -10);
  ctx.lineTo(18, -12);
  ctx.lineTo(12, -1);
  ctx.lineTo(20, 7);
  ctx.lineTo(7, 9);
  ctx.lineTo(4, 15);
  ctx.lineTo(0, 12);
  ctx.lineTo(-4, 15);
  ctx.lineTo(-7, 9);
  ctx.lineTo(-20, 7);
  ctx.lineTo(-12, -1);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-6, -10);
  ctx.closePath();

  ctx.fillStyle = spec.fill;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Stem and center vein
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(0, 22);
  ctx.moveTo(0, 10);
  ctx.lineTo(0, -14);
  ctx.moveTo(0, 2);
  ctx.lineTo(10, -4);
  ctx.moveTo(0, 2);
  ctx.lineTo(-10, -4);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = spec.vein;
  ctx.stroke();

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
  const innerR = outerR * 0.48;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (Math.PI * i) / 5;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

export function drawBeagleChef(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  mood: "happy" | "excited" | "oops" = "happy",
  bob = 0
): void {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const ink = "#1A1614";

  // Cute little wagging white tail behind back
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-13, 30);
  ctx.quadraticCurveTo(-24, 24, -22, 16);
  ctx.quadraticCurveTo(-18, 22, -11, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Iconic pear-shaped white comic-strip body
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.bezierCurveTo(-19, 16, -20, 38, -11, 44);
  ctx.lineTo(12, 44);
  ctx.bezierCurveTo(20, 38, 18, 16, 8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Classic black spot on back
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(-11, 24, 5.5, 8.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Two cute rounded white comic feet with little toe marks
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-6, 46, 9.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(9, 46, 10.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, 44);
  ctx.lineTo(18, 46);
  ctx.moveTo(13, 47);
  ctx.lineTo(17, 48);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Little front paw reaching cheerfully
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(14, 24, 8, 5, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Classic simple red collar around neck
  ctx.fillStyle = "#D94130";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  drawRoundedRect(ctx, -11, 5, 22, 6.5, 3);
  ctx.fill();
  ctx.stroke();

  // Iconic continuous white beagle head + long plump rounded snout
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(7, 6);
  ctx.bezierCurveTo(18, 5, 27, 4, 32, -2);
  ctx.bezierCurveTo(37, -8, 34, -17, 24, -17);
  ctx.bezierCurveTo(16, -17, 13, -16, 10, -20);
  ctx.bezierCurveTo(7, -29, -4, -32, -13, -27);
  ctx.bezierCurveTo(-22, -22, -23, -8, -16, 2);
  ctx.bezierCurveTo(-13, 6, -4, 7, 7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Iconic solid-black teardrop floppy ear
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-12, -15);
  ctx.bezierCurveTo(-22, -13, -24, 5, -14, 11);
  ctx.bezierCurveTo(-6, 14, -4, 2, -6, -9);
  ctx.bezierCurveTo(-7, -14, -9, -15, -12, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glossy round black button nose at tip of long snout
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(32, -13, 6.2, 5.0, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(30.5, -15, 2.0, 1.2, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Classic comic-strip eye & floating eyebrow
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  if (mood === "excited") {
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(5, -16, 3.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(4, -22, 4.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (mood === "oops") {
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(5, -17, 3.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -17, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -24);
    ctx.lineTo(8, -26);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(5.5, -16.5, 2.2, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -23);
    ctx.quadraticCurveTo(5.5, -25, 9, -23);
    ctx.stroke();
  }

  // Warm comic-strip smile tucked along snout underside
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  if (mood === "oops") {
    ctx.arc(17, -4, 3.8, 0, Math.PI * 2);
  } else if (mood === "excited") {
    ctx.moveTo(8, -5);
    ctx.quadraticCurveTo(17, 2, 26, -5);
    ctx.moveTo(8, -6);
    ctx.lineTo(6, -3);
  } else {
    ctx.moveTo(9, -5);
    ctx.quadraticCurveTo(17, 0, 25, -5);
  }
  ctx.stroke();

  // Tall puffy white chef toque hat sitting jauntily on crown
  ctx.save();
  ctx.translate(-5, -28);
  ctx.rotate(-0.14);
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.quadraticCurveTo(-21, -13, -9, -17);
  ctx.quadraticCurveTo(-2, -29, 9, -18);
  ctx.quadraticCurveTo(21, -14, 13, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hat band
  drawRoundedRect(ctx, -13, -3, 26, 6.5, 2.5);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function drawLittleBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  flap = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const ink = "#1A1614";
  const yellow = "#FFE135";

  // Tiny delicate black stick legs & 3-toed bird feet
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-3, 13);
  ctx.lineTo(-4, 21);
  ctx.moveTo(-7, 22);
  ctx.lineTo(-4, 21);
  ctx.lineTo(-1, 22);
  ctx.moveTo(2, 13);
  ctx.lineTo(3, 21);
  ctx.moveTo(0, 22);
  ctx.lineTo(3, 21);
  ctx.lineTo(6, 22);
  ctx.stroke();

  // Little yellow tail feather
  ctx.fillStyle = yellow;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, 7);
  ctx.lineTo(-15, 5);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Petite upright yellow body
  ctx.fillStyle = yellow;
  ctx.beginPath();
  ctx.ellipse(-1, 6, 6.5, 8.2, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expressive oversized round yellow head + long smiling yellow beak
  ctx.fillStyle = yellow;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.bezierCurveTo(-10, -14, 2, -17, 7, -10);
  ctx.bezierCurveTo(13, -10, 20, -8, 22, -5);
  ctx.bezierCurveTo(20, -1, 13, 0, 7, -1);
  ctx.bezierCurveTo(3, 3, -7, 2, -8, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Signature messy spiky feather tuft sticking straight up on head!
  ctx.fillStyle = yellow;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-6, -13);
  ctx.lineTo(-11, -21);
  ctx.lineTo(-4, -16);
  ctx.lineTo(-4, -25);
  ctx.lineTo(0, -16);
  ctx.lineTo(4, -24);
  ctx.lineTo(4, -15);
  ctx.lineTo(10, -19);
  ctx.lineTo(6, -12);
  ctx.stroke();
  ctx.fill();
  ctx.stroke();

  // Subtle smile line along the long yellow beak
  ctx.beginPath();
  ctx.moveTo(9, -4);
  ctx.quadraticCurveTo(15, -3, 21, -5);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Tiny black comic dot eye
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(4.5, -8.5, 1.7, 0, Math.PI * 2);
  ctx.fill();

  // Cute fluttering little wing on body
  ctx.fillStyle = "#FFD12A";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(-3, 5 - flap * 3.5, 5.5, 3.2, -0.45 - flap * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawToast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
  buttered = false
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  // Crust silhouette
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-20, 22);
  ctx.lineTo(-20, -4);
  ctx.quadraticCurveTo(-28, -22, -10, -24);
  ctx.quadraticCurveTo(0, -27, 10, -24);
  ctx.quadraticCurveTo(28, -22, 20, -4);
  ctx.lineTo(20, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden toasted center
  ctx.fillStyle = buttered ? "#F6C86E" : "#E8B769";
  ctx.beginPath();
  ctx.moveTo(-15, 17);
  ctx.lineTo(-15, -3);
  ctx.quadraticCurveTo(-20, -17, -7, -19);
  ctx.quadraticCurveTo(0, -21, 7, -19);
  ctx.quadraticCurveTo(20, -17, 15, -3);
  ctx.lineTo(15, 17);
  ctx.closePath();
  ctx.fill();

  if (buttered) {
    ctx.fillStyle = PALETTE.butter;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.8;
    drawRoundedRect(ctx, -9, -8, 18, 16, 4);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPopcornKernel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  golden = false,
  rotation = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  ctx.fillStyle = golden ? PALETTE.butter : PALETTE.cream;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-5, -3, 7, 0, Math.PI * 2);
  ctx.arc(5, -4, 7, 0, Math.PI * 2);
  ctx.arc(0, 5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner kernel tint
  ctx.fillStyle = golden ? PALETTE.pumpkinGold : "#F5DF9B";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSillyCarrot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  // Leafy green top
  ctx.strokeStyle = PALETTE.sageLeaf;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-6, -21);
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -23);
  ctx.moveTo(0, -12);
  ctx.lineTo(6, -21);
  ctx.stroke();

  // Carrot cone
  ctx.fillStyle = "#EB7A2D";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9, -12);
  ctx.lineTo(9, -12);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawPumpkinPie(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  creamCount: number,
  hasCookie: boolean
): void {
  const safeR = Math.max(6, radius);
  const bumpR = Math.max(2, safeR * 0.12);
  ctx.save();
  ctx.translate(cx, cy);

  // Tin rim shadow
  ctx.fillStyle = "#D4C6B4";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = Math.max(1.5, Math.min(3, safeR * 0.05));
  ctx.beginPath();
  ctx.arc(0, safeR * 0.04, safeR * 1.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Scalloped golden crust
  ctx.fillStyle = "#E0A458";
  const bumps = 18;
  ctx.beginPath();
  for (let i = 0; i < bumps; i++) {
    const a = (Math.PI * 2 * i) / bumps;
    const bx = Math.cos(a) * (safeR * 1.02);
    const by = Math.sin(a) * (safeR * 1.02);
    ctx.moveTo(bx + bumpR, by);
    ctx.arc(bx, by, bumpR, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, safeR * 1.07, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = Math.max(1.4, Math.min(2.6, safeR * 0.045));
  ctx.stroke();

  // Spiced pumpkin filling
  ctx.fillStyle = "#D96F2B";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2, safeR * 0.93), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner shine arc (proportional radius, always positive!)
  ctx.strokeStyle = "#ED954B";
  ctx.lineWidth = Math.max(1.2, Math.min(4, safeR * 0.05));
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1, safeR * 0.78), -2.4, -1.2);
  ctx.stroke();

  // Whipped cream swirl puffs
  const totalPuffs = Math.min(16, creamCount);
  for (let i = 0; i < totalPuffs; i++) {
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    const r = safeR * 0.66;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    ctx.fillStyle = PALETTE.cream;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1, Math.min(2, safeR * 0.03));
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.5, safeR * 0.145), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (hasCookie) {
    drawMapleLeaf(ctx, 0, 0, safeR * 0.42, "gold", -0.1);
  }

  ctx.restore();
}

export function drawMapleTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bottomY: number,
  width: number,
  height: number,
  leaves: GratitudeLeaf[],
  showEmptySlots = false
): void {
  ctx.save();

  // Trunk & branches
  const trunkW = width * 0.16;
  const trunkH = height * 0.42;
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW * 0.7, bottomY);
  ctx.quadraticCurveTo(cx - trunkW * 0.45, bottomY - trunkH * 0.5, cx - trunkW * 0.35, bottomY - trunkH);
  ctx.lineTo(cx + trunkW * 0.35, bottomY - trunkH);
  ctx.quadraticCurveTo(cx + trunkW * 0.45, bottomY - trunkH * 0.5, cx + trunkW * 0.7, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm autumn canopy puffs
  const canopyTop = bottomY - height;
  const canopyH = height * 0.66;
  const canopyLeft = cx - width * 0.5;

  const puffs = [
    { x: cx - width * 0.24, y: canopyTop + canopyH * 0.56, r: width * 0.23, c: "#E89B48" },
    { x: cx + width * 0.24, y: canopyTop + canopyH * 0.55, r: width * 0.23, c: "#DC7A3A" },
    { x: cx - width * 0.12, y: canopyTop + canopyH * 0.34, r: width * 0.24, c: "#F0B654" },
    { x: cx + width * 0.13, y: canopyTop + canopyH * 0.36, r: width * 0.22, c: "#E38A3E" },
    { x: cx, y: canopyTop + canopyH * 0.48, r: width * 0.26, c: "#EEAA4D" }
  ];
  for (let i = 0; i < puffs.length; i++) {
    const p = puffs[i];
    ctx.fillStyle = p.c;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Optional soft dotted slot guides
  if (showEmptySlots) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(45, 36, 32, 0.32)";
    ctx.lineWidth = 1.6;
    for (let i = leaves.length; i < Math.min(6, TREE_LEAF_SLOTS.length); i++) {
      const slot = TREE_LEAF_SLOTS[i];
      const sx = canopyLeft + slot.x * width;
      const sy = canopyTop + slot.y * canopyH;
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Render hung gratitude leaves
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
    const lx = canopyLeft + slot.x * width;
    const ly = canopyTop + slot.y * canopyH;
    drawMapleLeaf(ctx, lx, ly, Math.max(15, width * 0.085), leaf.leafColor, slot.tilt);
  }

  ctx.restore();
}

export function drawGuestCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirtColor: string,
  hairColor: string,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shoulders / sweater
  ctx.fillStyle = shirtColor;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 22, 16, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = "#FAD7B5";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair cap
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -3, 14, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eyes & smile
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(-4.5, -1, 1.8, 0, Math.PI * 2);
  ctx.arc(4.5, -1, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 2, 5, 0.2, Math.PI - 0.2);
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.restore();
}

export function drawSnackIcon(
  ctx: CanvasRenderingContext2D,
  id: SnackId,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 28;
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (id === "pretzel") {
    // Golden twisted pretzel loop with salt specks
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(-12, 11);
    ctx.bezierCurveTo(-22, -4, -14, -18, 0, -10);
    ctx.bezierCurveTo(14, -18, 22, -4, 12, 11);
    ctx.bezierCurveTo(4, 2, -4, 2, -12, 11);
    ctx.stroke();

    ctx.strokeStyle = "#C77D3A";
    ctx.lineWidth = 5.6;
    ctx.stroke();

    ctx.fillStyle = PALETTE.cream;
    ctx.beginPath();
    ctx.arc(-9, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(8, -7, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === "orange_bean" || id === "berry_bean") {
    const fill = id === "orange_bean" ? "#F29132" : PALETTE.berryPurple;
    const shine = id === "orange_bean" ? "#FFD08A" : "#E598B8";
    ctx.fillStyle = fill;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.bezierCurveTo(-18, -11, -3, -16, 4, -8);
    ctx.bezierCurveTo(14, -12, 20, 4, 10, 12);
    ctx.bezierCurveTo(0, 17, -11, 14, -14, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.ellipse(-5, -4, 4.5, 2.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Warm apple cider mug with cinnamon stick
    ctx.fillStyle = "#B8472F";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    drawRoundedRect(ctx, -12, -6, 20, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(9, 4, 6, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Steaming cider surface & cinnamon stick
    ctx.fillStyle = "#E59A3E";
    ctx.beginPath();
    ctx.ellipse(-2, -6, 9, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = PALETTE.toastedSienna;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(1, -6);
    ctx.lineTo(8, -16);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawFoldingChair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  tilt = 0,
  openAmount = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const spread = 16 + openAmount * 22;

  // Aluminum crossed folding legs
  ctx.strokeStyle = "#8C98A0";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-spread, 34);
  ctx.lineTo(spread * 0.7, -8);
  ctx.moveTo(spread, 34);
  ctx.lineTo(-spread * 0.7, -8);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Striped webbing backrest
  const backTilt = -0.35 + (1 - openAmount) * 0.3;
  ctx.save();
  ctx.translate(-spread * 0.45, -4);
  ctx.rotate(backTilt);
  drawRoundedRect(ctx, -10, -48, 22, 52, 6);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Red picnic stripes
  ctx.fillStyle = PALETTE.mapleCrimson;
  ctx.fillRect(-8, -42, 18, 9);
  ctx.fillRect(-8, -24, 18, 9);
  ctx.fillRect(-8, -8, 18, 8);
  ctx.restore();

  // Striped seat pad
  drawRoundedRect(ctx, -spread * 0.75, -8, spread * 1.55, 16, 6);
  ctx.fillStyle = PALETTE.sageLeaf;
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  ctx.restore();
}

export function drawBackyardTable(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  guestCount: number,
  hasToast: boolean,
  hasPopcorn: boolean,
  hasPie: boolean,
  bob = 0,
  hasPlatter = false,
  hasChair = false
): void {
  ctx.save();

  // Neatly tamed folding lawn chair parked beside table
  if (hasChair) {
    drawFoldingChair(ctx, cx + width * 0.52, y + 26, 0.56, 0.04, 0.45);
  }

  // Seated guests behind the backyard ping-pong table
  const guestPalette = [
    { shirt: "#6B8F71", hair: "#4B3222" },
    { shirt: "#D95D39", hair: "#C9C0B5" },
    { shirt: "#5B85AA", hair: "#6B4423" },
    { shirt: "#E58A32", hair: "#3B281E" },
    { shirt: "#A5406B", hair: "#2D2420" }
  ];
  const visibleGuests = Math.min(5, Math.max(0, guestCount - 2));
  for (let i = 0; i < visibleGuests; i++) {
    const frac = (i + 1) / (visibleGuests + 1);
    const gx = cx - width * 0.44 + frac * width * 0.88;
    const gp = guestPalette[i % guestPalette.length];
    drawGuestCharacter(ctx, gx, y - 24 + (i % 2 === 0 ? bob : -bob), gp.shirt, gp.hair, 0.92);
  }

  // Ping-pong table wooden legs
  ctx.strokeStyle = PALETTE.toastedSienna;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - width * 0.38, y + 18);
  ctx.lineTo(cx - width * 0.42, y + 62);
  ctx.moveTo(cx + width * 0.38, y + 18);
  ctx.lineTo(cx + width * 0.42, y + 62);
  ctx.stroke();

  // Tablecloth top (checkered picnic vibe)
  const left = cx - width / 2;
  drawRoundedRect(ctx, left, y - 6, width, 28, 8);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Warm crimson runner stripe
  drawRoundedRect(ctx, left + 10, y + 3, width - 20, 12, 4);
  ctx.fillStyle = PALETTE.tableclothRed;
  ctx.fill();

  // Cooked dishes on table
  if (hasToast) {
    drawToast(ctx, cx - width * 0.33, y - 10, 0.52, -0.1, true);
  }
  if (hasPopcorn) {
    ctx.fillStyle = "#B86E39";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - width * 0.11, y - 6, 15, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawPopcornKernel(ctx, cx - width * 0.11 - 6, y - 12, 0.62, false);
    drawPopcornKernel(ctx, cx - width * 0.11 + 6, y - 13, 0.62, true);
    drawPopcornKernel(ctx, cx - width * 0.11, y - 17, 0.62, false);
  }
  if (hasPlatter) {
    drawSnackIcon(ctx, "pretzel", cx + width * 0.11, y - 11, 18);
    drawSnackIcon(ctx, "berry_bean", cx + width * 0.17, y - 8, 11);
  }
  if (hasPie) {
    drawPumpkinPie(ctx, cx + width * 0.34, y - 10, 17, 12, true);
  }

  ctx.restore();
}

export function drawRedDoghouse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Wooden front wall
  ctx.fillStyle = "#C93B2B";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-36, 0);
  ctx.lineTo(-36, -44);
  ctx.lineTo(0, -72);
  ctx.lineTo(36, -44);
  ctx.lineTo(36, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horizontal clapboard plank lines
  ctx.strokeStyle = "rgba(45, 36, 32, 0.28)";
  ctx.lineWidth = 1.5;
  for (let py = -12; py >= -38; py -= 12) {
    ctx.beginPath();
    ctx.moveTo(-34, py);
    ctx.lineTo(34, py);
    ctx.stroke();
  }

  // Dark cozy arched doorway
  ctx.fillStyle = "#2A1F1B";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-14, -22);
  ctx.arc(0, -22, 14, Math.PI, 0);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Iconic pitched crimson roof overhang
  ctx.fillStyle = "#DF4B38";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-45, -39);
  ctx.lineTo(0, -78);
  ctx.lineTo(45, -39);
  ctx.lineTo(38, -32);
  ctx.lineTo(0, -64);
  ctx.lineTo(-38, -32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cute autumn pumpkin sitting beside doghouse
  ctx.fillStyle = "#EC802A";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.ellipse(42, -9, 13, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(42, -9, 6, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Pumpkin stem
  ctx.strokeStyle = PALETTE.sageLeaf;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(42, -19);
  ctx.quadraticCurveTo(45, -24, 48, -22);
  ctx.stroke();

  ctx.restore();
}

export function drawBackyardFence(
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number
): void {
  ctx.save();
  const picketW = 24;
  const picketH = 44;

  // Horizontal fence rails
  ctx.fillStyle = "#E8D3B0";
  ctx.strokeStyle = "rgba(45, 36, 32, 0.45)";
  ctx.lineWidth = 1.6;
  ctx.fillRect(0, y - 30, width, 6);
  ctx.strokeRect(0, y - 30, width, 6);
  ctx.fillRect(0, y - 12, width, 6);
  ctx.strokeRect(0, y - 12, width, 6);

  // Wooden pickets
  for (let x = -4; x < width + picketW; x += picketW) {
    ctx.fillStyle = "#F5E6CA";
    ctx.strokeStyle = "rgba(45, 36, 32, 0.42)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - picketH + 8);
    ctx.lineTo(x + picketW * 0.42, y - picketH);
    ctx.lineTo(x + picketW * 0.84, y - picketH + 8);
    ctx.lineTo(x + picketW * 0.84, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFestiveStringLights(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  glow = 0
): void {
  ctx.save();
  const midX = (x1 + x2) * 0.5;
  const sagY = Math.max(y1, y2) + 28;

  // Cord curve
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, sagY, x2, y2);
  ctx.stroke();

  const bulbs = 7;
  const colors = ["#FFE58F", "#FF9A52", "#F2C14E", "#FF7F5C"];
  for (let i = 1; i <= bulbs; i++) {
    const u = i / (bulbs + 1);
    const inv = 1 - u;
    const bx = inv * inv * x1 + 2 * inv * u * midX + u * u * x2;
    const by = inv * inv * y1 + 2 * inv * u * sagY + u * u * y2;
    const twinkle = 0.72 + 0.28 * Math.sin(t * 4.2 + i * 1.3);

    // Warm soft halo that blooms as evening falls
    const haloR = 11 + 18 * glow;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (0.28 + 0.55 * glow) * twinkle);
    const halo = ctx.createRadialGradient(bx, by + 6, 0, bx, by + 6, haloR);
    halo.addColorStop(0, "rgba(255, 229, 143, 1)");
    halo.addColorStop(1, "rgba(255, 229, 143, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(bx, by + 6, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bulb
    ctx.fillStyle = colors[i % colors.length];
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(bx, by + 6, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hot white filament once the lights are on
    if (glow > 0) {
      ctx.save();
      ctx.globalAlpha = glow * twinkle;
      ctx.fillStyle = "#FFFDF0";
      ctx.beginPath();
      ctx.arc(bx - 1, by + 5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

export function drawMusicNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-3, 5, 5, 3.6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1.5, 4);
  ctx.lineTo(1.5, -11);
  ctx.quadraticCurveTo(8, -9, 9, -3);
  ctx.stroke();
  ctx.restore();
}

export function drawSteamWisp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  phase: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  const sway = Math.sin(phase) * 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + sway, y - 10, x - sway * 0.7, y - 20);
  ctx.quadraticCurveTo(x + sway * 0.5, y - 28, x, y - 34);
  ctx.stroke();
  ctx.restore();
}

export function drawPipingBag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Pastry bag cone
  ctx.fillStyle = "#FFFDF9";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-15, -34);
  ctx.quadraticCurveTo(0, -44, 15, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crimson ribbon tie
  ctx.fillStyle = PALETTE.mapleCrimson;
  drawRoundedRect(ctx, -11, -35, 22, 6, 3);
  ctx.fill();
  ctx.stroke();

  // Metal star tip
  ctx.fillStyle = "#B8C2C8";
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(4, -4);
  ctx.lineTo(2, 4);
  ctx.lineTo(-2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawStickerIcon(
  ctx: CanvasRenderingContext2D,
  id: StickerId,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;

  switch (id) {
    case "family":
      // Warm heart
      ctx.fillStyle = PALETTE.mapleCrimson;
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.bezierCurveTo(-18, 2, -16, -15, 0, -5);
      ctx.bezierCurveTo(16, -15, 18, 2, 0, 13);
      ctx.fill();
      ctx.stroke();
      break;
    case "food":
      drawPumpkinPie(ctx, 0, 0, 11, 8, false);
      break;
    case "play":
      drawStar(ctx, 0, 0, 14, PALETTE.pumpkinGold);
      break;
    case "pet":
      // Paw print
      ctx.fillStyle = PALETTE.toastedSienna;
      ctx.beginPath();
      ctx.ellipse(0, 5, 8, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9, -4, 3.3, 0, Math.PI * 2);
      ctx.arc(-3, -9, 3.3, 0, Math.PI * 2);
      ctx.arc(3, -9, 3.3, 0, Math.PI * 2);
      ctx.arc(9, -4, 3.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case "home":
      ctx.fillStyle = PALETTE.warmPanel;
      ctx.fillRect(-10, -2, 20, 14);
      ctx.strokeRect(-10, -2, 20, 14);
      ctx.fillStyle = PALETTE.mapleCrimson;
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.lineTo(0, -14);
      ctx.lineTo(14, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case "friend":
      // Two smiling faces
      ctx.fillStyle = PALETTE.butter;
      ctx.beginPath();
      ctx.arc(-6, 1, 8, 0, Math.PI * 2);
      ctx.arc(7, -1, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case "laugh":
      ctx.fillStyle = PALETTE.birdYellow;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 2, 6, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;
    case "nature":
      drawMapleLeaf(ctx, 0, 0, 15, "crimson", -0.15);
      break;
  }

  ctx.restore();
}
