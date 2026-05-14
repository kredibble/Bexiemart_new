import React, { type ReactNode, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  Platform,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics"; // Adding haptics for premium feel
import { colors, radii } from "@/theme/colors";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger" | "premium";
type ButtonSize = "sm" | "default" | "lg";

export type ButtonProps = PressableProps & {
  title?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceDark },
  outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.error },
  premium: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      web: { boxShadow: `0 12px 32px ${colors.primaryLight66}` },
    }),
  },
};

const textColors: Record<ButtonVariant, string> = {
  default: colors.white,
  secondary: colors.text,
  outline: colors.text,
  ghost: colors.primary,
  danger: colors.white,
  premium: colors.white,
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: 20, borderRadius: radii.lg },
  default: { height: 52, paddingHorizontal: 28, borderRadius: radii.xl },
  lg: { height: 60, paddingHorizontal: 36, borderRadius: radii['2xl'] },
};

const sizeText: Record<ButtonSize, { fontSize: number }> = {
  sm: { fontSize: 14 },
  default: { fontSize: 16 },
  lg: { fontSize: 18 },
};

const SPRING_CONFIG = { damping: 12, stiffness: 300, mass: 0.8 };

export function Button({
  title,
  loading = false,
  fullWidth = false,
  variant = "default",
  size = "default",
  disabled,
  style,
  leftIcon,
  rightIcon,
  textStyle,
  children,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  // Reanimated Shared Values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = useCallback((e: any) => {
    if (!isDisabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      scale.value = withSpring(0.95, SPRING_CONFIG);
      opacity.value = withTiming(0.85, { duration: 100 });
    }
    if (onPressIn) onPressIn(e);
  }, [isDisabled, onPressIn, scale, opacity]);

  const handlePressOut = useCallback((e: any) => {
    scale.value = withSpring(1, SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 150 });
    if (onPressOut) onPressOut(e);
  }, [onPressOut, scale, opacity]);
  
  const handlePress = useCallback((e: any) => {
    if (!isDisabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      if (onPress) onPress(e);
    }
  }, [isDisabled, onPress]);

  return (
    <Animated.View style={[animatedStyle, fullWidth ? { width: "100%" } : null]}>
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
            opacity: isDisabled ? 0.6 : 1,
            overflow: "hidden", // ensures ripples or children don't bleed
          },
          sizeStyles[size],
          variantStyles[variant],
          style as StyleProp<ViewStyle>,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColors[variant]} size="small" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {title ? (
          <Text
            style={[
              {
                fontFamily: "NunitoSans_700Bold",
                color: textColors[variant],
                letterSpacing: 0.3,
              },
              sizeText[size],
              textStyle,
            ]}
          >
            {title}
          </Text>
        ) : (
          children as ReactNode
        )}
        {!loading && rightIcon ? rightIcon : null}
      </Pressable>
    </Animated.View>
  );
}
