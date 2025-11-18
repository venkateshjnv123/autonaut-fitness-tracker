// lib/localStore.ts
export type ScoreEntry = { email: string; name?: string; score: number };
const TODAY_KEY = (d: string) => `scores:${d}`;
const HISTORY_KEY = (email: string) => `history:${email.toLowerCase()}`;

export function getTodayKey(date = new Date().toISOString().slice(0,10)) {
  return TODAY_KEY(date);
}

export function loadTodayLeaderboard(date = new Date().toISOString().slice(0,10)): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(TODAY_KEY(date));
    if (!raw) return []; 
    const arr = JSON.parse(raw) as ScoreEntry[];
    return arr.sort((a,b)=>b.score - a.score);
  } catch {
    return [];
  }
}

export function saveTodayScore(date: string, email: string, name: string|undefined, score: number) {
  const key = TODAY_KEY(date);
  const raw = localStorage.getItem(key);
  const arr: ScoreEntry[] = raw ? JSON.parse(raw) : [];
  const idx = arr.findIndex(r=>r.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) arr[idx] = { email, name, score };
  else arr.push({ email, name, score });
  localStorage.setItem(key, JSON.stringify(arr));

  // history per user
  const hKey = HISTORY_KEY(email);
  const histRaw = localStorage.getItem(hKey);
  const hist: Record<string,string> = histRaw ? JSON.parse(histRaw) : {};
  hist[date] = String(score);
  localStorage.setItem(hKey, JSON.stringify(hist));
}

export function loadUserHistory(email: string): Record<string,string> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY(email));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
