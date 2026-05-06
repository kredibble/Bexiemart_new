import client from './client';
import { Product, Category, PaginatedResponse } from '@/types';

export interface ProductsParams {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getProducts = async (params?: ProductsParams) => {
  const res = await client.get<PaginatedResponse<Product>>('/products', {
    params: {
      category: params?.category,
      search: params?.search,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });
  return res.data;
};

export const getProduct = async (productId: string) => {
  const res = await client.get<Product>(`/products/${productId}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await client.get<Category[]>('/categories');
  return res.data;
};
