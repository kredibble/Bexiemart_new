/**
 * CartItem — Product display in the cart with quantity controls.
 *
 * Features:
 *  - Product image, name, price
 *  - Quantity +/- buttons (min 1, max stock)
 *  - Stock warning when ≤5 left
 *  - Remove button
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { CartItem as CartItemType } from '@/types';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface CartItemProps {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

export function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  isUpdating = false,
}: CartItemProps) {
  const primaryImage =
    item.product?.images?.find((img) => img.isPrimary)?.url ??
    item.product?.images?.[0]?.url;

  const stock = item.product?.stock ?? 0;
  const lowStock = stock > 0 && stock <= 5;
  const outOfStock = stock === 0;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: primaryImage }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        placeholder={colors.borderLight}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product?.name ?? 'Product'}
        </Text>
        <Text style={styles.price}>
          ₦{item.unitPrice.toLocaleString()}
        </Text>

        {/* Quantity controls */}
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.qtyButton, item.quantity <= 1 && styles.qtyButtonDisabled]}
            onPress={onDecrement}
            disabled={item.quantity <= 1 || isUpdating}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
          >
            <Ionicons
              name="remove"
              size={16}
              color={item.quantity <= 1 ? colors.textLight : colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={[styles.qtyButton, item.quantity >= stock && styles.qtyButtonDisabled]}
            onPress={onIncrement}
            disabled={item.quantity >= stock || isUpdating}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
          >
            <Ionicons
              name="add"
              size={16}
              color={item.quantity >= stock ? colors.textLight : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Stock warning */}
        {lowStock && (
          <Text style={styles.lowStock}>Only {stock} left</Text>
        )}
        {outOfStock && (
          <Text style={styles.outOfStock}>Out of stock</Text>
        )}
      </View>

      {/* Remove button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        disabled={isUpdating}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.product?.name} from cart`}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    ...shadows.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.borderLight,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    ...typePresets.body,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.text,
    lineHeight: 20,
  },
  price: {
    ...typePresets.priceSm,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  qtyButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quantity: {
    ...typePresets.body,
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  lowStock: {
    ...typePresets.bodySm,
    color: colors.warning,
    marginTop: 2,
  },
  outOfStock: {
    ...typePresets.bodySm,
    color: colors.error,
    marginTop: 2,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
