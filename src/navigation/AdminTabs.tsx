/**
 * AdminTabs — Bottom tab navigator for admin dashboard.
 *
 * Tabs: Overview | Users | Orders | Products | Settings
 * Sub-screens: Categories, Reports, Delivery History, Vendors
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AdminOverviewScreen from '@/screens/admin/OverviewScreen';
import AdminUsersScreen from '@/screens/admin/UsersScreen';
import AdminVendorsScreen from '@/screens/admin/VendorsScreen';
import AdminOrdersScreen from '@/screens/admin/OrdersScreen';
import AdminProductsScreen from '@/screens/admin/ProductsScreen';
import AdminCategoriesScreen from '@/screens/admin/CategoriesScreen';
import AdminReportsScreen from '@/screens/admin/ReportsScreen';
import AdminDeliveryHistoryScreen from '@/screens/admin/DeliveryHistoryScreen';
import AdminSettingsScreen from '@/screens/admin/SettingsScreen';
import { colors } from '@/theme/colors';

export type AdminTabsParamList = {
  Overview: undefined;
  Users: undefined;
  Orders: undefined;
  Products: undefined;
  Settings: undefined;
};

export type AdminStackParamList = {
  AdminTabsHome: undefined;
  Vendors: undefined;
  Categories: undefined;
  Reports: undefined;
  DeliveryHistory: undefined;
};

const Tab = createBottomTabNavigator<AdminTabsParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'Overview') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Products') iconName = focused ? 'bag' : 'bag-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={[tabStyles.label, { color }]}>
            {route.name}
          </Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: { elevation: 8 },
          }),
        },
      })}
    >
      <Tab.Screen name="Overview" component={AdminOverviewScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Orders" component={AdminOrdersScreen} />
      <Tab.Screen name="Products" component={AdminProductsScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabsHome" component={AdminTabNavigator} />
      <Stack.Screen name="Vendors" component={AdminVendorsScreen} />
      <Stack.Screen name="Categories" component={AdminCategoriesScreen} />
      <Stack.Screen name="Reports" component={AdminReportsScreen} />
      <Stack.Screen name="DeliveryHistory" component={AdminDeliveryHistoryScreen} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  label: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 11,
    marginTop: 2,
  },
});
