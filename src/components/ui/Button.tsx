import React, { useRef, useCallback, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  Vibration,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors, shadows, radii } from "@/theme/colors";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "default" | "sm" | "lg";

export type ButtonProps = PressableProps & {
  title?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: boolean;
  textStyle?: StyleProp<TextStyle>;
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceDark },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.error },
};

const textColors: Record<ButtonVariant, string> = {
  default: colors.white,
  secondary: colors.text,
  outline: colors.text,
  ghost: colors.primary,
  danger: colors.white,
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: 20 },
  default: { height: 50, paddingHorizontal: 32 },
  lg: { height: 56, paddingHorizontal: 40 },
};

const sizeText: Record<ButtonSize, { fontSize: number }> = {
  sm: { fontSize: 14 },
  default: { fontSize: 16 },
  lg: { fontSize: 18 },
};

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
  haptic = true,
  textStyle,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (e: any) => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      if (haptic) Vibration.vibrate(6);
      if (onPressIn) onPressIn(e);
    },
    [scaleAnim, opacityAnim, haptic, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      if (onPressOut) onPressOut(e);
    },
    [scaleAnim, opacityAnim, onPressOut]
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        fullWidth ? { width: "100%" } : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) =>
          [
            {
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radii.full,
              opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
              flexDirection: "row",
              gap: 8,
              ...shadows.md,
            },
            sizeStyles[size],
            variantStyles[variant],
            style as StyleProp<ViewStyle>,
          ] as StyleProp<ViewStyle>
        }
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
                letterSpacing: 0.2,
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
