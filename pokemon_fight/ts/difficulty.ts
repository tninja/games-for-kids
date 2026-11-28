export type DifficultyId = "relaxed" | "standard" | "hard" | "expert";

export interface Difficulty {
  id: DifficultyId; name: string; description: string;
  enemyLimit: number; spawnInterval: number; enemyHp: number; chaserSpeed: number; movement: number;
  shooterInterval: number; projectileSpeed: number; shooterShots: number;
  chargeWarning: number; chargeRest: number;
  bossHp: number; bossWarning: number; bossRest: number; bossProjectileSpeed: number;
  hurtGrace: number; supplyInterval: number; healthDropChance: number;
}

// Warnings remain visible on every setting. Difficulty changes battle pressure,
// while player controls, attack strength and upgrade timing stay familiar.
export const DIFFICULTIES: readonly Difficulty[] = [
  { id: "relaxed", name: "Easy", description: "Fewer challengers, slow shots, and plenty of time to dodge.",
    enemyLimit: 5, spawnInterval: 3.4, enemyHp: 1, chaserSpeed: 61, movement: 1,
    shooterInterval: 3.3, projectileSpeed: 125, shooterShots: 1, chargeWarning: 1.2, chargeRest: 3.2,
    bossHp: 1400, bossWarning: 1.9, bossRest: 3.2, bossProjectileSpeed: 1,
    hurtGrace: 1.2, supplyInterval: 22, healthDropChance: 0.22 },
  { id: "standard", name: "Normal", description: "A lively battle with more challengers and faster shots. Start here!",
    enemyLimit: 8, spawnInterval: 2.2, enemyHp: 1, chaserSpeed: 86, movement: 1,
    shooterInterval: 2.5, projectileSpeed: 155, shooterShots: 1, chargeWarning: 1, chargeRest: 3,
    bossHp: 1850, bossWarning: 1.5, bossRest: 3, bossProjectileSpeed: 1,
    hurtGrace: 1.2, supplyInterval: 24, healthDropChance: 0.2 },
  { id: "hard", name: "Hard", description: "Busy waves, three-shot fans, and shorter warnings. Keep moving!",
    enemyLimit: 11, spawnInterval: 1.6, enemyHp: 1.12, chaserSpeed: 105, movement: 1.12,
    shooterInterval: 2, projectileSpeed: 185, shooterShots: 3, chargeWarning: 0.85, chargeRest: 2.6,
    bossHp: 2150, bossWarning: 1.2, bossRest: 2.2, bossProjectileSpeed: 1.3,
    hurtGrace: 0.95, supplyInterval: 28, healthDropChance: 0.17 },
  { id: "expert", name: "Expert", description: "The biggest waves, fastest shots, and fierce leaders. For a big challenge!",
    enemyLimit: 14, spawnInterval: 1.15, enemyHp: 1.25, chaserSpeed: 122, movement: 1.25,
    shooterInterval: 1.6, projectileSpeed: 215, shooterShots: 3, chargeWarning: 0.7, chargeRest: 2.2,
    bossHp: 2450, bossWarning: 1, bossRest: 1.7, bossProjectileSpeed: 1.45,
    hurtGrace: 0.8, supplyInterval: 32, healthDropChance: 0.14 }
];

export const DEFAULT_DIFFICULTY: DifficultyId = "standard";
export const validDifficulty = (id: unknown): id is DifficultyId => DIFFICULTIES.some(item => item.id === id);
export function difficulty(id: unknown): Difficulty {
  return DIFFICULTIES.find(item => item.id === id) ?? DIFFICULTIES[1];
}
