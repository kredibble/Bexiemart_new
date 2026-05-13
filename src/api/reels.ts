import { apiClient } from '@/lib/api-client';

export interface Reel {
  id: string;
  thumbnail: string;
  videoUrl?: string;
  user: string;
  userAvatar?: string;
  caption: string;
  likes: number;
  isLiked?: boolean;
  comments?: number;
}

export const getReels = async () => {
  return apiClient.get<Reel[]>('/reels');
};

export const likeReel = async (reelId: string) => {
  return apiClient.post(`/reels/${reelId}/like`);
};

export const unlikeReel = async (reelId: string) => {
  return apiClient.delete(`/reels/${reelId}/like`);
};
