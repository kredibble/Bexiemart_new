/**
 * Admin API — Super admin dashboard endpoints.
 */
import { apiClient } from '@/lib/api-client';

export interface AdminOverview {
  totalUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
  vendorProfile?: { id: string; shopName: string; isActive: boolean } | null;
}

export interface AdminVendor {
  id: string;
  shopName: string;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string; image?: string };
  _count: { products: number };
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: Array<{ id: string; productId: string; quantity: number; price: number }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  vendor: { user: { name: string } };
  category: { id: string; name: string };
}

export interface AdminCategory {
  id: string;
  name: string;
  image?: string;
  _count: { products: number };
}

export interface AdminReports {
  totalRevenue30d: number;
  orderCount30d: number;
  recentOrders: Array<{
    id: string;
    orderNumber?: string;
    total: number;
    createdAt: string;
    user?: { name: string };
    items?: Array<{ id: string; productId: string; quantity: number; price: number }>;
  }>;
  topProductIds: Array<{ productId: string; totalSold: number }>;
}

export const getAdminOverview = () => apiClient.get<AdminOverview>('/admin/overview');
export const getAdminUsers = () => apiClient.get<AdminUser[]>('/admin/users');
export const getAdminUserDetail = (id: string) => apiClient.get<AdminUser>(`/admin/users/${id}`);
export const updateUserRole = (id: string, role: string) => apiClient.patch(`/admin/users/${id}/role`, { role });
export const getAdminVendors = () => apiClient.get<AdminVendor[]>('/admin/vendors');
export const toggleVendorStatus = (id: string, isActive: boolean) => apiClient.patch(`/admin/vendors/${id}/status`, { isActive });
export const getAdminOrders = (status?: string) => apiClient.get<AdminOrder[]>(`/admin/orders${status ? `?status=${status}` : ''}`);
export const getAdminProducts = () => apiClient.get<AdminProduct[]>('/admin/products');
export const toggleProductStatus = (id: string, isActive: boolean) => apiClient.patch(`/admin/products/${id}/status`, { isActive });
export const getAdminCategories = () => apiClient.get<AdminCategory[]>('/admin/categories');
export const createAdminCategory = (data: { name: string; image?: string }) => apiClient.post('/admin/categories', data);
export const updateAdminCategory = (id: string, data: { name?: string; image?: string }) => apiClient.put(`/admin/categories/${id}`, data);
export const deleteAdminCategory = (id: string) => apiClient.delete(`/admin/categories/${id}`);
export const getAdminReports = () => apiClient.get<AdminReports>('/admin/reports');
export const getDeliveryHistory = () => apiClient.get('/admin/deliveries');
