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
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { HomeStackParamList } from '@/navigation/CustomerTabs';
import { useCartStore } from '@/stores/cartStore';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteType = RouteProp<HomeStackParamList, 'PaymentSuccess'>;

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { orderId, amount, reference } = route.params;

  // Clear cart after successful payment
  const clearCart = useCartStore((state) => state.clearCart);
  React.useEffect(() => {
    clearCart();
  }, []);

  const handleViewOrder = () => {
    navigation.navigate('HomeMain');
  };

  const handleContinueShopping = () => {
    navigation.navigate('HomeMain');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Animated.View entering={ZoomIn.duration(500)} style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Animated.View entering={FadeIn.delay(300)}>
            <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeIn.delay(400)}
          style={styles.title}
        >
          Payment Successful!
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(500)}
          style={styles.subtitle}
        >
          Your order has been confirmed
        </Animated.Text>

        {/* Order details card */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.detailsCard}
        >
          <DetailRow icon="receipt-outline" label="Order ID" value={orderId.slice(0, 12)} />
          <DetailRow icon="cash-outline" label="Amount Paid" value={`GH₵ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <DetailRow icon="pricetag-outline" label="Reference" value={reference} />
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={FadeIn.delay(700)} style={styles.actions}>
          <Button
            title="View Order"
            onPress={handleViewOrder}
            fullWidth
            size="lg"
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueShopping}
            activeOpacity={0.7}
            accessibilityLabel="Continue shopping"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
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
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={detailStyles.label}>{label}</Text>
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
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    ...typePresets.bodySm,
    color: colors.textSecondary,
    minWidth: 80,
  },
  value: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.text,
    flex: 1,
  },
});

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    ...typePresets.h1,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    ...typePresets.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.primary,
  },
});
