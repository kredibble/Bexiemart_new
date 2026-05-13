import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: () => apiClient.get<{ completed: boolean }>('/onboarding'),
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<{ ok: boolean }>('/onboarding/complete'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
}
