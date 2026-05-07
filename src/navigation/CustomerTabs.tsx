/**
 * CustomerTabs — Premium bottom tab navigator for customer flow.
 *
 * Features: custom styled tab bar with floating pill effect,
 * cart badge for item count, and proper navigation stacks
 * for screens that need push/pop (Home → ProductDetails, etc.)
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '@/stores/cartStore';
import { colors, shadows } from '@/theme/colors';

// Screens
import HomeScreen from '@/screens/customer/HomeScreen';
import ShopScreen from '@/screens/customer/ShopScreen';
import CartScreen from '@/screens/customer/CartScreen';
import FavoritesScreen from '@/screens/customer/FavoritesScreen';
import ProductDetailsScreen from '@/screens/customer/ProductDetailsScreen';
import AllProductsScreen from '@/screens/customer/AllProductsScreen';

// ── Type definitions ────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetails: { productId: string };
  AllProducts: { category?: string; title?: string };
};

export type ShopStackParamList = {
  ShopMain: undefined;
  ProductDetails: { productId: string };
};

export type CustomerTabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  CartTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
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

// ── Placeholder screens ─────────────────────────────────────────────────────────

function ProfilePlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <Ionicons name="person-circle-outline" size={52} color={colors.textLight} />
      <Text style={placeholderStyles.title}>Profile</Text>
      <Text style={placeholderStyles.subtitle}>Coming Soon</Text>
    </View>
  );
}

// ── Tab Navigator ───────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<CustomerTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof CustomerTabParamList, { active: TabIconName; inactive: TabIconName }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  ShopTab: { active: 'bag', inactive: 'bag-outline' },
  CartTab: { active: 'cart', inactive: 'cart-outline' },
  FavoritesTab: { active: 'heart', inactive: 'heart-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<keyof CustomerTabParamList, string> = {
  HomeTab: 'Home',
  ShopTab: 'Shop',
  CartTab: 'Cart',
  FavoritesTab: 'Saved',
  ProfileTab: 'Profile',
};

export default function CustomerTabs() {
  const insets = useSafeAreaInsets();
  const cartItemCount = useCartStore((state) => state.itemCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconSet = TAB_ICONS[route.name as keyof CustomerTabParamList];
          const iconName = focused ? iconSet.active : iconSet.inactive;

          return (
            <View style={tabStyles.iconContainer}>
              <Ionicons name={iconName} size={22} color={color} />
              {/* Cart badge */}
              {route.name === 'CartTab' && cartItemCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
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
          }),
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} />
      <Tab.Screen name="ShopTab" component={ShopStackScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} />
      <Tab.Screen name="ProfileTab" component={ProfilePlaceholder} />
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    color: colors.white,
    lineHeight: 12,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    marginTop: 2,
  },
});

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    gap: 8,
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
