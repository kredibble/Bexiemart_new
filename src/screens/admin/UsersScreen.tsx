import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin';
import type { AdminUser } from '@/api/admin';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatDate } from '@/utils/format';

const ROLES = ['customer', 'vendor', 'admin'] as const;

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const { data: users, isLoading, refetch } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; role: string } | null>(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const userList: AdminUser[] = Array.isArray(users) ? users : [];

  const filtered = React.useMemo(() => {
    return userList.filter((u) => {
      if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    });
  }, [userList, search, roleFilter]);

  const handleRoleChange = (newRole: string) => {
    if (!selectedUser) return;
    updateRole.mutate({ id: selectedUser.id, role: newRole }, {
      onSuccess: () => {
        Alert.alert('Updated', `User role changed to ${newRole}`);
        setSelectedUser(null);
      },
      onError: () => Alert.alert('Error', 'Failed to update role'),
    });
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => setSelectedUser({ id: item.id, name: item.name, role: item.role })}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.name || 'Unnamed'}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <Text style={styles.userDate}>Joined {formatDate(item.createdAt)}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? colors.infoSoft : item.role === 'vendor' ? colors.accentSoft : colors.surfaceDark }]}>
        <Text style={[styles.roleText, { color: item.role === 'admin' ? colors.infoDark : item.role === 'vendor' ? colors.accentDark : colors.textSecondary }]}>
          {item.role}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users ({userList.length})</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.textLighter}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {[{ label: 'All', value: null }, { label: 'Admin', value: 'admin' }, { label: 'Vendor', value: 'vendor' }, { label: 'Customer', value: 'customer' }].map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterChip, roleFilter === f.value && styles.filterChipActive]}
            onPress={() => setRoleFilter(f.value)}
          >
            <Text style={[styles.filterChipText, roleFilter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedUser(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Role</Text>
            <Text style={styles.modalUser}>{selectedUser?.name}</Text>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleOption, selectedUser?.role === role && styles.roleOptionActive]}
                onPress={() => handleRoleChange(role)}
              >
                <Ionicons
                  name={selectedUser?.role === role ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selectedUser?.role === role ? colors.primary : colors.textLight}
                />
                <Text style={[styles.roleOptionText, selectedUser?.role === role && { color: colors.primary, fontFamily: 'NunitoSans_700Bold' }]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedUser(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h4, color: colors.text },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 8, paddingHorizontal: 14,
    backgroundColor: colors.white, borderRadius: radii.lg, height: 44, ...shadows.sm,
  },
  searchInput: { flex: 1, ...typePresets.body, color: colors.text, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...typePresets.caption, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1, gap: 2 },
  userName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  userEmail: { ...typePresets.caption, color: colors.textSecondary },
  userDate: { ...typePresets.caption, fontSize: 10, color: colors.textLight },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  roleText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalContent: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 24, width: '100%', maxWidth: 320, gap: 12 },
  modalTitle: { ...typePresets.h4, color: colors.text, textAlign: 'center' },
  modalUser: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  roleOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radii.lg },
  roleOptionActive: { backgroundColor: colors.primarySoft },
  roleOptionText: { ...typePresets.body, color: colors.text, flex: 1 },
  cancelButton: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.textSecondary },
});
