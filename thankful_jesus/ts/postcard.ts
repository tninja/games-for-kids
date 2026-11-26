import {
  drawChildFriend,
  drawGalileeBackdrop,
  drawGratitudeOliveTree,
  drawJesus,
  drawLeaf,
  drawRoundedRect,
  drawStar
} from "./artwork";
import { PALETTE } from "./constants";
import { UI_TEXT, formatPrimary, formatSecondary } from "./i18n";
import { GameState } from "./types";
import { getVerseById } from "./verses";

function wrapBilingualText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const chars = Array.from(text);
  const hasSpaces = text.indexOf(" ") >= 0 && chars.every((c) => c.charCodeAt(0) < 256);
  const lines: string[] = [];

  if (hasSpaces) {
    const words = text.split(" ");
    let current = "";
    for (let i = 0; i < words.length; i++) {
      const candidate = current ? current + " " + words[i] : words[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = words[i];
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines.length > 0 ? lines : [text];
  }

  let current = "";
  for (let i = 0; i < chars.length; i++) {
    const candidate = current + chars[i];
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = chars[i];
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [text];
}

export function renderPostcardCanvas(state: GameState): HTMLCanvasElement {
  const W = 1080;
  const H = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  // Warm cream parchment background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FFFBF2");
  bg.addColorStop(1, "#F7E3BE");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stitched storybook frame
  ctx.save();
  drawRoundedRect(ctx, 32, 32, W - 64, H - 64, 34);
  ctx.fillStyle = "rgba(255, 253, 248, 0.78)";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = PALETTE.sandalwood;
  ctx.stroke();

  drawRoundedRect(ctx, 50, 50, W - 100, H - 100, 26);
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.terracotta;
  ctx.stroke();
  ctx.restore();

  // Corner olive & autumn leaves
  drawLeaf(ctx, 98, 98, 30, "gold", -0.4);
  drawLeaf(ctx, W - 98, 98, 30, "olive", 0.4);
  drawLeaf(ctx, 98, H - 98, 28, "crimson", -2.5);
  drawLeaf(ctx, W - 98, H - 98, 28, "sky", 2.5);

  // Bilingual title header
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 54px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatPrimary(UI_TEXT.pcTitle, state.langMode), W / 2, 134);

  const secTitle = formatSecondary(UI_TEXT.pcTitle, state.langMode);
  ctx.fillStyle = PALETTE.terracottaDark;
  ctx.font = "700 28px system-ui, -apple-system, sans-serif";
  const year = new Date().getFullYear();
  const subLine =
    (secTitle ? secTitle + "  -  " : "") +
    formatPrimary(UI_TEXT.pcSubtitle, state.langMode) +
    " " +
    String(year);
  ctx.fillText(subLine, W / 2, 184);

  // Stars ribbon
  for (let i = 0; i < 3; i++) {
    drawStar(ctx, W / 2 + (i - 1) * 52, 228, 17, PALETTE.sunGold);
  }

  // Illustrated Galilee Gratitude Tree & Jesus scene
  ctx.save();
  drawRoundedRect(ctx, 84, 264, W - 168, 396, 26);
  ctx.clip();
  ctx.translate(84, 264);
  drawGalileeBackdrop(ctx, W - 168, 396, 0.8);
  drawGratitudeOliveTree(ctx, (W - 168) * 0.64, 376, 360, 326, state.prayers, 0.6);
  drawJesus(ctx, (W - 168) * 0.25, 372, 2.05, "celebrate", 0.4);
  drawChildFriend(ctx, (W - 168) * 0.43, 378, 1.35, "#D46A43", true, 0.4);
  ctx.restore();

  drawRoundedRect(ctx, 84, 264, W - 168, 396, 26);
  ctx.lineWidth = 4;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Featured Thanksgiving Bible Verse Box (1 Thessalonians 5:18)
  const verse = getVerseById("thess_5_18");
  drawRoundedRect(ctx, 84, 684, W - 168, 184, 22);
  ctx.fillStyle = "#FFF5DF";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.sandalwood;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.terracottaDark;
  ctx.font = "800 26px system-ui, -apple-system, sans-serif";
  const refSec = formatSecondary(verse.reference, state.langMode);
  ctx.fillText(
    formatPrimary(verse.reference, state.langMode) + (refSec ? "  |  " + refSec : ""),
    W / 2,
    724
  );

  ctx.fillStyle = PALETTE.ink;
  ctx.font = "700 24px system-ui, -apple-system, sans-serif";
  const primaryLines = wrapBilingualText(ctx, formatPrimary(verse.text, state.langMode), W - 230);
  ctx.fillText(primaryLines[0], W / 2, 764);
  if (primaryLines[1]) {
    ctx.fillText(primaryLines[1], W / 2, 796);
  }

  const verseZh = formatSecondary(verse.text, state.langMode);
  if (verseZh) {
    ctx.fillStyle = PALETTE.mutedInk;
    ctx.font = "700 23px system-ui, -apple-system, sans-serif";
    const zhLines = wrapBilingualText(ctx, verseZh, W - 230);
    ctx.fillText(zhLines[0], W / 2, 838);
  }

  // Prayers Section
  ctx.fillStyle = PALETTE.terracotta;
  ctx.font = "800 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const prayerHeadSec = formatSecondary(UI_TEXT.pcPrayerSection, state.langMode);
  ctx.fillText(
    formatPrimary(UI_TEXT.pcPrayerSection, state.langMode) +
      (prayerHeadSec ? "  /  " + prayerHeadSec : ""),
    W / 2,
    924
  );

  const notes = state.prayers.slice(0, 6);
  const cols = notes.length > 3 ? 2 : 1;
  const colW = cols === 2 ? 438 : 880;
  const startX = cols === 2 ? 90 : 100;
  const yStart = 954;

  for (let i = 0; i < notes.length; i++) {
    const leaf = notes[i];
    const col = cols === 2 ? i % 2 : 0;
    const row = cols === 2 ? Math.floor(i / 2) : i;
    const x = startX + col * (colW + 24);
    const y = yStart + row * 116;

    drawRoundedRect(ctx, x, y, colW, 100, 18);
    ctx.fillStyle = PALETTE.robeCream;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();

    drawLeaf(ctx, x + 36, y + 50, 18, leaf.leafColor, -0.2);

    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.sandalwood;
    ctx.font = "700 21px system-ui, -apple-system, sans-serif";
    ctx.fillText(leaf.authorLabel, x + 68, y + 32);

    ctx.fillStyle = PALETTE.ink;
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    const lines = wrapBilingualText(ctx, leaf.message, colW - 86);
    ctx.fillText(lines[0], x + 68, y + 64);
    if (lines[1]) {
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(lines[1], x + 68, y + 88);
    }
  }

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.sandalwood;
  ctx.font = "700 22px system-ui, -apple-system, sans-serif";
  const footSec = formatSecondary(UI_TEXT.pcFooter, state.langMode);
  ctx.fillText(
    formatPrimary(UI_TEXT.pcFooter, state.langMode) + (footSec ? "  -  " + footSec : ""),
    W / 2,
    H - 80
  );

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
    const file = new File([blob], "thankful-journey-with-jesus-card.png", { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
      try {
        await nav.share({
          files: [file],
          title: "Thankful Journey with Jesus",
          text: "Happy Thanksgiving! Give thanks in all circumstances in Christ Jesus."
        });
        return { method: "share", dataUrl };
      } catch {
        // User cancelled or browser rejected file share
      }
    }
  }

  if (typeof document !== "undefined") {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "thankful-journey-with-jesus-card.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { method: "download", dataUrl };
  }

  return { method: "preview", dataUrl };
}
