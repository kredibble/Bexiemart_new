/**
 * Paystack Configuration
 *
 * Payment gateway settings for BexieMart.
 */
import { Platform } from 'react-native';

export const paystackConfig = {
  /** Public key for client-side operations */
  publicKey: __DEV__
    ? 'pk_test_xxx' // Replace with actual test key
    : 'pk_live_xxx', // Replace with actual live key

  /** Currency */
  currency: 'NGN',

  /** Callback URL for web, deep link for mobile */
  callbackUrl: Platform.OS === 'web'
    ? `${window.location.origin}/payment/callback`
    : 'bexiemartnew://payment/callback',
} as const;

/** Paystack test card details for development */
export const paystackTestCards = {
  success: {
    number: '4084084084084081',
    expiry: '12/30',
    cvv: '123',
    pin: '1234',
  },
  decline: {
    number: '4084084084084081',
    expiry: '12/30',
    cvv: '123',
    pin: '1234',
    otp: '000',
  },
} as const;
