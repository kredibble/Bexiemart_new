// RegisterScreen - User registration form with email, name, phone, password, and role selection
import React, { useState } from 'react';
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
import { registerSchema, type RegisterFormValues } from '@/utils/validation';
import { useRegister } from '@/hooks/useAuth';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type Role = 'customer' | 'vendor';

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { mutate: register, isPending, error } = useRegister();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer', // Default to customer
    },
  });

  // Watch role so the UI stays in sync with form value
  const selectedRole = watch('role');

  const handleRoleSelect = (role: Role) => {
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = (values: RegisterFormValues) => {
    register(values);
  };

  const apiError = (error as any)?.response?.data?.message as string | undefined;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: '#F8F9FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View
        className="flex-row items-center px-4 gap-1"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          className="flex-row items-center gap-1 p-2"
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────── */}
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <Text
          style={{
            fontFamily: 'Raleway_700Bold',
            fontSize: 28,
            color: '#111322',
            marginBottom: 4,
            marginTop: 8,
            letterSpacing: -0.5,
          }}
        >
          Create Account
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito_400Regular',
            fontSize: 16,
            color: '#5F6C7B',
            marginBottom: 28,
            lineHeight: 24,
          }}
        >
          Join the campus marketplace
        </Text>

        {/* Form card */}
        <View
          className="p-5 rounded-2xl mb-6"
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
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
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {/* ── Role selector ──────────────────────────────────────────── */}
        <Text
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 14,
            color: '#111322',
            marginBottom: 10,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          I want to...
        </Text>
        <View className="flex-row gap-3 mb-2">
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
        {errors.role && (
          <Text
            style={{ fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#B3261E', marginBottom: 8 }}
            accessibilityLiveRegion="polite"
          >
            {errors.role.message}
          </Text>
        )}

        {/* API error */}
        {apiError && (
          <View
            className="mb-4 p-4 rounded-xl"
            style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
          >
            <Text
              style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#B3261E' }}
              accessibilityLiveRegion="polite"
            >
              {apiError}
            </Text>
          </View>
        )}

        {/* Submit button */}
        <View
          className="items-center mt-4 mb-4"
          style={{
            ...Platform.OS !== 'web' && {
              shadowColor: '#004CFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 4,
            },
          }}
        >
          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
          />
        </View>

        {/* Login link */}
        <View className="flex-row justify-center" style={{ minHeight: 44, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#5F6C7B' }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Login"
          >
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#004CFF' }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── RoleCard sub-component ───────────────────────────────────────────────────
// Defined in the same file — extracted to keep RegisterScreen readable
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
      className="flex-1 p-5 rounded-2xl items-center gap-2"
      style={{
        borderWidth: 2,
        borderColor: isSelected ? '#004CFF' : '#E4E7EC',
        backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
        minHeight: 96,
        ...Platform.OS !== 'web' && isSelected && {
          shadowColor: '#004CFF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        },
      }}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <Ionicons
        name={icon as any}
        size={28}
        color={isSelected ? '#004CFF' : '#8E8E93'}
      />
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 15,
          color: isSelected ? '#004CFF' : '#111322',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'Nunito_400Regular',
          fontSize: 12,
          color: isSelected ? '#5F6C7B' : '#8E8E93',
          textAlign: 'center',
        }}
      >
        {sublabel}
      </Text>
    </TouchableOpacity>
  );
}