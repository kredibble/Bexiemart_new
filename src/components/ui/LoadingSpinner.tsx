import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, Animated } from "react-native";
import { colors } from "@/theme/colors";
import { fonts, fontSizes } from "@/theme/typography";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  label?: string;
  fullScreen?: boolean;
  variant?: "default" | "light";
  overlay?: boolean;
}

export function LoadingSpinner({
  size = "large",
  color = colors.primary,
  label,
  fullScreen = false,
  variant = "default",
  overlay = false,
}: LoadingSpinnerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const bgColor = overlay
    ? colors.overlay
    : variant === "light"
    ? colors.surface
    : colors.white;

  const content = (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeAnim,
        gap: 16,
        paddingVertical: fullScreen ? 0 : 40,
      }}
      accessibilityLabel={label || "Loading"}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size={size} color={color} />
      {label && (
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: fontSizes.base,
            color: overlay ? colors.white : colors.textSecondary,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );

  if (fullScreen || overlay) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
        }}
      >
        {content}
      </View>
    );
  }

  return content;
}
