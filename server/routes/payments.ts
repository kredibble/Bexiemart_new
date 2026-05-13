import { eventHandler, readBody, getRouterParam, getQuery, setResponseStatus, getHeader } from 'h3';
import crypto from 'crypto';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { initializePaymentSchema } from '../validators';
import { success, paginated, error } from '../utils/response';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || '';
const PAYSTACK_API = 'https://api.paystack.co';

function generateReference(): string {
  return `bexie_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export const initializePayment = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string; email: string };
  const body = await readBody(event);

  const parsed = initializePaymentSchema.safeParse(body);
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const { amount, email, orderId, callback_url, metadata } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Order not found' };
  }

  const reference = generateReference();

  const paystackRes = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      email: email || user.email,
      reference,
      metadata: { orderId, userId: user.id, ...metadata },
      callback_url: callback_url || 'bexiemartnew://payment/callback',
    }),
  });

  const data = await paystackRes.json();

  if (!data.status) {
    setResponseStatus(event, 400);
    return { success: false, error: data.message || 'Failed to initialize payment' };
  }

  await prisma.payment.create({
    data: {
      orderId,
      userId: user.id,
      amount,
      paystackRef: reference,
      paystackTxRef: data.data.access_code,
      status: 'pending',
    },
  });

  return success({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  });
});

export const verifyPayment = eventHandler(async (event) => {
  await requireAuth(event);
  const reference = getRouterParam(event, 'reference');
  const user = event.context.user as { id: string };

  if (!reference) {
    setResponseStatus(event, 400);
    return { success: false, error: 'reference is required' };
  }

  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
    headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
  });

  const data = await response.json();

  if (!data.status) {
    setResponseStatus(event, 400);
    return { success: false, error: data.message || 'Failed to verify payment' };
  }

  const transaction = data.data;
  const isSuccess = transaction.status === 'success';

  if (isSuccess) {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { paystackRef: reference } });
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'success',
            channel: transaction.channel,
            paidAt: new Date(transaction.paid_at),
            paymentMethod: transaction.channel,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'success',
            paystackRef: reference,
            paymentMethod: transaction.channel,
          },
        });
      }
    });
  }

  return success({
    status: transaction.status,
    reference: transaction.reference,
    amount: transaction.amount / 100,
    currency: transaction.currency,
    channel: transaction.channel,
    paidAt: transaction.paid_at,
    gatewayResponse: transaction.gateway_response,
  });
});

export const paymentWebhook = eventHandler(async (event) => {
  const body = await readBody(event);
  const signature = getHeader(event, 'x-paystack-signature');

  const payload = JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    setResponseStatus(event, 401);
    return { status: 'error', message: 'Invalid signature' };
  }

  const eventType = body.event;
  const data = body.data;

  if (eventType === 'charge.success') {
    const reference = data.reference;

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { paystackRef: reference } });
      if (!payment) {
        const userEmail = data.customer?.email;
        const user = userEmail
          ? await tx.user.findUnique({ where: { email: userEmail } })
          : null;

        if (user) {
          await tx.payment.create({
            data: {
              orderId: data.metadata?.orderId || 'unknown',
              userId: user.id,
              amount: data.amount / 100,
              currency: data.currency || 'NGN',
              paystackRef: reference,
              paystackTxRef: data.access_code,
              status: 'success',
              channel: data.channel,
              paidAt: new Date(data.paid_at),
            },
          });
        }
        return;
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'success',
          channel: data.channel,
          paidAt: new Date(data.paid_at),
        },
      });

      const orderId = data.metadata?.orderId || payment.orderId;
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'success',
          paystackRef: reference,
          paymentMethod: data.channel,
        },
      });
    });
  }

  if (eventType === 'charge.failed') {
    const reference = data.reference;
    const payment = await prisma.payment.findFirst({ where: { paystackRef: reference } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
    }
  }

  return { status: 'received' };
});

export const getPaymentHistory = eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const query = getQuery(event);

  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where: { userId: user.id } }),
  ]);

  return paginated(payments, {
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  });
});
