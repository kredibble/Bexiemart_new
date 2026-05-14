import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useViewStory } from '@/hooks/useStories';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { StoryGroup, StoryItem } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
}

export default function StoryViewer({ group, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const viewStory = useViewStory();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stories = group.stories;
  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000;

  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animation.start();
    timerRef.current = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        goNext();
      } else {
        onClose();
      }
    }, STORY_DURATION);
    return animation;
  }, [currentIndex, stories.length]);

  useEffect(() => {
    if (currentStory && !currentStory.viewed) {
      viewStory.mutate(currentStory.id);
    }
    const anim = startProgress();
    return () => {
      anim.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, stories.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleTap = useCallback((evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < SCREEN_WIDTH * 0.3) {
      goPrev();
    } else if (x > SCREEN_WIDTH * 0.7) {
      goNext();
    } else {
      onClose();
    }
  }, [goNext, goPrev, onClose]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.progressContainer}>
        {stories.map((_, idx) => (
          <View key={idx} style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                idx < currentIndex && { flex: 1, backgroundColor: colors.white },
                idx === currentIndex && { flex: progressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }), backgroundColor: colors.white },
                idx > currentIndex && { flex: 0 },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.storyHeader}>
        <View style={styles.storyUser}>
          <View style={styles.storyAvatar}>
            {group.user.image ? (
              <Image source={{ uri: group.user.image }} style={styles.storyAvatarImg} />
            ) : (
              <Text style={styles.storyAvatarText}>{group.user.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View>
            <Text style={styles.storyUserName}>{group.user.name}</Text>
            <Text style={styles.storyTime}>{formatTime(currentStory?.createdAt)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.storyContent} onPress={handleTap} activeOpacity={1}>
        {currentStory?.mediaUrl ? (
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.storyImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.storyPlaceholder}>
            <Ionicons name="image-outline" size={64} color={colors.white} />
          </View>
        )}
        {currentStory?.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{currentStory.caption}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    zIndex: 9999,
  },
  closeButton: {
    position: 'absolute', top: 60, right: 20, zIndex: 100,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute', top: 50, left: 12, right: 12, zIndex: 100,
    flexDirection: 'row', gap: 4,
  },
  progressBar: {
    flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { backgroundColor: colors.white, borderRadius: 2 },
  storyHeader: {
    position: 'absolute', top: 64, left: 16, right: 80, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  storyUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storyAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  storyAvatarImg: { width: '100%', height: '100%' },
  storyAvatarText: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  storyUserName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.white },
  storyTime: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  storyContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  storyImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 },
  storyPlaceholder: {
    width: SCREEN_WIDTH * 0.6, height: SCREEN_WIDTH * 0.6,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute', bottom: 100, left: 20, right: 20,
    padding: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8,
  },
  caption: { fontFamily: fonts.body, fontSize: 15, color: colors.white, textAlign: 'center' },
});
