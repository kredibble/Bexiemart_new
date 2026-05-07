import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { STORAGE_KEYS } from "@/utils/storage";
import storage from "@/utils/storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAuth: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setUser: async (user) => {
    if (user) {
      await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } else {
      await storage.deleteItem(STORAGE_KEYS.USER_DATA);
    }
    set({ user, isAuthenticated: !!user });
  },

  setToken: async (token) => {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    set({ accessToken: token });
  },

  setTokens: async (accessToken, refreshToken) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
    set({ accessToken, refreshToken });
  },

  setAuth: async ({ user, accessToken, refreshToken }) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
    ]);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await Promise.all([
      storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN),
      storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.deleteItem(STORAGE_KEYS.USER_DATA),
    ]);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  clearAuth: async () => {
    await Promise.all([
      storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN),
      storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.deleteItem(STORAGE_KEYS.USER_DATA),
    ]);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        storage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        storage.getItem(STORAGE_KEYS.USER_DATA),
      ]);
      if (accessToken && refreshToken && userStr) {
        set({
          accessToken,
          refreshToken,
          user: JSON.parse(userStr),
          isAuthenticated: true,
        });
      }
    } catch {
      // ignore — user will be redirected to auth
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));

void useAuthStore.getState().hydrate();
