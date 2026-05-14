import React from "react";
import { type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "./Input";

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  prefixIcon?: React.ComponentProps<typeof Ionicons>["name"];
  suffixIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onSuffixPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  accessibilityLabel?: string;
}

export function FormInput(props: FormInputProps) {
  return (
    <Input
      label={props.label}
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChangeText}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      error={props.error}
      helper={props.helper}
      secureTextEntry={props.secureTextEntry}
      keyboardType={props.keyboardType}
      autoCapitalize={props.autoCapitalize}
      autoCorrect={props.autoCorrect}
      containerStyle={props.containerStyle}
      prefixIcon={props.prefixIcon}
      suffixIcon={props.suffixIcon}
      onSuffixPress={props.onSuffixPress}
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
      maxLength={props.maxLength}
      editable={props.editable}
      accessibilityLabel={props.accessibilityLabel}
    />
  );
}
