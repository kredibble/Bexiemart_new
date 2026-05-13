import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { success, paginated, error } from '../utils/response';

export const getConversations = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const mapped = conversations.map((c) => {
    const otherParticipant = c.participants.find((p) => p.userId !== user.id);
    const lastMessage = c.messages[0] ?? null;
    return {
      id: c.id,
      orderId: c.orderId,
      otherUser: otherParticipant?.user ?? null,
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt, isRead: lastMessage.isRead }
        : null,
      unreadCount: 0, // computed below
      updatedAt: c.updatedAt,
    };
  });

  return success(mapped);
});

export const getOrCreateConversation = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);
  const { otherUserId, orderId } = body ?? {};

  if (!otherUserId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'otherUserId is required');
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (existing) return success(existing);

  const conversation = await prisma.conversation.create({
    data: {
      orderId: orderId ?? null,
      participants: {
        createMany: {
          data: [{ userId: user.id }, { userId: otherUserId }],
        },
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return success(conversation);
});

export const getMessages = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const conversationId = getRouterParam(event, 'id');
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Math.min(Number(query.pageSize) || 50, 100);

  if (!conversationId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Conversation ID is required');
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Not a participant');
  }

  const skip = (page - 1) * pageSize;
  const [messages, totalItems] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return paginated(messages.reverse(), {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    hasNextPage: skip + pageSize < totalItems,
    hasPreviousPage: page > 1,
  });
});

export const sendMessage = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const conversationId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!conversationId || !body?.content) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'conversationId and content are required');
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Not a participant');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: body.content,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Create notification for other participants
  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
  });
  if (otherParticipants.length > 0) {
    await prisma.notification.createMany({
      data: otherParticipants.map((p) => ({
        userId: p.userId,
        title: 'New Message',
        message: body.content.slice(0, 100),
        type: 'system',
        data: JSON.stringify({ conversationId, senderName: user.name || 'Someone' }),
      })),
    });
  }

  return success(message);
});

export const markConversationRead = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const conversationId = getRouterParam(event, 'id');

  if (!conversationId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Conversation ID is required');
  }

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, isRead: false },
    data: { isRead: true },
  });

  return success({ ok: true });
});
