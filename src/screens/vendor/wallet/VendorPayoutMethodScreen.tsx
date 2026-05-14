import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {
  useBankAccounts,
  useMomoAccounts,
  useAddBankAccount,
  useAddMomoAccount,
  useDeleteBankAccount,
  useDeleteMomoAccount,
} from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type AddMethodType = 'bank' | 'momo' | null;

export default function VendorPayoutMethodScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: bankAccounts } = useBankAccounts();
  const { data: momoAccounts } = useMomoAccounts();
  const addBank = useAddBankAccount();
  const addMomo = useAddMomoAccount();
  const deleteBank = useDeleteBankAccount();
  const deleteMomo = useDeleteMomoAccount();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<AddMethodType>(null);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [provider, setProvider] = useState<'mtn' | 'airteltigo' | 'telecel' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const resetForm = useCallback(() => {
    setShowForm(false);
    setFormType(null);
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setBankCode('');
    setProvider(null);
    setPhoneNumber('');
  }, []);

  const handleAdd = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    if (formType === 'bank') {
      if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
        return ToastEmitter.error('Fill in all bank account fields');
      }
      addBank.mutate(
        { bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim(), bankCode: bankCode.trim() || '000' },
        {
          onSuccess: () => {
            ToastEmitter.success('Bank account added');
            resetForm();
          },
          onError: () => ToastEmitter.error('Failed to add bank account'),
        },
      );
    } else if (formType === 'momo') {
      if (!provider || !phoneNumber.trim() || !accountName.trim()) {
        return ToastEmitter.error('Fill in all MoMo fields');
      }
      addMomo.mutate(
        { provider, phoneNumber: phoneNumber.trim(), accountName: accountName.trim() },
        {
          onSuccess: () => {
            ToastEmitter.success('Mobile money account added');
            resetForm();
          },
          onError: () => ToastEmitter.error('Failed to add MoMo account'),
        },
      );
    }
  }, [formType, bankName, accountNumber, accountName, bankCode, provider, phoneNumber, addBank, addMomo, resetForm]);

  const handleDelete = useCallback((id: string, type: 'bank' | 'momo') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    if (type === 'bank') {
      deleteBank.mutate(id, {
        onSuccess: () => ToastEmitter.success('Bank account removed'),
        onError: () => ToastEmitter.error('Failed to remove bank account'),
      });
    } else {
      deleteMomo.mutate(id, {
        onSuccess: () => ToastEmitter.success('MoMo account removed'),
        onError: () => ToastEmitter.error('Failed to remove MoMo account'),
      });
    }
  }, [deleteBank, deleteMomo]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Methods</Text>
        <TouchableOpacity
          onPress={() => { setShowForm(!showForm); setFormType(null); resetForm(); }}
          accessibilityRole="button"
          accessibilityLabel="Add payout method"
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {/* ── Add Form ── */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Payout Method</Text>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, formType === 'bank' && styles.typeBtnActive]}
                onPress={() => setFormType('bank')}
                accessibilityRole="radio"
                accessibilityLabel="Bank account"
                accessibilityState={{ selected: formType === 'bank' }}
              >
                <Ionicons name="business-outline" size={18} color={formType === 'bank' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.typeBtnText, formType === 'bank' && styles.typeBtnTextActive]}>Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, formType === 'momo' && styles.typeBtnActive]}
                onPress={() => setFormType('momo')}
                accessibilityRole="radio"
                accessibilityLabel="Mobile money"
                accessibilityState={{ selected: formType === 'momo' }}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={formType === 'momo' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.typeBtnText, formType === 'momo' && styles.typeBtnTextActive]}>MoMo</Text>
              </TouchableOpacity>
            </View>

            {formType === 'bank' ? (
              <>
                <Text style={styles.fieldLabel}>Account Name</Text>
                <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Full name on account" placeholderTextColor={colors.textLight} />
                <Text style={styles.fieldLabel}>Bank Name</Text>
                <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder="e.g. GCB Bank" placeholderTextColor={colors.textLight} />
                <Text style={styles.fieldLabel}>Account Number</Text>
                <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber} placeholder="Account number" placeholderTextColor={colors.textLight} keyboardType="number-pad" />
              </>
            ) : formType === 'momo' ? (
              <>
                <Text style={styles.fieldLabel}>Account Name</Text>
                <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Full name" placeholderTextColor={colors.textLight} />
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
                <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="0555123456" placeholderTextColor={colors.textLight} keyboardType="phone-pad" />
              </>
            ) : null}

            {formType && (
              <Button
                title="Save"
                onPress={handleAdd}
                loading={addBank.isPending || addMomo.isPending}
                variant="default"
                size="lg"
                fullWidth
                style={{ borderRadius: radii.lg, marginTop: 8 }}
              />
            )}
          </View>
        )}

        {/* ── Bank Accounts ── */}
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        <View style={styles.card}>
          {bankAccounts && bankAccounts.length > 0 ? (
            bankAccounts.map((acc) => (
              <View key={acc.id} style={styles.methodRow}>
                <View style={styles.methodIcon}>
                  <Ionicons name="business-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{acc.accountName}</Text>
                  <Text style={styles.methodDetail}>{acc.bankName} · {acc.accountNumber}</Text>
                </View>
                {acc.isDefault && <Text style={styles.defaultTag}>Default</Text>}
                <TouchableOpacity
                  onPress={() => handleDelete(acc.id, 'bank')}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${acc.accountName}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="business-outline" size={24} color={colors.textLight} />
              <Text style={styles.emptyText}>No bank accounts saved</Text>
            </View>
          )}
        </View>

        {/* ── MoMo Accounts ── */}
        <Text style={styles.sectionTitle}>Mobile Money</Text>
        <View style={styles.card}>
          {momoAccounts && momoAccounts.length > 0 ? (
            momoAccounts.map((acc) => (
              <View key={acc.id} style={styles.methodRow}>
                <View style={styles.methodIcon}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{acc.accountName}</Text>
                  <Text style={styles.methodDetail}>{acc.provider} · {acc.phoneNumber}</Text>
                </View>
                {acc.isDefault && <Text style={styles.defaultTag}>Default</Text>}
                <TouchableOpacity
                  onPress={() => handleDelete(acc.id, 'momo')}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${acc.accountName}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="phone-portrait-outline" size={24} color={colors.textLight} />
              <Text style={styles.emptyText}>No mobile money accounts saved</Text>
            </View>
          )}
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
  content: { padding: 20, gap: 16 },
  formCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 20, gap: 12, ...shadows.md },
  formTitle: { ...typePresets.h4, fontFamily: fonts.headingSemi, color: colors.text, textAlign: 'center' },
  typeToggle: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, backgroundColor: colors.surface },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  typeBtnText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary },
  fieldLabel: { ...typePresets.labelSm, color: colors.text },
  input: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: fonts.body, color: colors.text },
  providerRow: { flexDirection: 'row', gap: 8 },
  providerChip: { flex: 1, paddingVertical: 10, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center' },
  providerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  providerChipText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  providerChipTextActive: { color: colors.white },
  sectionTitle: { ...typePresets.labelSm, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 4, ...shadows.sm },
  methodRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  methodIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1, gap: 2 },
  methodName: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  methodDetail: { ...typePresets.caption, color: colors.textSecondary },
  defaultTag: { backgroundColor: colors.primarySoft, borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2, ...typePresets.caption, fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 10 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
  emptySection: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  emptyText: { ...typePresets.bodySm, color: colors.textLight },
});
