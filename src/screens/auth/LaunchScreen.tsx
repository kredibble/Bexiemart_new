import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Launch'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideData {
  accentColor: string;
  accentSoft: string;
  orbPrimary: string;
  orbSecondary: string;
  orbAccent: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  features: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[];
  illustration: number;
}

const slides: SlideData[] = [
  {
    accentColor: '#7C3AED',
    accentSoft: '#F3E8FF',
    orbPrimary: '#F3E8FF',
    orbSecondary: '#DBEAFE',
    orbAccent: '#BFDBFE',
    title: 'Discover Everything',
    titleHighlight: 'on Campus',
    subtitle: 'From textbooks to tech, fashion to food — find what you need from fellow students.',
    features: [
      { icon: 'grid-outline', label: 'Browse Categories' },
      { icon: 'search-outline', label: 'Smart Search' },
    ],
    illustration: require('../../../assets/images/Discover_everything_on_campus.png'),
  },
  {
    accentColor: '#08A81D',
    accentSoft: '#D1FAE5',
    orbPrimary: '#D1FAE5',
    orbSecondary: '#A7F3D0',
    orbAccent: '#6EE7B7',
    title: 'Pay Securely,',
    titleHighlight: 'Get It Fast',
    subtitle: 'Protected payments with real-time delivery tracking that keeps you in the loop.',
    features: [
      { icon: 'shield-checkmark-outline', label: 'Secure Payments' },
      { icon: 'location-outline', label: 'Live Tracking' },
    ],
    illustration: require('../../../assets/images/Secure_payment_and_delivery.png'),
  },
  {
    accentColor: '#F59E0B',
    accentSoft: '#FEF3C7',
    orbPrimary: '#FEF3C7',
    orbSecondary: '#FDE68A',
    orbAccent: '#FCD34D',
    title: 'Turn Your Skills',
    titleHighlight: 'Into Income',
    subtitle: 'Open your shop in minutes. List products, manage orders, and grow your business.',
    features: [
      { icon: 'storefront-outline', label: 'Vendor Dashboard' },
      { icon: 'trending-up-outline', label: 'Analytics' },
    ],
    illustration: require('../../../assets/images/Business_growth_with_community_and_success.png'),
  },
];

