import { create } from 'zustand';
import type { User } from '@/types/api';

/**
 * Sessiya holati. Access token faqat XOTIRADA saqlanadi (XSS orqali localStorage'dan
 * o'g'irlanmasligi uchun). Refresh token — httpOnly cookie'da, JavaScript unga kira olmaydi.
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  markInitialized: () => void;
}

/**
 * "Bu brauzerda sessiya bor edi" belgisi (maxfiy emas — token emas).
 * Belgi yo'q bo'lsa (mehmon) sahifa refresh javobini kutmasdan darhol ochiladi.
 */
const HINT_KEY = 'dht_session';
export const hasSessionHint = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
};
const setSessionHint = (on: boolean) => {
  try {
    if (on) localStorage.setItem(HINT_KEY, '1');
    else localStorage.removeItem(HINT_KEY);
  } catch {
    /* saqlash bloklangan — belgisiz ishlaydi */
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setSession: (user, accessToken) => {
    setSessionHint(true);
    set({ user, accessToken });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    setSessionHint(false);
    set({ user: null, accessToken: null });
  },
  markInitialized: () => set({ initialized: true }),
}));
