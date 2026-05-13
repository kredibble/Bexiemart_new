import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: May 2026</Text>
        <Text style={styles.body}>
          Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
        </Text>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide directly: name, email, phone number, delivery addresses, and payment information. We also automatically collect usage data and device information.
        </Text>
        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          We use your information to process orders, communicate with you, improve our services, and send relevant notifications. We do not sell your personal data.
        </Text>
        <Text style={styles.heading}>3. Data Security</Text>
        <Text style={styles.body}>
          We implement industry-standard security measures including encryption, secure socket layer technology, and regular security audits to protect your data.
        </Text>
        <Text style={styles.heading}>4. Third-Party Services</Text>
        <Text style={styles.body}>
          We use Paystack for payment processing. Your payment details are handled by Paystack in compliance with PCI DSS standards.
        </Text>
        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.body}>
          You have the right to access, correct, or delete your personal data. You can manage your data through your account settings or by contacting us.
        </Text>
        <Text style={styles.heading}>6. Cookies</Text>
        <Text style={styles.body}>
          We use essential cookies for authentication and session management. Analytics cookies help us improve your experience.
        </Text>
        <Text style={styles.heading}>7. Contact</Text>
        <Text style={styles.body}>
          For privacy-related inquiries, contact us at privacy@bexiemart.com.
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
