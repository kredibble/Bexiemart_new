import { eventHandler, getQuery, readBody, getRouterParam, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth, requireVendor, optionalAuth } from '../middleware/auth';
import { addToWishlistSchema } from '../validators';
import { success, paginated, error } from '../utils/response';

export const getProducts = eventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;
  const categoryId = query.categoryId as string | undefined;
  const search = query.search as string | undefined;
  const skip = (page - 1) * pageSize;

  const where: any = { isActive: true, isDeleted: false };
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: pageSize,
      where,
      include: { images: { orderBy: { order: 'asc' } }, category: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return paginated(products, {
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  });
});

export const getProductById = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Product ID is required' };
  }

  const product = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: { images: { orderBy: { order: 'asc' } }, category: true, vendor: true },
  });

  if (!product) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Product not found' };
  }

  return success(product);
});

export const createProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!vendor) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Vendor profile required to create products');
  }

  const body = await readBody(event);
  const { name, description, price, categoryId, images } = body;

  if (!name || price === undefined || !categoryId) {
    setResponseStatus(event, 400);
    return { success: false, error: 'name, price, and categoryId are required' };
  }
  if (typeof price !== 'number' || price <= 0) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Price must be a positive number' };
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      description: description ?? '',
      price,
      categoryId,
      stock: body.quantity ?? body.stock ?? 0,
      isActive: true,
      vendorId: vendor.id,
      deliveryOptions: body.deliveryOptions ?? [],
      images: {
        create: (images || []).map((url: string, i: number) => ({
          url,
          isPrimary: i === 0,
          order: i,
        })),
      },
    },
    include: { images: true, category: true, vendor: true },
  });

  return success(product);
});

export const updateProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Product ID is required');
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Product not found');
  }

  // Only the owning vendor can update
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!vendor || existing.vendorId !== vendor.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden: not your product');
  }

  const body = await readBody(event);

  if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Price must be a positive number');
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name, slug: body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.deliveryOptions !== undefined && { deliveryOptions: body.deliveryOptions }),
    },
    include: { images: true, category: true, vendor: true },
  });

  return success(product);
});

export const deleteProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Product ID is required');
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Product not found');
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!vendor || existing.vendorId !== vendor.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden: not your product');
  }

  await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });

  return success({ message: 'Product deleted' });
});

export const getCategories = eventHandler(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return success(categories);
});

export const createCategory = eventHandler(async (event) => {
  await requireAuth(event);
  const body = await readBody(event);

  if (!body.name) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Category name is required');
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      ...(body.icon && { icon: body.icon }),
      ...(body.description && { description: body.description }),
    },
  });

  return success(category);
});

export const getWishlist = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: true,
          vendor: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return success(items);
});

export const addToWishlist = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const parsed = addToWishlistSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Product not found' };
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
  });

  if (existing) {
    return success({ message: 'Already in wishlist', id: existing.id });
  }

  const item = await prisma.wishlist.create({
    data: { userId: user.id, productId: parsed.data.productId },
  });

  return success(item);
});

export const removeFromWishlist = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Wishlist item ID is required');
  }

  const item = await prisma.wishlist.findUnique({ where: { id } });
  if (!item) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Wishlist item not found');
  }

  // Ownership check: only the owner can delete
  if (item.userId !== user.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden: not your wishlist item');
  }

  await prisma.wishlist.delete({ where: { id } });
  return success({ message: 'Removed from wishlist' });
});
