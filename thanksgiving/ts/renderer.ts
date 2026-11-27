import {
  drawBackyardFence,
  drawBackyardTable,
  drawBeagleChef,
  drawFestiveStringLights,
  drawFoldingChair,
  drawGuestCharacter,
  drawLittleBird,
  drawMapleLeaf,
  drawMapleTree,
  drawMusicNote,
  drawPipingBag,
  drawPopcornKernel,
  drawPumpkinPie,
  drawRedDoghouse,
  drawRoundedRect,
  drawSillyCarrot,
  drawSnackIcon,
  drawStar,
  drawSteamWisp,
  drawToast
} from "./artwork";
import { DISH_SPECS, PALETTE, STAGE_LOGICAL_H, STAGE_LOGICAL_W } from "./constants";
import { getDuskLevel, getLightGlow } from "./lighting";
import {
  COUNTER_TOP_Y,
  drawDuskGroundTint,
  drawDuskSky,
  drawGroundShadow,
  drawKitchenCounter,
  drawKitchenWall,
  drawKitchenWindow,
  drawPendantLamp,
  drawStoveRange,
  drawSun
} from "./scenery";
import {
  ChairDishState,
  GameState,
  PieDishState,
  PlatterDishState,
  PopcornDishState,
  ToastDishState
} from "./types";

const OUTDOOR_HORIZON_Y = 300;

function drawChefShadow(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  drawGroundShadow(ctx, x + 2, y + 50 * scale, 26 * scale, 6 * scale);
}

