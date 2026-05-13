/**
 * Card — Reusable elevated container with optional press handler.
 *
 * Provides consistent surface styling: white background, rounded corners,
 * platform-native shadow, and optional onPress for interactive cards.
 */
import React from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '@/theme/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Shadow intensity: 0=none, 1=subtle, 2=default, 3=elevated */
  elevation?: 0 | 1 | 2 | 3;
  /** Padding preset: 'sm'=12, 'md'=16, 'lg'=20, 'none'=0 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius preset */
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const PADDING_MAP = { none: 0, sm: 12, md: 16, lg: 20 } as const;
const RADIUS_MAP = { sm: 8, md: 12, lg: 16, xl: 20 } as const;

const SHADOW_MAP = {
  0: {},
  1: Platform.select({
    ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
    android: { elevation: 1 },
    web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)' },
    default: {},
  }),
  2: Platform.select({
    ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    android: { elevation: 3 },
    web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' },
    default: {},
  }),
  3: Platform.select({
    ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 6 },
    web: { boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)' },
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
  const cardStyle: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius: RADIUS_MAP[radius],
    padding: PADDING_MAP[padding],
    ...(SHADOW_MAP[elevation] as ViewStyle),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[cardStyle, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}
