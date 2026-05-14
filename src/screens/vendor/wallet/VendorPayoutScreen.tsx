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

import { useVendorEarnings, useWithdraw } from '@/hooks/useVendor';
import { useBankAccounts, useMomoAccounts } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

type PayoutType = 'bank' | 'momo';

const PROVIDER_COLORS: Record<string, string> = {
  mtn: '#FFCC00',
  airteltigo: '#ED1C24',
  telecel: '#003366',
};

export default function VendorPayoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: earnings } = useVendorEarnings();
  const { data: bankAccounts } = useBankAccounts();
  const { data: momoAccounts } = useMomoAccounts();
  const withdrawMutation = useWithdraw();

  const [payoutType, setPayoutType] = useState<PayoutType>('bank');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const available = earnings?.availableBalance ?? 0;
  const accounts = payoutType === 'bank' ? bankAccounts : momoAccounts;
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);

  const handleWithdraw = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (numericAmount <= 0) return ToastEmitter.error('Enter a valid amount');
    if (numericAmount > available) return ToastEmitter.error('Insufficient balance');
    if (!selectedAccountId) return ToastEmitter.error('Select a payout method');

    withdrawMutation.mutate(
      { amount: numericAmount, destination: payoutType },
      {
        onSuccess: () => {
          ToastEmitter.success('Withdrawal request submitted');
          navigation.goBack();
        },
        onError: () => ToastEmitter.error('Withdrawal failed. Please try again.'),
      },
    );
  }, [numericAmount, available, selectedAccountId, payoutType, withdrawMutation, navigation]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Earnings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {/* ── Available Balance ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available for withdrawal</Text>
          <Text style={styles.balanceValue}>{formatCurrency(available)}</Text>
        </View>

        {/* ── Payout Type Selector ── */}
        <Text style={styles.sectionLabel}>Withdraw To</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, payoutType === 'bank' && styles.typeCardActive]}
            onPress={() => { setPayoutType('bank'); setSelectedAccountId(null); }}
            accessibilityRole="radio"
            accessibilityLabel="Bank account"
            accessibilityState={{ selected: payoutType === 'bank' }}
          >
            <Ionicons name="business-outline" size={22} color={payoutType === 'bank' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeLabel, payoutType === 'bank' && styles.typeLabelActive]}>Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeCard, payoutType === 'momo' && styles.typeCardActive]}
            onPress={() => { setPayoutType('momo'); setSelectedAccountId(null); }}
            accessibilityRole="radio"
            accessibilityLabel="Mobile money"
            accessibilityState={{ selected: payoutType === 'momo' }}
          >
            <Ionicons name="phone-portrait-outline" size={22} color={payoutType === 'momo' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeLabel, payoutType === 'momo' && styles.typeLabelActive]}>Mobile Money</Text>
          </TouchableOpacity>
        </View>

        {/* ── Account List ── */}
        {accounts && accounts.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Select Account</Text>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accountRow, selectedAccountId === acc.id && styles.accountRowActive]}
                onPress={() => setSelectedAccountId(acc.id)}
                accessibilityRole="radio"
                accessibilityLabel={acc.accountName}
                accessibilityState={{ selected: selectedAccountId === acc.id }}
              >
                <View style={[styles.accountIcon, { backgroundColor: selectedAccountId === acc.id ? colors.primarySoft : colors.surface }]}>
                  <Ionicons
                    name={payoutType === 'bank' ? 'business-outline' : 'phone-portrait-outline'}
                    size={18}
                    color={selectedAccountId === acc.id ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{acc.accountName}</Text>
                  <Text style={styles.accountDetail}>
                    {'bankName' in acc ? `${acc.bankName} · ${acc.accountNumber}` : acc.phoneNumber}
                  </Text>
                </View>
                {acc.isDefault && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.noAccounts}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.textLight} />
            <Text style={styles.noAccountsText}>
              No {payoutType === 'bank' ? 'bank' : 'MoMo'} accounts found. Add one in Payout Methods.
            </Text>
          </View>
        )}

        {/* ── Amount ── */}
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountRow}>
          {[100, 500, 1000, 2000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.amountChip, numericAmount === val && styles.amountChipActive]}
              onPress={() => setAmount(String(val))}
              accessibilityRole="button"
              accessibilityLabel={`GH₵ ${val}`}
            >
              <Text style={[styles.amountChipText, numericAmount === val && styles.amountChipTextActive]}>
                GH₵ {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          title="Submit Withdrawal"
          onPress={handleWithdraw}
          loading={withdrawMutation.isPending}
          disabled={numericAmount <= 0 || !selectedAccountId || numericAmount > available}
          variant="default"
          size="lg"
          fullWidth
          style={{ borderRadius: radii.xl, marginTop: 24 }}
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
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.borderLight },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  typeLabel: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  typeLabelActive: { color: colors.primary },
  accountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, gap: 12, borderWidth: 1.5, borderColor: colors.borderLight },
  accountRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  accountIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  accountInfo: { flex: 1, gap: 2 },
  accountName: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  accountDetail: { ...typePresets.caption, color: colors.textSecondary },
  defaultBadge: { backgroundColor: colors.primarySoft, borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2, ...typePresets.caption, fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 10 },
  noAccounts: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: colors.warningSoft, borderRadius: radii.lg },
  noAccountsText: { ...typePresets.bodySm, color: colors.textSecondary, flex: 1 },
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.borderLight },
  amountChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amountChipText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  amountChipTextActive: { color: colors.white },
  amountInput: { backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontFamily: fonts.heading, color: colors.text },
});
