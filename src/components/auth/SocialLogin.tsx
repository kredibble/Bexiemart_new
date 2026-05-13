/**
 * SocialLogin — Google & Apple social auth buttons with role-aware flow.
 *
 * Three usage modes:
 * - "login": Existing user signs in → auto-route to their dashboard
 * - "register": New user signs up → attaches pre-selected role to account
 * - "both": Shows all options (used on unified screens)
 */
import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { GoogleIcon, AppleIcon } from './SocialIcons';
import { colors } from '@/theme/colors';

export type SocialMode = 'login' | 'register' | 'both';

interface SocialLoginProps {
  mode: SocialMode;
  onGooglePress: () => void;
  onApplePress: () => void;
  loading?: boolean;
}

export function SocialLogin({ mode, onGooglePress, onApplePress, loading }: SocialLoginProps) {
  const subtitleText =
    mode === 'login'
      ? 'Sign in with your existing account'
      : mode === 'register'
      ? 'Create your account instantly'
      : 'or continue with';

  return (
    <View style={styles.container}>
      {mode !== 'both' && (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{subtitleText}</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.buttonsRow}>
            <SocialButton
              provider="google"
              onPress={onGooglePress}
              disabled={loading}
            />
            <SocialButton
              provider="apple"
              onPress={onApplePress}
              disabled={loading}
            />
          </View>
        </>
      )}

      {mode === 'both' && (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.buttonsRow}>
            <SocialButton
              provider="google"
              onPress={onGooglePress}
              disabled={loading}
            />
            <SocialButton
              provider="apple"
              onPress={onApplePress}
              disabled={loading}
            />
          </View>
        </>
      )}
    </View>
  );
}

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

function SocialButton({ provider, onPress, disabled }: SocialButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ flex: 1, transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.socialButton,
          disabled && styles.socialButtonDisabled,
          pressed && { opacity: 0.7 }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${provider}`}
      >
        {provider === 'google' ? (
          <GoogleIcon width={22} height={22} />
        ) : (
          <AppleIcon width={22} height={22} />
        )}
        <Text style={styles.socialLabel}>
          {provider === 'google' ? 'Google' : 'Apple'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.textLight,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 50,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialLabel: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.2,
  },
});
