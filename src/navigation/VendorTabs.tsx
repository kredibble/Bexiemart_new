import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

function PlaceholderScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Raleway_700Bold",
          color: "#111322",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "Nunito_400Regular",
          color: "#5F6C7B",
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

export default function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#004CFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: "grid-outline",
            Products: "cube-outline",
            Orders: "receipt-outline",
            Earnings: "cash-outline",
            Settings: "settings-outline",
          };

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        children={() => (
          <PlaceholderScreen
            title="Vendor Dashboard"
            message="Vendor login now lands in a working signed-in shell. The KPI cards and API hooks still need to be connected."
          />
        )}
      />
      <Tab.Screen
        name="Products"
        children={() => (
          <PlaceholderScreen
            title="Products"
            message="Product CRUD is still partly scaffolded, so this tab stays honest about being unfinished instead of failing at runtime."
          />
        )}
      />
      <Tab.Screen
        name="Orders"
        children={() => (
          <PlaceholderScreen
            title="Orders"
            message="Order management hooks are not implemented yet, but the navigation route is now in place for the vendor journey."
          />
        )}
      />
      <Tab.Screen
        name="Earnings"
        children={() => (
          <PlaceholderScreen
            title="Earnings"
            message="This is ready to receive the vendor earnings UI after the API layer is built."
          />
        )}
      />
      <Tab.Screen
        name="Settings"
        children={() => (
          <PlaceholderScreen
            title="Settings"
            message="Settings remains a placeholder until vendor profile actions are implemented."
          />
        )}
      />
    </Tab.Navigator>
  );
}
