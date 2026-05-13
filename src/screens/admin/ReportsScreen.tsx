import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminReports } from '@/hooks/useAdmin';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();
  const { data: reports, isLoading, refetch } = useAdminReports();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports (30 Days)</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={24} color={colors.accentGreen} />
                <Text style={styles.statValue}>{formatCurrency(reports?.totalRevenue30d ?? 0)}</Text>
                <Text style={styles.statLabel}>Revenue (30d)</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="receipt-outline" size={24} color={colors.info} />
                <Text style={styles.statValue}>{reports?.orderCount30d ?? 0}</Text>
                <Text style={styles.statLabel}>Orders (30d)</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Selling Products</Text>
              {Array.isArray(reports?.topProductIds) && reports.topProductIds.length > 0 ? (
                reports.topProductIds.map((p, idx) => (
                  <View key={p.productId} style={styles.topProductRow}>
                    <View style={[styles.rankBadge, { backgroundColor: idx === 0 ? colors.warningSoft : colors.surfaceDark }]}>
                      <Text style={[styles.rankText, { color: idx === 0 ? colors.warningDark : colors.textSecondary }]}>#{idx + 1}</Text>
                    </View>
                    <Text style={styles.productIdText} numberOfLines={1}>{p.productId.slice(0, 12)}...</Text>
                    <Text style={styles.soldCount}>{p.totalSold} sold</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No sales data available</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {Array.isArray(reports?.recentOrders) && reports.recentOrders.length > 0 ? (
                reports.recentOrders.slice(0, 10).map((order: any) => (
                  <View key={order.id} style={styles.orderRow}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>#{order.orderNumber ?? order.id.slice(0, 8)}</Text>
                      <Text style={styles.orderCustomer}>{order.user?.name ?? 'Unknown'}</Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent orders</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radii.xl, padding: 20,
    alignItems: 'center', gap: 8, ...shadows.md,
  },
  statValue: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  statLabel: { ...typePresets.caption, color: colors.textSecondary },
  section: { marginBottom: 24 },
  sectionTitle: { ...typePresets.h4, color: colors.text, marginBottom: 12 },
  topProductRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 12, marginBottom: 8, ...shadows.sm,
  },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'Rubik_700Bold', fontSize: 13 },
  productIdText: { flex: 1, ...typePresets.body, color: colors.text },
  soldCount: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 12, marginBottom: 8, ...shadows.sm,
  },
  orderInfo: { gap: 2 },
  orderId: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  orderCustomer: { ...typePresets.caption, color: colors.textSecondary },
  orderTotal: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.text },
  emptyText: { ...typePresets.body, color: colors.textLight, textAlign: 'center', paddingVertical: 20 },
});
