import { useMutation } from '@tanstack/react-query';
import * as cartApi from '@/api/cart';
import { useCartStore } from '@/stores/cartStore';

export function useAddToCart() {
  const { increment } = useCartStore();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      increment();
    },
  });
}

export function useGetCart() {
  return useMutation({
    mutationFn: cartApi.getCart,
  });
}

export function useRemoveFromCart() {
  return useMutation({
    mutationFn: cartApi.removeFromCart,
  });
}
