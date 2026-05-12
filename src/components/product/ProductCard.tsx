/**
 * ProductCard — The primary product display component.
 *
 * Used across HomeScreen, ShopScreen, AllProductsScreen, FavoritesScreen.
 * Designed for a 2-column grid layout. Shows product image, name, price,
 * rating, and a wishlist toggle heart.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radii } from '@/theme/colors';
import { formatCurrency } from '@/utils/format';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  /** Whether the product is in the user's wishlist */
  isFavorite?: boolean;
  /** Toggle wishlist handler */
  onToggleFavorite?: (productId: string) => void;
  /** Card width — controlled by parent grid layout */
  width?: number | string;
}

export function ProductCard({
  product,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  width,
}: ProductCardProps) {
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  const handleFavoritePress = useCallback(() => {
    setLocalFavorite((prev) => !prev);
    onToggleFavorite?.(product.id);
  }, [product.id, onToggleFavorite]);

  const primaryImage = product.images?.find((img) => img.isPrimary)?.url
    ?? product.images?.[0]?.url;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const formattedPrice = formatCurrency(product.price);
  const formattedOriginalPrice = hasDiscount
    ? formatCurrency(product.compareAtPrice!)
    : null;

  return (
    <TouchableOpacity
      style={[styles.container, width ? { width: width as number } : styles.flexContainer]}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formattedPrice}`}
      accessibilityHint="Opens product details"
    >
      {/* Image container */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: primaryImage }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ thumbhash: 'rEgGFwB3d3d3d4iIeJh3d4hwiA' }}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Favorite heart */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={localFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons
              name={localFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={localFavorite ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating row */}
        {product.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
          </View>
        )}

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          {formattedOriginalPrice && (
            <Text style={styles.originalPrice}>{formattedOriginalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  flexContainer: {
    flex: 1,
  },
  imageWrapper: {
    aspectRatio: 1,
    backgroundColor: colors.borderLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  discountText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.white,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' },
    }),
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.error,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.text,
  },
  reviewCount: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: colors.textLight,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  originalPrice: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
});
