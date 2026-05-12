/**
 * Cart API — Shopping cart management.
 */
import { apiClient } from '@/lib/api-client';

export const addToCart = async (data: {
  productId: string;
  quantity: number;
}) => {
  return apiClient.post('/cart/items', data);
};

export const getCart = async () => {
  return apiClient.get('/cart');
};

export const removeFromCart = async (cartItemId: string) => {
  return apiClient.delete(`/cart/items/${cartItemId}`);
};
