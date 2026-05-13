/**
 * SocialSignInScreen — Unified social sign-in with Better Auth.
 *
 * Flow:
 * 1. User taps Google → signIn.social() opens browser → OAuth → callback to /role-select
 * 2. Browser redirects back to app → SocialRoleSelectScreen receives session
 * 3. User picks role → updateUser({ role }) → navigate to dashboard
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { loginSchema, type LoginFormValues } from '@/utils/validation';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SocialSignInScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const setUser = useAuthStore((s) => s.setUser);
  const storedUser = useAuthStore((s) => s.user);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSocialPress = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authClient.signIn.social({
        provider,
        callbackURL: "/role-select",
      });

      if (authError) {
        setError(authError.message ?? 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      // signIn.social() with callbackURL triggers browser redirect.
      // The expoClient plugin opens the browser and handles the OAuth flow.
      // After success, the user is redirected to /role-select (deep link).
      // We don't get user data here — the session is created server-side.
    } catch (err: any) {
      setError(err?.message ?? 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        setError(authError.message ?? 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Read role from server response first, then fall back to stored registration data
        const userRole = (data.user as any)?.role ?? storedUser?.role ?? 'customer';
        // Update store — RootNavigator will detect the change and show the correct tabs
        setUser({
          id: data.user.id ?? storedUser?.id ?? '',
          name: data.user.name ?? storedUser?.name ?? '',
          email: data.user.email ?? storedUser?.email ?? '',
          phone: storedUser?.phone,
          role: userRole,
          avatar: (data.user as any)?.image ?? storedUser?.avatar,
          isVerified: (data.user as any)?.emailVerified ?? storedUser?.isVerified ?? false,
          createdAt: storedUser?.createdAt ?? new Date().toISOString(),
          updatedAt: storedUser?.updatedAt ?? new Date().toISOString(),
        });
        // No explicit navigation needed — RootNavigator gates on the store
        // and will re-render to show CustomerApp or VendorApp based on role
      }
    } catch (err: any) {
      setError(err?.message ?? 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Soft background orbs */}
      <View style={[styles.bgLayer, { pointerEvents: 'none' }]}>
        <View style={styles.orbPrimary} />
        <View style={styles.orbAccent} />
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#111322" />
        </TouchableOpacity>
        <View style={styles.pill}>
          <Ionicons name="log-in-outline" size={12} color="#7C3AED" />
          <Text style={styles.stepText}>Sign in</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 72 },
        ]}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroPretitle}>Welcome back</Text>
          <Text style={styles.heroTitle}>
            Sign in to{'\n'}continue
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#B3261E" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{error}</Text>
          </View>
        )}

        {/* Auth card */}
        <View style={styles.authCard}>
          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
              onPress={() => handleSocialPress('google')}
              disabled={isLoading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              {isLoading ? (
                <View style={styles.socialIconPlaceholder}>
                  <View style={styles.loadingSpinner} />
                </View>
              ) : (
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              )}
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
              onPress={() => handleSocialPress('apple')}
              disabled={isLoading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Apple"
            >
              <Ionicons name="logo-apple" size={22} color="#111322" />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email form */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                prefixIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={formErrors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                prefixIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={formErrors.password?.message}
              />
            )}
          />

          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword' as any)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SocialRoleSelect', {})}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orbPrimary: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 9999,
    backgroundColor: '#7C3AED',
    top: -SCREEN_WIDTH * 0.55,
    right: -SCREEN_WIDTH * 0.4,
    opacity: 0.06,
  },
  orbAccent: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 9999,
    backgroundColor: '#FFD60A',
    top: '45%',
    right: -30,
    opacity: 0.08,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    color: '#7C3AED',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroPretitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#8E96A6',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 42,
    color: '#111322',
    lineHeight: 46,
    letterSpacing: -1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#7F1D1D',
    flex: 1,
    lineHeight: 20,
  },
  authCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EBF0',
    gap: 20,
    ...Platform.select({
      ios: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 16px rgba(0, 76, 255, 0.06)' },
    }),
  },
  socialRow: {
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4E7EC',
    paddingHorizontal: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.03)' },
    }),
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16,
    color: '#111322',
    letterSpacing: 0.2,
  },
  socialIconPlaceholder: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    borderTopColor: '#7C3AED',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EBF0',
  },
  dividerText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: '#9BA5B0',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkboxLabel: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 14,
    color: '#111322',
  },
  forgotLink: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: '#7C3AED',
  },
  buttonWrapper: {
    ...Platform.select({
      ios: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 12px rgba(0, 76, 255, 0.3)' },
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#8E96A6',
  },
  footerLink: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: '#7C3AED',
  },
});
