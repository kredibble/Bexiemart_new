import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAdminCategories, useCreateAdminCategory, useUpdateAdminCategory, useDeleteAdminCategory } from '@/hooks/useAdmin';
import type { AdminCategory } from '@/api/admin';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function AdminCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, refetch } = useAdminCategories();
  const createCategory = useCreateAdminCategory();
  const updateCategory = useUpdateAdminCategory();
  const deleteCategory = useDeleteAdminCategory();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const confirm = useConfirm();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openCreate = () => {
    setEditing(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const openEdit = (cat: { id: string; name: string }) => {
    setEditing(cat);
    setCategoryName(cat.name);
    setModalVisible(true);
  };

  const handleSave = () => {
    const name = categoryName.trim();
    if (!name) return ToastEmitter.error('Category name is required');
    if (editing) {
      updateCategory.mutate({ id: editing.id, data: { name } }, {
        onSuccess: () => { setModalVisible(false); setCategoryName(''); },
        onError: () => ToastEmitter.error('Failed to update category'),
      });
    } else {
      createCategory.mutate({ name }, {
        onSuccess: () => { setModalVisible(false); setCategoryName(''); },
        onError: () => ToastEmitter.error('Failed to create category'),
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({ title: 'Delete Category', message: `Delete "${name}"? This cannot be undone.`, destructive: true, confirmLabel: 'Delete' });
    if (ok) deleteCategory.mutate(id);
  };

  const categoryList: AdminCategory[] = Array.isArray(categories) ? categories : [];

  const renderCategory = ({ item }: { item: AdminCategory }) => (
    <View style={styles.categoryRow}>
      <View style={styles.categoryIcon}>
        <Ionicons name="grid-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item._count.products} products</Text>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories ({categoryList.length})</Text>
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
          data={categoryList}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openCreate}>
                <Text style={styles.emptyButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Category' : 'New Category'}</Text>
            <Input
              placeholder="Category name"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
              containerStyle={{ marginBottom: 0 }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                <Text style={styles.modalSaveText}>{editing ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
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
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, gap: 8, paddingTop: 12 },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm,
  },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  categoryInfo: { flex: 1, gap: 2 },
  categoryName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  categoryCount: { ...typePresets.caption, color: colors.textSecondary },
  categoryActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { ...typePresets.body, color: colors.textLight },
  emptyButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.lg },
  emptyButtonText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalContent: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 24, width: '100%', maxWidth: 340, gap: 16 },
  modalTitle: { ...typePresets.h4, color: colors.text, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { ...typePresets.body, fontFamily: 'NunitoSans_600SemiBold', color: colors.textSecondary },
  modalSave: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radii.lg, backgroundColor: colors.primary },
  modalSaveText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white },
});
