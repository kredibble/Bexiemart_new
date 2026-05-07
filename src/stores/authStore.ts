/**
 * AuthStore — Simplified Zustand store for mirroring Better Auth session state.
 *
 * Better Auth manages session/cookies automatically via the expoClient plugin.
 * This store is a lightweight local mirror for components that need reactive access
 * without hooking into useSession().
 */
import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
