import { useMutation, useQuery } from '@tanstack/react-query';
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
  const setCart = useCartStore((s) => s.setCart);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.getCart();
      setCart(data);
      return data;
    },
  });
}

export function useRemoveFromCart() {
  return useMutation({
    mutationFn: cartApi.removeFromCart,
  });
}
