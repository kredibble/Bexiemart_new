import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, StretchInY } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useVendorEarnings, useWithdraw, useVendorDashboardAnalytics } from '@/hooks/useVendor';
import { useWallet, useTransactions } from '@/hooks/useWallet';
import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import type { EarningsTransaction, PayoutMethod } from '@/types';
import type { WalletTransaction } from '@/api/wallet';

// ── Constants ────────────────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  mtn: { bg: '#FFCC00', text: '#000000' },
  airteltigo: { bg: '#ED1C24', text: '#FFFFFF' },
  telecel: { bg: '#003366', text: '#FFFFFF' },
  ghanapay: { bg: '#00A94F', text: '#FFFFFF' },
};

const FILTERS = ['All', 'Sales', 'Withdrawals', 'Top-ups'] as const;

const SAMPLE_PAYOUTS: PayoutMethod[] = [
  { id: 'p1', type: 'bank', accountName: 'Jerry Doe', accountNumber: '****1234', bankName: 'GCB Bank', isDefault: true },
  { id: 'p2', type: 'momo', provider: 'mtn', accountName: 'Jerry Doe', accountNumber: '****5678', isDefault: false },
  { id: 'p3', type: 'momo', provider: 'airteltigo', accountName: 'Jerry Doe', accountNumber: '****9012', isDefault: false },
];

