/**
 * API Client — Fetch-based client for Better Auth session-based requests.
 *
 * Retrieves the session token from SecureStore (stored by Better Auth's expoClient plugin)
 * and attaches it as a cookie header on every request.
 *
 * Features:
 *  - Automatic retry with exponential backoff for GET requests
 *  - 401 handling (session expired → clear token)
 *  - Error classification for consistent error handling
 */
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from '@/config/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: (attempt: number) => number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
};

const MUTATION_RETRY: RetryOptions = {
  maxRetries: 1,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
};

// ── Session Token Helper ───────────────────────────────────────────────────────

async function getSessionCookie(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('bexiemart_session_token');
    return token ? `better-auth.session_token=${token}` : null;
  } catch {
    return null;
  }
}

/** Callback to invoke when a 401 is received — used to trigger logout + redirect */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

async function clearSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('bexiemart_session_token');
  } catch {
    // Already cleared
  }
}

function triggerUnauthorized(): void {
  clearSessionToken();
  if (onUnauthorized) {
    onUnauthorized();
  }
}

// ── Core Request ───────────────────────────────────────────────────────────────

async function rawRequest<T>(
  method: string,
  path: string,
  data?: unknown,
): Promise<T> {
  const url = apiConfig.baseUrl + (path.startsWith('/api') ? path : `/api${path}`);
  const cookie = await getSessionCookie();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(apiConfig.timeout),
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    if (response.status === 401) {
      triggerUnauthorized();
    }

    throw new ApiError(
      (errorData as any)?.message ?? response.statusText,
      response.status,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json() as any;

  // Unwrap standard envelope { success, data, meta? } returned by server/utils/response.ts
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    // Paginated responses: reconstruct { data, page, pageSize, ... } shape
    if (json.meta) {
      return { data: json.data, ...json.meta } as T;
    }
    return json.data as T;
  }

  return json as T;
}

// ── Retry Wrapper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY,
): Promise<T> {
  const { maxRetries = 3, retryDelay = DEFAULT_RETRY.retryDelay! } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      // Don't retry on client errors (4xx) except 408/429
      if (error instanceof ApiError && error.status < 500 && error.status !== 408 && error.status !== 429) {
        throw error;
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
      }
    }
  }

  throw lastError;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string) =>
    withRetry(() => rawRequest<T>('GET', path)),

  post: <T>(path: string, data?: unknown) =>
    withRetry(() => rawRequest<T>('POST', path, data), MUTATION_RETRY),

  put: <T>(path: string, data?: unknown) =>
    withRetry(() => rawRequest<T>('PUT', path, data), MUTATION_RETRY),

  patch: <T>(path: string, data?: unknown) =>
    withRetry(() => rawRequest<T>('PATCH', path, data), MUTATION_RETRY),

  delete: <T>(path: string) =>
    withRetry(() => rawRequest<T>('DELETE', path), MUTATION_RETRY),
};
