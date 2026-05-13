import React, { useEffect, useRef, type ReactNode } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

type AnimationType = "fade" | "slideUp" | "slideDown" | "scale";

interface AnimatedPresenceProps {
  visible: boolean;
  children: ReactNode;
  type?: AnimationType;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedPresence({
  visible,
  children,
  type = "fade",
  style,
}: AnimatedPresenceProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(type === "slideUp" ? 20 : type === "slideDown" ? -20 : 0)).current;
  const scale = useRef(new Animated.Value(type === "scale" ? 0.9 : 1)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      if (type === "slideUp") translateY.setValue(20);
      if (type === "slideDown") translateY.setValue(-20);
      if (type === "scale") scale.setValue(0.9);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ...(type !== "fade" && type !== "scale"
          ? [Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true })]
          : []),
        ...(type === "scale"
          ? [Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 })]
          : []),
      ]).start();
    }
  }, [visible, opacity, translateY, scale, type]);

  if (!visible) return null;

  const animatedStyle: StyleProp<ViewStyle> =
    type === "fade"
      ? { opacity }
      : type === "scale"
      ? { opacity, transform: [{ scale }] }
      : { opacity, transform: [{ translateY }] };

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
