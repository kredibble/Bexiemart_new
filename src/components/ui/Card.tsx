import React from 'react';
import {
  View,
  Pressable,
  Platform,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii } from '@/theme/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const PADDING_MAP = { none: 0, sm: 12, md: 20, lg: 24 } as const;
const RADIUS_MAP = { sm: 10, md: 14, lg: 18, xl: 22 } as const;

const SHADOW_MAP = {
  0: {},
  1: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
    android: { elevation: 1 },
    web: { boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.03)' },
    default: {},
  }),
  2: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16 },
    android: { elevation: 3 },
    web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.05)' },
    default: {},
  }),
  3: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32 },
    android: { elevation: 8 },
    web: { boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.08)' },
    default: {},
  }),
} as const;

export function Card({
  children,
  onPress,
  style,
  elevation = 2,
  padding = 'md',
  radius = 'lg',
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const cardStyle: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius: RADIUS_MAP[radius],
    padding: PADDING_MAP[padding],
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.4)', // Ultra-subtle border
    ...(SHADOW_MAP[elevation] as ViewStyle),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Animated.View style={[cardStyle, animatedStyle, style]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}
