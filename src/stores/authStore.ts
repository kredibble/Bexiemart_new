/**
 * AuthStore — Zustand store for mirroring Better Auth session state.
 *
 * Better Auth manages session/cookies automatically via the expoClient plugin.
 * This store is a lightweight local mirror for components that need reactive access
 * without hooking into useSession().
 *
 * The expoClient stores cookies under "{cookiePrefix}_cookie" in SecureStore.
 */
import { create } from "zustand";
import type { User, Role } from "@/types";
import { authClient } from "@/lib/auth-client";
import * as SecureStore from "expo-secure-store";

const COOKIE_KEY = "bexiemart_cookie";
const USER_KEY = "bexiemart_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: Role) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => {
    if (user) {
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    }
    set({ user, isAuthenticated: !!user });
  },

  setRole: (role) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, role };
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated)).catch(() => {});
    set({ user: updated });
  },

  clearAuth: () => set({ user: null, isAuthenticated: false }),

  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    // Clear all Better Auth storage keys
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(COOKIE_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true });
      }
    } catch {
      // ignore — user will be redirected to auth
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));

// Auto-hydrate on module load
void useAuthStore.getState().hydrate();
