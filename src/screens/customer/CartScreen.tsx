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
import React, { useCallback, useMemo, useState } from 'react';
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
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useCartStore } from '@/stores/cartStore';
import { useGetCart, useRemoveFromCart } from '@/hooks/useCart';
import { useValidateCoupon } from '@/hooks/useCoupon';
import { CartSummary } from '@/components/cart/CartSummary';
import { colors, radii, shadows } from '@/theme/colors';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const cart = useCartStore((state) => state.cart);
  const isLoaded = useCartStore((state) => state.isLoaded);
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();
  const { isError, error, refetch, isLoading: cartLoading, isRefetching } = useGetCart();

  const { validateCoupon, appliedCoupon, discountAmount, clearCoupon } = useValidateCoupon();

  const cartItems = cart?.items ?? [];

  // Order summary calculations
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = subtotal > 0 ? 500 : 0; // placeholder delivery fee
  const couponDiscount = discountAmount > 0 ? discountAmount : (cart?.discount ?? 0);
  const total = subtotal + deliveryFee - couponDiscount;

  const handleRemoveItem = useCallback((cartItemId: string) => {
    removeItem(cartItemId);
  }, [removeItem]);

  const handleCheckout = useCallback(() => {
    (navigation as any).navigate('Checkout', {
      couponCode: appliedCoupon?.code,
      discountAmount: couponDiscount > 0 ? couponDiscount : undefined,
    });
  }, [navigation, appliedCoupon?.code, couponDiscount]);

  const handleContinueShopping = useCallback(() => {
    (navigation as any).navigate('ShopTab');
  }, [navigation]);

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

  // Error state
  if (isError && !cartLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textLight} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load cart'}</Text>
          <Button variant="default" style={styles.retryBtn} onPress={() => refetch()}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.white }}>Try Again</Text>
          </Button>
        </View>
      </View>
    );
  }

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
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListFooterComponent={
            <CartSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discount={couponDiscount}
              total={total}
              couponCode={appliedCoupon?.code}
              onApplyCoupon={(code) => validateCoupon.mutate({ code, cartTotal: subtotal })}
              onRemoveCoupon={clearCoupon}
              isApplyingCoupon={validateCoupon.isPending}
              couponError={validateCoupon.error?.message}
            />
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
    ?? item.product?.images?.[0]?.url ?? '';

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
    fontFamily: 'Rubik_700Bold',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  bottomTotalValue: {
    fontFamily: 'Rubik_700Bold',
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
  },
  errorMessage: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  price: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  quantity: {
    fontFamily: 'NunitoSans_400Regular',
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


