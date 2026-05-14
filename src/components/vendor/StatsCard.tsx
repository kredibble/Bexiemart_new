import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, shadows, radii } from '@/theme/colors';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
  index?: number;
}

export function StatsCard({ title, value, icon, accentColor = colors.primary, index = 0 }: StatsCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify().damping(14)}
      style={styles.card}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${accentColor}15` }]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      </View>
      {/* Subtle bottom highlight matching accent color */}
      <View style={[styles.bottomHighlight, { backgroundColor: accentColor }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...shadows.sm,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  title: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  bottomHighlight: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    opacity: 0.8,
  }
});
