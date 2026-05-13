import { apiClient } from '@/lib/api-client';
import type { Review, PaginatedResponse } from '@/types';

export const getProductReviews = async (productId: string, page = 1) => {
  return apiClient.get<PaginatedResponse<Review>>(`/products/${productId}/reviews?page=${page}`);
};

export const createReview = async (data: { productId: string; rating: number; comment?: string }) => {
  return apiClient.post<Review>('/reviews', data);
};
