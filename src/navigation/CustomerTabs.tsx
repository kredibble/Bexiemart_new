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

export default function CustomerTabs() {
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
            Home: "home-outline",
            Shop: "storefront-outline",
            Cart: "cart-outline",
            Favorites: "heart-outline",
            Notifications: "notifications-outline",
          };

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => (
          <PlaceholderScreen
            title="Customer Home"
            message="Your authentication flow is now wired up. The customer marketplace screens still need their data and UI modules connected."
          />
        )}
      />
      <Tab.Screen
        name="Shop"
        children={() => (
          <PlaceholderScreen
            title="Shop"
            message="This tab is ready to receive the product listing flow once the product API and grid components are fully built."
          />
        )}
      />
      <Tab.Screen
        name="Cart"
        children={() => (
          <PlaceholderScreen
            title="Cart"
            message="Cart state is not connected yet, so this tab is intentionally a placeholder instead of pretending to be complete."
          />
        )}
      />
      <Tab.Screen
        name="Favorites"
        children={() => (
          <PlaceholderScreen
            title="Favorites"
            message="Favorites and wishlist APIs are still stubbed, so this screen stays simple until those pieces are implemented."
          />
        )}
      />
      <Tab.Screen
        name="Notifications"
        children={() => (
          <PlaceholderScreen
            title="Notifications"
            message="Notification fetching is still a placeholder, but the navigation shell for the signed-in customer flow is now working."
          />
        )}
      />
    </Tab.Navigator>
  );
}
