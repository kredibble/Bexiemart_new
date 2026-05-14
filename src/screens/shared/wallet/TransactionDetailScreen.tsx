import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors, shadows, radii } from '@/theme/colors';
import { fonts, typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { WalletTransaction } from '@/api/wallet';

const TRANSACTION_ICONS: Record<WalletTransaction['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  payment: { icon: 'cart-outline', color: colors.primary, label: 'Payment' },
  topup: { icon: 'add-circle-outline', color: colors.success, label: 'Top Up' },
  withdrawal: { icon: 'arrow-up-circle-outline', color: colors.error, label: 'Withdrawal' },
  refund: { icon: 'refresh-circle-outline', color: colors.warning, label: 'Refund' },
  transfer: { icon: 'send-outline', color: colors.info, label: 'Transfer' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed: { bg: colors.successSoft, text: colors.successDark },
  pending: { bg: colors.pending, text: colors.pendingText },
  failed: { bg: colors.errorSoft, text: colors.errorDark },
};

export default function TransactionDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { transaction: WalletTransaction } }, 'params'>>();
  const tx = route.params.transaction;

  const meta = TRANSACTION_ICONS[tx.type];
  const statusMeta = STATUS_COLORS[tx.status] ?? { bg: colors.surfaceDark, text: colors.textSecondary };
  const isCredit = tx.amount > 0;

  const details: { label: string; value: string }[] = [
    { label: 'Transaction ID', value: tx.id },
    { label: 'Reference', value: tx.reference },
    { label: 'Amount', value: `${isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)} ${tx.currency}` },
    { label: 'Fee', value: tx.fee > 0 ? `${tx.fee.toFixed(2)} ${tx.currency}` : 'Free' },
    { label: 'Net Amount', value: `${tx.netAmount.toFixed(2)} ${tx.currency}` },
    { label: 'Date', value: formatDate(tx.createdAt, 'long') },
    { label: 'Time', value: formatDate(tx.createdAt, 'time') },
    { label: 'Status', value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* ── Hero ── */}
        <Animated.View entering={FadeInDown.springify()} style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: `${meta.color}15` }]}>
            <Ionicons name={meta.icon} size={36} color={meta.color} />
          </View>
          <Text style={[styles.heroLabel, { color: meta.color }]}>{meta.label}</Text>
          <Text style={[styles.heroAmount, { color: isCredit ? colors.success : colors.error }]}>
            {isCredit ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
          </Text>
          <Text style={styles.heroDescription} numberOfLines={2}>{tx.description}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.text }]} />
            <Text style={[styles.statusText, { color: statusMeta.text }]}>
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </Text>
          </View>
        </Animated.View>

        {/* ── Details ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.detailsCard}>
          {details.map((d, i) => (
            <View key={d.label}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    d.label === 'Status' && { color: statusMeta.text, fontFamily: fonts.bodySemi },
                    d.label === 'Amount' && { fontFamily: fonts.headingSemi },
                  ]}
                  numberOfLines={1}
                >
                  {d.value}
                </Text>
              </View>
              {i < details.length - 1 && <View style={styles.detailDivider} />}
            </View>
          ))}
        </Animated.View>

        {/* ── Metadata ── */}
        {tx.metadata && Object.keys(tx.metadata as object).length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.detailsCard}>
            <Text style={styles.metaTitle}>Additional Information</Text>
            {Object.entries(tx.metadata ?? {}).map(([key, val], i) => (
              <View key={key}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>{String(val)}</Text>
                </View>
                {i < Object.keys(tx.metadata ?? {}).length - 1 && <View style={styles.detailDivider} />}
              </View>
            ))}
          </Animated.View>
        )}
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
  hero: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 24, alignItems: 'center', gap: 8, ...shadows.md },
  heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  heroLabel: { ...typePresets.labelSm, textTransform: 'uppercase', letterSpacing: 1 },
  heroAmount: { ...typePresets.display, fontFamily: 'Rubik_700Bold', letterSpacing: -0.5 },
  heroDescription: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typePresets.caption, fontFamily: fonts.bodySemi, textTransform: 'capitalize' },
  detailsCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 4, ...shadows.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  detailLabel: { ...typePresets.bodySm, color: colors.textSecondary },
  detailValue: { ...typePresets.bodySm, fontFamily: fonts.bodySemi, color: colors.text, maxWidth: '50%', textAlign: 'right' },
  detailDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },
  metaTitle: { ...typePresets.labelSm, color: colors.text, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
});
