import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radii } from '@/theme/colors';

interface WalletBalanceCardProps {
  balance: number;
  totalIncome: number;
  totalSpent: number;
  currency?: string;
  index?: number;
}

export function WalletBalanceCard({
  balance,
  totalIncome,
  totalSpent,
  currency = 'GH₵',
  index = 0,
}: WalletBalanceCardProps) {
  const spentPercent = useMemo(
    () => (totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0),
    [totalIncome, totalSpent],
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <Text style={styles.label}>Available Balance</Text>
      <Text style={styles.amount}>
        {currency} {balance.toFixed(2)}
      </Text>

      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Ionicons name="arrow-down-circle-outline" size={14} color={colors.success} />
          <Text style={styles.breakdownLabel}>Income</Text>
          <Text style={[styles.breakdownValue, { color: colors.success }]}>
            {currency} {totalIncome.toFixed(2)}
          </Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Ionicons name="arrow-up-circle-outline" size={14} color={colors.error} />
          <Text style={styles.breakdownLabel}>Spent</Text>
          <Text style={[styles.breakdownValue, { color: colors.error }]}>
            {currency} {totalSpent.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${spentPercent}%` }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    ...shadows.lg,
  },
  label: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  amount: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 36,
    color: colors.white,
    marginTop: 4,
    letterSpacing: -1,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    padding: 12,
  },
  breakdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  breakdownLabel: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  breakdownValue: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 13,
    marginLeft: 'auto',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
