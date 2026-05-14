/**
 * Orders API — Create, list, and manage orders.
 */
import { apiClient } from '@/lib/api-client';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  address: string;
  contact: string;
  deliveryOptionId: string;
  paymentMethod: 'card' | 'mobile_money';
  couponCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export const createOrder = async (data: CreateOrderDto) => {
  return apiClient.post<Order>('/orders', data);
};

export const getOrders = async (params?: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  query.append('page', String(params?.page ?? 1));
  query.append('pageSize', String(params?.pageSize ?? 20));
  
  return apiClient.get<PaginatedResponse<Order>>(`/orders?${query.toString()}`);
};

export const getOrder = async (orderId: string) => {
  return apiClient.get<Order>(`/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId: string, data: UpdateOrderStatusDto) => {
  return apiClient.patch<Order>(`/orders/${orderId}/status`, data);
};

export const getCustomerOrders = async (params?: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  query.append('page', String(params?.page ?? 1));
  query.append('pageSize', String(params?.pageSize ?? 20));

  return apiClient.get<PaginatedResponse<Order>>(`/orders/customer?${query.toString()}`);
};

export const getVendorOrders = async (params?: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  query.append('page', String(params?.page ?? 1));
  query.append('pageSize', String(params?.pageSize ?? 20));

  return apiClient.get<PaginatedResponse<Order>>(`/orders/vendor?${query.toString()}`);
};
