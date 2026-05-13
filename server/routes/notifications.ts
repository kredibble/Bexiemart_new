import { eventHandler, readBody, getRouterParam, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { success, paginated } from '../utils/response';

export const getNotifications = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return success(notifications);
});

export const markAsRead = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Notification ID is required' };
  }

  // Ownership check: only the owner can mark as read
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Notification not found' };
  }
  if (notification.userId !== user.id) {
    setResponseStatus(event, 403);
    return { success: false, error: 'Forbidden: not your notification' };
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return success(updated);
});

export const markAllAsRead = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  return success({ message: 'All notifications marked as read' });
});

export const createNotificationData = {
  async create(userId: string, title: string, message: string, type: 'order' | 'payment' | 'shipping' | 'promotion' | 'system', data?: Record<string, unknown>) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data ? JSON.stringify(data) : undefined,
      },
    });
  },
};
