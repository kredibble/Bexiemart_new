/**
 * VendorTabs + Vendor Stack — Tab navigation with nested screens.
 *
 * Dashboard | Products | Orders | Earnings | Settings
 *  ├─ OrderDetails (from Dashboard/Orders)
 *  └─ AddEditProduct (from Products)
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '@/screens/vendor/DashboardScreen';
import ProductsScreen from '@/screens/vendor/ProductsScreen';
import OrdersScreen from '@/screens/vendor/OrdersScreen';
import EarningsScreen from '@/screens/vendor/EarningsScreen';
import SettingsScreen from '@/screens/vendor/SettingsScreen';
import OrderDetailsScreen from '@/screens/vendor/OrderDetailsScreen';
import AddEditProductScreen from '@/screens/vendor/AddEditProductScreen';
import NotificationsScreen from '@/screens/shared/NotificationsScreen';
import CouponsScreen from '@/screens/vendor/CouponsScreen';
import VendorWalletHomeScreen from '@/screens/vendor/wallet/VendorWalletHomeScreen';
import VendorPayoutScreen from '@/screens/vendor/wallet/VendorPayoutScreen';
import VendorPayoutMethodScreen from '@/screens/vendor/wallet/VendorPayoutMethodScreen';
import VendorEarningsHistoryScreen from '@/screens/vendor/wallet/VendorEarningsHistoryScreen';
import AccountSetupScreen from '@/screens/shared/wallet/AccountSetupScreen';
import PinSetupScreen from '@/screens/shared/wallet/PinSetupScreen';
import TransactionDetailScreen from '@/screens/shared/wallet/TransactionDetailScreen';
import type { WalletTransaction } from '@/api/wallet';

export type VendorTabsParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Earnings: undefined;
  Settings: undefined;
};

export type VendorStackParamList = {
  VendorTabsHome: undefined;
  OrderDetails: { orderId: string };
  AddEditProduct: { mode: 'add' } | { mode: 'edit'; product: any };
  Notifications: undefined;
  Coupons: undefined;
  VendorWalletHome: undefined;
  VendorPayout: undefined;
  VendorPayoutMethod: undefined;
  VendorEarningsHistory: undefined;
  AccountSetup: undefined;
  PinSetup: { mode?: 'setup' | 'change' | 'verify' } | undefined;
  TransactionDetail: { transaction: WalletTransaction };
};

const Tab = createBottomTabNavigator<VendorTabsParamList>();
const Stack = createNativeStackNavigator<VendorStackParamList>();

function DashboardTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'Dashboard')
            iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Products')
            iconName = focused ? 'bag' : 'bag-outline';
          else if (route.name === 'Orders')
            iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Earnings')
            iconName = focused ? 'cash' : 'cash-outline';
          else if (route.name === 'Settings')
            iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#686262',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EBEBEB',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
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

export default function VendorTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorTabsHome" component={DashboardTab} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Coupons" component={CouponsScreen} />
      <Stack.Screen name="VendorWalletHome" component={VendorWalletHomeScreen} />
      <Stack.Screen name="VendorPayout" component={VendorPayoutScreen} />
      <Stack.Screen name="VendorPayoutMethod" component={VendorPayoutMethodScreen} />
      <Stack.Screen name="VendorEarningsHistory" component={VendorEarningsHistoryScreen} />
      <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}
