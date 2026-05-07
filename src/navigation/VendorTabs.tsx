import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "@/screens/vendor/DashboardScreen";
import ProductsScreen from "@/screens/vendor/ProductsScreen";
import OrdersScreen from "@/screens/vendor/OrdersScreen";
import EarningsScreen from "@/screens/vendor/EarningsScreen";
import SettingsScreen from "@/screens/vendor/SettingsScreen";

const Tab = createBottomTabNavigator();

function ComingSoonScreen({ name }: { name: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={48} color="#5F6C7B" />
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

export default function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "grid-outline";
          if (route.name === "Dashboard") iconName = focused ? "grid" : "grid-outline";
          else if (route.name === "Products") iconName = focused ? "bag" : "bag-outline";
          else if (route.name === "Orders") iconName = focused ? "receipt" : "receipt-outline";
          else if (route.name === "Earnings") iconName = focused ? "cash" : "cash-outline";
          else if (route.name === "Settings") iconName = focused ? "settings" : "settings-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#004CFF",
        tabBarInactiveTintColor: "#686262",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  title: {
    fontFamily: "Raleway_700Bold",
    fontSize: 20,
    color: "#111322",
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#5F6C7B",
  },
});
