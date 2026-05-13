import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireVendor } from '../middleware/auth';
import { updateVendorProfileSchema, withdrawSchema, paginationSchema } from '../validators';
import { success, paginated, error } from '../utils/response';

export const getVendorProfile = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };

  let profile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        shopName: 'My Shop',
        slug: `shop-${user.id.slice(0, 8)}`,
      },
    });
  }

  return success(profile);
});

export const updateVendorProfile = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const parsed = updateVendorProfileSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const profile = await prisma.vendorProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      shopName: parsed.data.shopName,
      slug: parsed.data.shopName.toLowerCase().replace(/\s+/g, '-') + '-' + user.id.slice(0, 6),
      description: parsed.data.description,
      logo: parsed.data.logo,
      banner: parsed.data.banner,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      phone: parsed.data.phone,
    },
    update: parsed.data,
  });

  return success(profile);
});

export const getVendorStats = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Vendor profile not found' };
  }

  const [totalProducts, totalOrdersResult, pendingOrdersResult, earningsResult] = await Promise.all([
    prisma.product.count({ where: { vendorId: profile.id, isDeleted: false } }),
    prisma.order.findMany({
      where: {
        items: { some: { product: { vendorId: profile.id } } },
      },
      select: { id: true },
    }),
    prisma.order.findMany({
      where: {
        items: { some: { product: { vendorId: profile.id } } },
        status: 'pending',
      },
      select: { id: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        order: {
          items: { some: { product: { vendorId: profile.id } } },
        },
        status: 'success',
      },
    }),
  ]);

  return success({
    totalProducts,
    totalOrders: totalOrdersResult.length,
    pendingOrders: pendingOrdersResult.length,
    totalEarnings: earningsResult._sum.amount || 0,
  });
});

export const getVendorProducts = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return success([]);
  }

  const products = await prisma.product.findMany({
    where: { vendorId: profile.id, isDeleted: false },
    include: { images: { orderBy: { order: 'asc' } }, category: true },
    orderBy: { createdAt: 'desc' },
  });

  return success(products);
});

export const createVendorProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Vendor profile not found. Set up your shop first.' };
  }

  const { name, description, price, categoryId, quantity, stock, images } = body;

  if (!name || price === undefined || !categoryId) {
    setResponseStatus(event, 400);
    return { success: false, error: 'name, price, and categoryId are required' };
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      description: description || '',
      price,
      stock: quantity ?? stock ?? 0,
      categoryId,
      vendorId: profile.id,
      isActive: true,
      images: {
        create: (images || []).map((url: string, i: number) => ({
          url,
          isPrimary: i === 0,
          order: i,
        })),
      },
    },
    include: { images: true, category: true },
  });

  return success(product);
});

export const updateVendorProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.isDeleted) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Product not found' };
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name, slug: body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: { images: true, category: true },
  });

  return success(updated);
});

export const deleteVendorProduct = eventHandler(async (event) => {
  await requireVendor(event);
  const id = getRouterParam(event, 'id');

  await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });

  return success({ message: 'Product deleted' });
});

export const getVendorOrders = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const query = getQuery(event);

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return success([]);
  }

  const status = query.status as string | undefined;
  const statusFilter: any = {};
  if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
    statusFilter.status = status;
  }

  const orders = await prisma.order.findMany({
    where: {
      ...statusFilter,
      items: { some: { product: { vendorId: profile.id } } },
    },
    include: {
      items: {
        where: { product: { vendorId: profile.id } },
        include: { product: { include: { images: { take: 1, orderBy: { order: 'asc' } } } } },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return success(orders);
});

export const getVendorOrderDetail = eventHandler(async (event) => {
  await requireVendor(event);
  const orderId = getRouterParam(event, 'id');
  const user = event.context.user as { id: string };

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Vendor profile not found' };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { include: { images: { take: 1, orderBy: { order: 'asc' } } } } },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Order not found' };
  }

  const hasVendorItem = order.items.some(item => item.product?.vendorId === profile.id);
  if (!hasVendorItem) {
    setResponseStatus(event, 403);
    return { success: false, error: 'Forbidden' };
  }

  return success(order);
});

export const updateVendorOrderStatus = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const orderId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { status: newStatus } = body;

  if (!newStatus || !['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(newStatus)) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Invalid status' };
  }

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Vendor profile not found' };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { vendorId: true } } } } },
  });
  if (!order) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Order not found' };
  }

  // Verify this order contains items from this vendor
  const hasVendorItem = order.items.some(item => item.product?.vendorId === profile.id);
  if (!hasVendorItem) {
    setResponseStatus(event, 403);
    return { success: false, error: 'Forbidden: this order does not belong to your shop' };
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { items: true, shippingAddress: true },
  });

  return success(updated);
});

export const getVendorEarnings = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return success({ totalEarnings: 0, pendingPayout: 0, balance: 0, transactions: [] });
  }

  const payments = await prisma.payment.findMany({
    where: {
      status: 'success',
      order: { items: { some: { product: { vendorId: profile.id } } } },
    },
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

  const transactions = payments.map(p => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    type: 'sale' as const,
    reference: p.paystackRef,
    orderNumber: p.order?.orderNumber,
    paidAt: p.paidAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  return success({
    totalEarnings,
    pendingPayout: profile.pendingPayout,
    balance: totalEarnings - profile.pendingPayout,
    transactions,
  });
});

export const withdrawFunds = eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Vendor profile not found' };
  }

  const payments = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: 'success',
      order: { items: { some: { product: { vendorId: profile.id } } } },
    },
  });

  const availableBalance = (payments._sum.amount || 0) - profile.pendingPayout;

  if (parsed.data.amount > availableBalance) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Insufficient balance' };
  }

  await prisma.vendorProfile.update({
    where: { userId: user.id },
    data: { pendingPayout: profile.pendingPayout + parsed.data.amount },
  });

  return success({ message: 'Withdrawal request submitted', amount: parsed.data.amount });
});
