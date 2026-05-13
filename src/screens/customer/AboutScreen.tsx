import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="cart" size={40} color={colors.white} />
          </View>
          <Text style={styles.appName}>BexieMart</Text>
          <Text style={styles.tagline}>Campus Marketplace</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.body}>
            BexieMart is a campus-focused marketplace connecting students with local vendors, food services, and essential products. Shop from verified vendors, track orders in real-time, and enjoy seamless campus delivery.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Vendors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5000+</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.linkRow} onPress={() => (navigation as any).navigate('Terms')}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.linkText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => (navigation as any).navigate('Privacy')}>
            <Ionicons name="shield-outline" size={18} color={colors.primary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2026 BexieMart. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { padding: 20 },
  logoSection: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  appName: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.text },
  tagline: { ...typePresets.body, color: colors.textSecondary },
  version: { ...typePresets.caption, color: colors.textLight, marginTop: 4 },
  infoSection: { paddingVertical: 16 },
  body: { ...typePresets.body, color: colors.textSecondary, lineHeight: 22, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { ...typePresets.h3, fontFamily: 'Rubik_700Bold', color: colors.primary },
  statLabel: { ...typePresets.caption, color: colors.textSecondary },
  linksSection: { paddingVertical: 16, gap: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface, borderRadius: radii.lg },
  linkText: { ...typePresets.body, color: colors.text, flex: 1 },
  footer: { ...typePresets.caption, color: colors.textLight, textAlign: 'center', paddingVertical: 16 },
});
