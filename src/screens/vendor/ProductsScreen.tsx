/**
 * ProductsScreen — Vendor product list with CRUD actions.
 *
 * Features:
 *  - Premium list of vendor's products with image, name, price, stock badge
 *  - Tap product → ProductDetail screen
 *  - "Add Product" FAB button → AddEditProductScreen
 *  - Pull-to-refresh
 *  - Empty state, loading skeletons, error with retry
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useVendorProducts, useDeleteProduct } from '@/hooks/useVendor';
import { colors, radii, shadows } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { ToastEmitter } from '@/utils/toastEmitter';

type NavProp = NativeStackNavigationProp<any>;

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const { data: products, isLoading, isError, error, refetch, isRefetching } = useVendorProducts();
  const deleteMutation = useDeleteProduct();
  const confirm = useConfirm();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleAdd = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    (navigation as any).navigate('AddEditProduct', { mode: 'add' });
  };

  const handleEdit = (product: Product) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    (navigation as any).navigate('AddEditProduct', { mode: 'edit', product });
  };

  const handleDelete = async (id: string, name: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      destructive: true,
      confirmLabel: 'Delete',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      const isOutOfStock = (item.quantity ?? item.stock) <= 0;
      return (
        <Animated.View
          entering={FadeInUp.delay(index * 50).springify().damping(14)}
          layout={Layout.springify()}
        >
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <View style={styles.productImageWrapper}>
              {item.images?.[0]?.url ? (
                <Image source={{ uri: item.images[0].url }} style={styles.productImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={28} color={colors.textLighter} />
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>

              <View style={styles.productFooter}>
                <View style={styles.stockRow}>
                  <View style={[styles.stockDot, { backgroundColor: isOutOfStock ? colors.error : colors.success }]} />
                  <Text style={[styles.stockText, { color: isOutOfStock ? colors.error : colors.success }]}>
                    {isOutOfStock ? 'Out of stock' : `${item.quantity ?? item.stock} in stock`}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleEdit(item);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Edit product"
                  >
                    <Ionicons name="pencil-outline" size={14} color={colors.textLight} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleDelete(item.id, item.name);
                    }}
                    disabled={deleteMutation.isPending}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Delete product"
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [deleteMutation.isPending]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Animated.Text entering={FadeInDown.springify()} style={styles.headerTitle}>
          My Products
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Add Product"
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <SkeletonCard />
            </View>
          ))}
        </View>
      ) : isError ? (
        /* Error State */
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load products'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.white }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Product List */
        <FlatList
          data={products ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No products yet"
              subtitle="Add your first product to start selling to your customers."
              actionLabel="Add Product"
              onAction={handleAdd}
            />
          }
        />
      )}
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerTitle: {
    ...typePresets.h1,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  /* Product Card */
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 16,
    marginBottom: 12,
    gap: 16,
    ...shadows.sm,
  },
  productImageWrapper: {
    width: 104,
    height: 104,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  productName: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  productPrice: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 20,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  /* Error State */
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    ...typePresets.h3,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typePresets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.text,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radii.full,
  },
});
