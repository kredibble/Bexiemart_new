/**
 * PaymentScreen — Paystack WebView payment integration.
 *
 * Receives order details from CheckoutScreen, initializes payment,
 * opens Paystack WebView, handles callback, verifies payment,
 * and navigates to success/failure.
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useInitializePayment } from '@/hooks/useOrders';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { HomeStackParamList } from '@/navigation/CustomerTabs';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteType = RouteProp<HomeStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { orderId, totalAmount, email } = route.params ?? {};

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const confirm = useConfirm();

  const { mutate: initializePayment, isPending } = useInitializePayment();

  // Initialize payment on mount
  React.useEffect(() => {
    initializePayment(
      {
        orderId,
        amount: totalAmount,
        email: email || 'customer@bexiemart.com',
      },
      {
        onSuccess: (data) => {
          setPaymentUrl(data.authorizationUrl);
          setIsLoading(false);
        },
        onError: () => {
          setHasError(true);
          setIsLoading(false);
          ToastEmitter.error('Could not start payment. Please try again.');
        },
      }
    );
  }, []);

  const isPaystackUrl = (url: string): boolean => {
    try {
      const host = new URL(url).hostname;
      return host.includes('paystack.com') || host.includes('paystack.co');
    } catch {
      return false;
    }
  };

  const handleNavigationStateChange = useCallback(
    (navState: { url: string }) => {
      const { url } = navState;

      // Only process callbacks from Paystack domains
      if (!isPaystackUrl(url)) return;

      // Check for success callback
      if (url.includes('success') || url.includes('reference=')) {
        const refMatch = url.match(/reference=([^&]+)/);
        const reference = refMatch ? refMatch[1] : 'unknown';
        navigation.replace('PaymentSuccess', {
          orderId,
          amount: totalAmount,
          reference,
        });
        return;
      }

      // Check for failure/cancel
      if (url.includes('cancelled') || url.includes('failed')) {
        navigation.replace('PaymentFailure', { orderId });
      }
    },
    [navigation, orderId, totalAmount]
  );

  const handleCancel = async () => {
    const ok = await confirm({ title: 'Cancel Payment?', message: 'Your order will remain pending. You can complete it later.', destructive: true, confirmLabel: 'Cancel' });
    if (ok) navigation.replace('PaymentFailure', { orderId });
  };

  if (isPending || isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 48, backgroundColor: colors.white }]}>
        <StatusBar style="dark" />
        <LoadingSpinner label="Initializing payment..." />
      </View>
    );
  }

  if (hasError || !paymentUrl) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 48, backgroundColor: colors.white }]}>
        <StatusBar style="dark" />
        <EmptyState
          icon="alert-circle-outline"
          iconColor={colors.error}
          title="Payment Error"
          subtitle="Could not load payment page"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Cancel payment"
          accessibilityHint="Returns to previous screen"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success} />
        </View>
      </View>

      {/* Paystack WebView */}
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.webviewLoader}>
            <LoadingSpinner />
          </View>
        )}
        onError={() => {
          setHasError(true);
          ToastEmitter.error('Could not load payment page. Check your internet connection.');
        }}
        style={styles.webview}
      />
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  secureBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

});
