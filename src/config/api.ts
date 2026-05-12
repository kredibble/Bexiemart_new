/**
 * API Configuration
 *
 * Centralized API settings for BexieMart.
 * All API-related configuration lives here.
 */
import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PROXY_PORT = 8081;

export const apiConfig = {
  /**
   * Base URL for all API requests.
   * - Web: proxy URL (port 8081) to avoid CORS
   * - Native: proxy URL (port 8081)
   */
  baseUrl: __DEV__
    ? `http://${DEV_HOST}:${PROXY_PORT}`
    : 'https://api.bexiemart.com',

  /** API endpoint prefix */
  prefix: '/api',

  /** Request timeout in milliseconds */
  timeout: 15000,

  /** Retry configuration */
  retry: {
    maxRetries: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
    retryableMethods: ['get'],
  },
} as const;

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  return `${apiConfig.baseUrl}${fullPath}`;
};
