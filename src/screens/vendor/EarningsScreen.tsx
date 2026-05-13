/**
 * EarningsScreen — Vendor earnings overview with withdrawal.
 *
 * Features:
 *  - Available balance, total earnings, withdrawn cards
 *  - Earnings history list
 *  - Withdraw modal (bank / mobile money)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useVendorEarnings, useWithdraw } from '@/hooks/useVendor';
import { useWalletTransactions } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FormInput } from '@/components/ui/FormInput';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { data: earnings, isLoading, isError, error, refetch, isRefetching } = useVendorEarnings();
  const { refetch: refetchWallet } = useWalletTransactions();
  const withdrawMutation = useWithdraw();

  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'momo'>('bank');

  const available = earnings?.availableBalance ?? 0;

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Enter a valid withdrawal amount.');
      return;
    }
    if (amount > available) {
      Alert.alert('Insufficient Balance', `You only have ${formatCurrency(available)} available.`);
      return;
    }
    withdrawMutation.mutate(
      { amount, destination: withdrawMethod },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Withdrawal request submitted');
          setModalVisible(false);
          setWithdrawAmount('');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to process withdrawal');
        },
      }
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      {isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load earnings'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry loading earnings">
            <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchWallet(); }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Balance Cards */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Available Balance (Hero) */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>{formatCurrency(available)}</Text>
              <Button
                title="Withdraw"
                variant="default"
                size="sm"
                style={{ borderRadius: radii.full, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.2)' }}
                onPress={() => setModalVisible(true)}
                disabled={available <= 0}
                accessibilityLabel="Withdraw funds"
              >
                <Ionicons name="arrow-down-circle" size={18} color={colors.white} />
              </Button>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}>
                  <Ionicons name="trending-up" size={20} color={colors.success} />
                </View>
                <Text style={styles.summaryLabel}>Total Earnings</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(earnings?.totalEarnings ?? 0)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="checkmark-done" size={20} color={colors.primary} />
                </View>
                <Text style={styles.summaryLabel}>Withdrawn</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(earnings?.totalWithdrawn ?? 0)}
                </Text>
              </View>
            </View>

            {/* Earnings History */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {earnings?.transactions?.length === 0 ? (
              <EmptyState icon="time-outline" title="No earnings activity yet" />
            ) : (
              <View style={styles.historyList}>
                {(earnings?.transactions ?? []).map((item, i) => (
                  <View key={i} style={styles.historyRow} accessible accessibilityLabel={`${item.type === 'withdrawal' ? 'Withdrawal' : 'Order Payment'} of ${formatCurrency(item.amount)} on ${formatDate(item.createdAt)}`}>
                    <View style={[styles.historyIcon, { backgroundColor: item.type === 'withdrawal' ? colors.errorSoft : colors.successSoft }]}>
                      <Ionicons
                        name={item.type === 'withdrawal' ? 'arrow-up-circle' : 'arrow-down-circle'}
                        size={20}
                        color={item.type === 'withdrawal' ? colors.error : colors.success}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyType}>
                        {item.type === 'withdrawal' ? 'Withdrawal' : 'Order Payment'}
                      </Text>
                      <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text
                      style={[
                        styles.historyAmount,
                        { color: item.type === 'withdrawal' ? colors.error : colors.success },
                      ]}
                    >
                      {item.type === 'withdrawal' ? '-' : '+'}{formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      )}

      {!isError && (
      /* Withdraw Modal */
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>

            {/* Amount */}
            <FormInput
              label="Amount"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            {/* Method */}
            <Text style={styles.label}>Withdraw To</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  withdrawMethod === 'bank' && styles.methodBtnSelected,
                ]}
                onPress={() => setWithdrawMethod('bank')}
                accessibilityRole="radio"
                accessibilityLabel="Bank Account"
                accessibilityState={{ selected: withdrawMethod === 'bank' }}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={withdrawMethod === 'bank' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.methodText,
                    withdrawMethod === 'bank' && styles.methodTextSelected,
                  ]}
                >
                  Bank Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  withdrawMethod === 'momo' && styles.methodBtnSelected,
                ]}
                onPress={() => setWithdrawMethod('momo')}
                accessibilityRole="radio"
                accessibilityLabel="Mobile Money"
                accessibilityState={{ selected: withdrawMethod === 'momo' }}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={withdrawMethod === 'momo' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.methodText,
                    withdrawMethod === 'momo' && styles.methodTextSelected,
                  ]}
                >
                  Mobile Money
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                variant="secondary"
                style={{ flex: 1, borderRadius: radii.lg }}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Cancel withdrawal"
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.textSecondary }}>Cancel</Text>
              </Button>
              <Button
                variant="default"
                style={{ flex: 1, borderRadius: radii.lg }}
                onPress={handleWithdraw}
                loading={withdrawMutation.isPending}
                accessibilityLabel="Confirm withdrawal"
              >
                <Text style={{ fontFamily: 'NunitoSans_700Bold', color: colors.white }}>Confirm</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      )}
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    ...shadows.md,
    marginBottom: 16,
  },
  balanceLabel: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    ...typePresets.price,
    fontFamily: 'Rubik_700Bold',
    color: colors.white,
    fontSize: 36,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    ...shadows.sm,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  sectionTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    marginBottom: 14,
  },
  historyList: {
    gap: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
  },
  historyDate: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  historyAmount: {
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    gap: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    ...typePresets.h3,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  methodText: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textSecondary,
  },
  methodTextSelected: {
    color: colors.primary,
    fontFamily: 'NunitoSans_700Bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.text,
    marginBottom: 6,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
});
