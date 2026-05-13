import React, { useRef } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
  View
} from 'react-native';
import { colors, radii, shadows } from '@/theme/colors';

export interface ChipProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  isActive = false,
  onPress,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  accessibilityLabel,
}: ChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={[styles.chip, isActive && styles.chipActive]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={accessibilityLabel || `Filter by ${label}`}
      >
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
        <Text style={[styles.chipText, isActive && styles.chipTextActive, textStyle]}>
          {label}
        </Text>
        {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
    shadowColor: colors.primary,
  },
  chipText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  iconWrapper: {
    marginHorizontal: 4,
  },
});
