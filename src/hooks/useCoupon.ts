import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as couponApi from '@/api/coupons';
import type { Coupon } from '@/types';

export function useValidateCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const mutation = useMutation({
    mutationFn: ({ code, cartTotal }: { code: string; cartTotal: number }) =>
      couponApi.validateCoupon(code, cartTotal),
    onSuccess: (result) => {
      if (result.valid && result.coupon) {
        const coupon: Coupon = {
          id: result.coupon.id,
          code: result.coupon.code,
          discountPercent: result.coupon.discountPercent,
          maxUses: 0,
          currentUses: 0,
          isActive: true,
          expiresAt: '',
        };
        setAppliedCoupon(coupon);
        setDiscountAmount(result.discountAmount ?? 0);
      }
    },
  });

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  }, []);

  return {
    validateCoupon: mutation,
    appliedCoupon,
    discountAmount,
    clearCoupon,
  };
}
