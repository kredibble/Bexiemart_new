/**
 * Payment Routes — Paystack integration for BexieMart.
 *
 * POST /api/payments/initialize      — Create payment and get authorization URL
 * POST /api/payments/verify/:ref     — Verify a payment by reference
 * POST /api/payments/webhook         — Handle Paystack webhook events
 * GET  /api/payments/history         — Get user payment history
 */
import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus } from 'h3';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || '';
const PAYSTACK_API = 'https://api.paystack.co';

// ─── Initialize Payment ────────────────────────────────────────────────────────

export const initializePayment = eventHandler(async (event) => {
  const body = await readBody(event);
  const { amount, email, metadata, orderId } = body;

  if (!amount || !email) {
    setResponseStatus(event, 400);
    return { success: false, error: 'amount and email are required' };
  }

  const reference = `bexie_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Paystack expects kobo
      email,
      reference,
      metadata: {
        orderId,
        ...metadata,
      },
      callback_url: body.callback_url || 'bexiemartnew://payment/callback',
    }),
  });

  const data = await response.json();

  if (!data.status) {
    setResponseStatus(event, 400);
    return { success: false, error: data.message || 'Failed to initialize payment' };
  }

  return {
    success: true,
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  };
});

// ─── Verify Payment ─────────────────────────────────────────────────────────────

export const verifyPayment = eventHandler(async (event) => {
  const reference = getRouterParam(event, 'reference');

  if (!reference) {
    setResponseStatus(event, 400);
    return { success: false, error: 'reference is required' };
  }

  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (!data.status) {
    setResponseStatus(event, 400);
    return { success: false, error: data.message || 'Failed to verify payment' };
  }

  const transaction = data.data;

  return {
    success: true,
    status: transaction.status,
    reference: transaction.reference,
    amount: transaction.amount / 100, // Convert from kobo
    currency: transaction.currency,
    channel: transaction.channel,
    paidAt: transaction.paid_at,
    metadata: transaction.metadata,
    gatewayResponse: transaction.gateway_response,
  };
});

// ─── Payment Webhook ────────────────────────────────────────────────────────────

export const paymentWebhook = eventHandler(async (event) => {
  const body = await readBody(event);
  const event_type = body.event;

  if (event_type === 'charge.success') {
    const data = body.data;
    // Payment succeeded — update order status, create payment record
    return { status: 'success', reference: data.reference };
  }

  if (event_type === 'charge.failed') {
    return { status: 'failed', reference: body.data?.reference };
  }

  return { status: 'ignored' };
});

// ─── Payment History ────────────────────────────────────────────────────────────

export const getPaymentHistory = eventHandler(async (event) => {
  // Returns payment history — implement with user session lookup
  return { payments: [] };
});
