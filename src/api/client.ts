/**
 * @deprecated Legacy Axios client — no longer used.
 * Authentication is now handled by Better Auth via `@/lib/auth-client`.
 * Keep this file only as reference for the old custom backend integration.
 */
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(originalRequest);
        }
      } catch {
        await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
        await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
        await storage.deleteItem(STORAGE_KEYS.USER_DATA);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
