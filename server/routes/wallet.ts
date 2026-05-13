import { eventHandler, getRouterParam, readBody, setResponseStatus } from 'h3';
import { requireAuth } from '../middleware/auth';
import { success, error } from '../utils/response';

interface WalletTransaction {
  id: string;
  type: 'payment' | 'topup' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const transactions: WalletTransaction[] = [
  { id: '1', type: 'payment', amount: -45.00, description: 'Wash & Fold Laundry', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
  { id: '2', type: 'topup', amount: 200.00, description: 'Wallet Top Up', date: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
  { id: '3', type: 'payment', amount: -15.00, description: 'Campus Delivery', date: new Date(Date.now() - 259200000).toISOString(), status: 'completed' },
  { id: '4', type: 'payment', amount: -89.50, description: 'B/W Printing Bundle', date: new Date(Date.now() - 345600000).toISOString(), status: 'completed' },
  { id: '5', type: 'refund', amount: 15.00, description: 'Refund — Delivery Cancelled', date: new Date(Date.now() - 432000000).toISOString(), status: 'completed' },
  { id: '6', type: 'withdrawal', amount: -100.00, description: 'Withdrawal to Bank', date: new Date(Date.now() - 518400000).toISOString(), status: 'completed' },
  { id: '7', type: 'payment', amount: -32.00, description: 'Phone Screen Protector', date: new Date(Date.now() - 604800000).toISOString(), status: 'pending' },
  { id: '8', type: 'topup', amount: 100.00, description: 'Wallet Top Up', date: new Date(Date.now() - 691200000).toISOString(), status: 'completed' },
];

export const getWallet = eventHandler(async (event) => {
  await requireAuth(event);

  const totalIncome = transactions
    .filter((t) => t.amount > 0 && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.amount < 0 && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalSpent;

  return success({
    balance,
    totalIncome,
    totalSpent,
    currency: 'GH₵',
  });
});

export const getWalletTransactions = eventHandler(async (event) => {
  await requireAuth(event);
  return success(transactions);
});

export const topUpWallet = eventHandler(async (event) => {
  await requireAuth(event);
  const body = await readBody(event);
  const amount = parseFloat(body?.amount);
  if (!amount || amount <= 0) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Amount must be greater than 0' };
  }

  const tx = {
    id: String(transactions.length + 1),
    type: 'topup' as const,
    amount,
    description: body?.description || 'Wallet Top Up',
    date: new Date().toISOString(),
    status: 'completed' as const,
  };
  transactions.unshift(tx);

  return success(tx);
});

export const withdrawFromWallet = eventHandler(async (event) => {
  await requireAuth(event);
  const body = await readBody(event);
  const amount = parseFloat(body?.amount);
  if (!amount || amount <= 0) {
    setResponseStatus(event, 400);
    return { success: false, error: 'Amount must be greater than 0' };
  }

  const tx = {
    id: String(transactions.length + 1),
    type: 'withdrawal' as const,
    amount: -amount,
    description: body?.description || 'Withdrawal to Bank',
    date: new Date().toISOString(),
    status: 'pending' as const,
  };
  transactions.unshift(tx);

  return success(tx);
});
