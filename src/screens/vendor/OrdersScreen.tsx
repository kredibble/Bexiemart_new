/**
 * OrdersScreen — Vendor orders list with status filter tabs.
 *
 * Features:
 *  - Sticky filter bar (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
 *  - Order list with status badges
 *  - Tap → OrderDetailsScreen
 *  - Pull-to-refresh
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Ionicons } from '@expo/vector-icons';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendorOrders } from '@/hooks/useVendor';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { OrderStatus, Order } from '@/types';
import type { VendorTabsParamList } from '@/navigation/VendorTabs';

type NavProp = NativeStackNavigationProp<VendorTabsParamList>;

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const queryStatus = selectedStatus === 'all' ? undefined : selectedStatus;
  const { data: orders, isLoading, isError, error, refetch, isRefetching } = useVendorOrders(queryStatus);

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    refetch();
  }, [refetch]);

  const handleTabPress = useCallback((value: OrderStatus | 'all') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setSelectedStatus(value);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <Animated.View 
        entering={FadeInUp.delay(index * 50).springify().damping(14)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            (navigation as any).navigate('OrderDetails', { orderId: item.id });
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Order ${item.orderNumber ?? item.id.slice(0, 8)}, ${item.status}, ${formatCurrency(item.total)}`}
        >
          <View style={styles.orderLeft}>
            <View style={styles.orderIdContainer}>
              <Ionicons name="receipt-outline" size={16} color={colors.primary} />
              <Text style={styles.orderId}>
                #{item.orderNumber ?? item.id.slice(0, 8)}
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.orderItemCount}>
              {item.items?.length ?? 0} item{(item.items?.length ?? 0) !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
            <OrderStatusBadge status={item.status} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [navigation]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Animated.Text entering={FadeInDown.springify()} style={styles.headerTitle}>
          Orders
        </Animated.Text>
      </View>

      {isError ? (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load orders'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh} accessibilityRole="button">
            <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Status Filter Tabs */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
              {STATUS_TABS.map((tab) => {
                const isSelected = selectedStatus === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[
                      styles.tab,
                      isSelected && styles.tabSelected,
                    ]}
                    onPress={() => handleTabPress(tab.value)}
                    accessibilityRole="tab"
                    accessibilityLabel={`Filter by ${tab.label} orders`}
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        isSelected && styles.tabLabelSelected,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Orders List */}
          <FlatList
            data={Array.isArray(orders) ? orders : []}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <EmptyState
                  icon="receipt-outline"
                  title="No orders found"
                  subtitle={
                    selectedStatus !== 'all'
                      ? `No ${selectedStatus} orders yet.`
                      : 'When customers place orders, they will appear here.'
                  }
                />
              ) : null
            }
            ListHeaderComponent={
              isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC', // Sleek off-white bg
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    }),
    zIndex: 10,
  },
  headerTitle: {
    ...typePresets.h1,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textSecondary,
  },
  tabLabelSelected: {
    color: colors.white,
    fontFamily: 'NunitoSans_700Bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.05)' },
    }),
  },
  orderLeft: {
    gap: 6,
    flex: 1,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    ...typePresets.bodyLg,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  orderDate: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  orderItemCount: {
    ...typePresets.caption,
    color: colors.textLight,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  orderTotal: {
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
    color: colors.primary,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    ...typePresets.h3,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typePresets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.text,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radii.full,
  },
});
