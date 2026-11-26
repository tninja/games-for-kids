import {
  drawBackyardTable,
  drawBeagleChef,
  drawFoldingChair,
  drawLittleBird,
  drawMapleLeaf,
  drawMapleTree,
  drawPopcornKernel,
  drawPumpkinPie,
  drawRoundedRect,
  drawSillyCarrot,
  drawSnackIcon,
  drawStar,
  drawToast
} from "./artwork";
import { DISH_SPECS, PALETTE, STAGE_LOGICAL_H, STAGE_LOGICAL_W } from "./constants";
import {
  ChairDishState,
  GameState,
  PieDishState,
  PlatterDishState,
  PopcornDishState,
  ToastDishState
} from "./types";

function drawWarmBackdrop(ctx: CanvasRenderingContext2D, t: number, outdoor: boolean): void {
  const grad = ctx.createLinearGradient(0, 0, 0, STAGE_LOGICAL_H);
  if (outdoor) {
    grad.addColorStop(0, "#FFE9C9");
    grad.addColorStop(0.65, "#F9D6A5");
    grad.addColorStop(1, "#D8BA85");
  } else {
    grad.addColorStop(0, PALETTE.parchment);
    grad.addColorStop(0.7, PALETTE.warmSky);
    grad.addColorStop(1, "#E8C396");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H);

  const colors = ["crimson", "amber", "gold", "russet"] as const;
  for (let i = 0; i < 6; i++) {
    const lx = ((i * 83 + t * (16 + i * 3)) % (STAGE_LOGICAL_W + 40)) - 20;
    const ly = ((i * 77 + t * (20 + i * 4)) % (STAGE_LOGICAL_H + 40)) - 20;
    ctx.save();
    ctx.globalAlpha = outdoor ? 0.45 : 0.22;
    drawMapleLeaf(ctx, lx, ly, 10, colors[i % colors.length], t * 0.6 + i);
    ctx.restore();
  }

  if (outdoor) {
    ctx.fillStyle = "#B6C285";
    ctx.beginPath();
    ctx.ellipse(STAGE_LOGICAL_W * 0.5, STAGE_LOGICAL_H + 30, 310, 120, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else {
    ctx.fillStyle = "#D49B63";
    ctx.fillRect(0, 336, STAGE_LOGICAL_W, STAGE_LOGICAL_H - 336);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 336);
    ctx.lineTo(STAGE_LOGICAL_W, 336);
    ctx.stroke();
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
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
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
  ctx.font = "700 15px system-ui, -apple-system, sans-serif";
  const tw = ctx.measureText(text).width;
  const bw = Math.min(STAGE_LOGICAL_W - 24, tw + 28);
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

function renderToastStage(ctx: CanvasRenderingContext2D, state: GameState, dish: ToastDishState): void {
  drawWarmBackdrop(ctx, state.elapsedSec, false);
  const isCozy = state.difficulty === "cozy";
  const goldenMinY = (isCozy ? 0.14 : 0.20) * STAGE_LOGICAL_H;
  const goldenMaxY = (isCozy ? 0.56 : 0.48) * STAGE_LOGICAL_H;

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
  drawBeagleChef(ctx, 78, 326, 1.05, mood, bob);
  const birdY = dish.birdAssistTimer > 0 ? 245 : 288 + Math.sin(state.elapsedSec * 6) * 6;
  drawLittleBird(ctx, 344, birdY, 1.25, Math.sin(state.elapsedSec * 14));

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
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(48 + sq, -26 + sq, 12, 8);
  ctx.restore();

  for (let i = 0; i < Math.min(dish.plated, 7); i++) {
    drawToast(ctx, 134, 376 - i * 8, 0.52, i % 2 === 0 ? -0.06 : 0.06, true);
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
  drawWarmBackdrop(ctx, state.elapsedSec, false);
  const isCoop = state.playMode === "laptop_coop";

  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 108);
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
      drawPopcornKernel(ctx, px, py, 1.15, it.itemType === "golden_kernel", it.rotation);
    }
  }

  // Little Bird (carrying golden mini-cup in Laptop 2P Co-op!)
  const birdPx = dish.birdX * STAGE_LOGICAL_W;
  const birdPy = isCoop
    ? 258 + Math.sin(state.elapsedSec * 7) * 4
    : dish.birdAssistTimer > 0
      ? 344
      : 292 + Math.sin(state.elapsedSec * 5) * 8;
  drawLittleBird(ctx, birdPx, birdPy, 1.18, Math.sin(state.elapsedSec * 14));
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
    ctx.fillText("P2", 0, -34);
    ctx.restore();
  }

  const bx = dish.bowlX * STAGE_LOGICAL_W;
  const wobble = Math.sin(state.elapsedSec * 36) * dish.bowlWobble * 7;
  drawBeagleChef(ctx, bx, 382, 0.9, dish.bowlWobble > 0.2 ? "oops" : "happy", 0);

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
  drawWarmBackdrop(ctx, state.elapsedSec, true);

  // Backyard ping-pong table in background with flapping tablecloth
  const flap = Math.sin(state.elapsedSec * 9) * (1 - dish.tamedProgress / 100) * 6;
  drawBackyardTable(ctx, STAGE_LOGICAL_W / 2, 168 + flap * 0.2, 230, 3, true, true, false, flap * 0.3);

  // Bouncy striped folding lawn chair in foreground
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

  // Beagle Chef & Little Bird wrestling/cheering
  const chefMood = dish.tamedProgress >= 100 ? "excited" : dish.chairHopY > 15 ? "oops" : "happy";
  drawBeagleChef(ctx, 84, 342, 1.0, chefMood, Math.sin(state.elapsedSec * 8) * 3);
  drawLittleBird(
    ctx,
    340,
    264 - dish.chairHopY * 0.5 + Math.sin(state.elapsedSec * 10) * 5,
    1.3,
    Math.sin(state.elapsedSec * 18)
  );

  // Tamed Progress Bar
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
  drawWarmBackdrop(ctx, state.elapsedSec, false);

  // Order Speech Cloud at top
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
      // Crisp check badge
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

  // Beagle Chef & Little Bird behind serving platter
  drawBeagleChef(
    ctx,
    82,
    244,
    0.96,
    dish.wrongFlashTimer > 0 ? "oops" : dish.platterBounce > 0.2 ? "excited" : "happy",
    Math.sin(state.elapsedSec * 5) * 2.5
  );
  drawLittleBird(ctx, 344, 214 + Math.sin(state.elapsedSec * 7) * 5, 1.25, Math.sin(state.elapsedSec * 14));

  // Big wooden serving platter on counter showing already-matched snacks
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

  ctx.font = "700 14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.fillText(
    "Platter " + String(Math.min(dish.plattersDone + 1, dish.target)) + " of " + String(dish.target),
    STAGE_LOGICAL_W / 2,
    404
  );

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 34);
  }
}

