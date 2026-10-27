import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Taqqoslash uchun tanlangan manbalar (2–4 ta) */
interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

export const MAX_COMPARE = 4;

// Tanlov sahifa yangilanganda ham saqlanadi (faqat shu brauzer tabida)
export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : s.ids.length >= MAX_COMPARE ? s.ids : [...s.ids, id],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'dht-compare', storage: createJSONStorage(() => sessionStorage), partialize: (s) => ({ ids: s.ids }) },
  ),
);
