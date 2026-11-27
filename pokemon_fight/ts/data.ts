export type HeroId = "steelix" | "duskull" | "greninja" | "darmanitan";
export type ArtId = HeroId | "machamp" | "machoke" | "spewpa";
export interface Point { x: number; y: number }
export interface Rect extends Point { w: number; h: number }
export interface ArtSpec { file: string; turn: boolean; crop: [number, number, number, number] }
export interface HeroSpec {
  id: HeroId; name: string; title: string; description: string; color: string;
  hp: number; speed: number; damage: number; interval: number; range: number;
  special: string;
}

export const WIDTH = 1000;
export const HEIGHT = 620;
export const RADIUS = 18;
export const COVER: Rect[] = [
  { x: 270, y: 242, w: 112, h: 62 },
  { x: 618, y: 316, w: 112, h: 62 }
];
export const HEROES: HeroSpec[] = [
  { id: "steelix", name: "Radiant Steelix", title: "Sweep the whole crowd", description: "Golden tail waves sweep a fan and push challengers back.", color: "#ffd56a", hp: 10, speed: 188, damage: 20, interval: 0.8, range: 265, special: "Golden tail sweep" },
  { id: "duskull", name: "Duskull", title: "Let the spirits chase", description: "Tracking ghost flames slip past cover, haunt and slow.", color: "#c6a0ff", hp: 8, speed: 201, damage: 10, interval: 0.65, range: 300, special: "Spirit shield" },
  { id: "greninja", name: "Greninja", title: "Line them up", description: "Three quick water stars pierce through a line of targets.", color: "#71dbff", hp: 8, speed: 226, damage: 7, interval: 0.85, range: 320, special: "Water star burst" },
  { id: "darmanitan", name: "Darmanitan", title: "Lead them into the fire", description: "Lob fireballs over cover and leave glowing flame patches.", color: "#ff9c78", hp: 9, speed: 198, damage: 19, interval: 1.1, range: 300, special: "Firework bloom" }
];
export const ART: Record<ArtId, ArtSpec> = {
  steelix: { file: "IMG_0713.jpeg", turn: false, crop: [0.286, 0.262, 0.583, 0.273] },
  duskull: { file: "IMG_0714.jpeg", turn: true, crop: [0.192, 0.187, 0.558, 0.265] },
  greninja: { file: "IMG_0712.jpeg", turn: false, crop: [0.199, 0.215, 0.614, 0.269] },
  darmanitan: { file: "IMG_0718.jpeg", turn: true, crop: [0.206, 0.215, 0.587, 0.273] },
  machamp: { file: "IMG_0717.jpeg", turn: true, crop: [0.16, 0.224, 0.558, 0.265] },
  machoke: { file: "IMG_0719.jpeg", turn: true, crop: [0.158, 0.285, 0.575, 0.258] },
  spewpa: { file: "IMG_0715.jpeg", turn: true, crop: [0.303, 0.309, 0.536, 0.249] }
};
export const hero = (id: HeroId): HeroSpec => HEROES.find(item => item.id === id)!;
