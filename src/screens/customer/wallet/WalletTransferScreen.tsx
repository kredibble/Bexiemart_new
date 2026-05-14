import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useWallet, useTransfer } from '@/hooks/useWallet';
import { WalletPinInput } from '@/components/wallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';
import { ToastEmitter } from '@/utils/toastEmitter';
import { Button } from '@/components/ui/Button';

export default function WalletTransferScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: wallet } = useWallet();
  const transfer = useTransfer();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'pin'>('form');

  const numericAmount = parseFloat(amount) || 0;
  const isPending = transfer.isPending;

  const handleNext = () => {
    if (!recipientEmail.trim()) return ToastEmitter.error('Enter recipient email');
    if (numericAmount <= 0) return ToastEmitter.error('Enter a valid amount');
    if (wallet && numericAmount > wallet.balance) return ToastEmitter.error('Insufficient balance');
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('pin');
  };

  const handleSubmit = () => {
    if (pin.length < 6) {
      ToastEmitter.error('Enter your 6-digit PIN');
      return;
    }
    transfer.mutate(
      { amount: numericAmount, recipientId: recipientEmail.trim(), description: note || undefined, pin },
      {
        onSuccess: () => {
          ToastEmitter.success(`Sent ${formatCurrency(numericAmount)} to ${recipientEmail}`);
          navigation.goBack();
        },
        onError: () => ToastEmitter.error('Transfer failed. Please try again.'),
      },
    );
  };

  if (step === 'pin') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('confirm')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter PIN</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={[styles.content, { flex: 1, justifyContent: 'center', paddingBottom: 80 }]}>
          <View style={styles.pinPreview}>
            <Text style={styles.pinPreviewAmount}>{formatCurrency(numericAmount)}</Text>
            <Text style={styles.pinPreviewLabel}>to {recipientEmail}</Text>
          </View>
          <WalletPinInput
            value={pin}
            onChange={setPin}
            label="Enter your transaction PIN"
          />
          <Button
            title="Send"
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

  if (step === 'confirm') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Transfer</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons name="send" size={32} color={colors.white} />
            </View>
            <Text style={styles.confirmAmount}>{formatCurrency(numericAmount)}</Text>
            <Text style={styles.confirmLabel}>Amount to send</Text>
            <View style={styles.divider} />
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>To</Text>
              <Text style={styles.confirmRowValue}>{recipientEmail}</Text>
            </View>
            {note ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmRowLabel}>Note</Text>
                <Text style={styles.confirmRowValue}>{note}</Text>
              </View>
            ) : null}
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>Fee</Text>
              <Text style={styles.confirmRowValue}>Free</Text>
            </View>
            <Button
              title={`Send ${formatCurrency(numericAmount)}`}
              onPress={handleConfirm}
              variant="default"
              size="lg"
              fullWidth
              style={{ borderRadius: radii.lg, marginTop: 16 }}
            />
          </View>
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
        <Text style={styles.headerTitle}>Transfer</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {wallet && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(wallet.balance)}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>Recipient Email</Text>
        <TextInput
          style={styles.input}
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          placeholder="user@example.com"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Recipient email"
        />

        <Text style={styles.fieldLabel}>Amount (GH₵)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          accessibilityLabel="Transfer amount"
        />

        <Text style={styles.fieldLabel}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={note}
          onChangeText={setNote}
          placeholder="What's this for?"
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
          accessibilityLabel="Transfer note"
        />

        <Button
          title="Continue"
          onPress={handleNext}
          variant="default"
          size="lg"
          fullWidth
          style={{ borderRadius: radii.xl, marginTop: 24 }}
          accessibilityLabel="Continue to confirm transfer"
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
  content: { padding: 20, gap: 8 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radii.xl, padding: 24, alignItems: 'center', gap: 8, marginBottom: 16, ...shadows.lg },
  balanceLabel: { ...typePresets.body, color: colors.primarySoft },
  balanceValue: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.white },
  fieldLabel: { ...typePresets.labelSm, color: colors.text, marginTop: 8 },
  input: { backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: fonts.body, color: colors.text },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  confirmCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 24, alignItems: 'center', gap: 8, ...shadows.md },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentGreen, alignItems: 'center', justifyContent: 'center' },
  confirmAmount: { ...typePresets.display, fontFamily: 'Rubik_700Bold', color: colors.text, marginTop: 8 },
  confirmLabel: { ...typePresets.body, color: colors.textSecondary },
  divider: { width: '100%', height: 1, backgroundColor: colors.borderLight, marginVertical: 12 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 4 },
  confirmRowLabel: { ...typePresets.body, color: colors.textSecondary },
  confirmRowValue: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  pinPreview: { alignItems: 'center', marginBottom: 32, gap: 4 },
  pinPreviewAmount: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.text },
  pinPreviewLabel: { ...typePresets.body, color: colors.textSecondary },
});
