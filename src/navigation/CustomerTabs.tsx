/**
 * CustomerTabs — 5-tab bottom navigator for customer flow.
 *
 * Tabs: Home | Shop | Reels | Food | Services
 *
 * Cart, Checkout, Payment, and Favorites live inside HomeStack
 * (accessed via header icons), not as separate tabs.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

// Screens
import HomeScreen from '@/screens/customer/HomeScreen';
import ShopScreen from '@/screens/customer/ShopScreen';
import ReelsScreen from '@/screens/customer/ReelsScreen';
import FoodScreen from '@/screens/customer/FoodScreen';
import ServicesScreen from '@/screens/customer/ServicesScreen';
import ProductDetailsScreen from '@/screens/customer/ProductDetailsScreen';
import AllProductsScreen from '@/screens/customer/AllProductsScreen';
import FavoritesScreen from '@/screens/customer/FavoritesScreen';
import CartScreen from '@/screens/customer/CartScreen';
import WalletScreen from '@/screens/customer/WalletScreen';
import CheckoutScreen from '@/screens/customer/CheckoutScreen';
import PaymentScreen from '@/screens/customer/PaymentScreen';
import PaymentSuccessScreen from '@/screens/customer/PaymentSuccessScreen';
import PaymentFailureScreen from '@/screens/customer/PaymentFailureScreen';
import NotificationsScreen from '@/screens/shared/NotificationsScreen';
import SettingsScreen from '@/screens/customer/SettingsScreen';
import ChatListScreen from '@/screens/customer/ChatListScreen';
import ChatScreen from '@/screens/customer/ChatScreen';
import OrderTrackingScreen from '@/screens/customer/OrderTrackingScreen';
import TermsScreen from '@/screens/customer/TermsScreen';
import PrivacyScreen from '@/screens/customer/PrivacyScreen';
import AboutScreen from '@/screens/customer/AboutScreen';
import RestaurantHomeScreen from '@/screens/customer/RestaurantHomeScreen';
import AddressManagementScreen from '@/screens/customer/AddressManagementScreen';
import WalletTransferScreen from '@/screens/customer/WalletTransferScreen';
import CustomerCouponsScreen from '@/screens/customer/CustomerCouponsScreen';
import VerificationScreen from '@/screens/customer/VerificationScreen';
import OrderReviewScreen from '@/screens/customer/OrderReviewScreen';

// ── Type definitions ────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetails: { productId: string };
  AllProducts: { category?: string; title?: string };
  FavoritesMain: undefined;
  CartMain: undefined;
  WalletMain: undefined;
  Checkout: { couponCode?: string; discountAmount?: number } | undefined;
  Payment: { orderId: string; totalAmount: number; email: string };
  PaymentSuccess: { orderId: string; amount: number; reference: string };
  PaymentFailure: { orderId?: string; error?: string };
  Notifications: undefined;
  Settings: undefined;
  ChatList: undefined;
  Chat: { conversationId: string; otherUserName: string };
  OrderTracking: { orderId: string };
  Terms: undefined;
  Privacy: undefined;
  About: undefined;
  RestaurantHome: { restaurantId: string; restaurantName: string };
  AddressManagement: undefined;
  WalletTransfer: undefined;
  CustomerCoupons: undefined;
  Verification: undefined;
  OrderReview: { orderId: string };
};

export type ShopStackParamList = {
  ShopMain: undefined;
  ProductDetails: { productId: string };
};

export type CustomerTabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  ReelsTab: undefined;
  FoodTab: undefined;
  ServicesTab: undefined;
};

// ── Nested Stacks ───────────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStack.Screen name="AllProducts" component={AllProductsScreen} />
      <HomeStack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <HomeStack.Screen name="CartMain" component={CartScreen} />
      <HomeStack.Screen name="WalletMain" component={WalletScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
      <HomeStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <HomeStack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="ChatList" component={ChatListScreen} />
      <HomeStack.Screen name="Chat" component={ChatScreen} />
      <HomeStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <HomeStack.Screen name="Terms" component={TermsScreen} />
      <HomeStack.Screen name="Privacy" component={PrivacyScreen} />
      <HomeStack.Screen name="About" component={AboutScreen} />
      <HomeStack.Screen name="RestaurantHome" component={RestaurantHomeScreen} />
      <HomeStack.Screen name="AddressManagement" component={AddressManagementScreen} />
      <HomeStack.Screen name="WalletTransfer" component={WalletTransferScreen} />
      <HomeStack.Screen name="CustomerCoupons" component={CustomerCouponsScreen} />
      <HomeStack.Screen name="Verification" component={VerificationScreen} />
      <HomeStack.Screen name="OrderReview" component={OrderReviewScreen} />
    </HomeStack.Navigator>
  );
}

function ShopStackScreen() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false }}>
      <ShopStack.Screen name="ShopMain" component={ShopScreen} />
      <ShopStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </ShopStack.Navigator>
  );
}

// ── Tab Navigator ───────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<CustomerTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof CustomerTabParamList, { active: TabIconName; inactive: TabIconName }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  ShopTab: { active: 'bag', inactive: 'bag-outline' },
  ReelsTab: { active: 'play-circle', inactive: 'play-circle-outline' },
  FoodTab: { active: 'fast-food', inactive: 'fast-food-outline' },
  ServicesTab: { active: 'grid', inactive: 'grid-outline' },
};

const TAB_LABELS: Record<keyof CustomerTabParamList, string> = {
  HomeTab: 'Home',
  ShopTab: 'Shop',
  ReelsTab: 'Reels',
  FoodTab: 'Food',
  ServicesTab: 'Services',
};

export default function CustomerTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const iconSet = TAB_ICONS[route.name as keyof CustomerTabParamList];
          const iconName = focused ? iconSet.active : iconSet.inactive;
          return (
            <View style={tabStyles.iconContainer}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={[
              tabStyles.label,
              { color: focused ? colors.primary : colors.textLight },
            ]}
          >
            {TAB_LABELS[route.name as keyof CustomerTabParamList]}
          </Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: { elevation: 8 },
            web: { boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.06)' },
          }),
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} />
      <Tab.Screen name="ShopTab" component={ShopStackScreen} />
      <Tab.Screen name="ReelsTab" component={ReelsScreen} />
      <Tab.Screen name="FoodTab" component={FoodScreen} />
      <Tab.Screen name="ServicesTab" component={ServicesScreen} />
    </Tab.Navigator>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 11,
    marginTop: 2,
  },
});
