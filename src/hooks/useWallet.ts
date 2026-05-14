import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletApi from '@/api/wallet';

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const walletKeys = {
  all: ['wallet'] as const,
  summary: () => ['wallet', 'summary'] as const,
  transactions: () => ['wallet', 'transactions'] as const,
  transaction: (id: string) => ['wallet', 'transactions', id] as const,
  bankAccounts: () => ['wallet', 'bank-accounts'] as const,
  momoAccounts: () => ['wallet', 'momo-accounts'] as const,
  settings: () => ['wallet', 'settings'] as const,
  notifications: () => ['wallet', 'notifications'] as const,
  beneficiaries: () => ['wallet', 'beneficiaries'] as const,
  cards: () => ['wallet', 'cards'] as const,
};

// ── Wallet ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn: walletApi.getWallet,
  });
}

export function useWalletSummary() {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: walletApi.getWalletSummary,
  });
}

// ── Transactions ───────────────────────────────────────────────────────────────

export function useTransactions(params?: walletApi.TransactionQueryParams) {
  return useQuery({
    queryKey: [...walletKeys.transactions(), params],
    queryFn: () => walletApi.getTransactions(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: walletKeys.transaction(id),
    queryFn: () => walletApi.getTransaction(id),
    enabled: !!id,
  });
}

// ── Bank Accounts ──────────────────────────────────────────────────────────────

export function useBankAccounts() {
  return useQuery({
    queryKey: walletKeys.bankAccounts(),
    queryFn: walletApi.getBankAccounts,
  });
}

export function useAddBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.addBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

// ── MoMo Accounts ──────────────────────────────────────────────────────────────

export function useMomoAccounts() {
  return useQuery({
    queryKey: walletKeys.momoAccounts(),
    queryFn: walletApi.getMomoAccounts,
  });
}

export function useAddMomoAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.addMomoAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.momoAccounts() });
    },
  });
}

export function useDeleteMomoAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.deleteMomoAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.momoAccounts() });
    },
  });
}

// ── Top-Up ─────────────────────────────────────────────────────────────────────

export function useTopUpPaystack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.topUpPaystack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

export function useTopUpMomo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.topUpMomo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

// ── Transfer & Withdrawals ─────────────────────────────────────────────────────

export function useTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.transferToUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

export function useWithdrawToBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdrawToBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

export function useWithdrawToMomo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdrawToMomo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

// ── PIN Management ─────────────────────────────────────────────────────────────

export function useSetupPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.setupPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useChangePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.changePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: walletApi.verifyPin,
  });
}

// ── Settings ───────────────────────────────────────────────────────────────────

export function useWalletSettings() {
  return useQuery({
    queryKey: walletKeys.settings(),
    queryFn: walletApi.getWalletSettings,
  });
}

export function useUpdateWalletSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.updateWalletSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.settings() });
    },
  });
}
