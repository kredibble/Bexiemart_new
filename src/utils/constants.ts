/**
 * App Constants — API base URL, Paystack key, and storage key references.
 */
import { Platform } from 'react-native';
import { STORAGE_KEYS as _STORAGE_KEYS } from './storage';

// API base URL — auto-detects Android emulator (10.0.2.2) vs iOS simulator (localhost)
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api`
  : 'https://api.bexiemart.com/api';

export const PAYSTACK_PUBLIC_KEY = __DEV__
  ? 'pk_test_xxx'
  : 'pk_live_xxx';

export const APP_NAME = 'BexieMart';

// Re-export storage keys for convenience
export const STORAGE_KEYS = _STORAGE_KEYS;
