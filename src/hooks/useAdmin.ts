import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminOverview, getAdminUsers, getAdminUserDetail, updateUserRole,
  getAdminVendors, toggleVendorStatus,
  getAdminOrders, getAdminProducts, toggleProductStatus,
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  getAdminReports, getDeliveryHistory,
} from '@/api/admin';
import type { AdminOverview, AdminUser, AdminVendor, AdminOrder, AdminProduct, AdminCategory } from '@/api/admin';

export function useAdminOverview() {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: getAdminOverview });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: getAdminUsers });
}

export function useAdminUserDetail(id: string) {
  return useQuery({ queryKey: ['admin', 'users', id], queryFn: () => getAdminUserDetail(id), enabled: !!id });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
  });
}

export function useAdminVendors() {
  return useQuery({ queryKey: ['admin', 'vendors'], queryFn: getAdminVendors });
}

export function useToggleVendorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleVendorStatus(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }); },
  });
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => getAdminOrders(status),
  });
}

export function useAdminProducts() {
  return useQuery({ queryKey: ['admin', 'products'], queryFn: getAdminProducts });
}

export function useToggleProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductStatus(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); },
  });
}

export function useAdminCategories() {
  return useQuery({ queryKey: ['admin', 'categories'], queryFn: getAdminCategories });
}

export function useCreateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; image?: string }) => createAdminCategory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); },
  });
}

export function useUpdateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; image?: string } }) => updateAdminCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); },
  });
}

export function useDeleteAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); },
  });
}

export function useAdminReports() {
  return useQuery({ queryKey: ['admin', 'reports'], queryFn: getAdminReports });
}

export function useDeliveryHistory() {
  return useQuery({ queryKey: ['admin', 'deliveries'], queryFn: getDeliveryHistory });
}
