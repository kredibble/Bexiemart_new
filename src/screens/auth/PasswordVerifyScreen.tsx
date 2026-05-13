/**
 * PasswordVerifyScreen — Animated OTP input with enhanced visual feedback,
 * progress timer, and clear resend flow.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useVerifyOtp, useResendOtp } from '@/hooks/useAuth';
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
  const { email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const { mutate: verifyOtp, isPending, error } = useVerifyOtp();
  const { mutate: resendCode, isPending: isResending } = useResendOtp();

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    if (!digit && value.length > 0) return;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    verifyOtp({ email, code });
  };

  const handleResend = () => {
    resendCode(email);
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const apiError = error instanceof Error ? error.message : undefined;
  const isComplete = otp.every((d) => d !== '');
  const filledCount = otp.filter((d) => d !== '').length;

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
          <View style={[styles.illustrationCircle, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="mail-outline" size={40} color="#065F46" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify It's You</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${(filledCount / OTP_LENGTH) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{filledCount} of {OTP_LENGTH}</Text>
        </View>

        {/* OTP boxes */}
        <View style={styles.otpCard}>
          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <OTPBox
                key={index}
                index={index}
                value={otp[index]}
                isFilled={otp[index] !== ''}
                isComplete={isComplete}
                inputRef={(ref) => { inputRefs.current[index] = ref; }}
                onChange={(val) => handleOtpChange(val, index)}
                onKeyPress={(key) => handleKeyPress(key, index)}
              />
            ))}
          </View>
        </View>

        {/* API error */}
        {apiError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#B3261E" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{apiError}</Text>
          </View>
        )}

        {/* Verify button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Verify Code"
            onPress={handleVerify}
            loading={isPending}
            disabled={!isComplete}
            fullWidth
            size="lg"
          />
        </View>

        {/* Resend section */}
        <View style={styles.resendSection}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Resend code"
            >
              <Text style={styles.resendLink}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCountdown}>
              Resend code in <Text style={styles.resendCountdownBold}>{countdown}s</Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ── OTPBox ────────────────────────────────────────────────────────────── */

interface OTPBoxProps {
  index: number;
  value: string;
  isFilled: boolean;
  isComplete: boolean;
  inputRef: (ref: TextInput | null) => void;
  onChange: (val: string) => void;
  onKeyPress: (key: string) => void;
}

function OTPBox({ index, value, isFilled, isComplete, inputRef, onChange, onKeyPress }: OTPBoxProps) {
  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (isFilled) {
      scale.value = withSpring(1.1, { damping: 15 }, () => {
        scale.value = withTiming(1, { duration: 150 });
      });
    }
  }, [isFilled]);

  return (
    <Animated.View style={rStyle}>
      <TextInput
        ref={inputRef}
        style={[
          styles.otpBox,
          isFilled && styles.otpBoxFilled,
          isComplete && styles.otpBoxComplete,
        ]}
        maxLength={1}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChange}
        onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key)}
        accessibilityLabel={`Digit ${index + 1} of 6`}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  accentBar: { height: 4, backgroundColor: '#7C3AED' },
  headerRow: { paddingHorizontal: 24, paddingBottom: 8 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  illustrationContainer: { alignItems: 'center', marginTop: 16, marginBottom: 20 },
  illustrationCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontFamily: 'Rubik_700Bold', fontSize: 28,
    color: '#111322', textAlign: 'center',
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 15,
    color: '#5F6C7B', textAlign: 'center',
    lineHeight: 22, marginBottom: 4,
  },
  emailText: {
    fontFamily: 'NunitoSans_700Bold', fontSize: 15,
    color: '#111322', textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 20,
  },
  progressTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#E4E7EC', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 2,
    backgroundColor: '#7C3AED',
  },
  progressText: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 12,
    color: '#5F6C7B', minWidth: 50, textAlign: 'right',
  },
  otpCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 24, marginBottom: 24, alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.06)' },
    }),
  },
  otpRow: {
    flexDirection: 'row', gap: 10, justifyContent: 'center',
  },
  otpBox: {
    width: 48, height: 60,
    borderWidth: 2, borderColor: '#E4E7EC',
    borderRadius: 14, textAlign: 'center',
    fontFamily: 'Rubik_700Bold', fontSize: 24,
    color: '#111322', backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#7C3AED', backgroundColor: '#F3E8FF',
  },
  otpBoxComplete: {
    borderColor: '#7C3AED', backgroundColor: '#F3E8FF',
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  errorText: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 14,
    color: '#7F1D1D', flex: 1, lineHeight: 20,
  },
  buttonWrapper: {
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 12px rgba(0, 76, 255, 0.3)' },
    }),
  },
  resendSection: {
    alignItems: 'center', paddingVertical: 8,
  },
  resendLink: {
    fontFamily: 'NunitoSans_700Bold', fontSize: 15, color: '#7C3AED',
  },
  resendCountdown: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: '#8E8E93',
  },
  resendCountdownBold: {
    fontFamily: 'NunitoSans_700Bold', color: '#111322',
  },
});
