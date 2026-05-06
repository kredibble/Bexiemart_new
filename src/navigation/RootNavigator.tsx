import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import AuthNavigator from "@/navigation/AuthNavigator";
import CustomerTabs from "@/navigation/CustomerTabs";
import VendorTabs from "@/navigation/VendorTabs";
import { useAuthStore } from "@/stores/authStore";

export default function RootNavigator() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#004CFF" />
      </View>
    );
  }

  return (
    <NavigationContainer independent>
      {isAuthenticated ? role === "vendor" ? <VendorTabs /> : <CustomerTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
