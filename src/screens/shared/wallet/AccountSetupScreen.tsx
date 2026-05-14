import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAddBankAccount, useAddMomoAccount } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type AccountType = 'bank' | 'momo';

export default function AccountSetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const addBank = useAddBankAccount();
  const addMomo = useAddMomoAccount();

  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [provider, setProvider] = useState<'mtn' | 'airteltigo' | 'telecel' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const isPending = addBank.isPending || addMomo.isPending;

  const handleSave = () => {
    if (!accountName.trim()) return ToastEmitter.error('Account name is required');

    if (accountType === 'bank') {
      if (!bankName.trim() || !accountNumber.trim()) {
        return ToastEmitter.error('Fill in all bank account fields');
      }
      addBank.mutate(
        {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          bankCode: bankCode.trim() || '000',
        },
        {
          onSuccess: () => {
            ToastEmitter.success('Bank account added');
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Failed to add bank account'),
        },
      );
    } else {
      if (!provider || !phoneNumber.trim()) {
        return ToastEmitter.error('Select provider and enter phone number');
      }
      addMomo.mutate(
        {
          provider,
          phoneNumber: phoneNumber.trim(),
          accountName: accountName.trim(),
        },
        {
          onSuccess: () => {
            ToastEmitter.success('Mobile money account added');
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Failed to add MoMo account'),
        },
      );
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payout Account</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {/* ── Type Toggle ── */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, accountType === 'bank' && styles.typeCardActive]}
            onPress={() => setAccountType('bank')}
            accessibilityRole="radio"
            accessibilityLabel="Bank account"
            accessibilityState={{ selected: accountType === 'bank' }}
          >
            <Ionicons name="business-outline" size={24} color={accountType === 'bank' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeLabel, accountType === 'bank' && styles.typeLabelActive]}>Bank Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeCard, accountType === 'momo' && styles.typeCardActive]}
            onPress={() => setAccountType('momo')}
            accessibilityRole="radio"
            accessibilityLabel="Mobile money"
            accessibilityState={{ selected: accountType === 'momo' }}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={accountType === 'momo' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeLabel, accountType === 'momo' && styles.typeLabelActive]}>Mobile Money</Text>
          </TouchableOpacity>
        </View>

        {/* ── Common Fields ── */}
        <Text style={styles.fieldLabel}>Account Name</Text>
        <TextInput
          style={styles.input}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Full name on account"
          placeholderTextColor={colors.textLight}
          accessibilityLabel="Account name"
        />

        {accountType === 'bank' ? (
          <>
            <Text style={styles.fieldLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. GCB Bank"
              placeholderTextColor={colors.textLight}
              accessibilityLabel="Bank name"
            />
            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Account number"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              accessibilityLabel="Account number"
            />
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Provider</Text>
            <View style={styles.providerRow}>
              {(['mtn', 'airteltigo', 'telecel'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.providerChip, provider === p && styles.providerChipActive]}
                  onPress={() => setProvider(p)}
                  accessibilityRole="radio"
                  accessibilityLabel={p}
                  accessibilityState={{ selected: provider === p }}
                >
                  <Text style={[styles.providerChipText, provider === p && styles.providerChipTextActive]}>
                    {p === 'mtn' ? 'MTN' : p === 'airteltigo' ? 'AirtelTigo' : 'Telecel'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="e.g. 0555123456"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              accessibilityLabel="Phone number"
            />
          </>
        )}

        <Button
          title="Save Account"
          onPress={handleSave}
          loading={isPending}
          variant="default"
          size="lg"
          fullWidth
          style={{ borderRadius: radii.xl, marginTop: 16 }}
          accessibilityLabel="Save payout account"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { padding: 20, gap: 12 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.borderLight },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  typeLabel: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  typeLabelActive: { color: colors.primary },
  fieldLabel: { ...typePresets.labelSm, color: colors.text },
  input: { backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: fonts.body, color: colors.text },
  providerRow: { flexDirection: 'row', gap: 8 },
  providerChip: { flex: 1, paddingVertical: 12, borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center' },
  providerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  providerChipText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  providerChipTextActive: { color: colors.white },
});
