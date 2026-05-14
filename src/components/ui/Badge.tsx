import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface BadgeProps {
  count: number;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  count,
  color = colors.error,
  textColor = colors.white,
  size = 'sm',
}: BadgeProps) {
  if (count <= 0) return null;

  const displayText = count > 99 ? '99+' : String(count);
  const isWide = displayText.length > 1;
  const dimensions = size === 'sm' ? 20 : 24;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          minWidth: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          paddingHorizontal: isWide ? 5 : 0,
        },
      ]}
      accessibilityLabel={`${count} items`}
    >
      <Text style={[styles.text, { color: textColor, fontSize }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    zIndex: 10,
  },
  text: {
    fontFamily: 'NunitoSans_700Bold',
    textAlign: 'center',
    lineHeight: 15,
  },
});
