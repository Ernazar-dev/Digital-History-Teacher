import { create } from 'zustand';

/** Mehmon (tizimga kirmagan) foydalanuvçi özgartiruvçi amal qilganda çiqadigan "Kiriş" oynasi holati */
interface LoginPromptState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useLoginPrompt = create<LoginPromptState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
