import client from './client';
import { User } from '@/types';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'vendor';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const login = async (data: LoginPayload) => {
  const res = await client.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const register = async (data: RegisterPayload) => {
  const res = await client.post<AuthResponse>('/auth/register', data);
  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordPayload) => {
  const res = await client.post('/auth/forgot-password', data);
  return res.data;
};

export const verifyOtp = async (data: VerifyOtpPayload) => {
  const res = await client.post<{ token: string }>('/auth/verify-otp', data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  const res = await client.post('/auth/reset-password', data);
  return res.data;
};

export const getMe = async () => {
  const res = await client.get<{ user: User }>('/auth/me');
  return res.data.user;
};

export const logout = async () => {
  await client.post('/auth/logout');
  await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.USER_DATA);
};
