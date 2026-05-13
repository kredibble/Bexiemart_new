import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: May 2026</Text>
        <Text style={styles.body}>
          Welcome to BexieMart. By using our platform, you agree to these terms. Please read them carefully.
        </Text>
        <Text style={styles.heading}>1. Account Registration</Text>
        <Text style={styles.body}>
          You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account credentials.
        </Text>
        <Text style={styles.heading}>2. Orders & Payments</Text>
        <Text style={styles.body}>
          All orders are subject to availability. We reserve the right to cancel any order. Payments are processed securely through Paystack.
        </Text>
        <Text style={styles.heading}>3. Vendor Terms</Text>
        <Text style={styles.body}>
          Vendors agree to provide accurate product information, maintain quality standards, and fulfill orders in a timely manner.
        </Text>
        <Text style={styles.heading}>4. Prohibited Activities</Text>
        <Text style={styles.body}>
          Users may not use the platform for any unlawful purpose, attempt to gain unauthorized access, or engage in fraudulent activities.
        </Text>
        <Text style={styles.heading}>5. Limitation of Liability</Text>
        <Text style={styles.body}>
          BexieMart is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
        </Text>
        <Text style={styles.heading}>6. Changes to Terms</Text>
        <Text style={styles.body}>
          We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
        </Text>
        <Text style={styles.heading}>7. Contact</Text>
        <Text style={styles.body}>
          For questions about these terms, contact us at support@bexiemart.com.
        </Text>
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
  content: { padding: 20, gap: 8 },
  lastUpdated: { ...typePresets.caption, color: colors.textLight, marginBottom: 16 },
  heading: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text, marginTop: 16, marginBottom: 4 },
  body: { ...typePresets.body, color: colors.textSecondary, lineHeight: 22 },
});
