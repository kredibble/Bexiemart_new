/**
 * ReelsScreen — Short-form video feed (TikTok-style).
 *
 * Features:
 *  - Vertical paged FlatList of reels
 *  - Thumbnail preview with gradient overlay
 *  - Like / Share action buttons
 *  - Pull-to-refresh
 *  - Loading / error states
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useReels, useLikeReel } from '@/hooks/useReels';
import { colors } from '@/theme/colors';
import type { Reel } from '@/api/reels';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const REEL_HEIGHT = SCREEN_HEIGHT;

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: reels, isLoading, isError, error, refetch, isRefetching } = useReels();
  const { mutate: toggleLike } = useLikeReel();

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const handleLike = useCallback(
    (reel: Reel) => {
      toggleLike({ reelId: reel.id, isLiked: reel.isLiked ?? false });
    },
    [toggleLike],
  );

  const renderReel = useCallback(
    ({ item, index }: { item: Reel; index: number }) => {
      const isActive = index === activeIndex;
      return (
        <View style={[styles.reelContainer, { height: REEL_HEIGHT }]}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.reelInfo}>
            <Text style={styles.reelUser}>{item.user}</Text>
            <Text style={styles.reelCaption}>{item.caption}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleLike(item)}
              accessibilityRole="button"
              accessibilityLabel={item.isLiked ? 'Unlike' : 'Like'}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={item.isLiked ? colors.error : colors.white}
              />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Share">
              <Ionicons name="share-outline" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [activeIndex, handleLike],
  );

  if (isError) {
    return (
      <View style={[styles.screen, styles.centerContainer, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Unable to load reels</Text>
        <Text style={styles.errorMessage}>{error?.message ?? 'Something went wrong'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry">
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner color={colors.white} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
      </View>
      <FlatList
        data={reels ?? []}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={REEL_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.white}
            colors={[colors.white]}
          />
        }
        ListEmptyComponent={
          <View style={[styles.centerContainer, { height: REEL_HEIGHT - 200 }]}>
            <Ionicons name="play-outline" size={56} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyTitle}>No reels yet</Text>
            <Text style={styles.emptySubtitle}>Check back for new videos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 24, color: colors.white, letterSpacing: -0.5 },
  reelContainer: { width, justifyContent: 'flex-end' },
  thumbnail: { ...StyleSheet.absoluteFillObject as any },
  gradientOverlay: { ...StyleSheet.absoluteFillObject as any, backgroundColor: 'rgba(0,0,0,0.3)' },
  reelInfo: { position: 'absolute', bottom: 100, left: 20, right: 80, gap: 4 },
  reelUser: { fontFamily: 'NunitoSans_700Bold', fontSize: 16, color: colors.white },
  reelCaption: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.white, lineHeight: 20 },
  actions: { position: 'absolute', bottom: 100, right: 16, gap: 16, alignItems: 'center' },
  actionBtn: { alignItems: 'center', gap: 2 },
  actionText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 12, color: colors.white },
  errorTitle: { fontFamily: 'Rubik_700Bold', fontSize: 20, color: colors.white },
  errorMessage: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999, backgroundColor: colors.primary },
  retryBtnText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: colors.white },
  emptyTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: 'rgba(255,255,255,0.7)' },
  emptySubtitle: { fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
