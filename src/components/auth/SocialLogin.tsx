/**
 * SocialLogin — Google & Facebook social auth buttons with role-aware flow.
 *
 * Three usage modes:
 * - "login": Existing user signs in → auto-route to their dashboard
 * - "register": New user signs up → attaches pre-selected role to account
 * - "both": Shows all options (used on unified screens)
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleIcon, FacebookIcon } from './SocialIcons';

export type SocialMode = 'login' | 'register' | 'both';

interface SocialLoginProps {
  mode: SocialMode;
  onGooglePress: () => void;
  onFacebookPress: () => void;
  loading?: boolean;
}

export function SocialLogin({ mode, onGooglePress, onFacebookPress, loading }: SocialLoginProps) {
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
              provider="facebook"
              onPress={onFacebookPress}
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
              provider="facebook"
              onPress={onFacebookPress}
              disabled={loading}
            />
          </View>
        </>
      )}
    </View>
  );
}

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  onPress: () => void;
  disabled?: boolean;
}

function SocialButton({ provider, onPress, disabled }: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${provider}`}
    >
      {provider === 'google' ? (
        <GoogleIcon width={22} height={22} />
      ) : (
        <FacebookIcon width={22} height={22} />
      )}
      <Text style={styles.socialLabel}>
        {provider === 'google' ? 'Google' : 'Facebook'}
      </Text>
    </TouchableOpacity>
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
    backgroundColor: '#E4E7EC',
  },
  dividerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9BA5B0',
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
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    backgroundColor: '#FFFFFF',
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#111322',
  },
});
