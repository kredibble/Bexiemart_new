/**
 * SocialRoleSelectScreen — Premium role selection BEFORE social sign-up.
 *
 * "Choose your path first, then sign in."
 * Eliminates the awkward post-OAuth role prompt.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSocialLogin } from '@/hooks/useSocialAuth';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SocialRoleSelect'>;
type Role = 'customer' | 'vendor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SocialRoleSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { mutate: socialLogin, isPending } = useSocialLogin();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => setSelectedRole('customer'), 600);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  const handleSelectRole = (role: Role) => {
    setHasInteracted(true);
    setSelectedRole(role);
  };

  const handleSocialPress = (provider: 'google' | 'facebook') => {
    if (!selectedRole) return;
    socialLogin({
      provider,
      idToken: `mock_${provider}_token`,
      role: selectedRole,
    });
  };

  const isReady = !!selectedRole;
  const activeColor = '#004CFF';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Soft gradient orbs on white */}
      <View style={styles.bgLayer} pointerEvents="none">
        <View style={styles.orbPrimary} />
        <View style={styles.orbSecondary} />
        <View style={styles.orbAccent} />
      </View>

      {/* Top bar — clean floating */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#111322" />
        </TouchableOpacity>
        <View style={styles.pill}>
          <Ionicons name="sparkles" size={12} color="#004CFF" />
          <Text style={styles.stepText}>Choose your path</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 72 },
        ]}
      >
        {/* Hero typography */}
        <View style={styles.heroSection}>
          <Text style={styles.heroPretitle}>Welcome to BexieMart</Text>
          <Text style={styles.heroTitle}>
            How will{'\n'}you use us?
          </Text>
        </View>

        {/* Role selector — horizontal cards */}
        <View style={styles.roleSelector}>
          <RoleTile
            role="customer"
            icon="bag-handle"
            label="Shop"
            tagline="Find what you need"
            isSelected={selectedRole === 'customer'}
            onPress={() => handleSelectRole('customer')}
            color="#004CFF"
            activeBg="#EEF2FF"
          />
          <RoleTile
            role="vendor"
            icon="storefront"
            label="Sell"
            tagline="Grow your business"
            isSelected={selectedRole === 'vendor'}
            onPress={() => handleSelectRole('vendor')}
            color="#004CFF"
            activeBg="#EEF2FF"
          />
        </View>

        {/* Selected state — floating confirmation */}
        {isReady && (
          <View style={styles.confirmationBar}>
            <View style={[
              styles.confirmationPill,
              { backgroundColor: '#EEF2FF' },
            ]}>
              <View style={[
                styles.confirmDot,
                { backgroundColor: activeColor },
              ]} />
              <Text style={[
                styles.confirmText,
                { color: activeColor },
              ]}>
                You're joining as a <Text style={styles.confirmBold}>{selectedRole === 'customer' ? 'Shopper' : 'Seller'}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Social auth section */}
        <View style={styles.authSection}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Create your account</Text>
            <Text style={styles.authSubtitle}>
              Fast, secure, and personalized from day one.
            </Text>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  !isReady && styles.socialButtonDisabled,
                ]}
                onPress={() => handleSocialPress('google')}
                disabled={!isReady || isPending}
                activeOpacity={0.7}
              >
                {isPending ? (
                  <View style={styles.socialIconPlaceholder}>
                    <View style={styles.loadingSpinner} />
                  </View>
                ) : (
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                )}
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.socialButton,
                  !isReady && styles.socialButtonDisabled,
                ]}
                onPress={() => handleSocialPress('facebook')}
                disabled={!isReady || isPending}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.emailButton,
                !isReady && { backgroundColor: '#E4E7EC' },
              ]}
              onPress={() => isReady && navigation.navigate('Register')}
              disabled={!isReady}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={18} color={isReady ? '#FFFFFF' : '#A0A8B4'} />
              <Text style={[
                styles.emailButtonText,
                !isReady && { color: '#A0A8B4' },
              ]}>Continue with email</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface RoleTileProps {
  role: Role;
  icon: string;
  label: string;
  tagline: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
  activeBg: string;
}

function RoleTile({ icon, label, tagline, isSelected, onPress, color, activeBg }: RoleTileProps) {
  return (
    <TouchableOpacity
      style={[
        styles.roleTile,
        isSelected && {
          borderColor: color,
          backgroundColor: activeBg,
          ...Platform.select({
            ios: { shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 4 },
          }),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.roleIconWrap,
        isSelected && { backgroundColor: color, transform: [{ scale: 1.05 }] },
      ]}>
        <Ionicons
          name={icon as any}
          size={28}
          color={isSelected ? '#FFFFFF' : '#8E96A6'}
        />
      </View>

      <Text style={[
        styles.roleTileLabel,
        isSelected && { color: '#111322' },
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.roleTileTagline,
        isSelected && { color: '#5F6C7B' },
      ]}>
        {tagline}
      </Text>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <View style={[styles.selectedRing, { borderColor: color }]}>
            <View style={[styles.selectedInner, { backgroundColor: color }]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orbPrimary: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: '#004CFF',
    top: -SCREEN_WIDTH * 0.55,
    right: -SCREEN_WIDTH * 0.4,
    opacity: 0.06,
  },
  orbSecondary: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: '#004CFF',
    bottom: SCREEN_WIDTH * 0.2,
    left: -SCREEN_WIDTH * 0.25,
    opacity: 0.04,
  },
  orbAccent: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFD60A',
    top: '45%',
    right: -30,
    opacity: 0.08,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: '#004CFF',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 28,
  },
  heroPretitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#8E96A6',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 42,
    color: '#111322',
    lineHeight: 46,
    letterSpacing: -1,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleTile: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderWidth: 1.5,
    borderColor: '#E8EBF0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  roleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF0F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleTileLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: '#111322',
    marginBottom: 4,
  },
  roleTileTagline: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#8E96A6',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 12,
  },
  selectedRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confirmationBar: {
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  confirmDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confirmText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
  },
  confirmBold: {
    fontFamily: 'Nunito_700Bold',
  },
  authSection: {
    gap: 16,
  },
  authCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EBF0',
    gap: 20,
    ...Platform.select({
      ios: { shadowColor: '#004CFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16 },
      android: { elevation: 2 },
    }),
  },
  authTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#111322',
  },
  authSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#8E96A6',
    marginTop: -12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4E7EC',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  socialButtonDisabled: {
    opacity: 0.4,
  },
  socialText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#111322',
  },
  socialIconPlaceholder: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E4E7EC',
    borderTopColor: '#004CFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EBF0',
  },
  dividerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9BA5B0',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#004CFF',
  },
  emailButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#8E96A6',
  },
  footerLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#004CFF',
  },
});
