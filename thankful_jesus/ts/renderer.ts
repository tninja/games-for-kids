import {
  drawAdventurerTimerAndCombo,
  drawBarleyLoaf,
  drawBlessingToken,
  drawChildFriend,
  drawCross,
  drawFish,
  drawGalileeBackdrop,
  drawGoldenFootprint,
  drawGoldenHarp,
  drawGratitudeOliveTree,
  drawHeartBurst,
  drawJesus,
  drawLeaf,
  drawLittleSheep,
  drawMarketCart,
  drawMusicNote,
  drawRoundedRect,
  drawSpeechBubble,
  drawStar,
  drawStorybookFrame,
  drawSunRays,
  drawToyBlock,
  drawWhiteDove,
  drawWindGustLeaf,
  drawWovenBasket,
  safeArc
} from "./artwork";
import {
  HARP_STRING_SPECS,
  PALETTE,
  STAGE_LOGICAL_H,
  STAGE_LOGICAL_W,
  STAGE_SEQUENCE
} from "./constants";
import { STAGE_TEXT, UI_TEXT, formatPrimary, formatSecondary, getEasterLine } from "./i18n";
import {
  DavidHarpStageState,
  GameState,
  LoavesStageState,
  RunBackStageState,
  VerseBuilderStageState
} from "./types";
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
  // Soft shadow + warm parchment banner gradient
  drawRoundedRect(ctx, 22, 19, w - 40, 80, 18);
  ctx.fillStyle = "rgba(58, 38, 22, 0.14)";
  ctx.fill();

  drawRoundedRect(ctx, 20, 16, w - 40, 80, 18);
  const bg = ctx.createLinearGradient(0, 16, 0, 96);
  bg.addColorStop(0, "#FFFEFA");
  bg.addColorStop(1, "#FBEAD0");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Inner golden storybook hairline
  drawRoundedRect(ctx, 25, 21, w - 50, 70, 14);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(229, 169, 59, 0.72)";
  ctx.stroke();

  drawStar(ctx, 42, 56, 10, PALETTE.sunGold);
  drawStar(ctx, w - 42, 56, 10, PALETTE.sunGold);

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 20px Georgia, serif";
  ctx.fillText(formatPrimary(UI_TEXT.gameTitle, state.langMode), w / 2, 50);

  const sub =
    formatSecondary(UI_TEXT.gameTitle, state.langMode) ||
    formatPrimary(UI_TEXT.gameSubtitle, state.langMode);
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

  // Subtle Galilee sea breeze lines in Adventurer mode
  if (state.ageMode === "adventurer") {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 253, 245, 0.45)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const wx = ((timeSec * 90 + i * 140) % (w + 60)) - 30;
      const wy = 195 + i * 58;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + 22, wy - 7, wx + 44, wy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Falling loaves, fish, golden blessing tokens, and Adventurer wind gusts
  for (let i = 0; i < stage.items.length; i++) {
    const it = stage.items[i];
    const ix = it.x * w;
    const iy = it.y * h;
    if (it.itemType === "loaf") {
      drawBarleyLoaf(ctx, ix, iy, 1.05);
    } else if (it.itemType === "fish") {
      drawFish(ctx, ix, iy, 1.05);
    } else if (it.itemType === "gust") {
      drawWindGustLeaf(ctx, ix, iy, 1.05, timeSec);
    } else {
      drawBlessingToken(ctx, ix, iy, 1.0, timeSec);
    }
  }

  // Explorer Dove Helper swooping to catch a missed loaf/fish
  if (stage.doveRescueTimer > 0) {
    const p = 1 - stage.doveRescueTimer / 0.95;
    const dx = stage.doveRescueX * w + (stage.basketX * w - stage.doveRescueX * w) * p;
    const dy = h * (0.86 - Math.sin(p * Math.PI) * 0.16);
    drawWhiteDove(ctx, dx, dy, 1.15, timeSec * 1.8);
  }

  // Player's woven sharing basket (wobbles if hit by Adventurer wind gust)
  const wobbleX = stage.wobbleTimer > 0 ? Math.sin(timeSec * 44) * 7 : 0;
  drawWovenBasket(ctx, stage.basketX * w + wobbleX, h * 0.81, 1.15, stage.sharedCount);

  if (state.ageMode === "adventurer") {
    drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
  }

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
    drawRoundedRect(ctx, 52, 28, w - 104, 24, 12);
    ctx.fillStyle = "#FFF8EB";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, 56, 32, Math.max(12, (w - 112) * p), 16, 8);
    ctx.fillStyle = PALETTE.sunGold;
    ctx.fill();

    if (state.ageMode === "adventurer") {
      drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
    }

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

  if (state.ageMode === "adventurer") {
    drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
  }

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

function renderDavidHarpPlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  stage: DavidHarpStageState,
  w: number,
  h: number,
  timeSec: number
): void {
  drawGalileeBackdrop(ctx, w, h, timeSec);
  const beatHz = state.ageMode === "adventurer" ? 116 / 60 : 86 / 60;
  const musicPulse =
    state.harpMusic && !state.muted ? 0.5 + 0.5 * Math.sin(timeSec * Math.PI * 2 * beatHz) : 0;
  drawSunRays(ctx, w * 0.5, 92, 126 + musicPulse * 18, timeSec, 0.22 + musicPulse * 0.12);

  // Smiling Jesus, young David with golden harp, and joyful sheep bouncing on the praise beat
  drawJesus(ctx, w * 0.19, 136, 0.86, "welcome", timeSec);
  drawChildFriend(ctx, w * 0.50, 136, 0.82, "#6BA8C9", true, timeSec);
  drawGoldenHarp(ctx, w * 0.61, 114 - musicPulse * 2, 0.88 + musicPulse * 0.04, timeSec);
  drawLittleSheep(ctx, w * 0.84, 134 - musicPulse * 3, 1.0, timeSec);

  // Warm parchment harp stage frame with gilded wood top arch
  const boardX = 28;
  const boardY = 148;
  const boardW = w - 56;
  const boardH = h - 164;

  // Soft drop shadow
  drawRoundedRect(ctx, boardX + 2, boardY + 4, boardW, boardH, 20);
  ctx.fillStyle = "rgba(56, 36, 20, 0.16)";
  ctx.fill();

  drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 20);
  const boardGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardH);
  boardGrad.addColorStop(0, "#FFFDF7");
  boardGrad.addColorStop(1, "#F9E7C4");
  ctx.fillStyle = boardGrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Ornate top wooden harp crossbar
  drawRoundedRect(ctx, boardX - 4, boardY - 4, boardW + 8, 16, 8);
  const barGrad = ctx.createLinearGradient(boardX, boardY - 4, boardX, boardY + 12);
  barGrad.addColorStop(0, "#E7B454");
  barGrad.addColorStop(1, "#B0732C");
  ctx.fillStyle = barGrad;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Golden Praise Zone band near the bottom of the harp frame
  const zoneCenterY = boardY + boardH * 0.78;
  const zoneH = state.ageMode === "explorer" ? 62 : 36;
  drawRoundedRect(ctx, boardX + 10, zoneCenterY - zoneH / 2, boardW - 20, zoneH, 14);
  const zoneGrad = ctx.createLinearGradient(boardX, zoneCenterY - zoneH / 2, boardX, zoneCenterY + zoneH / 2);
  zoneGrad.addColorStop(0, "rgba(255, 236, 158, 0.52)");
  zoneGrad.addColorStop(1, "rgba(246, 196, 83, 0.28)");
  ctx.fillStyle = zoneGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.warmGold;
  ctx.stroke();

  // 4 shimmering vertical harp strings
  const colW = boardW / 4;
  for (let i = 0; i < 4; i++) {
    const spec = HARP_STRING_SPECS[i];
    const sx = boardX + colW * (i + 0.5);
    const glow = stage.stringGlow[i];
    const vibrate = glow > 0 ? Math.sin(timeSec * 55) * 4 * (glow / 0.45) : 0;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx, boardY + 14);
    ctx.quadraticCurveTo(sx + vibrate, boardY + boardH * 0.5, sx, boardY + boardH - 26);
    ctx.strokeStyle = glow > 0 ? PALETTE.sunGold : spec.color;
    ctx.lineWidth = glow > 0 ? 5.5 : 3;
    ctx.stroke();

    // Glowing anchor circle in Praise Zone
    ctx.beginPath();
    safeArc(ctx, sx, zoneCenterY, glow > 0 ? 18 : 13, 0, Math.PI * 2);
    ctx.fillStyle = glow > 0 ? "rgba(246, 196, 83, 0.75)" : "rgba(255, 253, 247, 0.9)";
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = spec.color;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 12px system-ui, -apple-system, sans-serif";
    ctx.fillText(spec.noteLabel, sx, boardY + boardH - 8);
    ctx.restore();
  }

  // Falling golden praise notes along the 4 strings
  for (let i = 0; i < stage.notes.length; i++) {
    const n = stage.notes[i];
    const spec = HARP_STRING_SPECS[n.stringIndex];
    const nx = boardX + colW * (n.stringIndex + 0.5);
    const ny = boardY + 14 + n.y * (boardH - 40);
    drawMusicNote(ctx, nx, ny, 1.0, spec.color, n.golden);
  }

  // Explorer Dove Helper singing along on missed harp notes
  if (stage.doveRescueTimer > 0) {
    drawWhiteDove(ctx, stage.doveRescueX * w, zoneCenterY - 18, 1.08, timeSec * 2);
  }

  if (state.ageMode === "adventurer") {
    drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
  }

  if (stage.lastPopTimer > 0 && stage.lastPopKey) {
    const pop = UI_TEXT[stage.lastPopKey];
    drawSpeechBubble(
      ctx,
      w * 0.5,
      154,
      formatPrimary(pop, state.langMode),
      formatSecondary(pop, state.langMode),
      w
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

  // Illuminated golden treasure parchment scroll with wooden roller handles
  drawRoundedRect(ctx, 24, 188, w - 44, h - 208, 18);
  ctx.fillStyle = "rgba(56, 36, 20, 0.14)";
  ctx.fill();

  drawRoundedRect(ctx, 22, 184, w - 44, h - 208, 18);
  const scrollGrad = ctx.createLinearGradient(22, 184, 22, h - 24);
  scrollGrad.addColorStop(0, "#FFFDF7");
  scrollGrad.addColorStop(0.5, "#FFF6E0");
  scrollGrad.addColorStop(1, "#F5DFB6");
  ctx.fillStyle = scrollGrad;
  ctx.fill();
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Left and right wooden scroll rollers
  drawRoundedRect(ctx, 13, 178, 12, h - 196, 6);
  ctx.fillStyle = "#B87A4B";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  drawRoundedRect(ctx, w - 25, 178, 12, h - 196, 6);
  ctx.fillStyle = "#B87A4B";
  ctx.fill();
  ctx.stroke();

  // Inner golden scroll border
  drawRoundedRect(ctx, 30, 191, w - 60, h - 222, 12);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(229, 169, 59, 0.65)";
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
    drawStorybookFrame(ctx, w, h);
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
    } else if (stageId === "david_harp") {
      drawJesus(ctx, w * 0.25, 288, 1.22, "welcome", t);
      drawChildFriend(ctx, w * 0.55, 292, 1.02, "#6BA8C9", true, t);
      drawGoldenHarp(ctx, w * 0.68, 266, 1.15, t);
      drawLittleSheep(ctx, w * 0.84, 300, 1.1, t);
      drawMusicNote(ctx, w * 0.56, 178, 1.0, "#D46A43", true);
      drawMusicNote(ctx, w * 0.72, 162, 0.9, "#6F9463", false);
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
    } else if (state.stageState.kind === "david_harp") {
      renderDavidHarpPlay(ctx, state, state.stageState, w, h, t);
    } else {
      renderVerseBuilderPlay(ctx, state, state.stageState, w, h, t);
    }
    drawStorybookFrame(ctx, w, h);
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
  drawStorybookFrame(ctx, w, h);
}
