import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productsApi from '@/api/products';
import * as wishlistApi from '@/api/wishlist';
import type { ProductsParams } from '@/api/products';
import type { WishlistItem, Product, Category, PaginatedResponse } from '@/types';

export function useProducts(params?: Omit<ProductsParams, 'page' | 'pageSize'>) {
  return useInfiniteQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: ({ pageParam }) =>
      productsApi.getProducts({
        ...params,
        page: pageParam as number,
        pageSize: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: !!productId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