function renderPieStage(ctx: CanvasRenderingContext2D, state: GameState, dish: PieDishState): void {
  drawWarmBackdrop(ctx, state.elapsedSec, false);

  drawBeagleChef(
    ctx,
    66,
    112,
    0.88,
    dish.stage === "pie_celebrate" ? "excited" : "happy",
    Math.sin(state.elapsedSec * 5) * 3
  );
  drawLittleBird(ctx, 354, 110 + Math.sin(state.elapsedSec * 6) * 5, 1.25, Math.sin(state.elapsedSec * 12));

  drawPumpkinPie(
    ctx,
    STAGE_LOGICAL_W / 2,
    244,
    102,
    dish.creamDots.length,
    dish.stage === "pie_celebrate"
  );

  if (dish.stage === "cookie_drop") {
    const floatY = 120 + Math.sin(state.elapsedSec * 7) * 8;
    drawMapleLeaf(ctx, STAGE_LOGICAL_W / 2, floatY, 32, "gold", Math.sin(state.elapsedSec * 3) * 0.12);
  }

  ctx.font = "700 14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.fillText(
    "Pie " + String(Math.min(dish.piesFinished + 1, dish.target)) + " of " + String(dish.target),
    STAGE_LOGICAL_W / 2,
    396
  );

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

