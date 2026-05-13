/**
 * Admin API Routes — Super admin dashboard endpoints for BexieMart.
 */
import { eventHandler, getRouterParam, getQuery, readBody } from 'h3';
import { prisma } from '../db';
import { requireAdmin } from '../middleware/auth';
import { success, error } from '../utils/response';

// ── Dashboard Overview Stats ──────────────────────────────────────────────────

export const getAdminOverview = eventHandler(async (event) => {
  await requireAdmin(event);
  const [totalUsers, totalVendors, totalOrders, totalProducts, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);
  return success({
    totalUsers,
    totalVendors,
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue._sum.total ?? 0,
  });
});

// ── Users ──────────────────────────────────────────────────────────────────────

export const getAdminUsers = eventHandler(async (event) => {
  await requireAdmin(event);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { vendorProfile: true },
  });
  return success(users);
});

export const getAdminUserDetail = eventHandler(async (event) => {
  await requireAdmin(event);
  const userId = getRouterParam(event, 'id');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { vendorProfile: true, orders: { take: 10, orderBy: { createdAt: 'desc' } } },
  });
  if (!user) return error(event, 404, 'User not found');
  return success(user);
});

export const updateUserRole = eventHandler(async (event) => {
  await requireAdmin(event);
  const userId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: body.role },
  });
  return success(user);
});

// ── Vendors ────────────────────────────────────────────────────────────────────

export const getAdminVendors = eventHandler(async (event) => {
  await requireAdmin(event);
  const vendors = await prisma.vendorProfile.findMany({
    include: { user: { select: { id: true, email: true, name: true, image: true } }, _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return success(vendors);
});

export const toggleVendorStatus = eventHandler(async (event) => {
  await requireAdmin(event);
  const vendorId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const vendor = await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: { isActive: body.isActive },
  });
  return success(vendor);
});

// ── Orders ─────────────────────────────────────────────────────────────────────

export const getAdminOrders = eventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const status = query.status as string | undefined;
  const where: any = {};
  if (status) where.status = status;
  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return success(orders);
});

// ── Categories Management ──────────────────────────────────────────────────────

export const getAdminCategories = eventHandler(async (event) => {
  await requireAdmin(event);
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  return success(categories);
});

export const createAdminCategory = eventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const category = await prisma.category.create({ data: { name: body.name, image: body.image } });
  return success(category);
});

export const updateAdminCategory = eventHandler(async (event) => {
  await requireAdmin(event);
  const categoryId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const category = await prisma.category.update({ where: { id: categoryId }, data: body });
  return success(category);
});

export const deleteAdminCategory = eventHandler(async (event) => {
  await requireAdmin(event);
  const categoryId = getRouterParam(event, 'id');
  await prisma.category.delete({ where: { id: categoryId } });
  return success({ deleted: true });
});

// ── Products Management ────────────────────────────────────────────────────────

export const getAdminProducts = eventHandler(async (event) => {
  await requireAdmin(event);
  const products = await prisma.product.findMany({
    include: { vendor: { include: { user: { select: { name: true } } } }, category: true },
    orderBy: { createdAt: 'desc' },
  });
  return success(products);
});

export const toggleProductStatus = eventHandler(async (event) => {
  await requireAdmin(event);
  const productId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const product = await prisma.product.update({
    where: { id: productId },
    data: { isActive: body.isActive },
  });
  return success(product);
});

// ── Reports ────────────────────────────────────────────────────────────────────

export const getAdminReports = eventHandler(async (event) => {
  await requireAdmin(event);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [orders30d, revenueAgg, topProducts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
  ]);
  return success({
    totalRevenue30d: revenueAgg._sum.total ?? 0,
    orderCount30d: orders30d.length,
    recentOrders: orders30d,
    topProductIds: topProducts.map((p) => ({ productId: p.productId, totalSold: p._sum.quantity ?? 0 })),
  });
});

// ── Delivery History ───────────────────────────────────────────────────────────

export const getDeliveryHistory = eventHandler(async (event) => {
  await requireAdmin(event);
  const deliveries = await prisma.order.findMany({
    where: { status: { in: ['shipped', 'delivered'] } },
    include: { user: { select: { name: true, email: true } }, shippingAddress: true, items: { include: { product: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
  return success(deliveries);
});
