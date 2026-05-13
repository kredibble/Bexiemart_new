import { eventHandler, readBody, getRouterParam, setResponseStatus } from 'h3';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { addToCartSchema, updateCartItemSchema } from '../validators';
import { success, error } from '../utils/response';

export const getCart = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    return success({ id: null, items: [], subtotal: 0, itemCount: 0 });
  }

  const subtotal = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return success({
    id: cart.id,
    items: cart.items,
    subtotal,
    itemCount,
  });
});

export const addToCart = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const body = await readBody(event);

  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId, isDeleted: false } });
  if (!product) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Product not found' };
  }

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, price: product.price },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        productName: product.name,
        price: product.price,
        quantity,
      },
    });
  }

  return success({ message: 'Item added to cart' });
});

export const updateCartItem = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });
  if (!item) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Cart item not found' };
  }

  // Ownership check: item must belong to the current user's cart
  if (item.cart.userId !== user.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden: not your cart item');
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
  });

  return success({ message: 'Cart item updated' });
});

export const removeFromCart = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Item ID is required' };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });
  if (!item) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Cart item not found' };
  }

  // Ownership check
  if (item.cart.userId !== user.id) {
    setResponseStatus(event, 403);
    return error(event as any, 403, 'Forbidden: not your cart item');
  }

  await prisma.cartItem.delete({ where: { id } });
  return success({ message: 'Item removed from cart' });
});

export const clearCart = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };

  await prisma.cartItem.deleteMany({
    where: { cart: { userId: user.id } },
  });

  return success({ message: 'Cart cleared' });
});
