import { CanvasContextLike, COLORS, Coord, Rect, TextAlign } from "./types";

export function collidePoint(rect: Rect, pt: Coord): boolean {
  return (
    pt[0] >= rect.x &&
    pt[0] <= rect.x + rect.width &&
    pt[1] >= rect.y &&
    pt[1] <= rect.y + rect.height
  );
}

export class Painter {
  public readonly ctx: CanvasContextLike;
  public errors: string[] = [];

  constructor(ctx: CanvasContextLike) {
    this.ctx = ctx;
  }

  public setFont(size: number, weight: string = "600"): number {
    const px = Math.max(11, Math.round(size * 0.68));
    this.ctx.font = weight + " " + px + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    return Math.round(size * 0.78);
  }

  public text(
    message: string,
    rect: Rect,
    size: number = 22,
    color: string = COLORS.INK,
    align: TextAlign = "left",
    weight: string = "600"
  ): number {
    const lineHeight = this.setFont(size, weight);
    const paragraphs = String(message).split("\n");
    const lines: string[] = [];

    for (const para of paragraphs) {
      const trimmed = para.trim();
      const words = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
      let line = "";
      for (const word of words) {
        const candidate = (line ? line + " " + word : word).trim();
        if (line && this.ctx.measureText(candidate).width > rect.width) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }

    const totalHeight = lines.length * lineHeight;
    const tooWide = lines.some((l) => this.ctx.measureText(l).width > rect.width + 2);
    if (totalHeight > rect.height + 2 || tooWide) {
      this.errors.push(message);
    }

    this.ctx.fillStyle = color;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = align;
    const drawX =
      align === "center"
        ? rect.x + rect.width / 2
        : align === "right"
          ? rect.x + rect.width
          : rect.x;
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], drawX, rect.y + i * lineHeight);
    }
    this.ctx.textAlign = "left";
    return totalHeight;
  }

  public panel(rect: Rect, color: string = COLORS.PANEL, radius: number = 16): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.fill();
  }

  public strokeRoundRect(
    rect: Rect,
    color: string,
    lineWidth: number,
    radius: number = 16
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.stroke();
  }
}
