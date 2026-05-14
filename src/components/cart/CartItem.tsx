import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { CartItem as CartItemType } from '@/types';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts } from '@/theme/typography';

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
    item.product?.images?.[0]?.url ?? '';

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
          GH₵ {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
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
        {lowStock && (
          <Text style={styles.lowStock}>Only {stock} left</Text>
        )}
        {outOfStock && (
          <Text style={styles.outOfStock}>Out of stock</Text>
        )}
      </View>
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
    padding: 14,
    marginBottom: 12,
    gap: 14,
    ...shadows.sm,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: radii.lg,
    backgroundColor: colors.borderLight,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  price: {
    fontFamily: fonts.headingSemi,
    fontSize: 15,
    color: colors.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  qtyButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quantity: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  lowStock: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.warning,
    marginTop: 2,
  },
  outOfStock: {
    fontFamily: fonts.body,
    fontSize: 12,
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
