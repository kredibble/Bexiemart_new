/**
 * API Error Handler — Centralized error handling and retry logic for API calls.
 *
 * Features:
 *  - Retry with exponential backoff for transient failures (5xx, network errors)
 *  - Error classification (network, auth, validation, server)
 *  - User-friendly error messages
 *  - Error logging hook for monitoring
 */

// ── Error Types ────────────────────────────────────────────────────────────────

export type ErrorType = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: Record<string, string[]>;
  originalError?: unknown;
}

// ── Error Classification ───────────────────────────────────────────────────────

export function classifyError(error: unknown): ApiError {
  if (typeof error === 'string') {
    return { type: 'unknown', message: error };
  }

  if (error instanceof Error) {
    // Axios error
    if ('response' in error) {
      const axiosError = error as { response?: { status: number; data?: unknown }; code?: string };
      const status = axiosError.response?.status;

      if (!axiosError.response) {
        // Network error (no response received)
        return {
          type: 'network',
          message: axiosError.code === 'ECONNABORTED'
            ? 'Request timed out. Please check your connection.'
            : 'Network error. Please check your internet connection.',
          originalError: error,
        };
      }

      if (status === 401 || status === 403) {
        return {
          type: 'auth',
          message: 'Session expired. Please sign in again.',
          statusCode: status,
          originalError: error,
        };
      }

      if (status === 400 || status === 422) {
        const data = axiosError.response?.data as Record<string, unknown>;
        return {
          type: 'validation',
          message: (data?.message as string) ?? 'Invalid input. Please check your data.',
          statusCode: status,
          details: data?.errors as Record<string, string[]>,
          originalError: error,
        };
      }

      if (status && status >= 500) {
        return {
          type: 'server',
          message: 'Server error. Please try again later.',
          statusCode: status,
          originalError: error,
        };
      }
    }

    return {
      type: 'unknown',
      message: error.message ?? 'An unexpected error occurred.',
      originalError: error,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    originalError: error,
  };
}

// ── User-Friendly Messages ─────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: 'No internet connection. Please check your network settings.',
  auth: 'Your session has expired. Please sign in again.',
  validation: 'Please check your input and try again.',
  server: 'Something went wrong on our end. Please try again later.',
  unknown: 'An unexpected error occurred. Please try again.',
};

export function getUserMessage(error: unknown): string {
  const apiError = classifyError(error);
  return apiError.message || ERROR_MESSAGES[apiError.type];
}

// ── Retry with Exponential Backoff ─────────────────────────────────────────────

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay, backoffMultiplier, retryableStatuses } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry auth errors or validation errors
      const apiError = classifyError(error);
      if (apiError.type === 'auth' || apiError.type === 'validation') {
        throw error;
      }

      // Check if this is a retryable error
      const statusCode = (error as any)?.response?.status;
      const isRetryable =
        !statusCode || // Network error (no status)
        retryableStatuses.includes(statusCode);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.3 * delay;
      await sleep(Math.min(delay + jitter, maxDelay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError;
}

// ── Error Logger Hook ──────────────────────────────────────────────────────────

/**
 * Logs errors to console in dev, and to monitoring service in production.
 * Replace the production logger with your preferred service (Sentry, LogRocket).
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Error]', error.message, context ?? '');
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    // Production logging — replace with Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: context });
    console.error('[Error]', error.message);
  }
}
