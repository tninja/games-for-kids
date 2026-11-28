export type Mode = "all" | "tap" | "adaptive";
export type Difficulty = "easy" | "normal";
export interface Save { difficulty: Difficulty; xp: number; progress: Record<string, number>; words: Record<string, number>; routes: Record<string, number>; mode: Mode; }
export const KEY = "adventure-worlds-v1";
export function fresh(): Save {
  return {difficulty: "easy", xp: 0, progress: {}, words: {}, routes: {}, mode: "all"};
}
export function tokens(line: string) {
  return line.split("/").map(piece => { const [zh, py = ""] = piece.split("|"); return {zh, py}; });
}
export function restore(raw: string | null) {
  const s = fresh();
  try {
    const v = JSON.parse(raw || "null");
    if (!v || typeof v !== "object") return s;
    if (Number.isSafeInteger(v.xp) && v.xp >= 0) s.xp = v.xp;
    if (v.difficulty === "easy" || v.difficulty === "normal") s.difficulty = v.difficulty;
  if (["all","tap","adaptive"].includes(v.mode)) s.mode = v.mode;
    for (const field of ["progress", "words", "routes"] as const) {
      if (v[field] && typeof v[field] === "object") {
        for (const [k,n] of Object.entries(v[field])) {
          if (!["__proto__","constructor","prototype"].includes(k) && typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && (field !== "routes" || n <= 1)) s[field][k] = n;
        }
      }
    }
  } catch { /* A corrupt save must never block play. */ }
  return s;
}
export function complete(s: Save, world: string, index: number, line: string, helped: boolean, firstTry: boolean) {
  if ((s.progress[world] ?? 0) !== index) return 0;
  const points = 25;
  s.xp += points;
  s.progress[world] = index + 1;
  if (!helped && firstTry && s.mode === "tap") {
    for (const word of new Set(tokens(line).filter(t => t.py).map(t => t.zh))) s.words[word] = (s.words[word] ?? 0) + 1;
  }
  return points;
}

export function progressKey(world: string, difficulty: Difficulty) { return difficulty === "easy" ? world : world + ":normal"; }

export function heroLevel(xp: number) { return 1 + Math.floor(Math.max(0,xp)/100); }
export function heroRank(level: number) { return level >= 20 ? 'World Guardian' : level >= 12 ? 'Master Explorer' : level >= 6 ? 'Adventure Knight' : level >= 3 ? 'Pathfinder' : 'Young Explorer'; }

export function routeKey(world: string, index: number) { return world+":"+index; }

// Shuffle only at scene entry; hints and retries retain button positions.
export function shuffleChoices(items: number[], random=Math.random) {
 const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function keywordOverlap(clue: string,choice: string,width: number=1) {
 const grams=(line: string)=>{const h=tokens(line).map(t=>t.zh).join("").replace(/[^\p{Script=Han}]/gu,"");return new Set(Array.from({length:Math.max(0,h.length-width+1)},(_,i)=>h.slice(i,i+width)));};
 const a=grams(clue),b=grams(choice);return [...b].filter(g=>a.has(g)).length/Math.max(1,b.size);
}
