import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useVendorEarnings } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { EarningsTransaction } from '@/types';

const FILTERS = ['All', 'Sales', 'Withdrawals', 'Refunds'] as const;
type Filter = (typeof FILTERS)[number];

export default function VendorEarningsHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: earnings } = useVendorEarnings();
  const [selectedFilter, setSelectedFilter] = useState<Filter>('All');

  const filteredItems = useMemo(() => {
    const items = earnings?.transactions ?? [];
    switch (selectedFilter) {
      case 'Sales':
        return items.filter((i) => i.type === 'sale');
      case 'Withdrawals':
        return items.filter((i) => i.type === 'withdrawal');
      case 'Refunds':
        return items.filter((i) => i.type === 'refund');
      default:
        return items;
    }
  }, [earnings?.transactions, selectedFilter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings History</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.stickyHeader}>
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${filter.toLowerCase()}`}
              accessibilityState={{ selected: selectedFilter === filter }}
            >
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No activity found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All' ? 'Your earnings activity will appear here' : `No ${selectedFilter.toLowerCase()} transactions yet`}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredItems.map((item: EarningsTransaction, i: number) => {
              const isPositive = item.type === 'sale';
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.delay(i * 40).springify().damping(18)}
                  style={styles.row}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isPositive ? colors.successSoft : colors.errorSoft },
                    ]}
                  >
                    <Ionicons
                      name={isPositive ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={20}
                      color={isPositive ? colors.success : colors.error}
                    />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.description} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.amount, { color: isPositive ? colors.success : colors.error }]}>
                      {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    {item.status !== 'completed' && (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: item.status === 'pending' ? colors.pending : colors.errorSoft },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: item.status === 'pending' ? colors.pendingText : colors.error },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  stickyHeader: { backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...typePresets.caption, fontFamily: fonts.bodySemi, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { ...typePresets.h3, color: colors.text },
  emptySubtitle: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center' },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  description: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  date: { ...typePresets.caption, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { ...typePresets.priceSm, fontFamily: fonts.bodyBold },
  statusBadge: { borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2 },
  statusBadgeText: { fontSize: 10, fontFamily: fonts.bodySemi, textTransform: 'capitalize' },
});
