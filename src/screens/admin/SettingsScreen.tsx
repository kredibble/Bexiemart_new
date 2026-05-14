import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

interface SettingRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();
  const confirm = useConfirm();

  const settingsSections: { title: string; items: SettingRow[] }[] = [
    {
      title: 'Management',
      items: [
        { icon: 'people-outline', label: 'Users', description: 'Manage all platform users', onPress: () => {} },
        { icon: 'storefront-outline', label: 'Vendors', description: 'Manage vendor accounts', onPress: () => {} },
        { icon: 'receipt-outline', label: 'Orders', description: 'View all orders', onPress: () => {} },
        { icon: 'grid-outline', label: 'Categories', description: 'Manage product categories', onPress: () => {} },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: 'bar-chart-outline', label: 'Reports', description: 'View platform analytics', onPress: () => {} },
        { icon: 'cube-outline', label: 'Delivery History', description: 'Track completed deliveries', onPress: () => {} },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'log-out-outline', label: 'Sign Out', description: 'Log out of admin panel',
          onPress: async () => {
            const ok = await confirm({ title: 'Sign Out', message: 'Are you sure?', destructive: true, confirmLabel: 'Sign Out' });
            if (ok) signOut();
          },
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          </View>
        </View>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.settingRow, idx < section.items.length - 1 && styles.settingRowBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.6}
                >
                  <View style={[styles.settingIcon, item.destructive && { backgroundColor: colors.errorSoft }]}>
                    <Ionicons name={item.icon} size={20} color={item.destructive ? colors.error : colors.primary} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, item.destructive && { color: colors.error }]}>{item.label}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h4, color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 20, marginBottom: 24, ...shadows.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { ...typePresets.h4, color: colors.text },
  profileEmail: { ...typePresets.body, color: colors.textSecondary },
  roleBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  section: { marginBottom: 24 },
  sectionTitle: { ...typePresets.label, color: colors.textSecondary, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden', ...shadows.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { ...typePresets.body, fontFamily: 'NunitoSans_600SemiBold', color: colors.text },
  settingDescription: { ...typePresets.caption, color: colors.textLight },
});
