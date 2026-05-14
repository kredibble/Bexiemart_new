/**
 * WalletScreen — Balance overview + transaction history.
 *
 * Sections:
 *  1. Balance card (total balance, income, spent)
 *  2. Quick action buttons (Top Up, Withdraw)
 *  3. Transaction history list
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWallet, useTransactions } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import type { WalletTransaction } from '@/api/wallet';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
}

function formatCurrency(amount: number, currency: string): string {
  const abs = Math.abs(amount);
  return `${currency} ${abs.toFixed(2)}`;
}

const TRANSACTION_META: Record<WalletTransaction['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  payment: { icon: 'cart-outline', color: colors.primary, label: 'Payment' },
  topup: { icon: 'add-circle-outline', color: colors.success, label: 'Top Up' },
  withdrawal: { icon: 'arrow-up-circle-outline', color: colors.error, label: 'Withdrawal' },
  refund: { icon: 'refresh-circle-outline', color: colors.warning, label: 'Refund' },
  transfer: { icon: 'send-outline', color: colors.info, label: 'Transfer' },
};

function TransactionRow({ item }: { item: WalletTransaction }) {
  const meta = TRANSACTION_META[item.type];
  const isCredit = item.amount > 0;

  return (
    <View style={txStyles.row}>
      <View style={[txStyles.iconCircle, { backgroundColor: `${meta.color}15` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={txStyles.details}>
        <Text style={txStyles.description} numberOfLines={1}>{item.description}</Text>
        <Text style={txStyles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={txStyles.amountColumn}>
        <Text style={[txStyles.amount, isCredit ? txStyles.credit : txStyles.debit]}>
          {isCredit ? '+' : ''}{formatCurrency(item.amount, 'GH₵')}
        </Text>
        {item.status === 'pending' && (
          <View style={txStyles.pendingBadge}>
            <Text style={txStyles.pendingText}>Pending</Text>
          </View>
        )}
        {item.status === 'failed' && (
          <Text style={txStyles.failedText}>Failed</Text>
        )}
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: wallet, isLoading: walletLoading, isError: walletError, refetch: refetchWallet } = useWallet();
  const { data: transactions, isLoading: txLoading, isError: txError, refetch: refetchTx } = useTransactions();

  const spentPercent = useMemo(
    () => (wallet && wallet.totalIncome > 0 ? (wallet.totalSpent / wallet.totalIncome) * 100 : 0),
    [wallet],
  );

  const isLoading = walletLoading || txLoading;
  const isError = walletError || txError;

  const renderHeader = useCallback(
    () => (
      <View>
        {wallet && (
          <>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {wallet.currency} {wallet.balance.toFixed(2)}
              </Text>
              <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                  <Ionicons name="arrow-down-circle-outline" size={14} color={colors.success} />
                  <Text style={styles.breakdownLabel}>Income</Text>
                  <Text style={[styles.breakdownValue, { color: colors.success }]}>
                    {wallet.currency} {wallet.totalIncome.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Ionicons name="arrow-up-circle-outline" size={14} color={colors.error} />
                  <Text style={styles.breakdownLabel}>Spent</Text>
                  <Text style={[styles.breakdownValue, { color: colors.error }]}>
                    {wallet.currency} {wallet.totalSpent.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${spentPercent}%` }]} />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Top up wallet">
                <View style={[styles.actionIcon, { backgroundColor: colors.successSoft }]}>
                  <Ionicons name="add" size={24} color={colors.success} />
                </View>
                <Text style={styles.actionLabel}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Transfer funds" onPress={() => (navigation as any).navigate('WalletTransfer')}>
                <View style={[styles.actionIcon, { backgroundColor: colors.infoSoft }]}>
                  <Ionicons name="send" size={22} color={colors.info} />
                </View>
                <Text style={styles.actionLabel}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Withdraw funds">
                <View style={[styles.actionIcon, { backgroundColor: colors.errorSoft }]}>
                  <Ionicons name="arrow-up" size={24} color={colors.error} />
                </View>
                <Text style={styles.actionLabel}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions && <Text style={styles.transactionCount}>{transactions.data.length} entries</Text>}
        </View>
      </View>
    ),
    [wallet, spentPercent, transactions],
  );

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}><Text style={styles.headerTitle}>Wallet</Text></View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load wallet</Text>
          <Text style={styles.errorMessage}>Something went wrong. Pull down to retry.</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}><Text style={styles.headerTitle}>Wallet</Text></View>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>
      <FlatList
        data={transactions?.data ?? []}
        renderItem={({ item }) => <TransactionRow item={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { refetchWallet(); refetchTx(); }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={txStyles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your wallet activity will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 28, color: colors.text, letterSpacing: -0.5 },
  listContent: { paddingBottom: 32 },
  balanceCard: {
    marginHorizontal: 20, padding: 20, borderRadius: radii.xl,
    backgroundColor: colors.primary, ...shadows.lg,
  },
  balanceLabel: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  balanceAmount: { fontFamily: 'Rubik_700Bold', fontSize: 36, color: colors.white, marginTop: 4, letterSpacing: -1 },
  breakdown: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radii.md, padding: 12,
  },
  breakdownItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },
  breakdownLabel: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  breakdownValue: { fontFamily: 'NunitoSans_700Bold', fontSize: 13, marginLeft: 'auto' },
  progressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 12, overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  actions: {
    flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 20,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 13, color: colors.text },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: colors.text },
  transactionCount: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: colors.textLight },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  errorTitle: { fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.text },
  errorMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: colors.text },
  emptySubtitle: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});

const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, gap: 12,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1, gap: 2 },
  description: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: colors.text },
  date: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: colors.textLight },
  amountColumn: { alignItems: 'flex-end', gap: 2 },
  amount: { fontFamily: 'Rubik_600SemiBold', fontSize: 14 },
  credit: { color: colors.success },
  debit: { color: colors.text },
  pendingBadge: {
    backgroundColor: colors.warningSoft, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: radii.full,
  },
  pendingText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 10, color: colors.warningDark },
  failedText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 10, color: colors.error },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 72 },
});
