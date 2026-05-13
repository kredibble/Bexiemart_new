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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendorOrders } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
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
    refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          (navigation as any).navigate('OrderDetails', { orderId: item.id })
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Order ${item.orderNumber ?? item.id.slice(0, 8)}, ${item.status}, ${formatCurrency(item.total)}`}
      >
        <View style={styles.orderLeft}>
          <Text style={styles.orderId}>
            #{item.orderNumber ?? item.id.slice(0, 8)}
          </Text>
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
    ),
    [navigation]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load orders'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh} accessibilityRole="button" accessibilityLabel="Retry loading orders">
            <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Status Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.tab,
                  selectedStatus === tab.value && styles.tabSelected,
                ]}
                onPress={() => setSelectedStatus(tab.value)}
                accessibilityRole="tab"
                accessibilityLabel={`Filter by ${tab.label} orders`}
                accessibilityState={{ selected: selectedStatus === tab.value }}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedStatus === tab.value && styles.tabLabelSelected,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  tabSelected: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textSecondary,
  },
  tabLabelSelected: {
    color: colors.primary,
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
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  orderLeft: {
    gap: 4,
    flex: 1,
  },
  orderId: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },
  orderDate: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  orderItemCount: {
    ...typePresets.caption,
    color: colors.textLight,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderTotal: {
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
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
  errorTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
});
