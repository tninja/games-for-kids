import { HEIGHT, WIDTH, type Point } from "./data";
import { clamp } from "./physics";

export interface ArenaView { scale: number; x: number; y: number; width: number; height: number; closeup: boolean }

// Keep the phone's Pokemon readable instead of shrinking the entire world to fit.
export function arenaView(width: number, height: number, player: Point, target: Point | undefined, closeup: boolean): ArenaView {
  const fit = Math.min(width / WIDTH, height / HEIGHT);
  const scale = closeup ? Math.max(fit, Math.min(0.95, width / 400, height / 260)) : fit;
  const visibleWidth = width / scale;
  const visibleHeight = height / scale;
  const padding = closeup ? 80 : 0;
  let focusX = player.x + (target ? clamp((target.x - player.x) * 0.3, -85, 85) : 0);
  let focusY = player.y + (target ? clamp((target.y - player.y) * 0.3, -85, 85) : 0);
  if (closeup && target) {
    const left = Math.min(player.x, target.x) - 80;
    const right = Math.max(player.x, target.x) + 80;
    const top = Math.min(player.y - 110, target.y - 130);
    const bottom = Math.max(player.y, target.y) + 26;
    if (right - left + 16 <= visibleWidth) focusX = clamp(focusX, right + 8 - visibleWidth / 2, left - 8 + visibleWidth / 2);
    if (bottom - top + 16 <= visibleHeight) focusY = clamp(focusY, bottom + 8 - visibleHeight / 2, top - 8 + visibleHeight / 2);
  }
  return {
    scale, width: visibleWidth, height: visibleHeight, closeup,
    x: visibleWidth >= WIDTH + padding * 2 ? WIDTH / 2 : clamp(focusX, visibleWidth / 2 - padding, WIDTH + padding - visibleWidth / 2),
    y: visibleHeight >= HEIGHT + padding * 2 ? HEIGHT / 2 : clamp(focusY, visibleHeight / 2 - padding, HEIGHT + padding - visibleHeight / 2)
  };
}
