import { useQuery } from '@tanstack/react-query';
import * as servicesApi from '@/api/services';

export function useServices(params?: servicesApi.ServicesParams) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesApi.getServices(params),
  });
}

export function useService(serviceId: string) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesApi.getServiceById(serviceId),
    enabled: !!serviceId,
  });
}
