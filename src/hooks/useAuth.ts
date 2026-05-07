/**
 * useAuth — React Query hooks for Better Auth email/password flows.
 *
 * Social auth is handled directly via authClient.signIn.social().
 * Email/password flows use these hooks for consistency with the existing form UI.
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authClient } from '@/lib/auth-client';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;
type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;

function useAuthNav() {
  return useNavigation<AuthNavProp>();
}

export function useLogin() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Login failed');
      }

      return result.data;
    },
    onSuccess: (data) => {
      const role = (data?.user as any)?.role ?? 'customer';
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: role === 'customer' ? 'CustomerApp' : 'VendorApp' }],
        })
      );
    },
  });
}

export function useRegister() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; password: string }) => {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/role-select',
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Registration failed');
      }

      return result.data;
    },
    onSuccess: () => {
      navigation.navigate('Auth' as any);
    },
  });
}

export function useForgotPassword() {
  const authNav = useAuthNav();

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
      authNav.navigate('PasswordVerify', { email });
    },
  });
}

export function useVerifyOtp() {
  const authNav = useAuthNav();

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      if (!code || code.length < 6) {
        throw new Error('Invalid verification code');
      }
      return { email, token: code };
    },
    onSuccess: (data, variables) => {
      authNav.navigate('NewPassword', {
        email: variables.email,
        token: data.token,
      });
    },
  });
}

export function useResetPassword() {
  const authNav = useAuthNav();

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
      authNav.reset({ index: 0, routes: [{ name: 'Login' }] });
    },
  });
}

export function useLogout() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    },
  });
}

export function useGetMe() {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.getSession();
      if (!result.data?.user) {
        throw new Error('Not authenticated');
      }
      return result.data.user;
    },
  });
}
