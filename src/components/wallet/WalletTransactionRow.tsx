import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import type { WalletTransaction } from '@/api/wallet';

const TRANSACTION_META: Record<
  WalletTransaction['type'],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  payment: { icon: 'cart-outline', color: colors.primary, label: 'Payment' },
  topup: { icon: 'add-circle-outline', color: colors.success, label: 'Top Up' },
  withdrawal: { icon: 'arrow-up-circle-outline', color: colors.error, label: 'Withdrawal' },
  refund: { icon: 'refresh-circle-outline', color: colors.warning, label: 'Refund' },
  transfer: { icon: 'send-outline', color: colors.info, label: 'Transfer' },
};

interface WalletTransactionRowProps {
  transaction: WalletTransaction;
  index?: number;
}

export function WalletTransactionRow({ transaction, index = 0 }: WalletTransactionRowProps) {
  const meta = TRANSACTION_META[transaction.type];
  const isCredit = transaction.amount > 0;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify().damping(18)}
      style={styles.row}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}15` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>

      <View style={styles.amountColumn}>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          {isCredit ? '+' : ''}
          {Math.abs(transaction.amount).toFixed(2)}
        </Text>
        {transaction.status === 'pending' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
        {transaction.status === 'failed' && (
          <Text style={styles.failedText}>Failed</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  date: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: 'Rubik_600SemiBold',
    fontSize: 14,
  },
  credit: {
    color: colors.success,
  },
  debit: {
    color: colors.text,
  },
  pendingBadge: {
    backgroundColor: colors.warningSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  pendingText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 10,
    color: colors.warningDark,
  },
  failedText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 10,
    color: colors.error,
  },
});
