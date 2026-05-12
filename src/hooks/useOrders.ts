/**
 * Order & Payment Hooks — TanStack Query mutations and queries.
 *
 * Customer-facing: createOrder, customer orders, single order
 * Payment: initializePayment, verifyPayment
 *
 * Vendor-facing hooks are in useVendor.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '@/api/orders';
import * as paymentsApi from '@/api/payments';
import type { OrderStatus } from '@/types';

/* ── Customer Orders ───────────────────────────────────────────────────── */

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
}

export function useCustomerOrders(params?: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['customer-orders', params?.status, params?.page],
    queryFn: () => ordersApi.getCustomerOrders(params),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
  });
}

/* ── Payments ──────────────────────────────────────────────────────────── */

export function useInitializePayment() {
  return useMutation({
    mutationFn: paymentsApi.initializePayment,
  });
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ['payment-verify', reference],
    queryFn: () => paymentsApi.verifyPayment(reference),
    enabled: !!reference,
  });
}
