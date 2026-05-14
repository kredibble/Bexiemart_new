import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useSetupPin, useChangePin, useVerifyPin } from '@/hooks/useWallet';
import { WalletPinInput } from '@/components/wallet';
import { colors, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type PinMode = 'setup' | 'change' | 'verify';

export default function PinSetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { mode?: PinMode } }, 'params'>>();
  const mode = route.params?.mode ?? 'setup';

  const setupPin = useSetupPin();
  const changePin = useChangePin();
  const verifyPin = useVerifyPin();

  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'new' | 'confirm' | 'current'>('new');

  useEffect(() => {
    if (mode === 'change') setStep('current');
  }, [mode]);

  const isPending = setupPin.isPending || changePin.isPending || verifyPin.isPending;

  const getTitle = () => {
    switch (mode) {
      case 'setup': return step === 'confirm' ? 'Confirm PIN' : 'Set Up PIN';
      case 'change': return step === 'current' ? 'Current PIN' : step === 'new' ? 'New PIN' : 'Confirm New PIN';
      case 'verify': return 'Verify PIN';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'setup': return 'Create a 6-digit PIN to secure your wallet transactions';
      case 'change': return 'Enter your current PIN first, then set a new one';
      case 'verify': return 'Enter your PIN to authorize this action';
    }
  };

  const handleNext = () => {
    if (mode === 'setup') {
      if (pin.length < 6) return ToastEmitter.error('PIN must be 6 digits');
      setStep('confirm');
      return;
    }
    if (mode === 'change') {
      if (step === 'current') {
        if (currentPin.length < 6) return ToastEmitter.error('Enter your current PIN');
        setStep('new');
        return;
      }
      if (step === 'new') {
        if (newPin.length < 6) return ToastEmitter.error('New PIN must be 6 digits');
        setStep('confirm');
        return;
      }
      if (step === 'confirm') {
        if (newPin !== confirmPin) return ToastEmitter.error('PINs do not match');
        changePin.mutate(
          { currentPin, newPin, confirmPin },
          {
            onSuccess: () => {
              ToastEmitter.success('PIN changed successfully');
              navigation.goBack();
            },
            onError: () => ToastEmitter.error('Failed to change PIN'),
          },
        );
        return;
      }
    }
    if (mode === 'verify') {
      if (pin.length < 6) return ToastEmitter.error('PIN must be 6 digits');
      verifyPin.mutate(
        { pin },
        {
          onSuccess: (data: { valid: boolean }) => {
            if (data.valid) {
              ToastEmitter.success('PIN verified');
              navigation.goBack();
            } else {
              ToastEmitter.error('Incorrect PIN');
            }
          },
          onError: () => ToastEmitter.error('Verification failed'),
        },
      );
    }
  };

  const handleConfirm = () => {
    if (mode === 'setup') {
      if (pin !== confirmPin) return ToastEmitter.error('PINs do not match');
      setupPin.mutate(
        { pin, confirmPin: pin },
        {
          onSuccess: () => {
            ToastEmitter.success('PIN set up successfully');
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Failed to set up PIN'),
        },
      );
    }
  };

  const isSetupStep1 = mode === 'setup' && step === 'new';
  const isSetupConfirm = mode === 'setup' && step === 'confirm';
  const isChangeCurrent = mode === 'change' && step === 'current';
  const isChangeNew = mode === 'change' && step === 'new';
  const isChangeConfirm = mode === 'change' && step === 'confirm';
  const isVerify = mode === 'verify';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isSetupConfirm) { setStep('new'); return; }
            if (isChangeNew) { setStep('current'); setNewPin(''); return; }
            if (isChangeConfirm) { setStep('new'); setConfirmPin(''); return; }
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={[styles.content, { flex: 1, justifyContent: 'center', paddingBottom: 80 }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.description}>{getDescription()}</Text>

        <View style={styles.pinWrapper}>
          {isSetupStep1 && (
            <WalletPinInput value={pin} onChange={setPin} />
          )}
          {isSetupConfirm && (
            <WalletPinInput value={confirmPin} onChange={setConfirmPin} label="Re-enter your new PIN" />
          )}
          {isChangeCurrent && (
            <WalletPinInput value={currentPin} onChange={setCurrentPin} label="Enter current PIN" />
          )}
          {isChangeNew && (
            <WalletPinInput value={newPin} onChange={setNewPin} label="Enter new PIN" />
          )}
          {isChangeConfirm && (
            <WalletPinInput value={confirmPin} onChange={setConfirmPin} label="Re-enter new PIN" />
          )}
          {isVerify && (
            <WalletPinInput value={pin} onChange={setPin} label="Enter your PIN" />
          )}
        </View>

        <Button
          title={
            isSetupConfirm ? 'Confirm' :
            isVerify ? 'Verify' :
            isChangeConfirm ? 'Change PIN' :
            isChangeCurrent ? 'Next' :
            isChangeNew ? 'Next' :
            'Next'
          }
          onPress={isSetupConfirm ? handleConfirm : handleNext}
          loading={isPending}
          disabled={
            (isSetupStep1 && pin.length < 6) ||
            (isSetupConfirm && confirmPin.length < 6) ||
            (isChangeCurrent && currentPin.length < 6) ||
            (isChangeNew && newPin.length < 6) ||
            (isChangeConfirm && confirmPin.length < 6) ||
            (isVerify && pin.length < 6)
          }
          variant="default"
          size="lg"
          fullWidth
          style={{ borderRadius: radii.xl, marginTop: 32 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { paddingHorizontal: 24, alignItems: 'center' },
  iconContainer: { marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text, textAlign: 'center', marginBottom: 8 },
  description: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 40, maxWidth: 300 },
  pinWrapper: { width: '100%', alignItems: 'center' },
});
