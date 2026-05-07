/**
 * ProductDetailsScreen — Full product view with gallery, info, and add-to-cart.
 *
 * Sections:
 *  - Image gallery (carousel)
 *  - Product info (name, price, rating, description)
 *  - Vendor badge
 *  - Add to cart button (sticky bottom)
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';

import { Carousel, type CarouselItem } from '@/components/ui/Carousel';
import { Button } from '@/components/ui/Button';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { colors, shadows, radii } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoutePropType = RouteProp<HomeStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();

  const { productId } = route.params;
  const { data: product, isLoading } = useProduct(productId);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({ productId: product.id, quantity });
  }, [product, quantity, addToCart]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Loading state
  if (isLoading || !product) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const carouselItems: CarouselItem[] = (product.images ?? []).map((img) => ({
    id: img.id,
    image: img.url,
  }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Floating back button ──────────────────────────────────────── */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Share product"
        >
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Image gallery ────────────────────────────────────────────── */}
        {carouselItems.length > 0 ? (
          <Carousel
            items={carouselItems}
            height={SCREEN_WIDTH * 0.85}
            autoPlay={false}
            borderRadius={0}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { height: SCREEN_WIDTH * 0.85 }]}>
            <Ionicons name="image-outline" size={64} color={colors.textLighter} />
          </View>
        )}

        {/* ── Product Info Card ─────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          {/* Category badge */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.name}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {product.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>
                ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{'\u20A6'}{product.price.toLocaleString()}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>
                  {'\u20A6'}{product.compareAtPrice!.toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Vendor info */}
          {product.vendor && (
            <View style={styles.vendorRow}>
              <Ionicons name="storefront-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.vendorName}>{product.vendor.shopName}</Text>
              {product.vendor.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              )}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Stock info */}
          <View style={styles.stockRow}>
            <Ionicons
              name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={product.stock > 0 ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.stock > 0 ? colors.successDark : colors.error },
              ]}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky bottom CTA ──────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {/* Quantity selector */}
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
          >
            <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.textLighter : colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
          >
            <Ionicons name="add" size={18} color={quantity >= product.stock ? colors.textLighter : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Add to cart button */}
        <View style={styles.addToCartWrapper}>
          <Button
            title={product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            onPress={handleAddToCart}
            loading={isAddingToCart}
            disabled={product.stock <= 0}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Image
  imagePlaceholder: {
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info card
  infoCard: {
    padding: 20,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginBottom: 4,
  },
  categoryText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  productName: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  reviewCountText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 26,
    color: colors.text,
  },
  originalPrice: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.errorSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.md,
  },
  discountText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.error,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vendorName: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  descriptionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  stockText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    }),
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartWrapper: {
    flex: 1,
  },
});
