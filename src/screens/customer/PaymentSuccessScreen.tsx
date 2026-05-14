/**
 * PaymentSuccessScreen — Order confirmation after successful payment.
 *
 * Displays order ID, amount paid, and options to view order or continue shopping.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn, StretchInY, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { HomeStackParamList } from '@/navigation/CustomerTabs';
import { useCartStore } from '@/stores/cartStore';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteType = RouteProp<HomeStackParamList, 'PaymentSuccess'>;

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { orderId, amount, reference } = route.params ?? {};

  // Clear cart after successful payment
  const clearCart = useCartStore((state) => state.clearCart);
  
  React.useEffect(() => {
    clearCart();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, []);

  const handleViewOrder = () => {
    navigation.navigate('HomeMain'); // TODO: navigate to actual order details when ready
  };

  const handleContinueShopping = () => {
    navigation.navigate('HomeMain');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Animated Checkmark Graphic */}
        <Animated.View entering={ZoomIn.duration(600).springify().damping(12)} style={styles.iconContainer}>
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Animated.View entering={BounceIn.delay(300).duration(600)}>
                <Ionicons name="checkmark" size={64} color={colors.white} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.title}>
            Payment Successful!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(500).springify()} style={styles.subtitle}>
            Your order is confirmed and is now being processed.
          </Animated.Text>
        </View>

        {/* Receipt Card */}
        <Animated.View entering={StretchInY.delay(600).springify()} style={styles.receiptCard}>
          {/* Decorative Top Edge */}
          <View style={styles.receiptTopDecoration} />
          
          <View style={styles.receiptContent}>
            <DetailRow icon="receipt-outline" label="Order ID" value={orderId?.slice(0, 12).toUpperCase() || 'N/A'} />
            <View style={styles.divider} />
            <DetailRow icon="pricetag-outline" label="Reference" value={reference || 'N/A'} />
            <View style={styles.dividerDashed} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>
                GH₵ {amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Fixed Bottom Actions */}
      <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.actions}>
        <Button
          title="View Order Details"
          onPress={handleViewOrder}
          fullWidth
          size="lg"
          variant="premium"
        />
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          fullWidth
          size="lg"
          variant="ghost"
          style={styles.secondaryBtn}
        />
      </Animated.View>
    </View>
  );
}

/* ── DetailRow ─────────────────────────────────────────────────────────── */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.labelContainer}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={detailStyles.label}>{label}</Text>
      </View>
      <Text style={detailStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    ...typePresets.body,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  value: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.text,
    maxWidth: width * 0.4,
  },
});

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC', // slightly off-white for contrast against card
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Success soft
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      web: { boxShadow: `0 12px 32px rgba(16, 185, 129, 0.4)` },
    }),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    ...typePresets.h1,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typePresets.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
    }),
  },
  receiptTopDecoration: {
    height: 8,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
  },
  receiptContent: {
    padding: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  dividerDashed: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    ...typePresets.bodyLg,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textSecondary,
  },
  totalValue: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.primary,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: '#FAFAFC',
  },
  secondaryBtn: {
    marginTop: 4,
  },
});
