/**
 * RegisterScreen — Step-by-step wizard with animated progress,
 * password strength meter, and visually rich role selection.
 *
 * Step 1: Personal info (name, email, phone)
 * Step 2: Password + role selection
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerSchema, type RegisterFormValues } from '@/utils/validation';
import { useRegister } from '@/hooks/useAuth';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type Role = 'customer' | 'vendor';

const TOTAL_STEPS = 2;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { mutate: register, isPending, error } = useRegister();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['name', 'email', 'phone']);
      if (isValid) setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else navigation.goBack();
  };

  const handleRoleSelect = (role: Role) => {
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = (values: RegisterFormValues) => {
    register(values);
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
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>

        {/* Step dots */}
        <View style={styles.stepDots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i + 1 <= currentStep && styles.dotActive,
                i + 1 === currentStep && styles.dotCurrent,
              ]}
            />
          ))}
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Scrollable body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 32 }}
      >
        {/* Step title */}
        <Text style={styles.stepTitle}>
          {currentStep === 1 ? 'Create your account' : 'Secure your account'}
        </Text>
        <Text style={styles.stepSubtitle}>
          {currentStep === 1
            ? 'Tell us a bit about yourself'
            : 'Choose a password and how you will use BexieMart'}
        </Text>

        {/* API error */}
        {apiError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#B3261E" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{apiError}</Text>
          </View>
        )}

        {/* ── Step 1: Personal info ─────────────────────────────────── */}
        {currentStep === 1 && (
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  prefixIcon="person-outline"
                />
              )}
            />
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  prefixIcon="mail-outline"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Phone Number"
                  placeholder="e.g. 024 123 4567"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  prefixIcon="call-outline"
                />
              )}
            />
          </View>
        )}

        {/* ── Step 2: Password + Role ───────────────────────────────── */}
        {currentStep === 2 && (
          <>
            <View style={styles.formCard}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Password"
                    placeholder="Create a strong password"
                    secureTextEntry
                    prefixIcon="lock-closed-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    helper="Min 8 chars, 1 uppercase, 1 number"
                  />
                )}
              />
              <PasswordStrengthMeter password={password} />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Confirm Password"
                    placeholder="Re-enter your password"
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

            {/* Role selector */}
            <Text style={styles.roleLabel}>I want to...</Text>
            <View style={styles.roleRow}>
              <RoleCard
                icon="bag-handle-outline"
                label="Shop"
                sublabel="Browse & buy"
                isSelected={selectedRole === 'customer'}
                onPress={() => handleRoleSelect('customer')}
              />
              <RoleCard
                icon="storefront-outline"
                label="Sell"
                sublabel="List products"
                isSelected={selectedRole === 'vendor'}
                onPress={() => handleRoleSelect('vendor')}
              />
            </View>
          </>
        )}

        {/* Action button */}
        <View style={styles.buttonWrapper}>
          {currentStep === 1 ? (
            <Button
              title="Continue"
              onPress={handleNext}
              fullWidth
              size="lg"
            />
          ) : (
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
              fullWidth
              size="lg"
            />
          )}
        </View>

        {/* Login link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Login"
          >
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ── RoleCard ─────────────────────────────────────────────────────────── */

interface RoleCardProps {
  icon: string;
  label: string;
  sublabel: string;
  isSelected: boolean;
  onPress: () => void;
}

function RoleCard({ icon, label, sublabel, isSelected, onPress }: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, isSelected && styles.roleCardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <View style={[styles.roleIconCircle, isSelected && styles.roleIconCircleSelected]}>
        <Ionicons name={icon as any} size={24} color={isSelected ? '#004CFF' : '#8E8E93'} />
      </View>
      <Text style={[styles.roleCardText, isSelected && styles.roleCardTextSelected]}>{label}</Text>
      <Text style={[styles.roleSublabel, isSelected && styles.roleSublabelSelected]}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  accentBar: { height: 4, backgroundColor: '#004CFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  dotActive: { backgroundColor: '#004CFF' },
  dotCurrent: { width: 24 },
  stepTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28,
    color: '#111322',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#5F6C7B',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#7F1D1D',
    flex: 1,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
  },
  roleLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#111322',
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 8,
  },
  roleCardSelected: {
    borderColor: '#004CFF',
    backgroundColor: '#EEF2FF',
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircleSelected: {
    backgroundColor: '#FFFFFF',
  },
  roleCardText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#111322',
  },
  roleCardTextSelected: {
    color: '#004CFF',
  },
  roleSublabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  roleSublabelSelected: {
    color: '#5F6C7B',
  },
  buttonWrapper: {
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#5F6C7B',
  },
  footerLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#004CFF',
  },
});
