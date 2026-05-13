/**
 * RootNavigator — Auth gate with role-based routing.
 *
 * Flow:
 *  1. Hydrate user from SecureStore (fast, local)
 *  2. If store has user → show tabs immediately
 *  3. Background: verify session with Better Auth server
 *     - Valid → done
 *     - Invalid → clearAuth() → re-render → show AuthNavigator
 *  4. If store has no user → check server session
 *     - Found session → populate store → show tabs
 *     - No session → show AuthNavigator
 *  5. AppState listener: when app returns from OAuth browser,
 *     re-check session and update store
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, AppState } from "react-native";
import { authClient } from "@/config/auth";
import { apiClient, setOnUnauthorized } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import AuthNavigator from "./AuthNavigator";
import CustomerTabs from "./CustomerTabs";
import VendorTabs from "./VendorTabs";
import AdminTabs from "./AdminTabs";
import OnboardingScreen from "@/screens/customer/OnboardingScreen";
import type { User, Role } from "@/types";

export type RootStackParamList = {
  Auth: undefined;
  CustomerApp: undefined;
  VendorApp: undefined;
  AdminApp: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Map Better Auth user shape to local User type */
function mapBetterAuthUser(baUser: Record<string, unknown>, storedUser: User | null): User {
  return {
    id: (baUser.id as string) ?? storedUser?.id ?? "",
    name: (baUser.name as string) ?? storedUser?.name ?? "",
    email: (baUser.email as string) ?? storedUser?.email ?? "",
    phone: (baUser.phone as string) ?? storedUser?.phone,
    role: (baUser.role as Role) ?? (storedUser?.role as Role) ?? "customer",
    avatar: (baUser.image as string) ?? storedUser?.avatar,
    isVerified: (baUser.emailVerified as boolean) ?? storedUser?.isVerified ?? false,
    createdAt: (baUser.createdAt as string) ?? storedUser?.createdAt ?? new Date().toISOString(),
    updatedAt: (baUser.updatedAt as string) ?? storedUser?.updatedAt ?? new Date().toISOString(),
  };
}

export default function RootNavigator() {
  const { user, isAuthenticated, setUser, clearAuth, hydrate } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const hasVerified = useRef(false);

  /**
   * Verify the session with Better Auth server.
   * If valid, sync the store. If invalid, clear it.
   */
  const verifySession = useCallback(async () => {
    try {
      const result = await authClient.getSession();
      const baUser = result.data?.user as Record<string, unknown> | undefined;

      if (baUser) {
        // Session is valid — sync store if not already set
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          const mapped = mapBetterAuthUser(baUser, null);
          setUser(mapped);
        }
        setSessionValid(true);
      } else {
        // No session on server — clear local state
        if (useAuthStore.getState().isAuthenticated) {
          clearAuth();
        }
        setSessionValid(false);
      }
    } catch {
      // Network error or server down — trust local state if hydrated
      setSessionValid(isAuthenticated);
    }
  }, [isAuthenticated, setUser, clearAuth]);

  // Register 401 handler: clears auth and sends user to login
  useEffect(() => {
    setOnUnauthorized(() => {
      clearAuth();
    });
  }, [clearAuth]);

  // Initial mount: hydrate + verify session
  useEffect(() => {
    const init = async () => {
      // Step 1: Hydrate from SecureStore (fast, local)
      await hydrate();

      // Step 2: Verify with server
      await verifySession();

      setIsReady(true);
      hasVerified.current = true;
    };

    init();
  }, []);

  // Wire up 401 → auto-logout handler
  useEffect(() => {
    setOnUnauthorized(() => {
      useAuthStore.getState().clearAuth();
    });
  }, []);

  // Check onboarding status for customer users
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer' && isReady) {
      apiClient.get<{ completed: boolean }>('/onboarding')
        .then((res) => setNeedsOnboarding(!res.completed))
        .catch(() => setNeedsOnboarding(false));
    }
  }, [isAuthenticated, user?.role, isReady]);
  // AppState listener: re-verify when app comes to foreground
  // (handles OAuth browser callback where cookies were set externally)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && hasVerified.current) {
        // App came to foreground — re-check session
        verifySession();
      }
    });

    return () => subscription.remove();
  }, [verifySession]);

  // Loading state
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // Auth gate: use Zustand store (reactive) — not the stale useSession()
  // After OAuth foreground re-check, sessionValid will be updated
  const shouldShowApp = isAuthenticated && user && (sessionValid === true || sessionValid === null);

  if (!shouldShowApp) {
    return <AuthNavigator key="auth" />;
  }

  // Read role from store (set during registration/social role select)
  const userRole = user?.role ?? "customer";
  const isVendor = userRole === "vendor";
  const isAdmin = userRole === "admin";

  return (
    <Stack.Navigator
      key={`app-${userRole}-${needsOnboarding}`}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {isAdmin ? (
        <Stack.Screen name="AdminApp" component={AdminTabs} />
      ) : isVendor ? (
        <Stack.Screen name="VendorApp" component={VendorTabs} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="CustomerApp" component={CustomerTabs} />
      )}
    </Stack.Navigator>
  );
}
