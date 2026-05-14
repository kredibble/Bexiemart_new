import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts } from '@/theme/typography';

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
      {onApplyCoupon && !couponCode && (
        <View style={styles.couponInputRow}>
          <Input
            placeholder="Coupon code"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={{ marginBottom: 0, flex: 1 }}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    marginTop: 16,
    ...shadows.sm,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successSoft,
    borderRadius: radii.sm,
    padding: 10,
    marginTop: 8,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.success,
  },
  couponRemove: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.error,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  couponApplyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    minWidth: 76,
    alignItems: 'center',
  },
  couponApplyBtnDisabled: {
    opacity: 0.5,
  },
  couponApplyText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
  couponError: {
    fontFamily: fonts.body,
    fontSize: 12,
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
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  bold: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.text,
  },
  discount: {
    color: colors.success,
  },
});
