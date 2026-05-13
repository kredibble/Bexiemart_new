import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';

export default function OrderReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = (route.params as any) ?? {};

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return Alert.alert('Error', 'Please select a rating');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.accentGreen} />
          </View>
          <Text style={styles.successTitle}>Review Submitted!</Text>
          <Text style={styles.successText}>Thank you for your feedback. It helps us serve you better.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.orderInfo}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <Text style={styles.orderInfoText}>Order #{orderId ?? 'ORD-12345'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Rate Your Experience</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={36} color={s <= rating ? colors.warning : colors.border} />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
          </Text>
        )}

        <View style={styles.quickReactions}>
          {['Great quality', 'Fast delivery', 'Good packaging', 'Accurate order'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.reactionChip, review.includes(tag) && styles.reactionChipActive]}
              onPress={() => setReview((prev) => prev.includes(tag) ? prev.replace(tag, '').trim() : `${prev} ${tag}`.trim())}
            >
              <Text style={[styles.reactionText, review.includes(tag) && styles.reactionTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Write a Review (optional)</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your experience with this order..."
          placeholderTextColor={colors.textLighter}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={5}
        />

        <Text style={styles.sectionTitle}>Rate the Vendor</Text>
        <View style={styles.vendorRating}>
          {['Quality', 'Delivery Time', 'Packaging'].map((aspect) => (
            <View key={aspect} style={styles.aspectRow}>
              <Text style={styles.aspectLabel}>{aspect}</Text>
              <View style={styles.aspectStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s}>
                    <Ionicons name={s <= 4 ? 'star' : 'star-outline'} size={18} color={s <= 4 ? colors.warning : colors.border} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typePresets.h2, fontFamily: 'Rubik_700Bold', color: colors.text },
  content: { padding: 20, gap: 16 },
  orderInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, ...shadows.sm },
  orderInfoText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  sectionTitle: { ...typePresets.h4, fontFamily: 'Rubik_700Bold', color: colors.text, marginBottom: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  ratingLabel: { textAlign: 'center', ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.warningDark },
  quickReactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reactionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  reactionChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  reactionText: { ...typePresets.caption, color: colors.textSecondary },
  reactionTextActive: { color: colors.primary, fontFamily: 'NunitoSans_700Bold' },
  reviewInput: { ...typePresets.body, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 14, color: colors.text, backgroundColor: colors.white, minHeight: 120, textAlignVertical: 'top' },
  vendorRating: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, gap: 12, ...shadows.sm },
  aspectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aspectLabel: { ...typePresets.body, color: colors.textSecondary },
  aspectStars: { flexDirection: 'row', gap: 4 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 16 },
  successIcon: { alignItems: 'center', marginBottom: 16 },
  successTitle: { ...typePresets.h1, fontFamily: 'Rubik_700Bold', color: colors.text, textAlign: 'center' },
  successText: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 16, paddingHorizontal: 48, marginTop: 24 },
  doneBtnText: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.white, fontSize: 16 },
});
