/**
 * useAuth — React Query hooks for Better Auth password reset flows.
 *
 * Email/password sign-up and sign-in are handled directly in screen components
 * via authClient. Social auth is handled via authClient.signIn.social().
 *
 * Auth screens do NOT manually navigate to CustomerApp/VendorApp —
 * they update the store and let RootNavigator's re-render handle the transition.
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authClient } from '@/lib/auth-client';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;

export function useForgotPassword() {
  const navigation = useNavigation<AuthNavProp>();

  return useMutation({
    mutationFn: async (email: string) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: 'bexiemartnew://reset-password',
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Failed to send reset email');
      }

      return result.data;
    },
    onSuccess: (_, email) => {
      navigation.navigate('PasswordVerify', { email });
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: 'bexiemartnew://reset-password',
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Failed to resend code');
      }

      return result.data;
    },
    // No navigation side-effect — used on PasswordVerify screen for resend
  });
}

export function useVerifyOtp() {
  const navigation = useNavigation<AuthNavProp>();

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      if (!code || code.length < 6) {
        throw new Error('Invalid verification code');
      }
      return { email, token: code };
    },
    onSuccess: (data, variables) => {
      navigation.navigate('NewPassword', {
        email: variables.email,
        token: data.token,
      });
    },
  });
}

export function useResetPassword() {
  const navigation = useNavigation<AuthNavProp>();

  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Failed to reset password');
      }

      return result.data;
    },
    onSuccess: () => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    },
  });
}


