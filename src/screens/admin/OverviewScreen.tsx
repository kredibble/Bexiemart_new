import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAdminOverview } from '@/hooks/useAdmin';
import { StatsCard } from '@/components/vendor/StatsCard';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';

export default function AdminOverviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: overview, isLoading, error, refetch } = useAdminOverview();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const stats = [
    { title: 'Total Users', value: overview?.totalUsers ?? 0, icon: 'people-outline' as const, color: colors.info },
    { title: 'Total Vendors', value: overview?.totalVendors ?? 0, icon: 'storefront-outline' as const, color: colors.accent },
    { title: 'Total Orders', value: overview?.totalOrders ?? 0, icon: 'receipt-outline' as const, color: colors.warning },
    { title: 'Total Products', value: overview?.totalProducts ?? 0, icon: 'bag-outline' as const, color: colors.primary },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.notificationButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {isLoading ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: 60, height: 24 }]} />
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.errorText}>Could not load stats</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={<Ionicons name={stat.icon} size={20} color={stat.color} />}
                />
              ))}
            </View>

            <View style={styles.revenueCard}>
              <Ionicons name="cash-outline" size={24} color={colors.accentGreen} />
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>{formatCurrency(overview?.totalRevenue ?? 0)}</Text>
              </View>
            </View>

            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { label: 'Users', icon: 'people-outline', route: 'Users', color: colors.info },
                  { label: 'Vendors', icon: 'storefront-outline', route: 'Vendors', color: colors.accentGreen },
                  { label: 'Orders', icon: 'receipt-outline', route: 'Orders', color: colors.warning },
                  { label: 'Products', icon: 'bag-outline', route: 'Products', color: colors.primary },
                  { label: 'Categories', icon: 'grid-outline', route: 'Categories', color: colors.accentGreen2 },
                  { label: 'Reports', icon: 'bar-chart-outline', route: 'Reports', color: colors.error },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.route}
                    style={styles.actionCard}
                    onPress={() => (navigation as any).navigate(action.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                      <Ionicons name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h2, color: colors.text },
  notificationButton: {
    width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: { ...typePresets.h4, color: colors.text, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  skeletonCard: { width: '48%', backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, gap: 8, ...shadows.sm },
  skeletonIcon: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.borderLight },
  skeletonLine: { height: 12, backgroundColor: colors.borderLight, borderRadius: radii.full, width: '60%' },
  errorCard: { backgroundColor: colors.errorSoft, borderRadius: radii.xl, padding: 20, alignItems: 'center', gap: 8, marginBottom: 24 },
  errorText: { ...typePresets.body, color: colors.errorDark },
  retryText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.error },
  revenueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 20, marginBottom: 24, ...shadows.md,
  },
  revenueInfo: { flex: 1 },
  revenueLabel: { ...typePresets.body, color: colors.textSecondary },
  revenueValue: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.accentGreen },
  quickActions: { marginBottom: 24 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '30%', backgroundColor: colors.white, borderRadius: radii.lg, padding: 16,
    alignItems: 'center', gap: 8, ...shadows.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...typePresets.caption, fontFamily: 'NunitoSans_600SemiBold', color: colors.text, textAlign: 'center' },
});
