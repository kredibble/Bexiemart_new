import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
  variant?: 'default' | 'compact';
}

export function ProductCard({
  product,
  onPress,
  onFavorite,
  isFavorited = false,
  variant = 'default',
}: ProductCardProps) {
  if (variant === 'compact') {
    return <CompactProductCard product={product} onPress={onPress} onFavorite={onFavorite} isFavorited={isFavorited} />;
  }
  return <DefaultProductCard product={product} onPress={onPress} onFavorite={onFavorite} isFavorited={isFavorited} />;
}

function DefaultProductCard({
  product,
  onPress,
  onFavorite,
  isFavorited,
}: Omit<ProductCardProps, 'variant'>) {
  const hasDiscount = product.discount && product.discount > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <TouchableOpacity
      className="flex-1 bg-white rounded-xl overflow-hidden m-1"
      style={{
        borderWidth: 1,
        borderColor: '#F0F2F5',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          },
          android: {
            elevation: 2,
          },
        }),
      }}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, GHS ${product.price}, ${product.averageRating} stars`}
      accessibilityHint="Opens product details"
    >
      {/* Image container with badges */}
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          style={{ width: '100%', aspectRatio: 1 }}
          contentFit="cover"
          recyclingKey={product.id}
          accessibilityLabel={`Image of ${product.name}`}
        />

        {/* Gradient scrim at bottom of image for text readability */}
        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 40, backgroundColor: 'rgba(0,0,0,0.03)' }}
        />

        {/* Discount badge — top left */}
        {hasDiscount && (
          <View
            className="px-2 py-1 rounded-full"
            style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#B3261E' }}
          >
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#FFFFFF' }}>
              -{product.discount}%
            </Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center rounded-t-xl">
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#FFFFFF' }}>
              Out of Stock
            </Text>
          </View>
        )}

        {/* Favorite heart — top right */}
        <TouchableOpacity
          className="p-2 rounded-full"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 40,
            minHeight: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.85)',
          }}
          onPress={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityState={{ selected: isFavorited }}
        >
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorited ? '#B3261E' : '#5F6C7B'}
          />
        </TouchableOpacity>
      </View>

      {/* Product info */}
      <View className="p-2.5 gap-1">
        <Text
          style={{ fontFamily: 'Nunito_500Medium', fontSize: 13, color: '#111322', lineHeight: 18 }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        {/* Price row */}
        <View className="flex-row items-center gap-1.5 flex-wrap">
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#004CFF' }}>
            GH₵ {product.price.toFixed(2)}
          </Text>
          {hasDiscount && product.originalPrice && (
            <Text
              style={{
                fontFamily: 'Nunito_400Regular',
                fontSize: 12,
                color: '#9BA5B0',
                textDecorationLine: 'line-through',
              }}
            >
              GH₵ {product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Rating + stock */}
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 12, color: '#5F6C7B' }}>
            {product.averageRating.toFixed(1)}
          </Text>
          {product.stock > 0 && product.stock < 5 && (
            <>
              <Text style={{ fontSize: 10, color: '#C8CFD6' }}>·</Text>
              <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 11, color: '#B3261E' }}>
                Only {product.stock} left
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CompactProductCard({
  product,
  onPress,
  onFavorite,
  isFavorited,
}: Omit<ProductCardProps, 'variant'>) {
  const hasDiscount = product.discount && product.discount > 0;

  return (
    <TouchableOpacity
      className="flex-row bg-white rounded-xl overflow-hidden"
      style={{
        height: 100,
        borderWidth: 1,
        borderColor: '#F0F2F5',
        marginBottom: 8,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          },
          android: { elevation: 1 },
        }),
      }}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, GHS ${product.price}`}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: product.images[0] }}
        style={{ width: 100, height: 100 }}
        contentFit="cover"
        recyclingKey={`compact-${product.id}`}
        accessibilityLabel={`Image of ${product.name}`}
      />

      {/* Info */}
      <View className="flex-1 p-2.5 justify-between">
        <Text
          style={{ fontFamily: 'Nunito_500Medium', fontSize: 13, color: '#111322', lineHeight: 18 }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#004CFF' }}>
              GH₵ {product.price.toFixed(2)}
            </Text>
            {hasDiscount && product.originalPrice && (
              <Text
                style={{
                  fontFamily: 'Nunito_400Regular',
                  fontSize: 11,
                  color: '#9BA5B0',
                  textDecorationLine: 'line-through',
                }}
              >
                GH₵ {product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            onPress={(e) => { e.stopPropagation(); onFavorite(); }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#B3261E' : '#5F6C7B'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
