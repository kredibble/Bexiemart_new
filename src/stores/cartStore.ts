/**
 * CartStore — Zustand store for local cart state.
 *
 * Maintains a local cart count for badge display, plus the full
 * cart data for the CartScreen. Server-synced via TanStack Query
 * mutations in useCart hooks.
 */
import { create } from 'zustand';
import type { Cart, CartItem } from '@/types';

interface CartState {
  /** Badge count (fast local updates, no API wait) */
  itemCount: number;
  /** Full cart data from server */
  cart: Cart | null;
  /** Whether the cart has been initially loaded */
  isLoaded: boolean;

  /** Increment badge count (after addToCart API success) */
  increment: () => void;
  /** Decrement badge count (after removeFromCart API success) */
  decrement: () => void;
  /** Set the full cart from server response */
  setCart: (cart: Cart) => void;
  /** Sync the badge count with server data */
  syncCount: (count: number) => void;
  /** Clear local cart state (on logout) */
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  cart: null,
  isLoaded: false,

  increment: () =>
    set((state) => ({ itemCount: state.itemCount + 1 })),

  decrement: () =>
    set((state) => ({
      itemCount: Math.max(0, state.itemCount - 1),
    })),

  setCart: (cart: Cart) =>
    set({
      cart,
      itemCount: cart.itemCount,
      isLoaded: true,
    }),

  syncCount: (count: number) =>
    set({ itemCount: count }),

  clearCart: () =>
    set({
      cart: null,
      itemCount: 0,
      isLoaded: false,
    }),
}));
