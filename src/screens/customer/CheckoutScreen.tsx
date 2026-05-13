/**
 * CheckoutScreen — Shipping address, delivery option, order summary.
 *
 * Features:
 *  - Address form (multiline input + contact phone)
 *  - Delivery option selector
 *  - Order summary with CartSummary component
 *  - Zod validation
 *  - Creates order and navigates to PaymentScreen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore } from '@/stores/cartStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { HomeStackParamList } from '@/navigation/CustomerTabs';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type ScreenRouteProp = RouteProp<HomeStackParamList, 'Checkout'>;

/* ── Validation Schema ─────────────────────────────────────────────────── */

const checkoutSchema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  contact: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/* ── Delivery Options ──────────────────────────────────────────────────── */

type DeliveryOption = {
  id: string;
  label: string;
  fee: number;
  duration: string;
  icon: string;
};

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'standard', label: 'Standard', fee: 500, duration: '2-3 days', icon: 'bicycle-outline' },
  { id: 'express', label: 'Express', fee: 1000, duration: '1 day', icon: 'flash-outline' },
  { id: 'pickup', label: 'Pickup', fee: 0, duration: 'Same day', icon: 'bag-handle-outline' },
];

/* ── Screen ────────────────────────────────────────────────────────────── */

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenRouteProp>();

  const cart = useCartStore((state) => state.cart);
  const { mutate: createOrder, isPending } = useCreateOrder();

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: '',
      contact: '',
    },
  });

  const cartItems = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const routeDiscount = route.params?.discountAmount ?? 0;
  const discount = routeDiscount > 0 ? routeDiscount : (cart?.discount ?? 0);
  const deliveryFee = selectedDelivery.fee;
  const total = subtotal + deliveryFee - discount;

  const onSubmit = (values: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items before checking out.');
      return;
    }

    createOrder(
      {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        address: values.address,
        contact: values.contact,
        deliveryOptionId: selectedDelivery.id,
        paymentMethod,
        couponCode: route.params?.couponCode,
      },
      {
        onSuccess: (order) => {
          (navigation as any).navigate('Payment', {
            orderId: order.id,
            totalAmount: total,
            email: '',
          });
        },
        onError: (err: any) => {
          Alert.alert(
            'Order Failed',
            err?.message ?? 'Could not create your order. Please try again.',
          );
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Address"
                placeholder="Enter your delivery address"
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
                prefixIcon="location-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="contact"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Contact Phone"
                placeholder="e.g. 024 123 4567"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.contact?.message}
                prefixIcon="call-outline"
              />
            )}
          />
        </View>

        {/* Delivery Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>

          {DELIVERY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.deliveryOption,
                selectedDelivery.id === option.id && styles.deliveryOptionSelected,
              ]}
              onPress={() => setSelectedDelivery(option)}
              activeOpacity={0.7}
              accessibilityLabel={`Select delivery option: ${option.label}`}
              accessibilityRole="button"
            >
              <View style={styles.deliveryOptionLeft}>
                <View
                  style={[
                    styles.deliveryIcon,
                    selectedDelivery.id === option.id && styles.deliveryIconSelected,
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      selectedDelivery.id === option.id ? colors.white : colors.textSecondary
                    }
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.deliveryLabel,
                      selectedDelivery.id === option.id && styles.deliveryLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.deliveryDuration}>{option.duration}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.deliveryFee,
                  selectedDelivery.id === option.id && styles.deliveryFeeSelected,
                ]}
              >
                {option.fee === 0 ? 'Free' : `GH₵ ${option.fee.toLocaleString()}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              paymentMethod === 'card' && styles.deliveryOptionSelected,
            ]}
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.7}
            accessibilityLabel="Pay with card"
            accessibilityRole="button"
          >
            <View style={styles.deliveryOptionLeft}>
              <View
                style={[
                  styles.deliveryIcon,
                  paymentMethod === 'card' && styles.deliveryIconSelected,
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={paymentMethod === 'card' ? colors.white : colors.textSecondary}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.deliveryLabel,
                    paymentMethod === 'card' && styles.deliveryLabelSelected,
                  ]}
                >
                  Card Payment
                </Text>
                <Text style={styles.deliveryDuration}>Debit / Credit Card</Text>
              </View>
            </View>
            <Ionicons
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'card' ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryOption,
              paymentMethod === 'mobile_money' && styles.deliveryOptionSelected,
            ]}
            onPress={() => setPaymentMethod('mobile_money')}
            activeOpacity={0.7}
            accessibilityLabel="Pay with mobile money"
            accessibilityRole="button"
          >
            <View style={styles.deliveryOptionLeft}>
              <View
                style={[
                  styles.deliveryIcon,
                  paymentMethod === 'mobile_money' && styles.deliveryIconSelected,
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={paymentMethod === 'mobile_money' ? colors.white : colors.textSecondary}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.deliveryLabel,
                    paymentMethod === 'mobile_money' && styles.deliveryLabelSelected,
                  ]}
                >
                  Mobile Money
                </Text>
                <Text style={styles.deliveryDuration}>MTN / Vodafone / AirtelTigo</Text>
              </View>
            </View>
            <Ionicons
              name={paymentMethod === 'mobile_money' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'mobile_money' ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={total}
        />
      </ScrollView>

      {/* Sticky Place Order Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>GH₵ {total.toLocaleString()}</Text>
        </View>
        <View style={styles.checkoutWrapper}>
          <Button
            title={isPending ? 'Processing...' : 'Place Order'}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending || cartItems.length === 0}
            fullWidth
            size="lg"
            accessibilityLabel="Place order"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typePresets.h5,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    marginBottom: 14,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  deliveryOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  deliveryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryIconSelected: {
    backgroundColor: colors.primary,
  },
  deliveryLabel: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.text,
  },
  deliveryLabelSelected: {
    color: colors.primary,
  },
  deliveryDuration: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  deliveryFee: {
    ...typePresets.priceSm,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  deliveryFeeSelected: {
    color: colors.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)' },
    }),
  },
  bottomTotal: {
    gap: 2,
  },
  bottomTotalLabel: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  bottomTotalValue: {
    ...typePresets.priceLg,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  checkoutWrapper: {
    flex: 1,
  },
});
