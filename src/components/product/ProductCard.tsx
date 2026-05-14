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
import { fonts } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
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
    ?? product.images?.[0]?.url ?? '';

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
      style={[styles.container, width ? { width: width as number } : { flex: 1 }]}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formattedPrice}`}
      accessibilityHint="Opens product details"
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: primaryImage }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={{ thumbhash: 'rEgGFwB3d3d3d4iIeJh3d4hwiA' }}
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
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
        {product.stock <= 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
          </View>
        )}
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
    ...shadows.sm,
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
    top: 10,
    left: 10,
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  discountText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.white,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' },
    }),
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.error,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontFamily: fonts.bodySemi,
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
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.text,
  },
  reviewCount: {
    fontFamily: fonts.body,
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
    fontFamily: fonts.headingSemi,
    fontSize: 15,
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
});
