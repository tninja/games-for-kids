import {
  drawBarleyLoaf,
  drawBlessingToken,
  drawChildFriend,
  drawCross,
  drawFish,
  drawGalileeBackdrop,
  drawGoldenFootprint,
  drawGratitudeOliveTree,
  drawHeartBurst,
  drawJesus,
  drawLeaf,
  drawMarketCart,
  drawRoundedRect,
  drawSpeechBubble,
  drawStar,
  drawSunRays,
  drawToyBlock,
  drawWovenBasket,
  safeArc
} from "./artwork";
import { PALETTE, STAGE_LOGICAL_H, STAGE_LOGICAL_W, STAGE_SEQUENCE } from "./constants";
import { STAGE_TEXT, UI_TEXT, formatPrimary, formatSecondary, getEasterLine } from "./i18n";
import { GameState, LoavesStageState, RunBackStageState, VerseBuilderStageState } from "./types";
import { getVerseById, getVerseTiles } from "./verses";

function drawFloatingLeaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeSec: number
): void {
  const colors = ["gold", "olive", "crimson", "sky"] as const;
  for (let i = 0; i < 6; i++) {
    const x = ((i * 83 + timeSec * 22) % (w + 40)) - 20;
    const y = ((i * 71 + timeSec * 30) % (h * 0.72)) + 16;
    drawLeaf(ctx, x, y, 8, colors[i % colors.length], Math.sin(timeSec * 2 + i) * 0.6);
  }
}

function drawTitleBanner(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  w: number
): void {
  drawRoundedRect(ctx, 22, 18, w - 44, 78, 18);
  ctx.fillStyle = "rgba(255, 248, 235, 0.92)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatPrimary(UI_TEXT.gameTitle, state.langMode), w / 2, 50);

  const sub = formatSecondary(UI_TEXT.gameTitle, state.langMode) || formatPrimary(UI_TEXT.gameSubtitle, state.langMode);
  ctx.fillStyle = PALETTE.terracottaDark;
  ctx.font = "700 15px system-ui, -apple-system, sans-serif";
  ctx.fillText(sub, w / 2, 78);
}

function drawEasterOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  w: number,
  jesusX: number,
  treeX: number,
  friendX: number,
  topY: number
): void {
  if (state.easterTimer <= 0 || state.easterSource === "none") {
    return;
  }
  const line = getEasterLine(state.easterSource, state.easterLineIndex);
  if (!line) {
    return;
  }
  const anchorX =
    state.easterSource === "jesus"
      ? jesusX
      : state.easterSource === "tree"
        ? treeX
        : friendX;
  drawSpeechBubble(
    ctx,
    anchorX,
    topY,
    formatPrimary(line, state.langMode),
    formatSecondary(line, state.langMode),
    w,
    anchorX
  );
}

function renderLoavesPlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  stage: LoavesStageState,
  w: number,
  h: number,
  timeSec: number
): void {
  drawGalileeBackdrop(ctx, w, h, timeSec);

  if (stage.prayGlowTimer > 0 || !stage.prayedWithJesus) {
    drawSunRays(ctx, w * 0.5, 118, stage.prayedWithJesus ? 165 : 105, timeSec, 0.34);
  }

  // Jesus blessing the loaves and fish on the hilltop
  drawJesus(ctx, w * 0.5, 162, 1.05, stage.prayedWithJesus ? "celebrate" : "bless", timeSec);
  if (stage.prayGlowTimer > 0) {
    drawHeartBurst(ctx, w * 0.5, 106, stage.prayGlowTimer / 1.6, timeSec);
  }

  // Boy offering basket before prayer
  if (!stage.prayedWithJesus) {
    drawChildFriend(ctx, w * 0.25, 186, 0.92, "#6BA8C9", true, timeSec);
    drawWovenBasket(ctx, w * 0.5, 212, 1.0, 3);
    const johnRef = getVerseById("john_6_11").reference;
    drawRoundedRect(ctx, 32, 256, w - 64, 82, 16);
    ctx.fillStyle = "rgba(255, 248, 235, 0.95)";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "800 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(johnRef, state.langMode), w / 2, 282);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "700 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(UI_TEXT.s1TapPrayCanvas, state.langMode), w / 2, 306);
    const secHint = formatSecondary(UI_TEXT.s1TapPrayCanvas, state.langMode);
    if (secHint) {
      ctx.fillStyle = PALETTE.mutedInk;
      ctx.font = "700 12px system-ui, -apple-system, sans-serif";
      ctx.fillText(secHint, w / 2, 326);
    }
    return;
  }

  // Seated joyful Galilee families along the grass edge
  const seats = [0.14, 0.30, 0.70, 0.86];
  const tunics = ["#D46A43", "#6BA8C9", "#6F9463", "#E5A93B"];
  for (let i = 0; i < seats.length; i++) {
    drawChildFriend(ctx, w * seats[i], h - 18, 0.65, tunics[i], stage.sharedCount > i * 2, timeSec + i);
  }

  // Falling loaves, fish, and golden blessing tokens
  for (let i = 0; i < stage.items.length; i++) {
    const it = stage.items[i];
    const ix = it.x * w;
    const iy = it.y * h;
    if (it.itemType === "loaf") {
      drawBarleyLoaf(ctx, ix, iy, 1.05);
    } else if (it.itemType === "fish") {
      drawFish(ctx, ix, iy, 1.05);
    } else {
      drawBlessingToken(ctx, ix, iy, 1.0, timeSec);
    }
  }

  // Player's woven sharing basket
  drawWovenBasket(ctx, stage.basketX * w, h * 0.81, 1.15, stage.sharedCount);

  if (stage.lastPopTimer > 0 && stage.lastPopKey) {
    const pop = UI_TEXT[stage.lastPopKey];
    drawSpeechBubble(
      ctx,
      stage.basketX * w,
      h * 0.56,
      formatPrimary(pop, state.langMode),
      formatSecondary(pop, state.langMode),
      w,
      stage.basketX * w
    );
  }
}

function renderRunBackPlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  stage: RunBackStageState,
  w: number,
  h: number,
  timeSec: number
): void {
  drawGalileeBackdrop(ctx, w, h, timeSec);

  if (stage.subPhase === "turn_back") {
    // Joyful turn-back climax running back to open-armed Jesus!
    drawSunRays(ctx, w * 0.5, 130, 180, timeSec, 0.34);
    ctx.fillStyle = "#EAD1A6";
    ctx.beginPath();
    ctx.moveTo(w * 0.38, 175);
    ctx.lineTo(w * 0.62, 175);
    ctx.lineTo(w * 0.84, h);
    ctx.lineTo(w * 0.16, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PALETTE.sandalwood;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Animated golden footprints trailing behind the thankful traveler
    const p = stage.turnBackProgress / 100;
    const ty = h - 38 - p * (h - 236);
    const stepCount = Math.min(7, Math.floor(p * 8));
    for (let i = 0; i < stepCount; i++) {
      const fy = h - 24 - i * 26;
      if (fy > ty + 14) {
        const fx = w * 0.5 + (i % 2 === 0 ? -13 : 13);
        drawGoldenFootprint(ctx, fx, fy, 1.0, i % 2 === 0 ? -0.15 : 0.15);
      }
    }

    drawJesus(ctx, w * 0.5, 176, 1.18, "welcome", timeSec);
    if (p > 0.55) {
      drawHeartBurst(ctx, w * 0.5, 118, 1 - Math.min(1, (p - 0.55) * 2), timeSec);
    }

    const tScale = 1.15 - p * 0.22;
    drawChildFriend(ctx, w * 0.5, ty, tScale, "#D46A43", true, timeSec * 1.6);

    // Golden progress ribbon
    drawRoundedRect(ctx, 52, 22, w - 104, 24, 12);
    ctx.fillStyle = "#FFF8EB";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, 56, 26, Math.max(12, (w - 112) * p), 16, 8);
    ctx.fillStyle = PALETTE.sunGold;
    ctx.fill();

    if (stage.lastPopTimer > 0 && stage.lastPopKey) {
      const pop = UI_TEXT[stage.lastPopKey];
      drawSpeechBubble(
        ctx,
        w * 0.5,
        Math.max(54, ty - 116),
        formatPrimary(pop, state.langMode),
        formatSecondary(pop, state.langMode),
        w,
        w * 0.5
      );
    }
    return;
  }

  // Sunlit 3-lane village road
  ctx.fillStyle = "#EAD1A6";
  ctx.beginPath();
  ctx.moveTo(w * 0.28, 105);
  ctx.lineTo(w * 0.72, 105);
  ctx.lineTo(w * 0.92, h);
  ctx.lineTo(w * 0.08, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.sandalwood;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Lane dividers
  ctx.save();
  ctx.setLineDash([12, 12]);
  ctx.strokeStyle = "#C59D6B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.43, 110);
  ctx.lineTo(w * 0.36, h);
  ctx.moveTo(w * 0.57, 110);
  ctx.lineTo(w * 0.64, h);
  ctx.stroke();
  ctx.restore();

  // Crossroads signpost in distance
  drawCross(ctx, w * 0.5, 86, 15, PALETTE.sunGold);

  const laneX = [w * 0.24, w * 0.5, w * 0.76];
  for (let i = 0; i < stage.items.length; i++) {
    const it = stage.items[i];
    const x = laneX[it.lane];
    const y = 100 + it.y * (h - 115);
    if (it.itemType === "sparkle") {
      drawBlessingToken(ctx, x, y, 0.95, timeSec + i);
    } else if (it.itemType === "cart") {
      drawMarketCart(ctx, x, y, 0.95);
    } else {
      drawToyBlock(ctx, x, y, 0.95);
    }
  }

  const wobbleX = stage.wobbleTimer > 0 ? Math.sin(timeSec * 42) * 7 : 0;
  drawChildFriend(ctx, laneX[stage.lane] + wobbleX, h - 26, 1.05, "#D46A43", stage.wobbleTimer === 0, timeSec);

  if (stage.lastPopTimer > 0 && stage.lastPopKey) {
    const pop = UI_TEXT[stage.lastPopKey];
    drawSpeechBubble(
      ctx,
      laneX[stage.lane],
      h - 156,
      formatPrimary(pop, state.langMode),
      formatSecondary(pop, state.langMode),
      w,
      laneX[stage.lane]
    );
  }
}

function renderVerseBuilderPlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  stage: VerseBuilderStageState,
  w: number,
  h: number,
  timeSec: number
): void {
  drawGalileeBackdrop(ctx, w, h, timeSec);
  drawJesus(ctx, w * 0.20, 178, 0.88, "welcome", timeSec);
  drawGratitudeOliveTree(ctx, w * 0.82, 200, 128, 126, [], timeSec);

  // Golden treasure parchment scroll
  drawRoundedRect(ctx, 22, 186, w - 44, h - 208, 22);
  ctx.fillStyle = "#FFF9EC";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  if (stage.subPhase === "quiz") {
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "800 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(UI_TEXT.s3QuizKicker, state.langMode), w / 2, 224);
    drawStar(ctx, w / 2 - 48, 286, 18, PALETTE.sunGold);
    drawStar(ctx, w / 2, 274, 24, PALETTE.sunGold);
    drawStar(ctx, w / 2 + 48, 286, 18, PALETTE.sunGold);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      String(stage.quizCursor + 1) + " / " + String(stage.quizQueue.length),
      w / 2,
      344
    );
    return;
  }

  const verseId = stage.verseQueue[stage.verseCursor];
  const verse = getVerseById(verseId);
  const tiles = getVerseTiles(verseId, state.ageMode);

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.terracottaDark;
  ctx.font = "800 17px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatPrimary(verse.reference, state.langMode), w / 2, 218);

  const secRef = formatSecondary(verse.reference, state.langMode);
  if (secRef) {
    ctx.fillStyle = PALETTE.mutedInk;
    ctx.font = "700 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(secRef, w / 2, 236);
  }

  // Render placed verse slots neatly on scroll
  const slotCols = 2;
  const slotW = (w - 84) / slotCols;
  const slotH = tiles.length > 4 ? 46 : 62;
  const startY = secRef ? 250 : 242;
  for (let i = 0; i < tiles.length; i++) {
    const col = i % slotCols;
    const row = Math.floor(i / slotCols);
    const sx = 36 + col * (slotW + 12);
    const sy = startY + row * (slotH + 10);
    const isPlaced = i < stage.placedTileIds.length;
    const isNext = i === stage.placedTileIds.length;

    drawRoundedRect(ctx, sx, sy, slotW, slotH, 12);
    ctx.fillStyle = isPlaced ? "#FCE7B2" : isNext && state.ageMode === "explorer" ? "#FFF2CC" : "#F6EBDC";
    ctx.fill();
    ctx.lineWidth = isNext && state.ageMode === "explorer" ? 2.8 : 2;
    ctx.strokeStyle = isNext && state.ageMode === "explorer" ? PALETTE.terracotta : PALETTE.sandalwood;
    ctx.stroke();

    ctx.textAlign = "center";
    if (isPlaced) {
      const t = tiles[i];
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 12px system-ui, -apple-system, sans-serif";
      const label = formatPrimary(t.text, state.langMode);
      ctx.fillText(label.length > 22 ? label.slice(0, 21) + "..." : label, sx + slotW / 2, sy + slotH * 0.44);
      const sec = formatSecondary(t.text, state.langMode);
      if (sec) {
        ctx.fillStyle = PALETTE.mutedInk;
        ctx.font = "600 11px system-ui, -apple-system, sans-serif";
        ctx.fillText(sec.length > 14 ? sec.slice(0, 13) + "..." : sec, sx + slotW / 2, sy + slotH * 0.78);
      }
    } else {
      ctx.fillStyle = PALETTE.mutedInk;
      ctx.font = "800 14px system-ui, -apple-system, sans-serif";
      ctx.fillText("#" + String(i + 1), sx + slotW / 2, sy + slotH * 0.58);
    }
  }
}

