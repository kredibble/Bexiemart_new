/**
 * CartScreen — Shopping cart with item list, quantity controls, and checkout CTA.
 *
 * Features:
 *  - Cart item list with product image, name, price, quantity controls
 *  - Order summary section (subtotal, delivery, total)
 *  - Sticky checkout button at bottom
 *  - Empty state with CTA to browse shop
 *  - Swipe-to-delete (future enhancement)
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/stores/cartStore';
import { useRemoveFromCart } from '@/hooks/useCart';
import { colors, shadows, radii } from '@/theme/colors';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const cart = useCartStore((state) => state.cart);
  const isLoaded = useCartStore((state) => state.isLoaded);
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();

  const cartItems = cart?.items ?? [];

  const handleRemoveItem = useCallback((cartItemId: string) => {
    removeItem(cartItemId);
  }, [removeItem]);

  const handleCheckout = useCallback(() => {
    (navigation as any).navigate('Checkout');
  }, [navigation]);

  const handleContinueShopping = useCallback(() => {
    (navigation as any).navigate('ShopTab');
  }, [navigation]);

  // Order summary calculations
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = subtotal > 0 ? 500 : 0; // placeholder delivery fee
  const total = subtotal + deliveryFee - (cart?.discount ?? 0);

  // Render cart item
  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemRow
        item={item}
        onRemove={handleRemoveItem}
      />
    ),
    [handleRemoveItem]
  );

  // Show empty state if cart is empty or not loaded
  if (isLoaded && cartItems.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          subtitle="Looks like you haven't added anything to your cart yet."
          actionLabel="Start Shopping"
          onAction={handleContinueShopping}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <Text style={styles.headerCount}>{cartItems.length} items</Text>
        )}
      </View>

      {/* Cart items */}
      {!isLoaded ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <SummaryRow label="Subtotal" value={subtotal} />
              <SummaryRow label="Delivery" value={deliveryFee} />
              {(cart?.discount ?? 0) > 0 && (
                <SummaryRow label="Discount" value={-(cart?.discount ?? 0)} isDiscount />
              )}
              <View style={styles.summaryDivider} />
              <SummaryRow label="Total" value={total} isBold />
            </View>
          }
        />
      )}

      {/* Sticky checkout button */}
      {cartItems.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.bottomTotal}>
            <Text style={styles.bottomTotalLabel}>Total</Text>
            <Text style={styles.bottomTotalValue}>
              {'\u20A6'}{total.toLocaleString()}
            </Text>
          </View>
          <View style={styles.checkoutWrapper}>
            <Button
              title="Checkout"
              onPress={handleCheckout}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ── CartItemRow sub-component ───────────────────────────────────────────────────

interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const primaryImage = item.product?.images?.find((img) => img.isPrimary)?.url
    ?? item.product?.images?.[0]?.url;

  return (
    <View style={itemStyles.container}>
      <Image
        source={{ uri: primaryImage }}
        style={itemStyles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={itemStyles.info}>
        <Text style={itemStyles.name} numberOfLines={2}>
          {item.product?.name ?? 'Product'}
        </Text>
        <Text style={itemStyles.price}>
          {'\u20A6'}{item.unitPrice.toLocaleString()}
        </Text>
        <Text style={itemStyles.quantity}>Qty: {item.quantity}</Text>
      </View>
      <TouchableOpacity
        style={itemStyles.removeButton}
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.product?.name} from cart`}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

// ── SummaryRow sub-component ────────────────────────────────────────────────────

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
        {isDiscount ? '-' : ''}{'\u20A6'}{Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    marginTop: 16,
    ...shadows.sm,
  },
  summaryTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)' },
    }),
  },
  bottomTotal: {
    gap: 2,
  },
  bottomTotalLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  bottomTotalValue: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  checkoutWrapper: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const itemStyles = StyleSheet.create({
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
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  price: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  quantity: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
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

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  bold: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  discount: {
    color: colors.success,
  },
});
