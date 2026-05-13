/**
 * SettingsScreen — Vendor shop profile settings.
 *
 * Features:
 *  - Editable shop name, description, location, contact
 *  - Logo picker
 *  - Save mutation
 *  - Sign out button
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useUpdateShopProfile } from '@/hooks/useVendor';
import { uploadImage } from '@/utils/cloudinary';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuthStore();
  const updateProfileMutation = useUpdateShopProfile();

  const [shopName, setShopName] = useState(user?.shopName ?? '');
  const [shopDescription, setShopDescription] = useState(user?.shopDescription ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [contact, setContact] = useState(user?.contact ?? '');
  const [logo, setLogo] = useState<string | undefined>(user?.logo);
  const [logoUploading, setLogoUploading] = useState(false);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLogoUploading(true);
      try {
        const uploadResult = await uploadImage(result.assets[0].uri, 'shops');
        setLogo(uploadResult.url);
      } catch {
        Alert.alert('Upload Failed', 'Could not upload logo. Please try again.');
        setLogo(result.assets[0].uri); // Fallback to local URI
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const handleSave = () => {
    if (!shopName.trim()) {
      Alert.alert('Validation Error', 'Shop name is required.');
      return;
    }
    updateProfileMutation.mutate(
      {
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        location: location.trim(),
        contact: contact.trim(),
        logo,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Shop profile updated');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to update profile');
        },
      }
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <TouchableOpacity style={styles.logoCircle} onPress={pickLogo} disabled={logoUploading} accessibilityLabel="Change shop logo" accessibilityHint="Opens photo gallery to select new logo" accessibilityRole="button">
            {logoUploading ? (
              <LoadingSpinner size="small" />
            ) : logo ? (
              <Image source={{ uri: logo }} style={styles.logoImage} />
            ) : (
              <Ionicons name="camera-outline" size={32} color={colors.textLight} />
            )}
          </TouchableOpacity>
          <Text style={styles.logoHint}>Tap to change logo</Text>
        </View>

        <FormInput
          label="Shop Name"
          value={shopName}
          onChangeText={setShopName}
          placeholder="Your shop name"
        />

        <FormInput
          label="Shop Description"
          value={shopDescription}
          onChangeText={setShopDescription}
          placeholder="Describe your shop..."
          multiline
        />

        <FormInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Accra, Ghana"
        />

        <FormInput
          label="Contact Number"
          value={contact}
          onChangeText={setContact}
          placeholder="e.g. +233 XX XXX XXXX"
          keyboardType="phone-pad"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateProfileMutation.isPending}
          fullWidth
          style={{ marginTop: 32 }}
          accessibilityLabel="Save settings"
          accessibilityRole="button"
        />

        <Button
          variant="ghost"
          fullWidth
          style={{ marginTop: 12 }}
          onPress={handleSignOut}
          accessibilityLabel="Sign out of account"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 15, color: colors.error }}>Sign Out</Text>
        </Button>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typePresets.h2,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoHint: {
    ...typePresets.caption,
    color: colors.textSecondary,
    marginTop: 8,
  },

});
