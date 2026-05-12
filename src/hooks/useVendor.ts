/**
 * Vendor Hooks — TanStack Query hooks for vendor domain.
 *
 * Stats, products CRUD, orders, earnings, withdrawal, shop profile.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as vendorApi from '@/api/vendor';
import type { OrderStatus } from '@/types';

/* ── Vendor Stats ──────────────────────────────────────────────────────── */

export function useVendorStats() {
  return useQuery({
    queryKey: ['vendor-stats'],
    queryFn: vendorApi.getVendorStats,
    staleTime: 60_000,
  });
}

/* ── Vendor Products ───────────────────────────────────────────────────── */

export function useVendorProducts() {
  return useQuery({
    queryKey: ['vendor-products'],
    queryFn: vendorApi.getVendorProducts,
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: vendorApi.UpdateProductDto }) =>
      vendorApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
  });
}

/* ── Vendor Orders ─────────────────────────────────────────────────────── */

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

/* ── Vendor Earnings ───────────────────────────────────────────────────── */

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

/* ── Shop Profile ──────────────────────────────────────────────────────── */

export function useUpdateShopProfile() {
  return useMutation({
    mutationFn: vendorApi.updateShopProfile,
  });
}
