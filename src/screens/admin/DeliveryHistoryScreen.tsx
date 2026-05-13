import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryHistory } from '@/hooks/useAdmin';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

export default function AdminDeliveryHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { data: deliveries, isLoading, refetch } = useDeliveryHistory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderDelivery = ({ item }: { item: any }) => (
    <View style={styles.deliveryRow}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.orderId}>#{item.orderNumber ?? item.id.slice(0, 8)}</Text>
        <OrderStatusBadge status={item.status} />
      </View>
      <View style={styles.deliveryBody}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={colors.textLight} />
          <Text style={styles.detailText}>{item.user?.name ?? 'Unknown'} ({item.user?.email})</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textLight} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.shippingAddress ? `${item.shippingAddress.addressLine1}, ${item.shippingAddress.city}` : 'No address'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={14} color={colors.textLight} />
          <Text style={styles.detailText}>{item.items?.length ?? 0} item(s)</Text>
        </View>
      </View>
      <View style={styles.deliveryFooter}>
        <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
        <Text style={styles.dateText}>{formatDate(item.updatedAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery History</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={Array.isArray(deliveries) ? deliveries : []}
          keyExtractor={(item) => item.id}
          renderItem={renderDelivery}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No delivery history</Text>
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8, paddingTop: 12 },
  deliveryRow: {
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, gap: 10, ...shadows.sm,
  },
  deliveryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  deliveryBody: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...typePresets.caption, color: colors.textSecondary, flex: 1 },
  deliveryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 8 },
  totalText: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.text },
  dateText: { ...typePresets.caption, color: colors.textLight },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
});
