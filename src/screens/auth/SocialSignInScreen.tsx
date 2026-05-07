/**
 * SocialSignInScreen — Unified social sign-in.
 *
 * Flow:
 * 1. User sees "Welcome back" with Google & Facebook buttons
 * 2. Tapping a social button triggers OAuth → backend social-login endpoint
 * 3. If account exists → auto-login → route to dashboard
 * 4. If no account → navigate to SocialRoleSelect to pick role first
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { loginSchema, type LoginFormValues } from '@/utils/validation';
import { useLogin } from '@/hooks/useAuth';
import { useSocialLogin } from '@/hooks/useSocialAuth';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { SocialLogin } from '@/components/auth/SocialLogin';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function SocialSignInScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: socialLogin, isPending: socialPending } = useSocialLogin();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  const handleSocialPress = (provider: 'google' | 'facebook') => {
    socialLogin({
      provider,
      idToken: `mock_${provider}_token`,
    });
  };

  const apiError = (error as any)?.response?.data?.message as string | undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <View style={styles.accentBar} />

      <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
      >
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {apiError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#B3261E" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{apiError}</Text>
          </View>
        )}

        {/* Social buttons FIRST — fastest path */}
        <SocialLogin
          mode="login"
          onGooglePress={() => handleSocialPress('google')}
          onFacebookPress={() => handleSocialPress('facebook')}
          loading={socialPending}
        />

        {/* Email form */}
        <View style={styles.formCard}>
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
                error={errors.email?.message}
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
                error={errors.password?.message}
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
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            size="lg"
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SocialRoleSelect')}
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
  accentBar: { height: 4, backgroundColor: '#004CFF' },
  headerRow: { paddingHorizontal: 24, paddingBottom: 8 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontFamily: 'Raleway_700Bold', fontSize: 32, color: '#111322', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#5F6C7B', lineHeight: 24, marginBottom: 24 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#7F1D1D', flex: 1, lineHeight: 20 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 4, marginTop: 8 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#E4E7EC', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#004CFF', borderColor: '#004CFF' },
  checkboxLabel: { fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#111322' },
  forgotLink: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#004CFF' },
  buttonWrapper: { marginTop: 16, ...Platform.select({ ios: { shadowColor: '#004CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }, android: { elevation: 4 } }) },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, paddingVertical: 8 },
  footerText: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#5F6C7B' },
  footerLink: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#004CFF' },
});
