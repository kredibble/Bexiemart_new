/**
 * AllProductsScreen — Filtered product grid with dynamic title.
 *
 * Reached from: HomeScreen "See All", CategoryChip press, or search submit.
 * Shows a full paginated grid with back navigation.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProducts, useWishlist } from '@/hooks/useProducts';
import { colors, shadows } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AllProducts'>;
type RoutePropType = RouteProp<HomeStackParamList, 'AllProducts'>;

export default function AllProductsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();

  const { category, title } = route.params ?? {};

  const {
    data: productsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useProducts({ category });

  const { data: wishlistItems } = useWishlist();

  const products = useMemo(() => {
    return productsData?.pages?.flatMap((page) => page.data) ?? [];
  }, [productsData]);

  const wishlistProductIds = useMemo(() => {
    return new Set(wishlistItems?.map((item) => item.productId) ?? []);
  }, [wishlistItems]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render 2 cards per row
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
              isFavorite={wishlistProductIds.has(item.id)}
              onToggleFavorite={() => {}}
            />
          </View>
          {nextProduct ? (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={nextProduct}
                onPress={handleProductPress}
                isFavorite={wishlistProductIds.has(nextProduct.id)}
                onToggleFavorite={() => {}}
              />
            </View>
          ) : (
            <View style={styles.cardWrapper} />
          )}
        </View>
      );
    },
    [products, handleProductPress, wishlistProductIds]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? 'All Products'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="bag-outline"
          title="No Products Found"
          subtitle="Nothing here yet. Check back soon!"
        />
      ) : (
        <FlatList
          data={evenProducts}
          renderItem={renderRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 20 }} />
            ) : null
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    letterSpacing: -0.3,
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
