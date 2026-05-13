import { eventHandler, createError } from 'h3';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyFn?: (event: any) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return eventHandler(async (event) => {
    const keyFn = options.keyFn ?? ((e: any) => {
      const user = e.context?.user;
      if (user?.id) return `user:${user.id}`;
      const ip = e.headers?.get('x-forwarded-for') ?? e.headers?.get('x-real-ip') ?? 'unknown';
      return `ip:${ip}`;
    });

    const key = keyFn(event);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = maxRequests - entry.count;
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    event.node?.res?.setHeader('X-RateLimit-Limit', String(maxRequests));
    event.node?.res?.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
    event.node?.res?.setHeader('X-RateLimit-Reset', String(resetSeconds));

    if (entry.count > maxRequests) {
      event.node?.res?.setHeader('Retry-After', String(resetSeconds));
      throw createError({
        statusCode: 429,
        statusMessage: `Too Many Requests. Retry after ${resetSeconds}s`,
      });
    }
  });
}

// Pre-configured limiters
export const strictRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 10 });
export const moderateRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 30 });
export const generousRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 100 });
