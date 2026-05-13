/**
 * OrderDetailsScreen — Vendor view of a single order with status update.
 *
 * Features:
 *  - Order info (number, date, total, customer)
 *  - Order items list with thumbnails
 *  - Status timeline
 *  - Update order status button
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useOrderDetail, useUpdateOrderStatus } from '@/hooks/useVendor';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
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

  const currentIdx = STATUS_FLOW.indexOf(order?.status ?? 'pending');
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const isDelivered = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled';

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    Alert.alert(
      'Update Status',
      `Mark order as "${nextStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () =>
            updateStatusMutation.mutate(
              { orderId, status: nextStatus },
              {
                onSuccess: () => Alert.alert('Success', 'Order status updated'),
                onError: () => Alert.alert('Error', 'Failed to update status'),
              }
            ),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () =>
            updateStatusMutation.mutate(
              { orderId, status: 'cancelled' },
              {
                onSuccess: () => Alert.alert('Cancelled', 'Order has been cancelled'),
                onError: () => Alert.alert('Error', 'Failed to cancel order'),
              }
            ),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.center]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.center]}>
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
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
          <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.customerName}>{order.customer?.name ?? 'N/A'}</Text>
          </View>
          {order.customer?.phone && (
            <View style={styles.customerRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.customerDetail}>{order.customer.phone}</Text>
            </View>
          )}
          {order.customer?.email && (
            <View style={styles.customerRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.customerDetail}>{order.customer.email}</Text>
            </View>
          )}
          {(order.deliveryAddress || order.shippingAddress) && (
            <View style={styles.addressBlock}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.customerDetail}>
                {order.deliveryAddress ?? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
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
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
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
          {STATUS_FLOW.map((status, i) => {
            const completed = !isCancelled && i <= currentIdx;
            const active = status === order?.status;
            return (
              <View key={status} style={styles.timelineRow}>
                <View style={styles.timelineDotWrapper}>
                  <View
                    style={[
                      styles.timelineDot,
                      completed && styles.timelineDotActive,
                      active && styles.timelineDotCurrent,
                    ]}
                  />
                  {i < STATUS_FLOW.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        completed && styles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    completed && styles.timelineLabelActive,
                    active && styles.timelineLabelCurrent,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            );
          })}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typePresets.h3,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 12,
    ...shadows.sm,
  },
  cardTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
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
  orderTotal: {
    ...typePresets.price,
    fontFamily: 'Rubik_700Bold',
    color: colors.primary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerName: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },
  customerDetail: {
    ...typePresets.body,
    color: colors.textSecondary,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemImage: {
    width: 48,
    height: 48,
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
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDotWrapper: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  timelineDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timelineDotCurrent: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: colors.border,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  timelineLabel: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  timelineLabelActive: {
    color: colors.text,
    fontFamily: 'NunitoSans_700Bold',
  },
  timelineLabelCurrent: {
    color: colors.primary,
    fontFamily: 'NunitoSans_700Bold',
  },
  actionsRow: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },

});
