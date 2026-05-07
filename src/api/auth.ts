import client from './client';
import type { User, LoginResponse, RegisterResponse } from '@/types';
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

export interface SocialLoginPayload {
  provider: 'google' | 'facebook';
  idToken: string;
  role?: 'customer' | 'vendor';
}

export const login = async (data: LoginPayload) => {
  const res = await client.post<LoginResponse>('/auth/login', data);
  return {
    user: res.data.user,
    accessToken: res.data.tokens.accessToken,
    refreshToken: res.data.tokens.refreshToken,
  };
};

export const register = async (data: RegisterPayload) => {
  const res = await client.post<RegisterResponse>('/auth/register', data);
  return {
    user: res.data.user,
    accessToken: res.data.tokens?.accessToken ?? null,
    refreshToken: res.data.tokens?.refreshToken ?? null,
  };
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

export const socialLogin = async (data: SocialLoginPayload) => {
  const res = await client.post<LoginResponse>('/auth/social-login', data);
  return {
    user: res.data.user,
    accessToken: res.data.tokens.accessToken,
    refreshToken: res.data.tokens.refreshToken,
  };
};

export const logout = async () => {
  await client.post('/auth/logout');
  await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.USER_DATA);
};
