import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useWallet, useTransactions } from '@/hooks/useWallet';
import { useWalletStore } from '@/stores/walletStore';
import { WalletBalanceCard, WalletActions, WalletTransactionList, WalletSkeleton } from '@/components/wallet';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, radii } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { WalletAction } from '@/components/wallet';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;

export default function WalletHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const balanceVisible = useWalletStore((s) => s.balanceVisible);
  const toggleBalance = useWalletStore((s) => s.toggleBalanceVisibility);

  const { data: wallet, isLoading: walletLoading, isError: walletError, refetch: refetchWallet } = useWallet();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions();

  const isLoading = walletLoading || txLoading;
  const isError = walletError;

  const actions: WalletAction[] = [
    {
      key: 'topup',
      icon: 'add',
      label: 'Top Up',
      color: colors.success,
      bgColor: colors.successSoft,
      onPress: () => (navigation as any).navigate('WalletTopUp'),
    },
    {
      key: 'transfer',
      icon: 'send',
      label: 'Transfer',
      color: colors.info,
      bgColor: colors.infoSoft,
      onPress: () => (navigation as any).navigate('WalletTransfer'),
    },
    {
      key: 'withdraw',
      icon: 'arrow-up',
      label: 'Withdraw',
      color: colors.error,
      bgColor: colors.errorSoft,
      onPress: () => (navigation as any).navigate('WalletWithdraw'),
    },
    {
      key: 'settings',
      icon: 'settings-outline',
      label: 'Settings',
      color: colors.textSecondary,
      bgColor: colors.surfaceDark,
      onPress: () => (navigation as any).navigate('WalletSettings'),
    },
  ];

  const handleRefresh = useCallback(() => {
    refetchWallet();
    refetchTx();
  }, [refetchWallet, refetchTx]);

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={toggleBalance} accessibilityLabel="Toggle balance visibility">
            <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={toggleBalance} accessibilityLabel="Toggle balance visibility">
            <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <WalletSkeleton type="full" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity onPress={toggleBalance} accessibilityLabel="Toggle balance visibility">
          <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <WalletTransactionList
        transactions={transactions?.data ?? []}
        totalCount={transactions?.totalItems}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        header={
          <>
            {wallet && (
              <>
                <WalletBalanceCard
                  balance={balanceVisible ? wallet.balance : 0}
                  totalIncome={wallet.totalIncome}
                  totalSpent={wallet.totalSpent}
                  currency={wallet.currency}
                />
                <WalletActions actions={actions} />
              </>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 28, color: colors.text, letterSpacing: -0.5 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  errorTitle: { fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.text },
  errorMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
