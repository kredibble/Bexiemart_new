import { eventHandler, getRouterParam, setResponseStatus } from 'h3';
import { optionalAuth } from '../middleware/auth';
import { success, error } from '../utils/response';

interface Reel {
  id: string;
  thumbnail: string;
  user: string;
  userAvatar?: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  comments: number;
}

const reels: Reel[] = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80', user: '@campus_fashion', caption: 'New arrivals this week!', likes: 234, isLiked: false, comments: 12 },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', user: '@tech_hub', caption: 'Unboxing the latest gadgets', likes: 567, isLiked: false, comments: 24 },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80', user: '@foodie_campus', caption: 'Best eats on campus', likes: 892, isLiked: true, comments: 45 },
  { id: '4', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80', user: '@study_essentials', caption: 'Back to school haul', likes: 345, isLiked: false, comments: 8 },
];

export const getReels = eventHandler(async (event) => {
  await optionalAuth(event);
  return success(reels);
});

export const likeReel = eventHandler(async (event) => {
  await optionalAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return error(event, 400, 'Reel ID is required');
  }

  const reel = reels.find((r) => r.id === id);
  if (!reel) {
    setResponseStatus(event, 404);
    return error(event, 404, 'Reel not found');
  }

  if (!reel.isLiked) {
    reel.likes += 1;
    reel.isLiked = true;
  }

  return success(reel);
});

export const unlikeReel = eventHandler(async (event) => {
  await optionalAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return error(event, 400, 'Reel ID is required');
  }

  const reel = reels.find((r) => r.id === id);
  if (!reel) {
    setResponseStatus(event, 404);
    return error(event, 404, 'Reel not found');
  }

  if (reel.isLiked) {
    reel.likes -= 1;
    reel.isLiked = false;
  }

  return success(reel);
});
