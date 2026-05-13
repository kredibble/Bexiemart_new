import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminOrders } from '@/hooks/useAdmin';
import type { AdminOrder } from '@/api/admin';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: orders, isLoading, refetch } = useAdminOrders(statusFilter);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const orderList: AdminOrder[] = Array.isArray(orders) ? orders : [];

  const renderOrder = ({ item }: { item: AdminOrder }) => (
    <View style={styles.orderRow}>
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{item.orderNumber ?? item.id.slice(0, 8)}</Text>
          <OrderStatusBadge status={item.status as import('@/types').OrderStatus} />
        </View>
        <Text style={styles.orderCustomer} numberOfLines={1}>{item.user.name} · {item.user.email}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.orderItems}>{item.items?.length ?? 0} item(s)</Text>
      </View>
      <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === item.value && styles.filterChipActive]}
            onPress={() => setStatusFilter(item.value)}
          >
            <Text style={[styles.filterChipText, statusFilter === item.value && styles.filterChipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orderList}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h4, color: colors.text },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...typePresets.caption, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm,
  },
  orderInfo: { flex: 1, gap: 4 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  orderCustomer: { ...typePresets.caption, color: colors.textSecondary },
  orderDate: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  orderItems: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  orderTotal: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
});
