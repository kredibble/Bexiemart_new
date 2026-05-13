import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { success, paginated } from '../utils/response';

export const getProductReviews = eventHandler(async (event) => {
  const productId = getRouterParam(event, 'productId');
  if (!productId) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Product ID is required' };
  }

  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return paginated(reviews, {
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  });
});

export const createReview = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const { productId, rating, comment } = body;
  if (!productId || rating === undefined) {
    setResponseStatus(event, 400);
    return { success: false, error: 'productId and rating are required' };
  }

  if (rating < 1 || rating > 5) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Rating must be between 1 and 5' };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Product not found' };
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    setResponseStatus(event, 409);
    return { success: false, error: 'You have already reviewed this product' };
  }

  const review = await prisma.review.create({
    data: { userId: user.id, productId, rating, comment },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return success(review);
});
