/**
 * FavoritesScreen — User's wishlist / saved products.
 *
 * Shows a 2-column grid of saved products. Uses the wishlist API hooks.
 * EmptyState shown when no items are saved.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useProducts';
import { colors } from '@/theme/colors';
import type { Product } from '@/types';

const GRID_GAP = 12;
const GRID_PADDING = 20;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: wishlistItems, isLoading, refetch, isRefetching } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const products: Product[] = useMemo(() => {
    return wishlistItems?.map((item) => item.product) ?? [];
  }, [wishlistItems]);

  const handleProductPress = useCallback((product: Product) => {
    // Navigate to product details (works from any tab)
    (navigation as any).navigate('HomeTab', {
      screen: 'ProductDetails',
      params: { productId: product.id },
    });
  }, [navigation]);

  const handleRemoveFavorite = useCallback((productId: string) => {
    const wishlistItem = wishlistItems?.find((item) => item.productId === productId);
    if (wishlistItem) {
      removeFromWishlist(wishlistItem.id);
    }
  }, [wishlistItems, removeFromWishlist]);

  // Render pairs for 2-column grid
  const evenProducts = useMemo(
    () => products.filter((_, index) => index % 2 === 0),
    [products]
  );

  const renderRow = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      const actualIndex = index * 2;
      const nextProduct = products[actualIndex + 1];
      return (
        <View style={styles.row}>
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              onPress={handleProductPress}
              isFavorite
              onToggleFavorite={handleRemoveFavorite}
            />
          </View>
          {nextProduct ? (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={nextProduct}
                onPress={handleProductPress}
                isFavorite
                onToggleFavorite={handleRemoveFavorite}
              />
            </View>
          ) : (
            <View style={styles.cardWrapper} />
          )}
        </View>
      );
    },
    [products, handleProductPress, handleRemoveFavorite]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        {products.length > 0 && (
          <Text style={styles.headerCount}>{products.length} items</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          iconColor={colors.error}
          title="No Saved Items"
          subtitle="Items you save will appear here. Start browsing to find products you love!"
          actionLabel="Browse Products"
          onAction={() => (navigation as any).navigate('ShopTab')}
        />
      ) : (
        <FlatList
          data={evenProducts}
          renderItem={renderRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
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
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  cardWrapper: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
