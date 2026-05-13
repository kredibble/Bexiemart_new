import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useOrderTracking } from '@/hooks/useOrders';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'OrderTracking'>;

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  processing: 'cog-outline',
  shipped: 'car-outline',
  delivered: 'checkmark-done-outline',
};

export default function OrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId } = route.params;
  const { data: tracking, isLoading, error } = useOrderTracking(orderId);

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !tracking) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Could not load tracking info</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBack}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{tracking.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tracking.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(tracking.status) }]}>
              {tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          {tracking.timeline.map((item, idx) => (
            <View key={item.status} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, item.completed && styles.timelineDotCompleted, item.active && styles.timelineDotActive]}>
                  {item.completed && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
                {idx < tracking.timeline.length - 1 && <View style={[styles.timelineLine, item.completed && styles.timelineLineCompleted]} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, item.active && styles.timelineLabelActive]}>
                  {item.label}
                </Text>
                {item.date && (
                  <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Estimated Delivery */}
        {tracking.estimatedDelivery && (
          <View style={styles.estDeliveryCard}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.estLabel}>Estimated Delivery</Text>
              <Text style={styles.estDate}>{formatDate(tracking.estimatedDelivery)}</Text>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Shipping Address</Text>
              <Text style={styles.infoValue}>
                {tracking.shippingAddress.address}, {tracking.shippingAddress.city}, {tracking.shippingAddress.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <Text style={styles.sectionTitle}>Items</Text>
        {tracking.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="bag-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity} x {formatCurrency(item.price)}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(tracking.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return colors.warning;
    case 'confirmed': return colors.info;
    case 'processing': return colors.processingText;
    case 'shipped': return colors.shippedText;
    case 'delivered': return colors.success;
    case 'cancelled': return colors.error;
    default: return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h3, fontFamily: 'Rubik_700Bold', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  errorText: { ...typePresets.body, color: colors.error },
  goBack: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary, marginTop: 8 },
  orderHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16,
  },
  orderNumber: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.full },
  statusText: { fontFamily: 'NunitoSans_700Bold', fontSize: 13 },
  timelineSection: { paddingVertical: 8 },
  sectionTitle: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 48 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotCompleted: { backgroundColor: colors.success },
  timelineDotActive: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.primarySoft },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.borderLight, marginVertical: 4 },
  timelineLineCompleted: { backgroundColor: colors.success },
  timelineContent: { flex: 1, paddingBottom: 12 },
  timelineLabel: { ...typePresets.body, color: colors.textSecondary },
  timelineLabelActive: { fontFamily: 'NunitoSans_700Bold', color: colors.text },
  timelineDate: { ...typePresets.caption, color: colors.textLight, marginTop: 2 },
  estDeliveryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.primarySoft, borderRadius: radii.xl, padding: 16,
  },
  estLabel: { ...typePresets.caption, color: colors.textSecondary },
  estDate: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  infoCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 16 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { ...typePresets.caption, color: colors.textSecondary },
  infoValue: { ...typePresets.body, color: colors.text },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 12,
  },
  itemImagePlaceholder: {
    width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  itemQty: { ...typePresets.caption, color: colors.textSecondary },
  itemTotal: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.text },
  totalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16,
    marginTop: 8,
  },
  totalLabel: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  totalAmount: { ...typePresets.price, fontFamily: 'Rubik_700Bold', color: colors.text },
});
