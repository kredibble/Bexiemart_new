/**
 * Product Routes — RESTful CRUD for products and categories.
 *
 * GET    /api/products?page=1&pageSize=20
 * GET    /api/products/:id
 * POST   /api/products
 * PUT    /api/products/:id
 * DELETE /api/products/:id
 *
 * GET    /api/categories
 * POST   /api/categories
 */
import { eventHandler, getQuery, readBody, getRouterParam } from 'h3';
import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ── Products ─────────────────────────────────────────────────────────────

export const getProducts = eventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;
  const skip = (page - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: pageSize,
      where: { isActive: true, isDeleted: false },
      include: { images: true, category: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { isActive: true, isDeleted: false } }),
  ]);

  return {
    data: products,
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  };
});

export const getProductById = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return { success: false, error: 'Product ID is required' };
  }

  const product = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: { images: true, category: true, vendor: true },
  });

  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  return product;
});

export const createProduct = eventHandler(async (event) => {
  const body = await readBody(event);

  const { name, description, price, categoryId, images, vendorId } = body;

  const product = await prisma.product.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description ?? '',
      price,
      categoryId,
      stock: body.quantity ?? body.stock ?? 0,
      isActive: true,
      isFeatured: false,
      vendorId,
      images: {
        create: images?.map((url: string, i: number) => ({
          url,
          isPrimary: i === 0,
          order: i,
        })) ?? [],
      },
    },
    include: { images: true, category: true, vendor: true },
  });

  return product;
});

export const updateProduct = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name, slug: body.name.toLowerCase().replace(/\s+/g, '-') }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
    },
    include: { images: true, category: true, vendor: true },
  });

  return product;
});

export const deleteProduct = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return { success: false, error: 'Product ID is required' };
  }

  await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { success: true };
});

// ── Categories ────────────────────────────────────────────────────────────

export const getCategories = eventHandler(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return categories;
});

export const createCategory = eventHandler(async (event) => {
  const body = await readBody(event);

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      ...(body.icon && { icon: body.icon }),
      ...(body.description && { description: body.description }),
    },
  });

  return category;
});

// ── Wishlist ──────────────────────────────────────────────────────────────

export const getWishlist = eventHandler(async () => {
  return [];
});

export const addToWishlist = eventHandler(async (event) => {
  const body = await readBody(event);
  return {
    id: crypto.randomUUID(),
    productId: body.productId,
    createdAt: new Date().toISOString(),
  };
});

export const removeFromWishlist = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return { success: true, productId: id };
});
