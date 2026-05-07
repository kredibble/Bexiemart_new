/**
 * ForgotPasswordScreen — Elevated design with trust indicators
 * and clear step-by-step guidance.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validation';
import { useForgotPassword } from '@/hooks/useAuth';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { mutate: sendReset, isPending, error } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    sendReset(values.email);
  };

  const apiError = (error as any)?.response?.data?.message as string | undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Accent bar */}
      <View style={styles.accentBar} />

      {/* Header */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
      >
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="lock-closed-outline" size={44} color="#004CFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries — enter your email and we'll send you a verification code to reset your password.
        </Text>

        {/* API error */}
        {apiError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#B3261E" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{apiError}</Text>
          </View>
        )}

        {/* Form card */}
        <View style={styles.formCard}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Email"
                placeholder="Enter your email address"
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
        </View>

        {/* Submit button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Send Reset Code"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            size="lg"
          />
        </View>

        {/* Trust indicators */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#5F6C7B" />
            <Text style={styles.trustText}>Secure & encrypted</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="time-outline" size={16} color="#5F6C7B" />
            <Text style={styles.trustText}>Code expires in 10 min</Text>
          </View>
        </View>

        {/* Back to login */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to login"
          >
            <Text style={styles.footerLink}>
              <Ionicons name="arrow-back" size={14} color="#004CFF" />{' '}
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  accentBar: { height: 4, backgroundColor: '#004CFF' },
  headerRow: { paddingHorizontal: 24, paddingBottom: 8 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  illustrationContainer: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  illustrationCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28,
    color: '#111322',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  errorText: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#7F1D1D', flex: 1, lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 4,
    marginBottom: 24,
  },
  buttonWrapper: {
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  trustRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 24, marginBottom: 24,
  },
  trustItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  trustText: {
    fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#5F6C7B',
  },
  footerRow: {
    flexDirection: 'row', justifyContent: 'center',
    paddingVertical: 8,
  },
  footerLink: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#004CFF',
  },
});
