import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
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
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { mutate: login, isPending, error } = useLogin();

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

  const apiError = (error as any)?.response?.data?.message as string | undefined;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* ── Header: Back button ───────────────────────────────────────── */}
      <View
        className="flex-row items-center px-6 gap-1"
        style={{ paddingTop: insets.top + 12, paddingBottom: 8 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ minWidth: 44, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color="#111322" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 32 }}
      >
        {/* Heading */}
        <Text
          style={{
            fontFamily: 'Raleway_700Bold',
            fontSize: 28,
            color: '#111322',
            marginBottom: 6,
            letterSpacing: -0.3,
          }}
        >
          Welcome Back
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontFamily: 'Nunito_400Regular',
            fontSize: 16,
            color: '#5F6C7B',
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          Sign in to continue to your account
        </Text>

        {/* API error message */}
        {apiError && (
          <View className="flex-row items-center mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FEE2E2', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color="#B3261E" />
            <Text
              style={{ fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#7F1D1D', flex: 1, lineHeight: 20 }}
              accessibilityLiveRegion="polite"
            >
              {apiError}
            </Text>
          </View>
        )}

        {/* Email input */}
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

        {/* Password input */}
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

        {/* Forgot password link */}
        <TouchableOpacity
          className="self-end mb-8 py-2 px-1"
          onPress={() => navigation.navigate('ForgotPassword')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#004CFF' }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login button */}
        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          fullWidth
          size="lg"
        />

        {/* Register link */}
        <View className="flex-row justify-center mt-6 py-3" style={{ minHeight: 44, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#5F6C7B' }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Register"
          >
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#004CFF' }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
