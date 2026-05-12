/**
 * ProductsScreen — Vendor product list with CRUD actions.
 *
 * Features:
 *  - Grid of vendor's products with image, name, price, stock badge
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
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useVendorProducts, useDeleteProduct } from '@/hooks/useVendor';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Product } from '@/types';

type NavProp = NativeStackNavigationProp<any>;

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const { data: products, isLoading, refetch, isRefetching } = useVendorProducts();
  const deleteMutation = useDeleteProduct();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleAdd = () => {
    (navigation as any).navigate('AddEditProduct', { mode: 'add' });
  };

  const handleEdit = (product: Product) => {
    (navigation as any).navigate('AddEditProduct', { mode: 'edit', product });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageWrapper}
          onPress={() => handleEdit(item)}
        >
          {item.images?.[0]?.url ? (
            <Image source={{ uri: item.images[0].url }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color={colors.textLight} />
            </View>
          )}
          {(item.quantity ?? item.stock) === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.productMeta}>
            <View style={[styles.stockBadge, { backgroundColor: (item.quantity ?? item.stock) > 0 ? colors.successSoft : colors.errorSoft }]}>
              <Text style={[styles.stockText, { color: (item.quantity ?? item.stock) > 0 ? colors.success : colors.error }]}>
                {(item.quantity ?? item.stock) > 0 ? `${item.quantity ?? item.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              variant="secondary"
              size="sm"
              style={{ flex: 1, borderRadius: radii.md }}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.primary }}>Edit</Text>
            </Button>
            <Button
              variant="danger"
              size="sm"
              style={{ flex: 1, borderRadius: radii.md }}
              onPress={() => handleDelete(item.id)}
              disabled={deleteMutation.isPending}
            >
              <Ionicons name="trash-outline" size={16} color={colors.white} />
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.white }}>Delete</Text>
            </Button>
          </View>
        </View>
      </View>
    ),
    [deleteMutation.isPending]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <Button
          variant="default"
          style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0, minHeight: 40 }}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </Button>
      </View>

      {/* Product List */}
      <FlatList
        data={products ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="cube-outline"
              title="No products yet"
              subtitle="Add your first product to start selling"
              actionLabel="Add Product"
              onAction={handleAdd}
            />
          ) : null
        }
      />
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
  },
  row: {
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 12,
    ...shadows.sm,
  },
  productImageWrapper: {
    height: 140,
    backgroundColor: colors.surface,
    position: 'relative',
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
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  outOfStockText: {
    ...typePresets.caption,
    fontFamily: 'Nunito_700Bold',
    color: colors.white,
  },
  productInfo: {
    padding: 12,
    gap: 6,
  },
  productName: {
    ...typePresets.body,
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
  },
  productPrice: {
    ...typePresets.priceSm,
    fontFamily: 'Raleway_700Bold',
    color: colors.primary,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  stockText: {
    ...typePresets.caption,
    fontFamily: 'Nunito_600SemiBold',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
  },
});
