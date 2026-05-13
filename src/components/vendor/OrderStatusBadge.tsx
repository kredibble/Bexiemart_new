/**
 * OrderStatusBadge — Color-coded status badge for vendor orders.
 *
 * Displays the current order status with appropriate colors.
 * Statuses: pending, confirmed, processing, shipped, delivered, cancelled
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { OrderStatus } from '@/types';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.pending, text: colors.pendingText, label: 'Pending' },
  confirmed: { bg: colors.confirmed, text: colors.confirmedText, label: 'Confirmed' },
  processing: { bg: colors.processing, text: colors.processingText, label: 'Processing' },
  shipped: { bg: colors.shipped, text: colors.shippedText, label: 'Shipped' },
  delivered: { bg: colors.delivered, text: colors.deliveredText, label: 'Delivered' },
  cancelled: { bg: colors.cancelled, text: colors.cancelledText, label: 'Cancelled' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typePresets.labelSm,
    fontFamily: 'NunitoSans_700Bold',
  },
});
