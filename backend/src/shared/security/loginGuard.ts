/**
 * Hisob bo'yicha brute-force himoyasi (IP bo'yicha limitga qo'shimcha).
 * Bitta login uchun WINDOW ichida MAX_FAILURES marta noto'g'ri parol kiritilsa,
 * hisob LOCK muddatiga vaqtincha yopiladi — hujumchi IP almashtirsa ham parol tanlay olmaydi.
 * Xotirada saqlanadi (bitta server jarayoni uchun yetarli); xotira hajmi cheklangan.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 50_000;

interface Entry { failures: number; firstAt: number; lockedUntil: number }
const entries = new Map<string, Entry>();

const prune = (now: number) => {
  if (entries.size < MAX_ENTRIES) return;
  for (const [k, e] of entries) if (e.lockedUntil < now && now - e.firstAt > WINDOW_MS) entries.delete(k);
  // Hali ham to'la bo'lsa — eng eskilarini o'chiramiz (Map qo'shilish tartibini saqlaydi)
  for (const k of entries.keys()) {
    if (entries.size < MAX_ENTRIES) break;
    entries.delete(k);
  }
};

export const loginGuard = {
  /** Qolgan blok vaqti (ms); 0 — bloklanmagan */
  lockedFor(key: string, now = Date.now()) {
    const e = entries.get(key);
    return e && e.lockedUntil > now ? e.lockedUntil - now : 0;
  },

  fail(key: string, now = Date.now()) {
    prune(now);
    const e = entries.get(key);
    if (!e || now - e.firstAt > WINDOW_MS) {
      entries.set(key, { failures: 1, firstAt: now, lockedUntil: 0 });
      return;
    }
    e.failures += 1;
    if (e.failures >= MAX_FAILURES) {
      e.lockedUntil = now + LOCK_MS;
      e.failures = 0;
      e.firstAt = now;
    }
  },

  success(key: string) {
    entries.delete(key);
  },

  /** Faqat testlar uchun */
  reset() {
    entries.clear();
  },
};

export const LOGIN_MAX_FAILURES = MAX_FAILURES;
