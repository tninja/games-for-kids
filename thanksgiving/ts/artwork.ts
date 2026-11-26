import { LEAF_COLORS, PALETTE, TREE_LEAF_SLOTS } from "./constants";
import { GratitudeLeaf, LeafColor, StickerId } from "./types";

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
  stroke = PALETTE.ink
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

  // Body & white apron
  ctx.fillStyle = PALETTE.cream;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red bowtie collar
  ctx.fillStyle = PALETTE.mapleCrimson;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-11, 2);
  ctx.lineTo(-11, 14);
  ctx.closePath();
  ctx.moveTo(0, 8);
  ctx.lineTo(11, 2);
  ctx.lineTo(11, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head & snout (original cute white pup with warm brown patch)
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.ellipse(3, -12, 26, 20, -0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Warm brown floppy ear
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.beginPath();
  ctx.ellipse(-18, -6, 10, 17, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Round nose
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.ellipse(27, -14, 5.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  if (mood === "excited") {
    ctx.beginPath();
    ctx.arc(8, -17, 4, Math.PI, 0);
    ctx.lineWidth = 2.4;
    ctx.stroke();
  } else if (mood === "oops") {
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(11, -14);
    ctx.moveTo(11, -20);
    ctx.lineTo(5, -14);
    ctx.lineWidth = 2.4;
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    ctx.arc(8, -17, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (mood === "oops") {
    ctx.arc(13, -5, 4, 0, Math.PI * 2);
  } else {
    ctx.arc(12, -9, 7, 0.15, Math.PI * 0.85);
  }
  ctx.stroke();

  // Tall puffy chef hat
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-11, -41, 11, 0, Math.PI * 2);
  ctx.arc(2, -45, 13, 0, Math.PI * 2);
  ctx.arc(14, -40, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-16, -34);
  ctx.quadraticCurveTo(-24, -48, -9, -49);
  ctx.quadraticCurveTo(2, -62, 14, -48);
  ctx.quadraticCurveTo(26, -44, 18, -32);
  ctx.lineTo(-15, -29);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hat band
  drawRoundedRect(ctx, -16, -34, 34, 8, 3);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.stroke();

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

  // Body
  ctx.fillStyle = PALETTE.birdYellow;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 9, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head tuft
  ctx.beginPath();
  ctx.moveTo(-2, -6);
  ctx.lineTo(-5, -13);
  ctx.moveTo(1, -6);
  ctx.lineTo(2, -13);
  ctx.stroke();

  // Flapping wing
  ctx.fillStyle = "#F4BE2A";
  ctx.beginPath();
  ctx.ellipse(-3, 2 - flap * 4, 7, 4, -0.5 - flap * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beak
  ctx.fillStyle = PALETTE.mapleCrimson;
  ctx.beginPath();
  ctx.moveTo(10, -1);
  ctx.lineTo(18, 1);
  ctx.lineTo(10, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny eye
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(5, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.save();
  ctx.translate(cx, cy);

  // Tin rim shadow
  ctx.fillStyle = "#D4C6B4";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 4, radius + 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Scalloped golden crust
  ctx.fillStyle = "#E0A458";
  const bumps = 18;
  ctx.beginPath();
  for (let i = 0; i < bumps; i++) {
    const a = (Math.PI * 2 * i) / bumps;
    const bx = Math.cos(a) * (radius + 2);
    const by = Math.sin(a) * (radius + 2);
    ctx.moveTo(bx + 12, by);
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // Spiced pumpkin filling
  ctx.fillStyle = "#D96F2B";
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner shine arc
  ctx.strokeStyle = "#ED954B";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 18, -2.4, -1.2);
  ctx.stroke();

  // Whipped cream swirl puffs
  const totalPuffs = Math.min(16, creamCount);
  for (let i = 0; i < totalPuffs; i++) {
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    const r = radius * 0.66;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    ctx.fillStyle = PALETTE.cream;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.145, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (hasCookie) {
    drawMapleLeaf(ctx, 0, 0, radius * 0.42, "gold", -0.1);
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

export function drawBackyardTable(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  guestCount: number,
  hasToast: boolean,
  hasPopcorn: boolean,
  hasPie: boolean,
  bob = 0
): void {
  ctx.save();

  // Seated guests behind the backyard ping-pong table
  const guestPalette = [
    { shirt: "#6B8F71", hair: "#4B3222" },
    { shirt: "#D95D39", hair: "#C9C0B5" },
    { shirt: "#5B85AA", hair: "#6B4423" },
    { shirt: "#E58A32", hair: "#3B281E" }
  ];
  const visibleGuests = Math.min(4, Math.max(0, guestCount - 2));
  for (let i = 0; i < visibleGuests; i++) {
    const frac = (i + 1) / (visibleGuests + 1);
    const gx = cx - width * 0.44 + frac * width * 0.88;
    const gp = guestPalette[i % guestPalette.length];
    drawGuestCharacter(ctx, gx, y - 24 + (i % 2 === 0 ? bob : -bob), gp.shirt, gp.hair, 0.95);
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
    drawToast(ctx, cx - width * 0.28, y - 10, 0.55, -0.1, true);
  }
  if (hasPopcorn) {
    // Mini popcorn bowl
    ctx.fillStyle = "#B86E39";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, y - 6, 16, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawPopcornKernel(ctx, cx - 7, y - 12, 0.65, false);
    drawPopcornKernel(ctx, cx + 6, y - 13, 0.65, true);
    drawPopcornKernel(ctx, cx, y - 17, 0.65, false);
  }
  if (hasPie) {
    drawPumpkinPie(ctx, cx + width * 0.28, y - 10, 18, 12, true);
  }

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
