import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as vendorApi from '@/api/vendor';
import type { OrderStatus } from '@/types';

export function useVendorOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['vendor-orders', status],
    queryFn: () => vendorApi.getVendorOrders(status),
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => vendorApi.getOrderDetail(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      vendorApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
    },
  });
}

export function useVendorEarnings() {
  return useQuery({
    queryKey: ['vendor-earnings'],
    queryFn: vendorApi.getVendorEarnings,
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-earnings'] });
    },
  });
}
