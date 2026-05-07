/**
 * Secure Storage — expo-secure-store wrapper functions.
 * Provides a simple key-value API for persisting tokens and user data securely.
 */
import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export async function setItem(key: StorageKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: StorageKey): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key: StorageKey): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function getJson<T>(key: StorageKey): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson(key: StorageKey, value: unknown): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

const storage = { setItem, getItem, deleteItem, getJson, setJson };

export default storage;
