import { BackgroundKind, BirdColor, BirdFlapFrame, PipeColor, SoundKey } from "./types";

export class SoundBank {
  public muted = false;
  public emittedCount = 0;
  private audios: Partial<Record<SoundKey, HTMLAudioElement>> = {};

  constructor(basePath: string = "resources/audios") {
    if (typeof Audio === "undefined") {
      return;
    }
    const keys: SoundKey[] = ["die", "hit", "point", "swoosh", "wing"];
    for (const key of keys) {
      const audio = new Audio(basePath + "/" + key + ".wav");
      audio.preload = "auto";
      this.audios[key] = audio;
    }
  }

  public toggle(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public play = (key: SoundKey): boolean => {
    if (this.muted) {
      return false;
    }
    this.emittedCount += 1;
    const base = this.audios[key];
    if (!base) {
      return true;
    }
    try {
      const node = base.cloneNode(true) as HTMLAudioElement;
      node.volume = 0.6;
      const p = node.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Ignore browser autoplay rejection before first gesture.
        });
      }
    } catch {
      // Ignore audio errors in restricted environments.
    }
    return true;
  };
}

export class ImageBank {
  private images: Record<string, HTMLImageElement> = {};

  constructor(basePath: string = "resources/images") {
    if (typeof Image === "undefined") {
      return;
    }
    const names = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "background-day",
      "background-night",
      "base",
      "gameover",
      "message",
      "pipe-green",
      "pipe-red",
      "redbird-upflap",
      "redbird-midflap",
      "redbird-downflap",
      "bluebird-upflap",
      "bluebird-midflap",
      "bluebird-downflap",
      "yellowbird-upflap",
      "yellowbird-midflap",
      "yellowbird-downflap"
    ];
    for (const name of names) {
      const img = new Image();
      img.src = basePath + "/" + name + ".png";
      this.images[name] = img;
    }
  }

  public getReady(key: string): HTMLImageElement | null {
    const img = this.images[key];
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  public background(kind: BackgroundKind): HTMLImageElement | null {
    return this.getReady("background-" + kind);
  }

  public pipe(color: PipeColor): HTMLImageElement | null {
    return this.getReady("pipe-" + color);
  }

  public bird(color: BirdColor, frame: BirdFlapFrame): HTMLImageElement | null {
    return this.getReady(color + "bird-" + frame + "flap");
  }

  public digit(d: string): HTMLImageElement | null {
    return this.getReady(d);
  }
}
