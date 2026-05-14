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

import {
  useWallet,
  useBankAccounts,
  useMomoAccounts,
  useWithdrawToBank,
  useWithdrawToMomo,
} from '@/hooks/useWallet';
import { WalletPinInput } from '@/components/wallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type WithdrawMethod = 'bank' | 'momo';

export default function WalletWithdrawScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: wallet } = useWallet();
  const { data: bankAccounts } = useBankAccounts();
  const { data: momoAccounts } = useMomoAccounts();
  const withdrawBank = useWithdrawToBank();
  const withdrawMomo = useWithdrawToMomo();

  const [method, setMethod] = useState<WithdrawMethod>('bank');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'form' | 'pin'>('form');

  const numericAmount = parseFloat(amount) || 0;
  const isPending = withdrawBank.isPending || withdrawMomo.isPending;

  const accounts = method === 'bank' ? bankAccounts : momoAccounts;
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);
  const accountDisplayName = selectedAccount
    ? 'bankName' in selectedAccount
      ? selectedAccount.accountName
      : selectedAccount.accountName
    : '';

  const handleNext = () => {
    if (numericAmount <= 0) return ToastEmitter.error('Enter a valid amount');
    if (wallet && numericAmount > wallet.balance) return ToastEmitter.error('Insufficient balance');
    if (!selectedAccountId) return ToastEmitter.error(`Select a ${method === 'bank' ? 'bank' : 'MoMo'} account`);
    setStep('pin');
  };

  const handleSubmit = () => {
    if (pin.length < 6) {
      ToastEmitter.error('Enter your 6-digit PIN');
      return;
    }

    if (method === 'bank') {
      withdrawBank.mutate(
        { amount: numericAmount, bankAccountId: selectedAccountId!, pin },
        {
          onSuccess: () => {
            ToastEmitter.success(`Withdrawn ${formatCurrency(numericAmount)} to bank`);
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Withdrawal failed. Please try again.'),
        },
      );
    } else {
      withdrawMomo.mutate(
        { amount: numericAmount, momoAccountId: selectedAccountId!, pin },
        {
          onSuccess: () => {
            ToastEmitter.success(`Withdrawn ${formatCurrency(numericAmount)} to MoMo`);
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Withdrawal failed. Please try again.'),
        },
      );
    }
  };

  if (step === 'pin') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter PIN</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={[styles.content, { flex: 1, justifyContent: 'center', paddingBottom: 80 }]}>
          <View style={styles.pinPreview}>
            <Text style={styles.pinPreviewAmount}>{formatCurrency(numericAmount)}</Text>
            <Text style={styles.pinPreviewLabel}>
              to {accountDisplayName}
            </Text>
          </View>
          <WalletPinInput value={pin} onChange={setPin} label="Enter your withdrawal PIN" />
          <Button
            title="Withdraw"
            onPress={handleSubmit}
            loading={isPending}
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {wallet && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(wallet.balance)}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Withdraw To</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodCard, method === 'bank' && styles.methodCardActive]}
            onPress={() => { setMethod('bank'); setSelectedAccountId(null); }}
            accessibilityRole="radio"
            accessibilityLabel="Bank Account"
            accessibilityState={{ selected: method === 'bank' }}
          >
            <Ionicons name="business-outline" size={24} color={method === 'bank' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.methodLabel, method === 'bank' && styles.methodLabelActive]}>Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodCard, method === 'momo' && styles.methodCardActive]}
            onPress={() => { setMethod('momo'); setSelectedAccountId(null); }}
            accessibilityRole="radio"
            accessibilityLabel="Mobile Money"
            accessibilityState={{ selected: method === 'momo' }}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={method === 'momo' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.methodLabel, method === 'momo' && styles.methodLabelActive]}>Mobile Money</Text>
          </TouchableOpacity>
        </View>

        {accounts && accounts.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Select Account</Text>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accountCard, selectedAccountId === acc.id && styles.accountCardActive]}
                onPress={() => setSelectedAccountId(acc.id)}
                accessibilityRole="radio"
                accessibilityLabel={acc.accountName}
                accessibilityState={{ selected: selectedAccountId === acc.id }}
              >
                <View style={styles.accountIcon}>
                  <Ionicons
                    name={method === 'bank' ? 'business-outline' : 'phone-portrait-outline'}
                    size={20}
                    color={selectedAccountId === acc.id ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{acc.accountName}</Text>
                  <Text style={styles.accountNumber}>
                    {'bankName' in acc ? `${acc.bankName} · ${acc.accountNumber}` : acc.phoneNumber}
                  </Text>
                </View>
                {acc.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.noAccounts}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.textLight} />
            <Text style={styles.noAccountsText}>
              No {method === 'bank' ? 'bank' : 'MoMo'} accounts saved. Add one in settings.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Amount</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          accessibilityLabel="Withdrawal amount"
        />

        <Button
          title="Continue"
          onPress={handleNext}
          variant="default"
          size="lg"
          fullWidth
          disabled={numericAmount <= 0 || !selectedAccountId}
          style={{ borderRadius: radii.xl, marginTop: 8 }}
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
  content: { padding: 20, gap: 16 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radii.xl, padding: 24, alignItems: 'center', gap: 8, ...shadows.lg },
  balanceLabel: { ...typePresets.body, color: colors.primarySoft },
  balanceValue: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.white },
  sectionLabel: { ...typePresets.labelSm, color: colors.text, marginBottom: -8 },
  methodRow: { flexDirection: 'row', gap: 12 },
  methodCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.borderLight },
  methodCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  methodLabel: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  methodLabelActive: { color: colors.primary },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, gap: 12, borderWidth: 1.5, borderColor: colors.borderLight },
  accountCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  accountIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  accountInfo: { flex: 1, gap: 2 },
  accountName: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  accountNumber: { ...typePresets.caption, color: colors.textSecondary },
  defaultBadge: { backgroundColor: colors.primarySoft, borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2, ...typePresets.caption, fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 10 },
  noAccounts: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: colors.warningSoft, borderRadius: radii.lg },
  noAccountsText: { ...typePresets.bodySm, color: colors.textSecondary, flex: 1 },
  amountInput: { backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontFamily: fonts.heading, color: colors.text },
  pinPreview: { alignItems: 'center', marginBottom: 32, gap: 4 },
  pinPreviewAmount: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.text },
  pinPreviewLabel: { ...typePresets.body, color: colors.textSecondary },
});
