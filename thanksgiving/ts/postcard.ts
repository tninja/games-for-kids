import {
  drawBackyardTable,
  drawBeagleChef,
  drawLittleBird,
  drawMapleLeaf,
  drawMapleTree,
  drawRoundedRect,
  drawStar
} from "./artwork";
import { PALETTE } from "./constants";
import { GameState } from "./types";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? current + " " + word : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
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

  // Warm cream stationery background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FFF9EE");
  bg.addColorStop(1, "#F8E1BE");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stitched storybook frame
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

  // Corner autumn leaves
  drawMapleLeaf(ctx, 102, 102, 34, "crimson", -0.4);
  drawMapleLeaf(ctx, W - 102, 102, 34, "amber", 0.4);
  drawMapleLeaf(ctx, 102, H - 102, 30, "gold", -2.5);
  drawMapleLeaf(ctx, W - 102, H - 102, 30, "russet", 2.5);

  // Header banner
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = "center";
  ctx.font = "800 58px system-ui, -apple-system, sans-serif";
  ctx.fillText("Happy Thanksgiving!", W / 2, 140);

  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.font = "700 28px system-ui, -apple-system, sans-serif";
  const year = new Date().getFullYear();
  ctx.fillText("Beagle Chef's Backyard Feast  -  " + String(year), W / 2, 188);

  // Earned star badge strip
  const starCount = Math.max(3, Math.min(9, state.totalStars));
  const starStartX = W / 2 - ((starCount - 1) * 44) / 2;
  for (let i = 0; i < starCount; i++) {
    drawStar(ctx, starStartX + i * 44, 238, 17, PALETTE.pumpkinGold);
  }

  // Illustrated backyard scene (Tree + Ping-Pong Feast Table + Beagle Chef)
  drawRoundedRect(ctx, 88, 282, W - 176, 510, 28);
  ctx.fillStyle = "#FCE5C0";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = PALETTE.ink;
  ctx.stroke();

  // Soft backyard hill inside scene
  ctx.save();
  ctx.beginPath();
  drawRoundedRect(ctx, 88, 282, W - 176, 510, 28);
  ctx.clip();
  ctx.fillStyle = "#B6C285";
  ctx.beginPath();
  ctx.ellipse(W / 2, 830, 580, 160, 0, Math.PI, 0);
  ctx.fill();
  drawMapleTree(ctx, W / 2, 705, 480, 410, state.leaves, false);
  drawBackyardTable(ctx, W / 2, 718, 620, state.seatedGuests.length, true, true, true, 0);
  drawBeagleChef(ctx, 210, 725, 1.55, "excited", 0);
  drawLittleBird(ctx, 868, 632, 2.0, 0.3);
  ctx.restore();

  // Gratitude Notes Box
  ctx.fillStyle = PALETTE.mapleCrimson;
  ctx.font = "800 34px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Our Gratitude Maple Leaves", W / 2, 856);

  const notes = state.leaves.slice(0, 8);
  const cols = notes.length > 4 ? 2 : 1;
  const colW = cols === 2 ? 430 : 840;
  const startX = cols === 2 ? 96 : 120;
  let yCursor = 900;

  for (let i = 0; i < notes.length; i++) {
    const leaf = notes[i];
    const col = cols === 2 ? i % 2 : 0;
    const row = cols === 2 ? Math.floor(i / 2) : i;
    const x = startX + col * (colW + 28);
    const y = yCursor + row * 108;

    drawRoundedRect(ctx, x, y, colW, 92, 18);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();

    drawMapleLeaf(ctx, x + 36, y + 46, 20, leaf.leafColor, -0.2);

    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(leaf.authorLabel, x + 68, y + 32);

    ctx.fillStyle = PALETTE.ink;
    ctx.font = "600 23px system-ui, -apple-system, sans-serif";
    const lines = wrapText(ctx, leaf.message, colW - 84);
    ctx.fillText(lines[0], x + 68, y + 64);
    if (lines[1]) {
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(lines[1], x + 68, y + 84);
    }
  }

  // Footer signature
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.toastedSienna;
  ctx.font = "600 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("Made together with gratitude  -  games-for-kids", W / 2, H - 82);

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
