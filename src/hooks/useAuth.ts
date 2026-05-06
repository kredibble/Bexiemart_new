import { useMutation } from '@tanstack/react-query';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export function useLogin() {
  const navigation = useNavigation<RootNavProp>();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.accessToken);
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
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      navigation.navigate('Auth');
    },
  });
}

export function useForgotPassword() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
    onSuccess: (_, email) => {
      navigation.navigate('Auth');
      (navigation as any).navigate('PasswordVerify', { email });
    },
  });
}

export function useVerifyOtp() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyOtp({ email, code }),
    onSuccess: (data, variables) => {
      (navigation as any).navigate('NewPassword', {
        email: variables.email,
        token: data.token,
      });
    },
  });
}

export function useResetPassword() {
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      (navigation as any).navigate('Login');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigation = useNavigation<RootNavProp>();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
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
