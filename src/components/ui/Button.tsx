import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "default" | "sm" | "lg";

export type ButtonProps = PressableProps & {
  title?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  default: { backgroundColor: "#004CFF" },
  secondary: { backgroundColor: "#F0F2F5" },
  outline: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4E7EC" },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "#B3261E" },
};

const textColors: Record<ButtonVariant, string> = {
  default: "#FFFFFF",
  secondary: "#111322",
  outline: "#111322",
  ghost: "#004CFF",
  danger: "#FFFFFF",
};

const sizeStyles: Record<ButtonSize, StyleProp<ViewStyle>> = {
  sm: { minHeight: 44, paddingHorizontal: 16 },
  default: { minHeight: 52, paddingHorizontal: 24 },
  lg: { minHeight: 56, paddingHorizontal: 28 },
};

export function Button({
  title,
  loading = false,
  fullWidth = false,
  variant = "default",
  size = "default",
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
        },
        fullWidth ? { width: "100%" } : null,
        sizeStyles[size],
        variantStyles[variant],
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={textColors[variant]}
          size="small"
        />
      ) : title ? (
        <Text
          style={{
            fontFamily: "Nunito_600SemiBold",
            fontSize: size === "lg" ? 17 : 15,
            color: textColors[variant],
          }}
        >
          {title}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
