import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows } from '@/theme/colors';
import { fonts, fontSizes } from '@/theme/typography';
import { ToastEmitter } from '@/utils/toastEmitter';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastParams {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (params: ToastParams) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; accent: string }> = {
  success: { icon: 'checkmark-circle', accent: colors.success },
  error: { icon: 'alert-circle', accent: colors.error },
  info: { icon: 'information-circle', accent: colors.primary },
  warning: { icon: 'warning', accent: colors.warning },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_MAX_WIDTH = 340;

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visibleToast, setVisibleToast] = useState<{
    id: string;
    params: ToastParams;
    config: { icon: keyof typeof Ionicons.glyphMap; accent: string };
  } | null>(null);

  const queue = useRef<ToastParams[]>([]);
  const isShowing = useRef(false);

  const showNext = useCallback(() => {
    if (queue.current.length === 0) {
      isShowing.current = false;
      setVisibleToast(null);
      return;
    }
    isShowing.current = true;
    const params = queue.current.shift()!;
    const config = toastConfig[params.type ?? 'info'];
    const id = `toast-${++toastIdCounter}`;
    setVisibleToast({ id, params, config });
  }, []);

  const showToast = useCallback(
    (params: ToastParams) => {
      queue.current.push(params);
      if (!isShowing.current) {
        showNext();
      }
    },
    [showNext],
  );

  const handleDismiss = useCallback(() => {
    showNext();
  }, [showNext]);

  useEffect(() => {
    ToastEmitter._setListener(showToast);
    return () => ToastEmitter._clearListener();
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visibleToast && (
        <ToastModal
          key={visibleToast.id}
          params={visibleToast.params}
          config={visibleToast.config}
          onDismiss={handleDismiss}
        />
      )}
    </ToastContext.Provider>
  );
}

function ToastModal({
  params,
  config,
  onDismiss,
}: {
  params: ToastParams;
  config: { icon: keyof typeof Ionicons.glyphMap; accent: string };
  onDismiss: () => void;
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    switch (params.type) {
      case 'success':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
      case 'warning':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [params.type]);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(20, { duration: 180 });
      opacity.value = withTiming(0, { duration: 180 }, () => runOnJS(onDismiss)());
    }, params.duration ?? 3500);

    return () => clearTimeout(timer);
  }, [translateY, scale, opacity, onDismiss, params.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
          accessibilityLabel="Dismiss"
        />
        <Animated.View style={[styles.card, animatedStyle]}>
          <TouchableOpacity
            style={[styles.dismissBtn, Platform.select({ web: { cursor: 'pointer' as any } }) as any]}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss"
            accessibilityHint="Closes this notification"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.iconCircleOuter}>
            <View style={[styles.iconCircle, { backgroundColor: config.accent }]}>
              <Ionicons name={config.icon} size={22} color={colors.white} />
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {params.message}
          </Text>

          {params.description && (
            <Text style={styles.description} numberOfLines={3}>
              {params.description}
            </Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: Math.min(TOAST_MAX_WIDTH, SCREEN_WIDTH - 64),
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'visible',
    ...shadows.xl,
  },
  iconCircleOuter: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});
