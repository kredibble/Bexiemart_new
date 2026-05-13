import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reviewsApi from '@/api/reviews';

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getProductReviews(productId),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.productId] });
    },
  });
}
