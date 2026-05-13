import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleSendCode = () => {
    if (!email.trim()) return Alert.alert('Error', 'Enter your email');
    setStep('code');
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleVerify = () => {
    if (code.some((c) => !c)) return Alert.alert('Error', 'Enter the full verification code');
    setStep('success');
  };

  if (step === 'success') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', paddingBottom: insets.bottom + 32 }]}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={48} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Verified!</Text>
          <Text style={styles.successText}>Your account has been verified. You now have access to all features.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'code' ? setStep('email') : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Verification</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {step === 'email' ? (
          <>
            <View style={styles.illustration}>
              <Ionicons name="mail-unread-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>Enter your email address to receive a verification code.</Text>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textLighter} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendCode}>
              <Text style={styles.primaryBtnText}>Send Verification Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.illustration}>
              <Ionicons name="lock-closed-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>
            <View style={styles.codeRow}>
              {code.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => { inputRefs.current[idx] = ref; }}
                  style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                  value={digit}
                  onChangeText={(t) => handleCodeChange(t, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && !digit && idx > 0 && inputRefs.current[idx - 1]?.focus()}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify}>
              <Text style={styles.primaryBtnText}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendBtn}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { padding: 24, gap: 12 },
  illustration: { alignItems: 'center', paddingVertical: 24 },
  title: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text, textAlign: 'center' },
  subtitle: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  inputLabel: { ...typePresets.label, color: colors.textSecondary, marginBottom: 4 },
  input: { ...typePresets.body, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 14, color: colors.text },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 16 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
  codeInput: { width: 48, height: 56, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.border, textAlign: 'center', fontSize: 22, fontFamily: 'Rubik_700Bold', color: colors.text },
  codeInputFilled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  resendBtn: { alignItems: 'center', paddingVertical: 12 },
  resendText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accentGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.text },
  successText: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 16, paddingHorizontal: 48, marginTop: 24 },
  doneBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 16 },
});
