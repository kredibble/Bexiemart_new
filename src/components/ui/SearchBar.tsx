import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/theme/colors';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onDebouncedChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
  showCancel?: boolean;
}

export function SearchBar({
  placeholder = 'Search products...',
  value: controlledValue,
  onChangeText,
  onDebouncedChange,
  onSubmit,
  debounceMs = 400,
  autoFocus = false,
  showCancel = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(controlledValue ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);
      onChangeText?.(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onDebouncedChange?.(text);
      }, debounceMs);
    },
    [onChangeText, onDebouncedChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText?.('');
    onDebouncedChange?.('');
    inputRef.current?.focus();
  }, [onChangeText, onDebouncedChange]);

  const handleCancel = useCallback(() => {
    setLocalValue('');
    onChangeText?.('');
    onDebouncedChange?.('');
    inputRef.current?.blur();
  }, [onChangeText, onDebouncedChange]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(localValue);
  }, [onSubmit, localValue]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? colors.primary : colors.textLight}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLighter}
          value={localValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search"
        />
        {localValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {showCancel && isFocused && (
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel search"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 50,
    paddingHorizontal: 16,
  },
  containerFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 0px 8px rgba(124, 58, 237, 0.15)' },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  clearButton: {
    marginLeft: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 15,
    color: colors.primary,
  },
});
