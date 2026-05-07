import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
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
  const { isAuthenticated, user, isLoading, hydrate } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const init = async () => {
      await hydrate();
      setIsHydrating(false);
    };
    init();
  }, []);

  if (isHydrating || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#004CFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return user?.role === "vendor" ? <VendorTabs /> : <CustomerTabs />;
}