function drawLabelPill(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number): void {
  ctx.save();
  ctx.font = "700 14px system-ui, -apple-system, sans-serif";
  const w = ctx.measureText(text).width + 24;
  drawRoundedRect(ctx, cx - w / 2, cy - 13, w, 26, 13);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

function drawWarmBackdrop(
  ctx: CanvasRenderingContext2D,
  t: number,
  outdoor: boolean,
  showDoghouse = true,
  dusk = 0
): void {
  if (outdoor) {
    drawDuskSky(ctx, 0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H, t, dusk);
    drawSun(ctx, 360, 74, 220, dusk);

    // Wooden backyard picket fence across horizon
    drawBackyardFence(ctx, 326, STAGE_LOGICAL_W);

    // Rolling autumn backyard hill
    ctx.fillStyle = "#B6C285";
    ctx.beginPath();
    ctx.ellipse(STAGE_LOGICAL_W * 0.5, STAGE_LOGICAL_H + 30, 310, 120, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Iconic red doghouse & pumpkin tucked on left lawn
    if (showDoghouse) {
      drawRedDoghouse(ctx, 52, 336, 0.85);
    }
    drawDuskGroundTint(ctx, 0, OUTDOOR_HORIZON_Y, STAGE_LOGICAL_W, STAGE_LOGICAL_H, dusk);
  } else {
    drawKitchenWall(ctx, STAGE_LOGICAL_W, STAGE_LOGICAL_H, dusk);
    drawKitchenCounter(ctx, STAGE_LOGICAL_W, STAGE_LOGICAL_H);
  }

  // Drifting autumn maple leaves
  const colors = ["crimson", "amber", "gold", "russet"] as const;
  for (let i = 0; i < 6; i++) {
    const lx = ((i * 83 + t * (16 + i * 3)) % (STAGE_LOGICAL_W + 40)) - 20;
    const ly = ((i * 77 + t * (20 + i * 4)) % (STAGE_LOGICAL_H + 40)) - 20;
    ctx.save();
    ctx.globalAlpha = outdoor ? 0.45 : 0.2;
    drawMapleLeaf(ctx, lx, ly, 10, colors[i % colors.length], t * 0.6 + i);
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.shape === "star") {
      drawStar(ctx, p.x, p.y, p.size, p.color);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number): void {
  if (!text) {
    return;
  }
  ctx.save();
  ctx.font = "700 14px system-ui, -apple-system, sans-serif";
  const tw = ctx.measureText(text).width;
  const bw = Math.min(STAGE_LOGICAL_W - 20, tw + 26);
  const bx = cx - bw / 2;
  drawRoundedRect(ctx, bx, y - 18, bw, 34, 14);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, y - 1);
  ctx.restore();
}

function drawAnimatedChefAndBird(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  chefX: number,
  chefY: number,
  chefScale: number,
  birdX: number,
  birdY: number,
  birdScale: number
): void {
  const dancing = state.chefDanceTimer > 0;
  const chirping = state.birdChirpTimer > 0;

  drawChefShadow(ctx, chefX, chefY, chefScale);
  ctx.save();
  if (dancing) {
    const hop = Math.abs(Math.sin(state.elapsedSec * 16)) * -14;
    const tilt = Math.sin(state.elapsedSec * 16) * 0.14;
    ctx.translate(chefX, chefY + hop);
    ctx.rotate(tilt);
    drawBeagleChef(ctx, 0, 0, chefScale, "excited", 0);
  } else {
    drawBeagleChef(ctx, chefX, chefY, chefScale, "excited", Math.sin(state.elapsedSec * 4) * 3);
  }
  ctx.restore();

  if (dancing) {
    const noteY = chefY - 56 - ((state.elapsedSec * 28) % 24);
    drawMusicNote(ctx, chefX - 24, noteY, PALETTE.mapleCrimson, 0.9);
    drawMusicNote(ctx, chefX + 30, noteY - 8, PALETTE.pumpkinGold, 0.85);
  }

  const loopX = chirping ? Math.cos(state.elapsedSec * 15) * 10 : 0;
  const loopY = chirping ? Math.sin(state.elapsedSec * 15) * 10 - 8 : Math.sin(state.elapsedSec * 6) * 6;
  drawLittleBird(
    ctx,
    birdX + loopX,
    birdY + loopY,
    birdScale,
    Math.sin(state.elapsedSec * (chirping ? 26 : 14))
  );
  if (chirping) {
    const noteY = birdY - 30 - ((state.elapsedSec * 24) % 18);
    drawMusicNote(ctx, birdX + 18, noteY, PALETTE.birdYellow, 0.85);
  }
}

function renderToastStage(ctx: CanvasRenderingContext2D, state: GameState, dish: ToastDishState): void {
  const dusk = getDuskLevel(state);
  drawWarmBackdrop(ctx, state.elapsedSec, false, true, dusk);
  drawKitchenWindow(ctx, 24, 96, 100, 96, state.elapsedSec, dusk);
  drawPendantLamp(ctx, 334, 30, getLightGlow(dusk), state.elapsedSec);
  drawGroundShadow(ctx, STAGE_LOGICAL_W / 2 + 4, 348, 56, 7);
  const isCozy = state.difficulty === "cozy";
  const goldenMinY = (isCozy ? 0.14 : 0.20) * STAGE_LOGICAL_H;
  const goldenMaxY = (isCozy ? 0.56 : 0.48) * STAGE_LOGICAL_H;

  // Checkered dish towel on left counter
  drawRoundedRect(ctx, 98, 364, 72, 24, 6);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.tableclothRed;
  ctx.fillRect(108, 366, 12, 20);
  ctx.fillRect(132, 366, 12, 20);
  ctx.fillRect(154, 366, 10, 20);

  ctx.save();
  drawRoundedRect(ctx, 26, goldenMinY, STAGE_LOGICAL_W - 52, goldenMaxY - goldenMinY, 18);
  ctx.fillStyle = "rgba(255, 229, 143, 0.34)";
  ctx.fill();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = PALETTE.mapleCrimson;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 13px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.textAlign = "center";
  ctx.fillText("GOLDEN CATCH ZONE - TAP CATCH!", STAGE_LOGICAL_W / 2, goldenMinY + 18);
  ctx.restore();

  const bob = Math.sin(state.elapsedSec * 4) * 3;
  const mood = dish.slices.some((s) => s.state === "hat_bounce")
    ? "oops"
    : dish.feedbackTimer > 0.2 && dish.streak > 0
      ? "excited"
      : "happy";
  drawChefShadow(ctx, 64, 324, 0.96);
  drawBeagleChef(ctx, 64, 324, 0.96, mood, bob);
  const birdY = dish.birdAssistTimer > 0 ? 245 : 284 + Math.sin(state.elapsedSec * 6) * 6;
  drawLittleBird(ctx, 348, birdY, 1.2, Math.sin(state.elapsedSec * 14));

  for (let i = 0; i < dish.slices.length; i++) {
    const s = dish.slices[i];
    drawToast(
      ctx,
      s.x * STAGE_LOGICAL_W,
      s.y * STAGE_LOGICAL_H,
      1.12,
      s.rotation,
      s.state === "caught" || s.state === "rescued"
    );
  }

  const sq = dish.toasterSquash * 6;
  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 340);
  drawRoundedRect(ctx, -48 - sq, -48 + sq, 96 + sq * 2, 54 - sq, 14);
  ctx.fillStyle = "#D96A47";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  ctx.fillStyle = "#F5A888";
  drawRoundedRect(ctx, -36, -38 + sq, 20, 28 - sq, 6);
  ctx.fill();
  // Animated toaster lever
  const leverY = -28 + sq + (dish.spawnTimer < 0.25 ? 10 : 0);
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(48 + sq, leverY, 12, 8);
  ctx.restore();

  for (let i = 0; i < Math.min(dish.plated, 7); i++) {
    drawToast(ctx, 134, 376 - i * 8, 0.52, i % 2 === 0 ? -0.06 : 0.06, true);
  }
  if (dish.plated > 0) {
    drawSteamWisp(ctx, 134, 358 - Math.min(dish.plated, 7) * 8, state.elapsedSec * 4);
  }

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

function renderPopcornStage(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  dish: PopcornDishState
): void {
  const dusk = getDuskLevel(state);
  drawWarmBackdrop(ctx, state.elapsedSec, false, true, dusk);
  const isCoop = state.playMode === "laptop_coop";
  drawKitchenWindow(ctx, 326, 64, 78, 92, state.elapsedSec, dusk);
  drawPendantLamp(ctx, 62, 40, getLightGlow(dusk), state.elapsedSec);
  drawStoveRange(ctx, STAGE_LOGICAL_W / 2, 126, state.elapsedSec);

  // Sizzling skillet with rattling lid & steam puffs
  const lidRattle = Math.sin(state.elapsedSec * 22) * 3;
  drawSteamWisp(ctx, STAGE_LOGICAL_W / 2 - 28, 92, state.elapsedSec * 4.5);
  drawSteamWisp(ctx, STAGE_LOGICAL_W / 2 + 24, 90, state.elapsedSec * 4.5 + 1.8);

  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 108);
  // Rattling lid
  ctx.save();
  ctx.translate(0, -14 - Math.abs(lidRattle));
  ctx.rotate(lidRattle * 0.03);
  ctx.fillStyle = "#7D858C";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 56, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#4A4340";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, -72, -14, 144, 30, 12);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, 68, -6, 46, 12, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < dish.items.length; i++) {
    const it = dish.items[i];
    const px = it.x * STAGE_LOGICAL_W;
    const py = it.y * STAGE_LOGICAL_H;
    if (it.itemType === "carrot") {
      drawSillyCarrot(ctx, px, py, 1.0, it.rotation);
    } else {
      if (it.itemType === "golden_kernel") {
        ctx.save();
        ctx.globalAlpha = 0.45;
        drawStar(ctx, px, py - 12, 5, PALETTE.butter, PALETTE.pumpkinGold);
        ctx.restore();
      }
      drawPopcornKernel(ctx, px, py, 1.15, it.itemType === "golden_kernel", it.rotation);
    }
  }

  const birdPx = dish.birdX * STAGE_LOGICAL_W;
  const birdPy = isCoop
    ? 258 + Math.sin(state.elapsedSec * 7) * 4
    : dish.birdAssistTimer > 0
      ? 344
      : 292 + Math.sin(state.elapsedSec * 5) * 8;
  drawLittleBird(ctx, birdPx, birdPy, 1.12, Math.sin(state.elapsedSec * 14));
  if (isCoop) {
    ctx.save();
    ctx.translate(birdPx, birdPy + 18);
    ctx.fillStyle = PALETTE.pumpkinGold;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = "800 11px system-ui, sans-serif";
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.fillText("P2", 0, -36);
    ctx.restore();
  }

  const bx = dish.bowlX * STAGE_LOGICAL_W;
  const wobble = Math.sin(state.elapsedSec * 36) * dish.bowlWobble * 7;
  drawChefShadow(ctx, bx, 382, 0.88);
  drawBeagleChef(ctx, bx, 382, 0.88, dish.bowlWobble > 0.2 ? "oops" : "happy", 0);

  ctx.save();
  ctx.translate(bx + wobble, 342);
  ctx.fillStyle = "#B96C38";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const shown = Math.min(8, dish.caught);
  for (let i = 0; i < shown; i++) {
    drawPopcornKernel(ctx, -26 + i * 7.5, -4 - (i % 2) * 5, 0.72, i % 3 === 0);
  }
  ctx.restore();

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

function renderChairStage(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  dish: ChairDishState
): void {
  drawWarmBackdrop(ctx, state.elapsedSec, true, true, getDuskLevel(state));

  const flap = Math.sin(state.elapsedSec * 9) * (1 - dish.tamedProgress / 100) * 6;
  drawBackyardTable(ctx, STAGE_LOGICAL_W / 2 + 24, 168 + flap * 0.2, 224, 3, true, true, false, flap * 0.3);

  // Playful autumn wind-gust swirls while chair is still untamed
  if (dish.tamedProgress < 100) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 253, 247, 0.65)";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    const windX = ((state.elapsedSec * 120) % (STAGE_LOGICAL_W + 90)) - 45;
    ctx.beginPath();
    ctx.moveTo(windX - 36, 228);
    ctx.quadraticCurveTo(windX - 10, 218, windX + 12, 228);
    ctx.arc(windX + 12, 222, 6, Math.PI * 0.5, Math.PI * 2.1, true);
    ctx.stroke();
    ctx.restore();
  }

  const openAmount = Math.max(0.2, 1 - (dish.tamedProgress / 100) * 0.75);
  const idleWobble = dish.tamedProgress >= 100 ? 0 : Math.sin(state.elapsedSec * 12) * 0.08;
  drawFoldingChair(
    ctx,
    STAGE_LOGICAL_W / 2,
    292 - dish.chairHopY,
    1.7,
    dish.chairAngle + idleWobble,
    openAmount
  );

  // Cartoon bounce motion lines when chair springs
  if (dish.chairHopY > 8) {
    ctx.save();
    ctx.strokeStyle = PALETTE.mapleCrimson;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(148, 250);
    ctx.lineTo(136, 242);
    ctx.moveTo(272, 250);
    ctx.lineTo(284, 242);
    ctx.stroke();
    ctx.restore();
  }

  const chefMood = dish.tamedProgress >= 100 ? "excited" : dish.chairHopY > 15 ? "oops" : "happy";
  drawChefShadow(ctx, 84, 340, 0.96);
  drawBeagleChef(ctx, 84, 340, 0.96, chefMood, Math.sin(state.elapsedSec * 8) * 3);
  drawLittleBird(
    ctx,
    340,
    260 - dish.chairHopY * 0.5 + Math.sin(state.elapsedSec * 10) * 5,
    1.25,
    Math.sin(state.elapsedSec * 18)
  );

  const barW = 290;
  const barX = (STAGE_LOGICAL_W - barW) / 2;
  const barY = 392;
  drawRoundedRect(ctx, barX, barY, barW, 24, 12);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  const fillW = Math.max(0, ((barW - 6) * dish.tamedProgress) / 100);
  if (fillW > 4) {
    drawRoundedRect(ctx, barX + 3, barY + 3, fillW, 18, 9);
    ctx.fillStyle = dish.tamedProgress >= 100 ? PALETTE.sageLeaf : PALETTE.mapleCrimson;
    ctx.fill();
  }
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CHAIR TAMED: " + String(Math.round(dish.tamedProgress)) + "%", STAGE_LOGICAL_W / 2, barY + 12);

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

