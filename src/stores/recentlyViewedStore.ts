import { create } from 'zustand';
import type { Product } from '@/types';

const MAX_ITEMS = 20;

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const filtered = state.items.filter((p) => p.id !== product.id);
      return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
    }),
  clearAll: () => set({ items: [] }),
}));
