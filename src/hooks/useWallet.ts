import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletApi from '@/api/wallet';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: walletApi.getWalletTransactions,
  });
}

export function useTopUpWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.topUpWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}

export function useWithdrawFromWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdrawFromWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}
