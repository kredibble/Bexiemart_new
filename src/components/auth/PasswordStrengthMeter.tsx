import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface PasswordStrengthMeterProps {
  password: string;
}

const strengthConfig = [
  { label: '', color: colors.border, width: '0%' },
  { label: 'Weak', color: colors.error, width: '25%' },
  { label: 'Fair', color: colors.warning, width: '50%' },
  { label: 'Good', color: colors.primary, width: '75%' },
  { label: 'Strong', color: colors.success, width: '100%' },
] as const;

function evaluateStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score = Math.max(score, 1);
  if (password.length >= 12) score = Math.max(score, 2);
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score = Math.max(score, 2);
  if (/[0-9]/.test(password)) score = Math.max(score, 2);
  if (/[^A-Za-z0-9]/.test(password)) score = Math.min(4, score + 1);
  if (password.length >= 16) score = Math.max(score, 3);
  return score;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const level = useMemo(() => evaluateStrength(password), [password]);
  if (!password) return null;

  const config = strengthConfig[level];

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: config.width, backgroundColor: config.color }]} />
      </View>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    minWidth: 46,
    textAlign: 'right',
  },
});
