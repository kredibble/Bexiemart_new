import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storiesApi from '@/api/stories';

export function useActiveStories() {
  return useQuery({
    queryKey: ['active-stories'],
    queryFn: storiesApi.getActiveStories,
    refetchInterval: 30_000,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
    },
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesApi.viewStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesApi.deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
    },
  });
}
