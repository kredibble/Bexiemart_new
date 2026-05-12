/**
 * Order Routes — Order management for BexieMart.
 *
 * GET    /api/orders                    — Get current user's orders
 * GET    /api/orders/:id                — Get order by ID
 * POST   /api/orders                    — Create new order from cart
 * PUT    /api/orders/:id/status         — Update order status (vendor)
 */
import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import crypto from 'crypto';

// ─── Create Order ────────────────────────────────────────────────────────────────

interface CreateOrderBody {
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingAddress: Record<string, string>;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export const createOrder = eventHandler(async (event) => {
  const body = await readBody<CreateOrderBody>(event);

  if (!body) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Request body is required' };
  }

  const { items, shippingAddress, subtotal, shippingFee, tax, total } = body;

  if (!items || items.length === 0) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Order must contain at least one item' };
  }

  if (!shippingAddress) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Shipping address is required' };
  }

  const orderNumber = `BEX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  return {
    success: true,
    order: {
      id: crypto.randomUUID(),
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal,
      shippingFee,
      tax,
      total,
      shippingAddress,
      items,
      createdAt: new Date().toISOString(),
    },
  };
});

// ─── Get User Orders ─────────────────────────────────────────────────────────────

export const getUserOrders = eventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;

  return {
    orders: [],
    page,
    pageSize,
    total: 0,
  };
});

// ─── Get Order By ID ─────────────────────────────────────────────────────────────

export const getOrderById = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Order ID is required' };
  }

  return {
    id,
    orderNumber: 'BEX-PLACEHOLDER',
    status: 'pending',
    paymentStatus: 'pending',
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
    items: [],
    shippingAddress: {},
    createdAt: new Date().toISOString(),
  };
});

// ─── Update Order Status ────────────────────────────────────────────────────────

export const updateOrderStatus = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody<{ status: string }>(event);

  if (!body) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Request body is required' };
  }

  const { status } = body;

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Order ID is required' };
  }

  if (!status) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Status is required' };
  }

  return { success: true, orderId: id, status };
});
