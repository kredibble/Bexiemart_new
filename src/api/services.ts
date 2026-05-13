import { apiClient } from '@/lib/api-client';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  rating: number;
  vendorName?: string;
  estimatedDuration?: string;
}

export interface ServicesParams {
  category?: string;
  search?: string;
}

export const getServices = async (params?: ServicesParams) => {
  const query = new URLSearchParams({
    category: params?.category ?? '',
    search: params?.search ?? '',
  }).toString();
  return apiClient.get<ServiceItem[]>(`/services?${query}`);
};

export const getServiceById = async (serviceId: string) => {
  return apiClient.get<ServiceItem>(`/services/${serviceId}`);
};
