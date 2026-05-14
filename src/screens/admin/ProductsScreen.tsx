import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminProducts, useToggleProductStatus } from '@/hooks/useAdmin';
import type { AdminProduct } from '@/api/admin';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const { data: products, isLoading, refetch } = useAdminProducts();
  const toggleStatus = useToggleProductStatus();
  const confirm = useConfirm();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const productList: AdminProduct[] = Array.isArray(products) ? products : [];

  const filtered = React.useMemo(() => {
    if (filter === 'all') return productList;
    return productList.filter((p) => p.isActive === (filter === 'active'));
  }, [productList, filter]);

  const handleToggle = async (product: AdminProduct) => {
    const newStatus = !product.isActive;
    const ok = await confirm({ title: newStatus ? 'Activate Product' : 'Deactivate Product', message: `Set "${product.name}" to ${newStatus ? 'active' : 'inactive'}?`, confirmLabel: 'Confirm' });
    if (ok) toggleStatus.mutate({ id: product.id, isActive: newStatus });
  };

  const renderProduct = ({ item }: { item: AdminProduct }) => (
    <View style={styles.productRow}>
      <View style={styles.productIcon}>
        <Ionicons name="bag-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productMeta}>{item.category?.name} · {item.vendor?.user?.name}</Text>
        <Text style={styles.productDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        <TouchableOpacity
          style={[styles.statusToggle, { backgroundColor: item.isActive ? colors.accentSoft : colors.errorSoft }]}
          onPress={() => handleToggle(item)}
        >
          <Text style={[styles.statusText, { color: item.isActive ? colors.accentDark : colors.errorDark }]}>
            {item.isActive ? 'Active' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products ({productList.length})</Text>
      </View>

      <View style={styles.filterRow}>
        {[{ label: 'All', value: 'all' as const }, { label: 'Active', value: 'active' as const }, { label: 'Inactive', value: 'inactive' as const }].map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No products found</Text>
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
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...typePresets.caption, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8 },
  productRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm,
  },
  productIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, gap: 2 },
  productName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  productMeta: { ...typePresets.caption, color: colors.textSecondary },
  productDate: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  productRight: { alignItems: 'flex-end', gap: 8 },
  productPrice: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.text },
  statusToggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  statusText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
});
