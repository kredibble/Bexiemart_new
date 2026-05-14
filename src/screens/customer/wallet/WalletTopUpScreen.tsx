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

import { useTopUpPaystack, useTopUpMomo, useWallet } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

const TOP_AMOUNTS = [20, 50, 100, 200, 500];
type PaymentMethod = 'paystack' | 'momo';

export default function WalletTopUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: wallet } = useWallet();
  const topUpPaystack = useTopUpPaystack();
  const topUpMomo = useTopUpMomo();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('paystack');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airteltigo' | 'telecel' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const isPending = topUpPaystack.isPending || topUpMomo.isPending;

  const handleTopUp = () => {
    if (numericAmount <= 0) {
      ToastEmitter.error('Invalid Amount', 'Enter a valid top-up amount.');
      return;
    }

    if (method === 'momo') {
      if (!momoProvider || !phoneNumber.trim()) {
        ToastEmitter.error('Missing Details', 'Select provider and enter phone number.');
        return;
      }
      topUpMomo.mutate(
        { amount: numericAmount, provider: momoProvider, phoneNumber: phoneNumber.trim() },
        {
          onSuccess: (data) => {
            ToastEmitter.success(`Top-up initiated via MoMo. Ref: ${data.reference}`);
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Top-up failed. Please try again.'),
        },
      );
    } else {
      topUpPaystack.mutate(
        { amount: numericAmount },
        {
          onSuccess: (data) => {
            ToastEmitter.success('Redirecting to Paystack...');
            // In a real app, open Paystack WebView with data.authorizationUrl
            navigation.goBack();
          },
          onError: () => ToastEmitter.error('Failed to initialize payment.'),
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
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {wallet && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(wallet.balance)}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountRow}>
          {TOP_AMOUNTS.map((val) => (
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

        <View style={styles.customAmountRow}>
          <Text style={styles.currencyPrefix}>GH₵</Text>
          <TextInput
            style={styles.customInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
            accessibilityLabel="Custom amount"
          />
        </View>

        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodCard, method === 'paystack' && styles.methodCardActive]}
            onPress={() => setMethod('paystack')}
            accessibilityRole="radio"
            accessibilityLabel="Paystack (Card)"
            accessibilityState={{ selected: method === 'paystack' }}
          >
            <Ionicons name="card-outline" size={24} color={method === 'paystack' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.methodLabel, method === 'paystack' && styles.methodLabelActive]}>Card</Text>
            <Text style={styles.methodDesc}>Paystack</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, method === 'momo' && styles.methodCardActive]}
            onPress={() => setMethod('momo')}
            accessibilityRole="radio"
            accessibilityLabel="Mobile Money"
            accessibilityState={{ selected: method === 'momo' }}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={method === 'momo' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.methodLabel, method === 'momo' && styles.methodLabelActive]}>Mobile Money</Text>
            <Text style={styles.methodDesc}>MTN / AirtelTigo / Telecel</Text>
          </TouchableOpacity>
        </View>

        {method === 'momo' && (
          <>
            <Text style={styles.sectionLabel}>Provider</Text>
            <View style={styles.providerRow}>
              {(['mtn', 'airteltigo', 'telecel'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.providerChip, momoProvider === p && styles.providerChipActive]}
                  onPress={() => setMomoProvider(p)}
                  accessibilityRole="radio"
                  accessibilityLabel={p}
                  accessibilityState={{ selected: momoProvider === p }}
                >
                  <Text style={[styles.providerChipText, momoProvider === p && styles.providerChipTextActive]}>
                    {p === 'mtn' ? 'MTN' : p === 'airteltigo' ? 'AirtelTigo' : 'Telecel'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="e.g. 0555123456"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              accessibilityLabel="Mobile money phone number"
            />
          </>
        )}

        <View style={styles.feeNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textLight} />
          <Text style={styles.feeText}>Transaction fee: 1% for MoMo, free for card payments</Text>
        </View>

        <Button
          title={`Top Up ${numericAmount > 0 ? formatCurrency(numericAmount) : ''}`.trim()}
          onPress={handleTopUp}
          loading={isPending}
          disabled={numericAmount <= 0 || (method === 'momo' && (!momoProvider || !phoneNumber.trim()))}
          variant="default"
          size="lg"
          fullWidth
          style={{ borderRadius: radii.xl, marginTop: 8 }}
          accessibilityLabel="Confirm top up"
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
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.borderLight },
  amountChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amountChipText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  amountChipTextActive: { color: colors.white },
  customAmountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16 },
  currencyPrefix: { ...typePresets.h3, fontFamily: fonts.headingSemi, color: colors.textSecondary, marginRight: 8 },
  customInput: { flex: 1, paddingVertical: 16, fontSize: 20, fontFamily: fonts.heading, color: colors.text },
  methodRow: { flexDirection: 'row', gap: 12 },
  methodCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.borderLight },
  methodCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  methodLabel: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  methodLabelActive: { color: colors.primary },
  methodDesc: { ...typePresets.caption, color: colors.textSecondary, textAlign: 'center' },
  providerRow: { flexDirection: 'row', gap: 10 },
  providerChip: { flex: 1, paddingVertical: 12, borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center' },
  providerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  providerChipText: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text },
  providerChipTextActive: { color: colors.white },
  phoneInput: { backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: fonts.body, color: colors.text },
  feeNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feeText: { ...typePresets.caption, color: colors.textLight, flex: 1 },
});
