import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { fonts, fontSizes } from "@/theme/typography";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: { label: string; onPress: () => void };
}

interface ToastContextValue {
  showToast: (params: {
    message: string;
    type?: ToastType;
    duration?: number;
    action?: { label: string; onPress: () => void };
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<
  ToastType,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; textColor: string }
> = {
  success: { icon: "checkmark-circle", bg: colors.successDark, textColor: colors.white },
  error: { icon: "alert-circle", bg: colors.errorDark, textColor: colors.white },
  info: { icon: "information-circle", bg: colors.primary, textColor: colors.white },
  warning: { icon: "warning", bg: colors.warningDark, textColor: colors.white },
};

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      duration = 3000,
      action,
    }: {
      message: string;
      type?: ToastType;
      duration?: number;
      action?: { label: string; onPress: () => void };
    }) => {
      const id = `toast-${++toastIdCounter}`;
      setToasts((prev) => [...prev, { id, message, type, duration, action }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDone={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDone,
}: {
  toast: ToastMessage;
  onDone: () => void;
}) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [translateY, opacity, toast.duration, onDone]);

  const config = toastConfig[toast.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: config.bg, transform: [{ translateY }], opacity },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={config.icon}
        size={20}
        color={config.textColor}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
        {toast.message}
      </Text>
      {toast.action && (
        <TouchableOpacity
          onPress={() => {
            toast.action?.onPress();
            onDone();
          }}
          style={styles.actionButton}
          accessibilityRole="button"
        >
          <Text style={[styles.actionText, { color: config.textColor }]}>
            {toast.action.label}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.3)",
  },
  actionText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.base,
  },
});
