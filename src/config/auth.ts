/**
 * Auth Configuration
 *
 * Better Auth client settings and OAuth provider configuration.
 */
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
export const authConfig = {
  /** Better Auth base URL (matches server baseURL) */
  baseUrl: __DEV__
    ? 'http://localhost:8081'
    : 'https://api.bexiemart.com',

  /** Cookie prefix (must match server config) */
  cookiePrefix: 'bexiemart',

  /** OAuth scopes for social providers */
  googleScopes: ['openid', 'email', 'profile'],
  appleScopes: ['email', 'name'],
} as const;

export const authClient = createAuthClient({
  baseURL: authConfig.baseUrl,
  plugins: [
    expoClient({
      scheme: 'bexiemartnew',
      storage: SecureStore,
    }),
  ],
});

/** Auth-related storage keys */
export const authKeys = {
  sessionToken: 'bexiemart_session_token',
  user: 'bexiemart_user',
} as const;
