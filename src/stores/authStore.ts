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
import { useCartStore } from "./cartStore";

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
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch((e) => console.warn('SecureStore setUser failed', e));
    } else {
      SecureStore.deleteItemAsync(USER_KEY).catch((e) => console.warn('SecureStore deleteUser failed', e));
    }
    set({ user, isAuthenticated: !!user });
  },

  setRole: (role) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, role };
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated)).catch((e) => console.warn('SecureStore setRole failed', e));
    set({ user: updated });
  },

  clearAuth: () => set({ user: null, isAuthenticated: false }),

  signOut: async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.warn('authClient.signOut failed', e);
    }
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(COOKIE_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    } catch (e) {
      console.warn('SecureStore cleanup after signOut failed', e);
    }
    useCartStore.getState().clearCart();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      // First try Better Auth's own session (source of truth)
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        const user = session.user as unknown as User;
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return;
      }

      // Fallback: restore from SecureStore
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true });
      }
    } catch (e) {
      console.warn('authStore hydrate failed', e);
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));

// Auto-hydrate on module load
void useAuthStore.getState().hydrate();
