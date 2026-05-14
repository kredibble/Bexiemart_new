import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  useWallet,
  useWalletSettings,
  useUpdateWalletSettings,
  useSetupPin,
  useChangePin,
  useBankAccounts,
  useMomoAccounts,
} from '@/hooks/useWallet';
import { WalletPinInput } from '@/components/wallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type SettingsStep = 'main' | 'pin-setup' | 'pin-change' | 'pin-current';

export default function WalletSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: wallet } = useWallet();
  const { data: settings } = useWalletSettings();
  const updateSettings = useUpdateWalletSettings();
  const setupPin = useSetupPin();
  const changePin = useChangePin();
  const { data: bankAccounts } = useBankAccounts();
  const { data: momoAccounts } = useMomoAccounts();

  const [step, setStep] = useState<SettingsStep>('main');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSetupPin = () => {
    if (pin.length < 6) return ToastEmitter.error('PIN must be 6 digits');
    setupPin.mutate(
      { pin, confirmPin: pin },
      {
        onSuccess: () => {
          ToastEmitter.success('PIN set up successfully');
          setStep('main');
          setPin('');
        },
        onError: () => ToastEmitter.error('Failed to set up PIN'),
      },
    );
  };

  const handleChangePin = () => {
    if (!currentPin) return ToastEmitter.error('Enter your current PIN');
    if (newPin.length < 6) return ToastEmitter.error('New PIN must be 6 digits');
    if (newPin !== confirmPin) return ToastEmitter.error('New PINs do not match');
    changePin.mutate(
      { currentPin, newPin, confirmPin },
      {
        onSuccess: () => {
          ToastEmitter.success('PIN changed successfully');
          setStep('main');
          setCurrentPin('');
          setNewPin('');
          setConfirmPin('');
        },
        onError: () => ToastEmitter.error('Failed to change PIN'),
      },
    );
  };

  const handleToggleNotif = (val: boolean) => {
    setNotifEnabled(val);
    updateSettings.mutate({ transactionNotifications: val });
  };

  const handleToggleLowBalance = (val: boolean) => {
    setLowBalanceAlert(val);
    updateSettings.mutate({ lowBalanceAlert: val });
  };

  if (step === 'pin-setup') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setStep('main'); setPin(''); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Up PIN</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={[styles.content, { flex: 1, justifyContent: 'center', paddingBottom: 80 }]}>
          <WalletPinInput value={pin} onChange={setPin} label="Create a 6-digit transaction PIN" />
          <Button
            title="Set PIN"
            onPress={handleSetupPin}
            loading={setupPin.isPending}
            disabled={pin.length < 6}
            variant="default"
            size="lg"
            fullWidth
            style={{ borderRadius: radii.xl, marginTop: 32 }}
          />
        </View>
      </View>
    );
  }

  if (step === 'pin-change') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setStep('main'); setNewPin(''); setConfirmPin(''); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change PIN</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Current PIN</Text>
          <WalletPinInput value={currentPin} onChange={setCurrentPin} />

          <View style={{ marginTop: 24 }}>
            <Text style={styles.fieldLabel}>New PIN</Text>
            <WalletPinInput value={newPin} onChange={setNewPin} />
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.fieldLabel}>Confirm New PIN</Text>
            <WalletPinInput value={confirmPin} onChange={setConfirmPin} />
          </View>

          <Button
            title="Change PIN"
            onPress={handleChangePin}
            loading={changePin.isPending}
            disabled={!currentPin || newPin.length < 6 || newPin !== confirmPin}
            variant="default"
            size="lg"
            fullWidth
            style={{ borderRadius: radii.xl, marginTop: 32 }}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* ── Security Section ── */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          {wallet?.hasPinSet ? (
            <TouchableOpacity style={styles.settingRow} onPress={() => { setStep('pin-change'); setCurrentPin(''); setNewPin(''); setConfirmPin(''); }}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Change PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.settingRow} onPress={() => setStep('pin-setup')}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-open-outline" size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Set Up Transaction PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Preferences Section ── */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <View>
                <Text style={styles.settingLabel}>Transaction Notifications</Text>
                <Text style={styles.settingDesc}>Get alerted on wallet transactions</Text>
              </View>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: colors.borderLight, true: colors.primarySoft }}
              thumbColor={notifEnabled ? colors.primary : colors.textLight}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="warning-outline" size={20} color={colors.text} />
              <View>
                <Text style={styles.settingLabel}>Low Balance Alert</Text>
                <Text style={styles.settingDesc}>Notify when balance is low</Text>
              </View>
            </View>
            <Switch
              value={lowBalanceAlert}
              onValueChange={handleToggleLowBalance}
              trackColor={{ false: colors.borderLight, true: colors.primarySoft }}
              thumbColor={lowBalanceAlert ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        {/* ── Linked Accounts Section ── */}
        <Text style={styles.sectionTitle}>Linked Accounts</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="business-outline" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>Bank Accounts</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{bankAccounts?.length ?? 0}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>Mobile Money</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{momoAccounts?.length ?? 0}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </View>
          </View>
        </View>

        {/* ── Daily Limit Section ── */}
        <Text style={styles.sectionTitle}>Limits</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="trending-up-outline" size={20} color={colors.text} />
              <View>
                <Text style={styles.settingLabel}>Daily Transaction Limit</Text>
                <Text style={styles.settingDesc}>{wallet ? `GH₵ ${wallet.dailyLimit.toFixed(2)}` : '—'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { padding: 20, gap: 4 },
  sectionTitle: { ...typePresets.labelSm, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 4, ...shadows.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingLabel: { ...typePresets.body, fontFamily: fonts.bodySemi, color: colors.text },
  settingDesc: { ...typePresets.caption, color: colors.textSecondary, marginTop: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { ...typePresets.body, fontFamily: fonts.bodySemi, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },
  fieldLabel: { ...typePresets.labelSm, color: colors.text, marginBottom: 8 },
});
