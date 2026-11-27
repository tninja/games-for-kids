export const KEY = "adventure-worlds-v1";
export function fresh() {
  return {xp: 0, progress: {}, words: {}, mode: "all"};
}
export function tokens(line) {
  return line.split("/").map(piece => { const [zh, py = ""] = piece.split("|"); return {zh, py}; });
}
export function restore(raw) {
  const s = fresh();
  try {
    const v = JSON.parse(raw || "null");
    if (!v || typeof v !== "object") return s;
    if (Number.isSafeInteger(v.xp) && v.xp >= 0) s.xp = v.xp;
    if (["all","tap","adaptive"].includes(v.mode)) s.mode = v.mode;
    for (const field of ["progress", "words"]) {
      if (v[field] && typeof v[field] === "object") {
        for (const [k,n] of Object.entries(v[field])) {
          if (!["__proto__","constructor","prototype"].includes(k) && typeof n === "number" && Number.isSafeInteger(n) && n >= 0) s[field][k] = n;
        }
      }
    }
  } catch { /* A corrupt save must never block play. */ }
  return s;
}
export function complete(s, world, index, line, helped, firstTry) {
  if ((s.progress[world] ?? 0) !== index) return 0;
  const points = 20 + (!helped && firstTry ? 10 : 0);
  s.xp += points;
  s.progress[world] = index + 1;
  if (!helped && firstTry && s.mode === "tap") {
    for (const word of new Set(tokens(line).filter(t => t.py).map(t => t.zh))) s.words[word] = (s.words[word] ?? 0) + 1;
  }
  return points;
}
