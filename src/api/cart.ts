/**
 * Cart API — Shopping cart management.
 */
import { apiClient } from '@/lib/api-client';
import type { Cart } from '@/types';

export const addToCart = async (data: {
  productId: string;
  quantity: number;
}) => {
  return apiClient.post('/cart/items', data);
};

export const getCart = async () => {
  return apiClient.get<Cart>('/cart');
};

export const removeFromCart = async (cartItemId: string) => {
  return apiClient.delete(`/cart/items/${cartItemId}`);
};
