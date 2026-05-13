import { eventHandler } from 'h3';

export const securityHeaders = eventHandler((event) => {
  const res = event.node?.res;
  if (!res) return;

  // Skip for OPTIONS preflight
  if (event.node?.req?.method === 'OPTIONS') return;

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: res.cloudinary.com",
      "frame-src https://checkout.paystack.com",
      "connect-src 'self' https: wss:",
    ].join('; ')
  );

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
});

/**
 * OnError handler for h3 app — prevents stack trace leaks.
 * In production, returns a generic message.
 */
export function createOnErrorHandler() {
  return (error: { statusCode?: number; statusMessage?: string; message?: string; stack?: string }, event: any) => {
    console.error('[API Error]', error?.statusCode ?? 500, error?.message ?? error);

    // Don't expose stack traces in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error?.message ?? error?.statusMessage ?? 'Internal server error';

    event.node.res.statusCode = error?.statusCode ?? 500;
    return { success: false, error: message };
  };
}
