/**
 * Wallet API — Customer wallet endpoints for balance, transactions,
 * bank/momo accounts, top-up, withdrawals, PIN management, and more.
 */
import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  balance: number;
  totalIncome: number;
  totalSpent: number;
  currency: string;
  hasPinSet: boolean;
  dailyLimit: number;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'payment' | 'topup' | 'withdrawal' | 'refund' | 'transfer';
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface MomoAccount {
  id: string;
  provider: 'mtn' | 'airteltigo' | 'telecel';
  phoneNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface WalletBeneficiary {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface WalletCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface WalletNotification {
  id: string;
  type: 'credit' | 'debit' | 'promotion' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface WalletSettings {
  dailyLimit: number;
  transactionNotifications: boolean;
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
}

// ── DTOs ───────────────────────────────────────────────────────────────────────

export interface AddBankAccountDto {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface AddMomoAccountDto {
  provider: 'mtn' | 'airteltigo' | 'telecel';
  phoneNumber: string;
  accountName: string;
}

export interface TopUpPaystackDto {
  amount: number;
  currency?: string;
  callbackUrl?: string;
}

export interface TopUpMomoDto {
  amount: number;
  provider: 'mtn' | 'airteltigo' | 'telecel';
  phoneNumber: string;
}

export interface VerifyTopupDto {
  reference: string;
}

export interface TransferDto {
  amount: number;
  recipientId: string;
  description?: string;
  pin: string;
}

export interface WithdrawToBankDto {
  amount: number;
  bankAccountId: string;
  pin: string;
}

export interface WithdrawToMomoDto {
  amount: number;
  momoAccountId: string;
  pin: string;
}

export interface SetupPinDto {
  pin: string;
  confirmPin: string;
}

export interface ChangePinDto {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface VerifyPinDto {
  pin: string;
}

export interface AddBeneficiaryDto {
  userId: string;
  name: string;
}

// ── Query Params ───────────────────────────────────────────────────────────────

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: 'asc' | 'desc';
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

// ── Wallet ─────────────────────────────────────────────────────────────────────

export const getWallet = async (): Promise<Wallet> => {
  return apiClient.get<Wallet>('/wallet');
};

export const getWalletSummary = async (): Promise<{
  balance: number;
  totalIncome: number;
  totalSpent: number;
  currency: string;
  pendingTransactions: number;
}> => {
  return apiClient.get('/wallet/summary');
};

// ── Transactions ───────────────────────────────────────────────────────────────

export const getTransactions = async (
  params?: TransactionQueryParams,
): Promise<PaginatedResponse<WalletTransaction>> => {
  const qs = buildQuery(params as Record<string, string | number | undefined>);
  return apiClient.get<PaginatedResponse<WalletTransaction>>(`/wallet/transactions${qs}`);
};

export const getTransaction = async (id: string): Promise<WalletTransaction> => {
  return apiClient.get<WalletTransaction>(`/wallet/transactions/${id}`);
};

// ── Bank Accounts ──────────────────────────────────────────────────────────────

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  return apiClient.get<BankAccount[]>('/wallet/bank-accounts');
};

export const addBankAccount = async (data: AddBankAccountDto): Promise<BankAccount> => {
  return apiClient.post<BankAccount>('/wallet/bank-accounts', data);
};

export const updateBankAccount = async (
  id: string,
  data: Partial<AddBankAccountDto> & { isDefault?: boolean },
): Promise<BankAccount> => {
  return apiClient.patch<BankAccount>(`/wallet/bank-accounts/${id}`, data);
};

export const deleteBankAccount = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/wallet/bank-accounts/${id}`);
};

// ── MoMo Accounts ──────────────────────────────────────────────────────────────

export const getMomoAccounts = async (): Promise<MomoAccount[]> => {
  return apiClient.get<MomoAccount[]>('/wallet/momo-accounts');
};

export const addMomoAccount = async (data: AddMomoAccountDto): Promise<MomoAccount> => {
  return apiClient.post<MomoAccount>('/wallet/momo-accounts', data);
};

export const updateMomoAccount = async (
  id: string,
  data: Partial<AddMomoAccountDto> & { isDefault?: boolean },
): Promise<MomoAccount> => {
  return apiClient.patch<MomoAccount>(`/wallet/momo-accounts/${id}`, data);
};

export const deleteMomoAccount = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/wallet/momo-accounts/${id}`);
};

// ── Top-Up ─────────────────────────────────────────────────────────────────────

export const topUpPaystack = async (
  data: TopUpPaystackDto,
): Promise<{ authorizationUrl: string; reference: string }> => {
  return apiClient.post<{ authorizationUrl: string; reference: string }>(
    '/wallet/topup/paystack',
    data,
  );
};

export const topUpMomo = async (
  data: TopUpMomoDto,
): Promise<{ reference: string; status: string }> => {
  return apiClient.post<{ reference: string; status: string }>('/wallet/topup/momo', data);
};

export const verifyTopup = async (params: VerifyTopupDto): Promise<WalletTransaction> => {
  const qs = buildQuery(params as unknown as Record<string, string | number | undefined>);
  return apiClient.get<WalletTransaction>(`/wallet/topup/verify${qs}`);
};

// ── Transfers & Withdrawals ────────────────────────────────────────────────────

export const transferToUser = async (data: TransferDto): Promise<WalletTransaction> => {
  return apiClient.post<WalletTransaction>('/wallet/transfer', data);
};

export const withdrawToBank = async (data: WithdrawToBankDto): Promise<WalletTransaction> => {
  return apiClient.post<WalletTransaction>('/wallet/withdraw/bank', data);
};

export const withdrawToMomo = async (data: WithdrawToMomoDto): Promise<WalletTransaction> => {
  return apiClient.post<WalletTransaction>('/wallet/withdraw/momo', data);
};

// ── PIN Management ─────────────────────────────────────────────────────────────

export const setupPin = async (data: SetupPinDto): Promise<void> => {
  return apiClient.post<void>('/wallet/pin/setup', data);
};

export const changePin = async (data: ChangePinDto): Promise<void> => {
  return apiClient.post<void>('/wallet/pin/change', data);
};

export const verifyPin = async (data: VerifyPinDto): Promise<{ valid: boolean }> => {
  return apiClient.post<{ valid: boolean }>('/wallet/pin/verify', data);
};

// ── Settings ───────────────────────────────────────────────────────────────────

export const getWalletSettings = async (): Promise<WalletSettings> => {
  return apiClient.get<WalletSettings>('/wallet/settings');
};

export const updateWalletSettings = async (
  data: Partial<WalletSettings>,
): Promise<WalletSettings> => {
  return apiClient.patch<WalletSettings>('/wallet/settings', data);
};

// ── Notifications ──────────────────────────────────────────────────────────────

export const getWalletNotifications = async (): Promise<WalletNotification[]> => {
  return apiClient.get<WalletNotification[]>('/wallet/notifications');
};

export const markWalletNotificationRead = async (id: string): Promise<void> => {
  return apiClient.patch<void>(`/wallet/notifications/${id}/read`);
};

// ── Beneficiaries ──────────────────────────────────────────────────────────────

export const getBeneficiaries = async (): Promise<WalletBeneficiary[]> => {
  return apiClient.get<WalletBeneficiary[]>('/wallet/beneficiaries');
};

export const addBeneficiary = async (data: AddBeneficiaryDto): Promise<WalletBeneficiary> => {
  return apiClient.post<WalletBeneficiary>('/wallet/beneficiaries', data);
};

export const deleteBeneficiary = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/wallet/beneficiaries/${id}`);
};

// ── Saved Cards ────────────────────────────────────────────────────────────────

export const getSavedCards = async (): Promise<WalletCard[]> => {
  return apiClient.get<WalletCard[]>('/wallet/cards');
};

export const deleteSavedCard = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/wallet/cards/${id}`);
};
