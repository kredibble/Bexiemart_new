import { apiClient } from '@/lib/api-client';
import type { CouponValidationResult, Coupon } from '@/types';

export const validateCoupon = async (code: string, cartTotal?: number) => {
  return apiClient.post<CouponValidationResult>('/coupons/validate', { code, cartTotal });
};

// Vendor Coupon API
export const getVendorCoupons = () => apiClient.get<Coupon[]>('/vendor/coupons');

export const createVendorCoupon = (data: {
  code: string;
  discountPercent: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt: string;
}) => apiClient.post<Coupon>('/vendor/coupons', data);

export const updateVendorCoupon = (id: string, data: Partial<{
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  maxUses: number;
  isActive: boolean;
  expiresAt: string;
}>) => apiClient.put<Coupon>(`/vendor/coupons/${id}`, data);

export const deleteVendorCoupon = (id: string) => apiClient.delete(`/vendor/coupons/${id}`);
