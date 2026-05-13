/**
 * FoodScreen — Simplified product grid filtered to food category.
 *
 * Features:
 *  - Search bar
 *  - Horizontal category chips (All, Food, Beverages, Snacks)
 *  - 2-column product grid with delivery time badges
 *  - Pull-to-refresh + infinite scroll
 *  - Loading / error / empty states
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { colors, radii, shadows } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

// Simulated delivery time ranges per product (would come from API)
function getDeliveryEstimate(_product: Product): { min: number; max: number } {
  return { min: 15, max: 35 };
}

const FOOD_FILTERS = [
  { id: undefined as string | undefined, name: 'All' },
  { id: 'food', name: 'Food' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks' },
];

export default function FoodScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = useCartStore((state) => state.itemCount);

  const handleCartPress = useCallback(() => {
    (navigation as any).navigate('HomeTab', { screen: 'CartMain' });
  }, [navigation]);

  const {
    data: productsData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useProducts({
    category: selectedFilter,
    search: searchQuery || undefined,
  });

  const products = useMemo(
    () => (productsData?.pages?.flatMap((page) => page.data) ?? []).filter(Boolean),
    [productsData],
  );

  const handleProductPress = useCallback(
    (product: Product) => {
      (navigation as any).navigate('HomeTab', { screen: 'ProductDetails', params: { productId: product.id } });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderProductRow = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      const nextProduct = products[index + 1];
      if (index % 2 !== 0) return null;
      return (
        <View style={styles.row}>
          <FoodCard product={item} onPress={handleProductPress} />
          {nextProduct ? (
            <FoodCard product={nextProduct} onPress={handleProductPress} />
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      );
    },
    [products, handleProductPress],
  );

  const evenProducts = useMemo(
    () => products.filter((_, i) => i % 2 === 0),
    [products],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleCartPress}
          accessibilityRole="button"
          accessibilityLabel="View cart"
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {cartItemCount > 0 && <Badge count={cartItemCount} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Search food & drinks..."
          onDebouncedChange={setSearchQuery}
          showCancel
        />
      </View>

      <FlatList
        data={FOOD_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsList}
        keyExtractor={(item) => item.id ?? 'all'}
        renderItem={({ item }) => (
          <Chip
            label={item.name}
            isActive={item.id === selectedFilter}
            onPress={() => setSelectedFilter(item.id)}
          />
        )}
        style={styles.chipsContainer}
      />

      {isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load</Text>
          <Text style={styles.errorMessage}>{error?.message ?? 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={56} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptyMessage}>
            {searchQuery ? `No results for "${searchQuery}"` : 'Try a different category'}
          </Text>
        </View>
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
            isFetchingNextPage ? <LoadingSpinner size="small" /> : null
          }
        />
      )}
    </View>
  );
}

function FoodCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: (p: Product) => void;
}) {
  const delivery = getDeliveryEstimate(product);
  const imageUrl = product.images?.[0]?.url ?? product.imageUrl;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, GH₵ ${product.price}`}
    >
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.deliveryBadge}>
          <Ionicons name="time-outline" size={10} color={colors.white} />
          <Text style={styles.deliveryText}>{delivery.min}-{delivery.max} min</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.cardPrice}>GH₵ {product.price.toFixed(2)}</Text>
        {product.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 28, color: colors.text, letterSpacing: -0.5 },
  cartButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  searchSection: { paddingHorizontal: GRID_PADDING, paddingVertical: 12 },
  chipsContainer: { maxHeight: 48 },
  chipsList: { paddingHorizontal: GRID_PADDING, gap: 8 },
  gridContent: { paddingHorizontal: GRID_PADDING, paddingTop: 16, paddingBottom: 24 },
  row: { flexDirection: 'row', gap: GRID_GAP, marginBottom: GRID_GAP },
  card: {
    flex: 1, backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  cardImageWrapper: { position: 'relative', width: '100%', height: 140, backgroundColor: colors.borderLight },
  cardImage: { width: '100%', height: '100%' },
  deliveryBadge: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radii.full,
  },
  deliveryText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 11, color: colors.white },
  cardBody: { padding: 12, gap: 4 },
  cardName: { fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.text },
  cardPrice: { fontFamily: 'Rubik_600SemiBold', fontSize: 15, color: colors.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.textSecondary },
  centerContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12,
  },
  errorTitle: { fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.text },
  errorMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full, backgroundColor: colors.primary },
  retryBtnText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: colors.white },
  emptyTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: colors.text },
  emptyMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
