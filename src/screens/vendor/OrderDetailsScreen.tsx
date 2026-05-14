import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useOrderDetail, useUpdateOrderStatus } from '@/hooks/useVendor';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets, fonts } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = ((route.params as any)?.orderId ?? '') as string;

  const { data: order, isLoading } = useOrderDetail(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const confirm = useConfirm();

  const currentIdx = STATUS_FLOW.indexOf(order?.status ?? 'pending');
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const isDelivered = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled';

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ok = await confirm({ title: 'Update Status', message: `Mark order as "${nextStatus}"?`, confirmLabel: 'Update' });
    if (!ok) return;
    updateStatusMutation.mutate(
      { orderId, status: nextStatus },
      {
        onSuccess: () => ToastEmitter.success('Order status updated'),
        onError: () => ToastEmitter.error('Failed to update status'),
      }
    );
  };

  const handleCancel = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const ok = await confirm({ title: 'Cancel Order', message: 'Are you sure you want to cancel this order?', destructive: true, confirmLabel: 'Yes, Cancel' });
    if (!ok) return;
    updateStatusMutation.mutate(
      { orderId, status: 'cancelled' },
      {
        onSuccess: () => ToastEmitter.success('Order has been cancelled'),
        onError: () => ToastEmitter.error('Failed to cancel order'),
      }
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonCard}>
            <View style={[styles.skeletonBlock, { width: '60%', height: 20, marginBottom: 8 }]} />
            <View style={[styles.skeletonBlock, { width: '40%', height: 14, marginBottom: 12 }]} />
            <View style={[styles.skeletonBlock, { width: '30%', height: 28 }]} />
          </View>
          <View style={styles.skeletonCard}>
            <View style={[styles.skeletonBlock, { width: '40%', height: 16, marginBottom: 12 }]} />
            <View style={[styles.skeletonBlock, { width: '80%', height: 14, marginBottom: 6 }]} />
            <View style={[styles.skeletonBlock, { width: '60%', height: 14, marginBottom: 6 }]} />
            <View style={[styles.skeletonBlock, { width: '70%', height: 14 }]} />
          </View>
          <View style={styles.skeletonCard}>
            <View style={[styles.skeletonBlock, { width: '30%', height: 16, marginBottom: 12 }]} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={[styles.skeletonBlock, { width: 48, height: 48, borderRadius: radii.md }]} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={[styles.skeletonBlock, { width: '70%', height: 14 }]} />
                  <View style={[styles.skeletonBlock, { width: '30%', height: 12 }]} />
                </View>
                <View style={[styles.skeletonBlock, { width: 60, height: 16 }]} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.center]}>
        <StatusBar style="dark" />
        <EmptyState
          icon="alert-circle-outline"
          iconColor={colors.error}
          title="Order not found"
          actionLabel="Go Back"
          onAction={() => (navigation as any).goBack()}
        />
      </View>
    );
  }

  const subtotal = order.items?.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            (navigation as any).goBack();
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>
              #{order.orderNumber ?? order.id.slice(0, 8)}
            </Text>
            <OrderStatusBadge status={order.status} />
          </View>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          <View style={styles.divider} />
          <View style={styles.orderTotalRow}>
            <Text style={styles.orderTotalLabel}>Total Amount</Text>
            <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontFamily: fonts.bodyBold }]}>Total</Text>
            <Text style={[styles.priceValue, { fontFamily: 'Rubik_700Bold', color: colors.text }]}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{order.customer?.name ?? 'N/A'}</Text>
              {order.customer?.email && (
                <Text style={styles.customerMeta}>{order.customer.email}</Text>
              )}
              {order.customer?.phone && (
                <Text style={styles.customerMeta}>{order.customer.phone}</Text>
              )}
            </View>
          </View>
          {(order.deliveryAddress || order.shippingAddress) && (
            <View style={styles.addressBlock}>
              <Ionicons name="location-outline" size={18} color={colors.accent} />
              <Text style={styles.addressText}>
                {order.deliveryAddress ?? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({order.items?.length ?? 0})</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemImage}>
                {item.product.images?.[0]?.url ? (
                  <Image source={{ uri: item.product.images[0].url }} style={styles.itemImageInner} />
                ) : (
                  <Ionicons name="cube-outline" size={20} color={colors.textLight} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemQty}>Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {isCancelled ? (
              <View style={styles.timelineCancelled}>
                <View style={[styles.timelineIcon, { backgroundColor: colors.errorSoft }]}>
                  <Ionicons name="close" size={18} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.timelineLabel, { fontFamily: fonts.bodyBold, color: colors.error }]}>
                    Cancelled
                  </Text>
                  <Text style={styles.timelineDate}>This order was cancelled</Text>
                </View>
              </View>
            ) : (
              STATUS_FLOW.map((status, i) => {
                const completed = i <= currentIdx;
                const active = status === order?.status;
                return (
                  <View key={status} style={styles.timelineRow}>
                    <View style={styles.timelineDotWrapper}>
                      {completed ? (
                        <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
                          <Ionicons name="checkmark" size={12} color={colors.white} />
                        </View>
                      ) : (
                        <View style={[styles.timelineDot, active ? styles.timelineDotCurrent : styles.timelineDotInactive]} />
                      )}
                      {i < STATUS_FLOW.length - 1 && (
                        <View style={[styles.timelineLine, completed && styles.timelineLineActive]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        completed && styles.timelineLabelDone,
                        active && styles.timelineLabelCurrent,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {completed && !active && ' ✓'}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Actions */}
        {!isDelivered && !isCancelled && (
          <View style={styles.actionsRow}>
            {nextStatus && (
              <Button
                variant="default"
                fullWidth
                onPress={handleAdvanceStatus}
                loading={updateStatusMutation.isPending}
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 16, color: colors.white }}>
                  Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </Text>
              </Button>
            )}
            {!isDelivered && (
              <Button
                variant="outline"
                fullWidth
                style={{ borderColor: colors.error }}
                onPress={handleCancel}
                disabled={updateStatusMutation.isPending}
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.error }}>Cancel Order</Text>
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const softShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
  web: { boxShadow: '0 4px 16px rgba(0,0,0,0.04)' },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 12,
    ...softShadow,
  },
  cardTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },

  // ── Order Summary ─────────────────────────────────────────────────────
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    ...typePresets.h3,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  orderDate: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  orderTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTotalLabel: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
  },
  orderTotal: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.primary,
  },

  // ── Price Breakdown ───────────────────────────────────────────────────
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    ...typePresets.body,
    color: colors.textSecondary,
  },
  priceValue: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },

  // ── Customer ──────────────────────────────────────────────────────────
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerDetails: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },
  customerMeta: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.lg,
    padding: 12,
  },
  addressText: {
    ...typePresets.bodySm,
    color: colors.accentDark,
    flex: 1,
    lineHeight: 20,
  },

  // ── Items ─────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImageInner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },
  itemQty: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typePresets.bodySm,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },

  // ── Timeline ──────────────────────────────────────────────────────────
  timeline: {
    gap: 0,
  },
  timelineCancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  timelineDotWrapper: {
    alignItems: 'center',
    width: 28,
    paddingTop: 4,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  timelineDotInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: colors.borderLight,
  },
  timelineLineActive: {
    backgroundColor: colors.success,
  },
  timelineLabel: {
    ...typePresets.body,
    color: colors.textSecondary,
    paddingTop: 4,
    flex: 1,
  },
  timelineLabelDone: {
    color: colors.successDark,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  timelineLabelCurrent: {
    color: colors.primary,
    fontFamily: 'NunitoSans_700Bold',
  },
  timelineDate: {
    ...typePresets.caption,
    color: colors.textLight,
    marginTop: 2,
  },

  // ── Actions ───────────────────────────────────────────────────────────
  actionsRow: {
    gap: 12,
    marginTop: 4,
  },

  // ── Skeleton ──────────────────────────────────────────────────────────
  skeletonContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 4,
    ...softShadow,
  },
  skeletonBlock: {
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    opacity: 0.6,
  },
});
