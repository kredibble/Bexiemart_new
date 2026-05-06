import client from './client';
import { Order, OrderStatus, EarningsData } from '@/types';

export const getVendorOrders = async (status?: OrderStatus) => {
  const res = await client.get<Order[]>('/vendor/orders', {
    params: status ? { status } : undefined,
  });
  return res.data;
};

export const getOrderDetail = async (orderId: string) => {
  const res = await client.get<Order>(`/vendor/orders/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const res = await client.patch<Order>(`/vendor/orders/${orderId}/status`, {
    status,
  });
  return res.data;
};

export const getVendorEarnings = async () => {
  const res = await client.get<EarningsData>('/vendor/earnings');
  return res.data;
};

export const withdraw = async (data: {
  amount: number;
  destination: 'bank' | 'momo';
}) => {
  const res = await client.post('/vendor/withdraw', data);
  return res.data;
};
