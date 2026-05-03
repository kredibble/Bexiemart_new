import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  prefixIcon?: React.ComponentProps<typeof Ionicons>['name'];
  suffixIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onSuffixPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  accessibilityLabel?: string;
  containerClassName?: string;
}

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  helper,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  prefixIcon,
  suffixIcon,
  onSuffixPress,
  multiline,
  numberOfLines,
  maxLength,
  editable = true,
  accessibilityLabel,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  const isPassword = secureTextEntry;
  const hasError = !!error;
  const hasValue = value.length > 0;

  const borderColor = hasError ? '#B3261E' : isFocused ? '#004CFF' : '#E4E7EC';
  const backgroundColor = hasError ? '#FEF2F2' : isFocused ? '#FFFFFF' : '#FAFAFA';
  const borderWidth = isFocused && !hasError ? 1.5 : 1;

  return (
    <View className="mb-4">
      <Text
        style={{
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 14,
          color: hasError ? '#B3261E' : '#111322',
          marginBottom: 6,
        }}
        onPress={() => inputRef.current?.focus()}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{
          height: multiline ? undefined : 52,
          minHeight: 52,
          borderColor,
          borderWidth,
          backgroundColor,
          shadowColor: isFocused ? '#004CFF' : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isFocused ? 0.1 : 0,
          shadowRadius: 6,
          elevation: isFocused ? 1 : 0,
        }}
      >
        {prefixIcon && (
          <Ionicons name={prefixIcon} size={20} color="#9BA5B0" style={{ marginRight: 8 }} />
        )}
        <TextInput
          ref={inputRef}
          className="flex-1"
          style={{
            fontFamily: 'Nunito_400Regular',
            fontSize: 15,
            color: '#111322',
            padding: 0,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          placeholder={placeholder}
          placeholderTextColor="#C8CFD6"
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          secureTextEntry={isPassword ? !showPassword : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          accessibilityLabel={accessibilityLabel || label}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={hasValue ? '#5F6C7B' : '#C8CFD6'}
            />
          </TouchableOpacity>
        )}
        {suffixIcon && !isPassword && (
          <TouchableOpacity
            onPress={onSuffixPress}
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Ionicons
              name={suffixIcon}
              size={20}
              color={hasValue ? '#5F6C7B' : '#C8CFD6'}
            />
          </TouchableOpacity>
        )}
        {hasValue && !isPassword && !suffixIcon && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Clear"
          >
            <Ionicons name="close-circle" size={20} color="#C8CFD6" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View className="flex-row items-center mt-1.5" accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color="#B3261E" style={{ marginRight: 4 }} />
          <Text
            style={{ fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#B3261E' }}
          >
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text
          style={{ fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9BA5B0', marginTop: 4 }}
          accessibilityLiveRegion="polite"
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
