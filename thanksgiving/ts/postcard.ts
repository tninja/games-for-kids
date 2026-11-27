import {
  drawBackyardFence,
  drawBackyardTable,
  drawBeagleChef,
  drawFestiveStringLights,
  drawLittleBird,
  drawMapleLeaf,
  drawMapleTree,
  drawRedDoghouse,
  drawRoundedRect,
  drawStar
} from "./artwork";
import { LEAF_COLORS, PALETTE } from "./constants";
import { lerpColor } from "./lighting";
import { drawDuskGroundTint, drawDuskSky, drawGroundShadow, drawSun } from "./scenery";
import { GameState, GratitudeLeaf } from "./types";

const W = 1080;
const H = 1440;
// iOS Safari ships SF Pro Rounded as ui-rounded; other browsers fall back to system-ui.
const FONT_STACK = 'ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif';
const SCENE = { x: 88, y: 250, w: 904, h: 590 };
const NOTES_TOP = 908;
const NOTES_BOTTOM = 1300;
const NOTES_SIDE = 96;
const NOTE_GAP = 14;
const NOTE_MAX_ROW_H = 120;
const STARS_SHOWN = 5;
const MAX_TOTAL_STARS = 15;
const ELLIPSIS = "...";

interface NoteGrid {
  cols: number;
  colW: number;
  rowH: number;
  startY: number;
  msgSize: number;
}

interface TextMeasurer {
  measureText(text: string): { width: number };
}

function font(weight: number, size: number): string {
  return String(weight) + " " + String(size) + "px " + FONT_STACK;
}

function fitWithEllipsis(ctx: TextMeasurer, line: string, maxWidth: number): string {
  const chars = Array.from(line);
  while (chars.length > 0 && ctx.measureText(chars.join("").trimEnd() + ELLIPSIS).width > maxWidth) {
    chars.pop();
  }
  return chars.join("").trimEnd() + ELLIPSIS;
}

// Greedy wrap that breaks at spaces when possible and between characters otherwise,
// so Chinese/Japanese notes (no spaces) and emoji wrap as cleanly as English.
export function wrapText(
  ctx: TextMeasurer,
  text: string,
  maxWidth: number,
  maxLines: number = Number.POSITIVE_INFINITY
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of Array.from(text.replace(/\s+/g, " ").trim())) {
    if (!line || ctx.measureText(line + ch).width <= maxWidth) {
      line += ch;
    } else if (ch === " ") {
      lines.push(line);
      line = "";
    } else {
      const breakAt = line.lastIndexOf(" ");
      lines.push(breakAt > 0 ? line.slice(0, breakAt) : line);
      line = (breakAt > 0 ? line.slice(breakAt + 1) : "") + ch;
    }
  }
  if (line) {
    lines.push(line);
  }
  if (lines.length <= maxLines) {
    return lines.length > 0 ? lines : [""];
  }
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = fitWithEllipsis(ctx, kept[maxLines - 1], maxWidth);
  return kept;
}

function drawFrame(ctx: CanvasRenderingContext2D): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FFF9EE");
  bg.addColorStop(1, "#F8E1BE");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  drawRoundedRect(ctx, 34, 34, W - 68, H - 68, 36);
  ctx.fillStyle = "rgba(255, 253, 247, 0.72)";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = PALETTE.toastedSienna;
  ctx.stroke();
  drawRoundedRect(ctx, 52, 52, W - 104, H - 104, 28);
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.mapleCrimson;
  ctx.stroke();
  ctx.restore();

  drawMapleLeaf(ctx, 102, 102, 34, "crimson", -0.4);
  drawMapleLeaf(ctx, W - 102, 102, 34, "amber", 0.4);
  drawMapleLeaf(ctx, 102, H - 102, 30, "gold", -2.5);
  drawMapleLeaf(ctx, W - 102, H - 102, 30, "russet", 2.5);
}

function drawHeader(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.ink;
  ctx.font = font(800, 66);
  ctx.fillText("Happy Thanksgiving!", W / 2, 132);

  const year = String(new Date().getFullYear());
  const who = state.familyName || "Beagle Chef's Backyard Feast";
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.font = font(700, 30);
  ctx.fillText(who + "  -  " + year, W / 2, 180);

  const earned = Math.max(0, Math.min(STARS_SHOWN, Math.round(state.totalStars / 3)));
  const startX = W / 2 - 150;
  for (let i = 0; i < STARS_SHOWN; i++) {
    drawStar(ctx, startX + i * 42, 214, 16, i < earned ? PALETTE.pumpkinGold : "#E2D5C3");
  }
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.font = font(700, 24);
  ctx.fillText(String(state.totalStars) + " / " + String(MAX_TOTAL_STARS) + " stars", startX + 200, 222);
  ctx.restore();
}

