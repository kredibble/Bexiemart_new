/**
 * Wishlist API — User wishlist management.
 */
import { apiClient } from '@/lib/api-client';
import type { WishlistItem } from '@/types';

export const getWishlist = async () => {
  return apiClient.get<WishlistItem[]>('/wishlist');
};

export const addToWishlist = async (productId: string) => {
  return apiClient.post<WishlistItem>('/wishlist', { productId });
};

export const removeFromWishlist = async (wishlistId: string) => {
  return apiClient.delete(`/wishlist/${wishlistId}`);
};
