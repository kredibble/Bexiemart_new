/**
 * Cart Routes — Shopping cart management for BexieMart.
 *
 * GET    /api/cart               — Get current user's cart
 * POST   /api/cart/items         — Add item to cart
 * PUT    /api/cart/items/:id     — Update cart item quantity
 * DELETE /api/cart/items/:id     — Remove item from cart
 * DELETE /api/cart               — Clear cart
 */
import { eventHandler, readBody, getRouterParam, setResponseStatus } from 'h3';
import crypto from 'crypto';

// ─── Get Cart ───────────────────────────────────────────────────────────────────

export const getCart = eventHandler(async (event) => {
  return {
    id: 'temp-cart-id',
    items: [],
    subtotal: 0,
    itemCount: 0,
  };
});

// ─── Add to Cart ────────────────────────────────────────────────────────────────

export const addToCart = eventHandler(async (event) => {
  const body = await readBody(event);
  const { productId, quantity = 1 } = body;

  if (!productId) {
    setResponseStatus(event, 400);
    return { success: false, error: 'productId is required' };
  }

  return {
    success: true,
    item: {
      id: crypto.randomUUID(),
      productId,
      quantity,
    },
  };
});

// ─── Update Cart Item ───────────────────────────────────────────────────────────

export const updateCartItem = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { quantity } = body;

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Item ID is required' };
  }

  if (quantity === undefined) {
    setResponseStatus(event, 400);
    return { success: false, error: 'quantity is required' };
  }

  return { success: true, itemId: id, quantity };
});

// ─── Remove from Cart ───────────────────────────────────────────────────────────

export const removeFromCart = eventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Item ID is required' };
  }

  return { success: true, itemId: id };
});

// ─── Clear Cart ──────────────────────────────────────────────────────────────────

export const clearCart = eventHandler(async (event) => {
  return { success: true, message: 'Cart cleared' };
});
