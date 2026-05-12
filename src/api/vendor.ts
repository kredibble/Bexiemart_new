/**
 * Vendor API — Vendor-specific endpoints for products, orders, earnings.
 */
import { apiClient } from '@/lib/api-client';
import type { Product, Order, OrderStatus, EarningsData } from '@/types';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  quantity: number;
  color?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  images: string[];
  deliveryOptions: { type: string; fee: number; duration: number; unit: string }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  pendingOrders: number;
}

export const getVendorStats = async (): Promise<VendorStats> => {
  return apiClient.get<VendorStats>('/vendor/stats');
};

export const getVendorProducts = async (): Promise<Product[]> => {
  return apiClient.get<Product[]>('/vendor/products');
};

export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  return apiClient.post<Product>('/vendor/products', data);
};

export const updateProduct = async (id: string, data: UpdateProductDto): Promise<Product> => {
  return apiClient.put<Product>(`/vendor/products/${id}`, data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/vendor/products/${id}`);
};

export const getVendorOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<Order[]>(`/vendor/orders${query}`);
};

export const getOrderDetail = async (orderId: string): Promise<Order> => {
  return apiClient.get<Order>(`/vendor/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  return apiClient.patch<Order>(`/vendor/orders/${orderId}/status`, { status });
};

export const getVendorEarnings = async (): Promise<EarningsData> => {
  return apiClient.get<EarningsData>('/vendor/earnings');
};

export const withdraw = async (data: { amount: number; destination: 'bank' | 'momo' }) => {
  return apiClient.post('/vendor/withdraw', data);
};

export const updateShopProfile = async (data: {
  shopName?: string;
  shopDescription?: string;
  location?: string;
  contact?: string;
  deliveryRange?: number;
  logo?: string;
}) => {
  return apiClient.patch('/vendor/profile', data);
};