function drawSunsetScene(ctx: CanvasRenderingContext2D, state: GameState): void {
  const bottom = SCENE.y + SCENE.h;
  ctx.save();
  drawRoundedRect(ctx, SCENE.x, SCENE.y, SCENE.w, SCENE.h, 28);
  ctx.clip();
  drawDuskSky(ctx, SCENE.x, SCENE.y, SCENE.w, SCENE.h, 0.8, 1);
  drawSun(ctx, 860, 440, 280, 1, 1.6);
  drawBackyardFence(ctx, 752, W);
  ctx.fillStyle = "#B6C285";
  ctx.beginPath();
  ctx.ellipse(W / 2, 878, 580, 160, 0, Math.PI, 0);
  ctx.fill();
  drawRedDoghouse(ctx, 180, 760, 1.55);
  drawDuskGroundTint(ctx, SCENE.x, 720, SCENE.w, bottom, 1);
  drawMapleTree(ctx, W / 2 + 30, 753, 480, 440, state.leaves, false);
  drawFestiveStringLights(ctx, 186, 642, 530, 490, 0.8, 1);
  drawFestiveStringLights(ctx, 590, 494, 956, 588, 1.6, 1);
  drawBackyardTable(ctx, W / 2 + 24, 766, 556, state.seatedGuests.length, true, true, true, 0, true, true);
  drawGroundShadow(ctx, 215, 833, 38, 9);
  drawBeagleChef(ctx, 212, 760, 1.45, "excited", 0);
  drawLittleBird(ctx, 888, 674, 1.9, 0.3);
  ctx.restore();

  drawRoundedRect(ctx, SCENE.x, SCENE.y, SCENE.w, SCENE.h, 28);
  ctx.lineWidth = 4;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();
}

function layoutNoteGrid(count: number): NoteGrid {
  const cols = count <= 3 ? 1 : count <= 8 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / cols));
  const areaH = NOTES_BOTTOM - NOTES_TOP;
  const colW = (W - 2 * NOTES_SIDE - (cols - 1) * NOTE_GAP) / cols;
  const rowH = Math.min(NOTE_MAX_ROW_H, (areaH - (rows - 1) * NOTE_GAP) / rows);
  const totalH = rows * rowH + (rows - 1) * NOTE_GAP;
  const msgSize = cols === 3 ? 19 : cols === 2 ? 21 : 24;
  return { cols, colW, rowH, startY: NOTES_TOP + (areaH - totalH) / 2, msgSize };
}

function drawNoteCard(
  ctx: CanvasRenderingContext2D,
  leaf: GratitudeLeaf,
  x: number,
  y: number,
  grid: NoteGrid,
  index: number
): void {
  const w = grid.colW;
  const h = grid.rowH;
  const colors = LEAF_COLORS[leaf.leafColor];
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(index % 2 === 0 ? -0.012 : 0.012);
  ctx.translate(-w / 2, -h / 2);

  drawRoundedRect(ctx, 0, 0, w, h, 18);
  ctx.fillStyle = lerpColor(PALETTE.cream, colors.fill, 0.14);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Washi tape strip "holding" the card onto the postcard
  ctx.save();
  ctx.translate(w / 2, 0);
  ctx.rotate(index % 2 === 0 ? -0.06 : 0.05);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = colors.fill;
  ctx.fillRect(-30, -8, 60, 16);
  ctx.restore();

  const badge = Math.min(24, h * 0.24);
  drawMapleLeaf(ctx, 14 + badge, h / 2, badge, leaf.leafColor, -0.2);

  const textX = badge * 2 + 26;
  const textW = w - textX - 14;
  const authorSize = grid.msgSize - 3;
  const lineH = grid.msgSize * 1.18;
  const maxLines = Math.max(1, Math.floor((h - authorSize - 26 + lineH - grid.msgSize) / lineH));
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = colors.vein;
  ctx.font = font(700, authorSize);
  ctx.fillText(leaf.authorLabel, textX, 12);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = font(600, grid.msgSize);
  const lines = wrapText(ctx, leaf.message, textW, maxLines);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textX, 18 + authorSize + i * lineH);
  }
  ctx.restore();
}

function drawGratitudeNotes(ctx: CanvasRenderingContext2D, leaves: GratitudeLeaf[]): void {
  ctx.save();
  ctx.fillStyle = PALETTE.mapleCrimson;
  ctx.font = font(800, 34);
  ctx.textAlign = "center";
  ctx.fillText("Our Gratitude Leaves", W / 2, 886);
  ctx.restore();

  const grid = layoutNoteGrid(leaves.length);
  for (let i = 0; i < leaves.length; i++) {
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    const x = NOTES_SIDE + col * (grid.colW + NOTE_GAP);
    const y = grid.startY + row * (grid.rowH + NOTE_GAP);
    drawNoteCard(ctx, leaves[i], x, y, grid, i);
  }
}

export function renderPostcardCanvas(state: GameState): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  drawFrame(ctx);
  drawHeader(ctx, state);
  drawSunsetScene(ctx, state);
  drawGratitudeNotes(ctx, state.leaves);

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.font = font(600, 22);
  ctx.fillText("Made together with gratitude  -  games-for-kids", W / 2, H - 74);
  return canvas;
}

export async function exportPostcard(
  canvas: HTMLCanvasElement
): Promise<{ method: "share" | "download" | "preview"; dataUrl: string }> {
  const dataUrl = canvas.toDataURL("image/png");

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });

  if (blob && typeof navigator !== "undefined" && typeof File !== "undefined") {
    const file = new File([blob], "thanksgiving-feast-postcard.png", { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
      try {
        await nav.share({
          files: [file],
          title: "Our Thanksgiving Feast Postcard",
          text: "Happy Thanksgiving from Beagle Chef's Backyard Feast!"
        });
        return { method: "share", dataUrl };
      } catch {
        // User cancelled share or browser rejected file share; fall back cleanly
      }
    }
  }

  if (typeof document !== "undefined") {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "thanksgiving-feast-postcard.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { method: "download", dataUrl };
  }

  return { method: "preview", dataUrl };
}