export default function LaunchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(index);
    },
  });

  const goToSlide = useCallback(
    (index: number) => {
      scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setCurrentIndex(index);
    },
    []
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    }
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Decorative background shapes ──────────────────── */}
      <View style={[styles.bgLayer, { pointerEvents: 'none' }]}>
        <View style={[styles.bgShape, styles.bgShape1, { backgroundColor: slide.orbPrimary }]} />
        <View style={[styles.bgShape, styles.bgShape2, { backgroundColor: slide.orbSecondary }]} />
        <View style={[styles.bgShape, styles.bgShape3, { backgroundColor: slide.orbAccent }]} />
      </View>

      {/* ── Top bar: brand + skip ─────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandWatermark}>
          <Text style={styles.brandWatermarkText}>Bexie</Text>
          <Text style={[styles.brandWatermarkText, styles.brandWatermarkAccent]}>Mart</Text>
        </View>
          <Button
            title="Skip"
            variant="secondary"
            size="sm"
            style={{ borderRadius: 20 }}
            onPress={() => navigation.navigate('SocialRoleSelect', {})}
            accessibilityLabel="Skip onboarding"
          />
      </View>

      {/* ── Slide carousel ────────────────────────────────── */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        style={styles.carousel}
      >
        {slides.map((s, index) => (
          <SlideCard
            key={index}
            slide={s}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* ── Bottom section: progress + CTAs ───────────────── */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}>
        {/* Progress dots */}
        <View style={styles.progressTrack}>
          {slides.map((s, i) => (
            <ProgressDot key={i} scrollX={scrollX} index={i} color={s.accentColor} />
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <Button
            title={currentIndex < slides.length - 1 ? "Next" : "Get Started"}
            size="lg"
            fullWidth
            style={{ backgroundColor: slide.accentColor }}
            onPress={currentIndex < slides.length - 1 ? handleNext : () => navigation.navigate('SocialRoleSelect', {})}
            accessibilityLabel="Get started"
          />
        </View>

        {/* Login link */}
        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="I already have an account, sign in"
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ── ProgressDot ─────────────────────────────────────────────── */

interface ProgressDotProps {
  scrollX: SharedValue<number>;
  index: number;
  color: string;
}

function ProgressDot({ scrollX, index, color }: ProgressDotProps) {
  const rStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 32, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return { width, opacity, backgroundColor: color };
  });

  return (
    <Animated.View style={[styles.progressDot, rStyle]} accessible accessibilityLabel={`Page ${index + 1} of ${slides.length}`} />
  );
}

/* ── SlideCard ───────────────────────────────────────────────── */

interface SlideCardProps {
  slide: SlideData;
  index: number;
  scrollX: SharedValue<number>;
}

function SlideCard({ slide, index, scrollX }: SlideCardProps) {
  const rIllustration = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 0.5) * SCREEN_WIDTH,
    ];
    return {
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP) },
        { translateY: interpolate(scrollX.value, inputRange, [40, 0, 40], Extrapolation.CLAMP) },
      ],
    };
  });

  const rTitle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 0.5) * SCREEN_WIDTH,
    ];
    return {
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollX.value, inputRange, [30, 0, 30], Extrapolation.CLAMP) },
      ],
    };
  });

  const rSubtitle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 0.5) * SCREEN_WIDTH,
    ];
    return {
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP) },
      ],
    };
  });

  const rFeatures = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 0.5) * SCREEN_WIDTH,
    ];
    return {
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        {/* Illustration */}
        <Animated.View style={[styles.illustrationWrapper, rIllustration]}>
          <View style={[styles.illustrationBg, { backgroundColor: slide.accentSoft }]}>
            <Image
              source={slide.illustration}
              style={styles.illustrationImage}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        <View style={styles.floatLayer}>
          <Animated.View style={rTitle}>
            <Text style={styles.title}>
              {slide.title}
              {'\n'}
              <Text style={[styles.titleHighlight, { color: slide.accentColor }]}>
                {slide.titleHighlight}
              </Text>
            </Text>
          </Animated.View>

          <Animated.View style={rSubtitle}>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </Animated.View>

          <Animated.View style={[styles.featureRow, rFeatures]}>
            {slide.features.map((f, i) => (
              <View
                key={i}
                style={[styles.featureChip, { backgroundColor: slide.accentSoft }]}
              >
                <Ionicons name={f.icon} size={14} color={slide.accentColor} />
                <Text style={[styles.featureChipText, { color: slide.accentColor }]}>
                  {f.label}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bgShape: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgShape1: {
    width: 280,
    height: 280,
    top: -60,
    right: -80,
    opacity: 0.5,
  },
  bgShape2: {
    width: 200,
    height: 200,
    bottom: 120,
    left: -60,
    opacity: 0.35,
  },
  bgShape3: {
    width: 120,
    height: 120,
    top: SCREEN_HEIGHT * 0.35,
    right: -20,
    opacity: 0.25,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    zIndex: 5,
  },
  brandWatermark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandWatermarkText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 18,
    color: '#111322',
    letterSpacing: -0.3,
  },
  brandWatermarkAccent: {
    color: '#7C3AED',
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  illustrationWrapper: {
    alignItems: 'center',
  },
  illustrationBg: {
    width: 220,
    height: 220,
    borderRadius: 110,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' },
    }),
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 94,
  },
  floatLayer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 28,
    color: '#111322',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  titleHighlight: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  featureChipText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    gap: 16,
    zIndex: 5,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F0F2F5',
  },
  ctaRow: {
    gap: 12,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#5F6C7B',
  },
  loginLink: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: '#7C3AED',
  },
});
