/**
 * HomeScreen — The main customer landing screen after login.
 *
 * Sections (top-to-bottom):
 *  1. Header — greeting + notification bell
 *  2. SearchBar — navigates to shop with query
 *  3. Promo Carousel — auto-scrolling banners
 *  4. Category Pills — horizontal scrollable chips
 *  5. Featured Products — 2-column grid with "See All" link
 *
 * Uses TanStack Query hooks for data + Zustand for cart state.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchBar } from '@/components/ui/SearchBar';
import { Carousel, type CarouselItem } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { useProducts, useCategories, useWishlist } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { colors, shadows, radii } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { Product, Category } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  // Data hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
    isRefetching,
    isError: productsError,
    error: productsErrorObj,
  } = useProducts({ });

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj,
    refetch: refetchCategories,
  } = useCategories();
  const { data: wishlistItems } = useWishlist();

  // Flatten paginated products
  const products = useMemo(() => {
    return (productsData?.pages?.flatMap((page) => page.data) ?? []).filter(Boolean);
  }, [productsData]);

  // Featured products (first 6)
  const featuredProducts = useMemo(() => products.slice(0, 6), [products]);

  // Flash sale: products with discount
  const flashSaleProducts = useMemo(() => products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 8), [products]);

  // New items: first 4 (already sorted by newest)
  const newItems = useMemo(() => products.slice(0, 4), [products]);

  // Wishlist lookup set for fast checks
  const wishlistProductIds = useMemo(() => {
    const items = Array.isArray(wishlistItems) ? wishlistItems : [];
    return new Set(items.map((item) => item.productId));
  }, [wishlistItems]);

  // Promotional banners (placeholder data for now — will come from API)
  const promoBanners: CarouselItem[] = useMemo(() => [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    },
  ], []);

  // Handlers
  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  }, [navigation]);

  const handleCategoryPress = useCallback((category: Category) => {
    navigation.navigate('AllProducts', {
      category: category.id,
      title: category.name,
    });
  }, [navigation]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('AllProducts', {});
  }, [navigation]);

  const handleSearchSubmit = useCallback((query: string) => {
    navigation.navigate('AllProducts', { title: `"${query}"` });
  }, [navigation]);

  const handleFavoritesPress = useCallback(() => {
    navigation.navigate('FavoritesMain');
  }, [navigation]);

  const handleWalletPress = useCallback(() => {
    navigation.navigate('WalletMain');
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  if (productsError || categoriesError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textLight} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {(productsErrorObj ?? categoriesErrorObj)?.message || 'Failed to load data'}
          </Text>
          <Button variant="default" style={styles.retryBtn} onPress={() => { refetchProducts(); refetchCategories(); }}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.white }}>Try Again</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting},</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.userName} numberOfLines={1}>{firstName}</Text>
              <Ionicons name="hand-left-outline" size={20} color={colors.text} />
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleWalletPress}
              accessibilityRole="button"
              accessibilityLabel="Wallet"
              activeOpacity={0.7}
            >
              <Ionicons name="wallet-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFavoritesPress}
              accessibilityRole="button"
              accessibilityLabel="Favorites"
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={24} color={colors.text} />
              {Array.isArray(wishlistItems) && wishlistItems.length > 0 && (
                <Badge count={wishlistItems.length} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotificationsPress}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Badge count={1} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search ──────────────────────────────────────────────────── */}
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Search products, brands..."
            onSubmit={handleSearchSubmit}
          />
        </View>

        {/* ── Promo Carousel ──────────────────────────────────────────── */}
        <View style={styles.carouselSection}>
          <Carousel
            items={promoBanners}
            height={160}
            containerPadding={GRID_PADDING}
            borderRadius={16}
          />
        </View>

        {/* ── Categories ──────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        {categoriesLoading ? (
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={36} borderRadius={18} />
            ))}
          </View>
        ) : (
          <FlatList
            data={categories ?? []}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryChip
                category={item}
                onPress={handleCategoryPress}
              />
            )}
          />
        )}

        {/* ── Flash Sale ────────────────────────────────────────────── */}
        {flashSaleProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="flash" size={20} color={colors.error} />
                <Text style={styles.sectionTitle}>Flash Sale</Text>
                <View style={styles.flashBadge}>
                  <Text style={styles.flashBadgeText}>Ends in 02:34:15</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleSeeAll} accessibilityRole="button" accessibilityLabel="View all flash sale">
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={flashSaleProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.flashCard}
                  onPress={() => handleProductPress(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <Image source={{ uri: item.images?.[0]?.url }} style={styles.flashImage} />
                  <Text style={styles.flashName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.flashPriceRow}>
                    <Text style={styles.flashPrice}>GH₵ {item.price}</Text>
                    {item.compareAtPrice && (
                      <Text style={styles.flashOldPrice}>GH₵ {item.compareAtPrice}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* ── Categories ──────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        {productsLoading ? (
          <View style={styles.productGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.productCardWrapper,
                  i % 2 === 0 ? { marginRight: GRID_GAP / 2 } : { marginLeft: GRID_GAP / 2 },
                ]}
              >
                <SkeletonCard />
              </View>
            ))}
          </View>
        ) : featuredProducts.length === 0 ? (
          <EmptyState
            icon="bag-outline"
            title="No Products Yet"
            subtitle="Check back soon for amazing deals!"
          />
        ) : (
          <View style={styles.productGrid}>
            {featuredProducts.map((product, index) => (
              <View
                key={product.id}
                style={[
                  styles.productCardWrapper,
                  index % 2 === 0 ? { marginRight: GRID_GAP / 2 } : { marginLeft: GRID_GAP / 2 },
                ]}
              >
                <ProductCard
                  product={product}
                  onPress={handleProductPress}
                  isFavorite={wishlistProductIds.has(product.id)}
                  onToggleFavorite={() => {}}
                />
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ── CategoryChip sub-component ──────────────────────────────────────────────────

interface CategoryChipProps {
  category: Category;
  onPress: (category: Category) => void;
}

function CategoryChip({ category, onPress }: CategoryChipProps) {
  return (
    <Chip
      label={category.name}
      leftIcon={category.icon ? <Text style={{ fontSize: 16 }}>{category.icon}</Text> : undefined}
      onPress={() => onPress(category)}
      accessibilityLabel={`Browse ${category.name}`}
    />
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  userName: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },


  // Search
  searchSection: {
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 12,
  },

  // Carousel
  carouselSection: {
    paddingHorizontal: GRID_PADDING,
    marginBottom: 8,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },

  // Flash Sale
  flashBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flashBadgeText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 11,
    color: colors.error,
  },
  flashList: {
    paddingHorizontal: GRID_PADDING,
    gap: 10,
  },
  flashCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 8,
    ...shadows.sm,
  },
  flashImage: {
    width: 124,
    height: 124,
    borderRadius: radii.sm,
    resizeMode: 'cover',
  },
  flashName: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.text,
    marginTop: 6,
  },
  flashPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  flashPrice: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  flashOldPrice: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  // Categories
  categoriesList: {
    paddingHorizontal: GRID_PADDING,
    gap: 10,
  },

  // Products Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
  },
  productCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: GRID_GAP,
  },

  // Error state
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
