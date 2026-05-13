import { apiClient } from '@/lib/api-client';

export interface WalletData {
  balance: number;
  totalIncome: number;
  totalSpent: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'payment' | 'topup' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const getWallet = async () => {
  return apiClient.get<WalletData>('/wallet');
};

export const getWalletTransactions = async () => {
  return apiClient.get<WalletTransaction[]>('/wallet/transactions');
};

export const topUpWallet = async (data: { amount: number; description?: string }) => {
  return apiClient.post<WalletTransaction>('/wallet/topup', data);
};

export const withdrawFromWallet = async (data: { amount: number; description?: string }) => {
  return apiClient.post<WalletTransaction>('/wallet/withdraw', data);
};
