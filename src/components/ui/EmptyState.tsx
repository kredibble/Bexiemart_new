/**
 * EmptyState — Placeholder view for screens with no data.
 *
 * Used in: empty cart, empty favorites, no search results, no orders.
 * Features: centered layout, icon/image, title, subtitle, optional CTA button.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  /** Ionicons icon name — used when no image is provided */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Icon color (default: primary blue) */
  iconColor?: string;
  /** Image source — takes priority over icon */
  image?: ImageSourcePropType;
  /** Heading text */
  title: string;
  /** Description text below the heading */
  subtitle?: string;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button handler */
  onAction?: () => void;
  /** Whether the CTA is in loading state */
  actionLoading?: boolean;
}

export function EmptyState({
  icon = 'file-tray-outline',
  iconColor = '#004CFF',
  image,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionLoading,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Visual — image or icon circle */}
      {image ? (
        <Image
          source={image}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={title}
        />
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}12` }]}>
          <Ionicons name={icon} size={48} color={iconColor} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <Button
            title={actionLabel}
            onPress={onAction}
            loading={actionLoading}
            variant="outline"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: '#111322',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  actionContainer: {
    marginTop: 8,
  },
});