export function renderStageCanvas(ctx: CanvasRenderingContext2D, state: GameState): void {
  const w = STAGE_LOGICAL_W;
  const h = STAGE_LOGICAL_H;
  const t = state.elapsedSec;

  ctx.clearRect(0, 0, w, h);

  if (state.phase === "title") {
    drawGalileeBackdrop(ctx, w, h, t);
    drawGratitudeOliveTree(ctx, w * 0.77, h - 34, 175, 175, [], t, state.treeRustleTimer);
    if (state.jesusGlowTimer > 0) {
      drawSunRays(ctx, w * 0.34, h - 120, 120, t, 0.36);
      drawHeartBurst(ctx, w * 0.34, h - 122, state.jesusGlowTimer / 2.4, t);
    }
    drawJesus(
      ctx,
      w * 0.34,
      h - 36,
      1.32,
      state.jesusGlowTimer > 0 ? "celebrate" : "welcome",
      t
    );
    drawChildFriend(
      ctx,
      w * 0.56,
      h - 32,
      0.92,
      "#D46A43",
      true,
      state.friendHopTimer > 0 ? t * 2.4 : t
    );
    if (state.friendHopTimer > 0) {
      drawStar(ctx, w * 0.56 - 20, h - 98, 8, PALETTE.sunGold);
      drawStar(ctx, w * 0.56 + 20, h - 94, 8, PALETTE.sunGold);
    }
    drawWovenBasket(ctx, w * 0.16, h - 38, 0.78, 3);
    drawFloatingLeaves(ctx, w, h, t);
    drawTitleBanner(ctx, state, w);
    drawEasterOverlay(ctx, state, w, w * 0.34, w * 0.77, w * 0.56, 106);
    return;
  }

  if (state.phase === "pass_banner") {
    drawGalileeBackdrop(ctx, w, h, t);
    drawSunRays(ctx, w * 0.5, 165, 140, t, 0.28);
    drawJesus(ctx, w * 0.5, 250, 1.3, "welcome", t);
    drawFloatingLeaves(ctx, w, h, t);
    drawRoundedRect(ctx, 36, 286, w - 72, 110, 20);
    ctx.fillStyle = "rgba(255, 248, 235, 0.94)";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "800 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      formatPrimary(UI_TEXT.friendPrefix, state.langMode) + " " + String(state.activePlayerIndex + 1),
      w / 2,
      332
    );
    const nextStageId = STAGE_SEQUENCE[state.stageIndex];
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "700 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(STAGE_TEXT[nextStageId].title, state.langMode), w / 2, 368);
    return;
  }

  if (state.phase === "stage_intro") {
    drawGalileeBackdrop(ctx, w, h, t);
    const stageId = STAGE_SEQUENCE[state.stageIndex];
    drawSunRays(ctx, w * 0.5, 175, 145, t, 0.25);
    if (stageId === "loaves_and_fish") {
      drawJesus(ctx, w * 0.5, 275, 1.32, "bless", t);
      drawWovenBasket(ctx, w * 0.5, 336, 1.2, 3);
      drawChildFriend(ctx, w * 0.24, 305, 0.95, "#6BA8C9", true, t);
    } else if (stageId === "run_back_to_jesus") {
      drawJesus(ctx, w * 0.34, 286, 1.28, "welcome", t);
      drawChildFriend(ctx, w * 0.68, 294, 1.05, "#D46A43", true, t);
      drawBlessingToken(ctx, w * 0.52, 192, 1.15, t);
    } else {
      drawJesus(ctx, w * 0.30, 288, 1.2, "celebrate", t);
      drawGratitudeOliveTree(ctx, w * 0.72, 298, 155, 155, [], t);
      drawStar(ctx, w * 0.5, 146, 22, PALETTE.sunGold);
    }
    drawRoundedRect(ctx, 24, 18, w - 48, 66, 16);
    ctx.fillStyle = "rgba(255, 248, 235, 0.94)";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 19px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(STAGE_TEXT[stageId].title, state.langMode), w / 2, 46);
    const sec = formatSecondary(STAGE_TEXT[stageId].title, state.langMode);
    if (sec) {
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "700 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(sec, w / 2, 70);
    }
    return;
  }

  if (state.phase === "stage_play" && state.stageState) {
    if (state.stageState.kind === "loaves_and_fish") {
      renderLoavesPlay(ctx, state, state.stageState, w, h, t);
    } else if (state.stageState.kind === "run_back_to_jesus") {
      renderRunBackPlay(ctx, state, state.stageState, w, h, t);
    } else {
      renderVerseBuilderPlay(ctx, state, state.stageState, w, h, t);
    }
    return;
  }

  if (state.phase === "stage_complete") {
    drawGalileeBackdrop(ctx, w, h, t);
    drawSunRays(ctx, w * 0.5, 150, 170, t, 0.34);
    drawJesus(ctx, w * 0.5, 266, 1.32, "celebrate", t);
    drawFloatingLeaves(ctx, w, h, t);

    const lastRes = state.results[state.results.length - 1];
    const stars = lastRes ? lastRes.stars : 3;
    for (let i = 0; i < 3; i++) {
      drawStar(
        ctx,
        w * 0.5 + (i - 1) * 56,
        74,
        22,
        i < stars ? PALETTE.sunGold : "#E4D7C5"
      );
    }
    if (lastRes) {
      const verse = getVerseById(lastRes.verseUnlocked);
      drawRoundedRect(ctx, 26, 294, w - 52, 118, 18);
      ctx.fillStyle = "rgba(255, 248, 235, 0.95)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 17px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(verse.reference, state.langMode), w / 2, 326);
      const sec = formatSecondary(verse.reference, state.langMode);
      if (sec) {
        ctx.fillStyle = PALETTE.mutedInk;
        ctx.font = "700 14px system-ui, -apple-system, sans-serif";
        ctx.fillText(sec, w / 2, 350);
      }
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        formatPrimary(UI_TEXT.starsEarned, state.langMode) + ": " + String(stars) + " / 3",
        w / 2,
        388
      );
    }
    return;
  }

  // prayer_card & journey_finale
  drawGalileeBackdrop(ctx, w, h, t);
  if (state.phase === "journey_finale") {
    drawSunRays(ctx, w * 0.5, 128, 185, t, 0.30);
    drawFloatingLeaves(ctx, w, h, t);
  }
  drawGratitudeOliveTree(ctx, w * 0.64, h - 30, 224, 248, state.prayers, t, state.treeRustleTimer);
  if (state.jesusGlowTimer > 0) {
    drawSunRays(ctx, w * 0.24, h - 118, 115, t, 0.35);
    drawHeartBurst(ctx, w * 0.24, h - 120, state.jesusGlowTimer / 2.4, t);
  }
  drawJesus(
    ctx,
    w * 0.24,
    h - 32,
    1.28,
    state.phase === "journey_finale" || state.jesusGlowTimer > 0 ? "celebrate" : "welcome",
    t
  );
  drawChildFriend(
    ctx,
    w * 0.42,
    h - 26,
    0.85,
    "#D46A43",
    true,
    state.friendHopTimer > 0 ? t * 2.4 : t
  );
  if (state.friendHopTimer > 0) {
    drawStar(ctx, w * 0.42 - 18, h - 88, 7.5, PALETTE.sunGold);
    drawStar(ctx, w * 0.42 + 18, h - 84, 7.5, PALETTE.sunGold);
  }

  // Small joyful sparkle halo on finale
  if (state.phase === "journey_finale") {
    for (let i = 0; i < 3; i++) {
      const a = t * 1.4 + i * 2.1;
      ctx.beginPath();
      safeArc(ctx, w * 0.5 + Math.cos(a) * 145, 58 + Math.sin(a) * 16, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.sunGold;
      ctx.fill();
    }
  }
  drawEasterOverlay(ctx, state, w, w * 0.24, w * 0.64, w * 0.42, 18);
}
