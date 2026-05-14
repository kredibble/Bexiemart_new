import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendorDashboardAnalytics, useVendorOrders } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

const { width } = Dimensions.get('window');
const MAX_BAR_HEIGHT = 140;

const statCards: {
  key: string; icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string; color: string; bg: string; isCurrency?: boolean;
}[] = [
  { key: 'totalProducts', icon: 'cube-outline', label: 'Total Products', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'ordersThisMonth', icon: 'receipt-outline', label: 'Orders This Month', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'pendingOrders', icon: 'time-outline', label: 'Pending Orders', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'deliveredOrders', icon: 'checkmark-circle-outline', label: 'Delivered', color: '#10B981', bg: '#F0FDF4' },
  { key: 'canceledOrders', icon: 'close-circle-outline', label: 'Canceled', color: '#EF4444', bg: '#FEF2F2' },
  { key: 'revenue30Days', icon: 'wallet-outline', label: 'Total Revenue', color: '#7C3AED', bg: '#F5F3FF', isCurrency: true },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: analytics, isLoading, error, refetch: refetchAnalytics } = useVendorDashboardAnalytics();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useVendorOrders();

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const maxRevenue = analytics?.dailyRevenue?.length
    ? Math.max(...analytics.dailyRevenue.map((d: any) => d.revenue), 1)
    : 1;

  const handleRefresh = React.useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
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
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
            <Text style={styles.greeting}>Overview</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </Animated.View>
          <View style={styles.headerRight}>
            <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  (navigation as any).navigate('Notifications');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation as any).navigate('Settings');
              }}
              style={styles.profileCircle}
            >
              <Ionicons name="person-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ gap: 20 }}>
            <View style={styles.skeletonGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.skeletonCard} />
              ))}
            </View>
          </View>
        ) : error ? (
          <Animated.View entering={FadeInDown} style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
            <Text style={styles.errorText}>Could not load dashboard data</Text>
            <TouchableOpacity onPress={() => refetchAnalytics()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* 3 x 2 Stat Cards Grid */}
            <Animated.View entering={FadeInDown.delay(300).springify().damping(16)}>
              <View style={styles.statsGrid}>
                {statCards.map((card, idx) => {
                  const rawValue = analytics ? (analytics as any)[card.key] : 0;
                  const value = card.isCurrency
                    ? formatCurrency(rawValue)
                    : typeof rawValue === 'number'
                      ? rawValue.toLocaleString()
                      : '0';

                  return (
                    <Animated.View
                      key={card.key}
                      entering={FadeInDown.delay(300 + idx * 60).springify().damping(16)}
                      style={styles.statCard}
                    >
                      <View style={styles.statCardInner}>
                        <View style={[styles.statIconWrap, { backgroundColor: card.bg }]}>
                          <Ionicons name={card.icon} size={22} color={card.color} />
                        </View>
                        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{value}</Text>
                        <Text style={styles.statLabel}>{card.label}</Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(600).springify().damping(16)} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.qaScroll}>
                {[
                  { icon: 'add-outline' as const, label: 'Add Product', screen: 'AddEditProduct', params: { mode: 'add' } },
                  { icon: 'grid-outline' as const, label: 'Products', screen: 'Products' },
                  { icon: 'clipboard-outline' as const, label: 'Orders', screen: 'Orders' },
                  { icon: 'ticket-outline' as const, label: 'Coupons', screen: 'Coupons' },
                  { icon: 'wallet-outline' as const, label: 'Earnings', screen: 'Earnings' },
                  { icon: 'settings-outline' as const, label: 'Settings', screen: 'Settings' },
                ].map((action, idx) => (
                  <TouchableOpacity
                    key={action.screen}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      (navigation as any).navigate(action.screen, action.params);
                    }}
                    style={styles.qaItem}
                  >
                    <View style={styles.qaCircle}>
                      <Ionicons name={action.icon} size={22} color={colors.white} />
                    </View>
                    <Text style={styles.qaLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Revenue Chart */}
            {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 && (
              <Animated.View entering={FadeInDown.delay(700).springify().damping(16)} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Analytics</Text>
                </View>
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Daily Revenue</Text>
                    <View style={styles.chartLegend}>
                      <View style={styles.legendDot} />
                      <Text style={styles.legendText}>GH₵</Text>
                    </View>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                    <View style={styles.chartInner}>
                      <View style={[styles.gridLine, { bottom: 30 }]} />
                      <View style={[styles.gridLine, { bottom: 30 + (MAX_BAR_HEIGHT / 2) }]} />
                      <View style={[styles.gridLine, { bottom: 30 + MAX_BAR_HEIGHT }]} />

                      {analytics.dailyRevenue.map((day: any, idx: number) => {
                        const rawHeight = (day.revenue / maxRevenue) * MAX_BAR_HEIGHT;
                        const height = isNaN(rawHeight) || !isFinite(rawHeight) ? 4 : Math.max(rawHeight, 4);
                        const isHighest = day.revenue === maxRevenue && day.revenue > 0;
                        return (
                          <View key={idx} style={styles.barCol}>
                            <Text style={[styles.barValue, isHighest && styles.barValueHighlight]}>
                              {day.revenue > 0 ? `${Math.round(day.revenue)}` : ''}
                            </Text>
                            <View style={styles.barTrack}>
                              <Animated.View
                                entering={FadeInUp.delay(800 + idx * 40).springify().damping(14)}
                                style={[styles.bar, { height, backgroundColor: isHighest ? colors.primary : colors.borderLight }]}
                              />
                            </View>
                            <Text style={styles.barLabel}>{day.date.slice(5)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </Animated.View>
            )}

            {/* Top Products */}
            {analytics?.topProducts && analytics.topProducts.length > 0 && (
              <Animated.View entering={FadeInDown.delay(800).springify().damping(16)} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Top Performers</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topProductsScroll}>
                  {analytics.topProducts.map((product: any, idx: number) => (
                    <View key={idx} style={styles.topProductCard}>
                      <View style={styles.topProductRank}>
                        <Text style={styles.topProductRankText}>#{idx + 1}</Text>
                      </View>
                      <View style={styles.topProductDetails}>
                        <Text style={styles.topProductName} numberOfLines={2}>{product.name}</Text>
                        <View style={styles.topProductFooter}>
                          <Text style={styles.topProductSales}>{product.quantity} sales</Text>
                          <Text style={styles.topProductRevenue}>{formatCurrency(product.revenue)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Recent Orders */}
            <Animated.View entering={FadeInDown.delay(900).springify().damping(16)} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).navigate('Orders');
                  }}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {ordersLoading ? (
                <View style={styles.skeletonList}>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.skeletonOrderRow} />
                  ))}
                </View>
              ) : recentOrders.length === 0 ? (
                <EmptyState icon="receipt-outline" title="No orders yet" subtitle="Your incoming orders will appear here." />
              ) : (
                <View style={styles.ordersList}>
                  {recentOrders.map((order: any, idx: number) => (
                    <Animated.View key={order.id} entering={FadeIn.delay(1000 + idx * 100)} layout={Layout.springify()}>
                      <TouchableOpacity
                        style={styles.orderCard}
                        onPress={() => {
                          if (Platform.OS !== 'web') Haptics.selectionAsync();
                          (navigation as any).navigate('OrderDetails', { orderId: order.id });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.orderHeader}>
                          <View>
                            <Text style={styles.orderId}>#{order.orderNumber ?? order.id.slice(0, 8)}</Text>
                            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                          </View>
                          <OrderStatusBadge status={order.status} />
                        </View>
                        <View style={styles.orderDivider} />
                        <View style={styles.orderFooter}>
                          <Text style={styles.orderItemsCount}>{order.items?.length || 0} items</Text>
                          <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
  web: { boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFC' },

  scrollContent: { paddingHorizontal: 20 },

  headerContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerRight: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  profileCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...softShadow,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  greeting: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 13, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Rubik_700Bold', fontSize: 32, color: colors.text, letterSpacing: -1,
  },
  notificationButton: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...softShadow,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  notificationDot: {
    position: 'absolute', top: 12, right: 13, width: 8, height: 8,
    borderRadius: 4, backgroundColor: colors.error,
    borderWidth: 1.5, borderColor: colors.white,
  },

  /* 2 x 3 Stats Grid */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: -8, marginBottom: 24,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCardInner: {
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 20,
    height: 140,
    justifyContent: 'space-between',
    ...softShadow,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Rubik_700Bold', fontSize: 24, color: colors.text,
    marginBottom: 4, letterSpacing: -1,
  },
  statLabel: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  /* Sections */
  sectionContainer: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.text, letterSpacing: -0.5,
  },

  /* Quick Actions */
  qaScroll: {
    flexDirection: 'row', gap: 20, paddingRight: 20,
  },
  qaItem: {
    alignItems: 'center', gap: 10, width: 72,
  },
  qaCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qaLabel: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 11, color: colors.textSecondary,
    textAlign: 'center', letterSpacing: 0.2,
  },

  /* Chart */
  chartCard: {
    backgroundColor: colors.white, borderRadius: radii.xl,
    paddingTop: 24, paddingBottom: 16,
    ...softShadow,
  },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 28,
  },
  chartTitle: { fontFamily: 'NunitoSans_700Bold', fontSize: 15, color: colors.text },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  legendText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.textLight },
  chartScroll: { marginHorizontal: 0 },
  chartInner: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 16,
    height: MAX_BAR_HEIGHT + 50, paddingHorizontal: 20, paddingBottom: 10,
  },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.borderLight,
  },
  barCol: { alignItems: 'center', width: 34, zIndex: 2 },
  barValue: {
    fontFamily: 'NunitoSans_700Bold', fontSize: 11, color: colors.textLight, marginBottom: 6,
  },
  barValueHighlight: { color: colors.primary, fontSize: 12 },
  barTrack: {
    width: 12, height: MAX_BAR_HEIGHT, backgroundColor: colors.surface,
    borderRadius: 6, justifyContent: 'flex-end',
  },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 11, color: colors.textSecondary, marginTop: 10,
  },

  /* Top Products */
  topProductsScroll: { paddingRight: 20, gap: 12 },
  topProductCard: {
    width: width * 0.65,
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16,
    flexDirection: 'row', gap: 14, ...softShadow,
  },
  topProductRank: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  topProductRankText: { fontFamily: 'Rubik_700Bold', fontSize: 15, color: colors.textSecondary },
  topProductDetails: { flex: 1, justifyContent: 'space-between' },
  topProductName: {
    fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.text, marginBottom: 6,
  },
  topProductFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topProductSales: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.textSecondary },
  topProductRevenue: { fontFamily: 'Rubik_700Bold', fontSize: 14, color: colors.success },

  /* Recent Orders */
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full,
  },
  seeAllText: { fontFamily: 'NunitoSans_700Bold', fontSize: 12, color: colors.primary },
  ordersList: { gap: 12 },
  orderCard: {
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 20,
    ...softShadow,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12,
  },
  orderId: { fontFamily: 'Rubik_700Bold', fontSize: 15, color: colors.text, marginBottom: 3 },
  orderDate: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.textSecondary },
  orderDivider: { height: 1, backgroundColor: colors.borderLight, marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderItemsCount: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 13, color: colors.textSecondary },
  orderTotal: { fontFamily: 'Rubik_700Bold', fontSize: 17, color: colors.primary },

  /* Skeletons */
  skeletonGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  skeletonCard: {
    width: '50%', paddingHorizontal: 8, marginBottom: 16,
    height: 140, backgroundColor: colors.skeleton, borderRadius: radii.xl,
  },
  skeletonList: { gap: 12 },
  skeletonOrderRow: { height: 100, backgroundColor: colors.skeleton, borderRadius: radii.xl },

  /* Error State */
  errorCard: {
    backgroundColor: colors.errorSoft, borderRadius: radii.xl, padding: 28,
    alignItems: 'center', gap: 14,
  },
  errorText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 15, color: colors.errorDark },
  retryBtn: { backgroundColor: colors.error, paddingHorizontal: 22, paddingVertical: 10, borderRadius: radii.full },
  retryText: { fontFamily: 'Rubik_700Bold', fontSize: 14, color: colors.white },
});
