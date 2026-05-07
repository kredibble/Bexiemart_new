/**
 * CheckoutScreen — Shipping address + order confirmation.
 *
 * Placeholder — will be fully implemented in Phase 4 (Cart & Checkout sprint).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Ionicons name="receipt-outline" size={52} color={colors.textLight} />
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    gap: 8,
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
