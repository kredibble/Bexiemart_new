/**
 * DashboardScreen — Vendor dashboard with stats cards and recent orders.
 *
 * Features:
 *  - 2x2 stats grid (products, orders, earnings, pending)
 *  - Recent orders list (last 5)
 *  - Pull-to-refresh
 *  - Loading skeletons, empty states, error with retry
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { StatsCard } from '@/components/vendor/StatsCard';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendorStats, useVendorOrders } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useVendorStats();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useVendorOrders();

  const recentOrders = orders?.slice(0, 5) ?? [];

  const handleRefresh = React.useCallback(() => {
    refetchStats();
    refetchOrders();
  }, [refetchStats, refetchOrders]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  }, [handleRefresh]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>

        {statsLoading ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: 60, height: 24 }]} />
              </View>
            ))}
          </View>
        ) : statsError ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.errorText}>Could not load stats</Text>
            <TouchableOpacity onPress={() => refetchStats()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Products"
              value={stats?.totalProducts ?? 0}
              icon={<Ionicons name="bag-outline" size={20} color={colors.primary} />}
            />
            <StatsCard
              title="Total Orders"
              value={stats?.totalOrders ?? 0}
              icon={<Ionicons name="receipt-outline" size={20} color={colors.success} />}
            />
            <StatsCard
              title="Total Earnings"
              value={formatCurrency(stats?.totalEarnings ?? 0)}
              icon={<Ionicons name="cash-outline" size={20} color={colors.warning} />}
            />
            <StatsCard
              title="Pending Orders"
              value={stats?.pendingOrders ?? 0}
              icon={<Ionicons name="time-outline" size={20} color={colors.error} />}
              accentColor={colors.error}
            />
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {ordersLoading ? (
          <View style={styles.skeletonList}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonOrderRow}>
                <View style={styles.skeletonOrderInfo} />
                <View style={styles.skeletonBadge} />
              </View>
            ))}
          </View>
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            subtitle="When customers place orders, they'll appear here."
          />
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderRow}
                onPress={() =>
                  (navigation as any).navigate('OrderDetails', { orderId: order.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{order.orderNumber ?? order.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  <OrderStatusBadge status={order.status} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  greeting: {
    ...typePresets.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    ...typePresets.h4,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 8,
    ...shadows.sm,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    width: '60%',
  },
  errorCard: {
    backgroundColor: colors.errorSoft,
    borderRadius: radii.xl,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  errorText: {
    ...typePresets.body,
    color: colors.errorDark,
  },
  retryText: {
    ...typePresets.body,
    fontFamily: 'Nunito_700Bold',
    color: colors.error,
  },
  recentOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  seeAll: {
    ...typePresets.body,
    fontFamily: 'Nunito_700Bold',
    color: colors.primary,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    ...shadows.sm,
  },
  skeletonOrderInfo: {
    height: 16,
    width: 120,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    backgroundColor: colors.borderLight,
    borderRadius: 12,
  },
  ordersList: {
    gap: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    ...shadows.sm,
  },
  orderInfo: {
    gap: 4,
  },
  orderId: {
    ...typePresets.body,
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
  },
  orderDate: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderTotal: {
    ...typePresets.priceSm,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
  },
});
