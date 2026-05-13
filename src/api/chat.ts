import { apiClient } from '@/lib/api-client';
import type { Conversation, Message, PaginatedResponse } from '@/types';

export const getConversations = async () => {
  return apiClient.get<Conversation[]>('/conversations');
};

export const getOrCreateConversation = async (data: { otherUserId: string; orderId?: string }) => {
  return apiClient.post<Conversation>('/conversations', data);
};

export const getMessages = async (conversationId: string, page = 1) => {
  return apiClient.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages?page=${page}&pageSize=50`);
};

export const sendMessage = async (conversationId: string, content: string) => {
  return apiClient.post<Message>(`/conversations/${conversationId}/messages`, { content });
};

export const markConversationRead = async (conversationId: string) => {
  return apiClient.patch<{ ok: boolean }>(`/conversations/${conversationId}/read`);
};
