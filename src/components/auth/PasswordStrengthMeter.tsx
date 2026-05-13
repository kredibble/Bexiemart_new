/**
 * PasswordStrengthMeter — real-time password strength indicator.
 * Shows a color-coded bar + label based on password complexity.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface PasswordStrengthMeterProps {
  password: string;
}

const strengthConfig = [
  { label: '', color: colors.border },
  { label: 'Weak', color: colors.error },
  { label: 'Fair', color: colors.warning },
  { label: 'Good', color: colors.primary },
  { label: 'Strong', color: colors.success },
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
      <View style={styles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              i <= level && { backgroundColor: config.color },
            ]}
          />
        ))}
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
  bars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    minWidth: 46,
    textAlign: 'right',
  },
});
