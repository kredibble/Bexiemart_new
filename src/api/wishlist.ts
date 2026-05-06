import client from './client';
import { WishlistItem } from '@/types';

export const getWishlist = async () => {
  const res = await client.get<WishlistItem[]>('/wishlist');
  return res.data;
};

export const addToWishlist = async (productId: string) => {
  const res = await client.post<WishlistItem>('/wishlist', { productId });
  return res.data;
};

export const removeFromWishlist = async (wishlistId: string) => {
  const res = await client.delete(`/wishlist/${wishlistId}`);
  return res.data;
};
