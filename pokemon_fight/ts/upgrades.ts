import type { HeroId } from "./data";

export interface Upgrade {
  id: string;
  hero?: HeroId;
  name: string;
  description: string;
  symbol: string;
  category: "attack" | "defense" | "utility";
}

export const UPGRADES: readonly Upgrade[] = [
  { id: "steel-wide", category: "attack", hero: "steelix", name: "Wide sweep", description: "A wider wave catches more challengers.", symbol: "\u25D4" },
  { id: "steel-double", category: "attack", hero: "steelix", name: "Double tail", description: "A second golden wave follows the first.", symbol: "\u224B" },
  { id: "steel-armor", category: "defense", hero: "steelix", name: "Rock armor", description: "Three extra hearts and a fresh heal.", symbol: "\u2B21" },
  { id: "ghost-twins", category: "attack", hero: "duskull", name: "Twin spirits", description: "Send out an extra tracking ghost flame.", symbol: "\u2637" },
  { id: "ghost-haunt", category: "attack", hero: "duskull", name: "Long haunt", description: "Ghost flames linger and slow for longer.", symbol: "\u25CE" },
  { id: "ghost-guard", category: "defense", hero: "duskull", name: "Cozy shield", description: "Your automatic spirit shield lasts longer.", symbol: "\u2661" },
  { id: "water-fan", category: "attack", hero: "greninja", name: "Three ways", description: "Each water star becomes a three-way fan.", symbol: "\u2733" },
  { id: "water-return", category: "attack", hero: "greninja", name: "Come back", description: "Water stars return for another hit.", symbol: "\u21BA" },
  { id: "water-pierce", category: "attack", hero: "greninja", name: "Star stream", description: "Water stars pierce through more targets.", symbol: "\u2727" },
  { id: "fire-twins", category: "attack", hero: "darmanitan", name: "Double fire", description: "Lob a second fireball beside the first.", symbol: "\u2668" },
  { id: "fire-long", category: "attack", hero: "darmanitan", name: "Lasting glow", description: "Flame patches stay warm for longer.", symbol: "\u2600" },
  { id: "fire-big", category: "attack", hero: "darmanitan", name: "Big bloom", description: "Bigger bursts catch nearby challengers.", symbol: "\u2739" },
  { id: "swift-feet", category: "utility", name: "Happy feet", description: "Move a little faster around the arena.", symbol: "\u2248" },
  { id: "big-heart", category: "defense", name: "Big heart", description: "Three extra hearts and a fresh heal.", symbol: "\u2665" },
  { id: "quick-charge", category: "utility", name: "Star power", description: "Charge your automatic special faster.", symbol: "\u26A1" }
];

export const BUDDY_ATTACK_PRIORITY: Record<HeroId, readonly string[]> = {
  steelix: ["steel-double", "steel-wide"],
  duskull: ["ghost-twins", "ghost-haunt"],
  greninja: ["water-fan", "water-return", "water-pierce"],
  darmanitan: ["fire-twins", "fire-big", "fire-long"]
};
