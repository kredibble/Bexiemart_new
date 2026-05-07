/**
 * Carousel — Auto-scrolling image carousel with dot indicators.
 *
 * Used in: HomeScreen (promo banners), ProductDetailsScreen (image gallery).
 * Features: horizontal paging, auto-scroll interval, dot pagination,
 * expo-image for optimized loading, and swipe gesture support.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  type ViewToken,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CarouselItem {
  id: string;
  image: string;
  onPress?: () => void;
}

interface CarouselProps {
  items: CarouselItem[];
  /** Enable auto-scrolling (default: true) */
  autoPlay?: boolean;
  /** Auto-scroll interval in milliseconds (default: 5000) */
  interval?: number;
  /** Image height (default: 180) */
  height?: number;
  /** Horizontal margin for the carousel container */
  containerPadding?: number;
  /** Border radius for images */
  borderRadius?: number;
}

export function Carousel({
  items,
  autoPlay = true,
  interval = 5000,
  height = 180,
  containerPadding = 0,
  borderRadius = 16,
}: CarouselProps) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const itemWidth = SCREEN_WIDTH - containerPadding * 2;

  // Track viewable item changes for dot indicator
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // Auto-scroll logic
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, interval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, interval, items.length]);

  // Pause auto-scroll on user interaction
  const handleScrollBeginDrag = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (!autoPlay || items.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, interval);
  }, [autoPlay, interval, items.length]);

  const renderItem: ListRenderItem<CarouselItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={item.onPress ? 0.85 : 1}
        onPress={item.onPress}
        style={{ width: itemWidth }}
        accessibilityRole={item.onPress ? 'button' : 'image'}
        accessibilityLabel="Promotional banner"
      >
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { height, borderRadius }]}
          contentFit="cover"
          transition={300}
          placeholder={{ thumbhash: 'rEgGFwB3d3d3d4iIeJh3d4hwiA' }}
        />
      </TouchableOpacity>
    ),
    [itemWidth, height, borderRadius]
  );

  if (items.length === 0) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
      />

      {/* Dot indicators */}
      {items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    backgroundColor: '#F0F2F5',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    height: 6,
    backgroundColor: '#004CFF',
    borderRadius: 3,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
});
