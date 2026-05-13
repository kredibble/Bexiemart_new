import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as couponApi from '@/api/coupons';

export function useVendorCoupons() {
  return useQuery({ queryKey: ['vendor', 'coupons'], queryFn: couponApi.getVendorCoupons });
}

export function useCreateVendorCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.createVendorCoupon,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor', 'coupons'] }); },
  });
}

export function useUpdateVendorCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof couponApi.updateVendorCoupon>[1] }) => couponApi.updateVendorCoupon(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor', 'coupons'] }); },
  });
}

export function useDeleteVendorCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.deleteVendorCoupon,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor', 'coupons'] }); },
  });
}
