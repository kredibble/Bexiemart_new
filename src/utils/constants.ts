export const STORAGE_KEYS = {
  AUTH_TOKEN: "bexiemart.authToken",
  REFRESH_TOKEN: "bexiemart.refreshToken",
  USER_DATA: "bexiemart.userData",
} as const;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.com";
