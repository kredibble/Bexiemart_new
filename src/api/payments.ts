/**
 * Payments API — Initialize and verify Paystack transactions.
 */
import { apiClient } from '@/lib/api-client';
import type { PaymentVerification } from '@/types';

export interface InitializePaymentDto {
  orderId: string;
  amount: number;
  email: string;
  paymentMethod?: 'card' | 'mobile_money';
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export const initializePayment = async (data: InitializePaymentDto) => {
  return apiClient.post<InitializePaymentResponse>('/payments/initialize', data);
};

export const verifyPayment = async (reference: string) => {
  return apiClient.get<PaymentVerification>(`/payments/verify/${reference}`);
};
