/**
 * RootNavigator — Auth gate using Better Auth session.
 *
 * Uses useSession() from Better Auth to determine auth state.
 * Uses a stable key to prevent NativeStackNavigator state corruption
 * when Better Auth's session store emits updates.
 */
import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/authStore";
import AuthNavigator from "./AuthNavigator";
import CustomerTabs from "./CustomerTabs";
import VendorTabs from "./VendorTabs";

export type RootStackParamList = {
  Auth: undefined;
  CustomerApp: undefined;
  VendorApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { data: session, isPending } = useSession();
  const { setUser } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        setUser(session.user as any);
      }
      setIsReady(true);
    }
  }, [isPending, session]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#004CFF" />
      </View>
    );
  }

  const userRole = (session?.user as any)?.role;

  if (!session) {
    return <AuthNavigator key="auth" />;
  }

  return (
    <Stack.Navigator
      key={`app-${userRole ?? "customer"}`}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen
        name={userRole === "vendor" ? "VendorApp" : "CustomerApp"}
        component={userRole === "vendor" ? VendorTabs : CustomerTabs}
      />
    </Stack.Navigator>
  );
}
