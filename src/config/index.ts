/**
 * Configuration Index
 *
 * Central export point for all BexieMart configuration.
 *
 * Usage:
 *   import { apiConfig, authClient, paystackConfig } from '@/config';
 */
export { apiConfig, getApiUrl } from './api';
export { authConfig, authClient, authKeys } from './auth';
export { paystackConfig, paystackTestCards } from './paystack';
