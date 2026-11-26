import {
  drawBackyardTable,
  drawBeagleChef,
  drawLittleBird,
  drawMapleLeaf,
  drawMapleTree,
  drawPopcornKernel,
  drawPumpkinPie,
  drawRoundedRect,
  drawSillyCarrot,
  drawStar,
  drawToast
} from "./artwork";
import { DISH_SPECS, PALETTE, STAGE_LOGICAL_H, STAGE_LOGICAL_W } from "./constants";
import { GameState, PieDishState, PopcornDishState, ToastDishState } from "./types";

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

  // Subtle decorative falling autumn leaves
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
    // Rolling autumn backyard hill
    ctx.fillStyle = "#B6C285";
    ctx.beginPath();
    ctx.ellipse(STAGE_LOGICAL_W * 0.5, STAGE_LOGICAL_H + 30, 310, 120, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else {
    // Cozy kitchen countertop
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
  const bw = Math.min(STAGE_LOGICAL_W - 28, tw + 28);
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

  // Glowing Golden Catch Zone
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

  // Beagle Chef on left & Little Bird helper on right
  const bob = Math.sin(state.elapsedSec * 4) * 3;
  const mood = dish.slices.some((s) => s.state === "hat_bounce")
    ? "oops"
    : dish.feedbackTimer > 0.2 && dish.streak > 0
      ? "excited"
      : "happy";
  drawBeagleChef(ctx, 78, 326, 1.05, mood, bob);
  const birdY = dish.birdAssistTimer > 0 ? 250 : 288 + Math.sin(state.elapsedSec * 6) * 6;
  drawLittleBird(ctx, 344, birdY, 1.25, Math.sin(state.elapsedSec * 14));

  // Flying / caught toast slices
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

  // Vintage toaster on center counter
  const sq = dish.toasterSquash * 6;
  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 340);
  drawRoundedRect(ctx, -48 - sq, -48 + sq, 96 + sq * 2, 54 - sq, 14);
  ctx.fillStyle = "#D96A47";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
  // Toaster shine & lever
  ctx.fillStyle = "#F5A888";
  drawRoundedRect(ctx, -36, -38 + sq, 20, 28 - sq, 6);
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(48 + sq, -26 + sq, 12, 8);
  ctx.restore();

  // Plated stack on left counter
  for (let i = 0; i < Math.min(dish.plated, 7); i++) {
    drawToast(ctx, 134, 376 - i * 8, 0.52, (i % 2 === 0 ? -0.06 : 0.06), true);
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

  // Big skillet at top popping kernels
  ctx.save();
  ctx.translate(STAGE_LOGICAL_W / 2, 108);
  ctx.fillStyle = "#4A4340";
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, -72, -14, 144, 30, 12);
  ctx.fill();
  ctx.stroke();
  // Skillet handle
  drawRoundedRect(ctx, 68, -6, 46, 12, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Falling popcorn & carrots
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

  // Little Bird helper swooping near bottom
  const birdY = dish.birdAssistTimer > 0 ? 344 : 292 + Math.sin(state.elapsedSec * 5) * 8;
  drawLittleBird(ctx, dish.birdX * STAGE_LOGICAL_W, birdY, 1.15, Math.sin(state.elapsedSec * 14));

  // Beagle Chef holding wooden bowl
  const bx = dish.bowlX * STAGE_LOGICAL_W;
  const wobble = Math.sin(state.elapsedSec * 36) * dish.bowlWobble * 7;
  drawBeagleChef(ctx, bx, 382, 0.9, dish.bowlWobble > 0.2 ? "oops" : "happy", 0);

  // Wooden catching bowl
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
  // Fill visuals inside bowl
  const shown = Math.min(8, dish.caught);
  for (let i = 0; i < shown; i++) {
    drawPopcornKernel(ctx, -26 + i * 7.5, -4 - (i % 2) * 5, 0.72, i % 3 === 0);
  }
  ctx.restore();

  if (dish.feedbackTimer > 0) {
    drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
  }
}

function renderPieStage(ctx: CanvasRenderingContext2D, state: GameState, dish: PieDishState): void {
  drawWarmBackdrop(ctx, state.elapsedSec, false);

  // Beagle Chef & Little Bird cheering beside the pie
  drawBeagleChef(
    ctx,
    66,
    112,
    0.88,
    dish.stage === "pie_celebrate" ? "excited" : "happy",
    Math.sin(state.elapsedSec * 5) * 3
  );
  drawLittleBird(ctx, 354, 110 + Math.sin(state.elapsedSec * 6) * 5, 1.25, Math.sin(state.elapsedSec * 12));

  // Giant pumpkin pie center stage
  drawPumpkinPie(
    ctx,
    STAGE_LOGICAL_W / 2,
    244,
    102,
    dish.creamDots.length,
    dish.stage === "pie_celebrate"
  );

  // Hovering maple cookie waiting to drop
  if (dish.stage === "cookie_drop") {
    const floatY = 120 + Math.sin(state.elapsedSec * 7) * 8;
    drawMapleLeaf(ctx, STAGE_LOGICAL_W / 2, floatY, 32, "gold", Math.sin(state.elapsedSec * 3) * 0.12);
  }

  // Pie counter pips
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
    drawBackyardTable(ctx, STAGE_LOGICAL_W / 2, 344, 290, 4, true, true, true, Math.sin(state.elapsedSec * 3) * 2);
    drawBeagleChef(ctx, 114, 330, 1.05, "excited", Math.sin(state.elapsedSec * 4) * 3);
    drawLittleBird(ctx, 314, 286 + Math.sin(state.elapsedSec * 6) * 6, 1.3, Math.sin(state.elapsedSec * 14));
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
    } else {
      renderPieStage(ctx, state, state.dishState);
    }
  } else if (state.phase === "dish_complete") {
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    const hasToast = state.results.some((r) => r.dishId === "golden_toast");
    const hasPopcorn = state.results.some((r) => r.dishId === "flying_popcorn");
    const hasPie = state.results.some((r) => r.dishId === "pumpkin_pie");
    drawBackyardTable(
      ctx,
      STAGE_LOGICAL_W / 2,
      320,
      310,
      state.seatedGuests.length,
      hasToast,
      hasPopcorn,
      hasPie,
      Math.sin(state.elapsedSec * 4) * 2
    );
    drawBeagleChef(ctx, 74, 344, 0.95, "excited", Math.sin(state.elapsedSec * 5) * 3);
    drawLittleBird(ctx, 352, 274, 1.25, Math.sin(state.elapsedSec * 14));

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
      drawSpeechBubble(ctx, spec.shortTitle + " Ready! +" + last.guestUnlocked, STAGE_LOGICAL_W / 2, 46);
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
      336,
      state.seatedGuests.length,
      true,
      true,
      true,
      Math.sin(state.elapsedSec * 4) * 2.5
    );
    drawBeagleChef(ctx, 64, 360, 0.95, "excited", Math.sin(state.elapsedSec * 6) * 3);
    drawLittleBird(ctx, 358, 286 + Math.sin(state.elapsedSec * 7) * 5, 1.25, Math.sin(state.elapsedSec * 15));
    drawSpeechBubble(ctx, "Happy Thanksgiving Feast!", STAGE_LOGICAL_W / 2, 38);
  }

  drawParticles(ctx, state);
  ctx.restore();
}
