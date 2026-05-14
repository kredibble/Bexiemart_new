import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { colors, radii } from "@/theme/colors";
import { fonts, fontSizes } from "@/theme/typography";

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  prefixIcon?: React.ComponentProps<typeof Ionicons>["name"];
  suffixIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onSuffixPress?: () => void;
  secureTextEntry?: boolean;
  clearable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = React.forwardRef<TextInput, InputProps>(function Input({
  label,
  error,
  helper,
  prefixIcon,
  suffixIcon,
  onSuffixPress,
  secureTextEntry = false,
  clearable = true,
  containerStyle,
  style,
  value,
  onChangeText,
  onBlur,
  onFocus,
  editable = true,
  accessibilityLabel,
  ...props
}, forwardedRef) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const internalRef = useRef<TextInput>(null);

  const hasError = !!error;
  const hasValue = (value?.length ?? 0) > 0;

  const focusAnim = useSharedValue(0);

  useEffect(() => {
    focusAnim.value = withSpring(isFocused ? 1 : 0, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
  }, [isFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = hasError
      ? colors.error
      : interpolateColor(focusAnim.value, [0, 1], [colors.border, colors.primary]);
    
    const backgroundColor = hasError
      ? colors.errorSoft
      : interpolateColor(focusAnim.value, [0, 1], [colors.surface, colors.white]);

    const shadowOpacity = hasError 
      ? 0.1 
      : focusAnim.value * 0.15;
      
    const shadowColor = hasError ? colors.error : colors.primary;

    return {
      borderColor,
      backgroundColor,
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity,
      shadowRadius: 12,
      elevation: focusAnim.value * 4,
      transform: [{ scale: 1 + focusAnim.value * 0.01 }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      color: hasError
        ? colors.error
        : interpolateColor(focusAnim.value, [0, 1], [colors.text, colors.primary]),
    };
  });

  const inputCallbackRef = useCallback((node: TextInput | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<TextInput | null>).current = node;
    }
  }, [forwardedRef]);

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Animated.Text
          style={[
            {
              fontFamily: fonts.bodySemi,
              fontSize: fontSizes.base,
              marginBottom: 8,
            },
            animatedLabelStyle,
          ]}
          onPress={() => internalRef.current?.focus()}
        >
          {label}
        </Animated.Text>
      )}

      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: radii.lg,
            borderWidth: 1,
            minHeight: 54,
            paddingHorizontal: 16,
          },
          animatedContainerStyle,
        ]}
      >
        {prefixIcon && (
          <Ionicons
            name={prefixIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textLight}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          ref={inputCallbackRef}
          style={[
            {
              flex: 1,
              fontFamily: fonts.body,
              fontSize: fontSizes.lg,
              color: colors.text,
              padding: 0,
              ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
            },
            style,
          ]}
          placeholderTextColor={colors.textLighter}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={editable}
          accessibilityLabel={accessibilityLabel || label || props.placeholder}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "flex-end" }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={hasValue ? colors.textSecondary : colors.textLighter}
            />
          </TouchableOpacity>
        )}

        {suffixIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onSuffixPress}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "flex-end" }}
            accessibilityRole="button"
          >
            <Ionicons name={suffixIcon} size={22} color={hasValue ? colors.textSecondary : colors.textLighter} />
          </TouchableOpacity>
        )}

        {clearable && hasValue && !secureTextEntry && !suffixIcon && (
          <TouchableOpacity
            onPress={() => onChangeText?.("")}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "flex-end" }}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
          >
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? (
        <Animated.View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <Ionicons name="alert-circle" size={15} color={colors.error} style={{ marginRight: 5 }} />
          <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.error, flex: 1 }}>
            {error}
          </Text>
        </Animated.View>
      ) : helper ? (
        <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textLight, marginTop: 6 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
