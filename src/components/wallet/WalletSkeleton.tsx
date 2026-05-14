import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radii } from '@/theme/colors';

interface WalletSkeletonProps {
  type?: 'balance' | 'transactions' | 'full';
}

export function WalletSkeleton({ type = 'full' }: WalletSkeletonProps) {
  if (type === 'balance') {
    return <BalanceSkeleton />;
  }

  if (type === 'transactions') {
    return <TransactionsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <BalanceSkeleton />
      <View style={{ marginTop: 32 }}>
        <TransactionsSkeleton />
      </View>
    </View>
  );
}

function BalanceSkeleton() {
  return (
    <View style={styles.balanceCard}>
      <Skeleton width="45%" height={16} borderRadius={radii.sm} />
      <Skeleton width="55%" height={36} borderRadius={radii.sm} style={{ marginTop: 12 }} />
      <View style={styles.breakdownSkeleton}>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Skeleton width="70%" height={10} />
          <Skeleton width="60%" height={14} />
        </View>
        <View style={styles.skeletonDivider} />
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Skeleton width="70%" height={10} />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    </View>
  );
}

function TransactionsSkeleton() {
  return (
    <View style={{ gap: 0 }}>
      <Skeleton width="35%" height={20} borderRadius={radii.sm} style={{ marginBottom: 16, marginHorizontal: 20 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.txRow}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="55%" height={15} />
            <Skeleton width="35%" height={13} />
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Skeleton width={70} height={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  balanceCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    gap: 0,
  },
  breakdownSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    padding: 12,
  },
  skeletonDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
});
