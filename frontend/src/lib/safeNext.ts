/**
 * Kirishdan keyingi `?next=` manzili — faqat platforma ichidagi /app sahifalari.
 * Ochiq yo'naltirishga (open redirect) qarshi: protokol, "//", teskari slesh, bo'shliq va boshqarish belgilari rad etiladi.
 */
export const safeNext = (next: string | null | undefined, fallback = '/app') => {
  if (!next || !/^\/app(?:[/?#]|$)/.test(next)) return fallback;
  const path = next.split(/[?#]/)[0];
  const hasControl = [...next].some((ch) => ch.charCodeAt(0) < 32);
  if (hasControl || /[\\\s:]|\/\//.test(path)) return fallback;
  return next;
};
