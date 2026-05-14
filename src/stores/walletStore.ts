import { create } from 'zustand';

interface WalletState {
  balanceVisible: boolean;
  toggleBalanceVisibility: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balanceVisible: true,
  toggleBalanceVisibility: () =>
    set((state) => ({ balanceVisible: !state.balanceVisible })),
}));
