import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Launch'>;

export default function LaunchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
        ...styles.container,
      }}
    >
      <StatusBar style="dark" />

      {/* ── Decorative accent circle ──────────────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#EEF2FF',
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: '#EEF2FF',
          opacity: 0.4,
        }}
      />

      {/* ── Center section: logo + title + tagline ────────────────────── */}
      <View className="flex-1 items-center justify-center gap-4">
        <View
          style={{
            width: 108,
            height: 108,
            borderRadius: 54,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            ...Platform.select({
              ios: {
                shadowColor: '#004CFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
              },
              android: {
                elevation: 5,
              },
            }),
          }}
        >
          <Image
            source={require('../../../assets/images/icon.png')}
            style={{ width: 80, height: 80, borderRadius: 40 }}
            contentFit="cover"
            accessibilityLabel="BexieMart app logo"
          />
        </View>

        <Text
          style={{
            fontFamily: 'Raleway_700Bold',
            fontSize: 48,
            letterSpacing: -0.8,
            color: '#111322',
          }}
        >
          BexieMart
        </Text>

        <Text
          style={{
            fontFamily: 'Nunito_300Light',
            fontSize: 18,
            color: '#5F6C7B',
            textAlign: 'center',
            maxWidth: 260,
            lineHeight: 26,
          }}
        >
          Shop Smart, Live Easy — Your Campus Marketplace
        </Text>
      </View>

      {/* ── Bottom section: CTA buttons ───────────────────────────────── */}
      <View className="items-center gap-3 w-full px-6">
        <TouchableOpacity
          style={{
            width: '100%',
            height: 56,
            backgroundColor: '#004CFF',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            ...Platform.select({
              ios: {
                shadowColor: '#004CFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
              },
              android: {
                elevation: 4,
              },
            }),
          }}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          accessibilityHint="Opens the registration screen"
        >
          <Text
            style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 17, color: '#FFFFFF', letterSpacing: 0.2 }}
          >
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 py-3 px-4"
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="I already have an account"
          accessibilityHint="Opens the login screen"
        >
          <Text
            style={{ fontFamily: 'Nunito_500Medium', fontSize: 15, color: '#004CFF' }}
          >
            I already have an account
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#004CFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
});
