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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, accessToken: null }),
  markInitialized: () => set({ initialized: true }),
}));
