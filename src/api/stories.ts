import { apiClient } from '@/lib/api-client';
import type { StoryGroup, StoryItem } from '@/types';

export const getActiveStories = async () => {
  return apiClient.get<StoryGroup[]>('/stories');
};

export const createStory = async (data: { mediaUrl: string; caption?: string }) => {
  return apiClient.post<StoryItem>('/stories', data);
};

export const viewStory = async (storyId: string) => {
  return apiClient.post<{ ok: boolean }>(`/stories/${storyId}/view`);
};

export const deleteStory = async (storyId: string) => {
  return apiClient.delete<{ ok: boolean }>(`/stories/${storyId}`);
};
