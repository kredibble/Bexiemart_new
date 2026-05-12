/**
 * Notifications API — User notification management.
 */
import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/types';

export const getNotifications = async () => {
  return apiClient.get<Notification[]>('/notifications');
};

export const markAsRead = async (notificationId: string) => {
  return apiClient.patch(`/notifications/${notificationId}/read`);
};
