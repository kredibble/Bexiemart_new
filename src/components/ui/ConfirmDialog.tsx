import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows } from '@/theme/colors';
import { fonts, fontSizes } from '@/theme/typography';

interface ConfirmOptions {
  title: string;
  message: string;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIALOG_MAX_WIDTH = 380;

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    visible: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ visible: true, options, resolve });
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    state?.options.onCancel?.();
    state?.resolve(false);
    setState(null);
  }, [state]);

  const handleConfirm = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (state?.options.onConfirm) {
      setLoading(true);
      try {
        await state.options.onConfirm();
      } finally {
        setLoading(false);
      }
    }
    state?.resolve(true);
    setState(null);
  }, [state]);

  if (!state) {
    return (
      <ConfirmContext.Provider value={{ confirm }}>
        {children}
      </ConfirmContext.Provider>
    );
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        options={state.options}
        loading={loading}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  options,
  loading,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const accentColor = options.destructive ? colors.error : colors.primary;
  const iconName: keyof typeof Ionicons.glyphMap = options.icon ?? (options.destructive ? 'trash-outline' : 'help-circle-outline');
  const confirmLabel = options.confirmLabel ?? (options.destructive ? 'Delete' : 'Confirm');
  const loadingLabel = options.destructive ? 'Deleting...' : 'Please wait...';

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
        />
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.iconCircleOuter}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <Ionicons name={iconName} size={22} color={colors.white} />
            </View>
          </View>

          <Text style={styles.title}>{options.title}</Text>

          <Text style={styles.message}>{options.message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel, Platform.select({ web: { cursor: 'pointer' as any } }) as any]}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityLabel={options.cancelLabel ?? 'Cancel'}
              accessibilityHint="Closes the dialog without making changes"
              accessibilityRole="button"
            >
              <Text style={[styles.btnCancelText, loading && { opacity: 0.5 }]}>
                {options.cancelLabel ?? 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnConfirm,
                { backgroundColor: accentColor },
                Platform.select({ web: { cursor: (loading ? 'not-allowed' : 'pointer') as any } }) as any,
              ]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityLabel={confirmLabel}
              accessibilityHint={loading ? 'Processing your request' : 'Confirms this action'}
              accessibilityRole="button"
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.btnConfirmText}>{loadingLabel}</Text>
                </View>
              ) : (
                <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx.confirm;
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
    width: Math.min(DIALOG_MAX_WIDTH, SCREEN_WIDTH - 64),
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    paddingTop: 40,
    paddingHorizontal: 28,
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
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnCancel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnCancelText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  btnConfirm: {
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnConfirmText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
});
