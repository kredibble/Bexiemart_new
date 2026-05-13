import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const SAMPLE_ADDRESSES: Address[] = [
  { id: '1', label: 'Campus Hostel', recipientName: 'John Doe', phone: '024 123 4567', addressLine1: 'Room 12, Block B', city: 'Legon', state: 'Accra', isDefault: true },
  { id: '2', label: 'Home', recipientName: 'John Doe', phone: '024 123 4567', addressLine1: '15 Independence Ave', city: 'Accra', state: 'Greater Accra', isDefault: false },
];

export default function AddressManagementScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState(SAMPLE_ADDRESSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setLabel(''); setRecipientName(''); setPhone(''); setAddressLine1(''); setAddressLine2(''); setCity(''); setState('');
    setModalVisible(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setLabel(addr.label); setRecipientName(addr.recipientName); setPhone(addr.phone);
    setAddressLine1(addr.addressLine1); setAddressLine2(addr.addressLine2 ?? '');
    setCity(addr.city); setState(addr.state);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!label.trim() || !addressLine1.trim()) return Alert.alert('Error', 'Label and address are required');
    if (editing) {
      setAddresses((prev) => prev.map((a) => a.id === editing.id ? { ...a, label, recipientName, phone, addressLine1, addressLine2, city, state } : a));
    } else {
      setAddresses((prev) => [...prev, { id: String(Date.now()), label, recipientName, phone, addressLine1, addressLine2, city, state, isDefault: false }]);
    }
    setModalVisible(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)) },
    ]);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <TouchableOpacity style={styles.addressCard} onPress={() => openEdit(item)} activeOpacity={0.7}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLeft}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.addressName}>{item.recipientName} · {item.phone}</Text>
      <Text style={styles.addressDetail}>{item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}</Text>
      <Text style={styles.addressCity}>{item.city}, {item.state}</Text>
      {!item.isDefault && (
        <TouchableOpacity style={styles.setDefaultBtn} onPress={() => setDefault(item.id)}>
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
              <Text style={styles.emptyBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editing ? 'Edit Address' : 'New Address'}</Text>

              <Text style={styles.inputLabel}>Label</Text>
              <TextInput style={styles.input} placeholder="e.g. Home, Hostel" placeholderTextColor={colors.textLighter} value={label} onChangeText={setLabel} />

              <Text style={styles.inputLabel}>Recipient Name</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLighter} value={recipientName} onChangeText={setRecipientName} />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.input} placeholder="024 XXX XXXX" placeholderTextColor={colors.textLighter} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>Address Line 1</Text>
              <TextInput style={styles.input} placeholder="Street, building, room" placeholderTextColor={colors.textLighter} value={addressLine1} onChangeText={setAddressLine1} />

              <Text style={styles.inputLabel}>Address Line 2 (optional)</Text>
              <TextInput style={styles.input} placeholder="Landmark, details" placeholderTextColor={colors.textLighter} value={addressLine2} onChangeText={setAddressLine2} />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput style={styles.input} placeholder="City" placeholderTextColor={colors.textLighter} value={city} onChangeText={setCity} />

              <Text style={styles.inputLabel}>State/Region</Text>
              <TextInput style={styles.input} placeholder="State/Region" placeholderTextColor={colors.textLighter} value={state} onChangeText={setState} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                  <Text style={styles.modalSaveText}>{editing ? 'Update' : 'Save'}</Text>
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
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 12 },
  addressCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, gap: 4, ...shadows.sm },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addressLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressLabel: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  defaultBadge: { backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
  defaultText: { ...typePresets.caption, fontSize: 10, fontFamily: 'NunitoSans_700Bold', color: colors.accentDark },
  addressName: { ...typePresets.caption, color: colors.textSecondary, marginTop: 4 },
  addressDetail: { ...typePresets.caption, color: colors.textSecondary },
  addressCity: { ...typePresets.caption, color: colors.textLight },
  setDefaultBtn: { marginTop: 8, alignSelf: 'flex-start' },
  setDefaultText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.lg, marginTop: 8 },
  emptyBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'], padding: 24, maxHeight: '85%' },
  modalTitle: { ...typePresets.h4, color: colors.text, textAlign: 'center', marginBottom: 16 },
  inputLabel: { ...typePresets.label, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { ...typePresets.body, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 12, color: colors.text, backgroundColor: colors.white },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { ...typePresets.body, fontFamily: 'NunitoSans_600SemiBold', color: colors.textSecondary },
  modalSave: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary },
  modalSaveText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
});
