import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, ScrollView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useVendorCoupons, useCreateVendorCoupon, useUpdateVendorCoupon, useDeleteVendorCoupon } from '@/hooks/useVendorCoupons';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Coupon } from '@/types';

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const { data: coupons, isLoading, refetch } = useVendorCoupons();
  const createCoupon = useCreateVendorCoupon();
  const updateCoupon = useUpdateVendorCoupon();
  const deleteCoupon = useDeleteVendorCoupon();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');

  const onRefresh = React.useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openCreate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setEditing(null);
    setCode('');
    setDiscountPercent('');
    setMinOrderAmount('');
    setMaxUses('');
    setExpiresInDays('30');
    setModalVisible(true);
  };

  const openEdit = (coupon: Coupon) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setEditing(coupon);
    setCode(coupon.code);
    setDiscountPercent(String(coupon.discountPercent));
    setMinOrderAmount(String((coupon as any).minOrderAmount ?? 0));
    setMaxUses(String(coupon.maxUses));
    setExpiresInDays('');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (!code.trim()) return ToastEmitter.warning('Coupon code is required');
    const percent = parseFloat(discountPercent);
    if (isNaN(percent) || percent <= 0 || percent > 100) return ToastEmitter.warning('Discount must be between 1 and 100');

    const days = parseInt(expiresInDays, 10);
    if (!editing && (isNaN(days) || days < 1)) return ToastEmitter.warning('Expiry days must be at least 1');
    const expiryDate = editing ? new Date() : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const payload = {
      code: code.trim().toUpperCase(),
      discountPercent: percent,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxUses: parseInt(maxUses, 10) || 100,
      expiresAt: expiryDate.toISOString(),
    };

    if (editing) {
      updateCoupon.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { setModalVisible(false); },
        onError: () => ToastEmitter.error('Failed to update coupon'),
      });
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => { setModalVisible(false); },
        onError: () => ToastEmitter.error('Failed to create coupon'),
      });
    }
  };

  const handleToggle = (coupon: Coupon) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    updateCoupon.mutate({ id: coupon.id, data: { isActive: !coupon.isActive } });
  };

  const confirm = useConfirm();

  const handleDelete = async (coupon: Coupon) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    const ok = await confirm({ title: 'Delete Coupon', message: `Delete "${coupon.code}"?`, destructive: true, confirmLabel: 'Delete' });
    if (ok) { deleteCoupon.mutate(coupon.id); }
  };

  const renderCoupon = ({ item }: { item: Coupon }) => {
    const expired = new Date(item.expiresAt) < new Date();
    return (
      <View style={[styles.couponRow, expired && styles.couponExpired]}>
        <View style={styles.couponLeft}>
          <View style={[styles.couponIcon, { backgroundColor: item.isActive && !expired ? colors.accentSoft : colors.errorSoft }]}>
            <Ionicons name="pricetag-outline" size={20} color={item.isActive && !expired ? colors.accentDark : colors.errorDark} />
          </View>
          <View style={styles.couponInfo}>
            <Text style={styles.couponCode}>{item.code}</Text>
            <Text style={styles.couponDiscount}>{item.discountPercent}% off</Text>
            <Text style={styles.couponMeta}>
              Used {item.currentUses}/{item.maxUses} · Expires {formatDate(item.expiresAt)}
            </Text>
          </View>
        </View>
        <View style={styles.couponActions}>
          <TouchableOpacity
            style={[styles.statusDot, { backgroundColor: item.isActive && !expired ? colors.accent : colors.textLight }]}
            onPress={() => handleToggle(item)}
          />
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const couponList: Coupon[] = Array.isArray(coupons) ? coupons : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coupons ({couponList.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={couponList}
          keyExtractor={(item) => item.id}
          renderItem={renderCoupon}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No coupons yet</Text>
              <Text style={styles.emptySubtitle}>Create coupons to offer discounts to customers</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openCreate}>
                <Text style={styles.emptyButtonText}>Create Coupon</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editing ? 'Edit Coupon' : 'New Coupon'}</Text>

              <Text style={styles.inputLabel}>Coupon Code</Text>
              <Input containerStyle={{ marginBottom: 0 }} placeholder="e.g. SAVE20" placeholderTextColor={colors.textLighter} value={code} onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" />

              <Text style={styles.inputLabel}>Discount (%)</Text>
              <Input containerStyle={{ marginBottom: 0 }} placeholder="20" placeholderTextColor={colors.textLighter} value={discountPercent} onChangeText={setDiscountPercent} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Min Order Amount (GH₵)</Text>
              <Input containerStyle={{ marginBottom: 0 }} placeholder="0" placeholderTextColor={colors.textLighter} value={minOrderAmount} onChangeText={setMinOrderAmount} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Max Uses</Text>
              <Input containerStyle={{ marginBottom: 0 }} placeholder="100" placeholderTextColor={colors.textLighter} value={maxUses} onChangeText={setMaxUses} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Expires In (Days)</Text>
              <Input containerStyle={{ marginBottom: 0 }} placeholder="30" placeholderTextColor={colors.textLighter} value={expiresInDays} onChangeText={setExpiresInDays} keyboardType="numeric" />
              {editing && <Text style={styles.hintText}>Leave blank to keep current expiry</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                  <Text style={styles.modalSaveText}>{editing ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFC' }, // Sleek off-white bg
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h4, color: colors.text },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8, paddingTop: 12 },
  couponRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    }),
  },
  couponExpired: { opacity: 0.6 },
  couponLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  couponIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  couponInfo: { gap: 2, flex: 1 },
  couponCode: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  couponDiscount: { ...typePresets.caption, color: colors.accentDark, fontFamily: 'NunitoSans_700Bold' },
  couponMeta: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  couponActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  emptySubtitle: { ...typePresets.body, color: colors.textLight, textAlign: 'center' },
  emptyButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.lg, marginTop: 8 },
  emptyButtonText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'], padding: 24, maxHeight: '85%' },
  modalTitle: { ...typePresets.h4, color: colors.text, marginBottom: 20, textAlign: 'center' },
  inputLabel: { ...typePresets.label, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  hintText: { ...typePresets.caption, color: colors.textLight, marginTop: 4 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 12 },
  dateText: { ...typePresets.body, color: colors.text },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { ...typePresets.body, fontFamily: 'NunitoSans_600SemiBold', color: colors.textSecondary },
  modalSave: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary },
  modalSaveText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
});
