import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth, requireVendor } from '../middleware/auth';
import { createOrderSchema, updateOrderStatusSchema, paginationSchema } from '../validators';
import { success, paginated, error } from '../utils/response';

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `BEX-${ts}-${rand}`;
}

export const createOrder = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Cart is empty' };
  }

  const shippingAddress = await prisma.shippingAddress.findUnique({
    where: { id: parsed.data.shippingAddressId },
  });
  if (!shippingAddress) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Shipping address not found' };
  }

  const subtotal = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 200 ? 0 : 15;
  const tax = subtotal * 0.075;
  const total = subtotal + shippingFee + tax;

  const order = await prisma.$transaction(async (tx: typeof prisma) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        subtotal,
        shippingFee,
        tax,
        total,
        shippingAddressId: shippingAddress.id,
        items: {
          create: cart.items.map((item: { productId: string; productName: string; product: { slug: string; images?: { url: string }[] }; price: number; quantity: number }) => ({
            productId: item.productId,
            productName: item.productName,
            productSlug: item.product.slug,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            imageUrl: item.product.images?.[0]?.url ?? null,
          })),
        },
      },
      include: { items: true, shippingAddress: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return success(order);
});

export const getUserOrders = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const query = getQuery(event);

  const parsed = paginationSchema.safeParse(query);
  const page = parsed.success ? parsed.data.page : 1;
  const pageSize = parsed.success ? parsed.data.pageSize : 20;

  const status = query.status as string | undefined;
  const where: any = { userId: user.id };
  if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, shippingAddress: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return paginated(orders, {
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  });
});

export const getOrderById = eventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const user = event.context.user as { id: string; role: string };

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Order ID is required' };
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true },
  });

  if (!order) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Order not found' };
  }

  if (order.userId !== user.id && user.role !== 'vendor') {
    setResponseStatus(event, 403);
    return { success: false, error: 'Forbidden' };
  }

  return success(order);
});

export const getOrderTracking = eventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const user = event.context.user as { id: string; role: string };

  if (!id) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Order ID is required');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, images: true } } },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Order not found');
  }
  if (order.userId !== user.id && user.role !== 'vendor') {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden');
  }

  const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const currentIdx = statusFlow.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  const timeline = statusFlow.filter((s) => s !== 'cancelled').map((status, idx) => ({
    status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    completed: !isCancelled && idx <= currentIdx,
    active: !isCancelled && idx === currentIdx,
    date: idx === currentIdx ? order.updatedAt : idx < currentIdx ? order.updatedAt : null,
  }));

  return success({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippingAddress: {
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
    },
    items: order.items.map((item: { id: string; productName: string; price: number; quantity: number; total: number; imageUrl: string | null; product?: { images?: { url: string }[] } | null }) => ({
      id: item.id,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      imageUrl: item.imageUrl ?? item.product?.images?.[0]?.url ?? null,
    })),
    timeline,
    estimatedDelivery: order.status === 'shipped'
      ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      : null,
  });
});

export const updateOrderStatus = eventHandler(async (event) => {
  await requireVendor(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Order not found' };
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { items: true, shippingAddress: true },
  });

  return success(updated);
});
