import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import { Input } from '@/components/ui/Input';
import type { Coupon } from '@/types';

const SAMPLE_COUPONS: Coupon[] = [
  { id: '1', code: 'STUDENT20', discountPercent: 20, maxUses: 500, currentUses: 120, isActive: true, expiresAt: '2026-06-15T00:00:00Z' },
  { id: '2', code: 'FIRSTORDER', discountPercent: 15, maxUses: 1000, currentUses: 340, isActive: true, expiresAt: '2026-05-30T00:00:00Z' },
  { id: '3', code: 'CAMPUS10', discountPercent: 10, maxUses: 200, currentUses: 45, isActive: true, expiresAt: '2026-07-01T00:00:00Z' },
  { id: '4', code: 'WELCOME5', discountPercent: 5, maxUses: 100, currentUses: 100, isActive: false, expiresAt: '2026-04-01T00:00:00Z' },
];

export default function CustomerCouponsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const coupons = SAMPLE_COUPONS.filter((c) => {
    const expired = new Date(c.expiresAt) < new Date() || !c.isActive;
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? !expired : expired;
    const matchesSearch = !search || c.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderCoupon = ({ item }: { item: Coupon }) => {
    const expired = new Date(item.expiresAt) < new Date() || !item.isActive;
    return (
      <TouchableOpacity style={[styles.couponCard, expired && styles.couponExpired]} activeOpacity={0.7}>
        <View style={styles.couponLeft}>
          <View style={styles.couponBadge}>
            <Text style={styles.couponPercent}>{item.discountPercent}%</Text>
            <Text style={styles.couponOff}>OFF</Text>
          </View>
          <View style={styles.couponDots}>
            {[...Array(8)].map((_, i) => <View key={i} style={styles.dot} />)}
          </View>
        </View>
        <View style={styles.couponBody}>
          <Text style={styles.couponCode}>{item.code}</Text>
          <Text style={styles.couponDesc}>{item.discountPercent}% discount on your order</Text>
          <View style={styles.couponMeta}>
            <Text style={styles.couponExpiry}>
              {expired ? 'Expired' : `Expires ${formatDate(item.expiresAt)}`}
            </Text>
            <Text style={styles.couponUses}>{item.currentUses}/{item.maxUses} used</Text>
          </View>
          <TouchableOpacity style={[styles.copyBtn, expired && styles.copyBtnDisabled]}>
            <Ionicons name="copy-outline" size={16} color={expired ? colors.textLight : colors.white} />
            <Text style={[styles.copyText, expired && { color: colors.textLight }]}>Copy Code</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <View style={{ width: 38 }} />
      </View>

      <Input placeholder="Search coupons..." value={search} onChangeText={setSearch} prefixIcon="search-outline" containerStyle={{ margin: 16, marginBottom: 8 }} />

      <View style={styles.filterRow}>
        {[{ label: 'All', value: 'all' as const }, { label: 'Active', value: 'active' as const }, { label: 'Expired', value: 'expired' as const }].map((f) => (
          <TouchableOpacity key={f.label} style={[styles.filterChip, filter === f.value && styles.filterChipActive]} onPress={() => setFilter(f.value)}>
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id}
        renderItem={renderCoupon}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No coupons available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...typePresets.caption, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  listContent: { paddingHorizontal: 16, gap: 12 },
  couponCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden', ...shadows.md },
  couponExpired: { opacity: 0.55 },
  couponLeft: { width: 100, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: 12, position: 'relative' },
  couponBadge: { alignItems: 'center' },
  couponPercent: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.white },
  couponOff: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold', color: colors.primarySoft, marginTop: -4 },
  couponDots: { position: 'absolute', right: -4, top: 0, bottom: 0, justifyContent: 'space-evenly' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface },
  couponBody: { flex: 1, padding: 14, gap: 4 },
  couponCode: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  couponDesc: { ...typePresets.caption, color: colors.textSecondary },
  couponMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  couponExpiry: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  couponUses: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, alignSelf: 'flex-start', marginTop: 6 },
  copyBtnDisabled: { backgroundColor: colors.borderLight },
  copyText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold', color: colors.white },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
});
