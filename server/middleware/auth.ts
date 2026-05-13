import { eventHandler, createError } from 'h3';
import { getAuth } from '../auth';

export const requireAuth = eventHandler(async (event) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: event.headers });

  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  event.context.user = session.user;
  event.context.session = session.session;
});

export const requireVendor = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string; role: string };
  if (user.role !== 'vendor') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Vendor access required' });
  }
});

export const requireAdmin = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string; role: string };
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' });
  }
});

export const optionalAuth = eventHandler(async (event) => {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: event.headers });
    if (session) {
      event.context.user = session.user;
      event.context.session = session.session;
    }
  } catch {
    // No session — continue without user context
  }
});
