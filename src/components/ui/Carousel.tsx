import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  type ViewToken,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';
import { colors, radii } from '@/theme/colors';

export interface CarouselItem {
  id: string;
  image: string;
  onPress?: () => void;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  height?: number;
  containerPadding?: number;
  borderRadius?: number;
}

export function Carousel({
  items,
  autoPlay = true,
  interval = 5000,
  height = 200,
  containerPadding = 0,
  borderRadius = radii.xl,
}: CarouselProps) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const itemWidth = SCREEN_WIDTH - containerPadding * 2;

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

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, interval);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, interval, items.length]);

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
    backgroundColor: colors.surfaceDark,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    height: 6,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: colors.border,
  },
});
