import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { success, error } from '../utils/response';

export const getActiveStories = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  // Get stories that haven't expired, grouped by user
  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      views: { select: { viewerId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by user and include whether current user has viewed
  const grouped = new Map<string, { user: { id: string; name: string; image: string | null }; stories: any[] }>();
  for (const story of stories) {
    const key = story.userId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        user: story.user,
        stories: [],
      });
    }
    grouped.get(key)!.stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      caption: story.caption,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
      viewed: story.views.some((v) => v.viewerId === user.id),
      viewCount: story.views.length,
    });
  }

  const result = Array.from(grouped.values()).map((g) => ({
    ...g,
    allViewed: g.stories.every((s: any) => s.viewed),
  }));

  return success(result);
});

export const createStory = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  if (!body?.mediaUrl) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'mediaUrl is required');
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const story = await prisma.story.create({
    data: {
      userId: user.id,
      mediaUrl: body.mediaUrl,
      caption: body.caption ?? null,
      expiresAt,
    },
  });

  return success(story);
});

export const viewStory = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const storyId = getRouterParam(event, 'id');

  if (!storyId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Story ID is required');
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Story not found');
  }

  // Upsert view
  await prisma.storyView.upsert({
    where: { storyId_viewerId: { storyId, viewerId: user.id } },
    create: { storyId, viewerId: user.id },
    update: {},
  });

  return success({ ok: true });
});

export const deleteStory = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const storyId = getRouterParam(event, 'id');

  if (!storyId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Story ID is required');
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Story not found');
  }
  if (story.userId !== user.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Not your story');
  }

  await prisma.story.delete({ where: { id: storyId } });
  return success({ ok: true });
});
