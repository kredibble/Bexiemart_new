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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchBar } from '@/components/ui/SearchBar';
import { Carousel, type CarouselItem } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProducts, useCategories, useWishlist } from '@/hooks/useProducts';
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
  } = useProducts({ });

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: wishlistItems } = useWishlist();

  // Flatten paginated products
  const products = useMemo(() => {
    return productsData?.pages?.flatMap((page) => page.data) ?? [];
  }, [productsData]);

  // Featured products (first 6)
  const featuredProducts = useMemo(() => products.slice(0, 6), [products]);

  // Wishlist lookup set for fast checks
  const wishlistProductIds = useMemo(() => {
    return new Set(wishlistItems?.map((item) => item.productId) ?? []);
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
            <Text style={styles.userName} numberOfLines={1}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {/* Notification dot */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
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
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loader}
          />
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

        {/* ── Featured Products ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity
            onPress={handleSeeAll}
            accessibilityRole="button"
            accessibilityLabel="See all products"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {productsLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
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
    <TouchableOpacity
      style={chipStyles.container}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${category.name}`}
    >
      {category.icon && (
        <Text style={chipStyles.icon}>{category.icon}</Text>
      )}
      <Text style={chipStyles.label}>{category.name}</Text>
    </TouchableOpacity>
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
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  userName: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.white,
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
    fontFamily: 'Raleway_700Bold',
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.primary,
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

  loader: {
    paddingVertical: 32,
  },
});

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
});
