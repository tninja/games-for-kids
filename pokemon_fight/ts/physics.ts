import { COVER, HEIGHT, WIDTH, type Point, type Rect } from "./data";

export const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
export function unit(x: number, y: number): Point {
  const length = Math.hypot(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
export function circleRect(point: Point, radius: number, rect: Rect): boolean {
  return Math.hypot(point.x - clamp(point.x, rect.x, rect.x + rect.w), point.y - clamp(point.y, rect.y, rect.y + rect.h)) < radius;
}
export function walkable(point: Point, radius: number): boolean {
  return point.x >= radius + 24 && point.x <= WIDTH - radius - 24 &&
    point.y >= radius + 24 && point.y <= HEIGHT - radius - 24 &&
    !COVER.some(rect => circleRect(point, radius, rect));
}
export function move(point: Point, dx: number, dy: number, radius: number): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (radius * 0.5)));
  for (let step = 0; step < steps; step++) {
    const x = clamp(point.x + dx / steps, 24 + radius, WIDTH - 24 - radius);
    const y = clamp(point.y + dy / steps, 24 + radius, HEIGHT - 24 - radius);
    if (walkable({ x, y: point.y }, radius)) point.x = x;
    if (walkable({ x: point.x, y }, radius)) point.y = y;
  }
}
// Slab intersection catches cover even when a projectile crosses it in one step.
export function segmentRect(a: Point, b: Point, rect: Rect, padding = 0): boolean {
  let near = 0;
  let far = 1;
  for (const axis of ["x", "y"] as const) {
    const delta = b[axis] - a[axis];
    const min = rect[axis] - padding;
    const max = rect[axis] + (axis === "x" ? rect.w : rect.h) + padding;
    if (Math.abs(delta) < 0.00001) {
      if (a[axis] < min || a[axis] > max) return false;
    } else {
      let first = (min - a[axis]) / delta;
      let second = (max - a[axis]) / delta;
      if (first > second) [first, second] = [second, first];
      near = Math.max(near, first);
      far = Math.min(far, second);
      if (near > far) return false;
    }
  }
  return true;
}
export const blocked = (a: Point, b: Point, padding = 3): boolean => COVER.some(rect => segmentRect(a, b, rect, padding));
export function segmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
}
export function navigate(point: Point, goal: Point, radius: number): Point {
  if (!blocked(point, goal, radius + 2)) return unit(goal.x - point.x, goal.y - point.y);
  // A tiny visibility graph avoids the back-and-forth produced by greedy corners.
  const gap = radius + 12;
  const nodes = [point, ...COVER.flatMap(rect => [
    { x: rect.x - gap, y: rect.y - gap },
    { x: rect.x + rect.w + gap, y: rect.y - gap },
    { x: rect.x - gap, y: rect.y + rect.h + gap },
    { x: rect.x + rect.w + gap, y: rect.y + rect.h + gap }
  ]), goal];
  const costs = nodes.map(() => Infinity);
  const next = nodes.map(() => -1);
  const visited = new Set<number>();
  costs[nodes.length - 1] = 0;
  for (let step = 0; step < nodes.length; step++) {
    let best = -1;
    for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (best < 0 || costs[i] < costs[best])) best = i;
    if (best < 0 || !Number.isFinite(costs[best])) break;
    visited.add(best);
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i) || blocked(nodes[i], nodes[best], radius + 2)) continue;
      const cost = costs[best] + distance(nodes[i], nodes[best]);
      if (cost < costs[i]) { costs[i] = cost; next[i] = best; }
    }
  }
  let target = next[0];
  while (target >= 0 && distance(point, nodes[target]) < 3 && next[target] >= 0) target = next[target];
  const destination = target >= 0 ? nodes[target] : goal;
  return unit(destination.x - point.x, destination.y - point.y);
}
