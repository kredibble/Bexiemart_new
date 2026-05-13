import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reelsApi from '@/api/reels';

export function useReels() {
  return useQuery({
    queryKey: ['reels'],
    queryFn: reelsApi.getReels,
  });
}

export function useLikeReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) =>
      isLiked ? reelsApi.unlikeReel(reelId) : reelsApi.likeReel(reelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}
