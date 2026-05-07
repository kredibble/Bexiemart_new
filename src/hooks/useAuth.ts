import { useMutation } from '@tanstack/react-query';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;
type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;

function useAuthNav() {
  return useNavigation<AuthNavProp>();
}

export function useLogin() {
  const navigation = useNavigation<RootNavProp>();
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await setUser(data.user);
      await setTokens(data.accessToken, data.refreshToken);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: data.user.role === 'customer' ? 'CustomerApp' : 'VendorApp' }],
        })
      );
    },
  });
}

export function useRegister() {
  const authNav = useAuthNav();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Registration succeeded — go to Login so user can sign in
      authNav.reset({ index: 0, routes: [{ name: 'Login' }] });
    },
  });
}

export function useForgotPassword() {
  const authNav = useAuthNav();

  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
    onSuccess: (_, email) => {
      authNav.navigate('PasswordVerify', { email });
    },
  });
}

export function useVerifyOtp() {
  const authNav = useAuthNav();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyOtp({ email, code }),
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
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      authNav.reset({ index: 0, routes: [{ name: 'Login' }] });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: async () => {
      await logout();
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
    mutationFn: authApi.getMe,
  });
}
