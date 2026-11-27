import { ART, HEROES, type ArtId } from "./data";

// Display the actual card illustration. No AI redraws or modifications to originals.
// Only small canvases are retained, rather than seven decoded 24-megapixel photos.
export class Artwork {
  readonly pictures = new Map<ArtId, HTMLCanvasElement>();
  readonly failed: ArtId[] = [];
  loaded = 0;

  async load(onProgress: () => void): Promise<void> {
    for (const id of Object.keys(ART) as ArtId[]) {
      try { this.pictures.set(id, await this.read(id)); }
      catch { this.failed.push(id); }
      this.loaded++;
      onProgress();
    }
  }
  private read(id: ArtId): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timeout = window.setTimeout(() => finish(new Error("Card image timed out")), 18000);
      const finish = (error?: Error, result?: HTMLCanvasElement): void => {
        clearTimeout(timeout);
        image.onload = null; image.onerror = null;
        image.src = "";
        if (error) reject(error);
        else resolve(result!);
      };
      image.onload = () => {
        try {
          const spec = ART[id];
          const upright = document.createElement("canvas");
          upright.width = 1024; upright.height = 1365;
          const context = upright.getContext("2d")!;
          context.translate(512, 682.5);
          if (spec.turn) {
            context.rotate(-Math.PI / 2);
            context.drawImage(image, -682.5, -512, 1365, 1024);
          } else context.drawImage(image, -512, -682.5, 1024, 1365);
          const cropped = document.createElement("canvas");
          cropped.width = 384; cropped.height = 256;
          const [x, y, w, h] = spec.crop;
          cropped.getContext("2d")!.drawImage(upright, x * 1024, y * 1365, w * 1024, h * 1365, 0, 0, 384, 256);
          upright.width = upright.height = 1;
          finish(undefined, cropped);
        } catch (error) { finish(error instanceof Error ? error : new Error("Card art unavailable")); }
      };
      image.onerror = () => finish(new Error("Card art unavailable"));
      image.src = "assets/" + ART[id].file;
    });
  }
  paint(context: CanvasRenderingContext2D, id: ArtId, x: number, y: number, width: number, height: number): void {
    const picture = this.pictures.get(id);
    if (picture) context.drawImage(picture, x, y, width, height);
    else {
      const spec = HEROES.find(item => item.id === id);
      context.fillStyle = spec?.color ?? "#c2d7b2";
      context.fillRect(x, y, width, height);
      context.fillStyle = "#182840";
      context.textAlign = "center"; context.textBaseline = "middle";
      context.font = "bold " + Math.floor(height * 0.34) + "px system-ui";
      context.fillText(id.slice(0, 2).toUpperCase(), x + width / 2, y + height / 2);
    }
  }
}
