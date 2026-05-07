/**
 * NewPasswordScreen — Reset password with real-time strength meter,
 * requirements checklist, and elevated form design.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { newPasswordSchema, type NewPasswordFormValues } from '@/utils/validation';
import { useResetPassword } from '@/hooks/useAuth';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'NewPassword'>;
type RoutePropType = RouteProp<AuthStackParamList, 'NewPassword'>;

export default function NewPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();

  const { email, token } = route.params;

  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ], [password]);

  const onSubmit = (values: NewPasswordFormValues) => {
    resetPassword({ token, newPassword: values.password });
  };

  const apiError = error instanceof Error ? error.message : undefined;

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
            <Ionicons name="shield-checkmark-outline" size={40} color="#004CFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password to keep your account secure
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="New Password"
                placeholder="Create a new password"
                secureTextEntry
                prefixIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Strength meter */}
          <PasswordStrengthMeter password={password} />

          {/* Requirements checklist */}
          {password.length > 0 && (
            <View style={styles.requirements}>
              {requirements.map((req, i) => (
                <View key={i} style={styles.requirementRow}>
                  <View style={[styles.reqDot, req.met && styles.reqDotMet]}>
                    {req.met && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.reqText, req.met && styles.reqTextMet]}>
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Confirm Password"
                placeholder="Re-enter your new password"
                secureTextEntry
                prefixIcon="shield-checkmark-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {/* Submit button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Reset Password"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            size="lg"
          />
        </View>

        {/* Trust note */}
        <View style={styles.trustNote}>
          <Ionicons name="information-circle-outline" size={16} color="#5F6C7B" />
          <Text style={styles.trustNoteText}>
            You'll need to sign in again with your new password
          </Text>
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
  illustrationContainer: { alignItems: 'center', marginTop: 16, marginBottom: 20 },
  illustrationCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontFamily: 'Raleway_700Bold', fontSize: 28,
    color: '#111322', textAlign: 'center',
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 15,
    color: '#5F6C7B', textAlign: 'center',
    lineHeight: 22, marginBottom: 24,
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
  requirements: {
    paddingHorizontal: 16, marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 4,
  },
  reqDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E4E7EC',
    alignItems: 'center', justifyContent: 'center',
  },
  reqDotMet: { backgroundColor: '#08A81D' },
  reqText: {
    fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9BA5B0',
  },
  reqTextMet: { color: '#111322' },
  buttonWrapper: {
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  trustNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    justifyContent: 'center', paddingVertical: 8,
  },
  trustNoteText: {
    fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#5F6C7B',
  },
});
