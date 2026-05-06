import { create } from "zustand";
import type { Role, User } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";
import storage from "@/utils/storage";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setAuth: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  setRole: (role: Role) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  hydrate: async () => {
    const [accessToken, refreshToken, user] = await Promise.all([
      storage.getItem(STORAGE_KEYS.AUTH_TOKEN),
      storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.getJson<User>(STORAGE_KEYS.USER_DATA),
    ]);

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      isHydrated: true,
    });
  },
  setAuth: async ({ user, accessToken, refreshToken }) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      storage.setJson(STORAGE_KEYS.USER_DATA, user),
    ]);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isHydrated: true,
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
      isHydrated: true,
    });
  },
  setRole: (role) => {
    const user = get().user;
    if (!user) {
      return;
    }

    const nextUser = { ...user, role };
    void storage.setJson(STORAGE_KEYS.USER_DATA, nextUser);
    set({ user: nextUser });
  },
}));

void useAuthStore.getState().hydrate();
