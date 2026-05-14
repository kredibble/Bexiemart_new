import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminVendors, useToggleVendorStatus } from '@/hooks/useAdmin';
import type { AdminVendor } from '@/api/admin';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatDate } from '@/utils/format';

export default function AdminVendorsScreen() {
  const insets = useSafeAreaInsets();
  const { data: vendors, isLoading, refetch } = useAdminVendors();
  const toggleStatus = useToggleVendorStatus();
  const confirm = useConfirm();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const vendorList: AdminVendor[] = Array.isArray(vendors) ? vendors : [];

  const filtered = React.useMemo(() => {
    if (filter === 'all') return vendorList;
    return vendorList.filter((v) => v.isActive === (filter === 'active'));
  }, [vendorList, filter]);

  const handleToggle = async (vendor: AdminVendor) => {
    const newStatus = !vendor.isActive;
    const ok = await confirm({ title: newStatus ? 'Activate Vendor' : 'Deactivate Vendor', message: `Set ${vendor.shopName} to ${newStatus ? 'active' : 'inactive'}?`, confirmLabel: 'Confirm' });
    if (ok) toggleStatus.mutate({ id: vendor.id, isActive: newStatus });
  };

  const renderVendor = ({ item }: { item: AdminVendor }) => (
    <View style={styles.vendorRow}>
      <View style={styles.vendorIcon}>
        <Ionicons name="storefront-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.vendorInfo}>
        <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
        <Text style={styles.vendorEmail} numberOfLines={1}>{item.user.email}</Text>
        <Text style={styles.vendorMeta}>{item._count.products} products · {formatDate(item.createdAt)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.statusToggle, { backgroundColor: item.isActive ? colors.accentSoft : colors.errorSoft }]}
        onPress={() => handleToggle(item)}
      >
        <Text style={[styles.statusText, { color: item.isActive ? colors.accentDark : colors.errorDark }]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendors ({vendorList.length})</Text>
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
          renderItem={renderVendor}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No vendors found</Text>
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
    flexDirection: 'row', alignItems: 'center',
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
  vendorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm,
  },
  vendorIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  vendorInfo: { flex: 1, gap: 2 },
  shopName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  vendorEmail: { ...typePresets.caption, color: colors.textSecondary },
  vendorMeta: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  statusToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full },
  statusText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
});
