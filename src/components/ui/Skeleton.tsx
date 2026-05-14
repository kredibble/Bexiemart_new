import React, { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle, type StyleProp } from "react-native";
import { colors, radii } from "@/theme/colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = radii.md,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, opacity, backgroundColor: colors.skeleton },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          padding: 16,
          gap: 12,
        },
        style,
      ]}
    >
      <Skeleton height={180} borderRadius={radii.md} />
      <Skeleton width="75%" height={18} />
      <Skeleton width="55%" height={14} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}

export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      <Skeleton width={48} height={48} borderRadius={radii.full} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
}
