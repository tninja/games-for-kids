import { BadgeId, ProfileData } from "./types";

const STORAGE_KEY = "battleship_kids_profile_v1";

const RANK_TIERS: readonly { minStars: number; name: string }[] = [
  { minStars: 28, name: "Admiral" },
  { minStars: 16, name: "Commander" },
  { minStars: 8, name: "Captain" },
  { minStars: 3, name: "Ensign" },
  { minStars: 0, name: "Sailor" }
];

export function rankForStars(stars: number): string {
  for (const tier of RANK_TIERS) {
    if (stars >= tier.minStars) {
      return tier.name;
    }
  }
  return "Sailor";
}

export function defaultProfile(): ProfileData {
  return { wins: 0, games: 0, stars: 0, badges: [] };
}

export class ProfileStore {
  public data: ProfileData;

  constructor(persist: boolean = true) {
    this.data = persist ? this.load() : defaultProfile();
  }

  private getStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window.localStorage ?? null;
    } catch {
      return null;
    }
  }

  public load(): ProfileData {
    const store = this.getStorage();
    if (!store) {
      return defaultProfile();
    }
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) {
        return defaultProfile();
      }
      const parsed = JSON.parse(raw) as Partial<ProfileData>;
      return {
        wins: typeof parsed.wins === "number" ? Math.max(0, Math.floor(parsed.wins)) : 0,
        games: typeof parsed.games === "number" ? Math.max(0, Math.floor(parsed.games)) : 0,
        stars: typeof parsed.stars === "number" ? Math.max(0, Math.floor(parsed.stars)) : 0,
        badges: Array.isArray(parsed.badges) ? (parsed.badges as BadgeId[]) : []
      };
    } catch {
      return defaultProfile();
    }
  }

  public save(): void {
    const store = this.getStorage();
    if (!store) {
      return;
    }
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore quota or privacy mode errors.
    }
  }

  public rankName(): string {
    return rankForStars(this.data.stars);
  }

  public recordMatch(
    won: boolean,
    starsEarned: number,
    candidateBadges: readonly BadgeId[]
  ): BadgeId[] {
    this.data.games += 1;
    if (won) {
      this.data.wins += 1;
      this.data.stars += Math.max(0, starsEarned);
    }
    const newlyUnlocked: BadgeId[] = [];
    for (const badge of candidateBadges) {
      if (!this.data.badges.includes(badge)) {
        this.data.badges.push(badge);
        newlyUnlocked.push(badge);
      }
    }
    this.save();
    return newlyUnlocked;
  }
}
