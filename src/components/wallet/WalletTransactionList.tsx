import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/theme/colors';
import { WalletTransactionRow } from './WalletTransactionRow';
import type { WalletTransaction } from '@/api/wallet';

interface WalletTransactionListProps {
  transactions: WalletTransaction[];
  totalCount?: number;
  isLoading?: boolean;
  isError?: boolean;
  header?: React.ReactNode;
  onRefresh?: () => void;
  onEndReached?: () => void;
  ListEmptyComponent?: React.ReactElement | null;
}

export function WalletTransactionList({
  transactions,
  totalCount,
  isLoading,
  isError,
  header,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: WalletTransactionListProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: WalletTransaction; index: number }) => (
      <WalletTransactionRow transaction={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: WalletTransaction) => item.id, []);

  const renderHeader = useCallback(
    () => (
      <View>
        {header}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {totalCount !== undefined && (
            <Text style={styles.transactionCount}>{totalCount} entries</Text>
          )}
        </View>
      </View>
    ),
    [header, totalCount],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        ListEmptyComponent ?? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your wallet activity will appear here</Text>
          </View>
        )
      }
      ItemSeparatorComponent={renderSeparator}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading ?? false}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  transactionCount: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 72,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  emptySubtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
