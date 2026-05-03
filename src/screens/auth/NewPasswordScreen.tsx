import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
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
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (values: NewPasswordFormValues) => {
    resetPassword({ email, token, newPassword: values.password });
    // useResetPassword navigates to Login on success
  };

  const apiError = (error as any)?.response?.data?.message as string | undefined;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: '#F8F9FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="flex-row items-center px-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          className="flex-row items-center gap-1 p-2"
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          style={{ minWidth: 44, minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Illustration circle */}
        <View
          className="items-center justify-center mb-8"
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: '#EEF2FF',
            alignSelf: 'center',
            marginTop: 24,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={44} color="#004CFF" />
        </View>

        <Text
          style={{ fontFamily: 'Raleway_700Bold', fontSize: 28, color: '#111322', marginBottom: 6, letterSpacing: -0.5 }}
        >
          Set New Password
        </Text>
        <Text
          style={{ fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#5F6C7B', marginBottom: 32, lineHeight: 24 }}
        >
          Create a strong password for your account
        </Text>

        {/* Form card */}
        <View
          className="p-5 rounded-2xl mb-4"
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="New Password"
                placeholder="Create a new password"
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
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {apiError && (
            <View className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
              <Text
                style={{ fontFamily: 'Nunito_500Medium', fontSize: 13, color: '#B3261E' }}
                accessibilityLiveRegion="polite"
              >
                {apiError}
              </Text>
            </View>
          )}
        </View>

        <View
          className="items-center mt-4"
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
            title="Reset Password"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}