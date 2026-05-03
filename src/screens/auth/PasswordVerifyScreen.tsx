import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useVerifyOtp, useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PasswordVerify'>;
type RoutePropType = RouteProp<AuthStackParamList, 'PasswordVerify'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function PasswordVerifyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();

  // Read the email passed from ForgotPasswordScreen
  const { email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const { mutate: verifyOtp, isPending, error } = useVerifyOtp();
  const { mutate: resendCode, isPending: isResending } = useForgotPassword();

  // Countdown timer for the resend button
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance to next box on input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Go back to previous box on backspace when current box is empty
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    verifyOtp({ email, code });
    // useVerifyOtp navigates to NewPassword on success (see hooks/useAuth.ts)
  };

  const handleResend = () => {
    resendCode(email);
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const apiError = (error as any)?.response?.data?.message as string | undefined;
  const isComplete = otp.every((d) => d !== '');

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
            backgroundColor: '#D1FAE5',
            alignSelf: 'center',
            marginTop: 24,
          }}
        >
          <Ionicons name="mail-outline" size={40} color="#065F46" />
        </View>

        <Text
          style={{ fontFamily: 'Raleway_700Bold', fontSize: 28, color: '#111322', marginBottom: 6, textAlign: 'center', letterSpacing: -0.5 }}
        >
          Verify It's You
        </Text>
        <Text
          style={{ fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#5F6C7B', marginBottom: 8, lineHeight: 24, textAlign: 'center' }}
        >
          Enter the 6-digit code sent to
        </Text>
        <Text
          style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#111322', marginBottom: 36, textAlign: 'center' }}
        >
          {email}
        </Text>

        {/* OTP boxes card */}
        <View
          className="p-6 rounded-2xl mb-6 items-center"
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={{
                  width: 48,
                  height: 60,
                  borderWidth: 2,
                  borderColor: otp[index] ? '#004CFF' : '#E4E7EC',
                  borderRadius: 14,
                  textAlign: 'center',
                  fontFamily: 'Raleway_700Bold',
                  fontSize: 24,
                  color: '#111322',
                  backgroundColor: otp[index] ? '#EEF2FF' : '#FFFFFF',
                }}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index]}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                accessibilityLabel={`Digit ${index + 1} of 6`}
              />
            ))}
          </View>
        </View>

        {/* API error */}
        {apiError && (
          <View className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}>
            <Text
              style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#B3261E', textAlign: 'center' }}
              accessibilityLiveRegion="polite"
            >
              {apiError}
            </Text>
          </View>
        )}

        {/* Verify button */}
        <View
          className="items-center mb-6"
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
            title="Verify"
            onPress={handleVerify}
            loading={isPending}
            disabled={!isComplete}
          />
        </View>

        {/* Resend countdown */}
        <View className="items-center" style={{ minHeight: 44, justifyContent: 'center' }}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Resend code"
            >
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#004CFF' }}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#8E8E93' }}>
              Resend code in{' '}
              <Text style={{ fontFamily: 'Nunito_700Bold', color: '#111322' }}>
                {countdown}s
              </Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}