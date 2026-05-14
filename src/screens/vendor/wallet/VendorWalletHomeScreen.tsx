import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, StretchInY } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useVendorEarnings, useVendorDashboardAnalytics } from '@/hooks/useVendor';
import { useWallet } from '@/hooks/useWallet';
import { WalletSkeleton } from '@/components/wallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { VendorStackParamList } from '@/navigation/VendorTabs';
import type { EarningsTransaction } from '@/types';

type NavProp = NativeStackNavigationProp<VendorStackParamList>;

export default function VendorWalletHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { data: earnings, isLoading, isError, refetch, isRefetching } = useVendorEarnings();
  const { data: wallet } = useWallet();
  const { data: analytics } = useVendorDashboardAnalytics();

  const recentTransactions = useMemo(
    () => (earnings?.transactions ?? []).slice(0, 10),
    [earnings?.transactions],
  );

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load earnings</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <WalletSkeleton type="balance" />
        ) : (
          <>
            {/* ── Hero Balance ── */}
            <Animated.View entering={StretchInY.delay(100).springify()} style={styles.balanceCardOuter}>
              <View style={styles.balanceAccent} />
              <View style={styles.balanceCard}>
                <View style={styles.balanceTopRow}>
                  <View style={styles.balanceBadge}>
                    <Ionicons name="wallet-outline" size={14} color={colors.primary} />
                    <Text style={styles.balanceBadgeText}>Available Balance</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.withdrawBtn, (!earnings || earnings.availableBalance <= 0) && { opacity: 0.4 }]}
                    onPress={() => (navigation as any).navigate('VendorPayout')}
                    disabled={!earnings || earnings.availableBalance <= 0}
                    accessibilityRole="button"
                    accessibilityLabel="Withdraw funds"
                  >
                    <Ionicons name="arrow-down-circle" size={16} color={colors.primary} />
                    <Text style={styles.withdrawBtnText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.balanceValue}>
                  {formatCurrency(earnings?.availableBalance ?? 0)}
                </Text>

                <View style={styles.balanceDivider} />

                <View style={styles.miniStatRow}>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Pending</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(earnings?.pendingEarnings ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.miniStatVLine} />
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Total Earned</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(earnings?.totalEarnings ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.miniStatVLine} />
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>This Month</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(analytics?.revenue30Days ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* ── Quick Actions ── */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => (navigation as any).navigate('VendorPayout')}
                accessibilityRole="button"
                accessibilityLabel="Withdraw earnings"
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.successSoft }]}>
                  <Ionicons name="arrow-down-circle" size={22} color={colors.success} />
                </View>
                <Text style={styles.actionLabel}>Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => (navigation as any).navigate('VendorPayoutMethod')}
                accessibilityRole="button"
                accessibilityLabel="Manage payout methods"
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.infoSoft }]}>
                  <Ionicons name="card-outline" size={22} color={colors.info} />
                </View>
                <Text style={styles.actionLabel}>Payout Methods</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => (navigation as any).navigate('VendorEarningsHistory')}
                accessibilityRole="button"
                accessibilityLabel="View earnings history"
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="time-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>History</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* ── Wallet Balance ── */}
            {wallet && (
              <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.walletCard}>
                <View style={styles.walletCardLeft}>
                  <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                  <View>
                    <Text style={styles.walletCardLabel}>Customer Wallet</Text>
                    <Text style={styles.walletCardValue}>{formatCurrency(wallet.balance)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </Animated.View>
            )}

            {/* ── Recent Activity ── */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('VendorEarningsHistory')}
                  accessibilityRole="button"
                  accessibilityLabel="View all"
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {recentTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={40} color={colors.textLight} />
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                <View style={styles.activityList}>
                  {recentTransactions.map((tx: EarningsTransaction, i: number) => {
                    const isPositive = tx.type === 'sale';
                    return (
                      <Animated.View
                        key={tx.id}
                        entering={FadeInDown.delay(500 + i * 60).springify()}
                        style={styles.activityRow}
                      >
                        <View
                          style={[
                            styles.activityIcon,
                            { backgroundColor: isPositive ? colors.successSoft : colors.errorSoft },
                          ]}
                        >
                          <Ionicons
                            name={isPositive ? 'arrow-down-circle' : 'arrow-up-circle'}
                            size={18}
                            color={isPositive ? colors.success : colors.error}
                          />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityDescription} numberOfLines={1}>
                            {tx.description}
                          </Text>
                          <Text style={styles.activityDate}>{formatDate(tx.createdAt)}</Text>
                        </View>
                        <View style={styles.activityRight}>
                          <Text style={[styles.activityAmount, { color: isPositive ? colors.success : colors.error }]}>
                            {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                          </Text>
                          {tx.status !== 'completed' && (
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: tx.status === 'pending' ? colors.pending : colors.errorSoft },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  { color: tx.status === 'pending' ? colors.pendingText : colors.error },
                                ]}
                              >
                                {tx.status}
                              </Text>
                            </View>
                          )}
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  errorTitle: { ...typePresets.h3, color: colors.text },
  retryBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  retryBtnText: { ...typePresets.body, fontFamily: fonts.bodySemi, color: colors.white },
  balanceCardOuter: { borderRadius: radii.xl, marginBottom: 16, overflow: 'hidden', backgroundColor: colors.white, ...shadows.lg },
  balanceAccent: { height: 4, backgroundColor: colors.primary },
  balanceCard: { padding: 24, gap: 0 },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, borderRadius: radii.full, paddingHorizontal: 12, paddingVertical: 6 },
  balanceBadgeText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 12, letterSpacing: 0.2 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radii.full, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: colors.primary },
  withdrawBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 13, letterSpacing: 0.2 },
  balanceValue: { ...typePresets.stat, fontFamily: fonts.heading, color: colors.text, fontSize: 38, letterSpacing: -1, marginTop: 20, marginBottom: 0 },
  balanceDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 20 },
  miniStatRow: { flexDirection: 'row', alignItems: 'stretch' },
  miniStat: { flex: 1, alignItems: 'center', gap: 4 },
  miniStatVLine: { width: 1, backgroundColor: colors.borderLight },
  miniStatLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  miniStatValue: { ...typePresets.priceSm, fontFamily: fonts.bodyBold, color: colors.text, fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, alignItems: 'center', gap: 8, ...shadows.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...typePresets.caption, fontFamily: fonts.bodySemi, color: colors.text, textAlign: 'center' },
  walletCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, ...shadows.sm, marginBottom: 16 },
  walletCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletCardLabel: { ...typePresets.caption, color: colors.textSecondary },
  walletCardValue: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { ...typePresets.h4, fontFamily: fonts.headingSemi, color: colors.text },
  viewAllText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.primary },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { ...typePresets.body, color: colors.textLight },
  activityList: { gap: 8 },
  activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.xl, padding: 14, gap: 12, ...shadows.sm },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityDescription: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  activityDate: { ...typePresets.caption, color: colors.textSecondary, marginTop: 2 },
  activityRight: { alignItems: 'flex-end', gap: 4 },
  activityAmount: { ...typePresets.priceSm, fontFamily: fonts.bodyBold },
  statusBadge: { borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2 },
  statusBadgeText: { fontSize: 10, fontFamily: fonts.bodySemi, textTransform: 'capitalize' },
});