// ── Types ────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  date: string;
  type: 'sale' | 'withdrawal' | 'refund' | 'topup' | 'payment';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeActivity(
  earningsTxs?: EarningsTransaction[],
  walletTxs?: WalletTransaction[],
): ActivityItem[] {
  const items: ActivityItem[] = [];
  (earningsTxs ?? []).forEach((tx) => {
    items.push({
      id: `e-${tx.id}`,
      date: tx.createdAt,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      status: tx.status,
    });
  });
  (walletTxs ?? []).forEach((tx) => {
    const normType = tx.type === 'payment' ? 'sale' : tx.type;
    items.push({
      id: `w-${tx.id}`,
      date: tx.createdAt,
      type: normType as ActivityItem['type'],
      amount: tx.amount,
      description: tx.description,
      status: tx.status,
    });
  });
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function filterActivity(items: ActivityItem[], filter: string): ActivityItem[] {
  switch (filter) {
    case 'Sales':
      return items.filter((i) => i.type === 'sale' || i.type === 'payment');
    case 'Withdrawals':
      return items.filter((i) => i.type === 'withdrawal');
    case 'Top-ups':
      return items.filter((i) => i.type === 'topup');
    default:
      return items;
  }
}

// ── Component ────────────────────────────────────────────────────────────

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();

  /* ── Data Hooks ────────────────────────────────────────────────────── */
  const { data: earnings, isLoading, isError, error, refetch, isRefetching } = useVendorEarnings();
  const { data: wallet } = useWallet();
  const { data: walletTransactions } = useTransactions();
  const { data: analytics } = useVendorDashboardAnalytics();
  const withdrawMutation = useWithdraw();

  /* ── Local State ───────────────────────────────────────────────────── */
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showPayoutSheet, setShowPayoutSheet] = useState(false);
  const [payoutStep, setPayoutStep] = useState(1);
  const [payoutType, setPayoutType] = useState<'bank' | 'momo' | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    provider: '',
  });
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(SAMPLE_PAYOUTS);
  const [selectedMethodId, setSelectedMethodId] = useState(SAMPLE_PAYOUTS[0]?.id ?? '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  /* ── Derived Data ──────────────────────────────────────────────────── */
  const available = earnings?.availableBalance ?? 0;
  const selectedMethod = payoutMethods.find((m) => m.id === selectedMethodId) ?? payoutMethods[0];

  const activityItems = useMemo(
    () => normalizeActivity(earnings?.transactions, walletTransactions?.data ?? []),
    [earnings?.transactions, walletTransactions],
  );
  const filteredItems = useMemo(() => filterActivity(activityItems, selectedFilter), [activityItems, selectedFilter]);

  /* ── Count-up Animation ────────────────────────────────────────────── */
  useEffect(() => {
    setAnimatedBalance(0);
    const endValue = available;
    if (endValue <= 0) return;
    const duration = 1000;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedBalance(eased * endValue);
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [available]);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    refetch();
  }, [refetch]);

  const handleWithdraw = useCallback(() => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      ToastEmitter.warning('Invalid Amount', 'Enter a valid withdrawal amount.');
      return;
    }
    if (amount > available) {
      ToastEmitter.warning(
        'Insufficient Balance',
        `You only have ${formatCurrency(available)} available.`,
      );
      return;
    }
    if (!selectedMethod) {
      ToastEmitter.warning('No Method', 'Add a payout method first.');
      return;
    }
    withdrawMutation.mutate(
      { amount, destination: selectedMethod.type },
      {
        onSuccess: () => {
          ToastEmitter.success('Withdrawal request submitted');
          setWithdrawAmount('');
        },
        onError: () => {
          ToastEmitter.error('Failed to process withdrawal');
        },
      },
    );
  }, [withdrawAmount, available, selectedMethod, withdrawMutation]);

  const handleOpenPayoutSheet = useCallback(() => {
    setPayoutStep(1);
    setPayoutType(null);
    setPayoutForm({ accountName: '', accountNumber: '', bankName: '', provider: '' });
    setShowPayoutSheet(true);
  }, []);

  const handleClosePayoutSheet = useCallback(() => {
    setShowPayoutSheet(false);
  }, []);

  const handleSavePayout = useCallback(() => {
    if (!payoutType) return;
    if (!payoutForm.accountName || !payoutForm.accountNumber) {
      ToastEmitter.warning('Missing fields', 'Fill in all required fields.');
      return;
    }
    if (payoutType === 'momo' && !payoutForm.provider) {
      ToastEmitter.warning('Select Provider', 'Choose a mobile money provider.');
      return;
    }
    const newMethod: PayoutMethod = {
      id: `p${Date.now()}`,
      type: payoutType,
      accountName: payoutForm.accountName,
      accountNumber: payoutForm.accountNumber,
      bankName: payoutType === 'bank' ? payoutForm.bankName : undefined,
      provider: payoutType === 'momo' ? (payoutForm.provider as PayoutMethod['provider']) : undefined,
      isDefault: payoutMethods.length === 0,
    };
    setPayoutMethods((prev) => [...prev, newMethod]);
    setSelectedMethodId(newMethod.id);
    setShowPayoutSheet(false);
    setPayoutStep(1);
    setPayoutType(null);
    setPayoutForm({ accountName: '', accountNumber: '', bankName: '', provider: '' });
    ToastEmitter.success('Payout method saved');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [payoutType, payoutForm, payoutMethods.length]);

  const hapticLight = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
  }, []);

  /* ── Render: Error ─────────────────────────────────────────────────── */

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.header}>
          <Animated.Text entering={FadeInDown.springify()} style={styles.headerTitle}>
            Earnings
          </Animated.Text>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load earnings'}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading earnings"
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Render: Main ──────────────────────────────────────────────────── */

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.header}>
        <Animated.Text entering={FadeInDown.springify()} style={styles.headerTitle}>
          Earnings
        </Animated.Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          /* ── Skeleton Loading ──────────────────────────────────────── */
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonHero}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Skeleton width="45%" height={16} borderRadius={radii.sm} />
                <Skeleton width={90} height={32} borderRadius={radii.full} />
              </View>
              <Skeleton width="55%" height={36} borderRadius={radii.sm} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <Skeleton width="70%" height={10} />
                    <Skeleton width="60%" height={14} />
                  </View>
                ))}
              </View>
            </View>
            <View style={{ marginTop: 24 }}>
              <Skeleton width="30%" height={18} />
              <View style={{ gap: 12, marginTop: 16 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* ═══ 1. Hero Balance ═══ */}
            <Animated.View entering={StretchInY.delay(100).springify()} style={styles.balanceCardOuter}>
              <View style={styles.balanceAccent} />
              <View style={styles.balanceCard}>
                {/* Top row: badge + withdraw button */}
                <View style={styles.balanceTopRow}>
                  <View style={styles.balanceBadge}>
                    <Ionicons name="wallet-outline" size={14} color={colors.primary} />
                    <Text style={styles.balanceBadgeText}>Available Balance</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.withdrawBtn, available <= 0 && { opacity: 0.4 }]}
                    onPress={() => {}}
                    disabled={available <= 0}
                    accessibilityRole="button"
                    accessibilityLabel="Withdraw funds"
                  >
                    <Ionicons name="arrow-down-circle" size={16} color={colors.primary} />
                    <Text style={styles.withdrawBtnText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>

                {/* Animated balance amount */}
                <Text style={styles.balanceValue}>
                  {formatCurrency(animatedBalance)}
                </Text>

                {/* Divider */}
                <View style={styles.balanceDivider} />

                {/* Mini stats */}
                <View style={styles.miniStatRow}>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Pending</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(earnings?.pendingEarnings ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.miniStatVLine} />
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Total Earned</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(earnings?.totalEarnings ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.miniStatVLine} />
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>This Month</Text>
                    <Text style={styles.miniStatValue}>
                      {formatCurrency(analytics?.revenue30Days ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* ═══ 2. Payout Methods ═══ */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payout Methods</Text>
                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    handleOpenPayoutSheet();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Add payout method"
                >
                  <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.payoutScrollContent}
              >
                {payoutMethods.map((method) => {
                  const isSelected = method.id === selectedMethodId;
                  const providerColor = method.provider
                    ? PROVIDER_COLORS[method.provider]?.bg
                    : colors.primary;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.payoutChip, isSelected && styles.payoutChipSelected]}
                      onPress={() => {
                        setSelectedMethodId(method.id);
                        hapticLight();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${method.accountName} ${method.accountNumber}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={[styles.payoutChipIcon, { backgroundColor: providerColor }]}>
                        <Ionicons
                          name={method.provider ? 'phone-portrait-outline' : 'business-outline'}
                          size={14}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.payoutChipInfo}>
                        <Text style={styles.payoutChipName} numberOfLines={1}>
                          {method.accountName}
                        </Text>
                        <Text style={styles.payoutChipNumber}>{method.accountNumber}</Text>
                      </View>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ═══ 4. Quick Withdraw ═══ */}
            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.withdrawSection}>
              <Text style={styles.sectionTitle}>Quick Withdraw</Text>
              <View style={styles.withdrawCard}>
                <Text style={styles.withdrawLabel}>Amount</Text>
                <TextInput
                  style={styles.withdrawInput}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Withdrawal amount"
                />

                <Text style={[styles.withdrawLabel, { marginTop: 12 }]}>To</Text>
                <TouchableOpacity
                  style={styles.methodSelector}
                  onPress={() => {
                    setShowMethodPicker(!showMethodPicker);
                    hapticLight();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Selected: ${selectedMethod?.accountName} ${selectedMethod?.accountNumber}`}
                >
                  <View style={styles.methodSelectorLeft}>
                    <View
                      style={[
                        styles.payoutChipIcon,
                        {
                          backgroundColor: selectedMethod?.provider
                            ? PROVIDER_COLORS[selectedMethod.provider]?.bg
                            : colors.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name={selectedMethod?.provider ? 'phone-portrait-outline' : 'business-outline'}
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                    <View>
                      <Text style={styles.methodSelectorName}>
                        {selectedMethod?.accountName}
                      </Text>
                      <Text style={styles.methodSelectorNumber}>
                        {selectedMethod?.accountNumber}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={showMethodPicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {showMethodPicker && (
                  <View style={styles.methodPickerList}>
                    {payoutMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.methodPickerItem,
                          method.id === selectedMethodId && styles.methodPickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedMethodId(method.id);
                          setShowMethodPicker(false);
                          hapticLight();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${method.accountName} ${method.accountNumber}`}
                      >
                        <View
                          style={[
                            styles.payoutChipIcon,
                            {
                              backgroundColor: method.provider
                                ? PROVIDER_COLORS[method.provider]?.bg
                                : colors.primary,
                            },
                          ]}
                        >
                          <Ionicons
                            name={method.provider ? 'phone-portrait-outline' : 'business-outline'}
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.methodPickerName}>{method.accountName}</Text>
                          <Text style={styles.methodPickerDetail}>
                            {method.accountNumber}
                            {method.bankName ? ` · ${method.bankName}` : ''}
                          </Text>
                        </View>
                        {method.isDefault && (
                          <Text style={styles.methodPickerDefault}>Default</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Button
                  title="Withdraw Now"
                  variant="default"
                  size="lg"
                  fullWidth
                  style={{ borderRadius: radii.xl, marginTop: 16 }}
                  onPress={handleWithdraw}
                  loading={withdrawMutation.isPending}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !selectedMethod}
                  accessibilityLabel="Submit withdrawal request"
                />
              </View>
            </Animated.View>

            {/* ═══ 5. Activity ═══ */}
            <Animated.View entering={FadeInUp.delay(500).springify()} style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Activity</Text>

              <View style={styles.filterRow}>
                {FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedFilter(filter);
                      hapticLight();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${filter.toLowerCase()} activity`}
                    accessibilityState={{ selected: selectedFilter === filter }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filteredItems.length === 0 ? (
                <EmptyState icon="time-outline" title="No activity yet" />
              ) : (
                <View style={styles.activityList}>
                  {filteredItems.slice(0, 50).map((item, i) => {
                    const isPositive =
                      item.type === 'sale' || item.type === 'topup' || item.type === 'payment';
                    const icon =
                      item.type === 'withdrawal'
                        ? 'arrow-up-circle'
                        : isPositive
                          ? 'arrow-down-circle'
                          : 'refresh-circle';
                    const iconBg =
                      item.type === 'withdrawal'
                        ? colors.errorSoft
                        : isPositive
                          ? colors.successSoft
                          : colors.warningSoft;
                    const iconColor =
                      item.type === 'withdrawal'
                        ? colors.error
                        : isPositive
                          ? colors.success
                          : colors.warning;

                    return (
                      <Animated.View
                        key={item.id}
                        entering={FadeInUp.delay(600 + i * 60).springify()}
                        style={styles.activityRow}
                        accessible
                        accessibilityLabel={`${item.description}, ${item.type}, ${formatCurrency(item.amount)}`}
                      >
                        <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
                          <Ionicons name={icon} size={20} color={iconColor} />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityDescription} numberOfLines={1}>
                            {item.description}
                          </Text>
                          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
                        </View>
                        <View style={styles.activityRight}>
                          <Text
                            style={[
                              styles.activityAmount,
                              { color: isPositive ? colors.success : colors.error },
                            ]}
                          >
                            {isPositive ? '+' : '-'}
                            {formatCurrency(item.amount)}
                          </Text>
                          {item.status !== 'completed' && (
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    item.status === 'pending' ? colors.pending : colors.errorSoft,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  {
                                    color:
                                      item.status === 'pending'
                                        ? colors.pendingText
                                        : colors.error,
                                  },
                                ]}
                              >
                                {item.status}
                              </Text>
                            </View>
                          )}
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* ═══ Add Payout Method (BottomSheet) ═══ */}
      <BottomSheet
        visible={showPayoutSheet}
        onClose={handleClosePayoutSheet}
        height={480}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {payoutStep === 1 && (
            /* Step 1: Choose Type */
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Add Payout Method</Text>
              <TouchableOpacity
                style={[
                  styles.payoutTypeCard,
                  payoutType === 'bank' && styles.payoutTypeCardSelected,
                ]}
                onPress={() => {
                  setPayoutType('bank');
                  hapticLight();
                }}
                accessibilityRole="radio"
                accessibilityLabel="Bank Account"
                accessibilityState={{ selected: payoutType === 'bank' }}
              >
                <View style={styles.payoutTypeIcon}>
                  <Ionicons name="business-outline" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutTypeTitle}>Bank Account</Text>
                  <Text style={styles.payoutTypeDesc}>Withdraw to your bank account</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    payoutType === 'bank' && styles.radioOuterSelected,
                  ]}
                >
                  {payoutType === 'bank' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payoutTypeCard,
                  payoutType === 'momo' && styles.payoutTypeCardSelected,
                ]}
                onPress={() => {
                  setPayoutType('momo');
                  hapticLight();
                }}
                accessibilityRole="radio"
                accessibilityLabel="Mobile Money"
                accessibilityState={{ selected: payoutType === 'momo' }}
              >
                <View style={styles.payoutTypeIcon}>
                  <Ionicons name="phone-portrait-outline" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutTypeTitle}>Mobile Money</Text>
                  <Text style={styles.payoutTypeDesc}>Withdraw to your mobile wallet</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    payoutType === 'momo' && styles.radioOuterSelected,
                  ]}
                >
                  {payoutType === 'momo' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
              <View style={styles.sheetActions}>
                <Button
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={handleClosePayoutSheet}
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </Button>
                <Button
                  variant="default"
                  style={{ flex: 1, borderRadius: radii.lg }}
                  disabled={!payoutType}
                  onPress={() => {
                    setPayoutStep(2);
                    hapticLight();
                  }}
                  accessibilityLabel="Continue to details"
                >
                  <Text style={styles.sheetNextText}>Continue</Text>
                </Button>
              </View>
            </View>
          )}

          {payoutStep === 2 && payoutType && (
            /* Step 2: Fill Details */
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>
                {payoutType === 'bank' ? 'Bank Account Details' : 'Mobile Money Details'}
              </Text>

              <Text style={styles.formLabel}>Account Name</Text>
              <TextInput
                style={styles.formInput}
                value={payoutForm.accountName}
                onChangeText={(t) => setPayoutForm((p) => ({ ...p, accountName: t }))}
                placeholder="Full name on account"
                placeholderTextColor={colors.textLight}
                accessibilityLabel="Account name"
              />

              <Text style={styles.formLabel}>Account Number</Text>
              <TextInput
                style={styles.formInput}
                value={payoutForm.accountNumber}
                onChangeText={(t) => setPayoutForm((p) => ({ ...p, accountNumber: t }))}
                placeholder={
                  payoutType === 'bank' ? 'Account number' : 'Mobile money number'
                }
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                accessibilityLabel="Account number"
              />

              {payoutType === 'bank' ? (
                <>
                  <Text style={styles.formLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={payoutForm.bankName}
                    onChangeText={(t) => setPayoutForm((p) => ({ ...p, bankName: t }))}
                    placeholder="e.g. GCB Bank"
                    placeholderTextColor={colors.textLight}
                    accessibilityLabel="Bank name"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.formLabel}>Provider</Text>
                  <View style={styles.providerRow}>
                    {Object.entries(PROVIDER_COLORS).map(([key, val]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.providerChip,
                          { borderColor: val.bg },
                          payoutForm.provider === key && {
                            backgroundColor: val.bg,
                          },
                        ]}
                        onPress={() => {
                          setPayoutForm((p) => ({ ...p, provider: key }));
                          hapticLight();
                        }}
                        accessibilityRole="radio"
                        accessibilityLabel={key.charAt(0).toUpperCase() + key.slice(1)}
                        accessibilityState={{ selected: payoutForm.provider === key }}
                      >
                        <Text
                          style={[
                            styles.providerChipText,
                            { color: val.text },
                            payoutForm.provider !== key && { color: colors.text },
                          ]}
                        >
                          {key === 'mtn'
                            ? 'MTN'
                            : key === 'airteltigo'
                              ? 'AirtelTigo'
                              : key === 'telecel'
                                ? 'Telecel'
                                : 'Ghanapay'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.sheetActions}>
                <Button
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setPayoutStep(1);
                    hapticLight();
                  }}
                  accessibilityLabel="Go back"
                >
                  <Text style={styles.sheetCancelText}>Back</Text>
                </Button>
                <Button
                  variant="default"
                  style={{ flex: 1, borderRadius: radii.lg }}
                  disabled={!payoutForm.accountName || !payoutForm.accountNumber}
                  onPress={() => {
                    setPayoutStep(3);
                    hapticLight();
                  }}
                  accessibilityLabel="Review details"
                >
                  <Text style={styles.sheetNextText}>Review</Text>
                </Button>
              </View>
            </View>
          )}

          {payoutStep === 3 && payoutType && (
            /* Step 3: Confirm */
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Confirm Details</Text>

              <View style={styles.confirmCard}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Type</Text>
                  <Text style={styles.confirmValue}>
                    {payoutType === 'bank' ? 'Bank Account' : 'Mobile Money'}
                  </Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Account Name</Text>
                  <Text style={styles.confirmValue}>{payoutForm.accountName}</Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Account Number</Text>
                  <Text style={styles.confirmValue}>{payoutForm.accountNumber}</Text>
                </View>
                {payoutType === 'bank' && payoutForm.bankName ? (
                  <>
                    <View style={styles.confirmDivider} />
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Bank</Text>
                      <Text style={styles.confirmValue}>{payoutForm.bankName}</Text>
                    </View>
                  </>
                ) : null}
                {payoutType === 'momo' && payoutForm.provider ? (
                  <>
                    <View style={styles.confirmDivider} />
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Provider</Text>
                      <Text style={styles.confirmValue}>
                        {payoutForm.provider === 'mtn'
                          ? 'MTN'
                          : payoutForm.provider === 'airteltigo'
                            ? 'AirtelTigo'
                            : payoutForm.provider === 'telecel'
                              ? 'Telecel'
                              : 'Ghanapay'}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>

              <View style={styles.sheetActions}>
                <Button
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setPayoutStep(2);
                    hapticLight();
                  }}
                  accessibilityLabel="Go back and edit"
                >
                  <Text style={styles.sheetCancelText}>Edit</Text>
                </Button>
                <Button
                  variant="default"
                  style={{ flex: 1, borderRadius: radii.lg }}
                  onPress={handleSavePayout}
                  accessibilityLabel="Save payout method"
                >
                  <Text style={styles.sheetNextText}>Save</Text>
                </Button>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </BottomSheet>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // ── Header ───────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: fonts.heading,
    color: colors.text,
  },

  // ── Scroll ───────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ── Hero Balance ───────────────────────────────────────────────────
  balanceCardOuter: {
    borderRadius: radii.xl,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  balanceAccent: {
    height: 4,
    backgroundColor: colors.primary,
  },
  balanceCard: {
    padding: 24,
    gap: 0,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  balanceBadgeText: {
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  withdrawBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  balanceValue: {
    ...typePresets.stat,
    fontFamily: fonts.heading,
    color: colors.text,
    fontSize: 38,
    letterSpacing: -1,
    marginTop: 20,
    marginBottom: 0,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 20,
  },
  miniStatRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  miniStatVLine: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  miniStatLabel: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  miniStatValue: {
    ...typePresets.priceSm,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 14,
  },

  // ── Section Header ───────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typePresets.h4,
    fontFamily: fonts.headingSemi,
    color: colors.text,
  },

  // ── Payout Methods ───────────────────────────────────────────────────
  payoutScrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  payoutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    minWidth: 180,
  },
  payoutChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  payoutChipIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutChipInfo: {
    flex: 1,
  },
  payoutChipName: {
    ...typePresets.bodySm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
  },
  payoutChipNumber: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    ...typePresets.caption,
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: 10,
  },

  // ── Quick Withdraw ───────────────────────────────────────────────────
  withdrawSection: {
    marginTop: 4,
  },
  withdrawCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    ...shadows.md,
  },
  withdrawLabel: {
    ...typePresets.labelSm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
    marginBottom: 6,
  },
  withdrawInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  methodSelectorName: {
    ...typePresets.bodySm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
  },
  methodSelectorNumber: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  methodPickerList: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  methodPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  methodPickerItemSelected: {
    backgroundColor: colors.primarySoft,
  },
  methodPickerName: {
    ...typePresets.bodySm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
  },
  methodPickerDetail: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  methodPickerDefault: {
    ...typePresets.caption,
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: 10,
  },

  // ── Activity ─────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typePresets.caption,
    fontFamily: fonts.bodySemi,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  activityList: {
    gap: 10,
    paddingBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    ...typePresets.bodySm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
  },
  activityDate: {
    ...typePresets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityAmount: {
    ...typePresets.priceSm,
    fontFamily: fonts.bodyBold,
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemi,
    textTransform: 'capitalize',
  },

  // ── Bottom Sheet (Add Payout) ────────────────────────────────────────
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    gap: 14,
  },
  sheetTitle: {
    ...typePresets.h3,
    fontFamily: fonts.headingSemi,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  payoutTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  payoutTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  payoutTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutTypeTitle: {
    ...typePresets.body,
    fontFamily: fonts.bodySemi,
    color: colors.text,
  },
  payoutTypeDesc: {
    ...typePresets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sheetCancelText: {
    fontFamily: fonts.bodyBold,
    color: colors.textSecondary,
    fontSize: 14,
  },
  sheetNextText: {
    fontFamily: fonts.bodyBold,
    color: colors.white,
    fontSize: 14,
  },

  // ── Form Fields ──────────────────────────────────────────────────────
  formLabel: {
    ...typePresets.labelSm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  providerChipText: {
    fontSize: 12,
    fontFamily: fonts.bodySemi,
  },

  // ── Confirm Card ─────────────────────────────────────────────────────
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    gap: 0,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmLabel: {
    ...typePresets.caption,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  confirmValue: {
    ...typePresets.bodySm,
    fontFamily: fonts.bodySemi,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // ── Error ────────────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    ...typePresets.h4,
    fontFamily: fonts.headingSemi,
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  retryBtnText: {
    fontFamily: fonts.bodyBold,
    color: colors.white,
    fontSize: 14,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────
  skeletonContainer: {
    gap: 16,
  },
  skeletonHero: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 24,
    gap: 8,
    ...shadows.md,
  },
});
