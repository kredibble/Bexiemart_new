import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';

export default function WalletTransferScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const balance = 250.00;

  const handleNext = () => {
    if (!recipientEmail.trim()) return Alert.alert('Error', 'Enter recipient email');
    if (!amount || parseFloat(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (parseFloat(amount) > balance) return Alert.alert('Error', 'Insufficient balance');
    setStep('confirm');
  };

  const handleConfirm = () => {
    Alert.alert('Transfer Initiated', `GH₵${parseFloat(amount).toFixed(2)} sent to ${recipientEmail}`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

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
            <Text style={styles.confirmAmount}>{formatCurrency(parseFloat(amount))}</Text>
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
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Send GH₵{parseFloat(amount).toFixed(2)}</Text>
            </TouchableOpacity>
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
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        </View>

        <Text style={styles.inputLabel}>Recipient Email</Text>
        <TextInput style={styles.input} placeholder="user@example.com" placeholderTextColor={colors.textLighter} value={recipientEmail} onChangeText={setRecipientEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.inputLabel}>Amount (GH₵)</Text>
        <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.textLighter} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <Text style={styles.inputLabel}>Note (optional)</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="What's this for?" placeholderTextColor={colors.textLighter} value={note} onChangeText={setNote} multiline numberOfLines={3} />

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue</Text>
        </TouchableOpacity>
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
  inputLabel: { ...typePresets.label, color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  input: { ...typePresets.body, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 12, color: colors.text, backgroundColor: colors.white },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  nextBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
  confirmCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 24, alignItems: 'center', gap: 8, ...shadows.md },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentGreen, alignItems: 'center', justifyContent: 'center' },
  confirmAmount: { ...typePresets.display, fontFamily: 'Rubik_700Bold', color: colors.text, marginTop: 8 },
  confirmLabel: { ...typePresets.body, color: colors.textSecondary },
  divider: { width: '100%', height: 1, backgroundColor: colors.borderLight, marginVertical: 12 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 4 },
  confirmRowLabel: { ...typePresets.body, color: colors.textSecondary },
  confirmRowValue: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  confirmBtn: { backgroundColor: colors.accentGreen, borderRadius: radii.lg, paddingVertical: 16, paddingHorizontal: 32, marginTop: 16, width: '100%', alignItems: 'center' },
  confirmBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 16 },
});
