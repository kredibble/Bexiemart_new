/**
 * ShopScreen — Product browsing with category filters.
 *
 * Features:
 *  - Sticky search bar at top
 *  - Horizontal filter chips (All, + categories)
 *  - Infinite-scroll 2-column product grid
 *  - Pull-to-refresh
 *  - Empty state for no results
 */
import React, { useCallback, useMemo, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchBar } from '@/components/ui/SearchBar';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProducts, useCategories, useWishlist } from '@/hooks/useProducts';
import { colors, radii } from '@/theme/colors';
import type { ShopStackParamList } from '@/navigation/CustomerTabs';
import type { Product, Category } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

type NavigationProp = NativeStackNavigationProp<ShopStackParamList, 'ShopMain'>;

export default function ShopScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Data hooks
  const {
    data: productsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useProducts({
    category: selectedCategory,
    search: searchQuery || undefined,
  });

  const { data: categories } = useCategories();
  const { data: wishlistItems } = useWishlist();

  // Flatten paginated products
  const products = useMemo(() => {
    return productsData?.pages?.flatMap((page) => page.data) ?? [];
  }, [productsData]);

  // Wishlist lookup
  const wishlistProductIds = useMemo(() => {
    return new Set(wishlistItems?.map((item) => item.productId) ?? []);
  }, [wishlistItems]);

  // Handlers
  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  }, [navigation]);

  const handleCategoryFilter = useCallback((categoryId?: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Build filter chips: "All" + categories
  const filterChips = useMemo(() => {
    const allChip = { id: undefined as string | undefined, name: 'All' };
    const categoryChips = (categories ?? []).map((category) => ({
      id: category.id as string | undefined,
      name: category.name,
    }));
    return [allChip, ...categoryChips];
  }, [categories]);

  // Render product pair (2 items per row)
  const renderProductRow = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      // We render pairs, so only render on even indices
      const nextProduct = products[index + 1];

      if (index % 2 !== 0) return null;

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

  // Only render even-indexed items for our row approach
  const evenProducts = useMemo(
    () => products.filter((_, index) => index % 2 === 0),
    [products]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
      </View>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Search products..."
          onDebouncedChange={handleSearch}
          showCancel
        />
      </View>

      {/* ── Filter chips ────────────────────────────────────────────── */}
      <FlatList
        data={filterChips}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsList}
        keyExtractor={(item) => item.id ?? 'all'}
        renderItem={({ item }) => {
          const isActive = item.id === selectedCategory;
          return (
            <TouchableOpacity
              style={[
                styles.chip,
                isActive && styles.chipActive,
              ]}
              onPress={() => handleCategoryFilter(item.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        style={styles.chipsContainer}
      />

      {/* ── Product grid ────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Products Found"
          subtitle={searchQuery ? `No results for "${searchQuery}"` : 'Try a different category'}
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory(undefined);
            setSearchQuery('');
          }}
        />
      ) : (
        <FlatList
          data={evenProducts}
          renderItem={renderProductRow}
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
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.footerLoader}
              />
            ) : null
          }
        />
      )}
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
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  searchSection: {
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 12,
  },
  chipsContainer: {
    maxHeight: 48,
  },
  chipsList: {
    paddingHorizontal: GRID_PADDING,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
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
  footerLoader: {
    paddingVertical: 20,
  },
});
