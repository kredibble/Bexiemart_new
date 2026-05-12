/**
 * Payment Test Configuration — Paystack test cards and scenarios.
 *
 * Use these test cards to verify the complete payment flow:
 *  1. Customer adds items to cart
 *  2. Goes through checkout
 *  3. Payment screen opens Paystack WebView
 *  4. Enter test card details
 *  5. Verify success/failure handling
 */

export interface TestCard {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  result: 'success' | 'failure' | 'requires_auth';
  description: string;
}

/**
 * Paystack test cards for development testing.
 * https://paystack.com/docs/developer/test-cards
 */
export const TEST_CARDS: TestCard[] = [
  {
    name: 'Test Card',
    number: '4084084084084081',
    expiry: '12/30',
    cvv: '123',
    result: 'success',
    description: 'Successful payment',
  },
  {
    name: 'Auth Card (Charge)',
    number: '4100000000000018',
    expiry: '12/30',
    cvv: '123',
    result: 'requires_auth',
    description: 'Requires authentication (OTP/bank prompt)',
  },
  {
    name: 'Insufficient Funds',
    number: '4100000000000000',
    expiry: '12/30',
    cvv: '123',
    result: 'failure',
    description: 'Declined — insufficient funds',
  },
  {
    name: 'Expired Card',
    number: '4100000000000026',
    expiry: '12/30',
    cvv: '123',
    result: 'failure',
    description: 'Declined — expired card',
  },
];

/**
 * Test OTP for authentication-required transactions.
 */
export const TEST_OTP = '12345';

/**
 * Quick reference for manual E2E testing.
 */
export const E2E_TEST_CHECKLIST = [
  '□ Add items to cart (at least 2 products)',
  '□ Proceed to checkout',
  '□ Fill in delivery address',
  '□ Select delivery option',
  '□ Apply coupon (optional)',
  '□ Review order summary',
  '□ Tap "Pay Now"',
  '□ Enter test card: 4084084084084081',
  '□ Complete payment',
  '□ Verify redirect to PaymentSuccessScreen',
  '□ Verify cart is cleared',
  '□ Verify order appears in Orders screen',
  '',
  '── Failure Flow ──',
  '□ Repeat steps 1-7',
  '□ Enter test card: 4100000000000000',
  '□ Verify redirect to PaymentFailureScreen',
  '□ Verify "Retry Payment" button works',
  '',
  '── Auth Flow ──',
  '□ Repeat steps 1-7',
  '□ Enter test card: 4100000000000018',
  '□ Enter OTP: 12345',
  '□ Verify payment completes',
];

/**
 * Log the test checklist to console for reference during testing.
 */
export function printTestChecklist() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  BexieMart E2E Payment Test Checklist');
  console.log('═══════════════════════════════════════════\n');
  E2E_TEST_CHECKLIST.forEach((line) => console.log(`  ${line}`));
  console.log('\n═══════════════════════════════════════════\n');
}
