import * as SecureStore from "expo-secure-store";

const storage = {
  getItem(key: string) {
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJson(key: string, value: unknown) {
    return SecureStore.setItemAsync(key, JSON.stringify(value));
  },
};

export default storage;
