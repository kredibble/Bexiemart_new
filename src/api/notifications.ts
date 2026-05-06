import client from './client';
import { Notification } from '@/types';

export const getNotifications = async () => {
  const res = await client.get<Notification[]>('/notifications');
  return res.data;
};

export const markAsRead = async (notificationId: string) => {
  const res = await client.patch(`/notifications/${notificationId}/read`);
  return res.data;
};
