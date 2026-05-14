import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';

import { Carousel, type CarouselItem } from '@/components/ui/Carousel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useProduct } from '@/hooks/useProducts';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useProductReviews, useCreateReview } from '@/hooks/useReviews';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { colors, shadows, radii } from '@/theme/colors';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { Review } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoutePropType = RouteProp<HomeStackParamList, 'ProductDetails'>;

const STAR_OPTIONS = [5, 4, 3, 2, 1] as const;

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();

  const { productId } = route.params ?? {};
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  // Wishlist
  const { data: wishlist } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const wishlistItem = useMemo(
    () => wishlist?.find((w) => w.productId === productId),
    [wishlist, productId],
  );
  const isWishlisted = !!wishlistItem;

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    if (isWishlisted && wishlistItem) {
      removeFromWishlist(wishlistItem.id);
    } else {
      addToWishlist(product.id);
    }
  }, [product, isWishlisted, wishlistItem, addToWishlist, removeFromWishlist]);

  // Recently viewed
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  useEffect(() => {
    if (product) addToRecentlyViewed(product);
  }, [product?.id]);

  // Reviews
  const { data: reviewsData } = useProductReviews(productId);
  const { mutate: createReview } = useCreateReview();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const reviews: Review[] = reviewsData?.data ?? [];

  const handleSubmitReview = useCallback(() => {
    createReview(
      { productId, rating: reviewRating, comment: reviewComment.trim() || undefined },
      {
        onSuccess: () => {
          setReviewModalVisible(false);
          setReviewComment('');
          setReviewRating(5);
          ToastEmitter.success('Thank you for your feedback!');
        },
        onError: (err: any) => {
          ToastEmitter.error(err?.message ?? 'Failed to submit review');
        },
      },
    );
  }, [productId, reviewRating, reviewComment, createReview]);

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({ productId: product.id, quantity });
  }, [product, quantity, addToCart]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textLight} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load product'}</Text>
          <Button variant="default" style={styles.retryBtn} onPress={() => refetch()}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 14, color: colors.white }}>Try Again</Text>
          </Button>
        </View>
      </View>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const carouselItems: CarouselItem[] = (product.images ?? []).map((img) => ({
    id: img.id,
    image: img.url,
  }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Floating header buttons ──────────────────────────────────────── */}
      <View style={styles.headerOverlay}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleGoBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleToggleWishlist}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share product"
          >
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Image gallery ────────────────────────────────────────────── */}
        {carouselItems.length > 0 ? (
          <Carousel
            items={carouselItems}
            height={SCREEN_WIDTH * 0.85}
            autoPlay={false}
            borderRadius={0}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { height: SCREEN_WIDTH * 0.85 }]}>
            <Ionicons name="image-outline" size={64} color={colors.textLighter} />
          </View>
        )}

        {/* ── Product Info Card ─────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.name}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>

          {product.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>
                ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{'\u20A6'}{product.price.toLocaleString()}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>
                  {'\u20A6'}{product.compareAtPrice!.toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            )}
          </View>

          {product.vendor && (
            <View style={styles.vendorRow}>
              <Ionicons name="storefront-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.vendorName}>{product.vendor.shopName}</Text>
              {product.vendor.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              )}
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.stockRow}>
            <Ionicons
              name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={product.stock > 0 ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.stock > 0 ? colors.successDark : colors.error },
              ]}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>

        {/* ── Delivery Options ──────────────────────────────────────────── */}
        {product.deliveryOptions && product.deliveryOptions.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Delivery Options</Text>
            {product.deliveryOptions.map((opt, i) => (
              <View key={i} style={styles.deliveryRow}>
                <View style={styles.deliveryRowLeft}>
                  <Ionicons
                    name={opt.type.toLowerCase().includes('express') ? 'flash' : opt.type.toLowerCase().includes('pickup') ? 'bag-handle' : 'bicycle'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.deliveryType}>{opt.type}</Text>
                </View>
                <View style={styles.deliveryRowRight}>
                  <Text style={styles.deliveryFee}>GH₵ {opt.fee}</Text>
                  <Text style={styles.deliveryDuration}>{opt.duration}{opt.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Reviews ────────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
            <TouchableOpacity
              onPress={() => setReviewModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Write a review"
            >
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textLighter} />
              <Text style={styles.emptyReviewsText}>No reviews yet. Be the first!</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewRow}>
                <View style={styles.reviewUser}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUserName}>{review.user.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Sticky bottom CTA ──────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
          >
            <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.textLighter : colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
          >
            <Ionicons name="add" size={18} color={quantity >= product.stock ? colors.textLighter : colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.addToCartWrapper}>
          <Button
            title={product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            onPress={handleAddToCart}
            loading={isAddingToCart}
            disabled={product.stock <= 0}
            fullWidth
            size="lg"
          />
        </View>
      </View>

      {/* ── Write Review Modal ─────────────────────────────────────────── */}
      <Modal visible={reviewModalVisible} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            {/* Star selector */}
            <Text style={styles.modalLabel}>Rating</Text>
            <View style={styles.starSelector}>
              {STAR_OPTIONS.map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment */}
            <Text style={styles.modalLabel}>Comment (optional)</Text>
            <Input
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Share your thoughts..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                variant="secondary"
                style={{ flex: 1, borderRadius: radii.lg }}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.textSecondary }}>Cancel</Text>
              </Button>
              <Button
                variant="default"
                style={{ flex: 1, borderRadius: radii.lg }}
                onPress={handleSubmitReview}
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.white }}>Submit</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Image
  imagePlaceholder: {
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info card
  infoCard: {
    padding: 20,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginBottom: 4,
  },
  categoryText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  productName: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  reviewCountText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 26,
    color: colors.text,
  },
  originalPrice: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 16,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.errorSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.md,
  },
  discountText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 12,
    color: colors.error,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vendorName: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  sectionLabel: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  stockText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13,
  },

  // Delivery options
  sectionCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  deliveryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliveryType: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  deliveryRowRight: {
    alignItems: 'flex-end',
  },
  deliveryFee: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  deliveryDuration: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  writeReviewText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyReviewsText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  reviewUserName: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  reviewComment: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingLeft: 46,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)' },
    }),
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16,
    color: colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartWrapper: {
    flex: 1,
  },

  // Review modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  modalLabel: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  starSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  reviewInput: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
