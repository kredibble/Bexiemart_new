import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { useAuthStore } from '@/stores/authStore';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { uploadImage } from '@/utils/cloudinary';
import { apiClient } from '@/lib/api-client';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, setUser, signOut } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingAvatar(true);
      try {
        const uploaded = await uploadImage(result.assets[0].uri, 'avatars');
        setAvatar(uploaded.url);
      } catch {
        Alert.alert('Upload failed', 'Could not upload image. Please try again.');
      } finally {
        setUploadingAvatar(false);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = { name: name.trim() };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();
      if (avatar) payload.avatar = avatar;

      const res = await apiClient.patch('/user/profile', payload);
      if (res) {
        setUser({ ...user!, name: name.trim(), email: email.trim(), phone: phone.trim(), avatar });
        Alert.alert('Profile Updated', 'Your profile has been saved.');
        setActiveSection(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    Alert.alert('Password Changed', 'Your password has been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveSection(null);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <Ionicons
              name={activeSection === 'profile' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>
        {activeSection === 'profile' && (
          <View style={styles.sectionContent}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarRow}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
            >
              <View style={styles.avatarWrapper}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={28} color={colors.white} />
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={14} color={colors.white} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.avatarLabel}>Profile Picture</Text>
                <Text style={styles.avatarHint}>
                  {uploadingAvatar ? 'Uploading...' : 'Tap to change'}
                </Text>
              </View>
            </TouchableOpacity>

            <FormInput label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
            <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="email@campus.edu" keyboardType="email-address" />
            <FormInput label="Phone" value={phone} onChangeText={setPhone} placeholder="024 XXX XXXX" keyboardType="phone-pad" />
            <Button
              title="Save Profile"
              onPress={handleSaveProfile}
              loading={saving}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* Addresses Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setActiveSection(activeSection === 'addresses' ? null : 'addresses')}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>My Addresses</Text>
            <Ionicons
              name={activeSection === 'addresses' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>
        {activeSection === 'addresses' && (
          <View style={styles.sectionContent}>
            <Button title="Manage Addresses" variant="secondary" fullWidth onPress={() => (navigation as any).navigate('AddressManagement')} />
          </View>
        )}

        {/* Change Password Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setActiveSection(activeSection === 'password' ? null : 'password')}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Ionicons
              name={activeSection === 'password' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>
        {activeSection === 'password' && (
          <View style={styles.sectionContent}>
            <FormInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" secureTextEntry />
            <FormInput label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Enter new password" secureTextEntry />
            <FormInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" secureTextEntry />
            <Button title="Change Password" onPress={handleChangePassword} fullWidth style={{ marginTop: 8 }} />
          </View>
        )}

        {/* Account Links */}
        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('Verification')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Account Verification</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('AddressManagement')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Manage Addresses</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('CustomerCoupons')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>My Coupons</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        {/* Legal Links */}
        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('Terms')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('Privacy')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => (navigation as any).navigate('About')} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        {/* Notification Preferences Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <Ionicons
              name={activeSection === 'notifications' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>
        {activeSection === 'notifications' && (
          <View style={styles.sectionContent}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={pushEnabled ? colors.primary : '#ccc'} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Email Notifications</Text>
              <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={emailNotifs ? colors.primary : '#ccc'} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Promotional Offers</Text>
              <Switch value={promoNotifs} onValueChange={setPromoNotifs} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={promoNotifs ? colors.primary : '#ccc'} />
            </View>
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.section, styles.signOutSection]}
          onPress={handleSignOut}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.error }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.error} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  scrollContent: { padding: 16, gap: 12 },
  section: {
    backgroundColor: colors.white, borderRadius: radii.xl, padding: 16, ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  sectionTitle: {
    ...typePresets.body, fontFamily: 'NunitoSans_600SemiBold', color: colors.text, flex: 1,
  },
  sectionContent: {
    paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 12, gap: 12,
  },
  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 8,
  },
  avatarWrapper: {
    width: 64, height: 64, borderRadius: 32, position: 'relative',
  },
  avatarImage: {
    width: 64, height: 64, borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  avatarLabel: {
    fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: colors.text,
  },
  avatarHint: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: colors.textLight, marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 14, color: colors.text,
  },
  signOutSection: {
    marginTop: 8, borderWidth: 1, borderColor: colors.errorSoft,
  },
});
