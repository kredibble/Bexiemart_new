import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

const MENU_ITEMS = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 45, rating: 4.5, orders: 120, image: 'https://placehold.co/80x80/06406B/FFFFFF?text=J' },
  { id: '2', name: 'Waakye with Shitor', price: 35, rating: 4.3, orders: 98, image: 'https://placehold.co/80x80/22C55E/FFFFFF?text=W' },
  { id: '3', name: 'Fried Rice & Sausage', price: 40, rating: 4.6, orders: 85, image: 'https://placehold.co/80x80/06406B/FFFFFF?text=F' },
  { id: '4', name: 'Banku & Tilapia', price: 55, rating: 4.7, orders: 150, image: 'https://placehold.co/80x80/22C55E/FFFFFF?text=B' },
  { id: '5', name: 'Fufu & Light Soup', price: 50, rating: 4.4, orders: 110, image: 'https://placehold.co/80x80/06406B/FFFFFF?text=F' },
  { id: '6', name: 'Kenkey & Fish', price: 30, rating: 4.2, orders: 65, image: 'https://placehold.co/80x80/22C55E/FFFFFF?text=K' },
];

export default function RestaurantHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId, restaurantName } = (route.params as any) ?? {};

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.banner}>
          <Image source={{ uri: 'https://placehold.co/400x200/06406B/FFFFFF?text=Restaurant' }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantInfo}>
          <View style={styles.avatar}>
            <Image source={{ uri: 'https://placehold.co/80x80/22C55E/FFFFFF?text=CM' }} style={styles.avatarImage} />
          </View>
          <Text style={styles.restaurantName}>{restaurantName ?? 'Campus Meals'}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.metaText}>4.5 (200+ ratings)</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>20-35 min</Text>
            </View>
          </View>
          <Text style={styles.description}>Serving delicious campus meals since 2024. Fresh ingredients, quick delivery, student-friendly prices.</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open now · Closes at 10:00 PM</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Search Menu</Text>
            </TouchableOpacity>
          </View>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuRow} activeOpacity={0.7}>
              <View style={styles.menuImage}>
                <Image source={{ uri: item.image }} style={styles.menuImageSrc} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.menuMeta}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={styles.menuRating}>{item.rating}</Text>
                  <Text style={styles.menuOrders}>({item.orders} orders)</Text>
                </View>
                <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add" size={20} color={colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Ionicons name="person" size={16} color={colors.primary} />
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>Abena M.</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => <Ionicons key={s} name="star" size={12} color={s <= 4 ? colors.warning : colors.border} />)}
                </View>
              </View>
              <Text style={styles.reviewDate}>2d ago</Text>
            </View>
            <Text style={styles.reviewText}>Great food! The jollof rice was perfectly spiced. Delivery was faster than expected.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  banner: { height: BANNER_HEIGHT, position: 'relative' },
  bannerImage: { width, height: BANNER_HEIGHT },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  restaurantInfo: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 0, marginTop: -40, gap: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.white, ...shadows.lg },
  avatarImage: { width: '100%', height: '100%', borderRadius: 40 },
  restaurantName: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typePresets.caption, color: colors.textSecondary },
  description: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  statusText: { ...typePresets.caption, color: colors.accentDark, fontFamily: 'NunitoSans_700Bold' },
  section: { padding: 20, paddingBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text, marginBottom: 12 },
  seeAll: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.primary },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radii.lg, padding: 12, marginBottom: 8, ...shadows.sm },
  menuImage: { width: 56, height: 56, borderRadius: radii.lg, overflow: 'hidden' },
  menuImageSrc: { width: '100%', height: '100%' },
  menuInfo: { flex: 1, gap: 2 },
  menuName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  menuMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuRating: { ...typePresets.caption, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  menuOrders: { ...typePresets.caption, color: colors.textLight },
  menuPrice: { ...typePresets.body, fontFamily: 'Rubik_700Bold', color: colors.accentGreen },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  reviewCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  reviewInfo: { flex: 1, gap: 2 },
  reviewName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { ...typePresets.caption, color: colors.textLight },
  reviewText: { ...typePresets.body, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
});
