/**
 * CartSummary — Price breakdown with optional coupon input.
 *
 * Displays subtotal, delivery fee, discount, and total.
 * Includes a coupon code field for applying discounts.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
  isApplyingCoupon?: boolean;
  couponError?: string;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  couponError,
}: CartSummaryProps) {
  const [inputCode, setInputCode] = useState('');

  const handleApply = () => {
    if (inputCode.trim() && onApplyCoupon) {
      onApplyCoupon(inputCode.trim());
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order Summary</Text>

      <SummaryRow label="Subtotal" value={subtotal} />
      <SummaryRow label="Delivery" value={deliveryFee} />

      {discount > 0 && (
        <SummaryRow label="Discount" value={-discount} isDiscount />
      )}

      {couponCode && (
        <View style={styles.couponRow}>
          <View style={styles.couponBadge}>
            <Ionicons name="pricetag" size={12} color={colors.success} />
            <Text style={styles.couponText}>{couponCode}</Text>
          </View>
          {onRemoveCoupon && (
            <TouchableOpacity
              onPress={onRemoveCoupon}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Remove coupon"
            >
              <Text style={styles.couponRemove}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Coupon input */}
      {onApplyCoupon && !couponCode && (
        <View style={styles.couponInputRow}>
          <TextInput
            style={styles.couponInput}
            placeholder="Coupon code"
            placeholderTextColor={colors.textLight}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.couponApplyBtn,
              (!inputCode.trim() || isApplyingCoupon) && styles.couponApplyBtnDisabled,
            ]}
            onPress={handleApply}
            disabled={!inputCode.trim() || isApplyingCoupon}
          >
            {isApplyingCoupon ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.couponApplyText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {couponError && (
        <Text style={styles.couponError}>{couponError}</Text>
      )}

      <View style={styles.divider} />
      <SummaryRow label="Total" value={total} isBold />
    </View>
  );
}

/* ── SummaryRow ─────────────────────────────────────────────────────────── */

function SummaryRow({
  label,
  value,
  isBold = false,
  isDiscount = false,
}: {
  label: string;
  value: number;
  isBold?: boolean;
  isDiscount?: boolean;
}) {
  return (
    <View style={summaryStyles.row}>
      <Text style={[summaryStyles.label, isBold && summaryStyles.bold]}>
        {label}
      </Text>
      <Text
        style={[
          summaryStyles.value,
          isBold && summaryStyles.bold,
          isDiscount && summaryStyles.discount,
        ]}
      >
        {isDiscount ? '-GH₵ ' : 'GH₵ '}{Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    marginTop: 16,
    ...shadows.sm,
  },
  title: {
    ...typePresets.h5,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successSoft,
    borderRadius: radii.sm,
    padding: 8,
    marginTop: 8,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponText: {
    ...typePresets.caption,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.success,
  },
  couponRemove: {
    ...typePresets.caption,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.error,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...typePresets.body,
    color: colors.text,
  },
  couponApplyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    minWidth: 72,
    alignItems: 'center',
  },
  couponApplyBtnDisabled: {
    opacity: 0.5,
  },
  couponApplyText: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.white,
  },
  couponError: {
    ...typePresets.caption,
    color: colors.error,
    marginTop: 6,
  },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...typePresets.body,
    color: colors.textSecondary,
  },
  value: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_500Medium',
    color: colors.text,
  },
  bold: {
    ...typePresets.h5,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  discount: {
    color: colors.success,
  },
});