function renderPlatterStage(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  dish: PlatterDishState
): void {
  const dusk = getDuskLevel(state);
  drawWarmBackdrop(ctx, state.elapsedSec, false, true, dusk);

  // Kitchen window with an excited guest peeking in from the backyard
  drawKitchenWindow(ctx, 152, 166, 116, 78, state.elapsedSec, dusk);
  drawGuestCharacter(
    ctx,
    210,
    212 + Math.sin(state.elapsedSec * 4) * 2,
    "#6B8F71",
    "#4B3222",
    1.15
  );

  const count = dish.order.length;
  const slotGap = 62;
  const boxW = Math.max(190, count * slotGap + 44);
  const boxX = (STAGE_LOGICAL_W - boxW) / 2;
  const shakeX = dish.wrongFlashTimer > 0 ? Math.sin(state.elapsedSec * 55) * 6 : 0;

  ctx.save();
  ctx.translate(shakeX, 0);
  drawRoundedRect(ctx, boxX, 66, boxW, 84, 22);
  ctx.fillStyle = dish.wrongFlashTimer > 0 ? "#FFE1DA" : PALETTE.cream;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = dish.wrongFlashTimer > 0 ? PALETTE.mapleCrimson : PALETTE.ink;
  ctx.stroke();

  const startX = STAGE_LOGICAL_W / 2 - ((count - 1) * slotGap) / 2;
  for (let i = 0; i < count; i++) {
    const sx = startX + i * slotGap;
    const sy = 108;
    const isDone = i < dish.matchedCount;
    const isNext = i === dish.matchedCount;

    if (isNext) {
      ctx.fillStyle = "rgba(242, 165, 65, 0.35)";
      ctx.beginPath();
      ctx.arc(sx, sy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.mapleCrimson;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    } else if (isDone) {
      ctx.fillStyle = "rgba(107, 143, 113, 0.25)";
      ctx.beginPath();
      ctx.arc(sx, sy, 23, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSnackIcon(ctx, dish.order[i], sx, sy, 32);

    if (isDone) {
      ctx.fillStyle = PALETTE.sageLeaf;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(sx + 16, sy - 16, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + 12, sy - 16);
      ctx.lineTo(sx + 15, sy - 13);
      ctx.lineTo(sx + 20, sy - 19);
      ctx.stroke();
    }
  }
  ctx.restore();

  drawChefShadow(ctx, 50, 310, 0.92);
  drawBeagleChef(
    ctx,
    50,
    310,
    0.92,
    dish.wrongFlashTimer > 0 ? "oops" : dish.platterBounce > 0.2 ? "excited" : "happy",
    Math.sin(state.elapsedSec * 5) * 2.5
  );
  drawLittleBird(ctx, 344, 214 + Math.sin(state.elapsedSec * 7) * 5, 1.2, Math.sin(state.elapsedSec * 14));

  drawGroundShadow(ctx, STAGE_LOGICAL_W / 2, 352, 112, 10);
  const bounceY = -dish.platterBounce * 10;
  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 338 + bounceY);
  ctx.fillStyle = "#C68642";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 118, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#E6B87A";
  ctx.beginPath();
  ctx.ellipse(0, -2, 98, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < dish.matchedCount; i++) {
    const px = -((dish.order.length - 1) * 40) / 2 + i * 40;
    drawSnackIcon(ctx, dish.order[i], px, -6, 28);
  }
  ctx.restore();

  drawLabelPill(
    ctx,
    "Platter " + String(Math.min(dish.plattersDone + 1, dish.target)) + " of " + String(dish.target),
    STAGE_LOGICAL_W / 2,
    398
  );

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 34);
  }
}

