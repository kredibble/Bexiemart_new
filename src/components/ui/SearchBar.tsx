/**
 * SearchBar — Reusable search input with debounced text handling.
 *
 * Features: prefix search icon, clear button on input, cancel animation,
 * debounced onChange for API calls, and focus/blur styling.
 */
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
  /** Placeholder text */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Fires on every keystroke (instant, for local filtering) */
  onChangeText?: (text: string) => void;
  /** Fires after debounce delay (for API search) */
  onDebouncedChange?: (text: string) => void;
  /** Fires when the search is submitted via keyboard */
  onSubmit?: (text: string) => void;
  /** Debounce delay in ms (default: 400) */
  debounceMs?: number;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Show cancel button when focused */
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

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);
      onChangeText?.(text);

      // Debounced callback
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
        ]}
      >
        <Ionicons
          name="search"
          size={18}
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
            <Ionicons name="close-circle" size={18} color={colors.textLight} />
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
    backgroundColor: colors.surfaceDark,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    height: 46,
    paddingHorizontal: 14,
  },
  containerFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 0px 6px rgba(0, 76, 255, 0.12)' },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
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
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.primary,
  },
});
