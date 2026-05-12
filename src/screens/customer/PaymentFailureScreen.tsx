/**
 * PaymentFailureScreen — Payment failure/ cancellation display.
 *
 * Shows error reason and options to retry, change method, or cancel order.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { colors, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { CartStackParamList } from '@/navigation/CustomerTabs';

type NavProp = NativeStackNavigationProp<CartStackParamList>;
type RouteType = RouteProp<CartStackParamList, 'PaymentFailure'>;

export default function PaymentFailureScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { orderId, error } = route.params;

  const handleRetry = () => {
    if (orderId) {
      navigation.replace('Payment', {
        orderId,
        totalAmount: 0,
        email: '',
      });
    }
  };

  const handleGoHome = () => {
    navigation.getParent()?.navigate('HomeTab');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Animated.View entering={ZoomIn.duration(500)} style={styles.content}>
        {/* Failure icon */}
        <View style={styles.iconCircle}>
          <Animated.View entering={FadeIn.delay(300)}>
            <Ionicons name="close-circle" size={72} color={colors.error} />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeIn.delay(400)}
          style={styles.title}
        >
          Payment Failed
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(500)}
          style={styles.subtitle}
        >
          {error ?? 'We could not process your payment. Please try again.'}
        </Animated.Text>

        {/* Help card */}
        <Animated.View
          entering={FadeIn.delay(600)}
          style={styles.helpCard}
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.helpText}>
            Possible reasons: insufficient funds, incorrect card details, or bank declined the transaction.
          </Text>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={FadeIn.delay(700)} style={styles.actions}>
          <Button
            title="Try Again"
            onPress={handleRetry}
            fullWidth
            size="lg"
          />
          <Button
            title="Choose Another Method"
            onPress={handleRetry}
            variant="outline"
            fullWidth
            size="lg"
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel & Go Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

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
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    ...typePresets.h1,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    ...typePresets.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  helpCard: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.warningSoft,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  helpText: {
    ...typePresets.bodySm,
    color: colors.warningDark,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typePresets.body,
    color: colors.textLight,
  },
});
