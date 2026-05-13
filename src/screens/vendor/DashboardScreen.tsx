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
import { useVendorDashboardAnalytics, useVendorOrders } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

const MAX_BAR_HEIGHT = 120;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: analytics, isLoading, error, refetch: refetchAnalytics } = useVendorDashboardAnalytics();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useVendorOrders();

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const maxRevenue = analytics?.dailyRevenue?.length
    ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1)
    : 1;

  const handleRefresh = React.useCallback(() => {
    refetchAnalytics();
    refetchOrders();
  }, [refetchAnalytics, refetchOrders]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  }, [handleRefresh]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => (navigation as any).navigate('Notifications')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {isLoading ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: 60, height: 24 }]} />
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.errorText}>Could not load stats</Text>
            <TouchableOpacity onPress={() => refetchAnalytics()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatsCard title="Total Products" value={analytics?.totalProducts ?? 0} icon={<Ionicons name="bag-outline" size={20} color={colors.primary} />} />
              <StatsCard title="Total Orders" value={analytics?.totalOrders ?? 0} icon={<Ionicons name="receipt-outline" size={20} color={colors.success} />} />
              <StatsCard title="30-Day Revenue" value={formatCurrency(analytics?.revenue30Days ?? 0)} icon={<Ionicons name="cash-outline" size={20} color={colors.warning} />} />
              <StatsCard title="Pending Orders" value={analytics?.pendingOrders ?? 0} icon={<Ionicons name="time-outline" size={20} color={colors.error} />} accentColor={colors.error} />
            </View>

            {/* Revenue Chart */}
            {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Revenue (Last 30 Days)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                  <View style={styles.chartContainer}>
                    {analytics.dailyRevenue.map((day, idx) => (
                      <View key={idx} style={styles.barColumn}>
                        <Text style={styles.barValue}>
                          {day.revenue > 0 ? `GH₵${Math.round(day.revenue)}` : ''}
                        </Text>
                        <View style={[styles.bar, { height: (day.revenue / maxRevenue) * MAX_BAR_HEIGHT }]} />
                        <Text style={styles.barLabel}>
                          {day.date.slice(5)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Top Products */}
            {analytics?.topProducts && analytics.topProducts.length > 0 && (
              <View style={styles.topProductsSection}>
                <Text style={styles.sectionTitle}>Top Products</Text>
                {analytics.topProducts.map((product, idx) => (
                  <View key={idx} style={styles.topProductRow}>
                    <View style={[styles.rankBadge, { backgroundColor: idx === 0 ? colors.warningSoft : colors.surfaceDark }]}>
                      <Text style={[styles.rankText, { color: idx === 0 ? colors.warningDark : colors.textSecondary }]}>
                        #{idx + 1}
                      </Text>
                    </View>
                    <View style={styles.topProductInfo}>
                      <Text style={styles.topProductName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.topProductMeta}>{product.quantity} sold</Text>
                    </View>
                    <Text style={styles.topProductRevenue}>{formatCurrency(product.revenue)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => (navigation as any).navigate('Coupons')}>
                  <Ionicons name="pricetag-outline" size={22} color={colors.primary} />
                  <Text style={styles.actionLabel}>Coupons</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={() => (navigation as any).navigate('AddEditProduct', { mode: 'add' })}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
                  <Text style={styles.actionLabel}>Add Product</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Orders */}
            <View style={styles.recentOrdersHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Orders')}>
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
              <EmptyState icon="receipt-outline" title="No orders yet" subtitle="When customers place orders, they'll appear here." />
            ) : (
              <View style={styles.ordersList}>
                {recentOrders.map((order) => (
                  <TouchableOpacity key={order.id} style={styles.orderRow} onPress={() => (navigation as any).navigate('OrderDetails', { orderId: order.id })} activeOpacity={0.7}>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  greeting: { ...typePresets.body, color: colors.textSecondary },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  notificationButton: {
    width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  skeletonCard: { width: '48%', backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, gap: 8, ...shadows.sm },
  skeletonIcon: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.borderLight },
  skeletonLine: { height: 12, backgroundColor: colors.borderLight, borderRadius: radii.full, width: '60%' },
  errorCard: { backgroundColor: colors.errorSoft, borderRadius: radii.xl, padding: 20, alignItems: 'center', gap: 8, marginBottom: 24 },
  errorText: { ...typePresets.body, color: colors.errorDark },
  retryText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.error },

  // Chart
  chartSection: { marginBottom: 24 },
  chartScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: MAX_BAR_HEIGHT + 40, paddingTop: 20 },
  barColumn: { alignItems: 'center', width: 32 },
  barValue: { fontSize: 8, color: colors.textLight, marginBottom: 2 },
  bar: { width: 20, backgroundColor: colors.primary, borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 8, color: colors.textLight, marginTop: 4 },

  // Top Products
  topProductsSection: { marginBottom: 24 },
  topProductRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 12, marginBottom: 8, ...shadows.sm,
  },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'Rubik_700Bold', fontSize: 13 },
  topProductInfo: { flex: 1, gap: 2 },
  topProductName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  topProductMeta: { ...typePresets.caption, color: colors.textSecondary },
  topProductRevenue: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.text },

  // Quick Actions
  quickActions: { marginBottom: 24 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 16,
    alignItems: 'center', gap: 8, ...shadows.sm,
  },
  actionLabel: { ...typePresets.caption, fontFamily: 'NunitoSans_600SemiBold', color: colors.text },

  // Orders
  recentOrdersHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  seeAll: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  skeletonList: { gap: 12 },
  skeletonOrderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, ...shadows.sm,
  },
  skeletonOrderInfo: { height: 16, width: 120, backgroundColor: colors.borderLight, borderRadius: 8 },
  skeletonBadge: { width: 80, height: 24, backgroundColor: colors.borderLight, borderRadius: radii.full },
  ordersList: { gap: 12 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, ...shadows.sm,
  },
  orderInfo: { gap: 4 },
  orderId: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  orderDate: { ...typePresets.caption, color: colors.textSecondary },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderTotal: { ...typePresets.priceSm, fontFamily: 'Rubik_700Bold', color: colors.text },
});
