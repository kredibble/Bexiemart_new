import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

export function Input({
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
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const inputRef = useRef<TextInput>(null);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const hasError = !!error;
  const hasValue = (value?.length ?? 0) > 0;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    if (onBlur) onBlur(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [hasError ? colors.error : colors.border, hasError ? colors.error : colors.primary],
  });

  const borderWidth = isFocused ? 1.5 : 1;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: fontSizes.base,
            color: hasError ? colors.error : colors.text,
            marginBottom: 6,
          }}
          onPress={() => inputRef.current?.focus()}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: radii.lg,
          borderColor,
          borderWidth,
          backgroundColor: hasError ? colors.errorSoft : isFocused ? colors.white : colors.surfaceDark,
          minHeight: 52,
          paddingHorizontal: 14,
        }}
      >
        {prefixIcon && (
          <Ionicons
            name={prefixIcon}
            size={20}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          ref={inputRef}
          style={[
            {
              flex: 1,
              fontFamily: fonts.body,
              fontSize: fontSizes.base2,
              color: colors.text,
              padding: 0,
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
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={hasValue ? colors.textSecondary : colors.textLighter}
            />
          </TouchableOpacity>
        )}

        {suffixIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onSuffixPress}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}
            accessibilityRole="button"
          >
            <Ionicons name={suffixIcon} size={20} color={hasValue ? colors.textSecondary : colors.textLighter} />
          </TouchableOpacity>
        )}

        {clearable && hasValue && !secureTextEntry && !suffixIcon && (
          <TouchableOpacity
            onPress={() => onChangeText?.("")}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
          >
            <Ionicons name="close-circle" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons name="alert-circle" size={14} color={colors.error} style={{ marginRight: 4 }} />
          <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.error }}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textLight, marginTop: 4 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
