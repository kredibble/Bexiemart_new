import { eventHandler, getRouterParam, readBody } from 'h3';
import { prisma } from '../db';
import { requireVendor } from '../middleware/auth';
import { success, error } from '../utils/response';

export const getVendorCoupons = eventHandler(async (event) => {
  const vendor = await requireVendor(event);
  const coupons = await prisma.coupon.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  });
  return success(coupons);
});

export const createVendorCoupon = eventHandler(async (event) => {
  const vendor = await requireVendor(event);
  const body = await readBody(event);
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      vendorId: vendor.id,
      discountPercent: body.discountPercent,
      minOrderAmount: body.minOrderAmount ?? 0,
      maxUses: body.maxUses ?? 100,
      expiresAt: new Date(body.expiresAt),
    },
  });
  return success(coupon);
});

export const updateVendorCoupon = eventHandler(async (event) => {
  const vendor = await requireVendor(event);
  const couponId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const existing = await prisma.coupon.findFirst({ where: { id: couponId, vendorId: vendor.id } });
  if (!existing) return error(event, 404, 'Coupon not found');
  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      code: body.code?.toUpperCase(),
      discountPercent: body.discountPercent,
      minOrderAmount: body.minOrderAmount,
      maxUses: body.maxUses,
      isActive: body.isActive,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    },
  });
  return success(coupon);
});

export const deleteVendorCoupon = eventHandler(async (event) => {
  const vendor = await requireVendor(event);
  const couponId = getRouterParam(event, 'id');
  const existing = await prisma.coupon.findFirst({ where: { id: couponId, vendorId: vendor.id } });
  if (!existing) return error(event, 404, 'Coupon not found');
  await prisma.coupon.delete({ where: { id: couponId } });
  return success({ deleted: true });
});
