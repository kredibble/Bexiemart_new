import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyOtp,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
  type VerifyOtpPayload,
} from "@/api/auth";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useAuthStore } from "@/stores/authStore";

type MutationState<TVariables> = {
  mutate: (variables: TVariables) => Promise<void>;
  isPending: boolean;
  error: unknown;
};

function useMutationState<TVariables>(
  action: (variables: TVariables) => Promise<void>,
): MutationState<TVariables> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = async (variables: TVariables) => {
    setIsPending(true);
    setError(null);

    try {
      await action(variables);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutationState<LoginPayload>(async (variables) => {
    const data = await login(variables);
    await setAuth(data);
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutationState<RegisterPayload>(async (variables) => {
    const data = await register(variables);
    await setAuth(data);
  });
}

export function useForgotPassword() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return useMutationState<string>(async (email) => {
    await forgotPassword({ email });
    navigation.navigate("PasswordVerify", { email });
  });
}

export function useVerifyOtp() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return useMutationState<VerifyOtpPayload>(async (variables) => {
    const data = await verifyOtp(variables);
    navigation.navigate("NewPassword", {
      email: variables.email,
      token: data.token,
    });
  });
}

export function useResetPassword() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return useMutationState<ResetPasswordPayload>(async (variables) => {
    await resetPassword(variables);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutationState<void>(async () => {
    await logout();
    await clearAuth();
  });
}
