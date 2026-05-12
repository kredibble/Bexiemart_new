/**
 * App Constants — API base URL, Paystack key, and storage key references.
 */
import { Platform } from 'react-native';
import { STORAGE_KEYS as _STORAGE_KEYS } from './storage';

// API base URL — points to unified dev proxy (port 8081)
// The proxy routes /api/* to the backend (port 3000)
// Web uses relative path (same origin), native uses proxy IP
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? Platform.OS === 'web'
    ? '/api'
    : `http://${DEV_HOST}:8081/api`
  : 'https://api.bexiemart.com/api';

export const PAYSTACK_PUBLIC_KEY = __DEV__
  ? 'pk_test_xxx'
  : 'pk_live_xxx';

export const APP_NAME = 'BexieMart';

// Re-export storage keys for convenience
export const STORAGE_KEYS = _STORAGE_KEYS;
