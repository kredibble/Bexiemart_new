import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, radii } from '@/theme/colors';

const PIN_LENGTH = 6;

interface WalletPinInputProps {
  value: string;
  onChange: (pin: string) => void;
  error?: string;
  label?: string;
}

export function WalletPinInput({ value, onChange, error, label }: WalletPinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    },
    [value, onChange],
  );

  const handleChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, PIN_LENGTH);
      onChange(digits);
    },
    [onChange],
  );

  const digits = value.padEnd(PIN_LENGTH, ' ');

  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableInputArea onPress={() => inputRef.current?.focus()}>
        <View style={[styles.dotsRow, focused && styles.dotsRowFocused, error && styles.dotsRowError]}>
          {digits.split('').map((digit, i) => (
            <View key={i} style={styles.dot}>
              {digit !== ' ' ? (
                <View style={styles.dotFilled} />
              ) : (
                <View style={[styles.dotEmpty, focused && styles.dotEmptyFocused]} />
              )}
            </View>
          ))}
        </View>
      </TouchableInputArea>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        style={styles.hiddenInput}
        accessibilityLabel={label ?? 'PIN input'}
        accessibilityHint="Enter your 6-digit PIN"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );
}

function TouchableInputArea({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <View onTouchEnd={onPress}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  dotsRowFocused: {
    borderColor: colors.primary,
  },
  dotsRowError: {
    borderColor: colors.error,
  },
  dot: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  dotEmptyFocused: {
    borderColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.error,
  },
});
