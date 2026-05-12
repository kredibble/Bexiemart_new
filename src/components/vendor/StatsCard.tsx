/**
 * StatsCard — Vendor dashboard stats card.
 *
 * Displays a metric with icon, title, and value.
 * Used in vendor dashboard for products, orders, earnings, etc.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
}

export function StatsCard({ title, value, icon, accentColor = colors.primary }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${accentColor}15` }]}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accentColor }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 8,
    ...shadows.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typePresets.stat,
    fontFamily: 'Raleway_700Bold',
  },
});
