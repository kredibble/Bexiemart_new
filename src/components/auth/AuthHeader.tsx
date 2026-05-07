/**
 * AuthHeader — shared header component for all auth screens.
 * Features a decorative top accent bar, optional back button, and step indicator.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  step?: number;
  totalSteps?: number;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconBgColor?: string;
  iconColor?: string;
}

export function AuthHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  step,
  totalSteps,
  icon,
  iconBgColor = '#EEF2FF',
  iconColor = '#004CFF',
}: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Decorative accent bar */}
      <View style={styles.accentBar} />

      {/* Header row */}
      <View style={styles.headerRow}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#111322" />
          </TouchableOpacity>
        )}

        {/* Step indicator */}
        {step !== undefined && totalSteps !== undefined && totalSteps > 1 && (
          <View style={styles.stepContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i < step && styles.stepDotActive,
                  i === step - 1 && styles.stepDotCurrent,
                ]}
              />
            ))}
          </View>
        )}

        {showBack && <View style={{ width: 44 }} />}
      </View>

      {/* Illustration icon */}
      {icon && (
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={32} color={iconColor} />
        </View>
      )}

      {/* Title + subtitle */}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#004CFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  stepDotActive: {
    backgroundColor: '#004CFF',
  },
  stepDotCurrent: {
    width: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28,
    color: '#111322',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 24,
  },
});