export function renderStageCanvas(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save();
  ctx.clearRect(0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H);

  if (state.phase === "title") {
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 330, 260, 260, state.leaves, false);
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2,
      344,
      290,
      6,
      true,
      true,
      true,
      Math.sin(state.elapsedSec * 3) * 2,
      true,
      true
    );
    drawBeagleChef(ctx, 88, 330, 1.0, "excited", Math.sin(state.elapsedSec * 4) * 3);
    drawLittleBird(ctx, 324, 282 + Math.sin(state.elapsedSec * 6) * 6, 1.3, Math.sin(state.elapsedSec * 14));
    drawSpeechBubble(ctx, "Happy Thanksgiving! Let's cook!", STAGE_LOGICAL_W / 2, 42);
  } else if (state.phase === "pass_banner") {
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 320, 220, 220, state.leaves, false);
    drawBeagleChef(ctx, STAGE_LOGICAL_W / 2 - 42, 310, 1.15, "excited", Math.sin(state.elapsedSec * 4) * 4);
    drawLittleBird(ctx, STAGE_LOGICAL_W / 2 + 54, 270 + Math.sin(state.elapsedSec * 6) * 6, 1.4, Math.sin(state.elapsedSec * 12));
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
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    const hasToast = state.results.some((r) => r.dishId === "golden_toast");
    const hasPopcorn = state.results.some((r) => r.dishId === "flying_popcorn");
    const hasChair = state.results.some((r) => r.dishId === "folding_chair");
    const hasPlatter = state.results.some((r) => r.dishId === "pretzel_platter");
    const hasPie = state.results.some((r) => r.dishId === "pumpkin_pie");
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2,
      320,
      300,
      state.seatedGuests.length,
      hasToast,
      hasPopcorn,
      hasPie,
      Math.sin(state.elapsedSec * 4) * 2,
      hasPlatter,
      hasChair
    );
    drawBeagleChef(ctx, 64, 344, 0.92, "excited", Math.sin(state.elapsedSec * 5) * 3);
    drawLittleBird(ctx, 356, 270, 1.25, Math.sin(state.elapsedSec * 14));

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
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 396, 320, 326, state.leaves, true);
    drawLittleBird(ctx, 348, 128 + Math.sin(state.elapsedSec * 5) * 5, 1.25, Math.sin(state.elapsedSec * 12));
    drawBeagleChef(ctx, 72, 366, 0.9, "happy", Math.sin(state.elapsedSec * 3) * 2);
    drawSpeechBubble(
      ctx,
      "Gratitude Maple Tree (" + String(state.leaves.length) + " leaves)",
      STAGE_LOGICAL_W / 2,
      36
    );
  } else if (state.phase === "feast_finale") {
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 304, 260, 240, state.leaves, false);
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2,
      344,
      316,
      state.seatedGuests.length,
      true,
      true,
      true,
      Math.sin(state.elapsedSec * 4) * 2.5,
      true,
      true
    );
    drawBeagleChef(ctx, 56, 360, 0.92, "excited", Math.sin(state.elapsedSec * 6) * 3);
    drawLittleBird(ctx, 360, 282 + Math.sin(state.elapsedSec * 7) * 5, 1.25, Math.sin(state.elapsedSec * 15));
    drawSpeechBubble(ctx, "Happy Thanksgiving Feast!", STAGE_LOGICAL_W / 2, 38);
  }

  drawParticles(ctx, state);
  ctx.restore();
}
