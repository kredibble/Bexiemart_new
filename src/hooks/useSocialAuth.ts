/**
 * SocialAuthHook — React hooks for Google and Facebook social authentication.
 *
 * Flow:
 * 1. User taps Google/Facebook button
 * 2. OAuth token is retrieved from the provider
 * 3. Token + optional role sent to backend /auth/social-login
 * 4. Backend either:
 *    - Logs in existing user → returns tokens + user
 *    - Creates new account (with role if provided) → returns tokens + user
 * 5. App routes to CustomerApp or VendorApp based on user.role
 */
import { useMutation } from '@tanstack/react-query';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export function useSocialLogin() {
  const navigation = useNavigation<RootNavProp>();
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: ({ provider, idToken, role }: { provider: 'google' | 'facebook'; idToken: string; role?: 'customer' | 'vendor' }) =>
      authApi.socialLogin({ provider, idToken, role }),
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
