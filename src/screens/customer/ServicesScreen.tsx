/**
 * ServicesScreen — Campus services marketplace.
 *
 * Features:
 *  - Search bar
 *  - Category filter chips
 *  - 2-column animated service card grid
 *  - Pull-to-refresh
 *  - Loading / error / empty states
 *  - Tappable cards → ServiceDetails screen
 */
import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
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
import { useServices } from '@/hooks/useServices';
import { colors, radii, shadows } from '@/theme/colors';
import type { ServiceItem } from '@/api/services';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 16;
const GRID_PADDING = 20;

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'laundry', name: 'Laundry' },
  { id: 'printing', name: 'Printing' },
  { id: 'tutoring', name: 'Tutoring' },
  { id: 'repairs', name: 'Repairs' },
  { id: 'logistics', name: 'Logistics' },
];

const ServiceCard = ({ item, onPress }: { item: ServiceItem; onPress: (item: ServiceItem) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96, useNativeDriver: true, speed: 20, bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.price}`}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image ?? '' }}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{item.price}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function ServicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: servicesData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useServices({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery || undefined,
  });

  const services = useMemo(() => servicesData ?? [], [servicesData]);

  const filteredServices = useMemo(() => {
    let result = services;
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [services, selectedCategory, searchQuery]);

  const handleServicePress = useCallback(
    (item: ServiceItem) => {
      navigation.navigate('HomeMain'); // Navigate to service detail when implemented
    },
    [navigation],
  );

  const renderServiceCard = useCallback(
    ({ item }: { item: ServiceItem }) => (
      <ServiceCard item={item} onPress={handleServicePress} />
    ),
    [handleServicePress],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>
      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Search services..."
          onDebouncedChange={setSearchQuery}
          showCancel
        />
      </View>
      <View style={styles.chipsWrapper}>
        <FlatList
          data={SERVICE_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Chip
              label={item.name}
              isActive={item.id === selectedCategory}
              onPress={() => setSelectedCategory(item.id)}
            />
          )}
        />
      </View>
      {isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load services</Text>
          <Text style={styles.errorMessage}>{error?.message ?? 'Something went wrong'}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={56} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>Try a different category or search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: GRID_PADDING, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 28, color: colors.text, letterSpacing: -0.5 },
  searchSection: { paddingHorizontal: GRID_PADDING, paddingVertical: 12 },
  chipsWrapper: { marginBottom: 8 },
  chipsList: { paddingHorizontal: GRID_PADDING, gap: 8, paddingVertical: 4 },
  gridContent: { paddingHorizontal: GRID_PADDING, paddingTop: 8, paddingBottom: 32 },
  row: { gap: GRID_GAP, marginBottom: GRID_GAP },
  cardContainer: { flex: 1 },
  card: {
    flex: 1, backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  imageWrapper: { position: 'relative', width: '100%', height: 140, backgroundColor: colors.borderLight },
  cardImage: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radii.full, gap: 4, ...shadows.sm,
  },
  ratingText: { fontFamily: 'NunitoSans_700Bold', fontSize: 12, color: colors.text },
  cardBody: { padding: 14, gap: 6 },
  cardName: { fontFamily: 'NunitoSans_700Bold', fontSize: 15, color: colors.text, letterSpacing: -0.2 },
  cardDesc: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  cardFooter: { marginTop: 8 },
  cardPrice: { fontFamily: 'Rubik_600SemiBold', fontSize: 15, color: colors.primary },
  centerContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12,
  },
  errorTitle: { fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.text },
  errorMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full, backgroundColor: colors.primary },
  retryBtnText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: colors.white },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: colors.text },
  emptySubtitle: { fontFamily: 'NunitoSans_400Regular', fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
});
