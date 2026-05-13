/**
 * Route Guards — Role-based access control for BexieMart screens.
 *
 * Components:
 *  - RoleGuard: Wraps any screen/navigator, redirects if role doesn't match
 *  - useRequireRole: Hook for programmatic role checks
 *  - useAuthGuard: Hook that redirects unauthenticated users
 *
 * Usage:
 *  <RoleGuard requiredRole="vendor">
 *    <VendorDashboard />
 *  </RoleGuard>
 *
 *  // In a component:
 *  useRequireRole('vendor'); // Redirects to CustomerTabs if not a vendor
 */
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * RoleGuard component — conditionally renders children based on user role.
 * Redirects to the correct tab navigator if role doesn't match.
 */
export function RoleGuard({
  requiredRole,
  children,
  fallback,
}: {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    if (!user) return;

    if (user.role !== requiredRole) {
      const target = user.role === 'admin' ? 'AdminApp' : user.role === 'vendor' ? 'VendorApp' : 'CustomerApp';
      // navigate walks up the tree to find the route — works from any nested navigator
      (navigation as any).navigate(target);
    }
  }, [user, requiredRole, navigation]);

  if (!user) {
    return fallback ?? null;
  }

  if (user.role !== requiredRole) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Hook that enforces role requirement in a component.
 * If the user doesn't have the required role, navigates to their correct app.
 *
 * @param requiredRole - The role required to access this screen
 */
export function useRequireRole(requiredRole: UserRole) {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    if (!user) return;

    if (user.role !== requiredRole) {
      const target = user.role === 'admin' ? 'AdminApp' : user.role === 'vendor' ? 'VendorApp' : 'CustomerApp';
      (navigation as any).navigate(target);
    }
  }, [user, requiredRole, navigation]);
}

/**
 * Hook that ensures user is authenticated.
 * Redirects to auth screen if not logged in.
 */
export function useAuthGuard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  }, [isAuthenticated, navigation]);

  return { user, isAuthenticated };
}
