import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCompleteOnboarding } from '@/hooks/useOnboarding';
import { colors, radii } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    icon: 'cart-outline',
    title: 'Shop from Campus',
    description: 'Discover products from vendors on your campus. From snacks to textbooks, find everything you need.',
  },
  {
    icon: 'chatbubbles-outline',
    title: 'Chat with Vendors',
    description: 'Ask questions, negotiate prices, and get order updates directly through in-app chat.',
  },
  {
    icon: 'wallet-outline',
    title: 'Secure Payments',
    description: 'Pay securely with mobile money or card. Your transactions are protected.',
  },
  {
    icon: 'location-outline',
    title: 'Track Your Orders',
    description: 'Follow your order in real-time from confirmation to delivery at your doorstep.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const completeOnboarding = useCompleteOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const handleSkip = useCallback(async () => {
    await completeOnboarding.mutateAsync();
    navigation.replace('CustomerApp');
  }, [completeOnboarding, navigation]);

  const handleGetStarted = useCallback(async () => {
    await completeOnboarding.mutateAsync();
    navigation.replace('CustomerApp');
  }, [completeOnboarding, navigation]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  }, []);

  const isLast = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.skipContainer}>
        {!isLast && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={80} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dots}>
          {ONBOARDING_STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
          ))}
        </View>

        {isLast ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            disabled={completeOnboarding.isPending}
          >
            <Text style={styles.getStartedText}>
              {completeOnboarding.isPending ? 'Getting started...' : 'Get Started'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  skipContainer: {
    alignItems: 'flex-end', paddingHorizontal: 20, paddingVertical: 12, height: 48,
  },
  skipText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 16, color: colors.textSecondary },
  slide: {
    width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 20,
  },
  iconContainer: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Rubik_700Bold', fontSize: 28, color: colors.text, textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 16, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  bottomContainer: {
    alignItems: 'center', gap: 24, paddingHorizontal: 20, paddingBottom: 32,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border,
  },
  activeDot: {
    width: 24, backgroundColor: colors.primary, borderRadius: 4,
  },
  nextButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  getStartedButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: radii.full,
  },
  getStartedText: {
    fontFamily: 'NunitoSans_700Bold', fontSize: 16, color: colors.white,
  },
});
