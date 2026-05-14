import React, { useEffect, useRef } from "react";
import { View, Text, Animated, type ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { fonts, fontSizes, typePresets } from "@/theme/typography";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  image?: ImageSourcePropType;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
}

export function EmptyState({
  icon = "file-tray-outline",
  iconColor = colors.primary,
  image,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionLoading,
}: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {image ? (
        <Image
          source={image}
          style={{ width: 180, height: 180, marginBottom: 28 }}
          contentFit="contain"
          accessibilityLabel={title}
        />
      ) : (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: `${iconColor}15`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Ionicons name={icon} size={48} color={iconColor} />
        </View>
      )}

      <Text style={[typePresets.h3, { color: colors.text, textAlign: "center", marginBottom: 8 }]}>
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: fontSizes.lg,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 24,
            maxWidth: 300,
            marginBottom: 28,
          }}
        >
          {subtitle}
        </Text>
      )}

      {actionLabel && onAction && (
        <View style={{ marginTop: 8 }}>
          <Button
            title={actionLabel}
            onPress={onAction}
            loading={actionLoading}
            variant="outline"
          />
        </View>
      )}
    </Animated.View>
  );
}
