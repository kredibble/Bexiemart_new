/**
 * Products API — Product catalog and categories.
 */
import { apiClient } from '@/lib/api-client';
import { Product, Category, PaginatedResponse } from '@/types';

export interface ProductsParams {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getProducts = async (params?: ProductsParams) => {
  const query = new URLSearchParams({
    category: params?.category ?? '',
    search: params?.search ?? '',
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 20),
  }).toString();
  return apiClient.get<PaginatedResponse<Product>>(`/products?${query}`);
};

export const getProduct = async (productId: string) => {
  return apiClient.get<Product>(`/products/${productId}`);
};

export const getCategories = async () => {
  return apiClient.get<Category[]>('/categories');
};