function renderPieStage(ctx: CanvasRenderingContext2D, state: GameState, dish: PieDishState): void {
  const dusk = getDuskLevel(state);
  drawWarmBackdrop(ctx, state.elapsedSec, false, true, dusk);
  drawPendantLamp(ctx, 124, 40, getLightGlow(dusk), state.elapsedSec);
  drawPendantLamp(ctx, 296, 40, getLightGlow(dusk), state.elapsedSec + 1.1);

  // Wooden serving board grounding the pie on the counter
  drawGroundShadow(ctx, STAGE_LOGICAL_W / 2, COUNTER_TOP_Y + 14, 128, 12, 0.2);
  ctx.save();
  ctx.fillStyle = "#B8774A";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(STAGE_LOGICAL_W / 2, COUNTER_TOP_Y + 6, 124, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawChefShadow(ctx, 48, 310, 0.84);
  drawBeagleChef(
    ctx,
    48,
    310,
    0.84,
    dish.stage === "pie_celebrate" ? "excited" : "happy",
    Math.sin(state.elapsedSec * 5) * 3
  );
  drawLittleBird(ctx, 354, 110 + Math.sin(state.elapsedSec * 6) * 5, 1.2, Math.sin(state.elapsedSec * 12));

  drawPumpkinPie(
    ctx,
    STAGE_LOGICAL_W / 2,
    244,
    102,
    dish.creamDots.length,
    dish.stage === "pie_celebrate"
  );

  // Animated pastry piping bag following the swirl progress
  if (dish.stage === "whipping") {
    const a = dish.whipProgress * Math.PI * 2 - Math.PI / 2;
    const bagX = STAGE_LOGICAL_W / 2 + Math.cos(a) * 68;
    const bagY = 244 + Math.sin(a) * 68;
    drawPipingBag(ctx, bagX, bagY, 0.38 + Math.sin(state.elapsedSec * 9) * 0.08);
  } else if (dish.stage === "cookie_drop") {
    const floatY = 120 + Math.sin(state.elapsedSec * 7) * 8;
    drawMapleLeaf(ctx, STAGE_LOGICAL_W / 2, floatY, 32, "gold", Math.sin(state.elapsedSec * 3) * 0.12);
  } else {
    // Cozy oven-warm steam wisps rising from finished pumpkin pie
    drawSteamWisp(ctx, STAGE_LOGICAL_W / 2 - 26, 178, state.elapsedSec * 4);
    drawSteamWisp(ctx, STAGE_LOGICAL_W / 2 + 24, 174, state.elapsedSec * 4 + 1.5);
  }

  drawLabelPill(
    ctx,
    "Pie " + String(Math.min(dish.piesFinished + 1, dish.target)) + " of " + String(dish.target),
    STAGE_LOGICAL_W / 2,
    398
  );

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

export function renderStageCanvas(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save();
  ctx.clearRect(0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H);
  const dusk = getDuskLevel(state);
  const glow = getLightGlow(dusk);

  if (state.phase === "title") {
    drawWarmBackdrop(ctx, state.elapsedSec, true, true, dusk);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2 + 24, 330, 250, 250, state.leaves, false);
    drawFestiveStringLights(ctx, 56, 268, 220, 186, state.elapsedSec, glow);
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2 + 12,
      344,
      276,
      6,
      true,
      true,
      true,
      Math.sin(state.elapsedSec * 3) * 2,
      true,
      true
    );
    drawAnimatedChefAndBird(ctx, state, 78, 344, 0.96, 336, 282, 1.22);
    const bubble =
      state.easterBubbleTimer > 0
        ? state.easterBubbleText
        : "Tap Beagle or Bird! Ready to cook?";
    drawSpeechBubble(ctx, bubble, STAGE_LOGICAL_W / 2, 42);
  } else if (state.phase === "pass_banner") {
    drawWarmBackdrop(ctx, state.elapsedSec, true, true, dusk);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2 + 26, 320, 215, 215, state.leaves, false);
    drawFestiveStringLights(ctx, 56, 268, 232, 198, state.elapsedSec, glow);
    drawAnimatedChefAndBird(ctx, state, STAGE_LOGICAL_W / 2 - 42, 314, 1.1, STAGE_LOGICAL_W / 2 + 54, 270, 1.32);
  } else if (state.phase === "dish_play" && state.dishState) {
    if (state.dishState.kind === "golden_toast") {
      renderToastStage(ctx, state, state.dishState);
    } else if (state.dishState.kind === "flying_popcorn") {
      renderPopcornStage(ctx, state, state.dishState);
    } else if (state.dishState.kind === "folding_chair") {
      renderChairStage(ctx, state, state.dishState);
    } else if (state.dishState.kind === "pretzel_platter") {
      renderPlatterStage(ctx, state, state.dishState);
    } else {
      renderPieStage(ctx, state, state.dishState);
    }
  } else if (state.phase === "dish_complete") {
    drawWarmBackdrop(ctx, state.elapsedSec, true, true, dusk);
    const hasToast = state.results.some((r) => r.dishId === "golden_toast");
    const hasPopcorn = state.results.some((r) => r.dishId === "flying_popcorn");
    const hasChair = state.results.some((r) => r.dishId === "folding_chair");
    const hasPlatter = state.results.some((r) => r.dishId === "pretzel_platter");
    const hasPie = state.results.some((r) => r.dishId === "pumpkin_pie");
    drawFestiveStringLights(ctx, 6, 176, 414, 196, state.elapsedSec, glow);
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2 + 12,
      324,
      286,
      state.seatedGuests.length,
      hasToast,
      hasPopcorn,
      hasPie,
      Math.sin(state.elapsedSec * 4) * 2,
      hasPlatter,
      hasChair
    );
    drawAnimatedChefAndBird(ctx, state, 68, 348, 0.9, 356, 270, 1.2);

    const last = state.results[state.results.length - 1];
    if (last) {
      const spec = DISH_SPECS[last.dishId];
      for (let i = 0; i < 3; i++) {
        drawStar(
          ctx,
          STAGE_LOGICAL_W / 2 - 52 + i * 52,
          112,
          24,
          i < last.stars ? PALETTE.pumpkinGold : "#E2D5C3"
        );
      }
      drawSpeechBubble(ctx, spec.shortTitle + " Done! +" + last.guestUnlocked, STAGE_LOGICAL_W / 2, 46);
    }
  } else if (state.phase === "gratitude_tree") {
    drawWarmBackdrop(ctx, state.elapsedSec, true, false, dusk);
    drawFestiveStringLights(ctx, 0, 250, 420, 262, state.elapsedSec, glow);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 396, 320, 326, state.leaves, true);
    drawAnimatedChefAndBird(ctx, state, 72, 362, 0.88, 348, 134, 1.2);
    const bubble =
      state.easterBubbleTimer > 0
        ? state.easterBubbleText
        : "Gratitude Maple Tree (" + String(state.leaves.length) + " leaves)";
    drawSpeechBubble(ctx, bubble, STAGE_LOGICAL_W / 2, 36);
  } else if (state.phase === "feast_finale") {
    drawWarmBackdrop(ctx, state.elapsedSec, true, true, dusk);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2 + 24, 306, 254, 236, state.leaves, false);
    drawFestiveStringLights(ctx, 56, 268, 224, 182, state.elapsedSec, glow);
    drawFestiveStringLights(ctx, 250, 186, 398, 226, state.elapsedSec + 1.2, glow);
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2 + 12,
      344,
      298,
      state.seatedGuests.length,
      true,
      true,
      true,
      Math.sin(state.elapsedSec * 4) * 2.5,
      true,
      true
    );
    drawAnimatedChefAndBird(ctx, state, 62, 358, 0.9, 360, 282, 1.2);
    const bubble =
      state.easterBubbleTimer > 0 ? state.easterBubbleText : "Happy Thanksgiving Feast!";
    drawSpeechBubble(ctx, bubble, STAGE_LOGICAL_W / 2, 38);
  }

  drawParticles(ctx, state);
  ctx.restore();
}
