import { eventHandler, readBody, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { optionalAuth } from '../middleware/auth';
import { success, error } from '../utils/response';

export const validateCoupon = eventHandler(async (event) => {
  await optionalAuth(event);
  const body = await readBody(event);
  const { code, cartTotal } = body as { code?: string; cartTotal?: number };

  if (!code || typeof code !== 'string') {
    setResponseStatus(event, 400);
    return error(event, 400, 'Coupon code is required');
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon) {
    return success({ valid: false, error: 'Invalid coupon code' });
  }

  if (!coupon.isActive) {
    return success({ valid: false, error: 'This coupon is no longer active' });
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    return success({ valid: false, error: 'This coupon has expired' });
  }

  if (coupon.currentUses >= coupon.maxUses) {
    return success({ valid: false, error: 'This coupon has reached its usage limit' });
  }

  const discountAmount = cartTotal ? (cartTotal * coupon.discountPercent) / 100 : 0;

  return success({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
    },
    discountAmount,
  });
});
